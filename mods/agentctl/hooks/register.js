// agentctl — Agent Control Plane for one Claude Code session.
// A control and a display, not an isolation boundary: production read-only belongs to credentials
// and the target's own permissions, and named dangerous invocations to the user's permission rules.
// This module wires hooks to the pure modules in ../lib; every decision lives there.

import { MAX_HASHED_PATHS, TIMEOUT_MS, commands as FP, digest, fold, parseStatus } from '../lib/fingerprint.js'
import { handoff } from '../lib/handoff.js'
import { decideNotices, parseTaskNotification } from '../lib/notices.js'
import { HARD_FORBIDDEN, classify, taskRecord, validateTask } from '../lib/policy.js'
import { acceptedRecord, digestMatches, previewLines, proposalDigest, proposalPath, readProposal } from '../lib/proposal.js'
import { checkArgv, copy, draftingRequest, helpText, languageOf, nextForTask, parseCommand, suggestionWhileWaiting } from '../lib/firstrun.js'
import { initialState, reduce } from '../lib/reducer.js'
import { CAPS, sanitize } from '../lib/sanitize.js'
import { applyRetention, createWriter, keys, latestCheckpoint, taskScope } from '../lib/store.js'
import { combine, surfaceVerified } from '../lib/verdict.js'
import { bandText, checkKey, checkProgress, contextReading, eventsText, gateReading, policyText, statusText, usageReading } from '../lib/view.js'

const DECISIONS_CAP = 50
const BUILT_IN_RULES = new Set(HARD_FORBIDDEN.map((h) => h.rule))
// Evidence freshness must show a later edit within 30 s (requirements Signal 3).
const TICK_MS = 30 * 1000
const GATE_STALE_MS = 30 * 1000

function noProposalText(lang) {
  if (lang === 'ko') return '대기 중인 초안이 없습니다. 작성하려면: /agentctl <지금 하는 일>'
  if (lang === 'zh') return '目前沒有等待中的草稿。要起草：/agentctl <你要做的事>'
  return '대기 중인 초안이 없습니다. 작성하려면: /agentctl <지금 하는 일>'
}

// Per-session runtime context, rebuilt from the store after a hot reload. Built once per session
// through one shared promise: session.start and the first ui.render arrive concurrently in an
// interactive terminal, and two separate builds left the band reading a context nobody updated
// (found live on 2.1.289). A hot reload drops the timers and in-memory readings without a new
// session.start, so the readings and the tick start with the build.
let ctx = null
let building = null

function context($) {
  if (ctx) return Promise.resolve(ctx)
  if (!building) building = buildContext($).finally(() => { building = null })
  return building
}

async function buildContext($) {
  const sessionId = await $.session.id()
  const cwd = await $.session.cwd()
  const writer = createWriter(storeOf($))
  const saved = await $.store.get(keys.session(sessionId))
  const now = await $.clock.now()
  const c = {
    sessionId,
    cwd,
    writer,
    surface: saved?.surface ?? null,
    interactive: saved?.interactive ?? false,
    // The permission mode as of the last classic hook input that carried it (each prompt and each
    // tool end); unknown until then, and unknown never enables needs-user.
    permissionMode: null,
    startedAt: saved?.startedAt ?? now,
    state: saved?.state ?? initialState(now),
    decisions: saved?.decisions ?? [],
    evidence: saved?.evidence ?? {},
    notices: saved?.notices ?? {},
    gate: null,
    usage: null,
    usageAt: 0,
    fingerprint: null,
    checkpoint: null,
    // The validated proposal waiting for `/agentctl accept`, frozen until accepted or discarded, and
    // the digest of the file text it came from (an unchanged file is not read twice).
    pending: saved?.pending ?? null,
    // The copy language for this session: set by the person's own goal text (§ 3.7, a heuristic).
    lang: saved?.lang ?? 'en',
    proposalSeen: saved?.proposalSeen ?? null,
  }
  await readGate($, c)
  await readUsage($, c)
  $.clock.every(TICK_MS, async () => {
    // A tick that outlives its session (a /clear started another) does nothing.
    if (ctx !== c) return
    const t = await boundTask($, c)
    await refreshTree($, c)
    await readGate($, c)
    await observe($, c, { type: 'tick', at: await $.clock.now() }, t?.id)
  })
  ctx = c
  return c
}

function storeOf($) {
  return { get: (k) => $.store.get(k), set: (k, v) => $.store.set(k, v), delete: (k) => $.store.delete(k), keys: () => $.store.keys() }
}

export function worktreeKey(cwd) {
  return encodeURIComponent(String(cwd ?? ''))
}

const scopeOf = (c, taskId) => taskScope(worktreeKey(c.cwd), taskId)

async function boundTask($, c) {
  const taskId = await $.store.get(keys.binding(worktreeKey(c.cwd)))
  if (!taskId) return null
  const t = await $.store.get(keys.task(scopeOf(c, taskId)))
  if (t) return t
  // A record written before task records were namespaced: used only when it names this worktree.
  const legacy = await $.store.get(keys.task(taskId))
  if (legacy && legacy.worktree === c.cwd) return { ...legacy, legacyRecord: true }
  // A binding whose record is gone is not "no task": refuse everything but reads in this worktree.
  return { id: String(taskId), goal: '', worktree: c.cwd, allow: [], editRoots: [], forbid: [], executors: [], needsUser: [], tools: [], acceptance: [], recordMissing: true }
}

function persist(c, taskId) {
  c.writer.set(keys.session(c.sessionId), {
    taskId: taskId ? scopeOf(c, taskId) : null,
    surface: c.surface,
    interactive: c.interactive,
    startedAt: c.startedAt,
    state: c.state,
    decisions: c.decisions,
    evidence: c.evidence,
    notices: c.notices,
    pending: c.pending,
    proposalSeen: c.proposalSeen,
    lang: c.lang,
    health: c.writer.health.value,
  })
}

function recordDecision(c, entry) {
  c.decisions = [...c.decisions, entry].slice(-DECISIONS_CAP)
}

function callOf(e) {
  // tool.call carries the tool's own fields beside `tool`; tool.check carries them under `input`.
  if (e && e.input && typeof e.input === 'object') return { tool: e.tool, ...e.input }
  return e
}

function outcomeOf(r) {
  if (!r) return 'unknown'
  if (r.deny) return 'refused'
  if (r.isError) return 'error'
  if (r.result && typeof r.result === 'object' && r.result.backgroundTaskId) return 'backgrounded'
  return 'ok'
}

// ── Readings ────────────────────────────────────────────────────────────────────────────────────
async function runGit($, cwd, argv, stdin) {
  try {
    return await $.process.run(argv, { cwd, timeoutMs: TIMEOUT_MS, ...(stdin === undefined ? {} : { stdin }) })
  } catch (err) {
    return { error: sanitize(err && err.message ? err.message : err, 120) }
  }
}

async function readFingerprint($, cwd) {
  const results = {}
  results.head = await runGit($, cwd, FP.head)
  results.index = await runGit($, cwd, FP.index)
  results.flags = await runGit($, cwd, FP.flags)
  results.status = await runGit($, cwd, FP.status)
  const changed = results.status && !results.status.error && results.status.exitCode === 0 ? parseStatus(results.status.stdout).changed : []
  if (changed.length) results.hash = await runGit($, cwd, FP.hash, changed.slice(0, MAX_HASHED_PATHS).join('\n') + '\n')
  // Nothing answered: there is no reading at all, so the evidence is unavailable, not partial.
  if (Object.values(results).every((r) => r && r.error)) return null
  // When the reading was taken: every view of it says how old it is.
  return { ...fold(results, changed), at: await $.clock.now() }
}

// The current tree, re-read only while there is evidence whose freshness depends on it.
async function refreshTree($, c) {
  if (Object.keys(c.evidence).length === 0) return
  c.fingerprint = await readFingerprint($, c.cwd)
  $.ui.invalidate('ui.render')
}

// A reading that fails is an `unavailable` field, never a failed hook.
async function readGate($, c) {
  const at = await $.clock.now()
  let script = null
  try {
    if (await $.fs.exists('.claude/scripts/review-state.js')) script = '.claude/scripts/review-state.js'
    else if (await $.fs.exists('scripts/review-state.js')) script = 'scripts/review-state.js'
  } catch (err) {
    c.gate = { failed: sanitize('review-state.js 검색 실패: ' + (err && err.message ? err.message : err), 80), at }
    return
  }
  if (!script) { c.gate = { failed: '여기에 review-state.js가 없습니다', at }; return }
  try {
    // `check` only — this mod never writes a verdict (FR-19).
    const r = await $.process.run(['node', script, 'check', '--format=json'], { cwd: c.cwd, timeoutMs: TIMEOUT_MS })
    c.gate = { ...gateReading(r, at), staleAfterMs: GATE_STALE_MS }
  } catch (err) {
    c.gate = { failed: sanitize('검사 실패: ' + (err && err.message ? err.message : err), 80), at }
  }
}

async function readUsage($, c) {
  try {
    c.usage = await $.session.usage()
    c.usageAt = await $.clock.now()
  } catch {
    c.usage = null
  }
}

async function model($, c) {
  const task = await boundTask($, c)
  const now = await $.clock.now()
  return {
    now,
    task,
    state: c.state,
    health: c.writer.health.value,
    gate: c.gate,
    context: c.usage ? contextReading(c.usage, c.usageAt) : null,
    fiveHour: c.usage ? usageReading(c.usage, 'five_hour', c.usageAt) : null,
    // Evidence belongs to the task (and policy version) it was observed under; another task's checks
    // are never shown as this one's.
    evidence: evidenceFor(c.evidence, task),
    fingerprint: c.fingerprint,
    pending: c.pending,
    decisions: c.decisions,
    sessionId: c.sessionId,
    checkpoint: c.checkpoint,
  }
}

// Partial if either reading is partial: a value equality says nothing about what was not read.
function worstCoverage(...readings) {
  const cs = readings.filter(Boolean).map((r) => r.coverage)
  return cs.includes('partial') ? 'partial' : cs[0]
}

function evidenceFor(evidence, task) {
  const out = {}
  for (const [k, ev] of Object.entries(evidence ?? {})) {
    if ((ev.taskId ?? null) === (task?.id ?? null) && (ev.policyVersion ?? null) === (task?.policyVersion ?? null)) out[k] = ev
  }
  return out
}

async function observe($, c, observation, taskId) {
  c.state = reduce(c.state, observation)
  const now = await $.clock.now()
  const { toSend, sent } = decideNotices(c.state.interventions, c.notices, now)
  c.notices = sent
  for (const n of toSend) $.ui.toast(`agentctl: ${n.reason.replace('-', ' ')} — 자세한 내용은 /agentctl`)
  persist(c, taskId)
  $.ui.invalidate('ui.render')
}

// The hand-over starts no process, calls no model and no network (NFR-5): it uses the last tree
// reading taken by a check, which the hand-over labels with its own HEAD and coverage.
// `saved` is the store's own answer: the write is awaited, so a stop never cancels before the
// checkpoint exists and never claims a write that failed.
async function saveHandoff($, c) {
  const m = await model($, c)
  const text = handoff(m)
  if (!m.task) return { text, saved: false, reason: 'no-task' }
  const ok = await c.writer.set(keys.checkpoint(scopeOf(c, m.task.id), c.sessionId), { savedAt: m.now, taskId: m.task.id, markdown: text })
  return { text, saved: ok, reason: ok ? null : 'store-error' }
}

async function closeBackground($, c, id, status, isError) {
  const task = await boundTask($, c)
  await observe($, c, { type: 'background.terminal', id, status, at: await $.clock.now() }, task?.id)
  for (const ev of Object.values(c.evidence)) {
    if (ev.backgroundId && ev.backgroundId === id && ev.outcome === 'backgrounded') {
      ev.outcome = status === 'completed' ? (isError ? 'error' : 'ok') : status === 'failed' ? 'error' : 'cancelled'
      ev.after = await readFingerprint($, c.cwd)
      ev.coverage = worstCoverage(ev.before, ev.after)
      ev.note = '완료 시점이 아니라 터미널 결과를 확인한 시점에 사후 판독을 수행함'
    }
  }
  persist(c, task?.id)
}

// ── Commands ────────────────────────────────────────────────────────────────────────────────────
async function taskCommand($, c, e, rest) {
  const [sub, ...more] = rest
  if (!sub || sub === 'show') {
    const t = await boundTask($, c)
    return t ? policyText(t) : '이 워크트리에 바인드된 작업이 없습니다. /agentctl task set <json>으로 설정하세요.'
  }
  if (sub !== 'set' && sub !== 'clear') return '사용법: /agentctl task show | set <json> | clear'
  // Scope changes come only from the person at the prompt (FR-25).
  if (e.origin?.kind !== 'composer') return 'agentctl 거부: 작업 설정과 해제는 자신의 프롬프트에서만 할 수 있습니다.'
  const now = await $.clock.now()
  if (sub === 'clear') {
    // Report what persisted (INV-006): a failed delete leaves the old policy in force.
    if (!(await c.writer.delete(keys.binding(worktreeKey(c.cwd))))) {
      return 'agentctl: 작업을 해제할 수 없습니다 (저장소 오류). 이전 작업이 계속 적용됩니다.'
    }
    return '이 워크트리의 작업을 해제했습니다. 이제 기본 제공 거부 유형만 적용됩니다.'
  }
  let input
  try { input = JSON.parse(more.join(' ')) } catch { return 'agentctl: 작업은 JSON이어야 합니다.' }
  if (!input || typeof input !== 'object' || Array.isArray(input)) return 'agentctl: 작업은 JSON 객체여야 합니다.'
  // The worktree is this session's; a task naming another one is refused, never re-pointed.
  if (input.worktree !== undefined && input.worktree !== c.cwd) return 'agentctl: 작업 거부 —\n- 다른 워크트리가 지정되었습니다'
  const raw = { ...input, worktree: c.cwd }
  const v = validateTask(raw)
  if (!v.ok) return `agentctl: 작업 거부 —\n- ${v.errors.map((x) => sanitize(x, 200)).join('\n- ')}`
  // The policy version only rises: re-setting an id that already has a record continues from it, so
  // evidence and proposals tied to the earlier policy never read as this one's.
  const id = raw.id ?? `T${now}`
  const bound = await boundTask($, c)
  const prior = bound && bound.id === id && !bound.recordMissing ? bound : await $.store.get(keys.task(scopeOf(c, id)))
  // Only allowlisted fields are stored; descriptive text is redacted (NFR-9).
  return bindTask($, c, taskRecord({ ...raw, policyVersion: prior ? (prior.policyVersion ?? 1) : 0 }, { id, now, cwd: c.cwd }))
}

// The record first, the binding only once the record is saved. Re-setting the bound id is complete
// once its record is saved — that record IS the policy in force — so no binding write can fail after it.
async function bindTask($, c, task) {
  const bindingKey = keys.binding(worktreeKey(c.cwd))
  const current = await $.store.get(bindingKey)
  if (!(await c.writer.set(keys.task(scopeOf(c, task.id)), task))) {
    return 'agentctl: 작업을 저장할 수 없습니다 (저장소 오류). 기존 작업이 있다면 계속 적용됩니다.'
  }
  if (current !== task.id && !(await c.writer.set(bindingKey, task.id))) {
    return 'agentctl: 작업은 저장됐지만 바인드할 수 없습니다 (저장소 오류). 기존 작업이 있다면 계속 적용됩니다.'
  }
  persist(c, task.id)
  $.ui.invalidate('ui.render')
  return `작업 ${task.id}을(를) 이 워크트리에 바인드했습니다.\n${policyText(task)}`
}

// ── Proposals ───────────────────────────────────────────────────────────────────────────────────
// Read at session start and at each main turn's end. A failure to read is no proposal, never an
// error: the file is optional and the mod works without it.
async function checkProposal($, c) {
  let text
  try {
    const home = await $.env.get('HOME')
    if (!home) return
    const path = proposalPath(home, worktreeKey(c.cwd))
    if (!(await $.fs.exists(path))) return
    text = await $.fs.read(path)
  } catch {
    return
  }
  if (typeof text !== 'string') return
  const seen = digest(text)
  if (seen === c.proposalSeen) return
  c.proposalSeen = seen
  // Found live: the file stays after accept, and a new session read it again as a stale draft.
  const handled = await $.store.get(keys.proposal(worktreeKey(c.cwd)))
  if (handled && handled.text === seen) return
  const bound = await boundTask($, c)
  // A malformed submission is a rejection, never a failed hook.
  let r
  try { r = readProposal(text, { cwd: c.cwd, boundId: bound?.id ?? null }) } catch { r = { ok: false, errors: ['초안을 검증할 수 없습니다'] } }
  if (!r.ok) {
    // No `agentctl:` prefix: the host already names the mod on every transcript line (found live).
    $.ui.log(`초안을 표시하지 않습니다 — ${r.errors.join('; ')}`)
    persist(c, bound?.id)
    return
  }
  c.pending = { effective: r.effective, digest: await proposalDigest(r.effective), baseRev: revisionOf(bound), textDigest: seen, at: await $.clock.now() }
  for (const line of preview(c)) $.ui.log(line)
  persist(c, bound?.id)
  $.ui.invalidate('ui.render')
  await suggestAccept($, c)
}

// The preview always ends with a copyable accept line in the session's language.
function preview(c) {
  const lines = previewLines(c.pending)
  lines[lines.length - 1] = `  ${copy(c.lang).acceptLine(c.pending.digest.slice(0, 8))}`
  return lines
}

// Offer the accept line as the box's dim suggestion (Tab to take). It shows only when the box is
// empty and no turn runs; the copyable line in the preview is what always works.
async function suggestAccept($, c) {
  if (!c.pending) return
  try { await $.prompt.suggest({ text: `/agentctl accept ${c.pending.digest.slice(0, 8)}` }) } catch { /* optional */ }
}

// `/agentctl <what you are doing>`: a request for Claude to draft the scope, put in the person's own
// prompt box when it is empty (FR-19 allows fill, never submit). Nothing is sent or bound here.
async function goalCommand($, c, e, goal) {
  // Only the person's own goal fills their box or sets the session's language; any other origin
  // gets the same request to copy and changes nothing (§ 3.7 item 2).
  const composer = e.origin?.kind === 'composer'
  const lang = composer ? languageOf(goal) : c.lang
  if (composer) c.lang = lang
  const t = copy(lang)
  const bound = await boundTask($, c)
  const request = draftingRequest({ goal, worktree: c.cwd, base: bound && !bound.recordMissing ? bound.id : null, root: $.plugin.root, lang })
  let filled = false
  let mixed = false
  if (composer) {
    try {
      const box = await $.prompt.read()
      // `append`, never the default `replace`: the read and the fill are two steps, and anything the
      // person types between them must survive (found in review). Read back to tell them apart.
      if (box && box.text === '' && (await $.prompt.fill({ text: request, mode: 'append' }))?.isFilled === true) {
        const after = await $.prompt.read()
        filled = true
        mixed = Boolean(after && after.text !== request)
      }
    } catch { filled = false }
  }
  // A bound task keeps applying until a new scope is accepted; say so instead of "nothing is bound" (found live).
  const keeps = Boolean(bound && !bound.recordMissing)
  if (filled && mixed) return t.mixed(keeps)
  return filled ? t.filled(keeps) : `${t.copy(keeps)}\n\n${request}`
}

// The bound task's exact revision: a same-id `task set` after the preview makes the proposal stale.
function revisionOf(task) {
  return task ? `${task.id}@${task.policyVersion ?? 1}@${task.confirmedAt ?? 0}` : null
}

// The waiting proposal is done with: forget it here and remember its file text for later sessions.
async function settleProposal($, c, p) {
  c.pending = null
  if (p?.textDigest) await c.writer.set(keys.proposal(worktreeKey(c.cwd)), { text: p.textDigest, at: await $.clock.now() })
}

async function acceptCommand($, c, e, given) {
  // Scope comes only from the person at the prompt (FR-25).
  if (e.origin?.kind !== 'composer') return 'agentctl 거부: 초안은 자신의 프롬프트에서만 승인할 수 있습니다.'
  const p = c.pending
  if (!p) return noProposalText(c.lang)
  if (!digestMatches(given, p.digest)) return `agentctl 거부: ${sanitize(given, 30)}이(가) 대기 중인 초안 ${p.digest.slice(0, 8)}과(와) 일치하지 않습니다. /agentctl proposal을 확인하세요.`
  const bound = await boundTask($, c)
  if ((bound?.id ?? null) !== p.effective.base || revisionOf(bound) !== p.baseRev) {
    await settleProposal($, c, p)
    persist(c, bound?.id)
    return 'agentctl 거부: 초안 작성 후 바인드된 작업이 변경되어 폐기했습니다. 새 초안을 요청하세요.'
  }
  const now = await $.clock.now()
  const record = acceptedRecord(p.effective, { now, baseTask: bound })
  const text = await bindTask($, c, record)
  if (!text.startsWith('작업 ')) return text
  await settleProposal($, c, p)
  persist(c, `T${now}`)
  // Say what accepting did and did not do; the full policy is one command away.
  // Claude reads this reply: name the checks it must run as written to leave evidence (found in an
  // uncoached run, where `npm test | grep` passed but never counted). Never shortened: a cut command
  // would not match its check.
  const checks = checkArgv(record)
  return [copy(c.lang).accepted, `작업 ${record.id}: ${sanitize(record.goal, 120)}`,
    ...(checks.length ? [copy(c.lang).runChecks(checks.map((a) => sanitize(a, Infinity)))] : []), copy(c.lang).wholeScope].join('\n')
}

async function stopCommand($, c) {
  const h = await saveHandoff($, c)
  const turnId = c.state.runtime.turnId
  // Say what happened: a checkpoint exists only when a task is bound.
  const lines = [h.saved ? '중지하기 전에 인계 내용을 저장했습니다.'
    : h.reason === 'no-task' ? '바인드된 작업이 없어 인계 내용을 저장하지 않았습니다 (/agentctl handoff 참조).'
      : '인계 내용을 저장할 수 없습니다 (저장소 오류). /agentctl handoff로 출력할 수 있습니다.']
  if (!turnId) lines.push('실행 중인 턴이 관측되지 않아 취소한 것은 없습니다.')
  else {
    try {
      await $.turn.abort({ turnId })
      lines.push(`턴 ${turnId}의 취소를 요청했습니다. 종료가 확인될 때까지는 완료로 간주하지 않습니다.`)
    } catch (err) {
      lines.push(`취소 요청 실패; 턴 결과가 확인되지 않았습니다 (${sanitize(err && err.message ? err.message : err, 120)}).`)
    }
  }
  const open = Object.entries(c.state.ops).filter(([, o]) => o.endedAt === undefined && o.outcome !== 'refused')
  lines.push(open.length ? '추적 중인 작업 (마지막 관측 시점):' : '실행 중인 추적 작업이 없습니다.')
  for (const [id, o] of open) lines.push(`- ${sanitize(o.requested, 120)} (${o.tool}) — ${o.outcome}, ${id}`)
  lines.push('Untracked processes cannot be confirmed; "모두 중지됨"을 뜻하지 않습니다.')
  return lines.join('\n')
}

export function register(on) {
  on('session.start', async ($, e, next) => {
    // A new session (start, /clear, resume) gets a fresh context under its own id; the readings and
    // the tick restart with it.
    // Reuse a context already built (or being built, e.g. by the first band render) for this same
    // session; replace it only when the session changed (/clear, resume) — never discard state that
    // concurrent hooks are writing into.
    const sid = await $.session.id()
    if (building) await building.catch(() => {})
    if (ctx && ctx.sessionId !== sid) ctx = null
    const c = await context($)
    c.surface = e.surface ?? null
    c.interactive = Boolean(e.isInteractive)
    const task = await boundTask($, c)
    persist(c, task?.id)
    // Retention after this session's own record is written, so it counts among the newest.
    await c.writer.idle()
    await applyRetention(storeOf($), c.writer, await $.clock.now())
    // Resume: show the last hand-over first; nothing is replayed, and the mod holds no approvals.
    // A checkpoint written before records were namespaced belongs to the legacy record it was saved
    // for, so it is read only when that verified legacy record is the task — never for a new scoped
    // task that merely reuses the id.
    if (task) c.checkpoint = await latestCheckpoint(storeOf($), scopeOf(c, task.id))
      ?? (task.legacyRecord ? await latestCheckpoint(storeOf($), task.id) : null)
    if (c.checkpoint) {
      // Shown before any work: a transcript notice (not sent to the model; `-p` receives it as
      // ui_log) and the band. Nothing is replayed, and the mod holds no approvals to carry over.
      $.ui.log(`작업 ${task.id}의 최근 인계 내용, 저장 시각 ${new Date(c.checkpoint.savedAt).toISOString()} — /agentctl last로 다시 표시`)
      // The whole checkpoint (already bounded by the hand-over cap), never a silent preview.
      for (const line of String(c.checkpoint.markdown).split('\n')) $.ui.log(line)
    }
    await checkProposal($, c)
    // `immediate`: /agentctl stop must run while the turn it cancels is still in flight.
    await $.command.register({ name: 'agentctl', description: '에이전트 제어 — 작업을 설명하면 Claude가 범위 초안을 작성하고 당신이 승인합니다', argumentHint: '<지금 하는 일> | accept <digest> | help', immediate: true })
    $.ui.invalidate('ui.render')
    return next(e)
  })

  // Only the main loop's turns move the held turn: subagent turns carry an agentId (host types,
  // turn.complete) and their completion must not clear the main turn a stop would cancel.
  on('turn.start', async ($, e, next) => {
    if (e.agentId !== undefined) return next(e)
    const c = await context($)
    await observe($, c, { type: 'turn.start', turnId: e.turnId, at: await $.clock.now() }, (await boundTask($, c))?.id)
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    const c = await context($)
    if (e.agentId !== undefined || (c.state.runtime.turnId && e.turnId !== c.state.runtime.turnId)) return next(e)
    await observe($, c, { type: 'turn.complete', turnId: e.turnId, at: await $.clock.now() }, (await boundTask($, c))?.id)
    await readGate($, c)
    await refreshTree($, c)
    const had = c.pending?.digest
    await checkProposal($, c)
    // A proposal still waiting from an earlier turn is offered again at each turn's end (found
    // live: after an unrelated reply the box was empty, and the accept line was only in scrollback).
    if (c.pending && c.pending.digest === had) await suggestAccept($, c)
    return next(e)
  })

  on('session.measure', async ($, e, next) => {
    const c = await context($)
    await readUsage($, c)
    const w = (c.usage?.rateLimits ?? []).find((r) => r.kind === 'five_hour')
    if (w) await observe($, c, { type: 'rate-limit', kind: w.kind, percentUsed: w.percentUsed, resetsAt: w.resetsAt, at: c.usageAt }, (await boundTask($, c))?.id)
    return next(e)
  })

  // The permission mode rides on classic hook inputs; read it at every prompt and tool end.
  on('classic.UserPromptSubmit', async ($, e, next) => {
    const c = await context($)
    c.permissionMode = e.permission_mode ?? null
    return next(e)
  })

  on('classic.PostToolUse', async ($, e, next) => {
    const c = await context($)
    if (e.permission_mode !== undefined) c.permissionMode = e.permission_mode
    return next(e)
  })

  on('classic.PermissionRequest', async ($, e, next) => {
    const c = await context($)
    if (e.permission_mode !== undefined) c.permissionMode = e.permission_mode
    await observe($, c, { type: 'permission.request', tool: e.tool_name, at: await $.clock.now() }, (await boundTask($, c))?.id)
    return next(e)
  })

  on('classic.Stop', async ($, e, next) => {
    const c = await context($)
    const ids = (e.background_tasks ?? []).map((b) => b.id)
    await observe($, c, { type: 'background.inflight', ids, at: await $.clock.now() }, (await boundTask($, c))?.id)
    return next(e)
  })

  // Policy: classification completes before delegation; a refusal never reaches core.
  on('tool.call', async ($, e, next) => {
    const c = await context($)
    const task = await boundTask($, c)
    const v = classify(task, callOf(e))
    if (v.outcome === 'deny') {
      const at = await $.clock.now()
      const requested = sanitize(e.command ?? e.file_path ?? e.tool, CAPS.requested)
      const rule = sanitize(v.rule, CAPS.reason)
      recordDecision(c, { at, tool: e.tool, requested, outcome: v.outcome, rule })
      await observe($, c, { type: 'refused', id: e.tool_use_id ?? `refused-${at}`, tool: e.tool, requested, rule, at }, task?.id)
      // A built-in class is not the task's to lift; saying "the task's scope" sent Claude off to
      // propose widening a task that cannot widen it (found live).
      const builtIn = BUILT_IN_RULES.has(v.rule)
      return { deny: builtIn
        ? `agentctl 거부 (${rule}): 기본 제공 거부 유형은 어떤 작업으로도 해제할 수 없습니다. 직접 실행하거나 프로젝트의 push 또는 배포 워크플로를 사용하세요.`
        : `agentctl 거부 (${rule}). 셸 리다이렉트나 스크립트 등 다른 방법으로 같은 결과를 얻지 마세요 (a shell redirect, a script); if it is needed, 필요하다면 더 넓은 범위를 승인해 달라고 요청하세요. 작업 범위는 /agentctl policy에서 확인할 수 있습니다.` }
    }
    // Delegated: the host's permission flow (or auto mode) decides; the mod only records that it did
    // not classify the call, so the events list can show it.
    if (v.delegated) {
      recordDecision(c, { at: await $.clock.now(), tool: e.tool, requested: sanitize(e.command ?? e.file_path ?? e.tool, CAPS.requested), outcome: 'delegated', rule: sanitize(v.rule, CAPS.reason) })
    }
    // Every allowed call is observed; Bash is observed (with its evidence) by the hook beneath.
    if (e.tool === 'Bash') return next(e)
    const id = e.tool_use_id ?? `${e.tool}-${await $.clock.now()}`
    const requested = sanitize(e.file_path ?? e.notebook_path ?? e.tool, CAPS.requested)
    await observe($, c, { type: 'tool.start', id, tool: e.tool, requested, kind: ['Write', 'Edit', 'NotebookEdit', 'MultiEdit'].includes(e.tool) ? 'edit' : undefined, at: await $.clock.now() }, task?.id)
    const r = await next(e)
    const endAt = await $.clock.now()
    await observe($, c, { type: 'tool.end', id, outcome: outcomeOf(r), at: endAt }, task?.id)
    await observe($, c, { type: 'permission.settled', at: endAt }, task?.id)
    return r
  }).catch(($, e, next) => (next.called ? next(e) : { deny: 'agentctl 거부: 호출 전에 정책 검사가 실패했습니다' }))

  // Evidence, beneath the policy hook: brackets Bash calls; its failures are evidence failures,
  // never refusals (feasibility § 6).
  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    const c = await context($)
    const task = await boundTask($, c)
    const v = classify(task, callOf(e))
    const id = e.tool_use_id ?? `bash-${await $.clock.now()}`
    const requested = sanitize(e.command, CAPS.requested)
    const isCheck = Boolean(v.executor && v.executor.check)
    const startAt = await $.clock.now()
    let before = null
    if (isCheck) before = await readFingerprint($, c.cwd)
    await observe($, c, { type: 'tool.start', id, tool: 'Bash', requested, kind: isCheck ? 'check' : undefined, at: startAt }, task?.id)
    const r = await next(e)
    const outcome = outcomeOf(r)
    const endAt = await $.clock.now()
    const backgroundId = outcome === 'backgrounded' ? r.result.backgroundTaskId : undefined
    await observe($, c, { type: 'tool.end', id, outcome, backgroundId, at: endAt }, task?.id)
    await observe($, c, { type: 'permission.settled', at: endAt }, task?.id)
    if (isCheck) {
      const after = outcome === 'backgrounded' ? null : await readFingerprint($, c.cwd)
      c.fingerprint = after ?? c.fingerprint
      // An opaque key: executor arguments never become a stored identifier in plaintext.
      const key = checkKey(v.executor.argv)
      c.evidence = { ...c.evidence, [key]: { checkKey: key, taskId: task?.id ?? null, policyVersion: task?.policyVersion ?? null, requested, outcome, before, after, coverage: worstCoverage(before, after), at: endAt, backgroundId } }
      persist(c, task?.id)
    }
    return r
  }).catch(($, e, next) => next(e))

  // A background job's notification is the host's own terminal report: observe it, pass it on.
  on('prompt.submit', async ($, e, next) => {
    if (e.origin?.kind === 'task-notification') {
      const n = parseTaskNotification(e.text)
      if (n) await closeBackground($, await context($), n.id, n.status, undefined)
    }
    return next(e)
  })

  // A background job closes only on an observed terminal result.
  on('tool.call', { tool: 'GetTask' }, async ($, e, next) => {
    const r = await next(e)
    const c = await context($)
    const st = r && r.result && typeof r.result === 'object' ? r.result.status : undefined
    if (st && st !== 'working') await closeBackground($, c, r.result.taskId ?? e.taskId, st, r.result.result?.isError)
    return r
  }).catch(($, e, next) => next(e))

  // Verdict: never weaken a downstream deny, never create an allow.
  on('tool.check', async ($, e, next) => {
    const c = await context($)
    const task = await boundTask($, c)
    const v = classify(task, callOf(e))
    // Rule text can quote the command; it is sanitized before it becomes a reason anyone reads.
    const safe = { ...v, rule: sanitize(v.rule, CAPS.reason) }
    if (v.outcome === 'deny') return combine(safe, null, false)
    const down = await next(e)
    const out = combine(safe, down, surfaceVerified(c))
    if (v.outcome === 'needs-user') {
      const at = await $.clock.now()
      recordDecision(c, { at, tool: e.tool, requested: sanitize(e.input?.command ?? e.tool, CAPS.requested), outcome: out.decision === 'ask' ? 'asked' : 'needs-user-refused', rule: safe.rule })
      persist(c, task?.id)
    }
    return out
  }).catch(() => ({ decision: 'deny', reason: 'agentctl 거부: 판정 검사가 실패했습니다' }))

  // Text replies for every surface, answered without a model call.
  on('command.run', { command: 'agentctl' }, async ($, e) => {
    const c = await context($)
    // Replies carry no `agentctl:` prefix of their own: the host already adds one (found in a
    // first-run test, where every reply read "agentctl: agentctl:").
    const reply = (text) => ({ text: String(text).replace(/^agentctl: /gm, '').replace(/^agentctl 거부: /gm, '거부: ') })
    const t = copy(c.lang)
    const p = parseCommand(e.args)
    if (p.kind === 'goal') return reply(await goalCommand($, c, e, p.text))
    if (p.kind === 'typo') return reply(t.typo(p.verb))
    if (p.kind === 'extra') return reply(t.extra(p.verb))
    const [sub, ...rest] = p.kind === 'status' ? ['status'] : [p.verb, ...p.rest]
    if (sub === 'status') {
      await refreshTree($, c)
      const m = await model($, c)
      const bound = m.task && !m.task.recordMissing
      const next = c.pending ? t.next.proposal(c.pending.digest.slice(0, 8)) : bound ? nextForTask(t, checkProgress(m.task, m.evidence, m.fingerprint)) : t.next.none
      const extra = c.checkpoint ? [`최근 인계 내용 저장 ${new Date(c.checkpoint.savedAt).toISOString()} — /agentctl last`] : []
      return reply([next, statusText(m, { details: rest[0] === '--details' }), ...extra].join('\n'))
    }
    if (sub === 'help') return reply(helpText(c.lang, rest[0] === 'advanced'))
    if (sub === 'last') {
      if (c.checkpoint) return reply(`최근 인계 내용 (${new Date(c.checkpoint.savedAt).toISOString()}):\n${c.checkpoint.markdown}`)
      return reply((await boundTask($, c)) ? t.noHandover : t.noTaskLast)
    }
    if (sub === 'proposal') {
      if (!c.pending) return reply(noProposalText(c.lang))
      await suggestAccept($, c)
      return reply(preview(c).join('\n'))
    }
    if (sub === 'accept') return reply(await acceptCommand($, c, e, rest[0]))
    if (sub === 'discard') {
      const had = Boolean(c.pending)
      await settleProposal($, c, c.pending)
      persist(c, (await boundTask($, c))?.id)
      $.ui.invalidate('ui.render')
      return reply(had ? '초안을 폐기했습니다. 바인드된 작업은 변경되지 않았습니다.' : '대기 중인 초안이 없습니다.')
    }
    if (sub === 'task') {
      // A sentence where a subcommand belongs is a goal, not a usage error (found in a first-run test).
      const [verb, ...more] = rest
      if (verb && !['show', 'set', 'clear'].includes(verb)) return reply(await goalCommand($, c, e, rest.join(' ')))
      if (verb === 'set' && more.length && !more.join(' ').trimStart().startsWith('{')) return reply(await goalCommand($, c, e, more.join(' ')))
      // `show` and `clear` take nothing: a stray word is refused before any state is read or changed.
      if ((verb === 'show' || verb === 'clear') && more.length) return reply(t.extra(`task ${verb}`))
      return reply(await taskCommand($, c, e, rest))
    }
    if (sub === 'policy') return reply(policyText(await boundTask($, c)))
    if (sub === 'events') {
      if (rest.length && !/^\d+$/.test(rest[0])) return reply(t.extra('events'))
      return reply(eventsText(c.decisions, Math.min(50, Math.max(1, Number(rest[0]) || 10)), await $.clock.now()))
    }
    if (sub === 'handoff') return reply((await saveHandoff($, c)).text)
    if (sub === 'stop') return reply(await stopCommand($, c))
    return reply(helpText(c.lang, false))
  })

  // While a proposal waits, the box's dim suggestion is its accept line, not the host's own guess
  // at the next prompt (found live). The person still takes it with Tab and sends it with Enter.
  on('prompt.suggest', async ($, e, next) => {
    const c = await context($)
    const text = suggestionWhileWaiting(e.origin?.kind, c.pending?.digest)
    return next(text ? { ...e, text } : e)
  }).catch(($, e, next) => next(e))

  // The band above the prompt. Other mods' band output is kept beside ours.
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const { Box, Text } = $.ui.resolve(e)
    const theirs = await next(e)
    const c = await context($)
    const ours = Text({ dimColor: true, children: [bandText(await model($, c))] })
    return theirs ? Box({ flexDirection: 'column', children: [theirs, ours] }) : ours
  })
}

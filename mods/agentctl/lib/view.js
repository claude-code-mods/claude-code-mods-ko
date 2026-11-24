// What the band, `/agentctl` and `/agentctl policy|events` say (requirements FR-2, FR-3, FR-17,
// FR-23; tech spec § 3.3). Pure: every input arrives as data, every line names its source and age,
// and a field whose source did not answer says so instead of showing a value.

import { checkLine } from './firstrun.js'
import { digest } from './fingerprint.js'
import { sanitize } from './sanitize.js'

// The opaque key evidence for a declared check is stored under: arguments never become a stored
// identifier in plaintext.
export function checkKey(argv) {
  return 'check-' + digest(argv.join('\u0000'))
}

// Evidence counts as current only when the check reported no error, the tree did not change during
// the run, the run's reading matches the last one, and no reading was partial.
export function evidenceCurrent(ev, fingerprint) {
  if (!fingerprint || !ev || ev.outcome !== 'ok' || !ev.before || !ev.after) return false
  if (ev.before.value !== ev.after.value || ev.after.value !== fingerprint.value) return false
  return ![ev.coverage, ev.before.coverage, ev.after.coverage, fingerprint.coverage].includes('partial')
}

// Where the task's declared checks stand on the current tree: how many there are, how many have run
// at all, and which are not current (never run, failed, or stale).
export function checkProgress(task, evidence, fingerprint) {
  const rows = (task?.executors ?? []).filter((e) => e.check).map((e) => {
    const ev = evidence?.[checkKey(e.argv)]
    // Never shortened: the line is one Claude runs, and a cut command would not match the check.
    return { argv: sanitize(checkLine(e.argv), Infinity), ran: Boolean(ev), current: evidenceCurrent(ev, fingerprint) }
  })
  return { declared: rows.length, ran: rows.filter((r) => r.ran).length, pending: rows.filter((r) => !r.current).map((r) => r.argv) }
}

// The four states a field can be in (FR-3).
export function field(label, reading, now) {
  if (!reading) return `${label}: 없음`
  if (reading.failed) return `${label}: 사용 불가 (${reading.failed})`
  const age = Math.max(0, Math.round((now - reading.at) / 1000))
  const stale = reading.staleAfterMs !== undefined && now - reading.at > reading.staleAfterMs
  return `${label}: ${reading.value} — ${reading.source}, ${age}초 전${stale ? ' (오래됨)' : ''}`
}

// review-state.js check --format=json → a gate reading. A gate pass is a gate pass, never a test pass.
export function gateReading(run, at) {
  if (typeof run === 'string') return { failed: run, at }
  if (!run || run.exitCode !== 0) return { failed: `검사 종료 (${run ? run.exitCode : '결과 없음'})`, at }
  let s
  try { s = JSON.parse(run.stdout) } catch { return { failed: 'JSON이 아님', at } }
  const word = (p) => (!p ? '?' : p.passed ? '✅' : p.verdict === 'fail' && p.digest_match ? '⛔' : p.noted && !p.digest_match ? '⏳ 오래됨' : p.owed ? '⏳ 미이행' : '·')
  return { value: `코드 ${word(s.code_review)} · 문서 ${word(s.doc_review)} · precommit ${word(s.precommit)}`, source: 'review-state.js check', at }
}

// Usage windows are read by kind; a missing window is missing, never 0%. One account's windows are
// shown for this session only and never summed with other sessions.
export function usageReading(usage, kind, at) {
  if (!usage) return null
  const w = (usage.rateLimits ?? []).find((r) => r.kind === kind)
  if (!w) return null
  return { value: `${Math.round(w.percentUsed)}%${w.resetsAt ? ` (초기화 ${w.resetsAt})` : ''}`, source: `세션 사용량 (${w.source ?? '호스트'})`, at }
}

export function contextReading(usage, at) {
  const p = usage?.context?.percent
  return typeof p === 'number' ? { value: `${Math.round(p)}%`, source: '세션 사용량', at } : null
}

function evidenceLines(evidence, currentFingerprint, now) {
  const out = []
  for (const ev of Object.values(evidence ?? {})) {
    const fresh = currentFingerprint && ev.after && ev.after.value === currentFingerprint.value && ev.before && ev.before.value === ev.after.value
    const state = ev.outcome === 'backgrounded' ? '시작했으나 완료 미관측'
      : ev.outcome === 'refused' ? '거부됨'
      : !ev.after || !ev.before ? '증거 없음'
      : ev.before.value !== ev.after.value ? '실행 중 트리 변경 — 바인드 해제'
      : fresh && [ev.coverage, ev.before.coverage, ev.after.coverage, currentFingerprint.coverage].includes('partial') ? '일치하지만 일부만 판독됨'
      : fresh ? '최신'
      : '오래됨 (이후 트리 변경)'
    const age = Math.max(0, Math.round((now - ev.at) / 1000))
    out.push(`  ${sanitize(ev.requested, 120)}: ${ev.outcome === 'ok' ? '오류 보고 없음' : ev.outcome} · ${state} · ${ev.coverage ?? '판독 범위 불명'} · ${age}초 전`)
  }
  return out
}

const REASON_LABEL = {
  input: '사용자 입력 대기 중',
  permission: '권한 결정 대기 중',
  'policy-denied': '작업 정책에 의해 거부됨',
  'rate-limit': '사용량 한도 도달',
  'suspected-stall': '활동 없음 (정지 여부 미확인)',
}

function interventionLines(state, now) {
  return Object.entries(state.interventions ?? {}).map(([reason, v]) => {
    const age = Math.max(0, Math.round((now - v.since) / 1000))
    const detail = typeof v.detail === 'string' ? sanitize(v.detail, 120) : v.detail?.resetsAt ? `초기화 ${v.detail.resetsAt}` : ''
    return `  ${REASON_LABEL[reason] ?? reason}${detail ? ` — ${detail}` : ''} · ${age}초 전부터`
  })
}

// Compact by default — it reaches Claude — and the diagnostic lines on `/agentctl status --details`.
// Labels say what they measure (found in a first-run test: "Observation: ok" read as "work passed").
export function statusText(m, { details = false } = {}) {
  const { now, task, state } = m
  const lines = []
  lines.push(task ? `작업: ${sanitize(task.goal, 120)} (${task.id})` : '작업: 바인드되지 않음')
  const iv = interventionLines(state, now)
  lines.push(iv.length ? '확인 필요:' : '확인 필요 사항: 관측되지 않음')
  lines.push(...iv)
  lines.push(field('검토 게이트', m.gate, now))
  const ev = evidenceLines(m.evidence, m.fingerprint, now)
  lines.push(ev.length ? '실행 증거 (검토 판정이 아님):' : '실행 증거: 선언된 검사가 실행되지 않음')
  lines.push(...ev)
  const bg = Object.entries(state.background ?? {}).filter(([, b]) => b.status === 'started' || b.status === 'in-flight')
  if (bg.length) lines.push(`실행 중인 백그라운드: ${bg.length} (${bg.map(([id]) => id).join(', ')})`)
  if (!details) {
    lines.push('더 보기: /agentctl status --details · /agentctl help')
    return lines.join('\n')
  }
  lines.push(`상태 저장소: ${m.health === 'ok' ? '정상' : m.health}`)
  lines.push(`실행 상태: ${state.runtime.value}${state.runtime.tool ? ` (${state.runtime.tool})` : ''} ${Math.max(0, Math.round((now - state.runtime.since) / 1000))}초 전부터 · 단계 ${state.phase.value} · 결과 ${state.result.value}`)
  // A usage reading arrives with Claude's first reply in the session; before that it is absent.
  const usage = (label, r) => (r ? field(label, r, now) : `${label}: 없음 (Claude의 첫 응답 후 판독)`)
  lines.push(usage('컨텍스트', m.context))
  lines.push(usage('5시간 창', m.fiveHour))
  return lines.join('\n')
}

export function bandText(m) {
  const { task, state, now } = m
  const iv = Object.keys(state.interventions ?? {})
  const attention = iv.length ? `⚠ ${iv.map((r) => REASON_LABEL[r] ?? r).join(', ')}` : '확인 필요 없음'
  const head = task ? `agentctl · ${sanitize(task.goal, 40)}` : 'agentctl · 작업 없음'
  const rt = `${state.runtime.value}${state.runtime.tool ? `:${state.runtime.tool}` : ''} ${Math.max(0, Math.round((now - state.runtime.since) / 1000))}초`
  let gate = '게이트 정보 없음'
  if (m.gate?.failed) gate = '게이트 사용 불가'
  else if (m.gate) {
    const age = Math.max(0, Math.round((now - m.gate.at) / 1000))
    const stale = m.gate.staleAfterMs !== undefined && now - m.gate.at > m.gate.staleAfterMs
    gate = `${m.gate.value} (${age}초${stale ? ', 오래됨' : ''})`
  }
  const resume = m.checkpoint ? ` · 최근 인계 ${new Date(m.checkpoint.savedAt).toISOString()}` : ''
  const proposal = m.pending ? ` · 초안 ${m.pending.digest.slice(0, 8)} 대기 중 — /agentctl accept` : ''
  return `${head} · ${rt} · ${attention} · ${gate}${proposal}${resume}${m.health === 'ok' ? '' : ` · ${m.health}`}`
}

export const LIMITS = [
  '이 mod는 제어와 표시를 담당하며 격리 경계가 아닙니다. 운영 환경 읽기 전용은 자격 증명과 대상의 자체 권한으로 적용됩니다.',
  '호스트가 이 mod의 훅을 건너뛰면 (워커 충돌, mod 비활성화) 여기서는 아무것도 거부하지 않습니다. 위험한 명령은 permissions.deny 규칙에 등록하세요.',
  '기본 권한 규칙은 프로그램이 아니라 명령 텍스트와 비교합니다. 다른 mod가 tool.check에서 판정을 변경할 수 있습니다.',
  '승인된 실행자는 결과 영향이 분류되지 않은 채 실행됩니다.',
]

export function policyText(task) {
  if (!task) return ['바인드된 작업 없음: 기본 제공 운영 환경 쓰기와 원격 git 쓰기 유형은 계속 거부됩니다. 그 밖의 것은 호스트 자체 권한 흐름에 맡깁니다.', ...LIMITS].join('\n')
  const one = (x) => (Array.isArray(x) ? x.join(' ') : Array.isArray(x?.argv) ? x.argv.join(' ') + (x.check ? ' (검사)' : '') : String(x))
  const fmt = (xs) => (xs?.length ? xs.map((x) => sanitize(one(x), 200)).join('; ') : '없음')
  return [
    `작업 ${task.id} · 정책 버전 ${task.policyVersion ?? 1}`,
    ...(task.recordMissing ? ['바인드된 작업 기록이 없습니다. 워크트리 내부 읽기 외에는 모두 거부됩니다. 작업을 다시 설정하세요.'] : []),
    `워크트리: ${sanitize(task.worktree, 200)}`,
    `편집: ${(task.allow ?? []).includes('edit') ? `${fmt(task.editRoots ?? ['.'])}에서 허용` : '허용되지 않음'}`,
    `금지 (작업): ${fmt(task.forbid)} · 기본 제공 운영 환경 쓰기 및 원격 git 쓰기 유형 포함`,
    `승인된 실행자: ${fmt(task.executors)}`,
    `사람의 확인 필요: ${fmt(task.needsUser)}`,
    `허용된 기타 도구: ${fmt(task.tools)}`,
    '그 밖의 것은 호스트 자체 권한 흐름(또는 자동 모드)에 맡깁니다. 이 mod는 분류하지 않습니다.',
    '최선의 노력: 이 mod는 각 도구 호출을 읽지만 스크립트 내용이나 그 안에서 시작한 명령은 읽지 않습니다.',
    ...LIMITS,
  ].join('\n')
}

export function eventsText(decisions, n, now) {
  const list = (decisions ?? []).slice(-n)
  if (!list.length) return '이 세션에는 기록된 판정이 없습니다.'
  return list.map((d) => `${Math.max(0, Math.round((now - d.at) / 1000))}초 전 · ${d.outcome} · ${d.tool} · ${sanitize(d.requested, 160)} · ${sanitize(d.rule, 160)}`).join('\n')
}

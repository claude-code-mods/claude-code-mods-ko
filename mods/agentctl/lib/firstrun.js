// First run (tech spec § 3.7, 2026-10-07): parsing `/agentctl …`, the drafting request a goal
// prepares, and the copy a first-time user reads. Pure: no `$`, no I/O.
//
// Found by a user's first run of 0.2.2: every path assumed the vocabulary, so a sentence after
// `/agentctl` got the usage grammar. A goal now prepares a request for Claude in the person's own
// prompt box; nothing here sends or binds anything.

import { renderArgv } from './policy.js'

// Verbs and how many words may follow each. `task` and `events` check their own arguments.
export const VERBS = {
  status: { max: 1, args: ['--details'] },
  help: { max: 1, args: ['advanced'] },
  proposal: { max: 0 },
  accept: { max: 1 },
  discard: { max: 0 },
  task: { max: Infinity },
  policy: { max: 0 },
  events: { max: 1 },
  handoff: { max: 0 },
  last: { max: 0 },
  stop: { max: 0 },
}

function distance(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) d[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
    }
  }
  return d[a.length][b.length]
}

// What the line after `/agentctl` is: a verb (with its words), a near-miss of a verb, or a goal.
// Only a line that looks like command syntax — one ASCII word, optionally a digest or a number —
// can be a near-miss, so "test the login flow" stays a goal while "accepet ab12cd34" is corrected.
export function parseCommand(raw) {
  const text = String(raw ?? '').trim()
  if (!text) return { kind: 'status', words: [] }
  const words = text.split(/\s+/)
  const head = words[0].toLowerCase()
  if (Object.hasOwn(VERBS, head)) {
    const rest = words.slice(1)
    const v = VERBS[head]
    if (rest.length > v.max) return { kind: 'extra', verb: head, rest }
    if (v.args && rest.length && !v.args.includes(rest[0])) return { kind: 'extra', verb: head, rest }
    return { kind: 'verb', verb: head, rest }
  }
  if (/^[a-z]{3,}(\s+[0-9a-z]{1,24})?$/i.test(text)) {
    let best = null
    for (const v of Object.keys(VERBS)) {
      const d = distance(head, v)
      if (d <= 2 && (!best || d < best.d)) best = { v, d }
    }
    if (best) return { kind: 'typo', verb: best.v, words }
  }
  return { kind: 'goal', text }
}

// 목표 문자열에 대한 제한된 영어/번체 중국어/한국어 문구 휴리스틱입니다. 로케일 감지가 아닙니다.
export function languageOf(goal) {
  const text = String(goal ?? '')
  if (/\p{Script=Hangul}/u.test(text)) return 'ko'
  return /\p{Script=Han}/u.test(text) ? 'zh' : 'en'
}

// A path for a POSIX shell, single-quoted: the only character needing care inside is `'` itself.
export function shellQuote(s) {
  return `'${String(s).replace(/'/g, `'\\''`)}'`
}

// The helper lives in the mod; `$.plugin.root` is the plugin's directory, but tolerate a root that
// points at `.claude-plugin` itself.
export function helperPath(root) {
  const r = String(root ?? '').replace(/\/+$/, '')
  return `${r.endsWith('/.claude-plugin') ? r.slice(0, -'/.claude-plugin'.length) : r}/bin/propose.mjs`
}

// The request the person sends to Claude. The goal is quoted verbatim and never truncated; the rest
// is fixed text kept short, since it becomes one ordinary model turn.
export function draftingRequest({ goal, worktree, base, root, lang }) {
  const helper = `node ${shellQuote(helperPath(root))} --worktree ${shellQuote(worktree)} --stdin`
  const baseText = base ? `"${base}"` : 'null'
  if (lang === 'ko') {
    return [
      `다음 작업의 agentctl 작업 범위 초안을 작성하세요: "${goal}"`,
      `먼저 ${helper.replace(' --stdin', ' --help')}을(를) 실행해 필드를 확인하고, 프로젝트를 읽은 뒤 가장 좁은 범위(편집 경로, 검사 명령, 수락 기준)를 제안하세요. 불확실한 점이 있으면 나에게 묻고 답을 기다리세요. 답보다 먼저 proposal을 작성하거나 권한을 임의로 넓히지 마세요.`,
      `${helper}(으)로 작성하세요 (base는 ${baseText}. heredoc 구분자는 따옴표로 감싸고 JSON에 등장하지 않는 것으로 하세요). proposal만 작성한 뒤 내 승인을 기다리세요.`,
    ].join('\n')
  }
  if (lang === 'zh') {
    return [
      `請為這件事起草 agentctl 任務範圍：「${goal}」`,
      `先跑 ${helper.replace(' --stdin', ' --help')} 看欄位，讀專案後提出最窄範圍（編輯路徑、檢查指令、驗收）。有不清楚的地方就問我並等我回答——回答前不要寫 proposal，也別自己加權限。`,
      `用 ${helper} 寫入（base 為 ${baseText}；heredoc 分隔字加引號且不在 JSON 內），只寫 proposal，然後等我確認。`,
    ].join('\n')
  }
  return [
    `Draft an agentctl task scope for: "${goal}"`,
    `First run ${helper.replace(' --stdin', ' --help')} for the fields. Read the project and propose the narrowest scope (edit paths, check commands, acceptance). If something is unclear, ask me and wait for my answer — write no proposal before it, and never invent permissions.`,
    `Write it with ${helper} (base ${baseText}; a quoted heredoc delimiter that does not occur in the JSON). Write the proposal only, then wait for me to accept.`,
  ].join('\n')
}

const COPY = {
  ko: {
    filled: (bound) => `Claude에 작업 범위 초안 작성을 요청하는 내용을 입력창에 넣었습니다. Enter를 눌러 보내세요. ${bound ? '새 범위를 승인할 때까지 현재 작업이 그대로 적용됩니다.' : '아직 바인드된 작업이 없습니다.'}`,
    mixed: (bound) => `요청이 당신이 입력한 글 뒤에 추가되어 두 내용이 모두 입력창에 있습니다. 보내기 전에 수정하세요. ${bound ? '새 범위를 승인할 때까지 현재 작업이 그대로 적용됩니다.' : '아직 바인드된 작업이 없습니다.'}`,
    copy: (bound) => `이 내용을 Claude에 보내 범위 초안을 작성하게 하세요 (${bound ? '새 범위를 승인할 때까지 현재 작업이 그대로 적용됩니다' : '아직 바인드된 작업이 없습니다'}):`,
    typo: (v) => `"/agentctl ${v}"을(를) 입력하려 했나요? 작업을 시작하려면 내용을 설명하세요: /agentctl <지금 하는 일>`,
    extra: (v) => `"/agentctl ${v}"에는 그런 인자가 없습니다. ${v === 'proposal' ? '대기 중인 초안을 표시할 뿐입니다. 작성하려면 작업을 설명하세요: /agentctl <지금 하는 일>' : '/agentctl help를 참조하세요.'}`,
    acceptLine: (d) => `이 범위 승인: /agentctl accept ${d} — 범위만 바인드하며 작업을 시작하지는 않습니다.`,
    accepted: '범위를 바인드했습니다. 다음: Claude에 작업 시작을 요청하세요.',
    runChecks: (checks) => `증거를 남기려면 각 검사를 작성된 그대로 실행하세요: ${checks.join(' · ')} — 파이프, 리다이렉트, 래퍼를 쓰면 실행으로 인정되지 않고, 인자를 추가하면 선언보다 적게 검사할 수 있습니다.`,
    wholeScope: '전체 범위는 /agentctl policy에서 확인할 수 있습니다.',
    noTaskLast: '바인드된 작업이 없으므로 인계 내용도 없습니다. 시작하려면: /agentctl <지금 하는 일>',
    noHandover: '이 작업에는 저장된 인계 내용이 없습니다. /agentctl handoff로 저장할 수 있습니다.',
    next: {
      none: '다음: 작업을 설명하세요 — /agentctl <지금 하는 일>. 기본 제공 거부(직접 git push, 운영 환경 쓰기)는 지금도 적용됩니다.',
      proposal: (d) => `다음: /agentctl proposal을 확인한 뒤 /agentctl accept ${d}`,
      task: '다음: Claude에 작업을 요청하세요. /agentctl handoff로 현재 상태를 저장할 수 있습니다.',
      taskThenChecks: (checks) => `다음: Claude에 작업을 요청한 뒤 검사를 작성된 그대로 실행하세요: ${checks.join(' · ')}. 모두 최신 상태가 되면: /agentctl handoff`,
      rerun: (checks) => `다음: 현재 트리에서 검사가 최신이 아닙니다. Claude에 정확히 작성된 대로 실행하게 하세요: ${checks.join(' · ')}. 그 후: /agentctl handoff`,
      checksCurrent: '다음: 선언된 검사가 모두 현재 트리에서 최신입니다 — /agentctl handoff로 인계 내용을 저장할 수 있습니다.',
    },
  },
  en: {
    filled: (bound) => `A request for Claude to draft the scope is in your prompt box — press Enter to send it. ${bound ? 'The current task stays in force until you accept the new scope.' : 'Nothing is bound yet.'}`,
    mixed: (bound) => `The request was added after text you typed meanwhile; both are in your prompt box. Edit it before you press Enter. ${bound ? 'The current task stays in force until you accept the new scope.' : 'Nothing is bound yet.'}`,
    copy: (bound) => `Send this to Claude to have it draft the scope (${bound ? 'the current task stays in force until you accept the new one' : 'nothing is bound yet'}):`,
    typo: (v) => `Did you mean "/agentctl ${v}"? To start a task, describe it: /agentctl <what you are doing>`,
    extra: (v) => `"/agentctl ${v}" takes no such arguments. ${v === 'proposal' ? 'It shows a waiting draft; to make one, describe the work: /agentctl <what you are doing>' : 'See /agentctl help.'}`,
    acceptLine: (d) => `Accept this scope: /agentctl accept ${d} — it binds the scope only; it does not start any work.`,
    accepted: 'Scope bound. Next: ask Claude to start the work.',
    runChecks: (checks) => `To leave evidence, run each check as written: ${checks.join(' · ')} — a pipe, redirect or wrapper keeps a run from counting, and added arguments may check less than declared.`,
    wholeScope: '/agentctl policy shows the whole scope.',
    noTaskLast: 'No task is bound, so there is no hand-over yet. Start one: /agentctl <what you are doing>',
    noHandover: 'This task has no saved hand-over yet: /agentctl handoff saves one.',
    next: {
      none: 'Next: describe the work — /agentctl <what you are doing>. Built-in refusals (direct git push, production writes) apply even now.',
      proposal: (d) => `Next: review /agentctl proposal, then /agentctl accept ${d}`,
      task: 'Next: ask Claude to work; /agentctl handoff saves where things stand.',
      taskThenChecks: (checks) => `Next: ask Claude to work, then to run the checks exactly as written: ${checks.join(' · ')}. Once they are current: /agentctl handoff`,
      rerun: (checks) => `Next: not current on this tree — ask Claude to run exactly as written: ${checks.join(' · ')}. Then: /agentctl handoff`,
      checksCurrent: 'Next: every declared check is current on this tree — /agentctl handoff saves the hand-over.',
    },
  },
  zh: {
    filled: (bound) => `已把請 Claude 起草範圍的請求放進輸入框——按 Enter 送出。${bound ? '接受新範圍之前，目前的任務照舊生效。' : '目前尚未綁定任何範圍。'}`,
    mixed: (bound) => `請求接在你剛才打的字後面，兩者都在輸入框裡；送出前請先整理。${bound ? '接受新範圍之前，目前的任務照舊生效。' : '目前尚未綁定任何範圍。'}`,
    copy: (bound) => `把這段送給 Claude 讓它起草範圍（${bound ? '接受新範圍之前，目前的任務照舊生效' : '目前尚未綁定任何範圍'}）：`,
    typo: (v) => `你是要用「/agentctl ${v}」嗎？要開始任務，請描述它：/agentctl <你要做的事>`,
    extra: (v) => `「/agentctl ${v}」不接受這些參數。${v === 'proposal' ? '它只顯示等待中的草稿；要起草，請描述工作：/agentctl <你要做的事>' : '見 /agentctl help。'}`,
    acceptLine: (d) => `確認此範圍：/agentctl accept ${d} ——只會綁定範圍，不會開始任何工作。`,
    accepted: '範圍已綁定。下一步：請 Claude 開始這項工作。',
    runChecks: (checks) => `要留下證據，請照原樣執行每條檢查：${checks.join(' · ')} ——加 pipe、redirect 或外層包裝就不算；多加參數可能只檢查到一部分。`,
    wholeScope: '完整範圍：/agentctl policy',
    noTaskLast: '目前沒有綁定任務，所以還沒有交接紀錄。開始一個：/agentctl <你要做的事>',
    noHandover: '這個任務還沒有存過交接：/agentctl handoff 會存一份。',
    next: {
      none: '下一步：描述工作——/agentctl <你要做的事>。內建規則（直接 git push、production 寫入）現在就會擋。',
      proposal: (d) => `下一步：看 /agentctl proposal，再 /agentctl accept ${d}`,
      task: '下一步：請 Claude 開始工作；/agentctl handoff 會存下目前進度。',
      taskThenChecks: (checks) => `下一步：請 Claude 開始工作，完成後逐字執行檢查：${checks.join(' · ')}。檢查都是最新的之後：/agentctl handoff`,
      rerun: (checks) => `下一步：這些檢查在目前的程式碼上不是最新的——請 Claude 逐字執行：${checks.join(' · ')}。之後：/agentctl handoff`,
      checksCurrent: '下一步：宣告的檢查在目前的程式碼上都是最新的——/agentctl handoff 會存下交接。',
    },
  },
}

export function copy(lang) {
  return COPY[lang === 'zh' ? 'zh' : lang === 'ko' ? 'ko' : 'en']
}

// A check as a line Claude can run as written: quoted so it reads back as the declared argv, never
// shortened. An argv no quoting can carry is shown as its JSON array instead, which says to run it as
// those words.
export function checkLine(argv) {
  return renderArgv(argv) ?? `${JSON.stringify(argv)} (이 단어들로 실행)`
}

// The task's declared checks, as the command lines Claude must run as written.
export function checkArgv(task) {
  return (task?.executors ?? []).filter((e) => e.check).map((e) => checkLine(e.argv))
}

// The next step for a bound task, from where its declared checks stand (`checkProgress` in view.js).
// Found in an uncoached run: with the work done, "ask Claude to start" was still the next step.
export function nextForTask(t, progress) {
  if (!progress.declared) return t.next.task
  if (!progress.pending.length) return t.next.checksCurrent
  return progress.ran ? t.next.rerun(progress.pending) : t.next.taskThenChecks(progress.pending)
}

export function helpText(lang, advanced) {
  if (lang === 'ko') {
    return advanced ? [
      '고급:',
      '  /agentctl task show | set <json> | clear — 작업을 직접 보거나 설정',
      '  /agentctl policy — 적용 중인 범위와 제한',
      '  /agentctl events [n] — 최근 거부와 호스트에 위임된 호출',
      '  /agentctl handoff · last — 인계 내용 저장 · 최근 인계 내용 표시',
      '  /agentctl stop — 현재 턴을 취소하고 인계 내용 저장',
      '  /agentctl status --details · discard — 전체 상태 · 초안 폐기',
    ].join('\n') : [
      'agentctl은 당신이 승인한 범위 안에서 Claude를 실행하고 검사 증거를 기록합니다.',
      '  /agentctl <지금 하는 일> — Claude가 범위 초안을 작성합니다 (바인드는 하지 않음)',
      '  /agentctl accept <digest> — 범위를 승인합니다 (작업을 시작하지 않음)',
      '  /agentctl — 현재 상태와 다음 단계',
      '더 보기: /agentctl help advanced',
    ].join('\n')
  }
  if (lang === 'zh') {
    return advanced ? [
      '進階：',
      '  /agentctl task show | set <json> | clear — 直接檢視或設定任務',
      '  /agentctl policy — 目前範圍與限制',
      '  /agentctl events [n] — 最近的拒絕與交給 host 的呼叫',
      '  /agentctl handoff · last — 存下交接 · 顯示上次的交接',
      '  /agentctl stop — 取消目前回合並存下交接',
      '  /agentctl status --details · discard — 完整狀態 · 丟棄草稿',
    ].join('\n') : [
      'agentctl 讓 Claude 在你確認的範圍內工作，並記錄檢查證據。',
      '  /agentctl <你要做的事> — Claude 起草範圍（不會綁定）',
      '  /agentctl accept <digest> — 你確認範圍（不會開始工作）',
      '  /agentctl — 目前狀態與下一步',
      '更多：/agentctl help advanced',
    ].join('\n')
  }
  return advanced ? [
    'Advanced:',
    '  /agentctl task show | set <json> | clear — view or set the task directly',
    '  /agentctl policy — the scope in force and its limits',
    '  /agentctl events [n] — recent refusals and calls left to the host',
    '  /agentctl handoff · last — save a hand-over · show the last one',
    '  /agentctl stop — cancel the turn and save a hand-over',
    '  /agentctl status --details · discard — full status · drop a draft',
  ].join('\n') : [
    'agentctl keeps Claude inside a scope you confirm and records check evidence.',
    '  /agentctl <what you are doing> — Claude drafts a scope (binds nothing)',
    '  /agentctl accept <digest> — you confirm it (starts no work)',
    '  /agentctl — where things stand and what to do next',
    'More: /agentctl help advanced',
  ].join('\n')
}

// What the box should suggest while a proposal waits (found live on 2.1.292: the host's own guess —
// "확인" — took the box, so Tab + Enter sent that word to Claude instead of accepting). Only the
// host's own guess is replaced, and only while a proposal is waiting; a plugin's suggestion, ours
// included, passes unchanged.
export function suggestionWhileWaiting(originKind, pendingDigest) {
  return originKind === 'suggestion' && pendingDigest ? `/agentctl accept ${String(pendingDigest).slice(0, 8)}` : null
}

// The pane's drawing: three blocks from the view state, each row one string, the buttons on rows of their own, so a
// long line never pushes them off and a narrow pane wraps them. The same tree on every surface; the terminal gets
// `plain` buttons with a hotkey where one is natural.
import type { EngineInterface, RenderElement, RenderInput } from 'claude-code'
import type { Decision, GuardEntry, Pending, Recall, Saving } from '../types'
import { hhmm, isHash, isId, plainDecision, routeWords } from './files'

export type View = {
  on: boolean
  hasCli: boolean
  promptSeen: boolean
  recall: Recall | null
  recallState: 'none' | 'this' | 'other' | 'missing'
  guard: { entry: GuardEntry; thisCall: boolean } | null
  lastCall: GuardEntry | { tool: string; missing: true } | null
  decision: Decision | null
  saving: Saving
  savingNote: string | null
  pending: Pending
}
export type Where = 'recall' | 'guard' | 'decision'
export type Actions = {
  why: (idOrHash: string, where: Where) => void
  wrong: (id: string, kind: string | null, where: Where) => void
  forget: (id: string, kind: string | null, where: Where) => void
  guardLog: () => void
  missed: (where: Where) => void
  confirm: (yes: boolean) => void
  close: () => void
}

const MAX_TEXT = 300
const cut = (s: string) => (s.length > MAX_TEXT ? `${s.slice(0, MAX_TEXT - 1)}…` : s)
const verb = (d: GuardEntry['decision']) => (d === 'deny' ? '거부됨' : d === 'ask' ? '확인 요청' : d === 'warn' ? '경고됨' : '허용됨')

export function draw($: EngineInterface, e: RenderInput<'Pane'>, v: View, act: Actions): RenderElement {
  const { Box, Text, Button } = $.ui.resolve(e)
  const width = typeof e.props.bodyColumns === 'number' && e.props.bodyColumns > 0 ? e.props.bodyColumns : undefined
  const buttons = (id: string, kind: string | null, suffix: string, where: Where) => (
    <Box flexDirection="row" gap={1}>
      <Button key={`why:${suffix}`} plain onPress={() => act.why(id, where)}>이유</Button>
      <Button key={`wrong:${suffix}`} plain onPress={() => act.wrong(id, kind, where)}>wrong</Button>
      <Button key={`forget:${suffix}`} plain onPress={() => act.forget(id, kind, where)}>forget</Button>
    </Box>
  )
  const pending = (where: Where) => {
    const p = v.pending
    if (!p || p.where !== where) return null
    if (p.kind === 'confirm') {
      const text = p.action === 'forget' ? `${p.id}를 폐기하시겠습니까? JEVMEM.md에 [retired]로 남습니다.` : p.action === 'wrong' ? `${p.id}를 잘못된 것으로 표시하고 폐기하시겠습니까?` : '이 턴을 메모리 항목으로 저장하시겠습니까? jevmem missed가 종류를 정하고 추가합니다.'
      return (
        <Box flexDirection="column">
          <Text wrap="wrap">{text}</Text>
          <Box flexDirection="row" gap={1}>
            <Button key="confirm:no" variant="primary" hotkey="n" onPress={() => act.confirm(false)}>아니요</Button>
            <Button key="confirm:yes" hotkey="y" onPress={() => act.confirm(true)}>예</Button>
          </Box>
        </Box>
      )
    }
    if (p.kind === 'output') {
      const lines = p.text.split('\n')
      const shown = lines.slice(0, 40)
      return (
        <Box flexDirection="column">
          <Text dimColor>{p.title}</Text>
          {shown.map((l) => (
            <Text wrap="wrap">{l === '' ? ' ' : l}</Text>
          ))}
          {lines.length > shown.length && <Text dimColor>{`${lines.length - shown.length}줄 더 있음: 터미널에서 명령을 실행하세요`}</Text>}
          <Button key="output:close" plain onPress={() => act.close()}>닫기</Button>
        </Box>
      )
    }
    return (
      <Box flexDirection="column">
        <Text dimColor wrap="wrap">{p.text}</Text>
        <Button key="output:close" plain onPress={() => act.close()}>닫기</Button>
      </Box>
    )
  }

  // Block 1: recalled for this prompt.
  const recall: RenderElement[] = []
  if (!v.promptSeen) recall.push(<Text dimColor>아직 프롬프트가 없습니다</Text>)
  else if (v.recallState !== 'this' || !v.recall) recall.push(<Text dimColor>이 프롬프트에 해당하는 내용이 없습니다</Text>)
  else {
    const r = v.recall
    if (r.lines === 0) recall.push(<Text dimColor wrap="wrap">아직 메모리 항목이 없습니다. 결정, 규칙 또는 실패한 내용을 말하면 jevmem이 저장합니다</Text>)
    else if (r.served.length === 0) recall.push(<Text dimColor>이 프롬프트에 맞는 항목이 없습니다</Text>)
    for (const m of r.served) {
      const id = String(m.id ?? '')
      recall.push(<Text wrap="wrap">{`${id} [${String(m.kind ?? '?')}] ${cut(String(m.text ?? ''))}`}</Text>)
      if (isId(id)) recall.push(buttons(id, m.kind ?? null, id, 'recall'))
      else recall.push(<Text dimColor>메모리 ID가 아닙니다</Text>)
    }
    for (const w of r.withheld) recall.push(<Text dimColor wrap="wrap">{`${String(w.id)} 보류됨: ${cut(String(w.reason ?? ''))}`}</Text>)
    const how = r.path === 'word-match' ? `단어 일치: Jev가 응답하지 않음${r.error ? ` (${cut(r.error)})` : ''}` : `Jev ${r.ms} ms`
    if (r.lines !== 0) recall.push(<Text dimColor wrap="wrap">{`제공 ${r.served.length}개 · 보류 ${r.withheld.length}개 · 차단 ${r.gated}개 · ${how}`}</Text>)
  }

  // Block 2: the guard.
  const guard: RenderElement[] = []
  if (v.guard) {
    const g = v.guard.entry
    guard.push(<Text wrap="wrap">{`${g.tool} ${verb(g.decision)} (${g.mode ?? g.route}) · ${v.guard.thisCall ? '이 호출' : hhmm(g.ts)}`}</Text>)
    for (const r of g.rules ?? []) guard.push(<Text wrap="wrap">{`${r.id} ${r.p !== undefined ? r.p.toFixed(2) : '?'} ${cut(r.text)}${r.unverified ? ' (확인되지 않음)' : ''}${r.unchecked ? ' (검사되지 않음)' : ''}`}</Text>)
    if (g.action) guard.push(<Text dimColor wrap="wrap">{cut(g.action)}</Text>)
    if (g.tamper) guard.push(<Text dimColor wrap="wrap">{`변조 검사: ${cut(g.tamper)}`}</Text>)
    const ruleId = g.rules?.find((r) => isId(r.id))?.id
    guard.push(
      <Box flexDirection="row" gap={1}>
        {ruleId && <Button key="why:guard" plain onPress={() => act.why(ruleId, 'guard')}>이유</Button>}
        <Button key="log:guard" plain onPress={() => act.guardLog()}>로그</Button>
      </Box>,
    )
  }
  if (v.lastCall && 'missing' in v.lastCall) guard.push(<Text dimColor>{`${v.lastCall.tool}: 이 호출의 로그 항목이 없습니다`}</Text>)
  else if (v.lastCall && (!v.guard || v.guard.entry !== v.lastCall)) guard.push(<Text dimColor wrap="wrap">{`마지막 호출: ${v.lastCall.tool} ${verb(v.lastCall.decision)} (${routeWords[v.lastCall.route] ?? v.lastCall.route})`}</Text>)
  if (!guard.length) guard.push(<Text dimColor>아직 검사된 호출이 없습니다</Text>)

  // Block 3: saved last turn.
  const saved: RenderElement[] = []
  const d = v.decision
  if (v.saving === 'none') saved.push(<Text dimColor>아직 턴이 없습니다</Text>)
  else if (v.saving === 'saving') saved.push(<Text dimColor>저장 중…</Text>)
  else if (v.saving !== 'ready' || !d) saved.push(<Text dimColor wrap="wrap">{v.savingNote ?? '아직 결정되지 않음'}</Text>)
  else if (d.action === 'saved' && d.id) {
    saved.push(<Text wrap="wrap">{`${d.id} [${d.kind ?? '?'}] ${cut(d.line ?? '')}`}</Text>)
    if (d.superseded) saved.push(<Text dimColor>{`${d.superseded}를 대체합니다`}</Text>)
    if (d.duplicate_of) saved.push(<Text dimColor>{`${d.duplicate_of}의 중복입니다`}</Text>)
    if (isId(d.id)) saved.push(buttons(d.id, d.kind, 'last', 'decision'))
    else saved.push(<Text dimColor>메모리 ID가 아닙니다</Text>)
  } else {
    saved.push(<Text dimColor wrap="wrap">{plainDecision(d)}</Text>)
    // 0.7.6: a skipped turn can be labelled as missed from here (the prompt as typed goes to `jevmem missed`).
    const row: RenderElement[] = []
    if (isHash(d.hash)) row.push(<Button key="why:last" plain onPress={() => act.why(d.hash!, 'decision')}>이유</Button>)
    if (d.action === 'skipped' && v.promptSeen) row.push(<Button key="missed:last" plain onPress={() => act.missed('decision')}>놓침</Button>)
    if (row.length) saved.push(<Box flexDirection="row" gap={1}>{row}</Box>)
  }

  return (
    <Box flexDirection="column" width={width}>
      <Text weight="bold">이 프롬프트에서 회상한 내용</Text>
      {recall}
      {pending('recall')}
      <Text> </Text>
      <Text weight="bold">가드</Text>
      {guard}
      {pending('guard')}
      <Text> </Text>
      <Text weight="bold">마지막 턴에 저장한 내용</Text>
      {saved}
      {pending('decision')}
    </Box>
  )
}

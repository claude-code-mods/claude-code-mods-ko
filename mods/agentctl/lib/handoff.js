// Model-free hand-over (requirements FR-15, UC-6; tech spec § 3.4). Pure: built only from records.
// It answers the eight questions and keeps three sources apart: what the user confirmed (the task),
// what tools observed (operations, evidence), and what Claude only claimed (never stored as a fact,
// so the hand-over says plainly that nothing claimed is shown as verified).

import { CAPS, sanitize } from './sanitize.js'
import { HARD_FORBIDDEN } from './policy.js'
import { evidenceCurrent } from './view.js'

const s = (x, n = 200) => sanitize(x, n)

// Each section is { heading, items, fixed }: headings and `fixed` lines always appear; `items` fill the
// remaining budget in order and the rest is counted, so the size cap never drops a heading or the
// limits disclosure (INV-005) the way truncating the finished text would.
function assemble(head, sections, cap) {
  const fixedText = [...head, ...sections.flatMap((x) => ['', x.heading, ...x.fixed])].join('\n')
  const omitLine = (n) => `- … 나머지 ${n}개 생략 (인계 내용 크기 제한)`
  let budget = cap - fixedText.length - sections.length * omitLine(99999).length
  const out = [...head]
  for (const x of sections) {
    out.push('', x.heading)
    let shown = 0
    for (const it of x.items) {
      if (it.length + 1 > budget) break
      out.push(it); budget -= it.length + 1; shown++
    }
    if (shown < x.items.length) out.push(omitLine(x.items.length - shown))
    out.push(...x.fixed)
  }
  return out.join('\n')
}

export function handoff({ task, state, evidence, fingerprint, decisions, now, sessionId }) {
  // When the last tree reading was taken: the hand-over starts no process, so it never re-reads.
  const seenAt = typeof fingerprint?.at === 'number' ? ` (${new Date(fingerprint.at).toISOString()} 기준)` : ''
  const head = [
    `# 인계 — ${task ? s(task.goal, 120) : '바인드된 작업 없음'}`,
    '',
    `${new Date(now).toISOString()}에 구조화된 기록으로 생성 (세션 ${s(sessionId, 60)}). 모델을 호출하지 않았습니다.`,
  ]
  const sec = []
  sec.push({ heading: '## 1. 목표', items: [], fixed: [task ? s(task.goal, 500) : '이 세션에서는 작업이 선언되지 않았습니다.'] })
  const scope = []
  if (task) {
    scope.push(`- 워크트리: ${s(task.worktree)}`)
    scope.push(`- 편집: ${(task.allow ?? []).includes('edit') ? `${(task.editRoots ?? ['.']).map((r) => s(r)).join(', ')}에서 허용` : '허용되지 않음'}`)
    scope.push(`- 승인된 실행자: ${(task.executors ?? []).map((e) => s(e.argv.join(' '))).join('; ') || '없음'}`)
    scope.push(`- 금지: ${(task.forbid ?? []).map((f) => s(Array.isArray(f) ? f.join(' ') : f)).join('; ') || '없음'}, 그리고 ${[...new Set(HARD_FORBIDDEN.map((h) => h.rule))].join(', ')}`)
    if (task.acceptance?.length) scope.push(`- 수락 조건: ${task.acceptance.map((a) => s(a)).join('; ')}`)
  }
  sec.push({ heading: '## 2. 허용 및 금지 범위', items: scope, fixed: task ? [] : ['- 선언된 범위가 없습니다.'] })
  const ops = Object.entries(state.ops ?? {})
  const edits = ops.filter(([, o]) => ['Write', 'Edit', 'NotebookEdit', 'MultiEdit'].includes(o.tool) && o.outcome === 'ok')
  sec.push({ heading: '## 3. 변경 내용', items: [], fixed: [
    fingerprint ? `- 트리: HEAD ${s(fingerprint.head, 60)}, 변경 또는 미추적 경로 ${fingerprint.changedCount ?? '?'}개 (${fingerprint.coverage})${seenAt ? `, 판독${seenAt}` : ''}` : '- 트리: 이번 인계에서 판독하지 않음',
    // Only the edit tools are counted here; a file changed through Bash shows in the tree line above
    // (found in an uncoached run: "Edits observed: 0" beside a changed README read as "nothing changed").
    `- 이번 세션의 편집 도구 호출: ${edits.length}회 (Bash로 만든 변경은 여기에 포함되지 않으며 트리 행이 기록입니다)`,
  ] })
  const ev = Object.values(evidence ?? {})
  const matches = (e) => fingerprint && e.after && e.before && e.before.value === e.after.value && e.after.value === fingerprint.value && e.outcome === 'ok'
  // Partial coverage is never "verified": what a reading did not cover may have changed — the
  // before, the after and the last reading must each be complete. The same rule `/agentctl` uses.
  const current = (e) => evidenceCurrent(e, fingerprint)
  const verified = ev.filter(current).map((e) => `- ${s(e.requested)} — 오류 보고 없음, 최근 트리 판독과 일치${seenAt} (${e.coverage})`)
  sec.push({ heading: '## 4. 검증됨 (최근 트리 판독에 의한 실행 증거)', items: verified, fixed: verified.length ? [] : ['- 없음.'] })
  const notVerified = ev.filter((e) => !current(e)).map((e) => {
    const why = e.outcome === 'backgrounded' ? '시작했으나 완료는 관측되지 않음' : e.outcome !== 'ok' ? `결과 ${e.outcome}` : !e.after || !e.before ? '증거를 얻을 수 없음' : e.before.value !== e.after.value ? '실행 중 트리 변경' : matches(e) ? '일부만 판독 — 트리의 일부를 읽지 못함' : '오래됨 — 이후 트리가 변경됨'
    return `- ${s(e.requested)} — ${why}`
  })
  sec.push({ heading: '## 5. 검증되지 않음', items: notVerified, fixed: ['- 위 증거 없이 Claude가 완료, 통과 또는 수정 완료라고 말한 것은 Claude 자신의 판단일 뿐입니다.'] })
  const open = ops.filter(([, o]) => o.endedAt === undefined && o.outcome !== 'refused')
  const bg = Object.entries(state.background ?? {}).filter(([, b]) => b.status === 'started' || b.status === 'in-flight')
  const running = [
    ...open.map(([id, o]) => `- ${s(o.requested)} (${o.tool}, ${o.outcome}) — ${id}`),
    ...bg.map(([id, b]) => `- background ${s(id, 60)} — ${b.status}${b.asOf ? ` (${new Date(b.asOf).toISOString()} 기준)` : ''}`),
  ]
  sec.push({ heading: '## 6. 실행 중이거나 불명확', items: running, fixed: running.length ? [] : ['- 실행 중인 것이 관측되지 않았습니다. 추적하지 않는 프로세스는 확인할 수 없습니다.'] })
  const iv = Object.keys(state.interventions ?? {})
  sec.push({ heading: '## 7. 다음 단계', items: [], fixed: [iv.length ? `- 처리 필요: ${iv.map((x) => s(x, 60)).join(', ')}` : '- 기록 없음. 4~6절을 보고 판단하세요.'] })
  const refused = (decisions ?? []).filter((d) => d.outcome === 'deny' || d.outcome === 'unknown' || d.outcome === 'needs-user-refused')
  sec.push({ heading: '## 8. 아직 허용되지 않은 것', items: [], fixed: [
    ...(refused.length ? refused.slice(-10).map((d) => `- ${s(d.requested)} — ${s(d.rule)}`) : ['- 이 세션에서 거부된 호출은 없습니다. 2절의 금지 범위는 계속 적용됩니다.']),
    '- 이전 승인은 이어지지 않습니다. 재개하면 모든 호출이 다시 분류되고 호스트가 다시 확인합니다.',
    // INV-005: what this mod cannot refuse is disclosed here as in /agentctl policy, never silent.
    '- 한계: 호스트가 이 mod의 훅을 건너뛰면 (워커 충돌, mod 비활성화) 여기서는 아무것도 거부하지 않습니다. 다른 mod가 tool.check에서 판정을 바꿀 수 있습니다. 확실한 규칙은 permissions.deny에 두세요.',
  ] })
  return assemble(head, sec, CAPS.handoff)
}

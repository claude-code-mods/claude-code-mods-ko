import type { EngineInterface, SessionSendResult } from 'claude-code'

/** Native bindings only. No registration, scheduler, scanner or completion engine.
 * The Python coordinator is not connected yet. Its validator remains authoritative.
 * ListAgents identities must be resolved by the explicitly scoped provider, never
 * inferred from a display name. Native send proves queue acceptance, not reading.
 */
export type JsonRecord = Record<string, unknown>
export type Inventory = {
  enumerationId: string
  sessions: string[]
  nextCursor: null
  complete: boolean
  total: number
  gaps: string[]
}
export type DurableState = {
  get(key: string): Promise<JsonRecord | null>
  reserve(key: string, record: JsonRecord): Promise<boolean>
  put(key: string, record: JsonRecord): Promise<void>
}
type Listing = {
  listing: string
  sections?: { kind: string; total: number; rows: {
    name?: string; ref?: string; id?: string; type?: string; status?: string
  }[] }[]
  notes?: { kind: string; text: string }[]
}
export type SnapshotProvider = {
  /** Must account for every native row, unreadable source, note and exclusion.
   * Workflow/self exclusions and authenticated row-to-session mapping are the
   * provider's responsibility. Exclusions/unreadable sessions are explicit gaps.
   * A display name, busy flag, role=user or latest intentText is not authority.
   */
  inventory(listing: Listing, selfSessionId: string, toolRef: unknown): Promise<Inventory>
  readSnapshot(sessionId: string): Promise<JsonRecord>
  /** Return the coordinator's binding(snapshot), including its snapshotHash.
   * Do not ask the model to compute hashes or infer a binding from transcript text.
   */
  binding(snapshot: JsonRecord): Promise<JsonRecord>
  /** Must reject self/workflows, pause/stop/approval, unknown authority/owner,
   * stale bindings and unsupported scope. Check authenticated human provenance,
   * ownership, true stall/false-completion, and complete source manifests.
   * Hold the provider's native conditional-enqueue guard while calling enqueue.
   * Return false without enqueue when that guarantee cannot be established.
   * A mutex alone does not stop external session mutations: do not claim it does.
   */
  checkAndEnqueue(input: {
    sessionId: string; action: JsonRecord; expected: JsonRecord; idempotencyKey: string
  }, enqueue: () => Promise<SessionSendResult>): Promise<boolean>
}

function object(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
function nonempty(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

export function createHostAdapter(
  $: EngineInterface, snapshotProvider: SnapshotProvider, durableState: DurableState, maxTokens = 8192,
) {
  return {
    state: durableState,
    async list_sessions(cursor: string | null): Promise<Inventory> {
      if (cursor !== null) throw new Error('ListAgents에는 페이지네이션 커서가 없습니다')
      const response = await $.tool.call({ tool: 'ListAgents' })
      if (response.deny || response.isError || !response.result) throw new Error('ListAgents를 사용할 수 없습니다')
      const listing = response.result
      const self = await $.session.id()
      const manifest = await snapshotProvider.inventory(listing, self, response.ref)
      const gaps = [...manifest.gaps]
      if (!listing.sections) gaps.push('ListAgents 구조화된 범위 정보가 없습니다')
      for (const section of listing.sections ?? []) {
        if (section.total !== section.rows.length) gaps.push('ListAgents 섹션 범위가 불완전합니다')
      }
      if (listing.notes?.length) gaps.push('ListAgents 메모의 소스 범위를 조정해야 합니다')
      if (!nonempty(manifest.enumerationId) || manifest.nextCursor !== null ||
          manifest.total !== manifest.sessions.length || new Set(manifest.sessions).size !== manifest.sessions.length ||
          manifest.sessions.some(id => !nonempty(id) || id === self)) gaps.push('범위가 지정된 목록이 유효하지 않습니다')
      return { ...manifest, complete: manifest.complete === true && gaps.length === 0, gaps }
    },
    async read_snapshot(sessionId: string): Promise<JsonRecord> {
      if (sessionId === await $.session.id()) throw new Error('감독 세션은 자신을 대상으로 할 수 없습니다')
      return snapshotProvider.readSnapshot(sessionId)
    },
    async judge(snapshot: JsonRecord, instructions: string): Promise<JsonRecord> {
      const binding = await snapshotProvider.binding(snapshot)
      for (const key of ['sessionId', 'generation', 'contractHash', 'evidenceSetHash', 'transcriptIdentity']) {
        if (binding[key] !== snapshot[key]) throw new Error('코디네이터 바인딩이 일치하지 않습니다')
      }
      if (!nonempty(binding.snapshotHash)) throw new Error('코디네이터 콘텐츠 해시가 없습니다')
      const model = await $.session.model()
      const result = await $.model.complete({ model, system: instructions,
        prompt: JSON.stringify({ snapshot, binding }), maxTokens, timeoutMs: 60000 })
      if (!result.isAnswered) throw new Error(`판정 응답 없음: ${result.reason}`)
      const parsed: unknown = JSON.parse(result.text)
      if (!object(parsed)) throw new Error('판정이 JSON 객체를 반환하지 않았습니다')
      // Runtime-reported usage/provenance supersede model-authored telemetry.
      return { ...parsed, usage: { ...result.usage },
        // Local native-call correlation is not a provider request ID.
        reviewerProvenance: { model, correlationId: crypto.randomUUID(), source: 'model.complete' } }
    },
    async nudge(sessionId: string, action: JsonRecord, expected: JsonRecord, idempotencyKey: string) {
      if (sessionId === await $.session.id() || action.ownerSessionId !== sessionId ||
          action.kind !== 'continue' || !nonempty(action.text) || !nonempty(idempotencyKey) ||
          expected.sessionId !== sessionId || typeof expected.expiresAt !== 'number' ||
          !Number.isFinite(expected.expiresAt) || expected.expiresAt <= Date.now() / 1000) throw new Error('알림 대상, 동작 또는 기한이 유효하지 않습니다')
      let calls = 0
      let outcome: SessionSendResult | undefined
      const allowed = await snapshotProvider.checkAndEnqueue(
        { sessionId, action, expected, idempotencyKey }, async () => {
          if (++calls !== 1) throw new Error('중복 큐 추가 콜백은 거부됩니다')
          if ((expected.expiresAt as number) <= Date.now() / 1000) throw new Error('큐에 추가하기 전에 알림이 만료되었습니다')
          outcome = await $.session.send({ to: { sessionId }, text: action.text as string })
          return outcome
        })
      if (!allowed && calls === 0) return { status: 'refused', sessionId, idempotencyKey }
      if (!allowed || calls !== 1 || !outcome) return { status: 'unknown', sessionId, idempotencyKey }
      return { status: outcome.isDelivered ? 'queued' : 'refused', sessionId, idempotencyKey,
        nativeReceipt: outcome, receiptRef: null }
    },
  }
}

import { providerManifests } from './provider.ts';
import type { UsageSnapshot } from './receipts.ts';

type UsageProvider = string;
interface ProviderUsageRow {
  id: UsageProvider;
  name: string;
  status: 'ready' | 'unavailable' | 'disabled' | 'error';
  summary: string;
  details: string[];
  url?: string;
}
export interface ProviderUsageView {
  updatedAt: string;
  providers: ProviderUsageRow[];
}
export interface ProviderUsageOptions {
  enabled: readonly string[];
  /** Each connected provider's own account reader, keyed by provider name. */
  readers?: Readonly<Record<string, ProviderUsageReader | undefined>>;
  now?: () => number;
}
export type ProviderUsageReader = (session: string) => Promise<{
  summary: string;
  details: string[];
  status?: ProviderUsageRow['status'];
}>;
function sessionLines(snapshot: UsageSnapshot, provider: UsageProvider): string[] {
  const entries = snapshot.entries.filter((entry) => entry.provider === provider);
  const totals = { input: 0, output: 0, read: 0, write: 0, requests: 0, calls: 0 };
  for (const entry of entries) {
    totals.input += entry.usage.input_tokens;
    totals.output += entry.usage.output_tokens;
    totals.read += entry.usage.cache_read_input_tokens;
    totals.write += entry.usage.cache_creation_input_tokens;
    totals.requests += entry.requests;
    totals.calls += entry.usage.model_calls ?? 0;
  }
  const count = (value: number) => value.toLocaleString('ko-KR');
  const context = snapshot.contexts?.[provider];
  const window = context
    ? `컨텍스트 ${count(context.input_tokens + context.cache_read_input_tokens + context.cache_creation_input_tokens)} · `
    : '';
  const calls = totals.calls ? ` · 모델 호출 ${count(totals.calls)}회` : '';
  return [
    `이 세션: 완료된 요청 ${count(totals.requests)}건${calls}`,
    `토큰: ${window}입력 ${count(totals.input)} 소비 · 캐시 읽기 ${count(totals.read)}`,
    `출력: ${count(totals.output)} · 캐시 기록 ${count(totals.write)}`,
    ...(entries.some((entry) => entry.source !== 'provider')
      ? ['추정치 또는 확인할 수 없는 수치가 포함되어 있습니다. 출처는 세션 영수증을 참조하세요.']
      : []),
  ];
}

/** Read-only account lookups are cached and coalesced independently of model requests. */
export class ProviderUsageDashboard {
  private readonly cache = new Map<string, { expires: number; view: ProviderUsageView }>();
  private readonly pending = new Map<string, Promise<ProviderUsageView>>();
  private readonly now: () => number;
  private readonly options: ProviderUsageOptions;
  constructor(options: ProviderUsageOptions) {
    this.options = options;
    this.now = options.now ?? Date.now;
  }

  async read(
    session: string,
    snapshot: UsageSnapshot,
    refresh = false,
  ): Promise<ProviderUsageView> {
    const active = this.pending.get(session);
    if (active) {
      return this.withSession(await active, snapshot);
    }
    const saved = this.cache.get(session);
    if (!refresh && saved && saved.expires > this.now()) {
      return this.withSession(saved.view, snapshot);
    }
    if (this.pending.size >= 32) {
      throw new Error('동시 사용량 조회가 너무 많습니다');
    }
    const request = this.collect(session);
    this.pending.set(session, request);
    try {
      const view = await request;
      if (this.cache.size >= 32) {
        const oldest = this.cache.keys().next().value;
        if (oldest !== undefined) {
          this.cache.delete(oldest);
        }
      }
      this.cache.set(session, { expires: this.now() + 30000, view });
      return this.withSession(view, snapshot);
    } finally {
      this.pending.delete(session);
    }
  }

  private async collect(session: string): Promise<ProviderUsageView> {
    const rows = await Promise.all(
      providerManifests().map(async ({ name, usage }): Promise<ProviderUsageRow> => {
        const row: ProviderUsageRow = {
          id: name,
          name: usage.name,
          ...(usage.url ? { url: usage.url } : {}),
          status: 'unavailable',
          summary: '계정 사용량을 확인할 수 없습니다',
          details: usage.unavailable,
        };
        if (!this.options.enabled.includes(name)) {
          return {
            ...row,
            status: 'disabled',
            summary: '이 실행 프로그램에서는 활성화되지 않음',
            details: [],
          };
        }
        const reader = this.options.readers?.[name];
        if (!reader) {
          return row;
        }
        try {
          const data = await reader(session);
          return { ...row, status: 'ready', ...data };
        } catch {
          return {
            ...row,
            status: 'error',
            summary: '공급자 사용량을 새로고침하지 못했습니다',
            details: ['공급자 로그인 또는 연결을 확인한 뒤 새로고침하세요.', ...row.details],
          };
        }
      }),
    );
    return { updatedAt: new Date(this.now()).toISOString(), providers: rows };
  }

  private withSession(view: ProviderUsageView, snapshot: UsageSnapshot): ProviderUsageView {
    return {
      ...view,
      providers: view.providers.map((row) => ({
        ...row,
        details: [...row.details, ...sessionLines(snapshot, row.id)],
      })),
    };
  }
}

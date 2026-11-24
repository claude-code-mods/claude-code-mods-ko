import type { UsagePaneProps } from './usage-view.ts';

/** Only account summaries enter model context; receipts and worker data stay in the menu. */
export function quotaAdvice(snapshot?: UsagePaneProps): string {
  const instructions = [
    '[Multi 할당량 고려 모델 선택 — 권고]',
    '서브에이전트 모델을 선택하기 전에, 작업에 맞는 모델을 제공하는 활성 공급자 중 구독 사용량이 가장 낮은 곳을 우선하세요.',
    '사용자가 명시적으로 선택한 모델은 존중하세요. 더 많이 사용한 모델이 작업에 더 적합하면 선택할 수 있습니다. 이 훅은 선택을 제한하지 않습니다.',
    '할당량 초기화를 기다리지 말고 현재 사용량을 기준으로 판단하세요. 유료 초과 사용보다 구독에 포함된 용량을 우선하세요.',
    '백분율은 공급자별 별도 할당량을 나타내며 같은 토큰 예산이 아닙니다. 확인되지 않은 할당량이 곧 남은 할당량은 아닙니다.',
  ];
  if (!snapshot) {
    return [
      ...instructions,
      '현재 할당량을 가져오지 못했습니다. 작업 요구 사항에 따라 선택하세요.',
    ].join('\n');
  }
  const rows = snapshot.providers.filter((provider) => provider.status !== 'disabled');
  return [
    ...instructions,
    `계정 사용량 확인: ${snapshot.updatedAt}:`,
    ...rows.map(
      (provider) =>
        `${provider.name}: ${provider.status === 'ready' ? provider.summary : '할당량 확인 불가'}`,
    ),
  ].join('\n');
}

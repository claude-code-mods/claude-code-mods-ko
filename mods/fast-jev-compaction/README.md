# fast-jev-compaction

> 한국어판은 claude-code-mods-ko 프로젝트가 번역했습니다. 원작자와 라이선스는 문서 끝에 있으며, 영어 원문은 [README.en.md](README.en.md)에서 볼 수 있습니다.

Jev의 판단으로 압축 요약을 대체하는 Claude Code 플러그인입니다. 모든 도구 호출과 결과를 한 번의 빠른 요청으로 평가하고, 더 이상 필요하지 않은 것은 버리거나 잘라 내며, 남는 것은 모두 원문 그대로 유지합니다. npm 라이브러리로도 사용할 수 있습니다.

## 무엇을, 왜

대부분의 컨텍스트 압축은 오래된 턴을 LLM에 요약하게 합니다. 요약은 손실이 있어, 나중에 중요해질 수 있는 파일 경로, 정확한 오류, 제약, 명령이 사라질 수 있습니다. 이 라이브러리는 아무것도 다시 쓰지 않습니다. Jev가 더 이상 필요 없다라고 말한 도구 호출과 도구 결과만 삭제하며, 전체 대화를 보여 주면서 Jev에 묻습니다. 사용자와 어시스턴트 텍스트는 원문 그대로 순서대로 유지됩니다.

이 저장소는 npm 패키지(`src/`)이자 그 패키지를 사용해 Claude Code의 내장 압축 요약을 원본 메시지로 대체하는 Claude Code 플러그인(`hooks/`, `.claude-plugin/`)입니다.

## 동작 방식

1. 모든 `tool_use`는 `tool_use_id`로 해당 `tool_result`와 짝지어집니다. 첫 메시지와 가장 최근 `preserveRecentMessages`개 메시지의 호출은 고정되어 절대 변경되지 않습니다.
2. Jev에 보내는 **상태**는 지금까지의 전체 대화로, 오래된 것부터 순서대로이며 모든 도구 결과는 짧은 메모(`ok, 4213 chars (omitted)`)로 대체됩니다. 도구 입력과 텍스트는 포함되며 아무것도 요약되지 않습니다.
3. 상태는 `maxStateTokens`(기본값 25k)에 맞도록 단계적으로 축소되며, 각 단계는 이전 단계로 부족했을 때만 적용됩니다. 도구 입력을 1000자, 200자, 60자로 차례로 자르고, 긴 텍스트는 앞+뒤만 남기며(오래된 비고정 메시지부터), 오래된 비고정 메시지는 `[… N chars omitted …]` 메모로 합치고, 오래된 도구 호출은 한 줄씩으로 줄이고(`t12 Read file_path=src/a.ts → ok 480ch`), 호출이 없는 오래된 메시지는 제외하며, 호출만 있는 오래된 메시지 연속은 한 항목으로 묶습니다. 그래도 맞지 않으면 압축이 오류를 던집니다. 토큰 수는 토크나이저 없이 추정합니다(6글자당 한 단어, 숫자 하나당 반 토큰, 그 외 기호당 약 1토큰). Jev가 보고하는 수치보다 약간 높게 나오도록 보정했습니다.
4. 고정되지 않은 각 호출에 대해 Jev는 두 개의 `noul` 질문을 받습니다. **호출**을 유지해야 하는지(호출했다는 사실과 입력이 여전히 중요함), **결과**를 원문 그대로 유지해야 하는지(내용이 여전히 필요하고 도구를 다시 실행해도 같은 결과가 나오지 않음).
5. 질문은 상태와 질문의 합이 `maxRequestTokens`(기본값 30k, Jev의 32k 요청 제한 아래) 이하가 되도록 여러 요청으로 나뉩니다. 모든 요청에 동일한 전체 상태가 다시 전송되고, 요청은 동시에 실행된 뒤 답변이 합쳐집니다.
6. 호출별 판단은 `keepThreshold` 기준입니다.
   - `keepResult ≥ threshold` → 호출과 결과 모두 유지;
   - 아니면 `keepCall ≥ threshold` → 호출은 유지하고 결과는 첫 `truncateHeadChars`자와 한 줄 메모로 자름;
   - 아니면 → 호출과 결과를 함께 삭제.
7. 메시지 목록을 다시 만듭니다. 내용이 모두 사라진 메시지는 제거하고, 변경되지 않은 메시지는 같은 객체로 반환하며, 호출 없는 결과가 남지 않습니다.

Jev 실패, 잘못된 형식의 답변, 키 누락, 맞출 수 없는 기록은 오류를 던집니다. 무엇으로 대체할지는 호출자(또는 Claude Code 훅)가 결정합니다.

## 설치 및 사용

```sh
npm install fast-jev-compaction
export TYPESAFE_API_KEY=...
```

```ts
import { compactMessages, reductionRatio, type Message } from 'fast-jev-compaction';

const transcript: Message[] = [
  { role: 'user', text: 'Fix the failing test. Never edit src/generated.', toolUses: [] },
  {
    role: 'assistant',
    text: '',
    toolUses: [{ tool_use_id: 'toolu_1', tool: 'Read', input: { file_path: 'src/a.ts' } }],
  },
  { role: 'user', text: '', toolUses: [], toolResults: [{ tool_use_id: 'toolu_1', text: '…file…' }] },
  // …
];

const result = await compactMessages(transcript, { preserveRecentMessages: 4 });
console.log(result.messages, result.decisions, result.stats);
if (reductionRatio(result) < 0.25) {
  // not worth it: keep the original transcript, or summarize instead
}
```

`Message`는 Claude Code `SessionMessage`의 부분 집합이므로 세션 트랜스크립트를 그대로 넘길 수 있습니다.

자신만의 전송 계층을 쓰려면 `JevAsker`(`ask(state, questions)` 메서드 하나)를 구현하고 `compact(messages, asker, options)`를 호출하세요. `buildJevRequest`와 `parseJevResponse`가 HTTP 요청 본문과 응답 검증을 제공합니다. 구성 요소(`collectToolCalls`, `fitState`, `batchCalls`, `decideCall`, `applyDecisions`)도 내보내집니다.

`apiKey`의 기본값은 `process.env.TYPESAFE_API_KEY`입니다. 키를 커밋하거나 소스 파일에 넣지 마세요.

## 옵션

| 옵션 | 기본값 | 설명 |
| --- | --- | --- |
| `apiKey` | `TYPESAFE_API_KEY` | TypeSafe API 키 (`compactMessages`/`JevClient`) |
| `model` | `jev-latest` | Jev 모델 이름 |
| `baseUrl` | `https://api.typesafe.ai/v1/systemone` | System One 엔드포인트 |
| `fetch` | 네이티브 `fetch` | 테스트를 위해 주입할 수 있는 fetch 구현 |
| `goal` | 최근 사용자 프롬프트 3개 | 상태에 포함되는 진행 중 작업 설명 |
| `keepThreshold` | `0.5` | 호출이나 결과가 유지되기 위한 최소 유지 확률 |
| `preserveRecentMessages` | `6` | 절대 변경하지 않는 최근 메시지 수(첫 메시지는 항상 유지) |
| `maxStateTokens` | `25000` | 상태의 예상 토큰 상한 |
| `maxRequestTokens` | `30000` | 상태와 한 배치의 질문에 대한 예상 상한 |
| `truncateHeadChars` | `300` | 결과를 버릴 때 메모 앞에 남기는 문자 수 |

`result.stats`는 전후 메시지·문자 수, 이유별 판단 횟수, 예상 토큰 기준 상태 크기, 필요한 축소 단계, 요청 수를 보고합니다.

## 제한

- 도구 호출과 결과만 후보이며, 텍스트 메시지는 출력에서 삭제되거나 짧아지지 않습니다(Jev가 보는 상태에서만 축약됨).
- 토큰 크기는 토크나이저가 아닌 문자 수로 추정합니다.
- 보정은 요청 수준입니다. 확률이 결과 삭제가 안전하다는 증거는 아닙니다. 어시스턴트는 언제든 도구를 다시 실행할 수 있습니다.
- 모든 요청에 전체 상태가 반복되므로, 상한에 가까운 기록에서는 몇 개 질문마다 한 요청이 발생합니다.

## Claude Code 플러그인

저장소 루트는 Claude Code 함수 훅 플러그인입니다. `hooks/fast-jev.ts`는 `session.compact` 트랜스크립트를 `src/`로 넘기는 얇은 어댑터이며, 오류나 압축률 부족 시 Claude Code 내장 요약으로 대체합니다. 설정과 Claude Code 2.1.274 타입 참고는 [`hooks/README.md`](hooks/README.md)를 참고하세요.

### Claude Code에 설치

함수 훅은 Claude Code 초기 액세스 기능(2.1.274+)이므로 Claude Code가 실행되는 곳에 옵트인 플래그를 설정해야 합니다. 예: `~/.claude/settings.json`:

```json
{ "env": { "CLAUDE_CODE_ENABLE_FUNCTION_HOOKS": "1", "TYPESAFE_API_KEY": "<your key>" } }
```

그다음 이 저장소를 플러그인 마켓플레이스로 추가하고 플러그인을 설치합니다. 셸에서 하거나 세션 안에서 슬래시 명령으로 할 수 있습니다.

```sh
claude plugin marketplace add tamaratran/fast-jev-compaction
claude plugin install fast-jev-compaction@fast-jev-compaction
```

설치 시 플러그인 옵션(API 키, 임계값, `truncateHeadChars` 등)을 묻습니다. 환경의 `TYPESAFE_API_KEY`를 사용하려면 기본값으로 두세요. Claude Code를 재시작하거나 `/reload-plugins`를 실행하세요. 이후 `/compact`(자동 압축 포함)가 Jev를 거칩니다. 정리된 기록이 내장 요약을 대체하면 토스트에 `fast-jev-compaction: kept N/M messages, no summary (…)`가 표시되고, Jev가 충분히 줄이지 못하면(짧은 세션 또는 실패 시) `fallback to built-in summary (…)`가 표시됩니다.

설치 없이 체크아웃에서 실행하려면 저장소 루트에서 `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1 claude --plugin-dir .`를 실행하세요. 게시 단계는 필요 없으며 마켓플레이스는 저장소의 `.claude-plugin/marketplace.json`일 뿐입니다.

한국어 마켓플레이스에서는 다음 명령으로 설치합니다.

```
/plugin install fast-jev-compaction@claude-code-mods-ko
```

## 개발

```sh
npm install
npm run typecheck        # library + hook
npm test
npm run build
npm run validate:plugin  # claude plugin validate
TYPESAFE_API_KEY="$(cat ~/.typesafe_key)" npm run demo
```

단위 테스트는 가짜 Jev를 사용하며 TypeSafe에 접속하지 않습니다. 데모가 실제 네트워크 확인입니다.

## 애니메이션 데모 (macOS)

`demo/JevDemo`는 Claude Code 스타일 터미널 안에서 압축 흐름을 각색해 재생하는 작은 SwiftUI 네이티브 앱입니다. 준비된 트랜스크립트의 도구 호출이 평가되고, Jev가 버리도록 한 결과와 호출이 빨간색으로 바뀌어 사라지며, 나머지는 원문 그대로 남습니다. API를 호출하지 않으며 화면 녹화를 위해 존재합니다.

```sh
demo/JevDemo/build.sh   # builds demo/JevDemo/build/JevDemo.app and launches it
```

앱에서 스페이스를 누르면 처음부터 다시 재생합니다.

## 출처 및 라이선스

- 원작자: [tamaratran](https://github.com/tamaratran/fast-jev-compaction)
- 원본 저장소: https://github.com/tamaratran/fast-jev-compaction
- 라이선스: MIT
- 한국어 번역 및 UI 현지화: claude-code-mods-ko 프로젝트

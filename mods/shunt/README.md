# shunt

> 한국어판은 claude-code-mods-ko 프로젝트가 번역했습니다. 원작자와 라이선스는 문서 끝에 있으며, 영어 원문은 [README.en.md](README.en.md)에서 볼 수 있습니다.

사용량을 프롬프트 위 띠에 표시하는 **Claude 모드**입니다. [함수 훅](https://github.com/anthropics/claude-code/issues/91870) 모듈 형태의 Claude Code 플러그인으로, shunt 게이트웨이에서는 [shunt](https://github.com/pleaseai/shunt)의 공유 계정 풀을, 그 외에는 세션 자체의 Claude 사용량 한도를 보여 주며, `/shunt:usage`로 풀의 전체 내역에 답합니다.

```
shunt · 5H 5% ↻1h 41m · WK 46% ↻1d 7h · Fable 31% ↻1d 7h ⚠ anthropic degraded
```

```
> /shunt:usage

shunt: pool — degraded   http://127.0.0.1:3001

  5h    ▓▓▓▓▓▓░░░░  62% left   resets 04:11
  7d    ▓▓▓▓▓▓▓▓░░  81% left   resets Sun 01:11
  fable ▓▓░░░░░░░░  19% left   resets Sun 01:11

  claude  ok         5h  71%  7d  84%  fable  19%
  codex   exhausted  5h   0%  7d  40%  fable    —

  headroom left, averaged over the pool's accounts; a shared figure, not a promise about your next request
```

모드는 게이트웨이의 [`GET /usage`](https://shunt.sh/reference/endpoints/) 엔드포인트를 읽어 출력합니다. 명령에 직접 답합니다. 훅이 `next`를 호출하지 않고 반환하므로 모델로 아무것도 전송되지 않으며, 답변에 토큰이 소모되지 않습니다.

## 사용량 띠

shunt 게이트웨이에서는 띠에 `shunt ·` 태그와 함께 풀이 표시됩니다. 각 수치는 윈도우에서 **사용된** 양입니다. `1 - remaining`이며, 명령이 headroom으로 보고하는 풀 전체 평균과 같습니다. 그다음 그 윈도우의 가장 이른 초기화까지 남은 시간이 나옵니다. Claude Code 자체의 `/usage`와 shunt에서 읽는 띠처럼 읽히도록 남은 양이 아니라 사용량을 표시합니다. 수치는 70%부터 호박색, 90%부터 빨간색이 됩니다. 상태가 `ok`가 아닌 각 풀 제공자는 끝에 표시됩니다(`⚠ anthropic degraded`: `degraded`는 호박색, `exhausted` 또는 `capped`는 빨간색). 제공자가 나열되지 않으면 풀 자체가 표시됩니다. 어떤 계정도 보고하지 않는 윈도우는 생략됩니다.

shunt가 아닐 때(게이트웨이가 없거나, `GET /usage`에 404로 응답하거나, 성공 응답이 풀 보고서가 아니거나, 풀에 제공자가 없을 때) 띠는 태그 없이 세션 자체의 사용량 한도를 표시합니다. `$.session.usage()`와 `session.measure`가 보고하는 값입니다.

```
5H 5% ↻1h 41m · WK 46% ↻1d 7h
```

shunt에서는 세션 시작 시, 이후 1분마다, 그리고 각 턴 후(풀이 방금 소모된 직후) `GET /usage`를 읽습니다. 마지막으로 응답한 풀 계정에서 나온 세션 자체 한도는 무시합니다. 거부된 토큰(401 또는 403), 연결할 수 없는 게이트웨이, 다른 오류 상태, `shunt gateway token` 도우미 실패는 shunt의 장애이므로 대체하지 않고 표시합니다. `shunt · ⚠ credential refused`, 도우미의 경우 `shunt · ⚠ gateway login unavailable`입니다. 게이트웨이도 한도도 없다면(Anthropic에 직접 API 키를 보내는 경우) 띠는 아무것도 그리지 않습니다. 다른 플러그인이 띠에 그리는 내용은 그 왼쪽에 그대로 남습니다.

`[-]`(ctrl+x ctrl+a)로 그 세션 동안 띠를 접거나, 아래의 `usageBand` 옵션으로 끌 수 있습니다.

## 수치 읽기

`remaining`은 풀의 합산 용량 중 아직 **사용 가능한** 비율입니다. 따라서 `62%`는 headroom의 62%가 남았다는 뜻이지, 62%를 썼다는 뜻이 아닙니다. 해당 윈도우를 보고하는 비활성화되지 않은 계정에 대해 `mean(clamp(cap - utilization, 0, 1))`로 계산합니다. `cap`은 그 윈도우의 계정별 `max_utilization` 상한입니다(설정되지 않았으면 `100%`). 소진된 계정 9개와 상한 없는 새 계정 1개는 `10%`로 읽히며, 50% 상한 아래에서 44%인 계정은 `6%`만 counted됩니다. 상한에 이미 해당 윈도우의 요청에서 제외된 계정은 0으로 셉니다. 5h 또는 7d 상한은 Fable을 포함한 모든 요청에서 그 계정을 제외합니다.

이것은 **풀 전체 집계이며 예측이 아닙니다.** 라우팅은 가용성, 모델, 세션 선호도, 우선순위도 고려하므로 수치가 양호하다고 다음 요청이 받아들여진다는 보장은 아닙니다. 라우팅을 고려한 최악의 경우는 `GET /api/oauth/usage`를 사용하세요.

| 윈도우 | 범위 |
| ------- | -------------- |
| `5h` | 롤링 5시간 세션 윈도우 |
| `7d` | 공유 주간 윈도우 |
| `fable` | Fable 범위의 주간 윈도우(`7d_oi`) |

비활성 계정이 하나도 보고하지 않는 윈도우는 `—`로 표시됩니다. ChatGPT/Codex 계정은 `x-codex-*` 응답 헤더에서 `5h`와 `7d`를 채우며 자체 Fable 신호는 없습니다.

`pool`은 풀에 있는 모든 제공자의 집계이며, 아래 행은 제공자별 같은 집계입니다. 따라서 특정 제공자로 라우팅된 세션은 혼합 수치 대신 그 제공자의 headroom을 볼 수 있습니다. 엔드포인트에는 계정 이름, 수, 우선순위, 계정별 수치가 절대 포함되지 않습니다. 그 상세는 관리자 전용 `GET /admin/api/pool` 뒤에 있습니다.

## 사전 준비

1. **Claude Code를 게이트웨이로 향하게 합니다.** 이미 라우팅을 위해 하고 있는 방식입니다.

   ```bash
   export ANTHROPIC_BASE_URL=http://127.0.0.1:3001
   export ANTHROPIC_AUTH_TOKEN=<your client token>
   ```

2. **게이트웨이에서 엔드포인트를 켭니다.** `GET /usage`는 옵트인이며 `shunt.toml`의 `[server.usage]` 테이블 곁에 `[server.auth]`(클라이언트 토큰) 또는 `[server.gateway]`(게이트웨이 로그인)이 필요합니다.

   ```toml
   [server.auth]

   # Presence alone opts in; the table takes no keys.
   [server.usage]
   ```

   `[server.auth]` 대신 `[server.gateway]`를 쓰면 아래의 [`shunt gateway claude` 세션](#shunt-gateway-claude-sessions)을 참고하세요. `[server.auth]`는 토큰을 TOML이 아니라 환경에서 가져옵니다. 기본값은 `SHUNT_CLIENT_TOKENS`이며 `name:token` 쌍입니다. 설정하지 않으면 게이트웨이가 시작되지 않습니다. 위에서 `ANTHROPIC_AUTH_TOKEN`으로 설정한 것과 같은 토큰을 사용해 게이트웨이가 실행되는 곳에서 내보내세요.

   ```bash
   export SHUNT_CLIENT_TOKENS="claude-code:<your client token>"
   ```

3. **함수 훅을 켠 상태로 Claude Code를 실행합니다.** 이 기능은 초기 액세스 단계입니다.

   ```bash
   CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1 claude
   ```

3단계가 없으면 띠가 없으며, 명령은 존재하지만 도구 호출로 엔드포인트를 읽도록 모델에 요청하는 `commands/usage.md`로 대체됩니다.

## 설치

```
/plugin marketplace add pleaseai/shunt
/plugin install shunt@shunt
```

한국어 마켓플레이스에서는 다음 명령으로 설치합니다.

```
/plugin install shunt@claude-code-mods-ko
```

## 구성

옵션 하나가 `/config`의 한 행입니다(settings.json의 `pluginConfigs` 아래에 저장됨).

| 옵션 | 기본값 | 목적 |
| ------ | ------- | ------- |
| `usageBand` | `true` | 프롬프트 위에 띠를 표시합니다. 끄면 모드가 띠를 등록하지 않고 폴링도 하지 않으며, `/shunt:usage`는 여전히 응답합니다 |

모드는 환경 변수 다섯 개를 읽기만 하고 쓰지 않습니다. 기본적으로 세션의 자격 증명을 세션이 이미 모든 메시지를 보내는 게이트웨이로 보내므로, 세션이 이미 사용하지 않던 호스트에는 도달하지 않습니다. `SHUNT_BASE_URL`이 유일한 의도적 예외로, 지정한 게이트웨이를 가리킵니다. base URL이 전혀 없으면 자격 증명을 Anthropic API로 보내지 않기 위해 아무것도 묻지 않습니다.

| 변수 | 목적 |
| -------- | ------- |
| `SHUNT_BASE_URL` | 게이트웨이 base URL. `ANTHROPIC_BASE_URL`을 재정의함 |
| `ANTHROPIC_BASE_URL` | 이 세션이 이미 라우팅하는 게이트웨이 |
| `SHUNT_TOKEN` | 클라이언트 토큰. 아래 둘을 모두 재정의하며 `Authorization: Bearer`로 전송됨 |
| `ANTHROPIC_AUTH_TOKEN` | Claude Code가 보내는 대로 `Authorization: Bearer`로 전송됨 |
| `ANTHROPIC_API_KEY` | Claude Code가 보내는 대로 `x-api-key`로 전송됨 |

`SHUNT_BASE_URL`을 사용하면 트래픽은 다른 게이트웨이로 라우팅하면서 한 게이트웨이의 풀을 읽을 수 있습니다.

### `shunt gateway claude` 세션

`shunt gateway claude`는 Claude Code에 넘기는 환경에서 `ANTHROPIC_AUTH_TOKEN`과 `ANTHROPIC_API_KEY`를 지우고, 대신 `apiKeyHelper`를 `shunt gateway token`에 연결합니다. Claude Code는 도우미의 출력을 직접 소비하며 다시 내보내지 않습니다. 따라서 위 변수 어디에도 자격 증명이 없으면 모드는 병합된 설정(`--settings` 포함)을 읽고, `apiKeyHelper`가 shunt 자체의 것일 때(`shunt gateway token`, 실행 프로그램이 기록한 이름 또는 경로) 셸 없이 직접 실행해 출력하는 게이트웨이 로그인 토큰을 `Authorization: Bearer`로 보냅니다. 셸이 없으므로 따옴표 없는 도우미 경로의 첫 `~/`는 모드가 직접 홈 디렉터리(`HOME`, 없으면 `USERPROFILE`)로 확장합니다. 따옴표로 감싼 `'~/…'`는 셸처럼 그대로 유지됩니다. 로그인은 세션이 통신하는 게이트웨이(`ANTHROPIC_BASE_URL`)의 것이므로 `SHUNT_BASE_URL`이 설정되지 않았거나 같은 base URL일 때만 전송됩니다. 공백과 끝의 슬래시를 제거한 뒤 문자열로 비교하므로 `localhost`와 `127.0.0.1`는 다르게 셉니다. 그렇지 않으면 도우미를 실행하지도 않습니다. 다른 게이트웨이의 풀을 읽으려면 그 게이트웨이의 `SHUNT_TOKEN`을 내보내세요. 도우미가 실패하면(0이 아닌 종료 코드, 출력 없음, 실행 불가) 띠에 `shunt · ⚠ gateway login unavailable`이 표시되고 `/shunt:usage`는 `shunt gateway login`을 실행하라고 안내합니다. 세션 자체 한도를 조용히 보여 주는 일은 없습니다.

토큰은 5분간 재사용되므로 1분마다 폴링해도 매번 도우미를 실행하지는 않습니다. 재사용한 토큰을 게이트웨이가 거부하면 버리고 도우미를 한 번 더 실행합니다. 갱신 과정에서 토큰이 회전되었을 수 있기 때문입니다. 그 밖의 `apiKeyHelper`(암호 관리자, 프롬프트를 띄우는 스크립트)는 절대 실행하지 않습니다.그렇게 하면 사용량 수치를 얻기 위해 몇 분마다 실행하게 되기 때문입니다. 그런 세션에서는 `[server.auth]` 클라이언트 토큰으로 `SHUNT_TOKEN`을 내보내세요. 그렇지 않으면 띠는 세션 자체 사용량 한도로 대체됩니다.

게이트웨이는 `GET /usage`에서 게이트웨이 로그인을 받아야 합니다. 이를 위해서는 그곳에서 `[server.gateway]` 로그인을 인증하는 shunt 빌드가 필요하며, `[server.gateway]`만 설정된 상태에서 `[server.usage]`만으로 충분합니다.

## `/usage`가 아니라 `/shunt:usage`인 이유

`/usage`는 Claude Code 내장 명령이며, 엔진은 플러그인이 내장 명령의 이름을 차지하지 못하게 합니다.

```
$.command.register: "/usage" refused: it is the built-in /usage
```

`$.command.register`는 전역 이름을 받습니다. 플러그인의 **마크다운** 명령은 플러그인에 의해 네임스페이스가 지정되므로, `shunt`라는 플러그인의 `commands/usage.md`는 `shunt:usage`로 나열되며 충돌이 없습니다. 훅 모듈은 그 이름의 `command.run`을 가로채 직접 답합니다.

## 구조

| 경로 | 내용 |
| ---- | ---------- |
| `hooks/register.tsx` | 훅: `shunt:usage`의 `command.run`과 띠의 `session.start`, `session.measure`, `turn.complete`, `ui.render` on `AbovePrompt` |
| `hooks/endpoint.ts` | 게이트웨이 URL과 자격 증명 헤더를 결정 |
| `hooks/report.ts` | `GET /usage` 본문을 방어적으로 읽음 |
| `hooks/reading.ts` | 한 번의 왕복을 전체·요약 보고서 또는 문제로 변환 |
| `hooks/views.ts` | 명령의 막대, 비율, 초기화 시각을 렌더링 |
| `hooks/band.ts` | 풀 또는 세션 자체 한도에서 띠의 칸, 경고, 수준, 카운트다운을 만듦 |
| `hooks/names.ts` | 명령 이름과 고정 문구 |
| `types/index.d.ts` | `$.state` 계약: 풀 스냅샷, 세션 한도, 띠가 사용하는 시계 |
| `commands/usage.md` | 명령과 함수 훅이 없을 때의 대체 수단 |
| `tests/*.spec.ts` | 순수 모듈에 대한 Vitest 스위트 |
| `tests/mod/*.test.tsx` | 훅에 대한 엔진 스위트, `claude plugin test`로 실행 |

## 개발

```bash
# 정적 부작용 분석: 어떤 이벤트를 훅으로 거는지, 어떤 $ 호출과
# 환경 변수를 만들고 읽는지 확인합니다.
CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1 claude plugin validate plugins/shunt

# 순수 모듈 스위트와 타입 검사(CI 게이트).
cd plugins/shunt && npm ci && npm run typecheck && npm test

# 엔진 자체에 대한 훅: 게이트웨이, 시계, 환경을 목으로 처리한 띠와 명령.
# Claude Code 바이너리가 필요하므로 CI에서는 실행하지 않습니다.
claude plugin test plugins/shunt

# 실제 게이트웨이에 대해 소스로 실행.
CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1 claude --plugin-dir plugins/shunt
```

`hooks/register.tsx`는 `claude-code`를 가져오는 유일한 훅 파일입니다. 타입 검사에는 엔진 자체의 `claude-code.d.ts`가 필요하며, Claude Code가 `/plugin-types`로 플러그인 개발자의 프로젝트에 기록합니다. 다른 모듈은 엔진에서 아무것도 가져오지 않으므로 그 파일 없이도 스위트가 실행됩니다. 같은 이유로 `tsconfig.json`은 `npm run typecheck`에서 `hooks/register.tsx`와 엔진 스위트인 `tests/mod`를 제외합니다. 이 제외는 실수가 아니라 의도이며, 그 한 파일을 타입 검사하려면 먼저 `/plugin-types`를 실행해야 합니다.

> 함수 훅은 초기 액세스 단계입니다. 훅 모듈은 활성화된 곳에서만 로드되며, 이 모드가 작성된 API는 사전 통지 없이 Claude Code 릴리스 사이에 바뀔 수 있습니다.

## 라이선스

MIT OR Apache-2.0 (shunt 프로젝트와 동일).

## 출처 및 라이선스

- 원작자: [pleaseai](https://github.com/pleaseai/shunt)
- 원본 저장소: https://github.com/pleaseai/shunt
- 라이선스: Apache-2.0
- 한국어 번역 및 UI 현지화: claude-code-mods-ko 프로젝트

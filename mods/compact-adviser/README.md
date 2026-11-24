<h1 align="center">compact-adviser</h1>

> 한국어판은 claude-code-mods-ko 프로젝트가 번역했습니다. 원작자와 라이선스는 문서 끝에 있으며, 영어 원문은 [README.en.md](README.en.md)에서 볼 수 있습니다.

<p align="center">
  <a href="https://github.com/kunchenguid/compact-adviser/blob/main/LICENSE"
    ><img
      alt="라이선스"
      src="https://img.shields.io/badge/license-MIT-green?style=flat-square"
  /></a>
  <a
    href="https://img.shields.io/badge/platform-macOS%20%7C%20Linux-blue?style=flat-square"
    ><img
      alt="플랫폼"
      src="https://img.shields.io/badge/platform-macOS%20%7C%20Linux-blue?style=flat-square"
  /></a>
  <a href="https://x.com/kunchenguid"
    ><img
      alt="X"
      src="https://img.shields.io/badge/X-@kunchenguid-black?style=flat-square"
  /></a>
  <a href="https://discord.gg/Wsy2NpnZDu"
    ><img
      alt="Discord"
      src="https://img.shields.io/discord/1439901831038763092?style=flat-square&label=discord"
  /></a>
</p>

**compact-adviser**는 한 가지 질문에 답하는 에이전트 플러그인입니다. 지금 `/compact`를 실행해야 할까요?

![Compact adviser 상태 줄: "Compact adviser: work appears completed or recorded. Run /compact to save tokens." 가 터미널 프롬프트 위에 표시됨](https://raw.githubusercontent.com/kunchenguid/compact-adviser/main/docs/hint-status-line.png)

[Jev](https://typesafe.ai)를 사용해 현재 세션이 압축해도 안전한 경계에 있는지 즉시 판단합니다.

`/compact`를 실행하라는 힌트를 주거나, Pi와 Claude Code에서는 옵트인했다면 적절한 시점에 자동으로 실행해 줍니다. Codex CLI와 Grok은 힌트만 제공합니다. 세션 밖에서는 `/compact`를 실행할 수 없습니다.

판단은 한 요청에 담긴 두 개의 한 문장짜리 Jev 질문(작업 단위가 끝났는지, 실습 작업인지 조율 작업인지)으로 이루어지며, 코드에서 하나의 점수로 조합합니다. 컨텍스트가 거의 비어 있을 때(약 10%까지) 힌트 기준선은 0.90이고, 약 90%가 찰 때까지 0.50으로 느슨해집니다. 아직 여유가 있을 때 잘못된 힌트가 가장 비싸기 때문입니다. "가득 참"이란 호스트가 압축하는 지점입니다. Claude Code에서는 자동 압축 임계값이고, 다른 곳에서는 모델 윈도우입니다. 훨씬 전에 압축하고 싶다면(긴 컨텍스트는 매 턴 비용이 더 듦) 컨텍스트 예산을 설정하세요. 그러면 컨텍스트가 예산과 그 지점 중 작은 쪽에 가까워질 때 기준선이 느슨해집니다. 자동 모드는 같은 조건에 첫 사용 확인을 더한 것입니다.

## 빠른 시작

사전 요구 사항: Node 22+(Codex와 Grok은 22.18+), 그리고 [Pi](https://pi.dev) 0.82.0 이상(**0.85.1**에서 검증), Claude Code 2.1.274 이상(**2.1.275**에서 검증), Codex CLI 0.153.0 이상(**0.153.4**에서 검증), 또는 [Grok Build](https://docs.x.ai/build/overview) 1.0.34 이상(**1.0.34**에서 검증) 중 하나, 그리고 [TypeSafe API 키](https://console.typesafe.ai/settings/keys)가 필요합니다. 실행 환경의 `TYPESAFE_API_KEY`로 제공하거나 세션 작업 디렉터리의 `./.env`에 넣으세요. Pi와 Claude Code는 설정에 저장할 수도 있고, Codex와 Grok은 외부 compact-adviser CLI를 제공합니다. Jev는 TypeSafe의 구조화된 의사결정 모델입니다. 이 패키지는 두 개의 한 문장 분류 질문만 하고 요약은 절대 요청하지 않습니다.

패키지를 설치하는 것은 키가 있고 다른 제품 조건도 통과했을 때 적격 체크포인트 컨텍스트를 TypeSafe로 보내는 데 동의하는 것입니다. `TYPESAFE_BASE`가 설정되면 그 컨텍스트와 키는 대신 그 주소로 전송됩니다.

### Pi

```sh
pi install npm:compact-adviser
```

Pi를 재시작하거나 `/reload`를 실행한 뒤 `/compact-adviser`를 실행하세요. `/compact-adviser status`에 `Key: env`, `Key: saved` 또는 `Key: .env`가 표시되어야 합니다.

git에서 설치하려면 `pi install git:github.com/kunchenguid/compact-adviser`를 사용하세요(프로젝트 로컬 설치는 `-l` 추가).

### Claude Code

이 플러그인은 환경에 `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1`이 필요한 실험적 기능인 Claude Mod를 사용합니다.

```sh
claude plugin marketplace add kunchenguid/compact-adviser
claude plugin install compact-adviser@compact-adviser
CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1 claude
```

그다음 `/compact-adviser`를 실행하세요.

한국어 마켓플레이스에서는 다음 명령으로 설치합니다.

```
/plugin install compact-adviser@claude-code-mods-ko
```

### Codex CLI

Codex 지원은 **macOS와 Linux 전용**입니다. 플러그인 훅은 이 저장소의 플랫폼 배지와 일치하게 POSIX `sh`를 통해 실행됩니다. 이번 릴리스에서는 Windows가 지원되지 않습니다.

```sh
codex plugin marketplace add kunchenguid/compact-adviser
codex plugin add compact-adviser@compact-adviser
```

Codex를 재시작한 뒤 `/hooks`에서 훅을 한 번 검토해 신뢰하세요. 체크포인트가 완료되면 답변 아래에 `↳ Hook · Compact adviser: ...` 줄로 조언이 나타납니다.

Codex는 **힌트 전용**입니다. 다른 프로세스가 `/compact`를 실행할 수 있는 표면이 없으므로 자동 모드가 없습니다. 설정은 슬래시 명령 대신 작은 CLI에 있습니다. Codex에 "compact-adviser status"라고 요청하면 내장 스킬이 실행하거나, 직접 실행할 수 있습니다.

```sh
node "$(ls -d "${CODEX_HOME:-$HOME/.codex}"/plugins/cache/*/compact-adviser/*/ | tail -1)src/cli.ts" status
```

### Grok Build

Grok은 **힌트 전용**입니다. 실행 중인 세션 밖에서는 `/compact`를 트리거할 수 없으므로 자동 모드가 없습니다. 힌트는 상태 줄에 그려지며 모델 컨텍스트에는 절대 들어가지 않습니다.

```sh
grok plugin install kunchenguid/compact-adviser#packages/grok-plugin --trust
```

(저장소 루트가 아니라 하위 디렉터리에서 설치하세요. Grok은 이 저장소의 Claude 마켓플레이스 색인도 읽으므로 단순한 `grok plugin marketplace add`는 이름이 같은 플러그인 두 개를 제공하고 수식 없는 설치를 거부합니다.)

그다음 Grok이 대신 해 주지 않으므로 일회성 단계 두 개를 수행합니다. Grok을 시작하고 다음을 실행하세요.

```
/compact-adviser-install
```

이것은 `${GROK_HOME:-~/.grok}/hooks/compact-adviser.json`을 기록합니다. **Grok 1.0.34는 플러그인 자체의 `hooks/hooks.json`을 나열만 하고 세션에 로드하지 않기 때문입니다.** 자신의 Grok 홈에 있는 훅은 항상 신뢰되므로 다른 작업은 필요하지 않습니다. 제거하려면 그 파일을 삭제하세요. 셸에서는 다음 명령입니다.

```sh
node "$(node -e 'const l=JSON.parse(require("child_process").execFileSync("grok",["plugin","list","--json"],{encoding:"utf8"})); const p=(Array.isArray(l)?l:[]).find(x=>x&&x.name==="compact-adviser"); if(!p||typeof p.path!=="string") throw new Error("compact-adviser is not installed"); process.stdout.write(p.path)')/bin/adviser.ts" install
```

`install` 이후 `${GROK_HOME:-~/.grok}/compact-adviser/adviser.sh`는 같은 방식으로 현재 설치된 플러그인을 찾습니다.

그다음 `install`이 출력한 `[ui.status_line]` 블록을 지정한 config.toml 경로에 붙여 넣고 Grok을 재시작하세요. 상태 줄은 기본값으로 꺼져 있으며자신의 설정만 켤 수 있습니다. 플러그인이나 저장소는 켤 수 없습니다. Grok에는 상태 줄이 하나뿐이므로 이 스크립트는 내장 세그먼트(`cwd`, `model`, `context`)도 함께 그립니다. 최소 렌더링 모드에는 상태 줄이 아예 없습니다.

Grok에서는 TypeSafe 키를 `TYPESAFE_API_KEY` 또는 작업 디렉터리의 `.env`로 저장하거나, Grok 밖의 셸에서 CLI `key` 명령으로 저장하세요. Grok 슬래시 명령 뒤에 비밀 값을 입력하지 마세요. Grok은 그 단어들을 모델에 덧붙입니다.

## 아무 동작도 하지 않을 때

| 증상 | 원인 |
| --- | --- |
| TypeSafe가 결제를 요구함(HTTP 402) | TypeSafe 계정의 결제 및 크레딧을 확인하세요. 기다리는 것만으로는 해결되지 않습니다. 컨텍스트는 변경되지 않습니다. |
| `/compact-adviser status`(Pi, Claude Code) 또는 `/compact-adviser`(Grok)에 `Key: missing` | 실행 환경, 저장된 설정, 세션 작업 디렉터리의 `./.env` 어디에도 `TYPESAFE_API_KEY`가 없음 |
| Claude Code에 `/compact-adviser` 명령이 없음 | `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS`가 정확히 `1`이 아님 |
| 명령은 있는데 힌트가 없음 | 컨텍스트가 고정 최소값 40,000 토큰 미만이거나, 세션이 유휴 상태가 아니거나, 마지막 턴이 확정된 최종 답변이 아님 |
| Claude Code: "nonessential traffic" | `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC`이 플러그인 네트워크 요청을 차단함 |
| Codex에 힌트가 없음 | 훅이 신뢰되지 않음(`/hooks`에서 검토), Node가 22.18보다 오래됨, 또는 훅이 Node를 찾지 못함. Codex는 PATH를 다시 만들므로 `COMPACT_ADVISER_NODE`를 절대 `node` 경로로 설정하세요 |
| Grok에 힌트 줄이 아예 없음 | `install`이 지정한 `config.toml`에 `[ui.status_line]`이 없거나 Grok이 최소 렌더링 모드임 |
| Grok에서 턴 완료 후 힌트가 없음 | `/compact-adviser-install`을 실행하지 않아 판단하는 Stop 훅이 없음 |
| Pi print / RPC / JSON, Claude `-p`, `codex exec` | 확실히 감지된 비대화형 세션에서는 어드바이저가 작동하지 않음 |
| 어떤 호스트에서도 아무것도 없음 | `COMPACT_ADVISER_DISABLE`이 참으로 설정됨 |

## 환경 변수

| 변수 | 영향 |
| --- | --- |
| `TYPESAFE_API_KEY` | Jev 키. 설정되지 않으면 저장된 키나 세션 작업 디렉터리의 `./.env`를 사용 |
| `TYPESAFE_BASE` | TypeSafe API base URL을 대체합니다. 기본값은 `https://api.typesafe.ai`. 요청은 끝의 슬래시를 제거한 `<base>/v1/systemone`으로 갑니다. 실행 환경에서만 읽고 저장된 설정이나 `./.env`에서는 읽지 않습니다. `https` URL이어야 하며, 일반 `http`는 루프백 호스트(`127.0.0.1`, `[::1]`, `localhost`)에서만 허용됩니다. 그 밖의 값이나 자격 증명·쿼리·프래그먼트가 포함된 값은 설정 오류이며, 요청도 조언도 없음 |
| `COMPACT_ADVISER_DISABLE` | `1`, `true`, `yes`, `on`(대소문자 무관)이면 세션이 비활성화됩니다. TypeSafe 요청, 힌트, 자동 압축, 명령 모두 없음. 저장된 `hint` 또는 `auto` 모드보다 우선 |
| `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS` | Claude Code 전용. 모드가 로드되려면 정확히 `1`이어야 함 |
| `COMPACT_ADVISER_NODE` | Codex 전용. 훅이 재구성된 PATH에서 Node를 찾지 못할 때 Node 22.18 이상 실행 파일의 절대 경로 |

사람이 조언을 읽을 수 없는 무인 에이전트 세션에서는 `COMPACT_ADVISER_DISABLE=1`을 내보내세요.

## TypeSafe로 전송되는 것

| 포함됨 | 전송되지 않음 |
| --- | --- |
| 제한된 사용자 제약, 최대 최근 64개의 표시된 답변과 도구 결과(잘림), 짧은 도구 결과 발췌, 기존 요약, 저장된 아티팩트 이름, 생략 표시자 | 시스템 프롬프트, 숨은 추론, 이미지, 환경 변수, 모델 컨텍스트와 요청 본문의 API 키, 전체 트랜스크립트 |
| 알려진 키 패턴과 명백한 민감 파일 결과에 대한 최선의 가림 | 보장 아님. 반드시 컴퓨터 밖으로 나가면 안 되는 자료는 제거하거나 모드를 Off로 설정 |

요청은 `https://api.typesafe.ai/v1/systemone`으로, `TYPESAFE_BASE`가 설정되었다면 `<TYPESAFE_BASE>/v1/systemone`으로 전송되며 직렬화된 UTF-8 32,000바이트로 제한됩니다. 오류를 긍정적 판단으로 취급하지 않습니다. TypeSafe API 키는 모델 컨텍스트나 요청 본문에 들어가지 않으며 호출 인증을 위한 Authorization 헤더로만 전송됩니다. 자세한 내용은 [SECURITY.md](https://github.com/kunchenguid/compact-adviser/blob/main/SECURITY.md)를 참고하세요.

## 동작 방식

```
settled turn
      │
      ▼
┌───────────────────┐
│ cheap local gates │  mode, 40k minimum, idle session, key, cooldowns
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ TypeSafe Jev      │  done × shape score, floor slides 0.90→0.50 with usage
└─────────┬─────────┘
          ▼
 hint: run /compact     or, with explicit auto, native compaction
```

자동 압축은 Pi와 Claude Code에서 사용할 수 있습니다. Codex에서는 같은 판단이 스크롤백의 `↳ Hook ·` 줄 형태의 힌트로만 나옵니다. Grok에서는 두 부분이 별개 프로세스입니다. `Stop` 훅이 판단하고 판정을 기록하며, `[ui.status_line]` 스크립트가 그 판정을 읽어 힌트를 그립니다. Grok 훅은 항상 정지를 허용하고 아무것도 출력하지 않으므로 힌트가 모델로 되먹이지 않습니다.

Claude Code에서는 선택 사항인 `beforeCompactPrompt` 설정(기본값은 비어 있음, `/config`에서 설정)으로 자동 압축 전에 한 턴을 실행할 수 있으며, 자동 모드가 확인된 후에만 실행됩니다. `/stow`로 설정하면 `stow` 명령을 먼저 실행합니다. Claude Code는 플러그인이 제출한 프롬프트에서 슬래시 명령이나 `@file` 언급을 확장하지 않으며 `/`로 시작하는 플러그인 프롬프트를 거부합니다. 따라서 `/`로 시작하는 값은 모델에 텍스트로 전송되지 않고 명령으로 실행됩니다. 그 사이에 사용자가 직접 프롬프트를 보내거나 명령을 실행하거나, 그 턴이 중단·오류·5분 내 미완료가 되면 아무것도 압축되지 않습니다. 힌트 모드, Off, 빈 설정은 변경되지 않습니다. Pi, Codex, Grok에는 이 설정이 없습니다.

## 사용법

| 명령 | 효과 |
| --- | --- |
| `/compact-adviser` (Pi, Claude Code) | 설정(모드, 최소값, 요청 로그, TypeSafe API 키) |
| `/compact-adviser auto` / `hint` / `off` (Pi, Claude Code) | 해당 모드를 저장합니다. auto는 첫 사용 확인을 요청 |
| `/compact-adviser status` (Pi, Claude Code) | 모드, 최소값, 예산, 컨텍스트, 키 출처(`env` / `saved` / `.env` / `missing`), 쿨다운 |
| `/compact-adviser threshold 60000` (Pi, Claude Code) | 절대 토큰 최소값을 저장 |
| `/compact-adviser budget 450000` / `budget off` (Pi, Claude Code) | 컨텍스트 예산을 저장합니다. 힌트 기준선이 그 토큰 수에서 완전히 느슨해지며, 호스트의 압축 지점이 더 작으면 그 지점에서 느슨해집니다(기본값 off) |
| `/compact-adviser snooze` / `dismiss` (Pi, Claude Code) | 다음 세 번의 주고받음을 억제하거나 현재 힌트를 지움 |
| `/config`의 `beforeCompactPrompt` (Claude Code) | 자동 압축 전에 실행할 선택 텍스트. 기본값은 비어 있음. `/stow`는 그 명령을 실행 |
| `/compact-adviser` (Grok) | 상태 표시. 인자를 붙이지 마세요. Grok이 모델에 보냄 |
| `/compact-adviser-hint` / `/compact-adviser-off` (Grok) | 힌트 전용 모드를 저장하거나 어드바이저를 비활성화 |
| `/compact-adviser-snooze` / `/compact-adviser-dismiss` (Grok) | 다음 세 번의 주고받음을 억제하거나 현재 힌트를 지움 |
| `/compact-adviser-install` (Grok) | 훅을 등록하고 지정된 `config.toml`에 붙여 넣을 상태 줄 블록을 출력 |
| `${GROK_HOME:-$HOME/.grok}/compact-adviser/adviser.sh threshold 60000` (Grok 셸) | 절대 토큰 최소값을 저장. `budget <tokens\|off>`는 컨텍스트 예산을 저장하고, `help`는 셸 전용 설정을 나열 |

Codex에서는 같은 명령들이 슬래시 명령이 아니라 플러그인 `src/cli.ts`의 인자입니다(`status`, `hint`, `off`, `threshold`, `budget <tokens|off>`, `log on|off`, `key set|clear|status`). Codex 플러그인은 코드가 있는 명령을 등록할 수 없기 때문입니다. Codex에는 snooze나 dismiss가 없습니다. CLI는 어떤 세션이 현재 세션인지 알 수 없습니다.

## 판단 프로필

선택 사항인 [판단 프로필](https://github.com/kunchenguid/compact-adviser/blob/main/docs/judge-profiles.md)은 기본 제공값을 바꾸지 않고 두 질문, 점수 가중치 또는 기준선 일정을 변경합니다. 네 가지 호스트 모두 `profile` 설정에 같은 제한된 JSON 문자열을 받습니다. 프로필을 평가하는 동안에는 힌트 모드를 유지하세요. 잘못된 프로필은 조언을 비활성화하며, 프로필을 로드해도 자동 모드 동의가 주어지지 않습니다.

## 평가

로컬 판단 평가는 실제 세션 체크포인트를 사용해 어드바이저가 언제 `/compact`를 제안해야 하는지 점수를 매깁니다. 아래 곡선은 후속 작업을 고려한 gold set(96개 체크포인트, 40개 세션)에서 나왔습니다. 컨텍스트 윈도우가 찰수록 점수 기준이 **0.90**(사용량 ≤10%)에서 **0.50**(≥90%)으로 느슨해져, 정밀도를 높게 유지하면서 **재현율이 올라갑니다**. 압축이 어차피 강제될 무렵 토큰 절약을 우선하기 때문입니다.

![Jev로 "지금 /compact를 실행해야 하나요?"에 답하게 하면 컨텍스트 사용량이 ≤10%에서 ≥90%로 늘어남에 따라 정밀도는 높게 유지되고 재현율은 상승함](https://raw.githubusercontent.com/kunchenguid/compact-adviser/main/docs/eval-usage-floor-curve.png)

판단 평가 하네스는 [packages/pi-extension/eval/](https://github.com/kunchenguid/compact-adviser/blob/main/packages/pi-extension/eval/README.md)에 있습니다. 공개된 데이터셋이 아닙니다. 자신의 세션을 가리키고 트랜스크립트는 로컬에 두세요.

## 출처 및 라이선스

- 원작자: [kunchenguid](https://github.com/kunchenguid/compact-adviser)
- 원본 저장소: https://github.com/kunchenguid/compact-adviser
- 라이선스: MIT
- 한국어 번역 및 UI 현지화: claude-code-mods-ko 프로젝트

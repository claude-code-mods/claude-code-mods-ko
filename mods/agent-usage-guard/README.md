# agent-usage-guard

> 한국어판은 claude-code-mods-ko 프로젝트가 번역했습니다. 원작자와 라이선스는 문서 끝에 있으며, 영어 원문은 [README.en.md](README.en.md)에서 볼 수 있습니다.

> Claude Code가 5시간 사용량 창을 10분 만에 태워 버리는 것을 막습니다.

`agent-usage-guard`는 Claude Code [모드](https://code.claude.com/docs/en/plugins/mods/overview)입니다. Claude Code 안에서 실행되면서 통제 불능 지출이 일어나기 전에 붙잡습니다. 플랜의 실시간 사용량을 읽고, 서브에이전트 폭증, 대용량 컨텍스트 반복, 재시도 루프를 붙잡습니다.

<p align="center">
  <a href="https://www.producthunt.com/products/agent-usage-guard?embed=true&amp;utm_source=badge-featured&amp;utm_medium=badge&amp;utm_campaign=badge-agent-usage-guard" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1289693&amp;theme=dark">
      <img alt="agent-usage-guard on Product Hunt" width="250" height="54" src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1289693&amp;theme=light">
    </picture>
  </a>
</p>

<p align="center">
  <img src="https://github.com/rbartoli/agent-usage-guard/releases/download/agent-usage-guard--v1.0.0/agent-usage-guard.gif" alt="Claude Code 대화형 UI의 네 장면. 두 시간 뒤 재개한 486k 토큰 세션의 만료된 캐시를 다시 쓰기 전, 네 개 제한 중 다섯 번째 병렬 에이전트 시작 전, 433k 컨텍스트에서 스물한 번째 도구 호출 전, 서브에이전트가 1,090만 토큰을 처리한 뒤 새 에이전트 시작 전에 가드가 묻는다" width="900">
</p>

<p align="center">
  <sub>가드를 로드한 Claude Code 대화형 UI에서 녹화했습니다. <a href="demo/scripted-api.ts">스크립트로 만든 로컬 API</a>가 Claude를 대신하므로 세션과 토큰 수는 연출이며 사용량은 소모되지 않습니다. 화면의 모든 질문은 가드 자체의 질문입니다. <a href="demo/fixture/northstar-api">Northstar 픽스처</a>에서 <a href="demo/render.sh">다시 만들 수 있습니다</a>.</sub>
</p>

지출이 일어난 뒤가 아니라 그 전에 작동합니다. 에이전트가 시작하기 전, 프롬프트를 보내기 전, 도구 호출이 실행되기 전입니다. 에이전트 한도는 이 컴퓨터의 모든 Claude Code 세션에 적용되고, 팬아웃과 대용량 컨텍스트는 한도 근처에서만이 아니라언제든 제한됩니다. 사용자가 키보드 앞에 있으면 Claude Code 자체 질문 대화상자로 묻습니다. 아무도 답할 수 없으면 거부하고 이유를 Claude에 알려 주므로 모델이 기다리거나 작업을 묶거나 멈출 수 있습니다. `/agent-guard report`가 무엇을 했는지 보여 줍니다.

- **플랜 인식.** Claude Code가 보고하는 5시간·주간 비율을 읽고 창의 끝부분을 남겨 둡니다.
- **한 번의 승인으로 한동안 유지.** 승인하면 조건이 해소되거나 시간이 지날 때까지 그 조건이 허용되어 같은 질문이 호출마다 되풀이되지 않습니다.
- **로컬이고 프라이버시 부담이 적음.** 네트워크도 프로세스도 없습니다. 횟수와 대략적인 구간만 저장하며 프롬프트 텍스트, 도구 입력, 모델 출력은 절대 저장하지 않습니다.
- **실패 시 열어 둠.** 훅 하나가 실패하면 이벤트는 그대로 진행됩니다. 고장 난 가드가 세션을 망가뜨리지 않습니다. 유일한 예외는 판단할 수 없는 에이전트로, Claude가 다시 시작하도록 거부합니다.

## 설치

Claude Code v2.1.287 이상에서 다음 명령을 실행하세요.

```text
/plugin marketplace add rbartoli/agent-usage-guard
/plugin install agent-usage-guard@agent-usage-guard
/reload-plugins
```

그다음 `/agent-guard`로 가드가 보는 것을 확인하고, `/agent-guard simulate concurrency`로 에이전트가 너무 많을 때 묻는 질문을 확인하세요. 아무것도 붙잡거나 소모되지 않습니다. 모드는 기본적으로 켜져 있으며, [개요](https://code.claude.com/docs/en/plugins/mods/overview#turn-mods-on-or-off)에 끄는 설정이 나와 있습니다.

한국어 마켓플레이스에서는 다음 명령으로 설치합니다.

```
/plugin install agent-usage-guard@claude-code-mods-ko
```

## 왜 만들었는가

어느 오후에 Claude Code에 최대 노력으로 연구 프롬프트를 준 적이 있습니다. **394번의 서브에이전트 호출, 그중 341개가 동시에 실행되고, 10분 만에 8,400만 컨텍스트 토큰을 API로 보냈습니다.** 세션 종료: *"Claude usage limit reached."* 창이 초기화될 때까지 잠겼습니다.

일회성이 아니었습니다. 제 로그 60일에 **잠금 12회**와 에이전트 폭발이 있는 10분 창 166개가 있었습니다. 실패 방식은 곱해집니다. *큰 컨텍스트 × 빠른 도구 루프 × 병렬 에이전트 × 무작정 재시도.* 아래의 각 보호 장치가 그 요인 하나를 제거합니다.

저만의 일이 아닙니다. [한 프롬프트에서 339개 서브에이전트](https://www.reddit.com/r/ClaudeAI/comments/1u5d02w/), [재귀적 생성이consumed 주간 Max 플랜의 절반](https://github.com/anthropics/claude-code/issues/68619), 그리고 멀티에이전트 실행은 [채팅 세션의 약 15배 토큰](https://www.anthropic.com/engineering/built-multi-agent-research-system)을 씁니다.

## 동작 내용

| 영역 | 규칙 | 기본값 | 결과 |
|---|---|---|---|
| 플랜 창 | 창이 이만큼 찼으면 새 에이전트가 승인 필요 | 80% | 질문, 승인은 그 창이 초기화될 때까지 유지 |
| | 창이 이만큼 찼으면 새 에이전트 거부 | 95% | 거부 |
| | 창이 이만큼 찼으면 `ScheduleWakeup`, `CronCreate` 거부, 턴이 스스로 한도로 들어가지 않게 | 95% | 거부 |
| | 각 세션에 단계를 마치고 남은 것을 말하라고 한 번 알림 | 95% | 다음 프롬프트에 메모 추가 |
| | 5시간 창이 이 속도로 오르면 새 에이전트 승인 | 10분당 20포인트 | 질문 |
| | 최근 10분 페이스로 한 시간 안에 찰 것 같으면(초기화 전) 새 에이전트 승인 | 2분당 2포인트 이상 | 질문 |
| 에이전트 | 이 컴퓨터의 모든 세션에서 동시에 실행 중인 에이전트 | 4 | 질문 |
| | 이 컴퓨터에서 10분당 시작·재개된 에이전트 | 12 | 질문 |
| | 이 컴퓨터에서 10분당 서브에이전트가 처리한 토큰, 승인은 1시간 유지 | 1,000만 | 질문 |
| | 서브에이전트가 자기 에이전트를 시작할 수 없음 | 깊이 1 | 거부 |
| 컨텍스트 | 턴을 작게 유지하라고 Claude에 한 번 알림 | 30만 토큰 | 프롬프트에 메모 추가 |
| | 이만큼을 다시 읽을 프롬프트 | 50만 토큰 | 질문: 압축 후 전송, 그대로 전송, 취소 |
| | 대화나 에이전트가 이만큼일 때 10분당 도구 호출 | 40만에서 20회 | 질문: 계속, 이 턴 후 압축, 중지 |
| | 대용량 세션이 오래 유휴여서 프롬프트 캐시가 만료됨 | 15만 토큰, 1시간 유휴 | 캐시 재작성 전 질문 |
| 루프 | 같은 도구 호출이 계속 실패하고 사이에 다른 호출이 없음 | 동일한 실패 3회 | 동일한 재시도 거부 |
| | 10분 내 거부된 에이전트 호출 | 5 | 10분간 에이전트 생성 일시정지 |

"에이전트"에는 서브에이전트, 에이전트 팀 팀원, 워크플로 에이전트, `SendMessage`로 재개된 완료 서브에이전트가 포함됩니다. Haiku 에이전트는 Claude가 Haiku를 요청하든 에이전트 정의가 선택하든 실행 중·시작 횟수 한도에서 제외됩니다. 서브에이전트 토큰 예산과 모든 플랜 창 규칙에는 여전히 포함됩니다. 각 도구 호출은 그것을 만든 루프의 컨텍스트를 기준으로 판단되므로 작은 서브에이전트가 메인 대화의 크기를 물려받지 않습니다.

**질문할 때.** 질문은 Claude가 사용자에게 묻는 데 쓰는 Claude Code 자체 대화상자에 나타나고 호출은 답을 기다립니다. 열려 있는 동안 병렬로 시작된 에이전트는 보류되고, 답하면 Claude가 다시 시작합니다. 허용하면 그 조건은 한동안 허용 상태로 남습니다. 플랜 창은 초기화될 때까지, 대용량 컨텍스트는 줄어들 때까지(도구 호출은 최대 1시간), 에이전트 수는 10분간입니다. 거부하거나 질문을 닫거나, 다른 이유로 답 없이 닫히면 Claude는 향후 10분간 에이전트를 시작하지 말라는 말을 듣습니다(`AGENT_GUARD_WINDOW_SECONDS`). 그동안 다시 묻지 않습니다. 입력한 글자는 Claude에 전달되므로 "haiku 에이전트를 대신 써"라고 답할 수 있습니다.

**아무도 답할 수 없을 때.** `claude -p`, Agent SDK, `dontAsk` 모드에서는 에이전트나 도구 게이트가 묻지 않고 거부합니다. 대용량 프롬프트는 이유와 함께 붙잡히고, 기계 전체의 10분당 1회 상한에 도달한 뒤의 대용량 재개도 그렇습니다. 일정이나 `/loop` 발동처럼 스스로 턴을 시작하는 프롬프트, Slack 같은 채널에서 전달된 메시지, Slack ping도 사용자가 답할 수 있는 세션에서도 같은 방식으로 붙잡히며 한도를 해제하지 않습니다. Claude는 각 거부를 도구 결과로 읽습니다. 같은 조건의 반복 거부는 매번 다르게 표현되고 강해집니다. 두 번째는 아무것도 바뀌지 않았으니 다른 시도를 하라고 하고, 세 번째는 턴을 끝내라고 합니다. `/goal` 같은 Stop 훅이 계속 턴을 다시 열면 사용자가 결정해야 한다고 알려 줍니다.

**표시 내용.** 이 컴퓨터에서 에이전트가 실행 중이거나 가드가 무언가를 붙잡거나 방금 거부했을 때 프롬프트 위 줄에 표시됩니다. 예: `Usage guard · 3 of 4 agents running · 5 of 12 started in the last 10 min · last refusal 14:22: concurrency`. 한도에 도달하거나 무언가 붙잡히면 굵게 표시되고, 할 말이 없으면 사라집니다. Claude Code의 `[-]`로 접을 수 있습니다. 플랜 창과 컨텍스트는 상태 줄에 그대로 있습니다.

**건드리지 않는 것.** 백그라운드 작업 알림이나 다른 세션의 메시지는 절대 붙잡지 않습니다. 결과를 잃게 되기 때문입니다. 사용량 한도 이후 프롬프트를 막지도 않습니다. v2.1.234부터 Claude Code는 한도에서 기다렸다가 초기화 시 스스로 계속합니다(`autoContinueAtUsageLimit`). 가드의 역할은 한도에 도달하지 않게 하는 것이고, 저널에는 막지 못한 잠금이 기록됩니다. 한도 근처에서는 메모만 추가합니다. 95%부터 각 세션의 다음 프롬프트가 Claude에 진행 중인 단계를 끝내고, 큰 일을 시작하지 말고, 끝난 것과 남은 것으로 턴을 마치라고 알려 주므로 잠금이 발생해도 모든 세션이 깔끔하게 멈춘 상태입니다.

**유휴 압축.** v2.1.299부터 Claude Code는 20만 토큰 이상이고 약 54분 유휴인 대화를 1시간 프롬프트 캐시 만료 전에 압축합니다(`idleCompaction`, 기본 켜짐). 가드는 압축된 크기를 읽으므로 그 세션에 대해 묻지 않습니다. v2.1.314부터는 텔레메트리를 끈 구독자의 VS Code와 Claude Desktop Code 탭에서도 실행되고, 1시간 프롬프트 캐시가 켜지면 Bedrock, Vertex, Foundry, LLM 게이트웨이에서도 실행됩니다. 가드의 대기 질문은 유휴 압축이 놓치는 것을 다룹니다. 15만~20만 토큰 대화, `claude -p`와 SDK 세션, 54분 시점에 컴퓨터가 잠들어 있었던 경우, 유휴 압축이나 자동 압축을 끈 설정입니다.

**Claude Code 자체 재개 경고.** v2.1.304부터 Pro·Max 플랜에서 Claude Code는 비활성 대화를 재개하거나 유휴 중 캐시가 식은 대화로 메시지를 보낼 때, 5시간 한도의 눈에 띄는 부분을 사용하게 되면 경고합니다. 그대로 재개하거나 새 대화를 시작합니다. 플랜과 모델별 최소 비율부터 표시되므로 대부분의 모델에서는 매우 큰 대화에서만 나옵니다. 가드의 대기 질문은 15만 토큰부터 묻므로 대부분의 콜드 재개를 여전히 다루며, 가장 큰 경우에는 둘 다 볼 수 있습니다.

## 명령

```text
/agent-guard [status]                          what the guard sees right now
/agent-guard allow [agents|context] [minutes]  lift its limits for this session (default: all, 10 min)
/agent-guard pause [minutes]                   the same as allow, for every limit
/agent-guard resume                            end an allow early, lift the agent pause, and let declined questions ask again
/agent-guard report [days]                     what it did on this machine (default: 7 days)
/agent-guard simulate <rule>                   show what a rule does, with nothing held or spent
/agent-guard help                              these commands
```

`/agent-guard`는 턴 중간에도 즉시 실행되며 모델 턴을 시작하지 않습니다. 따라서 Claude는 재정의를 보지 못하고 권한으로 받아들일 수 없습니다. 한도를 해제할 수 있는 사람은 사용자뿐입니다. 다른 플러그인이 `/agent-guard allow`나 `pause`를 실행하면 가드가 거부하고 트랜스크립트에 밝힙니다. 이전 버전의 표지인 `[allow-usage-guard]` 또는 `[allow-agent-burst]`만 프롬프트로 보내는 것도 `/agent-guard allow` 또는 `allow agents`와 같습니다.

## 볼 수 있는 것과 없는 것

Claude Code v2.1.316 기준으로 확인했습니다.

| 경로 | 적용 범위 |
|---|---|
| 서브에이전트, 팀원, 워크플로 에이전트 | 시작 전에 붙잡음(`agent.spawn`) |
| `SendMessage`로 새 작업을 받은 완료 서브에이전트 | 재개 전에 붙잡고 시작으로 한 번 셈 |
| 디스크에서 되살아난 팀원(Claude Code 2.1.299 이상) | 재개 전에 붙잡고 시작으로 셈 |
| `/subtask` 포크와 `agent.spawn` 없이 시작되는 모든 것 | 시작 시 셈이며 절대 붙잡지 않음. Claude Code가 시작 전 이벤트를 제공하지 않음. Agent 도구로 Claude가 시작하는 포크는 다른 에이전트처럼 붙잡힘 |
| Claude Code 내부 에이전트(프롬프트 제안, 압축) | 셈하지 않음 |
| 플랜 창 비율 | 구독의 경우 마지막 API 응답에서, `claude -p`에서도 가져옴. API 키 세션은 보고하지 않으므로 토큰·횟수 예산만 적용 |
| 자체 터미널 패널에서 실행 중인 팀원 | 보이지 않음. 루프가 다른 프로세스에서 실행되기 때문 |
| 다른 컴퓨터의 세션 | 셈하지 않음. 세션 간 기록이 이 컴퓨터의 모드 저장소에 있기 때문 |
| API가 자체 실행하는 도구(어드바이저 등) | 붙잡을 수 없음. 도구 이벤트가 발생하지 않음 |

모드는 터미널의 `claude`, 데스크톱 앱의 Code 탭, `claude -p`, Agent SDK에서 실행됩니다. 데스크톱 앱의 WSL 세션에서는 실행되지 않습니다([모드 실행 위치](https://code.claude.com/docs/en/plugins/mods/overview#where-mods-run)).

**Team·Enterprise 플랜**과 관리형 설정이 있는 컴퓨터에서 Claude Code는 관리형 `prependPlugins`가 제외하지 않는 한 내장 `cc-plugin-sec-default` 플러그인을 다른 것보다 먼저 실행합니다. 그 플러그인은 Claude Code의 클래식 훅 이벤트를 사용자 플러그인에게 전달하지 않으며, Claude Code는 가드의 훅이 건너뛰어질 때마다 "agent-usage-guard: its classic.PostToolUse hook was skipped" 같은 줄을 표시합니다. 가드는 여전히 도달하는 이벤트로 압축, 잠금, `/clear`, 재개, Stop 훅의 턴 재열기를 따라갑니다. 클래식 이벤트가 필요한 것은 두 가지입니다. 권한 모드는 에이전트가 시작될 때만 가드에 도달하므로 `dontAsk` 모드에서도 사용자가 입력을 받을 수 있고, `/subtask` 포크는 셈되지 않습니다.

**네이티브 한도도 여전히 중요합니다.** Claude Code는 세션을 20개의 동시 서브에이전트(`CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS`)와 3단계의 중첩(`CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH`)으로 제한합니다. 한 세션이 시작하는 에이전트 총수 제한은 없습니다. v2.1.316부터 `CLAUDE_CODE_SUBAGENT_EFFORT`가 다른 지정이 없을 때 서브에이전트의 노력 수준을 세션 값 대신 설정합니다. 낮추면 각 에이전트가 저렴해지고 가드는 실행 수를 계속 제한합니다. 가드의 기본값은 더 엄격하고 세션을 아우르며, 네이티브 상한은 가드가 셈만 하는 경로의 바깥 벽으로 남습니다.

## 무엇을 했는지 보기

```text
/agent-guard report 30
```

보고서는 사용량 한도 잠금(잠긴 창마다 한 번), 플랜 창 임계값 통과, 정리 메모, 규칙별 질문·거부와 사용자의 답변을 셉니다. 이 컴퓨터의 모든 세션 저널을 읽고 밖으로 나가지 않습니다. 기록을 멈추려면 `AGENT_GUARD_JOURNAL=0`을 설정하세요.

## 보안과 프라이버시

모드는 사용자의 권한으로 Claude Code 안에서 실행됩니다. 설치 전에 [모드가 접근할 수 있는 것](https://code.claude.com/docs/en/plugins/mods/overview#what-a-mod-can-reach)을 읽으세요. 이 모드는 의존성 없는 약 3,000줄의 TypeScript이며, `claude plugin validate .`가 호출하는 모든 API와 읽는 모든 환경 변수를 나열합니다.

- 네트워크 요청도 프로세스 실행도 없습니다. 읽는 유일한 파일은 `/agent-guard status`가 보여 주는 버전을 위한 자체 `plugin.json`입니다.
- 위 규칙에 설명된 것만 판단합니다. 에이전트 시작, 프롬프트 전송, 도구 호출 여부입니다. 답할 수 있으면 사용자에게 묻고, 거부하면 이유를 줍니다. 권한 모드를 읽기만 절대 바꾸지 않으며 설정을 기록하지 않습니다.
- 제출하는 프롬프트는 사용자의 것뿐입니다. "압축 후 전송"을 선택하면 사용자가 입력창에 쓴 프롬프트를 압축이 끝난 뒤 그대로 한 번 보내거나, 실패하면 다시 넣어 둡니다. 이미지나 @ 언급이 있는 프롬프트는 재전송에서 그것이 사라지므로 사용자가 보내도록 입력창에 남깁니다.
- 프롬프트 훅은 사용자의 프롬프트를 변경 없이 전달하고, 컨텍스트가 30만을 넘거나 플랜 창이 95%에 도달하면 Claude에 한 번 메모를 추가하거나, 먼저 물어보기 위해 프롬프트를 붙잡습니다(아무도 답할 수 없으면 이유를 알려 줌). `SessionStart` 훅은 아무것도 바꾸지 않습니다.
- 상태는 `~/.claude/plugins/store/` 아래 모드 저장소의 JSON 파일에 있습니다. 각 세션은 자체 횟수(실행 중 에이전트, 최근 시작·대기 재개, 분당 서브에이전트 토큰, 최근 5시간 판독), 마지막 활동 시각(30일간 보관하므로 재개된 세션이 얼마나 유휴였는지 앎), 저널 행(시각, 세션 id 접두사, 규칙, 도구 이름, `400-500k` 같은 컨텍스트 구간, 플랜 창과 비율, 거부 번호, 사용자의 답변)을 기록합니다. 각 기록은 세션의 전체 id 아래에 저장되며, 그 id는 해당 세션 트랜스크립트 파일의 이름이기도 합니다. 저장소가 가득 차는 등의 이유로 저장을 멈추면 상태 줄에 표시되고, 다른 세션은 이 세션을 셈하지 않습니다.
- 프롬프트 텍스트, 도구 입력, 오류 텍스트, 모델 출력은 절대 저장하지 않습니다. 턴이 API 오류로 끝나면 대화의 마지막 메시지, 즉 Claude Code가 표시한 오류를 읽어 사용량 한도 잠금과 다른 실패를 구분합니다. 도구 호출은 13자 지문으로 줄입니다. 에이전트 이름은 메모리에만 있고 기록되지 않습니다.
- 90일이 지난 저널은 삭제됩니다(`AGENT_GUARD_JOURNAL_DAYS`).
- 위 GIF를 만드는 `demo/`는 실행 대상이 아닙니다. 임시 홈 디렉터리에서 가짜 API 키로 스크립트 로컬 API와 함께 Claude Code를 시작하며, 사용자의 자격 증명을 읽지 않습니다.

`AGENT_GUARD=0`으로 설정하면 제거하지 않고 끌 수 있습니다.

## 구성

환경 변수로 또는 `~/.claude/settings.json`의 `env` 아래에 설정하세요. 시간은 초 단위이며, 범위 안의 숫자가 아니면 기본값을 유지하고 `/agent-guard`가 그 사실을 알려 줍니다.

| 변수 | 의미(기본값) |
|---|---|
| `AGENT_GUARD` | `0`, `false`, `off`, `no`는 가드를 끔(`1`) |
| `AGENT_GUARD_JOURNAL` | `0`은 저널 중지(`1`) |
| `AGENT_GUARD_HAIKU_EXEMPT` | `0`은 Haiku 에이전트를 다른 에이전트와 같게 실행 중·시작 한도에 셈(`1`: 제외) |
| `AGENT_GUARD_JOURNAL_DAYS` | 보관할 저널 일수(`90`) |
| `AGENT_GUARD_WINDOW_SECONDS` | 예산, 증가, 거부의 롤링 창(`600`) |
| `AGENT_GUARD_AGENT_MAX` | 이 컴퓨터에서 동시에 실행 중인 에이전트(`4`) |
| `AGENT_GUARD_ROLLING_MAX` | 이 컴퓨터에서 창당 에이전트 시작·재개 수(`12`) |
| `AGENT_GUARD_AGENT_TOKENS_MAX` | 이 컴퓨터에서 창당 서브에이전트 토큰(`10000000`) |
| `AGENT_GUARD_DEPTH_MAX` | 메인 대화 아래 에이전트 층(`1`) |
| `AGENT_GUARD_LIMIT_ASK_PERCENT` | 새 에이전트가 묻기 시작하는 플랜 창 비율(`80`) |
| `AGENT_GUARD_LIMIT_DENY_PERCENT` | 새 에이전트·웨이크업·예약 작업을 거부하고 각 세션에 정리를 알리는 플랜 창 비율(`95`) |
| `AGENT_GUARD_BURN_PERCENT` | 새 에이전트가 묻게 하는 창당 5시간 창 포인트(`20`) |
| `AGENT_GUARD_CONTEXT_WARN` | 턴을 작게 유지하라고 Claude에 한 번 알리는 컨텍스트(`300000`) |
| `AGENT_GUARD_CONTEXT_HARD` | 전송 전에 묻는 컨텍스트(`500000`) |
| `AGENT_GUARD_TOOL_CONTEXT` | 도구 호출이 도구 예산에 포함되기 시작하는 컨텍스트(`400000`) |
| `AGENT_GUARD_TOOL_MAX` | 그 컨텍스트 이상에서 창당 도구 호출 수(`20`) |
| `AGENT_GUARD_DORMANT_SECONDS` | 대용량 세션의 캐시가 만료된 것으로 보는 유휴 시간(`3600`) |
| `AGENT_GUARD_DORMANT_CONTEXT` | 유휴 세션이 대용량으로 셈되는 컨텍스트(`150000`) |
| `AGENT_GUARD_DORMANT_MAX` | 아무에게도 물을 수 없을 때 이 컴퓨터의 창당 대용량 대기 재개 수(`1`) |
| `AGENT_GUARD_TOOL_FAILURE_MAX` | 동일한 재시도를 거부하기 전의 동일 실패 횟수(`3`) |
| `AGENT_GUARD_FUSE_MAX` | 생성 일시정을 위한 퓨즈 기간당 거부된 에이전트 호출 수(`5`) |
| `AGENT_GUARD_FUSE_SECONDS` | 퓨즈 기간과 일시정지 지속 시간(`600`) |
| `AGENT_GUARD_PEER_TTL_SECONDS` | 다른 세션의 횟수나 활동 흔적 없는 에이전트가 얼마나 오래 유효한지(`900`) |

대기 기본값은 구독이 플랜 사용량 안에서 제공하는 1시간 프롬프트 캐시를 가정합니다. API 키나 추가 사용량에서는 캐시가 5분이므로 `AGENT_GUARD_DORMANT_SECONDS=300`으로 설정하세요.

## Claude Code 너머

규칙은 I/O를 전혀 하지 않는 하네스 독립적 핵심(`core/`)에 있습니다. Claude Code 모드는 그 첫 어댑터입니다. [docs/architecture.md](docs/architecture.md)에 어댑터가 지켜야 하는 계약과 다른 에이전트 하네스가 각 규칙을 수행하기 위해 제공해야 하는 것이 나와 있습니다.

## 테스트

```sh
claude plugin validate . --strict
claude plugin test
```

`claude plugin test`는 Claude Code 자체 테스트 키트에서 스위트를 실행합니다. 핵심 단위 테스트와 세션·모델·네트워크 없이 훅 모듈을 통해 실제 Claude Code 이벤트를 발생시키는 테스트입니다. [TESTING.md](TESTING.md)에 계층과 각 테스트가 입증하는 것이 나와 있습니다.

## 라이선스

MIT

## 출처 및 라이선스

- 원작자: [rbartoli](https://github.com/rbartoli/agent-usage-guard)
- 원본 저장소: https://github.com/rbartoli/agent-usage-guard
- 라이선스: MIT
- 한국어 번역 및 UI 현지화: claude-code-mods-ko 프로젝트

# Inbox

> 한국어판은 claude-code-mods-ko 프로젝트가 번역했습니다. 원작자와 라이선스는 문서 끝에 있으며, 영어 원문은 [README.en.md](README.en.md)에서 볼 수 있습니다.

저는 ADHD가 있습니다. 채팅 스레드 형식으로 에이전트와 일하는 것은 인지적으로 매우 힘듭니다. 세션이 길어질수록 머릿속에 붙잡아야 할 것들이 불어납니다. 질문, 버그, 아이디어, 작업이 모두 뒤섞여 쌓이고 모든 것을 정리해 두기가 어렵습니다.

Inbox는 에이전트가 결정을 필요한 모든 것을 정돈되고 안정적인 곳에 꺼내 놓게 함으로써 즉각적인 해결을 줍니다. 또한 각 항목에 추천 동작을 포함한 선제적이고 예측적인 빠른 동작을 항상 제공하도록 합니다.

더 나아가 Inbox는 에이전트가 당장의 작업만 처리하느라 지나칠 수 있는 잠재적인 문제와 기회를 드러낼 장소를 제공합니다.

Inbox는 터미널과 데스크톱 앱의 Claude Code, ChatGPT 데스크톱 앱의 Codex, 터미널의 omp에서 사용할 수 있습니다. Herdr 앱에서는 터미널 옆 패널로도 열립니다. 각 변형은 플랫폼에 맞게 만들어졌지만 기본 동작은 모두 같습니다.

## 동작 방식
https://github.com/user-attachments/assets/a493119c-4d8b-46e0-a18a-bd0ecf041b6b


## 설치

저와 같다면 이 Github 저장소 링크를 에이전트에 붙여 넣고 설치를 요청하면 됩니다.

예전 방식으로 하려면 계속 읽으세요.

### Claude Code

터미널의 Claude Code 세션에서 다음을 입력하세요.

```
/plugin install inbox --marketplace petekp/inbox
```

마켓플레이스 추가에 `y`로 답한 뒤 범위를 선택하세요. 그 세션에서 바로 동작합니다. 사용자 범위 설치는 이 컴퓨터의 Claude 데스크톱 앱 Code 세션에도 적용됩니다.

대신 Claude 데스크톱 앱에서 설치하려면 Code 세션을 여세요.

1. 프롬프트 옆의 **+**, 그다음 **Plugins**, **Manage plugins**를 클릭하세요.
2. Plugins 페이지에서 오른쪽 위의 **Add**, 그다음 **Add marketplace**, **Add from a repository**를 클릭하세요.
3. `petekp/inbox`를 입력하고 목록에서 **inbox / petekp**를 선택한 뒤 **Sync**를 클릭하세요.
4. Inbox에서 **Add to this computer**를 클릭하세요.
5. 세션으로 돌아가 `/inbox`를 입력해 패널을 여세요.

이것은 사용자 계정에 설치되므로 터미널에서도 동작합니다. `/plugin`은 데스크톱 앱에서 실행되지 않으며, inbox는 앱의 클라우드 세션에 닿지 않습니다.

조직이 Claude Code를 관리한다면 직접 설치한 inbox도 두 가지 차이를 제외하고 동작합니다. `/clear`나 재개 후에는 첫 메시지에서 그 대화의 목록을 로드합니다. 권한 요청은 표시된 지 약 1.5초 뒤에 inbox에 닿습니다. 모든 것을 받으려면 관리자에게 조직의 관리형 설정에 inbox를 등록해 달라고 요청하세요.

업데이트하려면 다음을 실행한 뒤 이미 열려 있는 세션에서 `/reload-plugins`를 실행하세요.

```sh
claude plugin marketplace update inbox
claude plugin update inbox
```

- Claude의 각 답변 후 두 번의 Sonnet 호출을 합니다. 하나는 행용, 다른 하나는 Status 탭용입니다. [비용](#cost) 참고.
- Claude Code 2.1.300에서 만들고 테스트했습니다.

한국어 마켓플레이스에서는 다음 명령으로 설치합니다.

```
/plugin install inbox@claude-code-mods-ko
```

### Codex

```sh
codex plugin marketplace add petekp/inbox
codex plugin add inbox@inbox
```

셸이 `command not found: codex`라고 하면 두 명령에서 `codex` 대신 ChatGPT 앱 안의 사본을 사용하세요.

```sh
/Applications/ChatGPT.app/Contents/Resources/codex-cli/CodexCLI.app/Contents/MacOS/codex
```

그다음 ChatGPT 데스크톱 앱에서 플러그인 훅을 신뢰하세요. 프롬프트의 승인 설정 옆 훅 아이콘을 클릭한 뒤 Allow all을 누르세요. 아이콘이 없다면 Settings, Hooks, Inbox, Trust all 순서로 여세요. Codex는 훅을 신뢰한 뒤에만 실행합니다. Codex 0.164.0 이상에서는 업데이트가 훅을 멈추므로 업데이트 후 다시 신뢰하세요. inbox를 열려면 사이드 패널을 열고 New 옆의 ⋯ 메뉴에서 Inbox를 선택하세요. 2026-11-14에 Codex 0.169 ChatGPT 앱에서 확인했습니다.

[codex/README.md](codex/README.md)에 업데이트와 앱 안에서 `codex` 명령을 실행하는 방법이 있습니다.

### omp

```sh
omp plugin marketplace add petekp/inbox
omp plugin install inbox@inbox-omp
```

inbox는 다음 omp 세션부터 동작합니다. `omp plugin list`에 `inbox@inbox-omp`로 표시됩니다. `.omp-plugin/marketplace.json`을 읽는데, omp는 Claude Code가 읽는 `.claude-plugin/` 폴더보다 먼저 이 파일을 찾습니다.

업데이트하려면 다음을 실행한 뒤 omp를 재시작하세요.

```sh
omp plugin marketplace update inbox-omp
omp plugin upgrade inbox@inbox-omp
```

각 답변 후 inbox는 모델을 두 번 호출합니다. 하나는 행을 갱신하고 다른 하나는 Status 탭을 씁니다. omp가 실행할 수 있는 첫 번째 것을 사용합니다.

1. `@inbox` 역할이 지정한 모델.
2. 제공자들의 최신 Sonnet. `anthropic` 우선.
3. `@smol` 역할.

`@inbox`를 설정하려면 omp의 `config.yml`의 `modelRoles` 아래에 추가한 뒤 omp를 재시작하세요.

```yaml
modelRoles:
  inbox: anthropic/claude-sonnet-5-5
```

Sonnet만 테스트했습니다. 다른 모델도 동작할 수 있지만 검증된 바가 없습니다.

제공자는 각 호출에 그 모델의 요금을 청구합니다.

`@inbox`가 없거나 omp가 쓸 수 없는 모델(알 수 없거나 로그인하지 않은 모델)을 지정하면 다음 선택지를 사용합니다. 패널 하단에 사용 중인 모델이 표시됩니다. omp가 쓸 수 있지만 호출이 실패하는 모델은 다음으로 넘어가지 않습니다. 그 갱신은 실패하고 다음 답변에서 재시도합니다. 사용 가능한 모델이 없으면 하단에 "no inbox model: set @inbox"가 표시되고 inbox를 갱신할 수 없습니다.

### 모든 환경 공통

PRs 탭에는 로그인된 GitHub CLI `gh`가 필요합니다.

## 사용법

Claude Code나 omp에서는 `/inbox`를 입력하고, ChatGPT 앱에서는 Inbox 탭을 여세요. inbox에는 Status, Asks, Finds, PRs 네 탭이 있습니다.

inbox는 비어 있는 상태로 시작합니다. 에이전트에 작업을 주면 첫 답변 이후 행이 생깁니다. 에이전트가 물은 질문과 답변 버튼, 작업의 Status입니다. Claude Code에서는 inbox에 내용이 생기면 프롬프트 위 줄에 표시됩니다.

모든 부분을 예시 항목과 함께 보려면 Claude Code나 omp에서 `/inbox demo`를 실행하세요. 누르면 예시만 바뀝니다. Claude Code에서는 Hide demo를 누르거나 명령을 다시 실행하면 돌아갑니다. `/inbox demo recording`은 비디오용으로 예시를 표시하는 알림을 생략합니다. omp에서는 패널이 닫힐 때까지 유지됩니다.

### Status

콜드 스타트로 돌아온 사람을 위해 세션 작업이 어디까지 갔는지 보여 줍니다. 페이지는 세션이 지금 집중하는 것, 그다음 작업의 각 부분과 진행 상태를 알려 줍니다. 하루 동안 유휴였던 부분은 얼마나 지났는지 알려 줍니다. 그 부분 아래에는 서브에이전트와 그 밖의 진행 중 작업이 표시됩니다. 사용자의 질문이나 작업을 기다리는 부분은 그렇게 표시되고 View로 열 수 있습니다. 마지막으로 본 위치를 선으로 표시해 그 이후 바뀐 것이 위에 오도록 합니다. 끝난 작업은 펼칠 수 있는 횟수로 접힙니다.

"2.5 in the store"처럼 완료선이 있는 목표를 설정할 수 있습니다. 그러면 페이지가 목표의 마일스톤 아래에 작업을 묶고, inbox가 목표와 마일스톤을 최신 상태로 유지합니다. 언제든 목표를 편집하거나 제거할 수 있습니다. 직접 입력한 목표는 달성될 때까지 유지됩니다. inbox가 추론한 목표는 작업에 따라 넘어갑니다.

이 페이지는 작업 안내서이며 로그가 아닙니다. 각 답변 후 두 번째 모델 호출이 페이지를 씁니다. 그 호출이 실패하면 페이지에 그 사실이 표시됩니다.

### Asks

에이전트가 사용자에게 한 질문과 사용자만 할 수 있는 작업입니다.

에이전트가 특별한 일을 할 필요는 없습니다. 각 답변 후 모델이 에이전트가 쓴 내용을 읽어 가능한 답변과 함께 질문마다 기록합니다. 에이전트가 추천한 답변이 맨 먼저입니다. 답변을 누르면 몇 초 뒤 사용자의 메시지로 에이전트에게 전달되어 잘못 누른 것을 Undo로 되돌릴 수 있습니다. 직접 답을 입력하거나 Explain을 눌러 결정 전에 에이전트가 더 설명하게 할 수도 있습니다.

질문이 두 레이아웃이나 두 가지 구현 방법 같은 디자인 선택이라면 Compare가 에이전트로 하여금 각 답변을 코드에 적용해 보고 나란히 보여 주는 페이지를 만들게 합니다. 질문에서 그 페이지를 열 수 있습니다. 페이지는 에이전트의 선택을 먼저 보여 주고, 에이전트의 답변에는 선택, 이유, 페이지 경로가 나옵니다. 에이전트가 백그라운드에서 서브에이전트를 실행할 수 있다면 비교도 거기서 실행되어 작업을 계속할 수 있습니다. 에이전트가 보고할 때까지 질문에는 "Comparing…"이 표시됩니다. 30분간 보고가 없으면 "No comparison came back"으로 바뀌고 Compare를 다시 누를 수 있습니다.

작업이란 로그인하거나 API 키를 추가하는같은 것입니다. 단계별 버튼(명령 복사, 파일 열기 등)이 함께 있습니다. Claude Code에서는 `!`로 명령을 실행해 성공하면 작업이 닫힙니다. Dismiss는 하지 않을 작업을 에이전트에 메시지 없이 버립니다.

### Finds

에이전트가 현재 작업 밖에서 발견한 버그, 위험, 아이디어입니다. 에이전트는 이를 기록하고 작업을 계속하며, 나중에 어떤 것에 실행할지 사용자가 결정합니다. 이슈에 Fix 또는 아이디어에 Do it을 누르면 에이전트에게 전달됩니다. File issue는 Linear나 GitHub 같은 이슈 트래커에 등록하거나 이미 다루는 이슈를 연결하게 합니다. Reply는 그에 대한 사용자의 말을 보냅니다. Explain은 에이전트가 왜 중요한지와 수정에 무엇이 필요한지 행동 없이 설명하게 합니다. Discuss는 논의하고, Dismiss는 버립니다.

### PRs

이 세션과 현재 브랜치의 풀 리퀘스트입니다. 각각 Blocked, Ready, Waiting으로 표시되며 무엇이 막는지 나열합니다. 사용자에게 남은 리뷰 댓글, 실패한 검사, 병합 충돌입니다. 버튼은 작업을 에이전트에 넘깁니다. 리뷰 댓글 하나 또는 모두 처리, 답변 초안 작성, 실패한 검사 수정, 충돌 해결, 병합입니다. Fix와 Resolve conflicts는 GitHub에서 문제가 여전히 표시될 때만 나옵니다. 병합되거나 닫힌 PR은 탭에서 저절로 사라지며 Undo로 남길 수 있습니다. 탭 위의 Clear merged and closed는 현재 브랜치 자신의 PR을 제외하고 남아 있는 것을 지웁니다.

에이전트가 PR 순서를 정할 수도 있습니다. 예를 들어 무엇을 먼저 병합할지입니다. 그러면 탭이 그 순서의 목적과 이유를 설명과 함께 번호를 매겨 먼저 나열합니다. 순위가 매겨진 PR이 바뀌면 탭에 그 사실이 표시되고 Rank again을 제안합니다.

### 스스로 최신 상태를 유지

사용자가 직접 메시지로 질문에 답하거나, 작업이 끝나거나, 에이전트가 발견 사항을 고치면 inbox가 항목을 닫습니다. 닫힌 항목은 열린 것 아래로 접히며 각각 어떻게 끝났는지 표시됩니다. 버린 항목은 세션이 끝날 때까지 Reopen이 남습니다.

에이전트도 inbox를 읽습니다. 사용자의 각 프롬프트 옆에 무엇이 여전히 열려 있는지와 사용자가 무엇에 답했는지 보여 줍니다. 대화가 압축된 후에도 그렇습니다.

모든 누름은 즉시 무엇을 했는지 표시합니다. Discuss는 에이전트가 답할 때까지 "Discussing…", 그다음 "✓ Discussed"로 표시됩니다.

### 각 앱에서

Help에 키와 각 표시의 의미가 나옵니다.

- **터미널:** 각 동작에 그것을 실행하는 글자가 표시됩니다. 숫자 키로 탭을 바꾸고 `j`와 `k`로 위아래로 이동합니다. Status에서는 버튼이 있는 행 사이를 이동하며 버튼 옆 글자를 누르면 실행됩니다. ctrl+x tab은 포커스를 프롬프트에서 위 줄로, 패널로, 다시 프롬프트로 옮깁니다.
- **Claude 데스크톱 앱:** 클릭합니다. `/inbox`로 패널을 엽니다. 패널 클릭은 Claude Code 엔진 2.1.309 이상에서 확인되었습니다. 2.1.295에서는 누른 뒤 클릭하면 패널에 포커스만 돌아왔습니다.
- **ChatGPT 앱:** 클릭하거나 터미널과 같은 키를 누릅니다. 탭에는 글자가 표시되지 않습니다.
- **Herdr 앱:** [Herdr 앱 패널](#herdr-app-pane) 참고.
- **omp:** `/inbox`가 대화 위에 패널을 열고 esc가 닫습니다. 각 동작에 실행 글자가 표시되고 Reply는 `t`입니다. 화살표 키로 행과 행의 버튼 사이를 이동하고 enter로 포커스된 버튼을 누릅니다. Tab이나 숫자 키로 탭을 바꿉니다. Status에서는 `j`와 `k`가 버튼이 있는 행 사이를 이동하고 위아래 화살표가 페이지를 스크롤합니다.

Claude Code에서는 프롬프트 위 줄이 사용자의 도움이 필요한 것과 대기 중인 발견 사항을 세고 패널을 여는 버튼이 있습니다. Claude가 오류로 멈추면 이유를 알려 주는 두 번째 줄이 나오고 API 오류 후에는 Resume 버튼이 있습니다. ChatGPT 앱에는 그런 줄이 없습니다. omp에는 같은 수가 있는 줄이 있으며 `/inbox`가 패널을 연다고 알려 주고 멈춤 줄은 없습니다.

### Herdr 앱 패널

Herdr 앱 터미널에서는 inbox가 터미널 옆 패널로 열릴 수 있습니다.

1. Herdr 앱 터미널에서 Claude Code나 omp를 시작하고 `/inbox`를 입력하세요. 처음에는 inbox가 터미널에서 열리고 "Install the inbox's Herdr mod?"를 묻습니다. Install을 누르세요. ChatGPT 앱도 Inbox 탭에서 같은 질문을 합니다.
2. `/inbox`를 다시 입력하세요. inbox가 터미널 오른쪽 패널에 열립니다. Claude Code의 Open inbox 버튼도 같습니다. 다른 세션이나 앱에서 Install을 눌렀는데도 터미널에 열리면 Claude Code를 재시작하세요.
3. 패널은 탭에서 마지막으로 포커스한 터미널의 inbox를 보여 줍니다. Asks, Finds, PRs가 있고 모든 버튼을 누를 수 있습니다. ←와 →로 탭을 바꾸고 `j`와 `k`로 행 사이를 이동하며 esc가 키를 터미널로 돌려줍니다. 나머지는 Help에 있습니다.

Don't install은 답을 저장합니다. Claude Code나 omp에서 `/inbox herdr`를 실행하면 다시 묻습니다.

Codex CLI에는 `/inbox`가 없습니다. `herdr-app ls`에서 패널 id를 가져와 `herdr-app do pane.split '{"direction":"right","pane":"<pane id>","mod":"inbox"}'`로 패널을 여세요.

Herdr 패널 안에서 Claude Code, omp, Codex CLI는 Herdr 사이드바에 패널 토큰으로도 보고합니다.

| 토큰 | 내용 |
|---|---|
| `inbox` | 사용자에게 남은 것, 한 줄 |
| `inbox-needs-you`, `inbox-findings`, `inbox-prs` | 탭의 수만, 예: `2`. `inbox-needs-you`는 Asks 탭, `inbox-findings`는 Finds 탭. 대기 중인 것이 없으면 비어 있음 |
| `inbox-stop` | 에이전트가 멈춘 이유. 멈춤이 해제될 때까지 카운트 토큰은 비어 있어 사이드바에 자리가 남음 |
| `inbox-focus` | 세션이 집중하는 것, Status에서 가져옴. 이 세션을 Herdr delegate로 시작한 세션은 delegate의 행으로 표시. 사이드바 행이 필요 없음 |

각 탭의 색으로 수를 구분하려면 Herdr 설정의 `[ui.sidebar.agents]` 아래 `rows`에 다음 줄을 추가하세요.

```toml
[
  { token = "$inbox-stop", fg = "#ffa3b0" },
  { token = "$inbox-needs-you", fg = "#ffae42" },
  { token = "$inbox-findings", fg = "#cab0ff" },
  { token = "$inbox-prs", fg = "#8cc8c0" },
],
```

Herdr는 값이 있는 토큰 사이에 ` · `를 두고, 아무 값도 없으면 줄을 생략합니다.

## 비용

Claude Code에서 inbox는 두 가지를 추가합니다.

| inbox가 추가하는 것 | 토큰 | API 가격 기준 비용 |
|---|---|---|
| Claude의 각 답변 후 inbox 갱신용 Sonnet 호출 | 입력 3~4k(약 2k 캐시), 출력 100~250 | 답변당 약 0.5센트, 5분 유휴 후에는 1센트 |
| Status 탭 작성용 두 번째 Sonnet 호출 | 짧은 주고받음에서 입력 약 1.2k, 출력 14~44(평가 실행 3회: 입력 1,175~1,214). 대화 전체를 따라잡을 때는 더 많이 읽음. 한 번의 실행에서 입력 1,358, 출력 100 | 첫 호출보다 적음. 첫 호출은 입력 약 3k를 읽음 |
| Claude의 모든 요청과 함께 전송되는 지시문과 도구 | 약 1,350개, 캐시됨 | 요청당 0.1센트 미만 |

Claude 플랜에서는 사용량 한도에 포함됩니다.

Codex에서는 각 답변 후 갱신이 데스크톱 앱 안의 `codex` 바이너리로 사용자의 Codex 로그인으로 실행됩니다. 답변마다 두 번 호출합니다. 각각 모든 `codex exec` 호출에 포함되는 기본 지시문 약 12,000 입력 토큰과 자체 프롬프트를 담습니다. 이전의 단일 호출은 약 16,000이었습니다. 플랜 사용량에 포함됩니다.

## 실행, 전송, 변경하는 것

Claude Code 모드를 다룹니다. [codex/README.md](codex/README.md)가 Codex 플러그인을 다룹니다. omp 확장은 같은 `gh` 쿼리를 실행합니다. 갱신 요청은 omp가 사용하는 모델 제공자에 대한 자체 연결을 통해 가며 Claude Code 요청과 같은 것을 담습니다.

**컴퓨터를 떠나는 것.** 세 가지뿐이며 그 외는 없습니다.

- Claude의 각 답변 후 inbox가 Claude Code 자체 모델 연결을 통해 Anthropic에 두 번의 Sonnet 요청을 보냅니다. 둘 다 마지막 프롬프트, Claude의 답변, inbox의 열린 항목, Claude가 실행한 도구마다 한 줄을 담습니다. 도구 줄은 `ran: npm test` 또는 `edited src/app.ts` 같은 형식입니다. 요청 크기는 [비용](#cost) 참고.
- inbox가 턴을 놓칠 수 있다고 판단하면 같은 모델에 같은 두 호출로 대화 전체에서 갱신을 요청합니다. 이를 위해 대화를 포크하거나 재개 후 트랜스크립트를 읽습니다.
- PRs 탭을 채우기 위해 읽기 전용 `gh` 쿼리를 실행합니다. `gh pr view`, 리뷰 스레드용 `gh api graphql`입니다. 사용자의 `gh` 로그인으로 GitHub에 닿습니다. inbox는 GitHub 토큰을 읽지 않습니다.

**시작하는 프로그램.**

| 프로그램 | 시점 |
|---|---|
| `gh` | PRs 탭을 채울 때 |
| `open` | 링크, 파일, 폴더를 여는 버튼을 누를 때 |
| `test -x` | 파일을 열기 전. 실행 파일은 실행하지 않고 Finder에 표시 |
| `herdr pane report-metadata` | Herdr 패널 안에서만, 사용자에게 남은 것과 탭별 수를 Herdr 사이드바에 표시 |

**사용자를 대신해 보내는 메시지.** 답변이나 동작 버튼을 누르면 inbox가 사용자의 이름으로 Claude에 메시지를 보냅니다. 메시지는 선택한 답변이거나 발견 사항을 고쳐 달라는 등의 항목에 관한 요청입니다. 멈춘 턴의 Resume은 `Continue`를 보냅니다. 보내는 모든 메시지는 누름에서 시작됩니다. Claude가 기다리는 작업을 Done으로 표시하면 inbox가 몇 초 뒤 또는 Claude의 실행 중인 턴이 끝나면 알려 줍니다.

**Claude 컨텍스트에 추가하는 것.**

- 모든 요청에 담기는 약 1,350 토큰의 지시문.
- 사용자가 Claude의 번호 매긴 질문에 답하거나 inbox가 Claude가 마지막으로 본 뒤 바뀌었을 때 프롬프트 옆 메모.
- 대화 압축 후에도 Claude가 유지하도록 열린 항목.

**훅이 보는 것.**

- 도구 호출. 위의 도구 줄을 쓰고, Claude의 질문 대화상자가 열려 있는 동안 질문을 표시하며, 이 세션이 `gh pr create`로 연 PR을 찾기 위해 각 호출을 읽습니다. 자체 도구 두 개에 대한 호출을 제외하고 모든 호출을 변경 없이 전달합니다. `record`는 질문, 작업, 발견 사항을 저장하고 `close`는 항목을 닫습니다. inbox가 직접 응답하므로 권한 요청 없이 실행됩니다.
- 권한 요청. Claude Code가 도구 호출 승인을 묻는 동안 inbox가 그 행을 표시한 뒤 요청을 변경 없이 전달합니다. 절대 승인하거나 거부하지 않습니다.
- 도구 설명. 자체 도구 두 개를 도구 검색 뒤가 아니라 미리 Claude에 나열합니다. 다른 도구 설명은 건드리지 않습니다.
- `!`로 실행한 셸 명령과 그 출력. stderr에 아무것도 없이 실행된 명령은 그 명령을 실행하라고 한 작업을 닫습니다.
- 세션 시작. `/clear`, 재개, 포크 후 inbox가 그 대화의 항목을 로드합니다. 이벤트를 변경 없이 전달합니다.
- 색상을 맞추기 위한 테마 설정.

**보관하는 것.** inbox는 각 세션의 항목과 추적하는 PR을 이 컴퓨터의 Claude Code 플러그인 저장소에 저장합니다. 최근 40개 세션을 유지하고 오래된 것은 삭제합니다. 항목이 대화 일부를 요약할 수 있으므로 그 안의 사람 이름이 들어갈 수 있습니다. 플러그인 작성자에게는 아무것도 가지 않습니다.

`/inbox` 명령도 추가합니다.

## 개발

[docs/developing.md](docs/developing.md)에 클론에서 inbox를 실행하고 빌드하는 방법이 있습니다.

## 출처 및 라이선스

- 원작자: [petekp](https://github.com/petekp/inbox)
- 원본 저장소: https://github.com/petekp/inbox
- 라이선스: MIT
- 한국어 번역 및 UI 현지화: claude-code-mods-ko 프로젝트

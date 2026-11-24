# agentctl — 한 Claude Code 세션을 위한 에이전트 제어판

> 한국어판은 claude-code-mods-ko 프로젝트가 번역했습니다. 원작자와 라이선스는 문서 끝에 있으며, 영어 원문은 [README.en.md](README.en.md)에서 볼 수 있습니다.

**Claude Code 2.1.288**(헤드리스) 및 **2.1.289**(대화형, 호스트 자동 업데이트 후)에서 테스트했습니다(`claude plugin validate .`, `claude plugin test .`: 203개 테스트). 0.2.x는 2.1.289에서 실제로 재검증했습니다(§ 0.2.x 실제 검증 참고). mods API는 릴리스마다 바뀔 수 있으므로 호스트가 `.claude-plugin/types/`에 기록하는 타입 선언이 설치 버전의 근거입니다. Claude Code를 업그레이드할 때마다 `claude plugin validate .`를 실행하세요.

설계는 이 저장소의 `docs/features/agent-control-plane-mod/`에 있습니다(요구 사항, 타당성 연구, 기술 명세, 요청 티켓). 이 디렉터리는 sd0x-dev-flow 플러그인의 일부가 아닙니다. 플러그인을 설치해도 모드가 설치되지 않습니다. 설치하려면 `/agentctl-setup`을 실행하세요(호스트를 확인하고 사용자가 승인한 뒤 `agentctl@sd0xdev-marketplace`를 설치하고 첫 작업 줄을 만듭니다. `/agentctl-setup --task`와 워크플로 스킬이 대신 수락할 제안안을 작성합니다). 또는 `claude --plugin-dir mods/agentctl`로 한 세션 동안 로드할 수 있습니다.

## 첫 실행

지금 하는 일을 입력하세요. 다른 명령이 필요 없습니다.

```text
/agentctl 測試一下這個新功能
```

1. 모드가 Claude에게 보낼 요청을 입력창에 넣습니다(절대 전송하지 않음). **Enter**를 누르세요.
2. Claude가 프로젝트를 읽고 범위 초안(무엇을 수정할 수 있는지, 어떤 검사를 증거로 볼지, "완료"의 의미)을 작성한 뒤 모드에 포함된 도우미(`bin/propose.mjs`)로 기록합니다. 불분명한 점은 권한을 지어내지 않고 사용자에게 묻습니다.
3. 그 답변 끝에서 모드가 범위를 보여 주고 입력창에 `/agentctl accept <digest>`를 제안합니다. **Tab**, 그다음 **Enter**. 수락하면 범위가 묶이지만 작업은 시작되지 않습니다.
4. Claude에 시작을 요청하세요. `/agentctl`은 현재 상황과 다음 할 일(검사 실행, 그다음 `/agentctl handoff`)을 보여 주고, `/agentctl help`가 나머지를 나열합니다.

설계를 읽지 않은 테스터가 1~4단계와 인계를 외부 도움 없이 수행했습니다(§ 코칭 없이 실행 참고).

요청 전송은 일반 Claude 턴이며 모드 자체는 모델을 호출하지 않습니다. 목표가 중국어로 작성되면 번체 중국어로, 그 외에는 영어로 답합니다. 단순 휴리스틱이며 로케일 감지가 아닙니다.

## 동작 내용

| 기능 | 방식 |
|---|---|
| 작업 범위 | Claude가 제안안을 작성합니다(`/agentctl-setup --task`, 또는 모드가 설치되어 있으면 `/feature-dev`, `/bug-fix`, `/refactor`). 모드가 미리 보고 사용자가 직접 프롬프트에 `/agentctl accept`를 입력하면 미리 보인 그대로 묶입니다(§ 제안안 참고). 직접 입력한 `/agentctl task set <json>`도 작업을 worktree에 묶습니다. 도구 출력, 파일, 메시지는 변경할 수 없으며 사용자가 입력한 명령만 가능합니다. 묶음은 worktree별이므로 같은 worktree의 다른 세션에서 `task set` / `task clear`를 하면 교체·해제됩니다. 작업 기록과 인계도 worktree별이므로 두 worktree의 같은 task id는 서로 다른 작업입니다. 저장소 오류는 그대로 보고되며 이전 작업이 계속 적용됩니다. 기록이 없는 묶음은 그 worktree에서 읽기 외의 모든 것을 거부합니다 |
| 거부 | 거부 목록입니다. 인식된 직접 프로덕션 쓰기와 원격 git 쓰기는 **작업이 없어도** 거부됩니다. 작업이 묶여 있으면 그 작업의 `forbid` 항목과 루트 밖의 편집도 거부됩니다. 편집 루트는 편집 도구(Write, Edit, NotebookEdit)를 묶습니다. 셸 리다이렉트로 기록된 파일은 모드가 분류할 수 없는 Bash 명령이므로 호스트로 가며, 거부 메시지는 Claude에 다른 방법으로 같은 결과를 내지 말라고 알려 주지만 루트가 샌드박스는 아닙니다. 모드가 분류할 수 없는 모든 것(스크립트, 복합 셸, 알 수 없는 도구)은 Claude Code 자체 권한 요청이나 자동 모드로 가며 `delegated`로 기록됩니다. 하위의 거부는 절대 약화되지 않고 허용이 새로 생기지도 않습니다. **최선 노력**: 모드는 각 도구 호출만 읽고 스크립트 내용이나 그가 시작하는 명령은 읽지 않으므로 스크립트 안의 push는 호스트와 그 워크플로의 승인 여부입니다 |
| 증거 | 선언된 `check` 실행 프로그램과 일치할 때 실행이 성립됩니다. 단어 우선이므로 인자를 추가해도 성립하며 검사가 선언보다 적게 확인할 수 있습니다. 파이프, 리다이렉트, 래퍼(`npm test \| grep pass`)는 성립하지 않습니다. 수락 답변과 `/agentctl`은 일치하는 줄로 각 검사를 이름을 대지만, 포맷터가 단어를 한 조각으로 인용할 수 없으면 JSON 단어로 표시하는데 그대로 복사하면 일치하지 않습니다(올바르게 인용한 같은 단어는 일치). 일치한 호출은 Git에서 가져온 트리 판독으로 감싸집니다(실행 프로그램을 먼저 찾으므로 선언된 `git status` 검사도 검사입니다). 이후 편집이 있으면 30초 안에 결과가 오래된 것으로 표시되고, 백그라운드 검사는 터미널 결과를 볼 때까지 "completion unobserved"로 남습니다. 증거는 그것이 관측된 작업과 정책 버전에 속하며 부분 적용 범위의 판독은 검증됨으로 나열되지 않습니다 |
| 패널 | 프롬프트 위 띠는 간결합니다. 작업, 런타임과 그 지속 시간, 사용자 도움이 필요한 것, 게이지 판독과 그 나이(30초 초과 시 `stale`), 마지막 인계 시각입니다. `/agentctl`은 간결한 상태 답변(다음 단계, 작업, 필요한 것, 게이트와 증거)이고 `/agentctl status --details`는 저장소 상태, 런타임, 컨텍스트, 5시간 창을 추가합니다. 게이트·컨텍스트·창 줄은 출처와 나이를 이름으로 표시하거나 `missing` / `unavailable`로 읽히고, 각 증거 줄은 결과, 신선도, 범위, 나이를 표시합니다 |
| 인계 | `/agentctl handoff` — 기록에서 여덟 가지 답변, 모델·네트워크·프로세스 없음. 다시 열 때 전체가 기록됩니다(트랜스크립트 전용). `/agentctl`은 그것을 가리키기만 하고, `/agentctl last`가 전체를 출력합니다 |
| 중지 | `/agentctl stop` — 인계를 저장하고 현재 턴의 취소를 요청하며 추적 중인 작업을 나열합니다. 절대 "전부 중지됨"이라고 하지 않습니다 |

## 제안안

Claude가 `~/.claude/agentctl/proposals/<URI-encoded worktree>.json`(worktree 밖)에 모드에 포함된 `bin/propose.mjs`(`/agentctl <goal>` 경로) 또는 sd0x-dev-flow의 `agentctl-setup.js propose`(설정 및 워크플로 스킬)로 기록합니다. 둘 다 먼저 모드 자체 검증을 적용합니다. 세션 시작 시와 각 메인 턴 끝에서 모드가 한 번 읽고 다시 검증한 뒤 **유효** 객체를 유지합니다. worktree는 세션에서 가져오며, 다른 worktree를 지정한 제안안, 더 이상 묶이지 않은 작업에 대해 작성된 제안안, 내장 등급과 겹치는 제안안은 거부됩니다(이유가 기록됨). 미리 보기에는 수락되는 모든 권한이 SHA-256 다이제스트(16진수 24자)와 함께 트랜스크립트와 띠에 나열됩니다. 각 항목은 최대 160자까지 표시되고, 더 길면 `…`로 끝나지만 다이제스트와 수락이 묶는 것은 전체를 포함합니다. 전체를 볼 수 없는 초안은 버리세요.

| 명령 | 누가 | 동작 |
|---|---|---|
| `/agentctl proposal` | 누구나 | 대기 중인 미리 보기를 출력 |
| `/agentctl accept [digest prefix]` | **사용자 프롬프트 전용** | 미리 보기 이후 바뀌지 않았다면 유지된 객체를 묶습니다. 파일을 다시 읽지 않음 |
| `/agentctl discard` | 누구나 | 대기 중인 제안안을 버립니다. 묶인 작업은 유지 |

파일을 나중에 바꾸면 새 미리 보기와 다이제스트가 생기고 이전 다이제스트는 일치하지 않습니다. 한 worktree의 동시 세션은 하나의 묶음과 저장소를 공유하며 세션 간 원자성이 없습니다. 미리 보기를 보여 준 세션에서 수락하세요.

## 작업 JSON

```json
{
  "goal": "investigate the quiz service timeout",
  "allow": ["edit"],
  "editRoots": ["src", "tests"],
  "forbid": ["terraform apply"],
  "executors": [{ "argv": ["npm", "test"], "check": true }],
  "needsUser": [["npm", "publish"]],
  "tools": ["mcp__docs__search"],
  "acceptance": ["unit tests pass on the final tree"]
}
```

내장 금지 등급은 작업이 있든 없든 작업 자신의 규칙 위에 적용됩니다. 프로덕션 쓰기(`kubectl apply|delete|patch|rollout|scale|edit|replace`, `helm install|upgrade|uninstall|rollback`, `gcloud … deploy|delete|update`)와 원격 git 쓰기(`git push`, `gh pr merge`)입니다. 비밀 값은 작업에 넣지 마세요. 정책 필드에 자격 증명 같은 값이 있으면 거부됩니다.

`needsUser`는 사람이 답하는 것을 본 곳에서만 묻습니다. `default`(수동), `acceptEdits`, `auto` 권한 모드의 대화형 터미널입니다(`lib/verdict.js`). 모드는 각 프롬프트와 도구 종료 시 클래식 훅 입력에서 모드를 읽습니다. 아직 본 적이 없거나, `-p`, `dontAsk`, `plan`, `bypassPermissions`, Desktop, VS Code, 모바일 같은 다른 표면·모드에서는 `needsUser` 호출이 거부됩니다. 턴 중간에 바뀐 모드는 다음 도구 종료 시 반영됩니다.

## 이것이 아닌 것

- **격리 경계가 아닙니다.** 사용자의 권한으로 실행됩니다. 프로덕션 읽기 전용은 자격 증명과 대상의 IAM/RBAC 몫입니다.
- **유일한 방어선이 아닙니다.** 호스트가 훅을 건너뛰면(모드 비활성, 워커 충돌) 여기서는 아무것도 거부하지 않습니다. 위험한 명령을 자신의 `permissions.deny`에도 두세요. 예:

  ```json
  { "permissions": { "deny": ["Bash(kubectl delete:*)", "Bash(kubectl rollout:*)", "Bash(helm upgrade:*)"] } }
  ```

  이 규칙은 프로그램이 아니라 명령 텍스트와 일치합니다(`git -C . push`는 다른 텍스트). 그래서 두 층이 있습니다. `Bash(git push:*)`는 sd0x-dev-flow의 `/push-ci`가 실행하므로 의도적으로 제외했습니다.
- 다른 모드가 `tool.check`에서 판정을 바꿀 수 있습니다. 이 모드는 `/agentctl policy`에서 그 사실을 밝힙니다.
- 승인된 실행 프로그램(예: `npm test`)은 그 효과가 분류되지 않은 채 실행됩니다.

## 개발

```bash
cd mods/agentctl            # 저장소 루트에서
claude plugin validate .   # 훅과 $ 호출: $.model.*, $.http.*, $.tool.register 금지, $.prompt.submit은 허용(fill/suggest/read)
claude plugin test .       # tests/ 아래의 모든 *.test.ts
```

## 릴리스

모드는 자체 버전을 가지며 `agentctl-v<version>` 태그로 릴리스됩니다(`.github/workflows/release-agentctl.yml`). sd0x-dev-flow 릴리스와 별개입니다. Claude Code는 설치된 플러그인을 버전별로 캐시하므로 이 README나 `tests/` 외의 것을 바꾸면 버전을 올려야 합니다. `.claude-plugin/plugin.json`의 `"version"`을 올린 뒤 저장소 루트에서 `node .github/scripts/agentctl-version.js update`를 실행하세요(또는 `/bump-version agentctl`). 둘 다 해야 CI의 버전 잠금이 풀리며, CI는 여기서 `claude plugin validate`와 `claude plugin test`도 실행합니다.

## 실제 검증 (2026-10-04, 스크래치 저장소: 2.1.288에서 헤드리스 `claude -p --plugin-dir`, 2.1.289에서 대화형 tmux)

아래 행은 버전 0.1.0의 기록입니다. 0.2.0부터 분류되지 않은 호출은 거부 대신 호스트에 위임되고 제안안 명령이 존재합니다. 0.2.x 행은 표 다음에 있습니다.

| 검사 | 결과 |
|---|---|
| `-p`에서 로드 및 `/agentctl` | 세션 동안만 로드되며 모델 턴 없이 약 3.7초 만에 응답 |
| `-p` 프롬프트에서 `task set` | 거부됨. `-p` 프롬프트에는 `composer` 표시가 없음. 헤드리스 실행에서는 작업을 설정할 수 없으므로 대화형 프롬프트에서 설정 |
| 금지된·분류되지 않은 Bash 호출 | 실행 전에 거부되고 규칙이 이름을 가짐(`task-forbid: …`, `unclassified: python3 has no adapter`) |
| 허용된 읽기(`git status`) | 호스트 자체 권한 경로로 가 실행됨 |
| 0이 아닌 검사(`sh check.sh` → exit 1) | `error`로 기록. 0이 아닌 Bash 종료가 `isError`로 모드에 전달됨 |
| 증거 감싸기 | 전후 판독이 기록되고 범위는 `git-hybrid` |
| 동시 세션 두 개 | 두 세션 기록이 모두 기록되고 작업 기록은 유지 |
| 종료 후 남은 프로세스 | 없음 |
| 트리 판독 비용 | 변경·미추적 파일 500개에서 약 90ms, 깨끗한 974개 파일 저장소에서 약 75ms |
| 모델 턴 후 5시간 창(V7) | 호스트에서 출처와 나이와 함께 `1% (resets …)`를 읽음 |
| 백그라운드 검사(V5, 백그라운드 부분) | 호스트의 작업 알림(`<task-id>`, `<status>`)으로 `error` 닫힘. 폴링 불필요. `TaskGet`은 todo 목록 도구이고 `GetTask`가 백그라운드 작업을 읽음 |
| 서브에이전트 도구 호출(V4) | 서브에이전트의 `danger-cmd`가 같은 규칙으로 거부됨 |
| `-p`에서 `ask`(V3, `-p` 전용) | `ask`에 답하는 프록시 사본으로, 테스트한 두 헤드리스 구성(Bash 허용 규칙 유무) 모두 2.1.288에서 명령을 실행하지 않음. 프록시의 `ask`가 자동 승인되지 않음 |
| `-p` 스트림 입력에서 `/agentctl stop`(V6) | 입력이 턴 종료 후 처리되어 `immediate`가 적용되지 않음. 답변은 실행 중 턴이 없다고 했지 "중지됨"이라고 하지 않음 |
| MCP 도구 호출(V4) | 프록시 MCP 도구가 작업에 이름을 넣기 전에는 분류되지 않아 거부되고 그 후 실행됨 |
| tmux의 대화형 터미널(V10) | 띠가 80열과 50열에서 CJK 목표 텍스트를 올바르게 렌더링하며 각각 두 줄·세 줄로 줄바꿈 |
| 실행 중인 포그라운드 도구 중 대화형 `/agentctl stop`(V6) | 즉시 실행(`immediate`), 턴이 취소됨. 호스트는 실행 중 명령을 백그라운드로 옮겨 계속 실행했고, 답변은 그것을 실행 중으로 나열하며 "중지됨"이라고 하지 않음. 끝나면 호스트 알림이 증거를 닫음 |
| 수동 모드 대화형 터미널의 `ask`(V3) | `ask`에 답하는 프록시 사본으로 호스트가 모드의 이유가 있는 자체 승인 대화상자(Yes / No, "다시 묻지 않기" 없음)를 표시. 거부하면 호출이 중단됨. 제공 코드로 재실행(수동: 대화상자, `dontAsk`: 모드가 거부), 프록시 사본으로 `acceptEdits`와 `auto`(대화상자), `dontAsk`(거부) 확인. 호스트가 보내는 문자열은 일반 클래식 `UserPromptSubmit` 훅(2.1.289)에서 읽음. `default`, `acceptEdits`, `auto`, `plan`, `dontAsk`가 그대로 도착하며, 자동 모드가 없는 모델(Haiku)에서는 `--permission-mode auto`가 `default`로 대체 |
| 대화형 시작(실제 발견) | `session.start`와 첫 띠 렌더링이 함께 도착. 동시 컨텍스트 빌드 두 개가 띠를 고아 컨텍스트(`gates missing`)로 남김. 수정: 공유 빌드 하나 |
| 설치·비활성화·제거(Signal 12) | 로컬 마켓플레이스에서 설치, 실행, 비활성화(`/agentctl` 사라짐), 제거. 모드 프로세스 없음, `permissions` 설정은 바이트 단위로 동일. 호스트 자체가 빈 `extraKnownMarketplaces` 키, 플러그인 캐시 디렉터리, 빈 `installed_plugins.json`을 남겼고 모드는 자체 저장 파일만 남김. 이후 모두 복원하고 바이트 동일성을 확인 |

제거: `--plugin-dir`은 아무것도 설치하지 않고 설정도 바꾸지 않습니다. 모드 자체 데이터는 `~/.claude/plugins/store/agentctl_*.json`(세션, 작업, 체크포인트)에, 초안 제안안은 `~/.claude/agentctl/proposals/`에 남습니다. 제거하려면 그것들을 삭제하세요.

## 0.2.x 실제 검증 (2026-10-05, 스크래치 클론과 스크래치 bare remote, 2.1.289, Haiku)

| 검사 | 결과 |
|---|---|
| 작업 없이 직접 `git push`(`-p`) | 실행 전에 `remote-git-write` 거부, remote는 빈 상태로 유지 |
| 분류되지 않은 `python3 -c …`와 push하는 스크립트(`/bin/bash -p push.sh`, `-p`) | 둘 다 호스트에 전달되어 실행. 스크립트의 push는 git에 닿았고(모드가 아니라 스크래치 remote가 거부) 공개된 스크립트 맹점을 확인 |
| `agentctl-setup.js propose`가 작성한 제안안, 대화형 시작 | 세션 시작 시 도우미 다이제스트와 함께 미리 보기가 기록되고 띠가 대기 중인 제안안을 이름으로 표시 |
| 프롬프트에서 `/agentctl accept <digest>` 입력 | 미리 본 범위가 새 작업으로 묶임. `base`가 없으면 도우미가 다이제스트를 출력하지 않고 모드가 묶인 작업을 채우고 자체 다이제스트가 수락됨 |
| 선언된 검사, 분류되지 않은 호출, 루트 밖 편집, 직접 push(묶인 작업) | 검사는 `current` 증거로 기록, `python3`는 위임되어 `/agentctl events`에 표시, 편집은 `edit outside the allowed roots`로 거부, push는 `remote-git-write`로 거부 |
| 외부에서 추가된 미추적 파일 | 32초 안에 검사가 `stale (tree changed since)`로 읽힘 |
| `/agentctl handoff`, 재열기, `/agentctl`, `/agentctl last` | 인계는 트리를 읽은 시각을 말하고 검사를 Not verified 아래에 오래된 것으로 나열. 재열기 시 트랜스크립트에 표시, `/agentctl`은 포인터 줄 한 개, `/agentctl last`는 전체 출력 |
| 실제 발견 후 0.2.1에서 수정 | 수락된 제안안 파일을 다음 세션이 오래된 초안으로 다시 읽음(worktree별로 기억하도록 수정). 내장 거부가 "the task's scope"라고 말해 Claude가 작업 확장을 제안함(이제 "a built-in class no task can lift"). 트랜스크립트 줄이 `agentctl: agentctl:`로 읽힘 |
| 두 `-p` 프록시의 비용 | 각각 2~3턴, Haiku에서 각각 약 $0.06. 모드 자체 답변·미리 보기·띠는 모델을 호출하지 않음 |
| 독립 적대 테스트(Codex, 2026-10-05), 0.2.2에서 수정 | 절대 경로 또는 대문자 프로그램 경로(`/usr/bin/git push`, `GIT push`)가 내장 등급을 빠져나감. `../other` 같은 편집 루트가 worktree 밖 쓰기를 허용. 제안안 상한이 문자가 아니라 UTF-8 바이트를 셈. 작업이 없을 때 위임된 호출이 `/agentctl events`에 기록되지 않음. 다이제스트 일치, 프로토타입 키, 다른 worktree 거부, 증거 분리, 부분 범위는 유지 |

## 0.3.0 실제 검증 (2026-10-07, 스크래치 클론과 스크래치 remote, 대화형 tmux, Haiku)

Signal 13. 2.1.289에서 1~3단계를, 2.1.292에서 처음부터 다시 수행했습니다.

| 단계 | 결과 |
|---|---|
| `/agentctl 幫 …/README 加一行測試說明` | 요청이 `$.plugin.root`의 도우미 경로와 함께 번체 중국어로 빈 입력창을 채움. 전송이나 묶음 없음 |
| Enter | Claude가 도우미의 `--help`를 실행하고 프로젝트를 읽고 파일이 없는 것을 발견한 뒤 범위를 지어내지 않고 **물음**. 답변 후 도우미로 제안안을 기록 |
| 미리 보기 | 턴 끝에 다이제스트와 "범위만 묶으며 작업은 시작하지 않음"과 함께 표시. 띠가 대기 중인 제안안을 이름으로 표시 |
| Tab + Enter | 제안에서 수락, 답변이 다음 단계를 이름으로 표시 |
| "start the work" | 수락된 루트 안의 편집이 호스트 자체 권한 요청으로 감. 선언된 검사가 현재 증거로 기록 |
| `/agentctl`, `handoff`, 재열기, `last` | 상태가 다음 단계로 시작. 인계는 검사를 판독 시각과 함께 검증됨으로 나열. 재열기는 그것을 가리키고, `last`가 전체 출력 |
| 작업이 묶인 상태에서 두 번째 목표 | 도우미가 묶인 작업 아래에서 전달. 미리 보기에 "Replaces: task …" 표시. Tab + Enter로 교체 |

걷는 중 발견·수정: 2.1.292에서 호스트 자체의 다음 프롬프트 추측("確認")이 입력창을 차지해 Tab + Enter가 그 단어를 Claude에 보낼 뻔했습니다. 이제 제안안이 대기 중일 때 모드가 호스트의 추측을 수락 줄로 바꾸고 매 턴 끝에 다시 제안합니다. 수락 답변의 마지막 줄이 중국어 세션에서 영어로 남았고, 작업이 묶였을 때 채우기 답변이 "nothing is bound"라고 했습니다. 기록된 망설임: Claude가 한 번 worktree 밖의 모드 자체 파일을 읽으려 했고(호스트 요청에서 거부), 복사 언어는 새 세션마다 초기화됩니다.

## 코칭 없이 실행, 0.3.0 (2026-10-07, Codex를 처음 사용하는 것처럼, 대화형 tmux, 일회용 클론)

테스터에게 `/agentctl <what you are doing>`만 주었고 `docs/`나 모드 코드를 읽지 않았습니다. 설명 → Enter → 미리 보기(약 72초, README 전용 범위, 검사 3개) → Tab + Enter → "start the work" → `/agentctl` → `/agentctl handoff`가 외부 도움 없이 여섯 단계로 완료되었습니다. 발견한 것을 바탕으로 0.3.1에서 수정:

| 발견 | 0.3.1 |
|---|---|
| README가 바뀌었는데 인계에 "Edits observed: 0"이 나옴(Claude가 Bash로 편집) | 그 줄은 편집 도구 호출을 세며 Bash 변경은 트리 줄에 있다고 알려 줌 |
| Claude가 테스트를 `grep`으로 파이프했고 인계는 검사를 오래된 것이라고 하는데 Claude는 통과라고 함 | 수락 답변이 실행할 검사를 그대로 이름으로 표시하고 `/agentctl`이 이름으로 다시 요청 |
| 작업이 끝났는데도 `/agentctl`이 "ask Claude to start the work"라고 함 | 다음 단계가 선언된 검사를 따름. 작업하고 실행, 현재가 아닌 것을 다시 실행, 또는 인계 |
| 루트 밖 Write가 거부된 뒤 같은 파일이 Bash heredoc으로 기록됨 | 거부 메시지가 Claude에 다른 방법으로 결과를 내지 말라고 알려 주고, 이 절과 § 동작 내용은 루트가 편집 도구만 묶는다고 명시 |
| Claude가 같은 턴에서 질문하고 제안안을 작성함 | 초안 요청이 답변을 기다린 뒤 작성하라고 지시 |

그대로 둔 것: 실행에 몇 분이 걸렸지만 클론 자체의 `CLAUDE.md`가 문서 변경에 두 번의 검토 라운드를 요구했기 때문이지 모드 때문이 아닙니다.

## 검증되지 않음

Desktop, VS Code, 모바일 및 `plan`, `bypassPermissions` 아래의 V3(우회 모드 경고를 수락하는 것은 운영자의 결정이므로 실행하지 않음): 그곳에서는 `needsUser`가 거부된 채입니다. 띠는 tmux에서 확인했고 SSH에서는 확인하지 않았습니다.

## 설치

```
/plugin install agentctl@claude-code-mods-ko
```

## 출처 및 라이선스

- 원작자: [sd0xdev](https://github.com/sd0xdev/agentctl)
- 원본 저장소: https://github.com/sd0xdev/agentctl
- 라이선스: MIT
- 한국어 번역 및 UI 현지화: claude-code-mods-ko 프로젝트

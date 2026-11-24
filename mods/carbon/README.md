<p><img src="docs/banner.png" width="100%" alt="claude-carbon, 무료 오픈소스: Claude Code 세션의 CO2를 터미널과 Claude 앱에서 보여 줌. 짙은 파랑부터 짙은 빨강까지 여덟 개의 픽셀 분자, 8.2gCO2가 표시된 상태 줄, /carbon-panel 패널"></p>

> 한국어판은 claude-code-mods-ko 프로젝트가 번역했습니다. 원작자와 라이선스는 문서 끝에 있으며, 영어 원문은 [README.en.md](README.en.md)에서 볼 수 있습니다.

[![GitHub stars](https://img.shields.io/github/stars/gwittebolle/claude-carbon)](https://github.com/gwittebolle/claude-carbon/stargazers)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![GitHub release](https://img.shields.io/github/v/release/gwittebolle/claude-carbon)](https://github.com/gwittebolle/claude-carbon/releases)
[![npm](https://img.shields.io/npm/v/claude-carbon)](https://www.npmjs.com/package/claude-carbon)
[![CI](https://github.com/gwittebolle/claude-carbon/actions/workflows/ci.yml/badge.svg)](https://github.com/gwittebolle/claude-carbon/actions/workflows/ci.yml)

claude-carbon은 세션의 탄소 발자국을 추적하는 오픈소스 Claude Code 플러그인입니다. 토큰 사용량에서 로컬로 계산한 실시간 CO2 추정치를 터미널 상태 줄과 Claude 데스크톱 앱의 Code 탭에, 세션의 API 환산 비용 옆에 표시합니다. 데스크톱 앱에서는 `/carbon-panel`이 패널을 열어 이번 세션의 CO2에 따라 색이 칠해진 픽셀 분자, 지난 세션 중앙값과의 비교, 선택한 기간의 사용량, 온난화 띠, 연간 카드 버튼을 보여 줍니다.

<p align="center"><img src="https://github.com/user-attachments/assets/f52b2653-28b9-4efc-82a6-02dfe256e193" width="480" alt="16초짜리 claude-carbon 시연: Claude Code는 CO2를 보여 주지 않지만 claude-carbon이 터미널 상태 줄에, 이어 데스크톱 앱에 표시하고 /carbon-panel이 패널을 엶"></p>

## claude-carbon이 하는 일

- `/carbon-panel`: Claude 데스크톱 앱의 패널에 CO2 분자, 사용량, 세션의 온난화 띠(터미널에서는 프롬프트 위 띠에 세션 표시). [모드](#the-mod-carbon-panel-and-the-co2-of-each-answer) 참고
- Claude Code 상태 줄에 실시간 CO2 추정치를, 데스크톱 앱에서는 프롬프트 아래에 세션의 CO2를 추가하며 각각 API 환산 비용 옆에 표시
- 각 세션을 로컬 SQLite 데이터베이스에 저장해 30일 트랜스크립트 정리 후에도 기록 유지
- 기존 `~/.claude` 트랜스크립트에서 과거 데이터 백필
- 슬래시 명령: `/carbon-report`(텍스트), `/carbon-card`(PNG), `/carbon-pr`(PR의 발자국)
- 전체 합계가 들어가는 README 배지와 모든 계수를 출처 밝힌 공개 방법론

> **달러($) 수치에 관하여.** API 환산값입니다. 세션이 Anthropic의 종량제 API 정가였다면 얼마였는지이며, Pro·Max·Ultra 구독에서는 그 금액을 내지 않습니다. 사용한 것의 가치를 CO2 옆에 보여 주는 것입니다. [동작 방식](#how-it-works) 참고.

## 설치

Claude Code에서 다음을 입력하세요.

```text
/plugin install claude-carbon --marketplace gwittebolle/claude-carbon
```

Claude Code가 마켓플레이스 확인을 묻고 플러그인이 설치할 것을 보여 준 뒤 설치 위치를 묻습니다. **Install for you**를 선택하세요. 같은 명령은 macOS, Linux, Windows에서 동작합니다. Claude 데스크톱 앱의 **Code** 탭에서 명령을 쓸 수 없다면 대신 다음 메시지를 붙여 넣고 Claude가 물을 때 승인하세요.

```text
Install the claude-carbon plugin for me: claude plugin install claude-carbon --marketplace gwittebolle/claude-carbon
```

그다음 Claude Code를 완전히 종료하고 다시 열어 새 세션을 시작하세요. 이제 CO2가 세션 비용 옆에 표시됩니다.

- 터미널 상태 줄: `$0.50 · 65gCO₂`
- 데스크톱 앱 프롬프트 아래: `This session: 3.6 gCO₂ · $0.12`

플러그인은 첫 세션 시작 시 한 번만 상태 줄을 설정하며, 이미 상태 줄이 있다면 건드리지 않습니다(다른 도구의 상태 줄에 CO2를 더하려면 [ccstatusline](#using-with-ccstatusline) 참고). `/carbon-report`가 총계를 주고 `/carbon-panel`이 데스크톱 앱에서 패널을 엽니다. `$`는 구독 청구액이 아닌 API 환산 비용입니다. 나중에 `/carbon-update`로 업데이트하세요.

<p align="center"><img src="docs/desktop-pane.png" width="560" alt="claude-carbon 패널이 열린 Claude 데스크톱 앱: 파란 픽셀 분자, 이번 세션 8.2gCO2와 중앙값의 0.04배, 최근 30일 타일과 온난화 띠, 연간 카드 버튼, 프롬프트 아래 세션 CO2"></p>

<details>
<summary><b>설치가 멈출 때</b></summary>

- **macOS에서 "command line developer tools" 창이 열림.** Claude Code가 플러그인을 가져오는 데 필요한 `git`이며, 개발자 도구가 없는 Mac에는 없습니다. **Install**을 누르고 끝날 때까지(몇 분) 기다린 뒤 다시 설치하세요.
- **"jq is not installed" 또는 "sqlite3 is not installed".** Claude에 "Install what is missing."라고 말한 뒤 Claude Code를 재시작하세요. 모든 Mac에 `sqlite3`가 있고 macOS 15 이상에는 `jq`도 있습니다. 오래된 Mac에서는 Homebrew로 `jq`를 설치하거나 설치 프로그램이 공식 `jq`를 내려받아 공개 체크섬으로 검증합니다. Windows에서는 `/carbon-panel`이 빠진 것을 이름으로 알려 주고 Claude가 `winget`으로 설치할 수 있습니다. `winget`이 "Access is denied"라고 하면 PC의 보안 소프트웨어가 막는 것이므로 거기서 `winget`을 허용한 뒤 다시 시도하세요.
- **Windows에서 Git Bash가 없다고 함.** [Git for Windows](https://git-scm.com/downloads/win)를 설치하고 앱을 완전히 종료·재개한 뒤 새 세션에서 다시 설치하세요. Claude Code는 세션 시작 시 Git Bash를 찾으므로 Git 설치 중 열려 있던 세션은 그것 없이 실행됩니다.
- **Anthropic 커뮤니티 마켓플레이스에서 설치했는데 플러그인이 로드되지 않음?** `co2-tracker@claude-community` 항목은 현재 Claude Code가 거부하는 2026년 8월 릴리스에 고정되어 있습니다("Duplicate hooks file detected"). `/plugin uninstall co2-tracker@claude-community`를 실행한 뒤 위처럼 설치하세요.

</details>

<details>
<summary><b>다른 설치 방법</b></summary>

- **설치 프로그램**: 이 저장소를 클론하고 `~/.claude/settings.json`에 모든 것을 연결하는 스크립트입니다. Claude Code에 다음 메시지를 붙여 넣거나 콜론 뒤 명령을 터미널에서 직접 실행하세요.

  ```text
  Install claude-carbon for me by running this command:
  curl -fsSL https://raw.githubusercontent.com/gwittebolle/claude-carbon/main/install.sh | bash
  ```

  Windows에서는 PowerShell에서 실행합니다([Git for Windows](https://git-scm.com/downloads/win)와 두 패키지가 먼저 필요, [Windows](#windows) 참고).

  ```text
  Install claude-carbon for me by running this command in PowerShell:
  irm https://raw.githubusercontent.com/gwittebolle/claude-carbon/main/install.ps1 | iex
  ```

- **npm**: `npm install -g claude-carbon`, 그다음 `claude-carbon --install`.
- **수동**: 저장소를 클론한 뒤 `bash install.sh`(Windows에서는 PowerShell 설치 프로그램).
- **플러그인 마켓플레이스와 설치 프로그램을 동시에 쓰지 마세요.** 훅이 두 번 실행됩니다.

한국어 마켓플레이스에서는 다음 명령으로 설치합니다.

```
/plugin install carbon@claude-code-mods-ko
```

## 보고서 예시

`/carbon-report`는 기간별 합계와 세션별 내역을 텍스트로 출력합니다.

```text
# Since a specific date
/carbon-report --since 01/05/2026

# All time
/carbon-report --all

# A closed period (--until is an exclusive upper bound: this one stops at June 30th)
/carbon-report --since 01/05/2026 --until 01/07/2026
```

보고서는 CO2, API 환산 비용, 자동차 주행 거리 환산, 2톤 예산 중 비율, 가장 많이 쓴 세션을 보여 줍니다. 날짜 형식은 로케일에 따르며 `CLAUDE_CARBON_LOCALE`로 고정할 수 있습니다.

## 팀을 위해

저장소의 `.claude/settings.json`에 다음을 커밋하면 협업자에게 플러그인을 제안할 수 있습니다.

```json
{
  "extraKnownMarketplaces": {
    "claude-carbon": { "source": { "source": "github", "repo": "gwittebolle/claude-carbon" } }
  },
  "enabledPlugins": { "claude-carbon@claude-carbon": true }
}
```

저장소에서 활성화해도 플러그인이 각자 컴퓨터로 내려가지는 않습니다. 원격 마켓플레이스에서 오므로 각 협업자가 클론에서 폴더를 신뢰한 뒤 `claude plugin install claude-carbon@claude-carbon --scope project`를 한 번 실행해야 합니다. 원치 않는 사람은 개인 `.claude/settings.local.json`의 `enabledPlugins`에서 `false`로 설정하세요. 각자의 수치는 자기 컴퓨터에 남습니다.

### PR 개발 발자국 (`/carbon-pr`)

`/carbon-pr`은 현재 브랜치에서 작업한 세션의 CO2와 비용을 계산해 해당 PR에 댓글로 올립니다. 서브에이전트가 작업한 브랜치도 Stop 훅이 기록해 함께 포함됩니다. `--dry-run`으로 댓글 없이 내용을 먼저 확인할 수 있습니다.

## 동작 방식

모든 추정은 로컬에서 이뤄집니다. 각 턴이 끝나면 Stop 훅이 토큰 사용량을 읽어 `~/.claude/claude-carbon/carbon.db`의 SQLite에 저장합니다. 세션 시작 시 기존 트랜스크립트를 백필하고, 가격과 배출 계수는 저장된 데이터에 적용. `sessions-history.tsv`에는 세션별 기록이 남아 30일 트랜스크립트가 정리된 뒤에도 히스토리를 유지합니다.

### 상태 줄

상태 줄에는 세션의 API 환산 비용과 CO2가 함께 표시됩니다. 예: `$0.50 · 65gCO₂`. Claude Code는 `statusLine` 명령을 하나만 받으므로 다른 도구의 상태 줄이 있으면 플러그인이 그것을 바꾸지 않습니다.

### 30일 트랜스크립트 정리 이후

트랜스크립트가 삭제되어도 로컬 SQLite와 `sessions-history.tsv`의 기록은 남습니다. 백필은 트랜스크립트의 `cwd`에서 프로젝트 이름을 가져오며, 이전에 저장된 잘린 이름은 행을 지우고 `backfill.sh`를 다시 실행해 정규화할 수 있습니다.

## 명령

| 명령 | 동작 |
| ---------------- | --------------------------------------------------- |
| `/carbon-report` | 합계, 자동차 환산, 2톤 예산 비율, 주요 세션이 있는 텍스트 보고서 |
| `/carbon-card` | 공유 가능한 PNG 보고 카드 생성 |
| `/carbon-badge` | README용 전체 발자국 shields.io 배지 |
| `/carbon-pr` | 현재 브랜치의 개발 발자국을 PR에 게시 |
| `/carbon-update` | 설치 방식에 관계없이 최신 버전으로 업데이트 |

<details>
<summary>스크립트(자동 실행, 수동 실행은 거의 필요 없음)</summary>

| 스크립트 | 동작 |
| -------------------- | ----------------------------------------------------------------------------------------- |
| `setup.sh` | DB 초기화, 과거 세션 백필, 총계 표시 |
| `statusline.sh` | 상태 줄 스크립트(Claude Code가 자동 호출) |
| `persist-session.sh` | Stop 훅(매 턴 후 세션 데이터 저장) |
| `persist-on-exit.sh` | SessionEnd 훅(종료 시 백그라운드에서 한 번 더 저장) |
| `safety-rescan.sh` | SessionStart 훅(누락 세션을 잡는 조절된 백그라운드 재스캔) |
| `agent-stop.sh` | SubagentStop 훅(`/carbon-pr`용 서브에이전트 브랜치 기록) |
| `backfill.sh` | 모든 과거 JSONL 트랜스크립트 재파싱(서브에이전트 포함) |
| `recompute.sh` | 가격·계수 변경 후 저장된 토큰에서 비용/CO2 다시 계산(트랜스크립트 불필요) |
| `generate-report.sh` | PNG 보고 카드 내보내기(`--since` / `--until` / `--all`) |
| `generate-badge.sh` | shields.io 배지 마크다운 + URL 출력 |
| `generate-pr-report.sh` | 브랜치 개발 발자국을 PR에 게시(`--dry-run` / `--pr`) |

</details>

## 배지

`/carbon-badge`는 측정한 전체 발자국과 측정 월이 들어가고 방법론으로 연결되는 복사용 shields.io 배지를 출력합니다.

[![Claude Code carbon footprint](https://img.shields.io/badge/claude--carbon-1139.2%20kg%20CO2e%2C%202026--09-2f6f4f)](https://github.com/gwittebolle/claude-carbon/blob/main/METHODOLOGY.md)

<sub>이 배지는 모형이 아니라 실제입니다. 작성자의 2026년 1월 15일~9월 16일 사이 1,208개 세션 합계이며, 한 개발자의 발자국으로 프로젝트의 것이 아닙니다.</sub>

```markdown
[![Claude Code carbon footprint](https://img.shields.io/badge/claude--carbon-1139.2%20kg%20CO2e%2C%202026--09-2f6f4f)](https://github.com/gwittebolle/claude-carbon/blob/main/METHODOLOGY.md)
```

배지는 로컬 DB에서 만든 정적 이미지이므로 수치는 그 자리에서 추정한 것이 아니라 측정값이고 어디로도 전송되지 않습니다. 메시지의 월은 수치가 얼마나 오래됐는지 알려 주며, 갱신하려면 `/carbon-badge`를 다시 실행하세요.

한 사람의 총계이므로 프로필 README나 개인 프로젝트에 어울립니다. 팀·조직 저장소에서는 리뷰어가 수치의 출처와 조직 밖 링크를 묻는 것이 당연합니다.

숫자는 보고서의 로케일을 따릅니다(`fr`은 `12,4 kg`, `us`와 기본값은 `12.4 kg`). `CLAUDE_CARBON_LOCALE`로 고정할 수 있습니다.

## 모드: /carbon-panel과 각 답변의 CO2

claude-carbon 플러그인에는 [Claude Code 모드](https://code.claude.com/docs/en/plugins/mods/overview)도 들어 있어 각 답변이 끝날 때 상태 줄과 같은 공식·계수로 로컬 계산한 CO2와 세션 총계·API 환산 비용을 보여 줍니다.

- **터미널**(편집기 통합 터미널·JetBrains 플러그인 포함): 답변을 닫는 줄 오른쪽에 `✻ Worked for 38s · done 10:32 PM          16 gCO₂`. 다시 그려도(창 크기 변경, 스크롤, ctrl+o) 그 줄은 자기 답변 수치를 유지하지만, 나중에 처음 그려지는 줄(ctrl+o로만 보이는 줄)에는 수치가 없습니다.
- **데스크톱 앱 Code 탭**: 특이한 답변에만 답변 아래 줄로 표시.
- **특이한 답변**은 비율과 서브에이전트가 영향을 주었다면 그 몫을 표시합니다. `230 gCO₂ · 14× your median`. 최근 200개 답변의 97번째 백분위수 위, 중앙값의 3배 초과, 최소 10g일 때 특이하며 약 27개 중 1개꼴입니다. 50개 답변이 기록되기 전에는 표시하지 않습니다.
- **세션 총계**는 프롬프트 아래에 고정됩니다. `This session: 142 gCO₂ · $3.41`, 프랑스어로는 `Cette session : 142 gCO₂ · 3,41 $`. Claude Code의 상태 줄이 이미 보여 주거나 `/config`의 `showSessionTotal` 옵션이 꺼져 있으면 숨습니다(모두 터미널 전용). 비용은 CO2와 같은 요청에 대한 종량제 API 정가이며 `data/prices.json`과 `/carbon-report` 공식에서 나오고, 캐시 쓰기는 Claude Code가 쓰는 1시간 등급으로 계산합니다. 1센트 미만은 `< $0.01`로 표시되고 가격표를 읽을 수 없으면 생략된 뒤 총계가 처음부터 다시 시작될 때까지 생략 상태가 유지되므로 비용이 일부 요청만 포함하는 일이 없습니다. 구독에서는 상태 줄이 보여 주는 사용량도 붙습니다. `Use 23% ↻14:00`는 5시간 창 사용 비율과 현지 초기화 시각이고, 5시간 창이 없으면 주간 창 `Use 41% 7d ↻Sat`입니다. 모두 네트워크 호출 없이 답변 후 Claude Code에서 읽습니다. 이어 상태 줄의 두 힌트가 옵니다. 새 버전이 있으면 `⬆ 1.18.0 /carbon-update`, 매월 1~10일에는 지난달 합계 `📊 September: 84.2 kgCO₂ · /carbon-card`가 카드를 만들 때까지 표시됩니다. Claude Code가 보통 백그라운드로 시작하는 서브에이전트는 세션 총계에만 포함되고 개별 답변·중앙값에는 포함되지 않습니다. 포그라운드 서브에이전트는 그것을 시작한 답변에 포함됩니다.
- **`/carbon-panel`은 패널을 엽니다.** 마스코트는 픽셀 CO2 분자입니다. 색은 이번 세션을 지난 세션 중앙값과 비교해 짙은 파랑(8분의 1 미만)에서 짙은 빨강(8배 초과)까지 칠해집니다. 10개 세션이 기록되기 전에는 0.5kgCO2 기준값과 비교해 첫 답변부터 색이 있습니다. Claude가 작업하는 동안 픽셀 한 칸 위아래로 뛰고, 빨개질수록 빨라지며 표정도 바뀝니다. 첫 답변 전에는 둘러보고, 작업 중에는 눈깜빡임과 옆눈, 가벼운 세션에서는 웃고 무거운 세션에서는 땀을 흘리며, 답변에 반응하고, 쉴 때 윙크하고, 5분간 턴이 없으면 잠이 듭니다.

  <p align="center"><img src="docs/molecule-moods.svg" width="560" alt="분자의 여덟 표정: 첫 답변 전 둘러보기, 작업 중 옆눈, 가벼운 세션의 미소, 무거운 세션의 땀, 답변 후 웃음·놀람, 휴식 시 윙크, 5분 후 취침"></p>

  - **데스크톱 앱**에서 패널은 오른쪽에 "claude-carbon" 탭으로 열리고 두 블록으로 나뉩니다. 분자 아래에는 파랑에서 빨강까지 여덟 색의 척도와 이번 세션의 표시가 있습니다. *이 세션*: CO2, 답변 수, 서브에이전트, 모델, 컨텍스트 창 사용량, API 환산 가치, 서브에이전트마다 자기 CO2로 칠해진 작은 분자. *내 사용량*: 선택한 기간(최근 7·30일, 12개월, 전체, 직접 입력한 두 날짜 `01/05/2026`), 타일로 된 수치(CO2 합계, 같은 길이의 이전 기간 대비 변화, 세션 수, API 환산 가치, 자동차 환산), 그 기간의 온난화 띠(하루·일주일·한 달마다 한 줄, 표시된 기간의 중앙값 대비 색). 포인터 아래 줄이 밝아지고 날짜·합계·세션 수가 띠 아래에 표시됩니다. (i)가 있는 타일은 그것을 누르면 메모를 보여 주고 다시 누르면 숨깁니다. API 환산 가치는 API로 청구했다면 얼마인지이며 Pro·Max·Ultra 구독이 일부·전부를 포함합니다(어느 세션이 어떻게 청구됐는지 기록되지 않으므로 패널은 사용자가 실제로 낸 금액을 말하지 않습니다). "내 사용량" 옆 톱니가 변화·API 가치·자동차·프로젝트별 분해(껄 때까지 오프, 각 폴더의 몫과 kgCO2)·상세를 켜고 끕니다. 선택은 다음 세션에도 유지됩니다. 상세(기본 꺼짐)는 기간을 토큰 종류별로 나눕니다. 비캐시 입력·캐시 쓰기·캐시 읽기·출력이며, 두 개의 색 막대가 토큰과 CO2의 몫을 보여 주고(포인터 부분이 밝아지면 아래에 수치), 종류마다 토큰·에너지·CO2와 비율이 한 줄씩 나옵니다. 각 세션의 CO2는 저장된 값이며 계수가 주는 가중치로 나눕니다(캐시 읽기는 입력 토큰의 0.08, 출력은 약 21배). 그래서 부분의 합은 저장된 값과 같습니다. 2026년 7월 이전 계수로 저장된 세션은 토큰과 CO2가 맞지 않아 제외되고, 몇 개 세션을 기준으로 나누는지 표시됩니다. 에너지는 계수의 출발값(토큰당 에너지, PUE 포함, AWS us-east 전력망 287 gCO2/kWh로 CO2 환산)이며 CO2를 같은 강도로 나눠 되찾습니다. `sessions-history.tsv`에 종류별 토큰이 필요하고 이 버전부터 훅이 기록하므로 업데이트 후에는 다음 답변부터 상세가 보입니다. "내 연간 카드 받기" 버튼은 빈 프롬프트에 `/carbon-card`를 넣어 사용자가 보내도록 합니다(카드는 패널 기간과 무관하게 해당 연도 누적). 자동 전송은 절대 하지 않으며 사용자가 시작한 초안은 남겨 둡니다. 하단의 몇 줄은 이 저장소, 작성자 LinkedIn, 비즈니스 버전 TokenClimate으로 연결됩니다.
  - **터미널**에서 `/carbon-panel`을 입력하면 클래식·전체 화면 렌더링 모두에서 바로 위 띠에 이번 세션이 표시됩니다(데스크톱 앱이나 휴대폰에서 Remote Control로 터미널 세션에 보내면 그곳에서 사이드 패널이 열립니다). 반 블록으로 그린 13열×4행의 작은 분자와 옆에 세션 CO2, 답변 수, 서브에이전트(각각 자기 색 점), 모델, 컨텍스트 창, API 환산 가치가 나옵니다. 기간과 띠는 데스크톱 앱에 있습니다.
  - `/carbon-panel`을 다시 실행하면 패널을 닫거나 띠를 지웁니다. 이 명령은 플러그인의 스킬이기도 해 데스크톱 앱에 나열됩니다. 모드가 동작하지 않는 곳(VS Code 채팅 패널, 클라우드 세션)에서는 패널이 열리는 곳만 알려 줍니다.
- **띠의 히스토리**는 `sessions-history.tsv`입니다. Stop 훅이 매 답변 후 `carbon.db` 옆에 기록하며 DB는 읽기 전용입니다. 기록된 모든 세션이 들어가고 오래된 행은 당시 저장된 그대로(당시 계수를 유지하며 재계산하지 않음) 남습니다. 따라서 띠·중앙값·합계는 `/carbon-report`가 세는 것을 셉니다. 동시에 실행 중인 다른 세션은 현재까지의 합계로 포함됩니다. DB가 아직 없으면(플러그인만 설치해 첫 세션 시작 전, 또는 `jq`·`sqlite3` 누락) 패널이 분자를 보여 주고 히스토리가 기다리는 것을 알려 줍니다.

모드는 터미널과 데스크톱 앱의 Code 탭에서만 그립니다. VS Code 확장 채팅 패널, 클라우드 세션, `claude -p`에는 아무것도 나타나지 않습니다. Claude Code 2.1.287 이상(데스크톱 앱은 2.1.286)이 필요합니다.

모드는 플러그인에 포함되어 있습니다. 마켓플레이스에서 이미 설치했다면 `/plugin marketplace update claude-carbon`과 `/plugin update claude-carbon@claude-carbon`을 실행한 뒤 Claude Code를 재시작하세요.

플러그인만으로도 세션을 기록하고 상태 줄이 없을 때 터미널 상태 줄을 설정합니다.

```
/plugin install claude-carbon --marketplace gwittebolle/claude-carbon
```

설치 후 첫 세션 시작 시 `~/.claude/claude-carbon/`에 DB를 만들고 디스크에 남아 있는 트랜스크립트(최근 약 30일, 모든 프로젝트)로 채운 뒤 이후 세션을 기록합니다. 다음 세션 시작 중 한 번 안내가 나옵니다. `jq`, `sqlite3`가 필요하며 없으면 아무것도 만들지 않고 `/carbon-panel`이 이름을 알려 줍니다. 이 자동 설정은 한 번만 일어납니다. 삭제한 DB는 다시 만들어지지 않고(옆의 `auto-setup` 파일을 지우면 다시 요청), `CLAUDE_CARBON_DB`로 지정한 경로는 자동 생성되지 않으며, `CLAUDE_CARBON_NO_AUTOSETUP=1`로 끌 수 있습니다. 이후에는 설치 프로그램과 같이 새 릴리스를 하루 한 번 백그라운드에서 확인합니다(`CLAUDE_CARBON_NO_UPDATE_NOTIFIER=1`로 해제).

curl·PowerShell·npm 설치 프로그램은 상태 줄, DB, 훅을 설정하고 모드 복사본만 `~/.claude/skills/claude-carbon/`에 넣어 Claude Code가 `claude-carbon@skills-dir`로 로드합니다. `/carbon-update`가 복사본을 최신으로 유지합니다. 복사본에는 훅이 없어 아무것도 두 번 실행되지 않습니다. 설치 후 Claude Code를 재시작하고, 열 폴더를 신뢰하면 모드가 로드됩니다. 중앙값은 0에서 시작하며 다른 설치에서 기록한 답변은 이어지지 않습니다. 이 복사본으로 모드는 터미널, 편집기 통합 터미널, 데스크톱 Code 탭에 표시됩니다.

끄려면 `claude plugin disable claude-carbon@skills-dir`를 실행하세요. 제거하려면 bash 쪽 설치 프로그램을 `CLAUDE_CARBON_NO_MOD=1`로 실행하고(`curl … | CLAUDE_CARBON_NO_MOD=1 bash`), 다음 `/carbon-update`가 되살리지 않도록 그 변수를 셸이나 `settings.json`의 `env`에 유지하세요. 설치 프로그램이 만들지 않은 `skills/claude-carbon/` 폴더는 건드리지 않고, claude-carbon 플러그인이 활성화되어 있으면 복사를 건너뜁니다. 둘 중 하나만 쓰세요. 설치 프로그램 위에 플러그인을 추가하면 훅이 두 번 실행됩니다.

답변별 수치는 `/config`의 `showPerTurn` 옵션으로 끌 수 있습니다. 모드는 DB를 쓰지 않고, 프로세스를 시작하지 않으며, 네트워크 호출을 하지 않고, Claude의 행동을 바꾸지 않습니다. 자체 데이터 파일 외에는 `sessions-history.tsv`, 하루 확인용 두 릴리스 플래그(`plugin-update-check.json`, `update-check.json`), `last-card-month`, DB가 없을 때 SessionStart 훅이 남기는 두 파일(`setup-needed`, `auto-setup`)만 읽습니다. 텍스트는 `CLAUDE_CARBON_LOCALE`, `LC_ALL`, `LC_MESSAGES`, `LANG` 중 처음 설정된 것이 `fr`로 시작하면 프랑스어, 그 외에는 영어입니다. 아무것도 설정되지 않았을 때(데스크톱 앱, 보통 Windows)는 `language` 설정(`Français`, `English`)이 결정하고 그다음 프랑스어입니다.

모드 자체 테스트는 `bash tests/run-mod-kit.sh`로 실행되고 `claude plugin test` 아래에 있으며 엔진을 목으로 처리해 로그인이 필요 없습니다. CI는 모든 푸시에서 Claude Code 2.1.296으로 실행합니다.

## ccstatusline과 함께 사용

Claude Code는 `statusLine` 명령을 하나만 받으므로 claude-carbon의 전체 상태 줄과 [ccstatusline](https://github.com/sirmalloc/ccstatusline)은 동시에 실행할 수 없습니다. ccstatusline이 상태 줄을 담당한다면 CO2 세그먼트를 포함하세요. ccstatusline TUI에서 `Custom Command` 위젯을 다음으로 지정합니다.

```
~/code/claude-carbon/scripts/statusline.sh --segment
```

(`CLAUDE_CARBON_DIR`로 설치했다면 경로를 조정하세요.) 위젯은 같은 상태 JSON을 표준 입력으로 받아 비용+CO2 한 쌍만 출력합니다. 예: `$0.68 · 35gCO₂`. 세그먼트 모드는 절대 네트워크에 접근하지 않습니다. 로컬 DB 기록은 어느 경우에도 영향을 받지 않습니다. 저장은 상태 줄이 아니라 훅에서 일어납니다.

ccstatusline에 세그먼트가 있으면 [모드](#the-mod-carbon-panel-and-the-co2-of-each-answer)의 프롬프트 아래 세션 항목이 총계를 한 번 더 표시합니다. `/config`의 `showSessionTotal` 옵션으로 끄세요. 상태 줄이 없는 데스크톱 앱은 그대로 유지합니다.

## 배출 계수

계수는 [Jegham 등 2025](https://arxiv.org/abs/2505.09598)에서 가져왔습니다. 공개 API 성능 데이터(지연, 처리량)와 추론된 하드웨어 구성에서 AWS 인프라의 LLM 추론 에너지 소비를 추정한 arXiv preprint입니다.

### Golden vectors

계산이 모든 플랫폼에서 같은지 확인하는 기준 벡터는 테스트에 포함되어 있습니다.

## 업데이트

새 버전이 있으면 상태 줄에 조용히 `⬆ /carbon-update` 힌트가 표시됩니다. 확인은 백그라운드에서 하루 한 번 이하로, 상태 줄의 빠른 경로에서는 절대 일어나지 않습니다(`CLAUDE_CARBON_NO_UPDATE_NOTIFIER=1`로 해제).

- **git 클론으로 설치한 터미널**에서는 힌트가 상태 줄 끝에 새 버전 이름과 함께 나옵니다.
- **모드가 동작하는 모든 곳**(데스크톱 앱, claude-carbon 상태 줄이 없는 터미널)에서는 같은 힌트가 프롬프트 아래 세션 항목 끝에 나오고, `/carbon-panel` 패널 하단에도 버전이 표시됩니다. 플러그인 설치에서는 하루 한 번의 백그라운드 확인이 GitHub에 릴리스 태그만 묻고 Claude Code 플러그인 캐시는 건드리지 않습니다.
- **2026년 여름 이전 설치(1.0, 힌트 없음)**라면 [설치](#install)처럼 앱이나 터미널에서 설치를 다시 실행하세요.

업데이트하려면 설치 방식에 관계없이 Claude Code에서 `/carbon-update`를 실행하세요. 플러그인은 Claude Code의 `claude plugin marketplace update claude-carbon`과 `claude plugin update claude-carbon@claude-carbon`을, 설치 프로그램 클론은 자체 업데이터를 실행합니다. 이후 Claude Code를 재시작하세요. 두 설치가 함께 있고 상태 줄이 클론에서 실행될 때는 플러그인만 업데이트되고 클론의 `git pull` 명령이 안내됩니다. 설치 프로그램을 다시 실행해도 됩니다.

```bash
curl -fsSL https://raw.githubusercontent.com/gwittebolle/claude-carbon/main/install.sh | bash
```

- 설치 프로그램 클론을 업데이트하면 저장된 히스토리에 새 계수로 가격이 자동 재계산됩니다(CO2만, 비용 수치는 그대로). 플러그인 업데이트는 그렇지 않습니다. 가격 변경 후에만 `scripts/recompute.sh --with-cost`를 직접 실행하세요.
- `data/factors.json`이나 `data/prices.json`을 로컬에서 수정했다면 업데이트가 수정을 유지합니다. 상위와 충돌하면 사용자의 것을 `*.local.bak`에 저장하고 알려 줍니다.
- 업데이트는 [모드](#the-mod-carbon-panel-and-the-co2-of-each-answer) 복사본도 갱신합니다. 재시작을 요청하면(Windows에서는 사용 중인 복사본을 바꿀 수 없음) Claude Code를 재시작한 뒤 다시 실행하세요. 그 전에는 이전 복사본이 남습니다.
- 마켓플레이스 설치라면 Claude Code가 자동 업데이트하도록 할 수도 있습니다. `/plugin`의 **Marketplaces** 탭에서 `claude-carbon`을 선택하고 **Enable auto-update**를 누르세요. 다음 세션에 새 버전이 로드됩니다.

## 제거

curl·PowerShell·npm 설치 프로그램으로 설치했다면:

```bash
bash ~/code/claude-carbon/scripts/configure-settings.sh --remove
```

(`CLAUDE_CARBON_DIR`로 설치했다면 경로를 조정하세요.) `~/.claude`에서 상태 줄, 훅, `/carbon-*` 명령, 모드 복사본을 제거하며 다른 도구의 것은 건드리지 않습니다. `statusline.sh --segment`를 호출하는 상태 줄은 남고, 그룹을 공유한 다른 훅도 남습니다. 히스토리는 `~/.claude/claude-carbon/`에 그대로 있습니다. 모두 지우려면 그 폴더와 클론을 이후에 삭제하세요.

플러그인은 `claude plugin uninstall claude-carbon@claude-carbon`으로 제거한 뒤 `~/.claude/settings.json`에서 `claude-carbon/statusline.sh`를 가리키는 `statusLine` 항목을 빼세요. 플러그인은 제거 과정에서 그것을 하지 못하고, 제거된 뒤에는 그 상태 줄이 아무것도 출력하지 않습니다. 제거하지 않고 비활성화만 해도 계속 그리므로 항목을 빼야 합니다. `CLAUDE_CARBON_NO_STATUSLINE=1`은 플러그인이 상태 줄을 아예 설정하지 않게 합니다. 플러그인은 한 번만 설정하므로, 제거 후 다시 설정하려면 `~/.claude/claude-carbon/statusline-set`을 삭제하세요.

기존 설치 위에 두 번째 복사본(다른 폴더, 또는 플러그인 클론 위에 설치 프로그램)을 설치하면 모든 훅이 두 번 실행됩니다. 설치 프로그램은 `settings.json`에 연결된 다른 설치를 발견하면 중단하고 이름과 대체 명령(`configure-settings.sh --replace`)을 알려 줍니다. 폴더가 삭제된 설치가 남긴 훅은 묻지 않고 교체됩니다.

## 의존성

- `jq` — JSON 파싱
- `sqlite3` — 로컬 DB
- `git` — 상태 줄의 브랜치 감지(선택)
- `curl` — Claude Code가 사용량을 전달하지 않을 때 Anthropic의 `/api/oauth/usage` 엔드포인트로 구독 할당량 확인(선택, 분당 최대 한 번)
- `node` + Google Chrome, Microsoft Edge, Chromium, Brave(또는 `playwright-core`와 그 Chromium) — `/carbon-card`의 PNG 내보내기(선택)

모든 Mac에는 `sqlite3`가 있고 macOS 15(Sequoia)부터 `jq`가 있습니다. `jq`가 없는 오래된 Mac에서는 설치 프로그램이 해당 프로세서용 공식 jq 1.8.1 바이너리를 내려받아 jq 프로젝트가 공개한 SHA-256으로 검증한 뒤 `~/.claude/claude-carbon/bin/`에 넣고, 스크립트와 슬래시 명령이 거기서 찾습니다. 나중에 설치한 `jq`(Homebrew 등)가 우선합니다. Linux는 `apt install jq sqlite3`. Windows는 아래 참고.

`/carbon-card`는 Chromium 계열 브라우저를 헤드리스·일회용 프로필로 실행해 PNG를 그립니다. `playwright-core`가 설치되어 있으면 그 Chromium을(node 자체 해석 경로, 전역 npm 루트, `~/node_modules`, Homebrew node modules에서 찾음) 쓰고, 없으면 평소 위치에서 발견되는 첫 브라우저를 씁니다. macOS에서는 Chrome, Edge, Chromium, Brave, Windows에서는 Chrome 또는 Edge, Linux에서는 `PATH`에 있는 것 중 첫 번째입니다. `CLAUDE_CARBON_BROWSER`로 경로 또는 명령으로 다른 것을 지정하거나 `none`으로 검색을 건너뛸 수 있습니다. 60초 동안 아무것도 그리지 않은 브라우저는 중지되고 다시 시도하지 않습니다. 브라우저가 전혀 없으면 카드가 기본 브라우저에서 페이지로 열리고 그 화면 캡처가 카드가 됩니다.

## Windows

claude-carbon은 bash이며 Windows에서도 bash로 유지됩니다. 이는 지름길이 아니라 의도된 선택입니다. 네이티브 Windows에서 Claude Code는 상태 줄과 훅 명령을 [Git for Windows](https://git-scm.com/downloads/win)에 포함된 bash로 실행하고, Git Bash가 없을 때만 PowerShell로 대체합니다([상태 줄 문서](https://code.claude.com/docs/en/statusline#windows-configuration), [훅 문서](https://code.claude.com/docs/en/hooks)). 플러그인은 호스트가 이미 실행하는 셸을 사용합니다.

**네이티브 Windows.** 먼저 Git for Windows를 설치한 뒤 Claude Code를 재시작해 Git Bash를 찾게 하세요.

```powershell
winget install Git.Git --source winget
```

그다음 같은 터미널에서 Git for Windows가 제공하지 않는 `jq`, `sqlite3`를 설치하고 설치 프로그램을 실행하세요.

```powershell
winget install jqlang.jq --source winget
winget install SQLite.SQLite --source winget
irm https://raw.githubusercontent.com/gwittebolle/claude-carbon/main/install.ps1 | iex
```

설치 프로그램은 둘을 확인하고 빠진 것에 대한 `winget` 명령을 출력하지만 직접 실행하지는 않습니다. 나머지(`bash`, `awk`, `sed`, `grep`, `date`, `curl`, `git`, `cygpath`)는 Git for Windows에 들어 있습니다.

**WSL 2.** 특별한 일이 없습니다. 배포판 안에서 `curl | bash` 설치 프로그램을 실행하세요. Claude Code, 트랜스크립트, claude-carbon 모두 Linux 쪽에 있습니다. 프로젝트가 이미 WSL에 있다면 이 경로를 선택하세요. VS Code는 Remote - WSL 확장으로 접근합니다.

**마켓플레이스 설치.** Git for Windows, `jq`, `sqlite3`가 있으면 `/plugin install claude-carbon@claude-carbon`은 macOS와 같습니다.

### Windows 세부 사항

- **Git Bash 필수.** 없으면 Claude Code가 명령을 PowerShell로 보내고 `.sh` 파일을 실행할 수 없습니다. `claude doctor`가 어떤 셸을 골랐는지 알려 줍니다. Git이 특이한 곳에 있다면 `settings.json`에서 지정하세요: `{"env": {"CLAUDE_CODE_GIT_BASH_PATH": "C:\Program Files\Git\bin\bash.exe"}}`.
- **`settings.json`의 경로는 슬래시(`/`)를 쓰세요** (`C:/Users/you/code/claude-carbon/...`). Git Bash는 따옴표 없는 역슬래시를 먹어 명령이 눈에 띄는 오류 없이 실패합니다. 설치 프로그램은 올바르게 기록하므로 수동 편집만 주의하면 됩니다.
- **슬래시 명령은 심볼릭 링크가 아니라 복사본입니다.** Git Bash는 개발자 모드 없이 실제 심볼릭 링크를 만들 수 없어 `/carbon-report` 등이 `~/.claude/commands/`에 복사되고 업데이트마다 갱신됩니다.
- **샌드박싱은 네이티브 Windows에서 사용할 수 없습니다**(Claude Code 제한). 필요하면 WSL 2를 쓰세요.
- **`/carbon-card`에는 Node.js가 추가로 필요합니다**: `winget install OpenJS.NodeJS --source winget`.
- **`winget`이 "Access is denied"(`0x80070005`)** 라면 PC 보안 소프트웨어가 막는 것입니다(백신의 행위 보호 등). 거기서 `winget`을 허용한 뒤 다시 실행하세요.
- **TLS 검사 프록시·백신 뒤**에서는 클론이 `SSL certificate problem: unable to get local issuer certificate`로 실패합니다. Git for Windows는 자체 CA 목록으로 인증서를 확인하는데, 그런 도구가 트래픽에 다시 서명한 루트를 모르기 때문입니다. Windows 인증서 저장소는 압니다. git을 그것으로 바꾸고(검증은 유지) 설치 프로그램을 다시 실행하세요: `git config --global http.sslBackend schannel`. 설치 프로그램이 이 경우를 감지하면 같은 힌트를 출력합니다. 같은 가로채기 때문에 그런 컴퓨터에서는 `winget`에 `--source winget`이 필요합니다. Microsoft Store 소스는 인증서 검증에 실패하고, 명시적 소스가 없으면 winget은 대체하지 않고 중단합니다.

CI는 Ubuntu와 함께 `windows-latest`에서 Git Bash 아래 전체 테스트 스위트와 Windows 전용 두 스위트(`tests/run-windows-e2e.sh`: 네이티브 경로의 Stop 훅·상태 줄, 훅 매니페스트를 Claude Code가 실행하는 방식으로 실행; `tests/run-install-ps1-tests.ps1`)를 실행합니다.

## 발자국 줄이기

측정이 첫 단계입니다. 아래 레버는 2026년 측정 문헌과 이 도구가 실제 트랜스크립트로 수행한 민감도 실행에서 가장 중요한 순서로 정렬했습니다. 어느 것에도 퍼센트는 붙이지 않습니다. 배출 계수의 불확실성 구간이 어떤 이득 수치보다 넓기 때문입니다. 변경 전후 여러 세션에서 `/carbon-report`를 실행하는 것이 사용자에게 적용되는 측정입니다. 각 레버의 메커니즘·방향·출처는 [docs/reduce.md](docs/reduce.md)에 있습니다.

- **모델이 생성할 때 컨텍스트를 짧게 유지하세요.** 세션 토큰 대부분이 캐시 읽기이고, 생성 토큰의 에너지는 생성되는 컨텍스트와 함께 커집니다. 작업마다 세션 하나, 주제가 바뀌면 `/clear`, 곁질문은 `/btw`, 탐색과 장황한 작업은 서브에이전트를 쓰세요.
- **캐시를 따뜻하게 유지하세요.** 프롬프트 캐시가 식은 뒤의 재개는 오래된 접두사를 다시 기록합니다. 짧은 휴식은 캐시 수명 안에 돌아오고, 긴 휴식은 새 세션으로 시작하세요.
- **작업을 묶어라.** 같은 컨텍스트에서 여러 요청을 처리하면 반복되는 입력 비용이 줄어듭니다.
- **모델을 작업에 맞춰라.** 더 작은 모델로 충분한 작업에 강력한 모델을 쓰지 마세요.
- 결과를 측정하고, 추측하지 마세요.

### 관련 프로젝트

- [ccstatusline](https://github.com/sirmalloc/ccstatusline) — Claude Code 상태 줄
- [TokenClimate](https://tokendimate.com/) — 이 도구의 비즈니스 버전

### 더 읽을거리

- [방법론](METHODOLOGY.md)
- [줄이기 안내](docs/reduce.md)
- [Claude Code 프롬프트 캐싱](https://code.claude.com/docs/en/prompt-caching)

## 왜

Claude Code는 비용은 보여 주지만 CO2는 보여 주지 않습니다. 같은 토큰이 전기로 바뀌고, 그 전력에는 배출이 따릅니다. claude-carbon은 그 값을 사용량 옆에 두어 사용자가 자신의 사용 규모를 알게 합니다. 오픈소스이며 모든 계수에 출처가 있습니다.

## 인용

이 도구나 배출 계수를 연구에 사용한다면 [방법론](METHODOLOGY.md)과 [Jegham 등 2025](https://arxiv.org/abs/2505.09598)를 인용하세요.

## 오픈소스

MIT 라이선스입니다. 기여, 이슈, PR은 [저장소](https://github.com/gwittebolle/claude-carbon)에서 환영합니다.

## 출처 및 라이선스

- 원작자: [gwittebolle](https://github.com/gwittebolle/claude-carbon)
- 원본 저장소: https://github.com/gwittebolle/claude-carbon
- 라이선스: MIT
- 한국어 번역 및 UI 현지화: claude-code-mods-ko 프로젝트

<p align="center">
  <img src="docs/homepage.jpg" alt="Tern 홈페이지 녹화가 Claude Code 안에서 재생되며 옆에 변경 사항 목록이 표시됨" width="100%">
</p>

<h1 align="center">claude-show-your-work</h1>

> 한국어판은 claude-code-mods-ko 프로젝트가 번역했습니다. 원작자와 라이선스는 문서 끝에 있으며, 영어 원문은 [README.en.md](README.en.md)에서 볼 수 있습니다.

<p align="center">터미널을 떠나지 않고 에이전트의 작업을 보고, 검토하고, 반복 개선하세요.<br>Claude Code를 위한 이미지, 비디오, 시각적 QA.</p>

<p align="center">
  <a href="https://github.com/iamumeransari/claude-show-your-work/stargazers"><img src="https://img.shields.io/github/stars/iamumeransari/claude-show-your-work?style=flat&logo=github&label=Stars&color=E3B341" alt="GitHub 스타"></a>
  <a href="#install"><img src="https://img.shields.io/badge/Claude_Code-plugin-D97757?logo=claude&logoColor=white" alt="Claude Code 플러그인"></a>
  <a href="#install"><img src="https://img.shields.io/badge/macOS_%7C_Linux-555555" alt="macOS 및 Linux"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/iamumeransari/claude-show-your-work?color=22C55E" alt="MIT 라이선스"></a>
</p>

## 설치

Claude Code에서 다음 두 명령을 실행하세요.

```
/plugin marketplace add https://github.com/iamumeransari/claude-show-your-work.git#releases
/plugin install show-your-work@iamumeransari
```

macOS와 Linux의 Ghostty 및 kitty를 지원하며 Claude Code 2.1.286 이상이 필요합니다. 비디오와 오디오에는 ffmpeg도 필요합니다. 패키지 관리자로 설치하거나(macOS에서는 `brew install ffmpeg`) Claude에 설치를 요청하세요. HTML 페이지에는 Chrome, Chromium 또는 Playwright 브라우저가 필요하고, PDF에는 poppler(`brew install poppler`)가 필요합니다.

설치가 끝나면 짧은 온보딩이 기능을 안내합니다. 언제든 `/show-your-work`를 실행해 설정을 바꿀 수 있습니다.

한국어 마켓플레이스에서는 다음 명령으로 설치합니다.

```
/plugin install show-your-work@claude-code-mods-ko
```

## 사용법

Claude가 시각적인 것을 만들거나 바꿀 때마다 채팅에 작업을 보여 줍니다. 직접 요청할 수도 있습니다.

- "홈페이지 히어로에 네 가지 방향을 주고 나란히 보여 줘."
- "가입 폼을 만들고 테스트한 뒤 녹화를 보여 줘."
- "결제 토글을 고치고 전후를 보여 줘."

### 전후 녹화로 시각적 QA하기

<p align="center"><img src="docs/qa-product.jpg" alt="새 여정 폼을 테스트하는 녹화와 옆의 변경 사항 및 검사 목록" width="100%"></p>

Claude가 기능을 만들거나 버그를 고치면 Playwright로 변경 사항을 테스트하고 실행을 녹화한 뒤 채팅에서 재생합니다. 작업을 검토하는 데 필요한 모든 것을 한곳에 모았습니다.

- **전후 비교:** 새 기능이든 버그 수정이든, Claude가 이전 버전과 새 버전에서 같은 단계를 녹화합니다. Compare가 두 녹화를 동기화해 나란히 재생합니다.
- **변경 표시자:** Claude가 만든 모든 변경이 타임스탬프와 함께 비디오 옆에 나열되며, 클릭하면 그 변경이 나타나는 순간으로 바로 이동합니다.
- **실시간 검사:** 각 테스트 검사가 비디오가 해당 지점에 도달할 때 초록 또는 빨간색으로 바뀌므로 수정이 어디서 작동하고 어디서 실패하는지 정확히 볼 수 있습니다.
- **한곳에서 검토:** 녹화와 결과가 채팅에 바로 있으므로 브라우저를 열거나 테스트를 다시 실행하거나 로그를 읽을 필요가 없습니다.

### 이미지

<p align="center">
  <img src="docs/concepts.jpg" alt="채팅에 표시된 Tern 랜딩 페이지의 네 가지 컨셉" width="49%">
  <img src="docs/breakpoints.jpg" alt="채팅에 표시된 데스크톱, 태블릿, 휴대폰 크기의 Tern 홈페이지" width="49%">
</p>

Claude가 디자인하는 것은 무엇이든 채팅에서 바로 볼 수 있습니다. 랜딩 페이지, 앱 화면, 컴포넌트, 디자인 컨셉, 슬라이드, 차트, 생성된 이미지 등입니다. 몇 가지 방향을 요청하면 나란히 표시되고, 마음에 드는 것을 골라 계속 개선할 수 있습니다.

- **방향 비교:** 여러 컨셉이 함께 표시되어 파일을 하나씩 열지 않아도 한눈에 고를 수 있습니다.
- **모든 버전 보관:** 새 버전마다 같은 플레이어에 들어오며 History로 이전 초안을 모두 돌아볼 수 있습니다.
- **전후 비교:** 이전 디자인과 새 디자인을 전환하거나 나란히 놓고 무엇이 바뀌었는지 정확히 확인하세요.

### 비디오

<p align="center">
  <img src="docs/persona.jpg" alt="채팅의 광고 페르소나" width="49%">
  <img src="docs/reel.jpg" alt="그것으로 만든 광고가 채팅에서 재생됨" width="49%">
</p>

제품 QA 외에도 Claude가 작업하는 거의 모든 것의 비디오를 보여 줄 수 있습니다. 웹사이트를 만들면서 위에서 아래로 스크롤할 때 느낌이 어떤지 보고 싶다면 요청만 하면 애니메이션까지 포함해 채팅에서 녹화가 재생됩니다.

광고, 애니메이션, 출시 비디오를 만든다면 모든 컷이 기능이 풍부한 비디오 플레이어에서 채팅에 바로 재생됩니다.

- **비디오 컨트롤:** 재생, 일시정지, 타임라인 스크럽, 원하는 순간으로 앞뒤 이동. 소리가 있는 비디오는 소리와 함께 재생되며 Mute로 세션 동안 소리를 끕니다.
- **타임스탬프:** 사이드바가 비디오에서 일어나는 일을 단계별로 안내합니다. 각 단계에 타임스탬프가 있어 클릭 한 번으로 그 순간으로 이동합니다.
- **버전 비교:** Claude가 비디오의 새 버전을 만들면 같은 플레이어에서 열립니다. History에서 초안 사이를 오가거나 이전·새 버전을 동기화해 나란히 재생할 수 있습니다.
- **빠른 기능:** QuickTime Player에서 열어 크게 보거나, 한 번의 클릭으로 Downloads 폴더에 바로 저장할 수 있습니다.

## 터미널

show-your-work는 macOS와 Linux의 Ghostty와 kitty를 지원합니다. 해당 터미널에서는 이미지가 바로 동작합니다.

- **Rex 및 Herdr 앱:** 이미지와 비디오가 그려지지만 Claude Code는 `CLAUDE_CODE_FORCE_TERMINAL_IMAGES=1`로 시작할 때만 켭니다. 알림의 Turn on pictures 버튼은 그 터미널에서만 설정하는 줄을 셸 프로필에 추가하고, 채팅을 다시 열 command를 복사합니다.
- **Warp, WezTerm, Konsole:** kitty 그래픽 프로토콜은 지원하지만 Claude Code가 이미지를 그리는 데 쓰는 유니코드 플레이스홀더는 지원하지 않아 아직 이미지를 표시할 수 없습니다.
- **Ghostty 또는 kitty 기반의 다른 터미널:** Claude Code가 인식하지 못해 이미지를 끕니다. `CLAUDE_CODE_FORCE_TERMINAL_IMAGES=1`로 시작하거나(알림이 그런 명령을 복사함) 셸 프로필에 `export CLAUDE_CODE_FORCE_TERMINAL_IMAGES=1`을 추가하세요.
- **tmux:** Ghostty 또는 kitty 안에서 동작합니다. Claude Code는 `CLAUDE_CODE_FORCE_TERMINAL_IMAGES=1` 없이 시작하면 tmux에서 이미지를 끄므로, 처음에는 플러그인이 새 tmux 패널에 켜고 알림이 그것으로 채팅을 다시 여는 command를 복사합니다. 플러그인은 자체 패널에 `allow-passthrough`도 켜고 이미지를 통과시킵니다. tmux 설정은 변경되지 않습니다.

버전 0.6.7~0.6.9에서는 Warp, WezTerm, Konsole에 Turn on pictures 버튼이 있어 셸 프로필에 줄을 추가했습니다. 이미지가 상자 그리드로 그려져 현재 플러그인이 그 줄을 스스로 제거합니다.

## FAQ

<details>
<summary><b>Claude Code가 터미널에서 이미지를 표시할 수 있나요?</b></summary>

네. show-your-work 플러그인을 사용하면 Claude Code가 터미널에서 이미지를 표시할 수 있습니다. 설치하면 Claude가 스크린샷, 디자인, 차트 및 기타 이미지를 채팅에 바로 보여 줍니다. Ghostty와 kitty에서 동작합니다.

</details>

<details>
<summary><b>Claude Code가 터미널에서 비디오를 재생할 수 있나요?</b></summary>

네. show-your-work 플러그인을 사용하면 Claude Code가 터미널에서 비디오를 재생할 수 있습니다. 화면 녹화, 애니메이션, 광고, 출시 비디오를 Claude Code 채팅 안에서 재생합니다. 스크럽, 건너뛰기, 클릭 가능한 타임스탬프, 나란한 비교를 갖춘 기능 풍부한 플레이어가 포함되어 있습니다.

</details>

<details>
<summary><b>브라우저를 열지 않고 Claude Code가 만든 것을 어떻게 보나요?</b></summary>

show-your-work 플러그인을 설치하면 Claude Code가 만든 것을 볼 수 있습니다. Claude가 시각적인 것을 만들거나 바꿀 때마다 스크린샷을 찍거나 녹화한 뒤 결과를 채팅에 보여 줍니다. 브라우저로 전환해 페이지를 직접 찾을 필요가 없습니다.

</details>

<details>
<summary><b>Claude Code가 제 앱을 테스트하고 녹화를 보여 줄 수 있나요?</b></summary>

네. show-your-work 플러그인을 사용하면 Claude Code가 앱을 테스트하고 녹화를 보여 줄 수 있습니다. Claude가 만든 기능을 Playwright로 테스트하고 실행마다 녹화한 뒤 채팅에서 재생합니다. 단계가 타임스탬프와 함께 비디오 옆에 나열되고, 각 검사가 비디오가 도달할 때 초록 또는 빨간색으로 바뀝니다.

</details>

<details>
<summary><b>변경이나 버그 수정의 전후를 보여 줄 수 있나요?</b></summary>

네. show-your-work 플러그인을 사용하면 변경이나 버그 수정의 전후를 볼 수 있습니다. Claude가 이전 버전과 새 버전에서 같은 Playwright 단계를 녹화합니다. Compare가 두 녹화를 동기화해 나란히 재생하며, 각 검사가 비디오가 도달할 때 초록 또는 빨간색으로 바뀝니다.

</details>

<details>
<summary><b>시각적 QA용 Claude Code 플러그인이 있나요?</b></summary>

네. show-your-work가 시각적 QA용 Claude Code 플러그인입니다. Claude의 Playwright 테스트 실행을 녹화해 채팅에서 재생합니다. 각 녹화에는 클릭 가능한 변경 표시자와 비디오가 진행됨에 따라 초록·빨간색으로 바뀌는 검사가 함께 있습니다. 변경이나 버그 수정은 전후를 동기화해 나란히 재생합니다.

</details>

<details>
<summary><b>Claude Code가 버그를 실제로 고쳤는지 어떻게 확인하나요?</b></summary>

가장 쉬운 방법은 show-your-work로 수정을 녹화하는 것입니다. Claude에 버그를 고치고 전후를 보여 달라고 요청하세요. 이전·새 버전이 동기화되어 나란히 재생되고, 이제 통과하는 검사는 초록색으로 표시됩니다.

</details>

<details>
<summary><b>show-your-work는 단순히 터미널에서 이미지를 보는 것과 어떻게 다른가요?</b></summary>

show-your-work는 터미널에서 이미지를 보는 것 이상입니다. 주된 강점은 시각적 QA입니다. 동기화된 전후 Playwright 녹화를 재생하고, 클릭해서 이동할 수 있는 변경 사항을 나열하며, 비디오가 진행될 때 각 검사를 초록·빨간색으로 바꿉니다. Claude Code를 떠나지 않고 기능이나 수정을 검토할 수 있습니다.

</details>

<details>
<summary><b>이미지와 비디오를 표시하면 토큰을 소모하나요?</b></summary>

아닙니다. show-your-work는 토큰과 메모리 효율을 처음부터 고려해 만들었기 때문에 추가 토큰을 거의 쓰지 않습니다. 이미지와 비디오는 kitty 그래픽 프로토콜로 터미널에 직접 그려져 토큰을 사용하지 않습니다. 비디오도 효율적으로 디코딩·스트리밍되어 메모리 사용이 매우 적습니다.

</details>

<details>
<summary><b>어떤 터미널에서 동작하나요?</b></summary>

show-your-work 플러그인은 macOS와 Linux의 Ghostty와 kitty를 지원합니다.

</details>

<details>
<summary><b>무료인가요?</b></summary>

네. show-your-work는 MIT 라이선스의 무료 오픈소스입니다.

</details>

<details>
<summary><b>새 기능과 수정이 나올 때 플러그인을 직접 업데이트해야 하나요?</b></summary>

아닙니다. 직접 업데이트할 필요가 없습니다. 플러그인이 스스로 업데이트하므로 뒤처지지 않습니다. 온보딩에서 Stable과 Latest 릴리스 중 선택하거나 언제든 `/show-your-work`로 바꿀 수 있습니다.

</details>

<details>
<summary><b>온보딩을 다시 보려면 어떻게 하나요?</b></summary>

`/show-your-work tour`를 실행하면 온보딩을 다시 볼 수 있습니다. 녹화, 전후 비교, 버전 기록, 설정을 다룹니다.

</details>

<details>
<summary><b>많은 공간을 차지하나요?</b></summary>

아닙니다. 최근 이미지와 비디오를 보관해 다시 볼 수 있게 하며, 약 1GB가 되면 가장 오래된 것을 정리합니다.

</details>

<details>
<summary><b>데이터를 수집하나요?</b></summary>

익명 사용 데이터 공유 여부는 사용자가 선택합니다. 온보딩에서 결정하거나 언제든 `/show-your-work`로 바꿀 수 있습니다. 민감한 데이터는 절대 수집하지 않습니다. 자세한 내용은 [개인정보 처리방침](PRIVACY.md)에 있습니다.

</details>

<details>
<summary><b>컴퓨터에서 무엇을 실행, 보관, 연결하나요?</b></summary>

설치하는 것이 정확히 무엇인지 알 수 있도록 플러그인이 컴퓨터에서 하는 모든 것을 설명합니다. 이미지와 비디오는 컴퓨터를 떠나지 않습니다.

이미지와 비디오를 준비하기 위해 `ffmpeg`와 `ffprobe`(비디오를 프레임으로 분해하고 길이를 읽음), macOS에서는 `sips`(이미지를 PNG로 변환)를 사용합니다. 소리가 있는 비디오를 재생하면 `ffplay`(ffmpeg의 일부)가 소리를 재생하고, macOS에서는 `osascript`가 스피커나 헤드폰이 재생하는 시간을 읽어 이미지가 소리를 기다리게 합니다. View, Show in Finder, Save to Downloads를 누르면 macOS에서는 `open`, Linux에서는 `xdg-open`으로 파일을 엽니다. macOS에서 `mdfind`는 `/img`가 붙여 넣은 이미지를 찾는 데 도움을 줍니다. HTML 페이지나 Markdown, Mermaid 문서를 표시하려면 일회용 프로필(로그인 정보는 절대 사용하지 않음)의 숨겨진 Chrome 또는 Chromium에서 렌더링하며, PDF에는 poppler의 `pdftoppm`과 `pdfinfo`를 사용합니다.

몇 가지 짧은 스크립트가 `sh`와 `perl`로 실행됩니다. `ffmpeg`와 홈 폴더를 찾고, 이미지가 맞도록 터미널 셀 크기를 읽고, 플러그인 임시 폴더를 정리하고, Linux에서 뷰어를 열고, Stable과 Latest 채널 사이를 전환합니다. 자체 임시 파일에는 `cp`, `mkdir`, `rm`, `cat`, `touch`도 사용하며, 하루 한 번 이 저장소에서 자체 업데이트를 설치하기 위해 `claude plugin`을 사용합니다. 업데이트는 끌 수 있습니다. 플러그인이 Claude Code 플러그인 디렉터리로 이동하면 자동 최신 상태를 유지하므로 업데이터는 꺼집니다.

보관하는 파일은 다음과 같습니다.

- 비디오 프레임과 변환된 이미지는 임시 폴더(`$TMPDIR/claude-show-your-work-<your user id>`)에 저장되며 일주일이 지난 것은 정리됩니다.
- Claude가 보여 준 각 파일의 사본이 버전을 돌아볼 수 있도록 프로젝트의 `.show-your-work/`에 저장됩니다.
- Save to Downloads는 `~/Downloads`에 사본을 둡니다.
- 이전 버전의 Turn on pictures가 셸 프로필에 추가한 줄이 있으면([터미널](#terminals) 참고) 그 한 줄을 제거합니다.
- `SHOW_YOUR_WORK_DEBUG=1`이면 임시 폴더에 `debug.log`를 기록합니다.

하루 한 번 `raw.githubusercontent.com`에서 플러그인의 최신 버전 번호를 읽습니다.

`/show-your-work`에서 사용 데이터 공유가 켜져 있으면 `us.i.posthog.com`으로 익명 사용 횟수를 보냅니다. 이벤트 이름과 횟수, 플러그인 및 Claude Code 버전, 터미널, 운영체제, ffmpeg 설치 여부가 무작위 설치 ID와 함께 전송됩니다. 파일 이름, 경로, 프롬프트, 입력한 내용, IP 주소는 절대 포함되지 않습니다. 코드의 키는 이벤트 전송만 가능한 PostHog 공개 키입니다.

Claude Code 안에서는 다음 훅을 사용합니다.

- `prompt.submit`은 메시지에 대한 짧은 한 줄을 보내 이 터미널이 이미지를 표시할 수 있는지(또는 왜 없는지) Claude에 알립니다. 세션마다 한 번, 압축 후, 그리고 그 상태가 바뀔 때 보냅니다.
- `prompt.submit`은 메시지를 보낼 때 설정을 닫고 붙여 넣은 이미지의 이름을 기억해 `/img`가 찾을 수 있게 합니다. 메시지는 변경되지 않습니다.
- `tool.call`은 플러그인 자체의 `show_image`, `show_video`, `show_html`, `show_audio`, `show_document` 도구를 처리합니다. 다른 도구는 건드리지 않습니다.
- `command.run`은 `/img`, `/page`, `/audio`, `/doc`, `/show-your-work`를 실행합니다. 설치 직후에는 `/show-your-work tour`를 한 번 실행해 기능을 안내합니다.
- `ui.render`는 플러그인의 플레이어, 알림, 설정, 투어를 그립니다.
- `session.start`와 `session.end`는 시작 시 임시 폴더와 터미널을 준비하고 끝날 때 대기 중인 사용량 횟수를 보냅니다. tmux 안에서는 플러그인 패널의 이미지 통과도 시작·종료합니다([터미널](#terminals) 참고).

</details>

## 피드백

버그를 보고하거나 변경을 제안하려면 [이슈를 열어 주세요](https://github.com/iamumeransari/claude-show-your-work/issues).

## 개발자용

<details>
<summary>도구, 설정, 로컬 개발</summary>

플러그인은 Claude에 다섯 도구를 제공합니다. `show_image`, `show_video`, `show_html`(HTML 페이지 스냅샷), `show_audio`(MP3 및 WAV, 파형 포함), `show_document`(PDF, Markdown, Mermaid, 페이지별). 기본 호출에는 경로만 필요합니다. 전후 비교를 위해 Claude는 이전 파일과 테스트 결과도 전달합니다.

```jsonc
{
  "path": "qa/after.webm",          // the run on the fixed version
  "compare": "qa/before.webm",      // the same steps on the old version
  "title": "Pricing page",
  "url": "http://localhost:3000/pricing",
  "changes": [                      // what changed, and the second it shows up
    { "title": "Annual toggle sets prices", "at": 3.2 },
    { "title": "Plan buttons line up", "at": 5.4 }
  ],
  "summary": [                      // the test results, at most three lines
    { "label": "Billing: toggle works", "ok": true, "passed": 1, "total": 1 },
    { "label": "Layout: plans, buttons", "ok": true, "passed": 3, "total": 3 }
  ]
}
```

비디오는 초당 최대 12프레임으로, 창이 표시하는 폭(최대 2400px)으로 잘립니다. 프레임 상한은 3600개(전체 속도로 5분)입니다. 파일을 직접 열려면 `/img path/to/file.png`를 실행하세요.

플러그인을 개발하려면 `hooks/`의 모듈(`register.tsx`가 진입점)을 편집하고 `/reload-plugins`로 변경을 로드하세요. 변경을 보내기 전에 `claude plugin validate .`와 `claude plugin test .`를 실행하세요.

</details>

## 상태

show-your-work는 활발히 유지 관리되고 있습니다. Claude Code 터미널에 이미지, 비디오, Playwright 녹화를 통한 자동 시각적 QA를 가져온 첫 플러그인입니다. 출시 비디오는 27만 5천 회 이상 조회되었습니다. 이후 터미널을 떠나지 않고 Claude가 만든 것을 보고 싶은 개발자들의 대표적인 선택이 되었습니다. 가장 큰 Claude Code 플러그인 카탈로그 일부에 등재되어 있으며 현재 Claude Code 인기 급상승 플러그인 상위권에 있습니다.

Claude Code가 작업의 스크린샷, 화면 녹화, 전후 비교를 터미널을 떠나지 않고 보여 주길 원한다면 이 플러그인이 바로 그를 위해 만들어졌습니다.

## 라이선스

[MIT](LICENSE). 예제 사진은 [Unsplash](https://unsplash.com)에서 가져왔으며 Unsplash 라이선스에 따라 사용했습니다. [개인정보 처리방침](PRIVACY.md).

<p align="center"><a href="#install"><img src="docs/end-card.jpg" alt="설치 명령이 있는 show-your-work" width="100%"></a></p>

## 출처 및 라이선스

- 원작자: [iamumeransari](https://github.com/iamumeransari/show-your-work)
- 원본 저장소: https://github.com/iamumeransari/show-your-work
- 라이선스: MIT
- 한국어 번역 및 UI 현지화: claude-code-mods-ko 프로젝트

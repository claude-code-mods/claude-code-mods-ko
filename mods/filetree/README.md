<h1 align="center">Claude Code Filetree</h1>

> 한국어판은 claude-code-mods-ko 프로젝트가 번역했습니다. 원작자와 라이선스는 문서 끝에 있으며, 영어 원문은 [README.en.md](README.en.md)에서 볼 수 있습니다.

<p align="center">
  Claude Code용 IDE 스타일 파일 트리로, Claude가 무엇을 하고 파일의 어디를 다루는지 보여 줍니다.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Claude_Code-%E2%89%A5_2.1.306-D97757?logo=claude&logoColor=fff" alt="Claude Code 2.1.306 이상">
  <img src="https://img.shields.io/badge/version-0.8.5-blue" alt="버전">
  <img src="https://img.shields.io/badge/type-mod-6f42c1" alt="Claude Code 모드">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="라이선스">
</p>

<details open>
<summary><b>Claude Code CLI</b></summary>

<p align="center">
  <img src="media/filetree-shimmer.gif" alt="Claude가 편집 중인 파일이 반짝이는 filetree" width="900">
</p>

</details>

<details>
<summary><b>데스크톱 앱의 Claude Code</b></summary>

<p align="center">
  <img src="media/0.8.2/desktop-light.png" alt="라이트 모드 데스크톱 앱의 파일 트리. Clawd 반짝임 버튼이 있는 헤더 버튼, 브랜치 행, 검색 행, 폴더가 보임" width="600">
</p>

</details>

**주요 기능:**

* 폴더의 모든 파일 표시 및 이동(Git 상태, nvim 키바인딩 지원)
* Claude가 읽거나 작업하는 위치를 애니메이션으로 표시
* 키보드 단축키:
   * `z`로 폴더 이동(zoxide 스타일)
   * `s` 또는 `i`(강조된 폴더에서), `q`(파일 내용에서)로 검색
   * `d`로 파일 또는 폴더의 모든 변경 파일 비교
* 터미널 우선 기능: 파일 미리보기, 디렉터리 크기 트리맵 등

---

## 설치

이 저장소가 곧 플러그인 마켓플레이스입니다. 터미널에서 다음을 실행하세요.

```bash
claude plugin marketplace add data-goblin/claude-code-filetree
claude plugin install filetree@claude-code-filetree
```

또는 Claude Code 세션 안에서 실행합니다.

```text
/plugin marketplace add data-goblin/claude-code-filetree
/plugin install filetree@claude-code-filetree
```

한국어 마켓플레이스에서는 다음 명령을 사용합니다.

```
/plugin install filetree@claude-code-mods-ko
```

2.1.287 이전 Claude Code에서는 `Unrecognized key: "options"` 오류로 설치가 실패합니다. `claude update`를 실행한 뒤 다시 설치하세요.

## 기능

- 현재 작업 디렉터리 또는 고정된 폴더의 파일 트리. Git, 크기, 줄 수, 날짜 열을 표시([tree](docs/tree.md))
- 모두 접기, 최대 3단계까지 모두 펼치기([tree](docs/tree.md))
- 심볼릭 링크 화살표, 에이전트 지침 파일에는 뇌 아이콘, Nerd Font/일반/텍스트 글리프([tree](docs/tree.md))
- 열리지 않은 폴더 전체에서 이름으로 검색. 대소문자 구분 또는 정규식, 폴더 하나로 범위 지정([search](docs/search.md))
- `git grep` 또는 `grep -r`로 파일 내부 검색 후 일치하는 줄로 이동([search](docs/search.md))
- `z`로 zoxide 스타일의 폴더 이동([search](docs/search.md))
- 파일·폴더별 Git 상태, 변경 파일의 줄 수, 앞서고 뒤처진 커밋이 있는 브랜치([git](docs/git.md))
- Claude가 실행하는 Git/GitHub 명령을 상태 줄로 표시([git](docs/git.md))
- Claude의 읽기, 쓰기, 커밋이 트리에서 반짝이며, 자동 접기는 열었던 폴더를 닫음([activity](docs/activity.md))
- Activity shimmer 설정은 모든 세션에서 반짝임을 끕니다. 데스크톱 앱 헤더의 Clawd 버튼으로 전환할 수 있습니다([activity](docs/activity.md))
- Claude 답변의 줄 번호가 있는 파일 참조가 해당 줄로 연결되는 링크가 됨([activity](docs/activity.md))
- Follow work는 세션을 Claude가 작업하는 저장소로 이동([activity](docs/activity.md))
- IDE 스타일 다중 선택. 음영 처리된 행이 컨텍스트로 Claude에 전달됩니다. 선택된 행 또는 최대 100개의 표시된 행([context](docs/context.md)):
  - 클릭은 행 하나를 선택하고 표시를 모두 지웁니다
  - 표시된 행이 있으면 j / k는 커서만 이동하고 `v`는 커서 아래 행을 표시하거나 해제합니다
  - shift+클릭은 마지막 클릭이나 j / k 이동 지점부터 트리 순서대로 범위를 표시합니다
  - ctrl+클릭은 파일을 열지 않고 행 하나를 표시하거나 해제합니다. macOS에서는 alt+클릭
  - 더블클릭 또는 Enter는 파일을 엽니다
  - 선택 해제 버튼은 표시된 행과 선택된 행을 모두 지웁니다
  - 표시된 행은 선택 배경으로 나오며 `y`, `Y`, `u`가 음영 행을 복사합니다
  - 표시된 행이 있으면 커서 아래 행이 데스크톱 앱에서는 강조 색으로, 터미널에서는 강조 커서 표시로 나옵니다
- 코드, Markdown, 이미지, 비디오 프레임, PDF 및 Word 페이지의 분할 미리보기([preview and treemap](docs/preview-treemap.md))
- 바이트 또는 줄 수 기준 폴더 트리맵에 Claude 활동 표시([preview and treemap](docs/preview-treemap.md))
- 파일 또는 폴더의 모든 변경 파일에 대한 diff를 패널이나 사용자의 diff 도구로 표시([diff](docs/diff.md))
- 파일을 기본 앱, tmux 또는 herdr 패널의 편집기, 또는 임의 명령으로 열기([open](docs/open.md))
- Claude의 편집으로부터 파일과 폴더를 보호하고, 저장소 밖에서 기록된 파일 확인([guards](docs/guards.md))
- 키보드 중심 조작: vim 스타일 이동, 단축키 오버레이, 터미널에서 alt+l / alt+h([keys](docs/keys.md))
- `/filetree` 명령과 터미널·데스크톱 앱에서 패널이 표시되는 위치([sidebar](docs/sidebar.md))

<img src="media/filetree-git.gif" alt="커밋된 파일이 초록색으로 반짝이고 하단에 커밋이 표시됨" width="800">

<img src="docs/media/preview-media.gif" alt="이미지, 비디오, 2페이지로 넘어간 PDF, Word 문서가 미리보기에 표시됨" width="800">

## 설정

모든 설정은 `/config`의 filetree 아래에 있으며 각각 설명이 있습니다.

```yaml
Claude activity:  reads and writes | writes | reads | none
Activity shimmer: on | off
Follow Claude:    on | off
Jump moves Claude: tree and Claude | tree
Right-click copies: relative | absolute
Follow work:      on | off
Open at start:    on | off
Focus on open:    on | off
Right column:     date | age | size | loc | files
Date format:      year-month-day | day-month | month-day
Clock:            24h | 12h
Long file:        500 | a line count | off
Remote branch:    off | on
Hints:            on | off
Search spacing:   on | off
Column headers:   on | off
Auto-collapse:    off | on
Shortcuts:        auto | always | off
Open with:        empty | editor | preview | a command with {path} and {dir}
Binary files:     Open with | default app
Edit with:        empty | a command with {path} and {line}
Diff with:        empty | a command such as "hunk diff --" or "lazygit -f"
Diff groups:      folder | kind | off
Terminal target:  auto | pane right | pane below | tab | workspace
Ignore:           names to hide, such as ".cache .tmp"
Preview pane:     bottom | top
Treemap:          auto | image | cells | off
Palette:          key=#hex pairs over the terminal colors
Glyphs:           auto | nerd | plain | text
```

터미널에서 강조 색은 폴더, 루트, 커서, 검색 일치 항목, 셀 트리맵의 최상위 상자에 적용됩니다. 어두운 Claude 테마에서는 터미널의 밝은 파란색, 밝은 테마에서는 파란색입니다. Palette의 `accent=#hex`가모든 것에에 다른 색을 지정합니다.

Follow work는 [Claude activity](docs/activity.md)에 설명되어 있습니다.

Open at start는 `/clear`를 포함한 모든 새 세션에 적용됩니다. `/filetree`로 트리를 열거나 닫으면 그 선택은 다음 `/clear`까지 유지됩니다. `/clear` 후에는 Open at start 설정에 따라 트리가 열리거나 닫힙니다.

## 요구 사항

```yaml
required:  Claude Code 2.1.306 or newer, git
optional:
  inotifywait:            live updates on Linux (inotify-tools)
  magick or ffmpeg:       images other than PNG, video frames
  pdftoppm or gs:         PDF pages
  soffice:                Word and office pages
  pandoc, pdftotext:      document text in tmux, herdr and other terminals
  tmux or herdr:          an editor or diff tool in a new pane
  Nerd Fonts 3.2+:        icons for Glyphs auto, which draws plain Unicode without one or with an older one
pictures:  Ghostty or kitty, outside tmux and herdr, on Linux and macOS
```

## 고려 사항

- 데스크톱 앱에는 분할 미리보기나 트리맵이 없습니다
- 데스크톱 앱은 한 번에 최대 4줄만 반짝입니다. 그 이상은 색으로 표시되지만 반짝이지 않으며, 터미널에서는 모두 반짝입니다. 패널이 너무 많이 차면 헤더의 Clawd 버튼이나 Activity shimmer 설정으로 반짝임을 끌 수 있습니다
- 데스크톱 앱은 커서 주변 최대 150줄만 그리며, 행이 깊거나 경로가 길거나 Git 변경 사항이 있으면 줄 수가 줄어듭니다. 생략된 줄 수가 표시됩니다
- GIF와 비디오는 정지 프레임 하나만 표시됩니다
- Windows에서는 파일 목록으로 폴더 크기를 계산하며 트리맵은 한 단계만 그립니다
- 행 클릭에는 herdr 0.9.1 이상이 필요합니다. `herdr update`를 실행하세요

## 기여하기

`main`이 아닌 릴리스 브랜치를 대상으로 풀 리퀘스트를 여세요.

- 수정: 패치 브랜치(예: `release/0.8.2`)
- 기능: 마이너 브랜치(예: `release/0.9.0`)

해당 브랜치의 버전을 유지하세요.

클론마다 한 번 git 훅을 켜세요. pre-commit 훅은 몇 초 안에 빠른 검사를 실행합니다. grep 규칙, 타입, oxlint, 매니페스트가 변경되면 `claude plugin validate`입니다. pre-push 훅은 버전을 릴리스 브랜치와 대조하고 플러그인 테스트를 실행합니다.

```bash
git config core.hooksPath .githooks
```

같은 검사가 플러그인을 건드리는 모든 푸시에서 macOS, Windows, Linux CI에서 실행됩니다.

## 라이선스

[MIT](LICENSE). 트리맵 레이블은 Dimitar Zhekov의 [Terminus Font](https://terminus-font.sourceforge.net/) 글리프를 사용합니다(Lat2-Terminus16, SIL Open Font License 1.1).

*이 프로젝트는 제 Omarchy 앱 [FileBlade](https://github.com/data-goblin/fileblade)에서 영감을 받았습니다.*

## 출처 및 라이선스

- 원작자: [data-goblin](https://github.com/data-goblin/filetree)
- 원본 저장소: https://github.com/data-goblin/filetree
- 라이선스: MIT
- 한국어 번역 및 UI 현지화: claude-code-mods-ko 프로젝트

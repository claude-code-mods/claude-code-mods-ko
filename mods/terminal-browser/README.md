# terminal-browser Claude Code 플러그인

> 한국어판은 claude-code-mods-ko 프로젝트가 번역했습니다. 원작자와 라이선스는 문서 끝에 있으며, 영어 원문은 [README.en.md](README.en.md)에서 볼 수 있습니다.

> 이 플러그인은 실험적이며 [알려된 제한](#caveats)이 있습니다.

https://github.com/user-attachments/assets/a79e7667-6fcb-49a4-9967-44d0f942102c

## 설치

terminal-browser 설치:
```
curl -fsSL https://terminal-browser.sh/install | bash # or brew install terminal-browser
```

최신 버전의 Claude Code를 사용하고 있는지 확인하세요.
```
claude update
```

`~/.claude/settings.json`에 다음을 추가해 Claude Code UI 플러그인을 활성화합니다.
```json
{
  "env": { "CLAUDE_CODE_ENABLE_FUNCTION_HOOKS": "1" }
}
```

terminal-browser 플러그인 설치:
```
# set the marketplace
claude plugin marketplace add zenbu-labs/terminal-browser

# install the plugin
claude plugin install terminal-browser@terminal-browser
```

이제 Claude Code 안에서 "/browser"를 실행해 브라우저를 열 수 있습니다.

### 업데이트

Claude Code 플러그인 업데이트:
```
claude plugin update terminal-browser@terminal-browser
```

terminal-browser 업데이트:
```
terminal-browser upgrade
```

### 구성

Claude가 브라우저를 열 수 있는 도구를 사용하도록 terminal-browser 플러그인을 구성할 수 있습니다. Claude는 이미 `terminal-browser` CLI로 터미널 안의 분할 창에서 브라우저를 열 수 있으므로 기본값은 꺼져 있습니다. ` ~/.claude/settings.json`에 다음을 추가하면 도구를 켤 수 있습니다.

```json
{
  "pluginConfigs": {
    "terminal-browser@terminal-browser": {
      "options": {
        "agentTool": true
      }
    }
  }
}
```

## terminal-browser 플러그인 API

terminal-browser 플러그인에는 다른 Claude Code 플러그인 안에서 브라우저를 프로그래밍 방식으로 열고 URL을 불러올 수 있는 API가 포함되어 있습니다. 이로 만들 수 있는 유용한 플러그인 예시는 다음과 같습니다.
- Claude Code 분할 창에서 tldraw를 여는 `/tldraw` 슬래시 명령
- 작업 중인 브랜치에 연결된 PR을 여는 `/open-pr` 슬래시 명령

```typescript
export type BrowserOpenInput = { url?: string }

export type BrowserOpenResult =
  | { ok: true; url: string }
  | { ok: false; error: string }

export type Browser = {
  open: (input: BrowserOpenInput) => Promise<BrowserOpenResult>
  close: (input?: Record<string, never>) => Promise<boolean>
}

// usage: in your plugin's hooks module
on('command.run', { command: 'tldraw' }, async ($) => {
  const result = await $.browser.open({ url: 'https://www.tldraw.com/' })
  return { text: result.ok ? 'Opened tldraw' : result.error }
})
```

## 동작 방식

terminal-browser는 [kitty graphics protocol]을 사용해 실제 브라우저가 생성한 픽셀을 터미널 안에 표시합니다. Claude Code 안에 브라우저를 표시하기 위해 Claude Code의 새로운 [함수 훅 API](https://github.com/anthropics/claude-code/issues/91870)를 사용합니다.

terminal-browser의 내부는 JavaScript 라이브러리로 분리되어 있습니다 - https://github.com/zenbu-labs/terminal-browser/tree/main/pixel . Claude Code/터미널 안에서 자신만의 그래픽 애플리케이션을 만들고 싶다면 참고하세요.

## 지원 터미널

terminal-browser Claude Code 플러그인은 [kitty graphics protocol]을 지원하고 [kitty unicode placeholders](https://sw.kovidgoyal.net/kitty/graphics-protocol/#unicode-placeholders)을 구현한 터미널에서만 동작합니다. 이 기능을 지원하는 가장 널리 쓰이는 터미널은 다음과 같습니다.
- [ghostty](https://ghostty.org)
- [kitty](https://sw.kovidgoyal.net/kitty/)

터미널이 필요한 기능을 지원하지 않으면 Claude Code 안에서 브라우저를 열려고 할 때 TUI가 깨질 수 있습니다.

libghostty를 기반으로 한 터미널도 이 기능을 지원합니다. 예시는 다음과 같습니다.
- [cmux](https://cmux.com/)
- [supacode](https://supacode.sh/)

더 많은 libghostty 기반 터미널은 [awesome-libghostty](https://github.com/Uzaaft/awesome-libghostty)에서 찾을 수 있습니다.

터미널이 필요한 그래픽 기능을 지원하더라도 멀티플렉서를 사용하면 플러그인이 동작하지 않을 수 있습니다. 멀티플렉서는 터미널 프로그램의 출력을 다시 써서 터미널 그래픽 명령을 깨뜨리기 때문입니다. tmux 지원이 곧 제공될 예정입니다(terminal-browser는 현재 tmux에서 동작하지만 Claude Code 플러그인을 통해서는 아직 안 됩니다). herdr 안에서는 Claude Code 플러그인을 통해 실행할 때 성능이 매우 나쁘지만 곧 개선될 가능성이 큽니다. 다른 멀티플렉서는 테스트하지 않았으므로 동작하지 않으면 이슈를 올려 주세요. 지원 가능한지 확인해 보겠습니다.

## 주의 사항:
- [kitty graphics protocol]을 지원하는 터미널에 따라 좌우됩니다.
- Claude Code가 픽셀 좌표 마우스 보고를 켜지 않으므로 마우스 위치가 때때로 약간 어긋납니다.
- 플러그인은 terminal-browser CLI와 통신하기 위해 로컬 HTTP 서버에 fetch 요청을 보내야 합니다. 운영체제에서 터미널이 로컬 네트워크에 접근하려 한다는 메시지가 나타날 수 있습니다.
- Claude Code가 채팅 영역의 최소 너비를 매우 크게 설정하므로 브라우저를 원하는 크기로 조절할 수 없는 경우가 있습니다.
- 플러그인은 불안정한 실험적 함수 훅 Claude Code API에 의존하므로 릴리스 사이에 동작이 깨질 수 있습니다.

[kitty graphics protocol]: https://sw.kovidgoyal.net/kitty/graphics-protocol/

## 설치 (한국어 마켓플레이스)

```
/plugin install terminal-browser@claude-code-mods-ko
```

## 출처 및 라이선스

- 원작자: [zenbu-labs](https://github.com/zenbu-labs/terminal-browser)
- 원본 저장소: https://github.com/zenbu-labs/terminal-browser
- 라이선스: MIT
- 한국어 번역 및 UI 현지화: claude-code-mods-ko 프로젝트

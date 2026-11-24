# prismantis

> 한국어판은 claude-code-mods-ko 프로젝트가 번역했습니다. 원작자와 라이선스는 문서 끝에 있으며, 영어 원문은 [README.en.md](README.en.md)에서 볼 수 있습니다.

Claude의 답변을 컬러로 다시 그리는 Claude Code 모드입니다. 표, 제목, 목록, 인용문, 강조 코드, 숫자, 경로와 링크, mermaid 다이어그램과 차트, 도구 행을 17개 테마로 표시하며 복사 버튼을 제공합니다. `/prismantis setup`으로 외형을 선택하고, `/prismantis demo`로 그리는 모든 항목을 확인하세요.

스크린샷, 모든 옵션, 변경 내역은 [전체 README](https://github.com/NahumLitvin/prismantis#readme)에 있습니다.

## 실행, 읽기, 변경 내용

Prismantis는 네트워크 호출을 하지 않습니다. 아래 모든 것은 여러분의 컴퓨터 안에 머뭅니다.

- **프로그램.** `⧉ html` 또는 `▣ png`를 클릭하면 복사된 표, 다이어그램, 그림을 표준 입력으로 받아 클립보드 도우미를 실행합니다. macOS에서는 `osascript`, Windows에서는 `powershell.exe`(`SystemRoot`를 읽어 찾음), Linux에서는 `copyq`를 사용합니다. `latex`가 켜져 있으면 답변의 수식을 표준 입력으로 `PATH`의 `ratex-render`를 실행합니다. 그 외에는 아무것도 실행하지 않습니다.
- **파일.** 답변이 Markdown 이미지로 연결한 로컬 PNG(최대 2MB)를 읽어 kitty 또는 Ghostty에 그립니다. `ratex-render`가 `$TMPDIR/prismantis-latex-<session>-<id>`에 쓴 PNG를 다시 읽습니다. 파일을 직접 쓰지는 않습니다.
- **설정.** `/prismantis setup`과 `/prismantis theme`은 `/config`를 통해 선택 사항을 prismantis 자체 옵션(`prismantis.theme`, `prismantis.tableStyle` 및 기타 설정 단계)에만 저장합니다. 다른 설정은 변경되지 않습니다.
- **데스크톱 앱 색상.** `desktopColors`가 `match`일 때만 세션 시작 시와 `/prismantis theme` 실행 시 현재 팔레트로 `$.theme.set`을 사용해 해당 세션의 데스크톱 앱 색상을 설정합니다. `desktopColors`를 `off`로 되돌리면 `$.theme.clear()`를 한 번 호출합니다. 세션 시작 시나 다시 로드할 때는 지우지 않습니다.
- **훅.** `ui.render`로 그리며, `command.run`으로 `/prismantis` 명령에 응답하고, `config.set`에서 자신의 `desktopColors` 항목을 감시하며, `prompt.submit`에 모델 전용 [다이어그램 힌트](https://github.com/NahumLitvin/prismantis#diagram-hints) 메모와 `keyPointHint`가 켜져 있으면 핵심 사항 메모를 추가하고, `engine.create`에서 [다른 모드](https://github.com/NahumLitvin/prismantis#other-mods)를 위해 `$.prismantis.markdown`을 추가합니다. `prismantis.markdown`은 그 호출 자체의 이벤트입니다.

## 라이선스

[MIT](LICENSE). 저작자는 Nahum Litvin입니다. 포함된 서드파티 코드와 팔레트는 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)에 명시되어 있습니다.

## 설치

```
/plugin install prismantis@claude-code-mods-ko
```

## 출처 및 라이선스

- 원작자: [NahumLitvin](https://github.com/NahumLitvin/prismantis)
- 원본 저장소: https://github.com/NahumLitvin/prismantis
- 라이선스: MIT
- 한국어 번역 및 UI 현지화: claude-code-mods-ko 프로젝트

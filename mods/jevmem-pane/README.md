# jevmem 패널

> 한국어판은 claude-code-mods-ko 프로젝트가 번역했습니다. 원작자와 라이선스는 문서 끝에 있으며, 영어 원문은 [README.en.md](README.en.md)에서 볼 수 있습니다.

채팅 옆에 붙는 Claude Code용 사이드 패널로, 방금 보낸 프롬프트와 방금 끝난 턴에 대해 [jevmem](https://github.com/Avinash-jetwani/jevmem)이 무엇을 했는지 보여 줍니다.

1. **이 프롬프트에서 회상된 항목**: Claude에 제공된 각 메모리 줄( id, 종류, 내용)과 보류된 줄의 수.
2. **가드**: 가드가 마지막으로 질문하거나 거부한 호출과, 그 호출에 맞는 규칙 및 점수.
3. **지난 턴에서 저장된 항목**: jevmem이 해당 턴에서 저장한 줄과 그 종류, 또는 해당 턴을 건너뛴 이유.

각 줄에는 `why`, `wrong`, `forget` 버튼이 있습니다. `forget`과 `wrong`은 `JEVMEM.md`를 변경하므로(해당 줄은 `[retired]`로 유지됨) 먼저 확인을 요청합니다. 규칙은 터미널에서만 폐기됩니다. `jevmem trust`가 그렇게 동작하기 때문입니다. 패널은 `.jevmem/` 아래의 로컬 파일 세 개를 읽고 `jevmem` 명령을 인자 배열로 실행합니다. 어디로도 데이터를 보내지 않으며 키를 읽지 않습니다.

## 설치

Claude Code에서 jevmem 마켓플레이스를 추가한 뒤(`claude plugin marketplace add Avinash-jetwani/jevmem`) 다음을 실행합니다.

```
/plugin install jevmem-pane@jevmem
```

`jevmem` 명령(`npm install -g jevmem`)과 켜져 있는 프로젝트(`jevmem setup`)가 필요합니다. 터미널 폭이 144열 이상이면 패널이 자동으로 열립니다. `/jevmem`은 어떤 폭에서도 패널을 열거나 닫습니다(전체 화면 터미널에서는 110열부터 채팅 옆에 도킹되고, 그 미만에서는 프롬프트 위에 표시됩니다). Claude Code 전용이며 Cursor에는 패널이 없습니다.

각 상태의 의미를 포함한 전체 설명은 [docs/pane.md](https://avinash-jetwani.github.io/jevmem/pane/)에 있습니다.

## 한국어 마켓플레이스 설치

```
/plugin install jevmem-pane@claude-code-mods-ko
```

## 출처 및 라이선스

- 원작자: [Avinash-jetwani](https://github.com/Avinash-jetwani/jevmem)
- 원본 저장소: https://github.com/Avinash-jetwani/jevmem
- 라이선스: MIT
- 한국어 번역 및 UI 현지화: claude-code-mods-ko 프로젝트

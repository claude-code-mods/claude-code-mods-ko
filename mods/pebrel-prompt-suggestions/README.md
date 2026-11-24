# Claude Code 네이티브 프롬프트 예측

> 한국어판은 claude-code-mods-ko 프로젝트가 번역했습니다. 원작자와 라이선스는 문서 끝에 있으며, 영어 원문은 [README.en.md](README.en.md)에서 볼 수 있습니다.

이 관리형 어댑터는 Claude Code의 네이티브 함수 훅을 사용합니다. Claude Code 2.1.310에서 검증되었으며, 이전 버전은 지원된다고 주장하지 않습니다. 새 프로세스에 `--plugin-dir <absolute-adapter-directory>`와 `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1`을 설정해 로드합니다. 어댑터를 로드한다고 해서 사용자의 전역 Claude 설정에 설치되는 것은 아닙니다.

실행 프로그램은 `PEBREL_PREDICTION_ENDPOINT`(포트가 포함된 HTTP IPv4 루프백 주소), `PEBREL_PREDICTION_TOKEN`, `CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION=false`를 제공해야 합니다. 마지막 변수는 해당 프로세스에서 Claude Code 내장 예측 추론을 끕니다. 이것이 없으면 어댑터는 아무 동작도 하지 않으며, 같은 완료 턴에 대해 두 번 추론 요청이 발생하는 것을 막습니다. 전역 설정이나 주 모델 설정은 변경되지 않습니다.

성공한 메인 턴이면서 터미널 입력창이 비어 있고 마운트된 상태일 때만 예측 자격이 생깁니다. `$.session.messages()`가 메모리 내 사용자/어시스턴트 텍스트를 제공하며, 도구 페이로드는 전송되지 않습니다. 브리지는 최대 24개 메시지, 메시지당 3000 UTF-16 단위, 전체 12000 단위까지만 받습니다. 예측 프롬프트, 구성된 공급자, 언어 및 추가 컨텍스트 제한은 Pebrel이 관리합니다. 어댑터는 말투 프롬프트나 영속성을 추가하지 않습니다.

현지화된 브리지의 `loading_text`가 Claude Code의 흐린 `PromptHint` 하단에 표시되고, 400밀리초마다 `.`, `..`, `...`가 이어집니다. 편집할 수 없으며 `prompt.suggest`로 전송되지 않습니다. 후보가 완료되면 네이티브 `$.prompt.suggest({text})`를 호출하므로, 네이티브 Tab/오른쪽 화살표 동작으로 입력창을 채우되 제출하지는 않습니다. 입력창은 항상 Claude Code가 소유합니다.

편집, 프롬프트 변경, 새 턴, 세션 종료, 10초 제한 시간은 대기 중인 UI 작업을 무효화합니다. 모든 결과는 리비전, 세션, 빈 초안을 다시 확인합니다. 네이티브 `http.fetch` API에는 중단 신호가 없습니다. 여기서 취소는 오래된 결과를 억제할 뿐이며, 네트워크/요청 제한 시간은 브리지가 담당합니다. 예측 UI가 유휴 상태일 때 디스크 폴링이나 타이머는 남지 않습니다.

동작 계약은 `node --test tests/*.test.mjs`로, 실제 Claude 스캐너는 `claude plugin validate --strict --json <adapter-directory>`로 실행합니다. 목 테스트는 네이티브 터미널의 시각적 승인이나 테스트되지 않은 Claude 버전과의 호환성을 입증하지 않습니다.

## 설치

```
/plugin install pebrel-prompt-suggestions@claude-code-mods-ko
```

## 출처 및 라이선스

- 원작자: [Kuddev](https://github.com/Kuddev/pebrel)
- 원본 저장소: https://github.com/Kuddev/pebrel
- 라이선스: GPL-3.0
- 한국어 번역 및 UI 현지화: claude-code-mods-ko 프로젝트

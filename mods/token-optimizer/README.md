# Token Optimizer Desktop

> 한국어판은 claude-code-mods-ko 프로젝트가 번역했습니다. 원작자와 라이선스는 문서 끝에 있으며, 영어 원문은 [README.en.md](README.en.md)에서 볼 수 있습니다.

Claude 데스크톱 앱용 상태 줄입니다. 프롬프트 위에 표시되며 세션 품질, 컨텍스트 사용량, 캐시 카운트다운, 5시간 및 주간 한도를 보여 줍니다. Clawd가 세션에서 하는 일을 연기합니다.

## 설치

Token Optimizer 플러그인에 포함되어 있습니다(`hooks/hooks.json`이 이 폴더의 `hooks/register.tsx`를 `modules` 아래에 지정함). 별도로 설치할 것은 없습니다. 이 폴더가 자체 매니페스트를 유지하는 이유는 테스트를 `claude plugin test`로 독립 실행하기 위해서입니다. `npm run typecheck`와 `npm test`는 순수 모듈(CI)을 검사하고, `npm run typecheck:engine`은 `hooks/`와 `tests/engine/`을 Claude Code의 플러그인 API 선언에 대해 검사합니다. 이 선언은 claude CLI만 기록하므로 로컬에서 실행합니다.

Claude Code 2.1.287 이상과 Anthropic의 모드 기능이 필요합니다. Anthropic은 모드를 원격으로 끌 수 있으며, 꺼져 있어도 아무것도 깨지지 않고 줄만 표시되지 않습니다. 터미널은 기존 상태 줄을 유지합니다. VS Code는 지원되지 않습니다.

활성화 여부를 확인하려면 Token Optimizer 플러그인을 켠 Claude 데스크톱 세션을 여세요. Clawd와 캐시 카운트다운이 있는 Token Optimizer 띠가 프롬프트 위에 있는지 찾아보세요. 없다면 플러그인이 활성화되어 있는지, 모드를 사용할 수 있는지, `TOKEN_OPTIMIZER_STATUS_BAR`가 `0`이 아닌지 확인한 후 세션을 다시 시작하세요. 플러그인의 `hooks/hooks.json`은 `desktop/token-optimizer-desktop/hooks/register.tsx`를 등록합니다.

세션을 소모하지 않고 예약(booking)을 확인하려면 `python3 <plugin>/skills/token-optimizer/scripts/measure.py mod-action --selftest`를 실행하세요. `PASS` 또는 `FAIL`을 출력하며 임시 데이터 디렉터리를 사용합니다. 실패한 동작 진단은 Token Optimizer 데이터 디렉터리의 `mod-actions.log`에 기록됩니다.

## 제공되는 것

- 가장 급한 일에 대한 한 문장과, 최대 한 개의 버튼.
- 마우스를 올리면 카드가 나오는 다섯 개 표시: 품질 등급, 컨텍스트 사용량, 캐시 카운트다운, 5시간 한도, 주간 한도.
- **Clawd 옆의 화살표**를 펼치면 한 줄이 더 나옵니다: 브랜치, 세션 시간, 도구 호출, 압축(있을 경우), 마지막 체크포인트 저장 시각(모든 종류 또는 이전 세션의 관련 체크포인트), 그리고 Token Optimizer가 최근 30일간 절약한 토큰 수(대시보드와 동일한 총계).
- 버튼: **정리(Clean up)**(Token Optimizer의 안내에 따라 압축), **새로 시작(Start fresh)**(두 번째 클릭은 체크포인트를 저장하고 초기화한 뒤 첫 메시지로 전달), **따뜻하게 유지(Keep warm)**(캐시가 따뜻할 때만 수동 원클릭 캐시 갱신, 자동으로 실행되지 않으며 소량의 사용량을 소비).
- **전체 대시보드**: 펼친 줄 끝의 일반 텍스트 링크로, 두 가지 띠 크기 모두에 있습니다(접힌 띠에는 표시되지 않음). 클릭하면 `measure.py dashboard`가 실행됩니다. `token-dashboard` 스킬과 동일한 명령으로, 대시보드 페이지를 다시 생성하고 기본 브라우저에서 엽니다(macOS에서는 `open`, Linux에서는 `xdg-open`, Windows에서는 파일 연결). 실행 중에는 띠에 "Opening the dashboard."가 표시되고, 실패하면 몇 초 동안 "Could not open the dashboard."가 표시된 뒤 아무 일도 일어나지 않습니다. 실행 중 두 번째 클릭은 무시됩니다. 이 링크는 `plain` 스타일로 그린 Button입니다(프로퍼티는 Claude Code 2.1.287, 2.1.294, 2.1.296의 Button 허용 목록에 있으며 각 빌드의 문자열에서 확인했습니다. 2.1.294~2.1.296에서 실행). 클릭 시 `measure.py dashboard --user`가 실행됩니다. `--user`는 사람의 클릭임을 표시해 20초 훅 예산이 무거운 재생성을 중단하지 않도록 합니다(실제 무거운 기록에서는 콜드 상태로 약 80초). 띠는 최대 5분까지 기다립니다. 이 링크만 그렇게 오래 기다립니다. 정리와 새로 시작은 여전히 2분 뒤 포기합니다.

캐시 카운트다운은 추정치입니다. Claude 플랜에서는 1시간, API에서는 5분이며 가능하면 세션 자체에서 측정합니다.

## 설정

`~/.claude/settings.json`의 `env` 블록에서 `TOKEN_OPTIMIZER_STATUS_BAR=0`은 띠를 숨기고, `TOKEN_OPTIMIZER_STATUS_BAR_ANIMATE=0`은 Clawd를 가만히 둡니다. `TOKEN_OPTIMIZER_STATUS_BAR_TIME_FORMAT=24h`(또는 `12h`)는 한도 갱신 시각에 사용할 시계를 고정하며, 설정하지 않으면 로케일을 따릅니다.

화살표 옆의 `–` 버튼은 띠를 한 줄로 줄이고 `+`는 되돌립니다. 화살표는 여전히 아래 상세 행을 펼치며, 선택은 세션과 재시작을 넘어 기억됩니다. `TOKEN_OPTIMIZER_STATUS_BAR_SIZE=slim`은 선택이 저장되기 전의 시작 크기를 설정하며, 터미널 상태 줄도 같은 변수로 한 줄을 출력합니다.

컨텍스트 표시는 사용자가 직접 압축 창을 설정한 경우 그 창을 기준으로 측정합니다. `CLAUDE_CODE_AUTO_COMPACT_WINDOW`, `/autocompact`, `autoCompactWindow` 설정이 해당하며, Claude Code의 100K~1M 범위 안에서 모델 윈도우를 넘지 않습니다. 한 번의 실행에 `--autocompact`로만 지정한 창은 보이지 않습니다.

## 전체 문서

[Token Optimizer README](../../README.md#desktop-status-bar)와 문서 사이트의 "Claude desktop app" 페이지를 참고하세요.

CLI를 통해 Keep warm 시도를 예약하려면 표준 입력으로 JSON 영수증을 보내세요.

```bash
printf '%s' '{"action":"warm-prepare","action_id":"ATTEMPT_ID","session_id":"SESSION_ID","timestamp":UNIX_SECONDS,"transcript_path":"/path/to/SESSION_ID.jsonl","byte_size":FILE_SIZE,"transcript_mtime":FILE_MTIME}' | python3 <plugin>/skills/token-optimizer/scripts/measure.py mod-action
```

자리표시자를 현재 트랜스크립트의 정확한 파일 크기와 수정 시각, 고유한 시도 ID, 현재 Unix 시각으로 바꾸세요. 응답은 JSON입니다. 이 호출은 예약만 하며, 호출자가 실제 warm 요청을 수행하고 사용량을 `warm` 영수증으로 제출하거나, 실행하지 않았다면 `warm-cancel`을 보내야 합니다.

## 설치 (한국어 마켓플레이스)

```
/plugin install token-optimizer@claude-code-mods-ko
```

## 출처 및 라이선스

- 원작자: [alexgreensh](https://github.com/alexgreensh/token-optimizer)
- 원본 저장소: https://github.com/alexgreensh/token-optimizer
- 라이선스: NOASSERTION
- 한국어 번역 및 UI 현지화: claude-code-mods-ko 프로젝트

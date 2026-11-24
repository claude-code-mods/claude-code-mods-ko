# Agent Standup 상태 줄

> 한국어판은 claude-code-mods-ko 프로젝트가 번역했습니다. 원작자와 라이선스는 문서 끝에 있으며, 영어 원문은 [README.en.md](README.en.md)에서 볼 수 있습니다.

![Agent Standup](.claude-plugin/icon.png)

이 컴퓨터의 다른 Claude Code 세션이 당신을 필요로 하면 프롬프트 위에 한 줄이 표시됩니다.

    ✋ web-shop (VS Code) needs an approval
    Agent Standup · /agent-standup:open shows them all   Hide

또한 그 세션이 당신을 기다리기 시작하거나 턴을 마치면 짧은 알림이 나타납니다. 작업 중인 세션을 그대로 유지하면서도, 다른 세션이 질문이나 승인에서 멈춰 있는지 알 수 있습니다.

이것은 Claude Code 함수 훅 플러그인인 모드입니다. 터미널과 Claude 데스크톱 앱의 Code 탭에 표시됩니다. VS Code에서는 [Agent Standup 확장](https://marketplace.visualstudio.com/items?itemName=DoubleGeste.agent-standup)이 상태 표시줄에 동일한 내용을 보여 줍니다.

## 설치

Claude Code 2.1.294 이상에서 다음을 실행합니다.

    /plugin install agent-standup-band --marketplace Atoll92/agent-standup

이전 버전에서는 로드되지만 아무 동작도 하지 않습니다. 해당 버전은 모드를 실행하지 않으며(2.1.221 이전 터미널, 그 외 환경에서는 2.1.269 이전 버전은 이 모드가 읽는 상태도 기록하지 않습니다).

모든 세션을 실시간 팀 통화처럼 보려면 메인 플러그인도 설치하세요: `/plugin install agent-standup --marketplace Atoll92/agent-standup`, 그다음 `/agent-standup:open`을 실행합니다.

## 읽고 실행하는 것

- 4초마다 Claude Code가 열린 세션마다 보관하는 상태 파일 `~/.claude/sessions/<pid>.json`(또는 `CLAUDE_CONFIG_DIR` 아래)을 읽습니다. 세션 ID, 폴더, 사용 중/유휴/대기 중 여부를 확인합니다. 대화 내용은 읽지 않습니다. `claude -p`로 실행된 프로그램이 시작한 세션은 제외됩니다. 그 세션의 질문은 해당 프로그램으로 전달되기 때문입니다. Agent SDK 앱(Zed, 직접 만든 앱 등)은 사람에게 메뉴를 표시할 수 있으므로 포함됩니다.
- `ps`를 실행해 대기 중이라고 표시된 세션이 실제로 살아 있는지 확인합니다. 충돌한 세션은 상태 파일을 남겨 두기 때문입니다.

아무것도 기록하지 않고 어디로도 전송하지 않습니다.

## 더 보기

소스 및 이슈: https://github.com/Atoll92/agent-standup. 비공식 프로젝트이며 Anthropic과 관련이 없고 Anthropic의 승인을 받지 않았습니다. MIT 라이선스입니다.

## 출처 및 라이선스

- 원작자: [Atoll92](https://github.com/Atoll92/agent-standup)
- 원본 저장소: https://github.com/Atoll92/agent-standup
- 라이선스: MIT
- 한국어 번역 및 UI 현지화: claude-code-mods-ko 프로젝트

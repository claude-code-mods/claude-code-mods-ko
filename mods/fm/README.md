# fm

> 한국어판은 claude-code-mods-ko 프로젝트가 번역했습니다. 원작자와 라이선스는 문서 끝에 있으며, 원문 README가 없어 플러그인 설명을 기준으로 작성했습니다.

Claude Code용 Firstmate Calm: 작업 중 돛단배 애니메이션과 대화 전용 기록 화면을 제공하고, Pi Calm 확장과 home별 config/calm 설정을 공유합니다. 훅 모듈은 CLAUDE_CODE_ENABLE_FUNCTION_HOOKS 또는 Claude Code의 tengu_plugin_hooks_modules 롤아웃 플래그로 로드될 수 있지만, CLAUDE_CODE_ENABLE_FUNCTION_HOOKS가 정확히 1일 때만 동작하며 그 외에는 완전한 무동작(no-op)입니다.

## 설치

```
/plugin marketplace add claude-code-mods/claude-code-mods-ko
/plugin install fm@claude-code-mods-ko
```

## 출처 및 라이선스

- 원작자: [Firstmate](https://github.com/kunchenguid/firstmate)
- 원본 저장소: https://github.com/kunchenguid/firstmate
- 라이선스: MIT
- 한국어 번역 및 UI 현지화: claude-code-mods-ko 프로젝트

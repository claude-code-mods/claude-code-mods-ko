# jev-auto-compact

> 한국어판은 claude-code-mods-ko 프로젝트가 번역했습니다. 원작자와 라이선스는 문서 끝에 있으며, 원문 README가 없어 플러그인 설명을 기준으로 작성했습니다.

Jev가 안내하는 원문 압축: 컨텍스트가 60%에 도달하면 생성 없이 오래된 도구 호출을 정리합니다. 정리할 것이 없으면 건너뛰며(LLM 요약으로 대체하지 않음) 학습용 근거를 learning.db에 기록합니다.

## 설치

```
/plugin marketplace add claude-code-mods/claude-code-mods-ko
/plugin install jev-auto-compact@claude-code-mods-ko
```

## 출처 및 라이선스

- 원작자: [vexjoy-agent](https://github.com/notque/vexjoy-agent)
- 원본 저장소: https://github.com/notque/vexjoy-agent
- 라이선스: MIT
- 한국어 번역 및 UI 현지화: claude-code-mods-ko 프로젝트

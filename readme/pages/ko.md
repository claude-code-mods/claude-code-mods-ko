# 최고의 Claude Code mod

{{languages}}

**엄선하고, 검증하고, 버전을 고정했습니다. 한 번 추가하면 {{count}}개의 mod를 설치할 수 있습니다.**

> **전체 {{count}}개 mod가 한국어로 완전히 현지화되었습니다.** 모든 레이블, 명령어, 패널, 프롬프트와 문서가 번역되었습니다. 플러그인 소스가 이 저장소에 포함되어 있어 설치 후 별도 설정 없이 바로 한국어 UI를 사용할 수 있습니다. 코드 식별자, 훅 이벤트 이름, 스킬과 모델용 지침만 기능이 바뀌지 않도록 영문으로 유지됩니다.

Mod는 함수 훅으로 만든 Claude Code 플러그인입니다. Claude Code의 동작을 관찰하고, 바꾸거나 대신 처리할 수 있으며, 자체 UI도 그릴 수 있습니다. 이 마켓플레이스는 커뮤니티의 뛰어난 mod를 모았습니다. 모두 `claude plugin validate`로 검증했고 검증한 커밋에 고정했기 때문에, 작성자의 이후 변경 사항이 검토 없이 전달되지 않습니다.

Claude Code 2.1.287 이상이 필요합니다.

## 설치

Claude Code 터미널 세션에서:

```
/plugin marketplace add claude-code-mods/claude-code-mods-ko
/plugin install <mod 이름>@claude-code-mods-ko
```

예: `/plugin install terminal-browser@claude-code-mods-ko`. 새 mod와 업데이트를 받으려면 `/plugin marketplace update claude-code-mods-ko`를 실행하세요.

## 카탈로그

각 카드의 **접근 범위**는 UI를 그리는 것 외에 mod 코드가 할 수 있다고 검증 도구가 보고한 내용입니다. 설치 전에 소스를 확인하세요. 검증은 코드를 실행하지 않고 읽기만 하며, 보안 감사가 아닙니다.

{{catalog}}

## mod 추천하기

mod 저장소 링크와 함께 이슈를 열어 주세요. 직접 추가하려면 `community.json`에 항목(저장소, 폴더, 확인한 커밋, 분류, 라이선스)을 넣고, `readme/summaries.json`에 한 줄 소개를 쓴 뒤 `python3 scripts/build-catalog.py`를 실행하고 풀 리퀘스트를 보내 주세요.

## 감사의 글과 현지화

각 mod는 원작자의 것이며 각자의 라이선스를 따릅니다. 이 저장소는 수집 외에도 **한국어 현지화**를 제공합니다. 플러그인을 `mods/` 아래에 포함하고 레이블, 명령어 설명, 패널과 프롬프트를 번역했으며 각 mod의 문서도 번역했습니다(원문은 `README.en.md`로 보관). 원작자와 라이선스는 모든 문서 끝에 적혀 있습니다. 현지화 사본을 제거하거나 출처 표시를 바꾸고 싶다면 이슈를 열어 주세요.

비공식 프로젝트이며 Anthropic 제품이 아닙니다.

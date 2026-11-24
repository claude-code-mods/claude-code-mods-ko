# ctx-handoff

> 한국어판은 claude-code-mods-ko 프로젝트가 번역했습니다. 원작자와 라이선스는 문서 끝에 있으며, 영어 원문은 [README.en.md](README.en.md)에서 볼 수 있습니다.

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/assets/banner-dark.svg">
    <img src="docs/assets/banner-light.svg" width="900" alt="ctx-handoff: Claude Code를 위한 장기 세션 도구 모음">
  </picture>
</p>

<p align="center">
  <b>Claude가 여러분이 가르친 것을 기억하게 하고, 흔한 실수를 잡아 주고,<br>돌아왔을 때 긴 세션을 다시 이어 갑니다.</b>
</p>

<p align="center">
  <a href="https://github.com/cablate/ctx-handoff-mod/releases"><img src="https://img.shields.io/github/v/release/cablate/ctx-handoff-mod?include_prereleases&display_name=release&label=release&color=7dd3fc" alt="최신 릴리스"></a>
  <a href="https://github.com/cablate/ctx-handoff-mod/actions/workflows/check.yml"><img src="https://github.com/cablate/ctx-handoff-mod/actions/workflows/check.yml/badge.svg" alt="CI"></a>
  <img src="https://img.shields.io/badge/Claude_Code-2.1.287%2B-a78bfa" alt="Claude Code 2.1.287 이상">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT 라이선스"></a>
</p>

<p align="center">
  <b>English</b> · <a href="README.zh-TW.md">繁體中文</a> · <a href="#install">설치</a> · <a href="#whats-inside">기능</a> · <a href="docs/guide.md">안내서</a> · <a href="CHANGELOG.md">변경 내역</a>
</p>

<p align="center">
  <img src="docs/assets/handoff.svg" width="900" alt="애니메이션: 긴 세션의 컨텍스트가 임계점까지 차면 ctx-handoff가 검증된 작업, 실패한 시도, 사용자가 정한 한계, 다음 단계를 요약해 기록하고 초기화한 뒤 새 세션이 이어 감">
</p>

## 왜 필요한가

긴 Claude Code 세션은 같은 일을 반복합니다. ctx-handoff가 백그라운드에서 이를 처리하므로, 평소 사용할 때는 명령을 입력할 필요가 없습니다.

| 상황… | 없이 사용하면 | ctx-handoff가 있으면 |
|---|---|---|
| 대화가 거의 가득 찼을 때 | 직접 요약을 쓰고 `/clear`한 뒤 다시 붙여 넣음 | 요약을 작성하고 대화를 비운 뒤 새 대화가 이어감 |
| 한 시간 자리를 비웠을 때 | 다음 메시지가 모든 것을 정가로 다시 읽음 | 최대 약 4시간 동안 캐시를 따뜻하게 유지 |
| 같은 지시를 반복할 때 | 다음 대화에서 잊어버림 | 프로젝트 노트가 되고, 3번 반복하면 저장소의 한 줄이 됨 |
| `/clear` 또는 Claude Code 재실행 후 | 새 대화가 아무것도 모르고 시작 | 마지막 대화가 어디서 멈췄는지 알려 줌 |
| Claude가 실패한 명령을 재시도하거나 검증 없이 "완료"라고 할 때 | 나중에야 발견 | 즉시 한 줄로 알려 줌 |

## 설치

Claude Code 2.1.287 이상이 필요합니다. 2.1.302까지 테스트했습니다.

```sh
claude plugin marketplace add cablate/ctx-handoff-mod
claude plugin install ctx-handoff@ctx-handoff-mod
```

새 세션을 시작하고 `/handoff`를 입력하세요. 다음과 같이 표시되어야 합니다.

```
context 12034 / threshold 600000 (window 1000000)
Cache refresh on, refreshed 0/3 this idle period, timer not started
```

이게 전부입니다. `claude plugin update ctx-handoff@ctx-handoff-mod`로 업데이트하거나 `/plugin`의 **Marketplaces**에서 자동 업데이트를 켤 수 있습니다.

> [!NOTE]
> Claude 구독과 긴 세션(예: 1M 컨텍스트 모델)을 위해 만들었습니다. API 키, Bedrock 또는 Vertex에서는 캐시가 5분밖에 지속되지 않으므로 `/handoff refresh off`를 실행하세요. 나머지 기능은 그대로 동작합니다. Claude Code 모드가 아직 초기 액세스 단계이므로 ctx-handoff는 실험적입니다.

한국어 마켓플레이스에서는 다음 명령으로 설치합니다.

```
/plugin install ctx-handoff@claude-code-mods-ko
```

## 포함된 기능

ctx-handoff는 긴 세션을 위한 도구 모음으로, Claude와 몇 시간씩 작업할 때 유용한 기능이 계속 추가됩니다.

### 컨텍스트가 차기 전에 인계 (선택 사항)

기본값은 꺼져 있어 Claude Code 자체 압축이 사용됩니다. 패널의 Settings 탭에서 `auto_handoff`를 켜면 60만 토큰에서 Claude와 서브에이전트가 끝날 때까지 기다린 뒤, 검증된 작업과 검증되지 않은 변경을 구분해 유지하고, 실패한 항목, 여러분이 직접 적은 제약, 이미 확인한 사실을 나열하고, 다음 단계 하나로 마무리하는 요약을 작성합니다. 그다음 대화를 비우고 새 대화에서 이어 갑니다. 그동안 입력한 내용도 함께 전달됩니다.

### 자리를 비운 동안 캐시를 따뜻하게 유지

약 50분 유휴 상태가 되면 작은 요청을 보내 대화 캐시가 만료되지 않도록 합니다(큰 대화에서 Claude Code가 54분 만에 압축하는 것보다 앞서감). 최대 3회(약 3.5시간) 반복한 뒤에는 대화를 지우지 않고 인계 요약을 저장합니다. 돌아오면 `/handoff resume`으로 새로 시작하거나 `continue`로 기존 상태에 머무를지 선택합니다.

이 대화에서만 자리 비움 갱신과 요약을 일시 정지하려면 패널 상단의 버튼을 클릭하거나 `/handoff away pause`를 실행하세요(`resume`은 타이머를 다시 시작합니다). 노트 업데이트는 계속 실행되며 다른 대화에는 영향이 없습니다. 패널과 `/handoff`는 백그라운드 활동과 이번 업데이트 이후 세션이 보고한 백그라운드 토큰 사용량도 실시간으로 표시합니다(청구서가 아니며, 이미 보낸 요청은 취소할 수 없습니다).

<img src="docs/assets/cache.svg" width="900" alt="애니메이션: 자리를 비운 뒤 55분, 110분, 165분에 캐시가 갱신되고, 그다음 요약이 저장되며, 돌아오면 재개 또는 계속을 선택">

### 프로젝트를 학습한 뒤 저장소로 전달

<img src="docs/assets/memory.svg" width="900" alt="애니메이션: 사흘 동안 반복된 같은 지시가 프로젝트 규칙이 되고, 검토할 수 있도록 CLAUDE.md의 한 줄이 됨">

선호, 수정 사항, 사실은 프로젝트별 Markdown 노트 파일 하나로 만들어져 모든 새 대화에 로드됩니다. 반복되는 루틴은 프로젝트 스킬이 됩니다. 대화의 새 부분만 Sonnet 5.5에서 낮은 노력으로 읽습니다.

노트 업데이트가 실패하거나 쓸 수 없는 결과가 나오면 그 조각은 다음 재시도를 위해 보관되며, 같은 규칙이나 절차가 중복 집계되지 않습니다. 삭제한 메모리는 새 대화 조각에서 다시 언급하지 않는 한 돌아오지 않습니다.

### 중단 지점을 기억

<img src="docs/assets/resume.svg" width="900" alt="애니메이션: /clear 이후 다음 대화가 마지막 작업, 상태, 다음 단계를 전달받음">

### 흔한 실수를 잡아 줌

<img src="docs/assets/nudges.svg" width="900" alt="애니메이션: 같은 실패가 두 번 반복될 때, 확인 없이 완료했다고 할 때, 사용자의 언어에서 벗어날 때 알림이 표시됨">

### 사용자가 승인하는 가드, 모든 것을 한 패널에서

이미 문서화되어 있지만 계속 어겨지는 규칙이 있다면 ctx-handoff가 가드를 초안으로 만듭니다. 도구 호출을 검사해 Claude에 알리거나 막는 장치입니다. 다음 대화에서 Claude가 이를 사용자에게 묻고, 사용자가 동의하기 전에는 아무것도 적용되지 않습니다. `/handoff panel`은 프롬프트 위에 가드, 메모리, 규칙, 최근 노트 업데이트, 모든 설정을 담은 패널을 엽니다.

<img src="docs/assets/guard.svg" width="900" alt="애니메이션: 계속 어겨지는 CLAUDE.md 규칙이 가드 초안이 되고, Claude가 켤지 묻고, 사용자가 yes라고 하면 다음 git push에서 알림이 표시됨. 옆에는 프롬프트 위 패널의 탭(가드, 메모리, 규칙, 마지막 업데이트, 설정)이 단계별로표시됨">

## 설정

모든 설정은 패널의 Settings 탭(`/handoff panel` 후 <kbd>5</kbd>)에 있으며, 각 값의 출처와 초기화 버튼이 있습니다. 기본값은 그대로 두는 것이 좋습니다. [안내서](docs/guide.md#settings)에 모든 설정이 나열되어 있습니다.

## 비용과 프라이버시

- **자체 서버 없음.** 사용자의 Claude Code 로그인으로 동작하며, 대화 자체처럼 Anthropic 외부로는 아무것도 보내지 않습니다.
- **작고 예측 가능한 비용.** 인계는 요청 한 번, 캐시 갱신은 캐시에서 읽어 입력 가격의 약 10분의 1 수준, 노트 업데이트는 대화의 새 부분만 보냅니다. 알림은 비용이 들지 않습니다.
- **사용자가 소유하는 일반 파일.** 노트는 `~/.claude/projects/`의 Markdown입니다. `claude plugin validate`로 모드가 할 수 있는 일을 확인하고, [안내서](docs/guide.md#cost-privacy-and-permissions)에서 모든 항목을 설명합니다.

## 문서

- [안내서](docs/guide.md): 모든 기능, 설정, 명령, 권한, 지원 환경, 제한, 문제 해결, 제거 방법을 자세히 설명합니다.
- [변경 내역](CHANGELOG.md): 버전별 변경 사항과 업그레이드할 이유.
- [기여하기](CONTRIBUTING.md): 소스에서 실행하고 변경을 보내는 방법. 버그 보고와 아이디어는 [issues](https://github.com/cablate/ctx-handoff-mod/issues/new/choose)에 올려 주세요.
- [보안](SECURITY.md): 취약점을 비공개로 보고하는 방법.

## 스타 히스토리

<a href="https://star-history.com/#cablate/ctx-handoff-mod&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=cablate/ctx-handoff-mod&type=Date&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=cablate/ctx-handoff-mod&type=Date" />
    <img alt="Star history chart" src="https://api.star-history.com/svg?repos=cablate/ctx-handoff-mod&type=Date" />
  </picture>
</a>

## 라이선스

[MIT](LICENSE)

## 출처 및 라이선스

- 원작자: [cablate](https://github.com/cablate/ctx-handoff)
- 원본 저장소: https://github.com/cablate/ctx-handoff
- 라이선스: MIT
- 한국어 번역 및 UI 현지화: claude-code-mods-ko 프로젝트

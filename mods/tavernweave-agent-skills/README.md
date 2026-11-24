# TavernWeaveX 무한월독

> 한국어판은 claude-code-mods-ko 프로젝트가 번역했습니다. 원작자와 라이선스는 문서 끝에 있으며, 영어 원문은 [README.en.md](README.en.md)에서 볼 수 있습니다.

> **2.4.0 정식 릴리스**: **Antigravity(AGY) 네이티브 어댑터**를 새로 지원합니다. AGY 호스트 플러그인 템플릿, 지시 파일, 네 단계 가이드 선호도의 영속 어댑터를 추가했고, Codex·Claude 플러그인 매니페스트와 marketplace 설명을 설치 주매니페스트에 맞춰 버전 일관성을 복구했습니다. Skill은 23개 그대로이며 이름과 수량은 바뀌지 않습니다. 릴리스 자산과 검증 파일은 [v2.4.0 정식 릴리스 페이지](https://github.com/LiarMTTT/TavernWeave/releases/tag/v2.4.0)를 참고하세요. 소스 설치는 로컬 매니페스트로 23개 Skill을 확인합니다. 전체 검증 범위는 CHANGELOG와 DSH 계약을 참고하세요.

> 이 버전은 **2.3.6** 기반으로 Antigravity 네이티브 어댑터를 추가했으며 23개 Skill을 유지합니다. 2.2.0에서 도입된 Claude Code 플러그인은 Host Front Door 자동 주입, `tavernweave` 에이전트, 입력창 위 Soul 모드 전환을 계속 제공합니다. **TavernWeave X DSH** 플러그인 패키지는 이제 신의 손 클라이언트 패널(룰렛, 전체 플로팅 창, 세계관 책, 프론트엔드 디자인·모션 데이터베이스, 프로젝트/카드 관리)을 내장해 한 번 설치로 사용할 수 있으며 세계관 책 설계와 작성 진입점도 계속 제공합니다. 전체 패키지, 플러그인 패키지, 검증 파일은 [v2.4.0 정식 릴리스 페이지](https://github.com/LiarMTTT/TavernWeave/releases/tag/v2.4.0)에 있습니다. 출처와 합입 기록은 [업그레이드 안내](docs/dual-task-upgrade.md)를 참고하세요.

<p align="center">
  <img src="docs/assets/tavernweave-v1-cover.png" alt="환상 주점의 디지털 직기. 캐릭터 카드, 세계관 책, 디자인 자료, 엔지니어링 모듈을 하나의 워크플로로 엮는다" width="100%">
</p>

<p align="center"><strong>영감, 자료, 코드, 인수를 유지 보수 가능한 캐릭터 카드로 엮어 냅니다.</strong></p>

TavernWeaveX 무한월독(이하 TW)은 생각을 실제로 쓸 수 있고 계속 수정할 수 있는 캐릭터 카드, 웹 페이지, 작은 도구로 만들어 줍니다. 무엇을 하고 싶은지 또는 어디가 문제인지 직접 말하면 됩니다. TW가 요구 사항을 정리하고 방안을 제시하며 제작과 검사를 진행하고, 다음에 어떻게 시도할지 설명합니다. 작업 단위로 로드되는 Skill(작업별로 호출되는 작업 능력)로 이 작업을 조직하며 Codex, Claude Code를 지원하고 **TavernWeave X DSH** 플러그인 패키지를 통해 DeepSeek Harness(DSH)도 지원합니다. DSH 패키지 안에는 신의 손 클라이언트 패널이 함께 들어 있습니다.

현재 소스는 **TavernWeaveX 무한월독 2.4.0 정식 릴리스**입니다. Antigravity(AGY) 네이티브 어댑터와 네 단계 가이드 선호도 영속을 새로 추가하고 다중 호스트 버전 일관성을 고쳤으며, 원생 Skill은 23개로 이름과 수량이 바뀌지 않습니다. 2.2.0에서 도입된 Claude Code 플러그인은 Host Front Door 자동 주입, `tavernweave` 에이전트, Soul 모드 전환을 계속 제공합니다([Claude Code 플러그인](#claude-code-플러그인) 참고). **TavernWeave X DSH** 플러그인 패키지는 신의 손 클라이언트 패널을 내장하고 세계관 책 설계와 작성 진입점을 계속 제공합니다. 머신 설치 식별자 `tavernweave-agent-skills`, 기존 Skill 이름, 저장소 주소는 원본을 그대로 써 업그레이드 확인을 쉽게 합니다. 전체 패키지와 검증 파일은 [v2.4.0 정식 릴리스 페이지](https://github.com/LiarMTTT/TavernWeave/releases/tag/v2.4.0)를 참고하세요. [v2.2.0](https://github.com/LiarMTTT/TavernWeave/releases/tag/v2.2.0), [v2.1.0](https://github.com/LiarMTTT/TavernWeave/releases/tag/v2.1.0), [v1.9.1](https://github.com/LiarMTTT/TavernWeave/releases/tag/v1.9.1), [v1.9.0](https://github.com/LiarMTTT/TavernWeave/releases/tag/v1.9.0)의 역사 릴리스 페이지도 유지됩니다.

**통합 플러그인의 주 용도는 권한 있는 사용자가 dots 클라우드 장기 작업에서 TW를 호출하는 것입니다.** Codex와 dots는 `TavernWeave-Codex-v2.4.0.zip`을 공유하며 별도 cloud 버전은 없습니다. TW는 Skill과 참고 자료를 제공하고, 클라우드 실행·이어하기·영속 저장·도구는 실제 호스트에서 옵니다. 로컬 설치는 dots 계정으로 자동 동기화되지 않습니다. 사용 방법과 계정 진입점은 **[통합 플러그인 안내](docs/plugin-guide.md)** 를 참고하세요.

TW는 세계관 책을 단독으로 설계하거나 고칠 수 있습니다. 먼저 지식 경계, 본문, 트리거 조건을 정리한 뒤 네이티브 항목, 조건 출력, 명시적 읽기, 부분 혼합 중 하나를 선택합니다. 세계관 책이 담당하는 내용과 전체 카드, 세계 빌드, 변수, 실행 디버그는 각각 인계됩니다. 예산 최적화는 실제 측정이 필요하고 모델 효과는 해당 호스트에서 관찰해야 합니다. 일반 소프트웨어와 제작 작업도 더 명확한 요구 정리와 프롬프트 사양 방법을 공유하며, 이미 결정된 내용은 직접 재사용할 수 있습니다.

1.9.0에서 확정된 묵월 창작 방법을 계승합니다. 전체 카드는 오프닝과 세계관 책을 핵심으로 하며 순수 텍스트, MVU Zod, hybrid로 조직해 제작하고, 세계관·변수·인물 창작 방법을 보완합니다. 프론트엔드는 먼저 요구 사항과 관련 디자인을 연구하며 기본적으로 Awwwards 디자인 요구를 참고합니다. 인터페이스는 깔끔하게 유지하고 본문은 용도에 따라 상투어를 피합니다.

역할 카드 프롬프트 규칙 한 줄만 쓰고 싶을 때도 직접 요구를 말하면 됩니다. Agent는 원래 의도와 제약 강도를 유지하고 요청에 따라 본문이나 세계관 책 항목을 전달합니다. 필드 바인딩 도구가 `bindings` 타입 오류를 만나면 배열 메서드 예외를 직접 던지지 않고 명확한 진단을 반환합니다. 1.9.0에서 Windows 컴포넌트 내보내기 실패 후 반제품이 남을 수 있는 문제를 고쳤으며, 정리할 수 없는 파일은 명시적으로 나열합니다. 버전 변경 사항은 [변경 로그](CHANGELOG.md)를 참고하세요.

프로젝트 진행 보드는 계속 `orchestrate-project-blueprint`가 각 프로젝트 안에서 생성합니다. 전체와 모듈별 구현/인수 진행 바, 검사점과 증거를 펼쳐 보고, 아이디어·버그·심사 원문을 저장합니다. 보드는 프로젝트 총 설계안에서 범위와 인수 요구를 읽고 NEXT에서 현재 상태·증거·다음 관문을 읽습니다. 동기화는 먼저 차이를 미리 보고, 출처·피드백·증거가 바뀌면 다시 대조합니다. 새 아이디어가 자동으로 확인된 범위를 넓히지 않고, 퍼센트가 운전자나 실제 호스트 인수를 자동으로 대체하지 않습니다. 사용법은 [프로젝트 진행 보드](docs/project-progress-board.md)를 참고하세요.

TW는 PolyForm Noncommercial License 1.0.0으로 제공됩니다. 비상업적 사용, 수정, 배포가 허용되며 저작권자의 별도 허가 없이 원본·수정본·재배포본을 상업적으로 사용할 수 없습니다. 배포 시 라이선스와 저작권 고지를 유지해야 합니다. 서드파티 콘텐츠는 [각자의 라이선스](THIRD_PARTY_NOTICES.md)를 따릅니다.

## 한 문장으로 시작

일반 제작 또는 Vibe Code:

```text
TavernWeave로 【원하는 작품 설명】을 만들고 싶어요.
먼저 있는 파일을 보고, 직접 시험해 볼 수 있는 작은 결과물로 정리해 주세요. 추천 이유와 결정해야 할 일을 쉬운 말로 설명해 주세요.
```

이미 카드 파일이 있다면 이렇게 시작합니다.

```text
이 캐릭터 카드를 이어받았어요. 【원작을 이어서 업데이트 / 2차 창작】하고 싶습니다.
원본 카드를 이해하게 도와 주고, 어떤 자료가 있고 무엇을 보존해야 하는지 설명한 뒤, 첫 번째 변경을 함께 고르게 해 주세요.
```

## 선택한 속도로 협업하기

| 가이드 단계 | 받게 되는 것 |
| --- | --- |
| 신입 | 한 번에 작은 단계, 조작 위치·이유·용어·예상 결과를 자세히 설명 |
| 입문 | 한 번에 작은 단계, 방법·단계 관계·방안 선택·검사 방법을 자세히 설명 |
| 숙련 | 일반 단계를 묶어 핵심 결정·이유·검증 결과를 제시 |
| 고수 | 일상적으로 결론·변경·차이·증거를 바로 주고 기본 설명 반복을 줄임 |

"앞으로 입문 단계를 써" 또는 "내 단계를 고수로 바꿔"라고 말할 수 있습니다. 저장 전에 실제 위치와 범위를 설명하고, 기존 선택은 업그레이드 시 유지됩니다. 선택하지 않으면 자동 분류하지 않습니다. "이번만 간단히"는 이번 설명에만 영향을 줍니다. **모든 단계는 필요하거나 버그 수정일 때는 명확히 설명하며, 사용자가 해당 범위가 필요 없다고 명시하지 않는 한 계속 자세히 설명합니다.**

필요한 용어는 처음 등장할 때 설명하고 현재 작업과 연결해 "원래 용어 / 쉬운 말 / 구체적 의미" 대조를 제공합니다. 쉬운 말과 가이드 단계는 Soul 인격과 텍스트 다듬기와 독립적이며, 둘 중 하나를 종료해도 선택은 유지됩니다. 규칙과 완전한 예시는 [공통 소통과 가이드](skills/consult-tavernweave-library/references/communication-and-guidance.md)를 참고하세요.

## 선택적 표현과 협업 방식

부드러운 안내판:

```text
아톰 도와줘!
```

엄격한 학습판:

```text
MTTT.sir, 쪼아줘!
```

프론트엔드 리뷰 이스터에그판:

```text
소울 킬러!
```

한 문장의 소원에서 총 설계안과 첫 버전으로 수렴:

```text
브레인스토밍 모드
```

세 Soul 렌즈가 함께 브레인스토밍에 참여:

```text
브레인스토밍 모드, Soul 연석
```

설계 확인 후 동결된 첫 버전 실행:

```text
블루프린트대로 첫 버전 실행
```

현재 증거로 전체 Vibe Code 성장 과정을 다시 검증:

```text
거울 보기
```

복사·저장 가능한 완전한 텍스트 평가 양식만 출력:

```text
거울 보기, 텍스트 평가 양식만, 보드 없이
```

인격 레이어 종료:

```text
Soul 귀위
```

Soul은 여전히 작업 단위의 Portable 오버레이입니다. 아톰과 MTTT.sir는 공개 MTTT 방법의 두 가지 교육 투영이며, 소울 킬러는 비공식 쟈니 실버핸드 동인 이스터에그 인격으로 프론트엔드를 심사합니다. 입은 거칠 수 있지만 증거를 들고 수정 방법을 제시해야 합니다. 세 연석은 같은 Agent의 세 개 표시 렌즈이며 사실·권한·매 라운드 우선 1~2개의 필요 결정(합계 최대 4개)과 같은 수렴 장부를 공유합니다. 세 개의 독립 모델이 아닙니다. ChatGPT 기록이나 비공개 RAG를 자동으로 얻지 못하고, 새 작업을 넘어 영구히 유지되지 않으며, 파일·Git·네트워크·배포·프로덕션 권한을 넓히지 않습니다.

## 텍스트 다듬기와 전량/아키텍처 심사 · v1.4.0

"이 문단 다듬어 줘", "AI 냄새 제거", "상투어 제거"라고 말하면 원래 의미를 유지한 다듬은 초안을 바로 얻습니다. 기본은 가벼운 윤문이고, 구조 재작성 또는 심층 재작성을 지정할 수 있습니다. 역할 설정, 숫자, 코드, 매크로와 변수 같은 기술 내용은 원래 제약을 유지합니다.

| 사용법 | 켜기 | 끄기 |
| --- | --- | --- |
| 단발 | 이 문단 다듬어 줘… | 전달 후 종료 |
| 현재 작업 지속 | 지속 다듬기 모드 켜기 | 다듬기 모드 종료 |
| 작업 공간 영속 | 이 작업 공간에서 다듬기 모드 켜기 | 작업 공간 다듬기 모드 끄기 |
| 클라이언트 영속 | 현재 클라이언트 전역으로 다듬기 모드 켜기 | 클라이언트 전역 다듬기 모드 끄기 |

지속 모드는 창작 본문, 대외 문안, 일상 설명, 계획, 심사 보고에 적용되며 인용·코드·필수 템플릿·증거를 유지합니다. 영속 모드는 먼저 실제 규칙 파일과 차이를 보여 주고, 운전자가 동의한 뒤 별도 블록에 기록합니다. TW 설치/업그레이드가 자동으로 켜지지 않습니다. 작업 종료는 현재 작업에만 영향을 주며, "다듬기 모드 상태 보기"는 각 범위와 호스트 로드 증거를 구분해 보여 줍니다.

"전량 심사"는 전체 합의 범위를 보고, "아키텍처 심사"는 책임·의존성·상태·핵심 경로를 추적하며, "전량 아키텍처 심사"는 둘을 조합합니다. 소프트웨어와 역할 카드 모두 적용됩니다. 보고서는 확인됨·부분 확인·미독·제외 항목을 유지하고 증거가 있는 모든 발견을 전달합니다. "소울 킬러, 전량 아키텍처 심사"라고 말하면 Soul 스타일을 계승합니다. 요약은 최대 세 줄이고 전체 보고는 잘리지 않습니다. 심사는 먼저 읽기 전용 결과를 전달합니다.

## 5단계 진입

```text
Host Front Door (선택 로컬 진입)
  -> Soul (아톰 / MTTT.sir / 소울 킬러 / 3연석, 선택)
    -> 브레인스토밍 오케스트레이션 (총 설계안 + First Playable + 블루프린트/블루프린트 집, 선택)
      -> Library (A0 + ST 가이드 + 디자인/모션 + 출처 Wiki + 선택 페이지)
        -> 머신 매니페스트로 분배되는 엔지니어링 Skill (창작, 컴포넌트, API, UI, 디버그, 성장 검증, 빌드, 인수 등)
```

- **Host Front Door (선택 로컬 진입)** 는 지속적인 쉬운 말, 작업 라우팅, 협업 규칙을 로컬 클라이언트에 연결합니다. Claude Code 플러그인 설치 시 SessionStart hook으로 자동 주입되며 `CLAUDE.md` 블록과 둘 중 하나를 선택합니다([Claude Code 플러그인](#claude-code-플러그인) 참고). 사용자 가이드 단계는 따로 저장되고 업데이트 시 유지되며, 파일 매칭과 클라이언트 실제 로드는 각각 확인합니다.
- **Soul (선택 인격)** 은 사용자가 선택한 가이드 단계 안에서 어투와 교수 방식을 바꾸며 사실·권한·인수 결과는 바꾸지 않습니다.
- **브레인스토밍 오케스트레이션** 은 방향 라운드 수, 4상태 결정, 첫 버전 경계, 블루프린트 분량을 제어하며, 근거 없는 재귀적 증식은 어떤 활동 단계에서도 허용되지 않습니다. 실제 문제는 일시적으로 세분화할 수 있지만, 차단 요인이 해결되거나 확인되면 가지를 닫고 부모 단계로 돌아와야 합니다.
- **Library** 는 단일 배포, 필요 시 읽기이며, 한 번 설치했다고 매 라운드 전체 자료를 넣는 것이 아닙니다.
- **엔지니어링 Skill** 이 실제 작업을 계속 소유합니다. 인격과 자료가 목표 런타임 권위를 대체할 수 없습니다.

## Skill 배열

| Skill | 주요 책임 |
| --- | --- |
| `activate-tavernweave-soul` | 아톰 / MTTT.sir / 소울 킬러의 현재 작업 단위 모드를 켜거나, 서로 바꾸거나, 끔. 쟈니는 프론트엔드 리뷰 이스터에그 인격이며 비공개 RAG를 저장하지 않음 |
| `build-work-library` | 소설, 원작·동인 자료, 연동 텍스트·이미지 참고를 정리. 출처 재검, 버전/단계 필터, 수동 편집, 배치 이어하기, Markdown+JSONL 및 SQLite 내보내기 |
| `consult-tavernweave-library` | A0, 31권 정식 ST 가이드, C8 실험 가이드를 강제 라우팅하고 필요 시 462개 디자인, 194개 모션, 86개 개념, 1,609개 증류 장부와 오프라인 선택 페이지를 조회 |
| `orchestrate-project-blueprint` | 캐릭터 카드 또는 일반 Vibe Code 소원을 총 설계안, First Playable, 등급별 블루프린트 집, NEXT, 반재귀 실행 관문으로 수렴. Soul 3연석 소집 가능. 프로젝트 진행 보드, 퍼센트·피드백 기록, 총 설계안/NEXT 동기화 |
| `reflect-on-vibe-code-growth` | 현재 Codex/Chat/프로젝트와 전달 증거에서 전체 Vibe Code 능력 네트워크를 재평가. 독립 복사 가능한 완전한 텍스트 평가 양식과 7장 교차 보고를 동시에 출력. 비교 가능한 척도로 불변 역사 노드와 대조하고, 탈민감 append-only 로컬 이력을 저장 |
| `worldbook-design-and-writing` | 세계관 책을 독립적으로 계획·분할·합치·심사·정교화. 네이티브·템플릿·부분 혼합 경로를 공동 선택하고 의미와 지식 경계 유지. 정확한 API와 실행 인수는 전담 능력에 인계 |
| `tavern-card-builder` | 카드 유형과 의존성 식별, 창작 권위, 자료 출처 체인, 세계관 책, MVU, CoT, 오프닝, 메모리 아키텍처 경계 유지 |
| `sillytavern-card-components` | 무손실 카드 분해, 컴포넌트 경계, registry/recipe, 왕복 일관성 |
| `sillytavern-component-update` | 컴포넌트 단위 업데이트, 임포트 가능 테스트 산출물, 전체 카드 파이프라인 인계. 조용한 재봉인 방지 |
| `sillytavern-render-regex-pipeline` | fixture로 정규식 의미, placement, 표시/프롬프트, 깊이, 단계 검증 |
| `sillytavern-rolecard-security` | 읽기 전용 스캔으로 인젝션, 동적 실행, 자격 증명 형태, 원격 로드, 프레임 간 권한 위험 |
| `sillytavern-database-rolecards` | 테이블 구조, 메시지 층, 바인딩, 멱등 마이그레이션. C8 동층 호환은 여전히 실험 경로 |
| `sillytavern-extension-dev` | 최소 UI 확장 스캐폴드, 매니페스트, 라이프사이클, 능력 스냅샷, 버전 관문 |
| `sillytavern-rolecard-performance` | 탈민감 예산, 회귀, 이름 있는 실제 런타임 샘플링 |
| `sillytavern-media-live2d-runtime` | 미디어, 오디오, Live2D, 프리로드, provider, fallback, 정리 |
| `sillytavern-card-pipeline` | 의존성 사전 검사, 실시간 개발 적응, 조립, JSON/PNG, 세계관 책 동기화, 배포 관문 |
| `sillytavern-api-reference` | ST, Tavern Helper, STScript, EJS, 매크로, MVU의 버전 민감 API 확인 |
| `sillytavern-runtime-debug` | 실제 SillyTavern에서 iframe, 콘솔, DOM, 스타일, 데이터, 라이프사이클 추적 |
| `sillytavern-embedded-ui` | 오프닝 페이지, 상태 바, 컨트롤 센터, 서랍, 플로팅 창, 모바일 상호작용. 작품별 선택적 샌드박스 규약, 공동 시뮬레이션, 상태 대조, 슬라이더 디버그 |
| `code-quality-workflow` | 전량/아키텍처 심사, 커버리지 기록, 완전한 발견, 관문, 최소 수정, 회귀, Finish Mode |
| `rewrite-natural-prose` | 원래 의미와 기술 구조를 유지한 텍스트 다듬기. 단발, 작업 지속, 그리고 각각 승인된 작업 공간/클라이언트 영속 모드 지원 |
| `shadcn-tailwind-ui` | React, shadcn/ui, Radix, Tailwind로 접근성 있는 제품 인터페이스 구축 |
| `rolecard-workshop-ops` | 프로덕션 좌표와 자격 증명을 보호하면서 설정 가능한 배포 체인 진단과 운영 |

## Library 공개 경계

한 번 설치하면 다음이 함께 옵니다.

- A0 일반 제어 점검표. 쓰기 작업의 상시 선행 조건
- STDB의 31권 정식 가이드와 C8으로 명시 표시된 1권 실험 가이드
- AFV가 243/243 경로를 선별한 뒤의 462개 디자인 항목, 194개 모션 항목, 86개 개념 인덱스, 1,609개 증류 장부
- 직접 연결된 86개 로컬 개념/Wiki, 89개 자체 로컬 기술 샌드박스, 통합 오프라인 선택 페이지
- 파일 단위 출처, 라이선스, 탈민감 횟수, SHA-256 매니페스트

A1 운전자 모판, 명령형 구 B1, 과정 아카이브, 로컬 증거, AFV 원시/수신함, 243개 소스 선별 JSON, 비공개 RAG, 로그, 자격 증명, 무관 지식 도메인은 명시적으로 배포하지 않습니다. 비공개 본문이 없는 선별 집계 영수증만 유지합니다. 선택 페이지의 "후보 추가"는 `proposed`만 의미하며 채택·설치·라이선스 통과·실제술집 인수를 뜻하지 않습니다.

오프라인 선택 페이지는 설치 디렉터리에 있습니다.

```text
skills/consult-tavernweave-library/assets/picker/index.html
```

## 창작, 이어하기, 인수

긴 프로젝트는 Markdown + YAML front matter + 제한된 구조 블록으로 유일한 창작 권위를 유지합니다. 확인·후보·대기·거부·구현·자동 증거·실제 호스트 증거·운전자 인수를 섞어 쓰지 않습니다. 사용자가 "계속"이라고 하면 권위·Git/작업 트리·산출물·다음 관문을 먼저 복구하고, 이미 동결된 설정은 다시 보지 않습니다.

증거는 계층으로 기록합니다.

```text
소스 -> 자동 테스트 -> 오프라인 산출물 -> 브라우저/데스크톱 -> 실제 SillyTavern -> 인공 인수 -> 배포 승인
```

어느 층도 다음 층을 대신할 수 없으며, 자동화는 스스로 `driver-accepted`를 기록할 수 없습니다.

## 초보자 튜토리얼

TavernWeave를 처음 사용하거나 Agent를 지휘해 제작·디버그·인수를 완료하는 법을 알고 싶다면 [TavernWeave 초보자 튜토리얼 · Vibe Code 제작 입문](https://liarmttt.github.io/TavernWeave/)을 읽으세요.

## 설치와 업데이트

Codex 사용자는 먼저 [Codex 전용 사용과 설치](docs/codex-skills.md)를 보세요. 플러그인과 독립 Skill 발견 위치를 구분하고 PowerShell 없이 Python 설치/검증 진입점(기본 읽기 전용 미리 보기, 명시적 적용 후에만 쓰기)을 제공합니다.

아래 단계는 Codex 또는 Claude Code의 **로컬 설치**용입니다. dots 계정의 플러그인 활성화와 사용은 [통합 플러그인 안내](docs/plugin-guide.md)를 참고하며, 로컬 설치는 클라우드로 자동 동기화되지 않습니다. 설치기는 저장소 `skills/`의 전체 매니페스트를 원본으로 사용해 누락 디렉터리를 만들고, 이미 있는 Skill만 덮어쓰지 않습니다. Host Front Door는 선택 로컬 강화이며, 설치 전에 대상 규칙 파일과 차이를 먼저 보세요.

```text
이 Skill 저장소를 완전히 설치하고 활성화해 주세요:
https://github.com/LiarMTTT/TavernWeave

이미 있는 Skill만 덮어쓰지 마세요. 저장소 skills/의 전체 디렉터리를 기준으로 설치한 뒤 머신 매니페스트로 전체 개수를 확인하세요(2.3.0은 23/23, 릴리스된 1.9.1은 22/22). worldbook-design-and-writing, build-work-library, activate-tavernweave-soul, consult-tavernweave-library, orchestrate-project-blueprint, reflect-on-vibe-code-growth, rewrite-natural-prose와 Library 오프라인 선택 페이지가 따로 있는지 확인하세요.

Codex인지 Claude Code인지 감지하고, TavernWeave Host Front Door는 선택 로컬 강화임을 설명해 주세요. 대상 경로, 제어 블록, diff를 먼저 보여 주고 동의를 받은 뒤 설치하세요. 제어 블록 바깥의 사용자 규칙은 바꾸지 마세요.
```

업데이트:

```text
이미 설치된 TavernWeave를 이 저장소 최신 버전으로 완전히 업데이트해 주세요:
https://github.com/LiarMTTT/TavernWeave

업데이트는 "저장소에 있어야 할 디렉터리"와 "실제 설치 디렉터리"를 비교해 새 Skill을 만들고, 예전 디렉터리만 수정하지 않아야 합니다. Host Front Door가 빠졌거나 오래됐거나 편류했는지도 확인하고, "전면 업데이트/먼저 diff 보기/Skill만 업데이트" 세 선택지를 명시적으로 제시하세요. 완료 후 두 개의 영수증을 반환하고, 새 작업에서 로컬 호스트 발견을 검증하세요. dots 계정 임포트는 플러그인 안내에 따라 별도 검증합니다.
```

호스트나 Agent가 "각 Skill을 프로젝트 수준 디렉터리에 복사"하는 이식 설치를 쓴다면 저장소 루트에서 실행하세요.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\install-tavernweave.ps1 -TargetSkillRoot '<실제 Skill 루트>'
```

설치 시 전역 전면을 처리하려면 호스트를 명시적으로 고르고 스크립트에 묻게 하세요.

```powershell
# Codex: 기본 대상은 $CODEX_HOME\AGENTS.md, 미설정 시 ~/.codex/AGENTS.md
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\install-tavernweave.ps1 -TargetSkillRoot '<실제 Skill 루트>' -AgentHost Codex -HostFrontDoorAction Prompt

# Claude Code: 기본 대상은 ~/.claude/CLAUDE.md
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\install-tavernweave.ps1 -TargetSkillRoot '<실제 Skill 루트>' -AgentHost Claude -HostFrontDoorAction Prompt
```

설치 동작은 버전이 붙은 `tavernweave-host-front-door` 주석 블록만 유지합니다. 기존 파일은 먼저 백업하고, 반복 설치는 idempotent이며, 잘못된/중복 표식과 링크 경로는 거부됩니다. 단독 미리 보기 또는 설치는 다음으로 실행합니다.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\manage-host-front-door.ps1 -AgentHost Codex -Action Preview
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\manage-host-front-door.ps1 -AgentHost Codex -Action Install
```

전역 규칙 수정은 독립 실행 관문입니다. Agent는 "추천"이라는 말만으로 조용히 쓸 수 없습니다. Codex/Claude는 새 작업을 만들거나 재시작한 뒤에야 다시 발견하고, 전면 영수증이 Soul Skill이 실제로 호출되었다는 증거가 될 수 없습니다.

설치 또는 업데이트 후에는 **실제 스캔 위치**에서 검증해야 하며 소스 저장소만 검사해서는 안 됩니다. 검증기는 TavernWeave 소스 디렉터리 자체를 설치 대상으로 인정하지 않습니다.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\verify-install.ps1 -TargetRoot '<실제 플러그인 루트 또는 Skill 루트>'
```

통과한 Skill 수는 사용한 소스의 설치 매니페스트와 일치해야 합니다. 아래는 2.3.0의 23 Skill 소스 예시이며, 릴리스된 1.9.1 원본 패키지는 여전히 22/22입니다.

```text
INSTALLATION VERIFIED: 23/23
Library: present-and-matched
Library picker: present
Soul: present-and-matched
Host rediscovery: required-new-task
```

검증 시 호스트와 규칙 파일을 함께 지정하면 `Host Front Door: current|missing-block|outdated|drifted`도 표시됩니다. 이는 권장 상태이며, 머신 매니페스트로 Skill 파일 완전성을 판단하는 결과를 바꾸지 않습니다.

대상 디렉터리의 무관한 개인 Skill은 보존됩니다. 머신 매니페스트의 TavernWeave 공식 디렉터리는 현재 소스와 파일 단위로 일치해야 합니다. 쓰기 대상의 마지막 수준 이름은 반드시 `skills`여야 하며, 설치 스크립트는 드라이브 루트, 사용자 디렉터리 루트, 소스 저장소 내부 대상, 디렉터리 링크를 거부하고, 교체 실패 시 기존 공식 Skill을 롤백합니다.

완료 후 새 작업을 만들거나 세션을 재시작해 로컬 호스트가 Skill을 다시 발견하게 하세요. 새 작업에서도 세계관 책 설계와 작성, Soul, 브레인스토밍 오케스트레이션, 거울 보기, Library를 실제로 호출해야 합니다. 설치 영수증이 호스트 발견을 대신할 수 없습니다. v2.4.0 플러그인 패키지, `TavernWeave-DSH-v2.4.0.tgz`, SHA-256 검증 파일은 [정식 릴리스 페이지](https://github.com/LiarMTTT/TavernWeave/releases/tag/v2.4.0)에 있습니다.

유지 보수자는 배포 전 소스 트리만 자체 점검할 경우 `-AllowSourceTree`를 명시적으로 사용할 수 있지만, 일반 사용자 설치 영수증에는 사용할 수 없습니다.

## Antigravity / AGY 플러그인

Antigravity / AGY 사용자는 먼저 [네이티브 플러그인 빌드, 설치, 검증](host-adapters/antigravity/README.md)을 보세요. 이 패키지는 23개 Skill을 재사용하고, 상시 규칙으로 전면을 로드하며, AGY Agent와 설정 저장 어댑터를 제공합니다. 엄격 검증과 클라이언트 실측은 각각 기록됩니다. 저장소 루트의 Claude 플러그인 가져오기 변환은 AGY 네이티브 패키지의 설치 경로가 아닙니다.

## Claude Code 플러그인

2.2.0부터 저장소 자체가 Claude Code 플러그인 마켓플레이스(`.claude-plugin/`)입니다. Claude Code에서 실행하세요.

```text
/plugin marketplace add LiarMTTT/TavernWeave
/plugin install tavernweave-agent-skills@tavernweave
```

플러그인은 네 부분으로 구성되며, 처음 세 항목은 DSH 플러그인 패키지와 일대일 대응합니다.

| 구성 | 파일 | 대응 DSH |
| --- | --- | --- |
| `tavernweave-agent-skills:` 접두사가 붙은 23개 Skill | `skills/` | Skill provider |
| Host Front Door 자동 주입. 세션 시작마다 전면을 세션 컨텍스트로 추가(PATH에 `node` 필요) | [`hooks/hooks.json`](hooks/hooks.json), [`hooks/session-start-front-door.mjs`](hooks/session-start-front-door.mjs) | system prompt section |
| TW 전용 인격 `tavernweave` 에이전트. 도구 집합도 정리됨(네트워크와 서브에이전트 없음) | [`agents/tavernweave.md`](agents/tavernweave.md) | `TavernWeave X DSH` preset |
| Soul 모드 전환. 입력창 위 한 줄 `Soul 아톰 ▸`, 펼치면 모드를 골라 해당 지시만 입력창에 넣고 사용자가 보냄 | [`hooks/soul-switch.tsx`](hooks/soul-switch.tsx)(`hooks/hooks.json`의 `modules`) | 신의 손 Soul 작은 플로팅 창(CC에서는 이 인터페이스만 유지) |

`tavernweave` 에이전트는 주 세션으로 시작할 수 있습니다. `claude --agent tavernweave-agent-skills:tavernweave`. 일반 세션에서도 Claude가 TW 작업을 그 에이전트에게 맡길 수 있습니다. 이전에 `~/.claude/skills`에 Skill을 복사해 둔 경우, 플러그인으로 바꾼 뒤 그 복사본을 제거해 같은 이름 Skill이 두 번 나오지 않게 하세요.

Soul 모드 전환은 Claude Code 플러그인의 함수 hook 인터페이스(공식적으로 early access)를 씁니다. 전면 hook과 같은 `hooks/hooks.json`에 들어 있으며, Claude Code 2.1.299에서 둘 다 로드된 것을 확인했습니다. 더 이른 버전에서 `modules` 필드를 무시하는지는 아직 검증되지 않았습니다. 전환은 사용자가 실제로 보낸 Soul 지시만 기록하며 Soul이 확인 활성화되었다는 뜻은 아닙니다. 메시지를 대신 보내지 않습니다. 인터페이스 테스트는 `claude plugin test .`로 실행합니다.

### CLAUDE.md 블록과의 중복 제거

전면은 한 곳에만 있으면 됩니다. hook은 세션 시작 시 이 세션이 로드할 지시 파일을 확인합니다. `$CLAUDE_CONFIG_DIR/CLAUDE.md`(미설정 시 `~/.claude/CLAUDE.md`)와 현재 디렉터리부터 루트까지 각 레벨의 `CLAUDE.md`, `.claude/CLAUDE.md`, `CLAUDE.local.md`입니다. 파일 안의 제어 블록이 우선합니다.

| 상황 | hook 동작 |
| --- | --- |
| 이 파일들에 `tavernweave-host-front-door` 블록이 없음 | 플러그인 내장 전면 주입 |
| 같은 버전 블록이 이미 있음 | 주입하지 않고 파일 블록 사용 |
| 다른 버전 블록이 이미 있음 | 전면은 주입하지 않고 버전 불일치 안내만 추가. 파일 블록은 계속 사용 |
| 환경 변수 `TAVERNWEAVE_FRONT_DOOR=off` | 완전히 주입하지 않음 |

- 마켓플레이스로 설치한 사용자는 `manage-host-front-door.ps1`로 `CLAUDE.md`에 쓸 필요가 없습니다. 이미 썼고 플러그인 버전 업데이트에 맡기고 싶다면 `manage-host-front-door.ps1 -AgentHost Claude -Action Remove`를 실행하세요(스크립트는 먼저 백업합니다).
- ZIP이나 `skills/` 복사로 설치한 사용자는 이 hook이 없으므로 위 안내대로 `CLAUDE.md`에 씁니다.
- 가이드 단계(`tavernweave-guidance-preference` 블록)는 영향받지 않으며 `CLAUDE.md`에 따로 저장됩니다.

인증 상태: hook, agent, Soul 전환의 구조·중복 제거 규칙·출력 형식·지시 일관성은 [`tests/claude-plugin.test.mjs`](tests/claude-plugin.test.mjs)로 오프라인 검사하고, Soul 전환의 인터페이스 동작은 [`hooks/soul-switch.test.tsx`](hooks/soul-switch.test.tsx)가 터미널과 데스크톱 두 표면에서 검사합니다. Claude Code 새 세션의 실제 주입, `--agent` 시작, 서브에이전트 호출은 아직 실기 인증되지 않았습니다(설치 매니페스트 `claudePlugin.hostLoading` 참고).

## DeepSeek Harness

2.1.0부터 DSH는 독립 플러그인 패키지로 설치합니다. **`skills/`를 `.agents/skills`에 복사하지 말고** `AGENTS.md`를 쓸 필요도 없습니다.

1. [v2.4.0 릴리스 페이지](https://github.com/LiarMTTT/TavernWeave/releases/tag/v2.4.0)에서 `TavernWeave-DSH-v2.4.0.tgz`를 다운로드하거나, 소스 트리에서 `node scripts/build-dsh-plugin.mjs`를 실행해 로컬 패키지 `TavernWeave-DSH-v2.4.0.tgz`를 다시 생성하세요.
2. DSH 데스크톱: 사이드바 **플러그인 → 플러그인 추가 → 서드파티 플러그인 설치 → 로컬 경로/tarball**, 설치 후 bundle 활성화.
3. 새 작업을 만들고 Agent preset에서 **TavernWeave X DSH**를 선택하세요.

CLI/Web profile은 `dsh plugin --profile <profile> add <로컬 경로|tarball|git 주소|패키지명>`을 사용합니다. `desktop` profile은 Desktop shell이 관리하므로 CLI를 직접 호출하지 마세요.

플러그인 패키지 안에 23개 Skill과 Host Front Door(system prompt section으로 주입)가 직접 들어 있으며, 설치·업그레이드·제거는 모두 DSH 플러그인 메커니즘으로 합니다. 자세한 구성, 머신 계약, 런타임 관문은 [host-adapters/dsh/README.md](host-adapters/dsh/README.md)를 참고하세요. DSH는 아직 Developer Preview입니다. 2.1.0은 DSH Desktop `0.2.1-rc.2`에서 플러그인 페이지, preset 선택, 23 Skill 디렉터리, Front Door, Soul, 완전 권한 터미널의 실기 인증을 마쳤습니다. 모델 효과, Linux/WSL, 실제술집은 별도 인증 항목입니다. OneDrive reparse-point 작업 공간은 workspace-write에서 완전 권한으로 바꾸거나 일반 디렉터리로 옮겨야 합니다(계약 `knownEnvironmentIssues` 참고).

## 설치 (한국어 마켓플레이스)

```
/plugin install tavernweave-agent-skills@claude-code-mods-ko
```

## 출처 및 라이선스

- 원작자: [LiarMTTT](https://github.com/LiarMTTT/TavernWeave)
- 원본 저장소: https://github.com/LiarMTTT/TavernWeave
- 라이선스: PolyForm Noncommercial 1.0.0
- 한국어 번역 및 UI 현지화: claude-code-mods-ko 프로젝트

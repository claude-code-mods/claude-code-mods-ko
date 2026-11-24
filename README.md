# 최고의 Claude Code mod

[English](https://github.com/claude-code-mods/best-claude-code-mods) · [简体中文](https://github.com/claude-code-mods/claude-code-mods-zh) · [繁體中文](https://github.com/claude-code-mods/claude-code-mods-zh-tw) · [日本語](https://github.com/claude-code-mods/claude-code-mods-ja) · **한국어** · [Español](https://github.com/claude-code-mods/claude-code-mods-es) · [Français](https://github.com/claude-code-mods/claude-code-mods-fr) · [Deutsch](https://github.com/claude-code-mods/claude-code-mods-de) · [Português (Brasil)](https://github.com/claude-code-mods/claude-code-mods-pt-br) · [Русский](https://github.com/claude-code-mods/claude-code-mods-ru)

**엄선하고, 검증하고, 버전을 고정했습니다. 한 번 추가하면 40개의 mod를 설치할 수 있습니다.**

> **전체 40개 mod가 한국어로 완전히 현지화되었습니다.** 모든 레이블, 명령어, 패널, 프롬프트와 문서가 번역되었습니다. 플러그인 소스가 이 저장소에 포함되어 있어 설치 후 별도 설정 없이 바로 한국어 UI를 사용할 수 있습니다. 코드 식별자, 훅 이벤트 이름, 스킬과 모델용 지침만 기능이 바뀌지 않도록 영문으로 유지됩니다.

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

### 대시보드와 사용량

[![token-optimizer](https://raw.githubusercontent.com/alexgreensh/token-optimizer/main/docs-site/public/media/token-optimizer-desktop-status-bar.gif)](https://github.com/alexgreensh/token-optimizer/tree/e3f1a2dcad8d8999096b8a881c4d98cdba4ef1a5/desktop/token-optimizer-desktop)

#### [`token-optimizer`](https://github.com/alexgreensh/token-optimizer/tree/e3f1a2dcad8d8999096b8a881c4d98cdba4ef1a5/desktop/token-optimizer-desktop)

*작성자 alexgreensh* · 토큰이 어디에 쓰이는지와 비용을 줄이는 방법을 보여 주는 토큰 최적화 상태 표시줄입니다.

**접근 범위:** 명령 실행, 모델 호출, 파일

`/plugin install token-optimizer@claude-code-mods-ko`

---

[![council](https://github.com/hex/claude-council/raw/main/assets/desktop-code-tab.png)](https://github.com/hex/claude-council/tree/f2f7f42122b288599cef8cea97dcc490acea98a5)

#### [`council`](https://github.com/hex/claude-council/tree/f2f7f42122b288599cef8cea97dcc490acea98a5)

*작성자 hex* · 여러 AI 에이전트에 동시에 물어 다양한 관점을 모읍니다. 스트리밍 패널과 선택적인 실시간 점검 기능을 제공합니다.

**접근 범위:** 명령 실행, 모델 호출, 파일

`/plugin install council@claude-code-mods-ko`

---

[![codex-attachment-manager](https://github.com/chipfighter/context-attachment-manager/raw/main/docs/images/hero.gif)](https://github.com/chipfighter/context-attachment-manager/tree/d68a721b7432059c9056d546ff2a26b11b3c0e0c)

#### [`codex-attachment-manager`](https://github.com/chipfighter/context-attachment-manager/tree/d68a721b7432059c9056d546ff2a26b11b3c0e0c)

*작성자 chipfighter* · 이전 이미지를 짧은 자리표시자로 보내고 ID로 원본을 다시 가져와, 이미지가 많은 긴 세션에서도 프롬프트 캐시를 유지합니다.

**접근 범위:** 네트워크, MCP

`/plugin install codex-attachment-manager@claude-code-mods-ko`

---

[![cache-tax](https://github.com/karanb192/cache-tax/raw/main/site/assets/refusal.gif)](https://github.com/karanb192/cache-tax/tree/535ff33225e666e605e731d78f5ac5efe243c7c3)

#### [`cache-tax`](https://github.com/karanb192/cache-tax/tree/535ff33225e666e605e731d78f5ac5efe243c7c3)

*작성자 karanb192* · 쉬는 동안 1시간 프롬프트 캐시를 따뜻하게 유지하고, 콜드 전송 전에 확인하며 재작성 비용을 표시합니다.

**접근 범위:** 모델 호출

`/plugin install cache-tax@claude-code-mods-ko`

---

[![agent-standup-band](https://atoll92.github.io/agent-standup/media/banner.png)](https://github.com/Atoll92/agent-standup/tree/846d5324f7c00f06d598c86e87ed8b51d774b3ac/plugin-band)

#### [`agent-standup-band`](https://github.com/Atoll92/agent-standup/tree/846d5324f7c00f06d598c86e87ed8b51d774b3ac/plugin-band)

*작성자 Atoll92* · 다른 로컬 세션이 당신을 필요로 할 때 입력창 위에 줄을 표시하고, 세션이 끝나면 알림을 띄웁니다.

**접근 범위:** 명령 실행, 파일

`/plugin install agent-standup-band@claude-code-mods-ko`

---

[![shunt](docs/assets/shunt.png)](https://github.com/pleaseai/shunt/tree/57182b328e92d3c70bc9ca5a1fd1ee9104cfbabb/plugins/shunt)

#### [`shunt`](https://github.com/pleaseai/shunt/tree/57182b328e92d3c70bc9ca5a1fd1ee9104cfbabb/plugins/shunt)

*작성자 pleaseai* · shunt 게이트웨이 사용량 표시줄입니다. 기간별 비용과 초기화 시각, 전체 /shunt:usage 분석을 제공합니다.

**접근 범위:** 네트워크, 명령 실행

`/plugin install shunt@claude-code-mods-ko`

---

[![tokendoctor](https://github.com/localixai/tokendoctor/raw/main/docs/demo.gif)](https://github.com/localixai/tokendoctor/tree/051fa9598f0a50ed30974b618f2911381b7dcf90)

#### [`tokendoctor`](https://github.com/localixai/tokendoctor/tree/051fa9598f0a50ed30974b618f2911381b7dcf90)

*작성자 localixai* · 지난 세션을 다시 실행해 각 변경으로 절약했을 비용을 보여 주고, 선택한 항목만 적용합니다.

**접근 범위:** 명령 실행, 모델 호출

`/plugin install tokendoctor@claude-code-mods-ko`

---

[![skins](https://github.com/hellosverre/claude-skins/raw/main/docs/demo.gif)](https://github.com/hellosverre/claude-skins/tree/cf0d39f3785d5c5a4b6189ecc487b1ac479efea0)

#### [`skins`](https://github.com/hellosverre/claude-skins/tree/cf0d39f3785d5c5a4b6189ecc487b1ac479efea0)

*작성자 hellosverre* · 기록 화면용 스킨과 테마 15종을 제공하며, 풍부한 카드와 사용량 표시줄이 포함됩니다. /skin으로 즉시 바꿀 수 있습니다.

**접근 범위:** 네트워크, 명령 실행, 모델 호출, 파일

`/plugin install skins@claude-code-mods-ko`

---

[![ctx-handoff](docs/assets/ctx-handoff-mod.png)](https://github.com/cablate/ctx-handoff-mod/tree/a416713a0495be799a31f3650e18458e242270c7)

#### [`ctx-handoff`](https://github.com/cablate/ctx-handoff-mod/tree/a416713a0495be799a31f3650e18458e242270c7)

*작성자 cablate* · Claude에게 가르친 내용을 프로젝트 노트로 바꾸고, 흔한 실수를 잡아 주며, 캐시를 유지하고 긴 세션을 재개합니다.

**접근 범위:** 모델 호출, 파일

`/plugin install ctx-handoff@claude-code-mods-ko`

---

[![ripple](https://github.com/PBJ-2/clauderipple/raw/main/docs/media/demo.webp)](https://github.com/PBJ-2/clauderipple/tree/c1c6b76a9e4e7a51df2ec5907d6e41d6bf8591e3/packages/mod)

#### [`ripple`](https://github.com/PBJ-2/clauderipple/tree/c1c6b76a9e4e7a51df2ec5907d6e41d6bf8591e3/packages/mod)

*작성자 PBJ-2* · 프롬프트별 추론 수준과 위임 작업별 작업자를 선택하고, 캐시를 유지하며 각 요청이 어디로 갔는지 표시합니다.

**접근 범위:** 네트워크, 명령 실행, 모델 호출, MCP, 파일

`/plugin install ripple@claude-code-mods-ko`

---

[![tavernweave-agent-skills](https://github.com/LiarMTTT/TavernWeave/raw/main/docs/assets/tavernweave-v1-cover.png)](https://github.com/LiarMTTT/TavernWeave/tree/f9863d2b05305457fe9ed8b0c5688d52aca400a5)

#### [`tavernweave-agent-skills`](https://github.com/LiarMTTT/TavernWeave/tree/f9863d2b05305457fe9ed8b0c5688d52aca400a5)

*작성자 LiarMTTT* · 역할극, 소프트웨어 작업, 제한된 클라우드 작업을 위한 공유 스킬 23개와 입력창 위의 Soul 모드 전환을 제공합니다.

**접근 범위:** —

`/plugin install tavernweave-agent-skills@claude-code-mods-ko`

---

[![agent-usage-guard](https://github.com/rbartoli/agent-usage-guard/releases/download/agent-usage-guard--v1.0.0/agent-usage-guard.gif)](https://github.com/rbartoli/agent-usage-guard/tree/02594c2620be9eb60c32e2f77d9d512d9f61b205)

#### [`agent-usage-guard`](https://github.com/rbartoli/agent-usage-guard/tree/02594c2620be9eb60c32e2f77d9d512d9f61b205)

*작성자 rbartoli* · 서브에이전트가지나치게로 늘어나거나 대용량 컨텍스트 프롬프트와 재시도 반복이 사용량을 소모하기 전에 이를 제어합니다.

**접근 범위:** 모델 호출, 파일

`/plugin install agent-usage-guard@claude-code-mods-ko`


### 에이전트와 서브에이전트

[![shared-session](https://github.com/Paradigm-Study/claude-share/raw/main/docs/assets/invitation-demo.png)](https://github.com/Paradigm-Study/claude-share/tree/9d88f996ac4245c756a89b34e98cfde375028950/plugin)

#### [`shared-session`](https://github.com/Paradigm-Study/claude-share/tree/9d88f996ac4245c756a89b34e98cfde375028950/plugin)

*작성자 Paradigm-Study* · 링크나 팀으로 세션을 공유합니다. 팀원이 각자의 Claude Code에서 참여해 모든 턴을 실시간으로 볼 수 있습니다.

**접근 범위:** —

`/plugin install shared-session@claude-code-mods-ko`

---

[![flightdeck](https://github.com/scasella/claude-flightdeck/raw/main/docs/media/demo.gif)](https://github.com/scasella/claude-flightdeck/tree/626cc0b46d417f81bbff9f5ba3b49abaf8912a85)

#### [`flightdeck`](https://github.com/scasella/claude-flightdeck/tree/626cc0b46d417f81bbff9f5ba3b49abaf8912a85)

*작성자 scasella* · 실시간 에이전트 대시보드입니다. 모델 상태, 당직 아키텍트, 권한 확인, 서브에이전트 카드와 세션 기록을 제공합니다.

**접근 범위:** —

`/plugin install flightdeck@claude-code-mods-ko`

---

[![start](https://github.com/rsmdt/the-startup/raw/main/logo.png)](https://github.com/rsmdt/the-startup/tree/e803d51fdb423271d3dde189f5416f3ec51386a9/plugins/start)

#### [`start`](https://github.com/rsmdt/the-startup/tree/e803d51fdb423271d3dde189f5416f3ec51386a9/plugins/start)

*작성자 rsmdt* · 에이전트식 소프트웨어 개발을 위한 워크플로 오케스트레이션 명령입니다.

**접근 범위:** 파일

`/plugin install start@claude-code-mods-ko`

---

[![lane-stack](docs/assets/claude-lane-stack.png)](https://github.com/VKirill/claude-lane-stack/tree/8bac2b876b72053aa445bb9d1c7c6079bfc4ba8c/plugins/lane-stack)

#### [`lane-stack`](https://github.com/VKirill/claude-lane-stack/tree/8bac2b876b72053aa445bb9d1c7c6079bfc4ba8c/plugins/lane-stack)

*작성자 VKirill* · 1인 PM용 컨베이어입니다. 오케스트레이터 에이전트, 레인별 지침, 시작과 재개 명령을 제공합니다.

**접근 범위:** 네트워크, 모델 호출

`/plugin install lane-stack@claude-code-mods-ko`


### 생산성과 컨텍스트

[![pebrel-prompt-suggestions](https://github.com/Kuddev/pebrel/raw/main/docs/screenshots/nebula-claude-session.png)](https://github.com/Kuddev/pebrel/tree/ed9b2331340877ba3d775e38c4df6bd1a2abb1fe/pebrel_app/res/prompt-suggestions/claude)

#### [`pebrel-prompt-suggestions`](https://github.com/Kuddev/pebrel/tree/ed9b2331340877ba3d775e38c4df6bd1a2abb1fe/pebrel_app/res/prompt-suggestions/claude)

*작성자 Kuddev* · Pebrel 세션 브리지를 통해 빈 입력창에서 프롬프트를 예측해 표시합니다.

**접근 범위:** 네트워크

`/plugin install pebrel-prompt-suggestions@claude-code-mods-ko`

---

[![fast-jev-compaction](docs/assets/fast-jev-compaction.png)](https://github.com/tamaratran/fast-jev-compaction/tree/e3f262a7f4d42bd8dd32ced30d26176f7cb545b0)

#### [`fast-jev-compaction`](https://github.com/tamaratran/fast-jev-compaction/tree/e3f262a7f4d42bd8dd32ced30d26176f7cb545b0)

*작성자 tamaratran* · Claude Code 세션을 Jev가 안내하는 방식으로 원문 그대로 압축합니다.

**접근 범위:** 네트워크, 모델 호출

`/plugin install fast-jev-compaction@claude-code-mods-ko`

---

[![lot-map](https://github.com/alexeyw/lot-map/raw/main/docs/demo.gif)](https://github.com/alexeyw/lot-map/tree/ad60f057902765d778eedde770d337be45fac3af)

#### [`lot-map`](https://github.com/alexeyw/lot-map/tree/ad60f057902765d778eedde770d337be45fac3af)

*작성자 alexeyw* · 채팅 옆에 실시간 지도를 표시합니다. 메모리, 파일, 셸, 웹, 모델, 에이전트, 스킬, 훅이 사용될 때마다 켜집니다.

**접근 범위:** —

`/plugin install lot-map@claude-code-mods-ko`

---

[![storybloq](https://raw.githubusercontent.com/Storybloq/storybloq/main/assets/board.png)](https://github.com/Storybloq/storybloq/tree/f0b4c08e3a15ffb9841e5a3058c6b1ca57607154/plugins/storybloq)

#### [`storybloq`](https://github.com/Storybloq/storybloq/tree/f0b4c08e3a15ffb9841e5a3058c6b1ca57607154/plugins/storybloq)

*작성자 Storybloq* · 저장소의 .story/ 폴더에 티켓, 이슈, 인계 내용과 교훈을 보관하는 프로젝트 메모리입니다.

**접근 범위:** 파일

`/plugin install storybloq@claude-code-mods-ko`

---

[![just-do-it](docs/assets/claude-ops.png)](https://github.com/Lifecycle-Innovations-Limited/claude-ops/tree/e434ef7e612f2ff5769def6101fc9d984888d377/claude-ops/skills/ops-jdi/plugin)

#### [`just-do-it`](https://github.com/Lifecycle-Innovations-Limited/claude-ops/tree/e434ef7e612f2ff5769def6101fc9d984888d377/claude-ops/skills/ops-jdi/plugin)

*작성자 Lifecycle-Innovations-Limited* · 승인된 작업을 검증과 전달까지 이어 가고, 수정이 필요한 설정 문제를 알려 줍니다.

**접근 범위:** 명령 실행, 모델 호출

`/plugin install just-do-it@claude-code-mods-ko`

---

[![filetree](https://github.com/data-goblin/claude-code-filetree/raw/main/media/filetree-shimmer.gif)](https://github.com/data-goblin/claude-code-filetree/tree/1fdc3a963f2dc22a939f661ff0ff5a76646c9112)

#### [`filetree`](https://github.com/data-goblin/claude-code-filetree/tree/1fdc3a963f2dc22a939f661ff0ff5a76646c9112)

*작성자 data-goblin* · Claude가 어디서 무엇을 하는지 보여 주는 IDE 스타일 파일 트리입니다.

**접근 범위:** 명령 실행, 모델 호출, 파일

`/plugin install filetree@claude-code-mods-ko`

---

[![jev-auto-compact](https://github.com/notque/vexjoy-agent/raw/main/docs/repo-hero.png)](https://github.com/notque/vexjoy-agent/tree/c68ac1fea2a03e437ccc95112d1e56e467a9bd00/plugins/jev-auto-compact)

#### [`jev-auto-compact`](https://github.com/notque/vexjoy-agent/tree/c68ac1fea2a03e437ccc95112d1e56e467a9bd00/plugins/jev-auto-compact)

*작성자 notque* · 컨텍스트가 60%가 되면 생성 없이 오래된 도구 호출을 정리하고, LLM 요약으로 대체하지 않고 건너뜁니다.

**접근 범위:** 네트워크, 모델 호출

`/plugin install jev-auto-compact@claude-code-mods-ko`

---

[![caliber-jev-compaction](https://github.com/caliber-ai-org/ai-setup/raw/master/assets/readme/pillars.png)](https://github.com/caliber-ai-org/ai-setup/tree/f5dbc002022a8a10acad25c1cce23ddefdc19d0d/plugin/caliber-jev-compaction)

#### [`caliber-jev-compaction`](https://github.com/caliber-ai-org/ai-setup/tree/f5dbc002022a8a10acad25c1cce23ddefdc19d0d/plugin/caliber-jev-compaction)

*작성자 caliber-ai-org* · Claude Code 세션을 Jev가 안내하는 방식으로 원문 그대로 압축합니다.

**접근 범위:** 네트워크, 모델 호출

`/plugin install caliber-jev-compaction@claude-code-mods-ko`

---

[![operator](https://github.com/aerovato/operator-memory/raw/main/docs/assets/change-the-loop.png)](https://github.com/aerovato/operator-memory/tree/93c3fce64f0a72adeb89fa868600eb418548ec07/packages/claude-code)

#### [`operator`](https://github.com/aerovato/operator-memory/tree/93c3fce64f0a72adeb89fa868600eb418548ec07/packages/claude-code)

*작성자 aerovato* · 에이전트 기반 개발을 위한 지속적인 프로젝트 및 사용자 메모리입니다.

**접근 범위:** —

`/plugin install operator@claude-code-mods-ko`

---

[![carbon](https://github.com/gwittebolle/claude-carbon/raw/main/docs/desktop-pane.png)](https://github.com/gwittebolle/claude-carbon/tree/9ad53f1dd07fb0e11fcdb94d294ed794d660cf4b)

#### [`carbon`](https://github.com/gwittebolle/claude-carbon/tree/9ad53f1dd07fb0e11fcdb94d294ed794d660cf4b)

*작성자 gwittebolle* · 터미널과 데스크톱 앱에서 Claude Code 세션의 탄소 발자국을 추적합니다.

**접근 범위:** 파일

`/plugin install carbon@claude-code-mods-ko`

---

[![work-mode](https://github.com/danyuchn/claude-work-mode/raw/main/promo/demo-poster-en.png)](https://github.com/danyuchn/claude-work-mode/tree/e19eda1e8465308bd79a74fad295cf9b6d9cdf71/plugins/work-mode)

#### [`work-mode`](https://github.com/danyuchn/claude-work-mode/tree/e19eda1e8465308bd79a74fad295cf9b6d9cdf71/plugins/work-mode)

*작성자 danyuchn* · 세션 모드입니다. auto(작업 중 질문 없음), out(일괄 작업 위임), wrap(수렴하여 마무리)를 제공합니다.

**접근 범위:** 명령 실행, 파일

`/plugin install work-mode@claude-code-mods-ko`

---

[![show-your-work](https://github.com/iamumeransari/claude-show-your-work/raw/main/docs/homepage.jpg)](https://github.com/iamumeransari/claude-show-your-work/tree/71e546044e3ba61b98a6938a03270da791f9ca2e)

#### [`show-your-work`](https://github.com/iamumeransari/claude-show-your-work/tree/71e546044e3ba61b98a6938a03270da791f9ca2e)

*작성자 iamumeransari* · 완료한 작업을 터미널에서 보여 줍니다. 스크린샷, 클릭 동작 영상, 동기화된 전후 QA를 제공합니다.

**접근 범위:** 네트워크, 명령 실행, 모델 호출, 파일

`/plugin install show-your-work@claude-code-mods-ko`

---

[![inbox](docs/assets/inbox.png)](https://github.com/petekp/inbox/tree/02e441cd447edf86fc30fbd03e9117a8ead9da7a)

#### [`inbox`](https://github.com/petekp/inbox/tree/02e441cd447edf86fc30fbd03e9117a8ead9da7a)

*작성자 petekp* · 세션에서 당신을 기다리는 질문, 작업, 발견 사항과 PR을 모아 줍니다.

**접근 범위:** —

`/plugin install inbox@claude-code-mods-ko`

---

[![compact-adviser](https://github.com/kunchenguid/compact-adviser/raw/main/docs/hint-status-line.png)](https://github.com/kunchenguid/compact-adviser/tree/37fa1a665b8933de68c90014312060e862cf121a/packages/claude-mod)

#### [`compact-adviser`](https://github.com/kunchenguid/compact-adviser/tree/37fa1a665b8933de68c90014312060e862cf121a/packages/claude-mod)

*작성자 kunchenguid* · 작업이 끝난 지점에서 TypeSafe Jev가 판단해 /compact를 제안하거나 실행합니다.

**접근 범위:** 네트워크, 모델 호출, 파일

`/plugin install compact-adviser@claude-code-mods-ko`


### 렌더링과 미리보기

[![terminal-browser](docs/assets/terminal-browser.webp)](https://github.com/zenbu-labs/terminal-browser/tree/fa9e5eb053d2a1da11f7ccba720a0d3d389c05a6/claude-code-plugin)

#### [`terminal-browser`](https://github.com/zenbu-labs/terminal-browser/tree/fa9e5eb053d2a1da11f7ccba720a0d3d389c05a6/claude-code-plugin)

*작성자 zenbu-labs* · Claude Code 안에서 브라우저를 사용합니다. 사이트와 HTML을 미리 보고 에이전트가 내장 브라우저를 조작할 수 있습니다.

**접근 범위:** 네트워크, 명령 실행, 모델 호출, 파일

`/plugin install terminal-browser@claude-code-mods-ko`

---

[![prismantis](https://github.com/NahumLitvin/prismantis/raw/main/docs/tour.gif)](https://github.com/NahumLitvin/prismantis/tree/3718a40abc57b836108a65bd9f01d06d3237e52d/plugin)

#### [`prismantis`](https://github.com/NahumLitvin/prismantis/tree/3718a40abc57b836108a65bd9f01d06d3237e52d/plugin)

*작성자 NahumLitvin* · 답변에 다채롭고 테마 설정이 가능한 서식을 적용합니다. 표, 제목, 코드, 숫자, 경로와 링크를 꾸며 줍니다.

**접근 범위:** 명령 실행, 파일

`/plugin install prismantis@claude-code-mods-ko`


### 안전과 가드

[![lcu-approve](https://github.com/amontlabs/lcu/raw/main/docs/assets/approval-demo.gif)](https://github.com/amontlabs/lcu/tree/1bd45b304295c7665b559fcc32f7b3a8f1b1d859/adapters/claude-mod/lcu-approve)

#### [`lcu-approve`](https://github.com/amontlabs/lcu/tree/1bd45b304295c7665b559fcc32f7b3a8f1b1d859/adapters/claude-mod/lcu-approve)

*작성자 amontlabs* · 컴퓨터 사용을 앱별로 승인합니다. 이번 대화만 허용, 항상 허용, 거부를 선택할 수 있고 승인된 앱 목록도 제공합니다.

**접근 범위:** 명령 실행, MCP, 파일

`/plugin install lcu-approve@claude-code-mods-ko`

---

[![agentctl](https://raw.githubusercontent.com/sd0xdev/sd0x-harness/main/banner.jpg)](https://github.com/sd0xdev/sd0x-harness/tree/b0206637edd2e44c993da12b6b30858f96bc3cdc/mods/agentctl)

#### [`agentctl`](https://github.com/sd0xdev/sd0x-harness/tree/b0206637edd2e44c993da12b6b30858f96bc3cdc/mods/agentctl)

*작성자 sd0xdev* · 세션용 에이전트 제어판입니다. 작업 범위, 근거 자료와 인계를 관리합니다.

**접근 범위:** 명령 실행, 모델 호출, 파일

`/plugin install agentctl@claude-code-mods-ko`

---

[![multi-core](docs/assets/cc-multi-cli-plugin.png)](https://github.com/greenpolo/cc-multi-cli-plugin/tree/66d9b0a6b06b25fd648ecd53311a647bb57e2fb4/plugins/multi-core)

#### [`multi-core`](https://github.com/greenpolo/cc-multi-cli-plugin/tree/66d9b0a6b06b25fd648ecd53311a647bb57e2fb4/plugins/multi-core)

*작성자 greenpolo* · 한 세션에서 ChatGPT, Cursor, OpenCode, Antigravity 모델을 /model로 전환하며 사용합니다.

**접근 범위:** 네트워크, 모델 호출

`/plugin install multi-core@claude-code-mods-ko`

---

[![jevmem-pane](docs/assets/jevmem.png)](https://github.com/Avinash-jetwani/jevmem/tree/c29753ccb2c9706e417fda25efa422682358955b/pane)

#### [`jevmem-pane`](https://github.com/Avinash-jetwani/jevmem/tree/c29753ccb2c9706e417fda25efa422682358955b/pane)

*작성자 Avinash-jetwani* · jevmem이 무엇을 떠올렸는지, 가드가 어떻게 판단했는지, 마지막 턴에서 무엇을 저장했는지 보여 주는 측면 패널입니다.

**접근 범위:** 명령 실행, 파일

`/plugin install jevmem-pane@claude-code-mods-ko`


### Git, PR과 배포

[![fm](https://github.com/kunchenguid/firstmate/raw/main/assets/banner.png)](https://github.com/kunchenguid/firstmate/tree/427056c4181c41074ad24f051f79919330df0fa5/.claude/mods/firstmate-calm)

#### [`fm`](https://github.com/kunchenguid/firstmate/tree/427056c4181c41074ad24f051f79919330df0fa5/.claude/mods/firstmate-calm)

*작성자 kunchenguid* · 작업 중 돛단배 애니메이션과 대화 전용 기록 화면을 제공하며, 세션 간에 calm 모드 설정을 공유합니다.

**접근 범위:** 파일

`/plugin install fm@claude-code-mods-ko`

---

[![turbo](https://github.com/tobihagemann/turbo/raw/main/assets/logo/thunderbolt-icon-256.png)](https://github.com/tobihagemann/turbo/tree/3bc6b4436d96be22497109e16e68fe4dfa323531/claude)

#### [`turbo`](https://github.com/tobihagemann/turbo/tree/3bc6b4436d96be22497109e16e68fe4dfa323531/claude)

*작성자 tobihagemann* · 사람이 관여하는 에이전트식 소프트웨어 공장입니다. 무엇을 만들지 결정하고 결과를 판단하면 스킬이 만들고 전달합니다.

**접근 범위:** 모델 호출, 파일

`/plugin install turbo@claude-code-mods-ko`

---

[![mazyos](docs/assets/MazyOS.png)](https://github.com/Mazzeo-Marketing/MazyOS/tree/d2b65b392f1ee230afb088d155fc734def5f105d)

#### [`mazyos`](https://github.com/Mazzeo-Marketing/MazyOS/tree/d2b65b392f1ee230afb088d155fc734def5f105d)

*작성자 Mazzeo-Marketing* · 포르투갈어 비즈니스 OS 플러그인입니다. 모든 세션에 회사 메모리를 불러오고 결과물에 브랜드를 적용하며 마케팅/SEO 스킬 17개를 제공합니다.

**접근 범위:** 파일

`/plugin install mazyos@claude-code-mods-ko`

---

[![engineer](docs/assets/engineer.png)](https://github.com/swingerman/engineer/tree/ae4cb5fe32007dd6a3d717c9998dcfb12b1f348e/engineer)

#### [`engineer`](https://github.com/swingerman/engineer/tree/ae4cb5fe32007dd6a3d717c9998dcfb12b1f348e/engineer)

*작성자 swingerman* · 체계적인 에이전트 엔지니어링 방법론 도구 모음입니다. 접수, 인수 조건 탐색, 명세, 계획, 구현, 검증과 강화까지 다룹니다.

**접근 범위:** 명령 실행, 모델 호출

`/plugin install engineer@claude-code-mods-ko`

## mod 추천하기

mod 저장소 링크와 함께 이슈를 열어 주세요. 직접 추가하려면 `community.json`에 항목(저장소, 폴더, 확인한 커밋, 분류, 라이선스)을 넣고, `readme/summaries.json`에 한 줄 소개를 쓴 뒤 `python3 scripts/build-catalog.py`를 실행하고 풀 리퀘스트를 보내 주세요.

## 감사의 글과 현지화

각 mod는 원작자의 것이며 각자의 라이선스를 따릅니다. 이 저장소는 수집 외에도 **한국어 현지화**를 제공합니다. 플러그인을 `mods/` 아래에 포함하고 레이블, 명령어 설명, 패널과 프롬프트를 번역했으며 각 mod의 문서도 번역했습니다(원문은 `README.en.md`로 보관). 원작자와 라이선스는 모든 문서 끝에 적혀 있습니다. 현지화 사본을 제거하거나 출처 표시를 바꾸고 싶다면 이슈를 열어 주세요.

비공식 프로젝트이며 Anthropic 제품이 아닙니다.

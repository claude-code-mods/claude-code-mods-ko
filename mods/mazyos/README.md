# MazyOS: Claude Code에서 당신 사업의 운영체제

> 한국어판은 claude-code-mods-ko 프로젝트가 번역했습니다. 원작자와 라이선스는 문서 끝에 있으며, 영어 원문은 [README.en.md](README.en.md)에서 볼 수 있습니다.

> 포르투갈어 Claude Code 플러그인입니다. 회사의 메모리, 브랜드 아이덴티티, 마케팅·SEO·Google Ads·고객 발굴용 스킬 17개를 제공합니다. 당신이 운전하고 Claude가 일합니다.

한 번 설치하면, 사업과 관련된 어떤 폴더에서든 Claude가 대화를 시작할 때 누구인지, 어떻게 말하는지, 이번 주에 무엇이 중요한지 이미 알고 있습니다. 캐러셀을 요청하면 브랜드에 맞게 나옵니다. 리드를 요청하면 Google Maps에서 찾아 미리보기 사이트를 만듭니다. 광고 보고서를 요청하면 CSV를 읽고 돈이 어디에서 새는지 보여 줍니다.

이륙해 봅시다.

---

## MazyOS란 무엇인가

Claude Code는 Anthropic의 도구로, 사용자의 컴퓨터 안의 폴더에서 Claude를 실행합니다. MazyOS는 그를 위한 플러그인입니다. 스킬(Claude가 따르는 대본) 묶음과 모드(작업 중인 Claude Code 자체를 바꾸는 코드 조각)로 구성됩니다.

함께 사용하면 Claude가 여러분의 사업을 아는 AI 에이전트가 됩니다. 실제로는 다음과 같습니다.

**기억합니다.** `_memoria/`의 텍스트 파일 세 개가 회사가 누구인지, 말투, 현재 초점을 저장합니다. 모든 세션이 이것들을 컨텍스트로 시작합니다. 무언가를 고칠 때("이렇게 쓰지 마", "이 고객은 나갔어") Claude가 저장할지 묻고 알맞은 곳에 저장합니다.

**당신의 색깔을 가집니다.** `identidade/design-guide.md`에 색상, 글꼴, 로고가 있습니다. 캐러셀, 제안서, 슬라이드 모두 브랜드가 적용됩니다.

**반복 작업을 합니다.** 바로 쓸 수 있는 스킬 17개와, 직접 만드는 방법이 있습니다. 매주 반복하는 일을 말하면 Claude가 스킬로 만들어 줍니다.

프로그래밍을 알 필요는 없습니다. 사업에 관한 질문에 답할 수 있으면 됩니다.

---

## Claude Code에 MazyOS 설치하기

아무 폴더에서 Claude Code를 열고 다음을 붙여 넣으세요.

```
/plugin install mazyos --marketplace mazzeoia/MazyOS
```

마켓플레이스를 추가해도 되는지(`y`), 어떤 범위에 설치할지 묻습니다. 모든 폴더에 적용되도록 `user`를 선택하세요. 그다음 세 가지 옵션(패널, 상태 줄, git 브레이크)이 나옵니다. 모두 켜 두어도 되며, 언제든 `/config`에서 바꿀 수 있습니다.

터미널을 선호한다면 다음과 같이 해도 같습니다.

```bash
claude plugin install mazyos --marketplace mazzeoia/MazyOS
```

`/plugin`이 없는 Claude 데스크톱 앱에서는 입력창 옆의 `+`를 클릭한 뒤 Plugins, Add marketplace에 `mazzeoia/MazyOS`를 입력하고 Add plugin을 누르세요.

아직 Claude Code가 없다면 Anthropic의 제품으로, 사이트([code.claude.com](https://code.claude.com))에서 설치하며 Mac, Windows, Linux에서 동작합니다. Claude 유료 플랜(Pro, Max, Team) 또는 API 키가 필요합니다.

한국어 마켓플레이스에서는 다음 명령으로 설치합니다.

```
/plugin install mazyos@claude-code-mods-ko
```

---

## 회사에 시스템 켜기

사업 이름의 폴더를 만들거나(또는 기존 폴더를 사용) 그곳에서 Claude Code를 열고 실행하세요.

```
/mazyos:instalar
```

구조(`_memoria/`, `identidade/`, `marketing/`, `saidas/`, `dados/`, `scripts/`)를 만들고 약 5분간 인터뷰를 진행합니다. 무엇을 파는지, 누구에게 파는지, 어떻게 글을 쓰는지, 오늘의 병목이 무엇인지, 브랜드 색상은 무엇인지 묻습니다. 여러분은 답하기만 하면 됩니다. 끝나면 메모리가 채워지고 시스템이 여러분을 압니다.

한 번만 실행하면 됩니다. 이후에는 폴더에서 Claude를 열고 필요한 것을 요청하면 됩니다.

---

## MazyOS가 Claude Code에서 바꾸는 것

이 부분이 모드입니다. MazyOS 폴더 안에서 다음과 같습니다.

- **메모리가 자동으로 들어갑니다.** 회사, 선호, 전략이 `CLAUDE.md` 곁에 프로젝트 지시문으로 컨텍스트에 들어갑니다. 파일이 바뀌면 Claude가 새 버전을 받습니다. 읽어 달라고 요청할 필요가 없습니다.
- **규칙도 함께 옵니다.** 답하기 전에 메모리를 읽기, 수정 사항을 저장하기 전에 묻기, 컨텍스트가 바뀌면 알리기, 반복되는 작업에 스킬 제안하기. 이 모든 것이 매 세션에 플러그인에서 직접 들어오므로 실수로 지울 수 있는 파일에 의존하지 않습니다.
- **채팅 옆 패널.** 사업, 초점, 말투, 어떤 메모리 파일이 채워졌는지와 언제 업데이트되었는지, 세션 열기·메모리 갱신·GitHub 저장 버튼을 보여 줍니다. 넓은 터미널에서는 자동으로 열리고 `/mazyos`로 언제든 열 수 있습니다.
- **상태 줄.** `MazyOS · Acme · foco: fechar 3 clientes`가 프롬프트 아래에 표시되어 흐름을 잃지 않게 합니다.
- **메모리 변경 알림.** Claude가 `estrategia.md`를 편집했나요? 패널과 상태가 즉시 갱신되고 알림이 표시됩니다.
- **git 브레이크.** `git push --force`, `git reset --hard` 등은 사용자가 확인한 뒤에만 실행됩니다. 물을 수 없으면 실행하지 않습니다.

MazyOS 폴더 밖에서는 플러그인이 조용히 있습니다. 폴더마다 한 번씩 `/mazyos:instalar`가 있다는 것만 알려 줍니다.

---

## VS Code와 Antigravity의 MazyOS

같은 시스템이 [vscode/](vscode/) 폴더의 편집기 확장으로도 있습니다. 같은 메모리를 읽고 같은 17개 스킬을 제공하며, 누가 작업을 실행할지 선택할 수 있습니다. Claude Code(Claude 계정), Codex(ChatGPT 계정), Antigravity(Google 계정) 중 하나입니다. 각각 자체 CLI의 공식 로그인으로 들어가고, 확장은 요청을 구성한 뒤 편집기 옆 콘솔에서 진행 상황을 보여 줍니다. VS Code, Antigravity IDE, Cursor에서 동작합니다.

아직 마켓플레이스에 없으므로 `vscode/`에서 생성된 `.vsix` 파일로 설치합니다.

```
cd vscode && npm install && npm run empacotar
code --install-extension mazyos-0.1.0.vsix
```

나머지는 [확장 README](vscode/README.md)에 있습니다.

## 스킬

바로 사용할 수 있는 Claude Code 스킬 17개입니다. `/mazyos:`를 입력하면 목록이 나옵니다.

### 일상 업무

- `/mazyos:abrir` — 컨텍스트를 다섯 줄로 요약하고 무엇을 할지 묻습니다.
- `/mazyos:salvar` — git을 한 번도 써 본 적 없는 사람을 위해 GitHub에 커밋하고 푸시합니다.
- `/mazyos:atualizar` — 메모리와 폴더의 현재 내용을 비교해 무엇을 갱신할지 제안합니다.
- `/mazyos:novo-projeto` — 고객이나 프로젝트마다 자체 컨텍스트가 있는 격리된 폴더를 만듭니다.
- `/mazyos:mapear-rotinas` — 매주 반복하는 일을 묻고 각각에 대한 스킬을 만듭니다.
- `/mazyos:criacao-canonica-de-skills` — 더 깊은 방법으로 스킬을 만들고 리팩터링하며 감사합니다.

### 콘텐츠 및 SEO

- `/mazyos:carrossel` — 브랜드 아이덴티티로 Instagram 캐러셀(1080×1350)을 만들며, AI 생성 사진 포함 여부를 선택하고 캡션까지 준비합니다.
- `/mazyos:publicar-tema` — 주제 하나로 블로그 글, 캐러셀, 세 가지 캡션(Instagram, Facebook, LinkedIn)을 연결된 형태로 만들어 줍니다.
- `/mazyos:seo` — 8단계 SEO 흐름을 실행합니다. 수요, 경쟁, Google My Business, 온페이지, 콘텐츠, Google Ads, 모니터링, GEO(ChatGPT, Gemini, Perplexity에 노출되기).
- `/mazyos:responder-avaliacoes` — Google 리뷰에 인간적인 답변을 씁니다.
- `/mazyos:aprovar-post` — 블로그, Instagram, Facebook에 한 명령으로 게시합니다.

### Google Ads 및 Meta Ads

- `/mazyos:anuncio-google` — Google Ads Editor로 바로 가져올 수 있는 CSV로 캠페인 전체를 만듭니다.
- `/mazyos:relatorio-ads` — Google Ads와 Meta Ads 내보내기를 읽어 주간 보고서와 경고, 조치 사항을 돌려줍니다.

### 고객 발굴

- `/mazyos:prospecta-maps` — 틈새와 도시를 입력하면 Google Maps에서 기업을 찾고 Receita에서 CNPJ를 확인하며 리드마다 미리보기 사이트를 만들고 첫 메시지와 후속 메시지를 준비합니다. PDF 제안서는 요청할 때 나옵니다. API 키가 필요 없습니다.

### 제작

- `/mazyos:analisar-dados` — CSV, 스프레드시트 또는 PDF를 읽어 경영진 요약을 돌려줍니다.
- `/mazyos:email-professional` — 설명을 들으면 이메일 초안을 씁니다.

사업을 위해 만든 스킬은 폴더의 `.claude/skills/`에 플러그인 밖으로 저장되며 `/<nome>`로 호출합니다.

---

## 자주 나오는 질문

**MazyOS는 무료인가요?** 플러그인은 공개되고 무료입니다. 비용은 Claude Code입니다. Claude Pro, Max, Team 플랜 또는 Anthropic API를 사용합니다.

**프로그래밍을 알아야 하나요?** 아닙니다. 포르투갈어로 대화하고 사업에 관한 질문에 답하면 됩니다. 명령은 슬래시와 이름뿐입니다.

**Windows에서 동작하나요?** 네. Mac, Windows, Linux에서 터미널, VS Code, Claude 앱에서 동작합니다.

**내 데이터는 어디에 있나요?** 여러분의 컴퓨터의 여러분 폴더에 있습니다. 메모리, 아이덴티티, 시스템이 만드는 모든 것은 여러분의 텍스트 파일로, 열고 편집하고 GitHub에서 버전 관리할 수 있습니다. 플러그인은 읽기 전용이며 `/plugin`으로 업데이트됩니다.

**Claude Code 플러그인이란 무엇인가요?** 스킬, 명령, 동작을 Claude Code에 한 줄로 추가하는 패키지입니다. MazyOS도 그중 하나입니다.

**플러그인이 제 Claude에서 무엇을 하는지 볼 수 있나요?** 네, 여기서 모두 공개 코드입니다. `hooks/sistema.ts`에 컨텍스트에 들어가는 규칙이 있고 `hooks/register.tsx`에 모드가 있습니다.

**예전에는 이 저장소를 클론해 MazyOS를 썼는데 지금은요?** 플러그인을 설치한 뒤 사업 폴더에서 다음을 하세요. `.claude/skills/`를 지우고(스킬은 플러그인에서 오며 직접 만든 것은 남겨도 됩니다), `CLAUDE.md`에서 MazyOS 일반 규칙을 제거하고(플러그인이 모두 주입함), 습관의 `/abrir`를 `/mazyos:abrir`로 바꾸세요. 메모리, 아이덴티티, 결과물은 그대로입니다.

---

## 핵심 주장

AI는 회사가 사용하는 도구가 아닙니다. 회사가 돌아가는 운영체제입니다.

차이는 속도가 아니라 새로운 능력입니다. AI를 가진 한 사람이 예전에는 팀 전체가 필요했던 것을 만듭니다. 오늘 수동으로 돌아가는 모든 프로세스(결정하고, 실행하고, 측정하지 않고, 무작정 반복)는 MazyOS 안에서 폐루프가 됩니다(결정하고, 실행하고, 포착하고, 되먹이고, 스스로 조정).

시스템이 여러분을 대체하지는 않습니다. 회사의 일부가 됩니다.

---

## 코드를 손보고 싶은 사람을 위해

이 저장소는 플러그인이자 마켓플레이스입니다.

```
.claude-plugin/   plugin.json 및 marketplace.json
hooks/            register.tsx(모드), memoria.ts(워크스페이스 읽기), sistema.ts(규칙)
types/            모드 상태 계약
tests/            모드 테스트
skills/           17개 스킬
templates/        CLAUDE.md 프로필, 카탈로그, 워크스페이스 골격
```

```bash
claude plugin validate .     # manifesto, marketplace 및 hooks
claude plugin test .         # 모드 테스트
claude --plugin-dir .        # 사업 폴더에서 이 체크아웃을 로드
```

---

[mazyos.com.br](https://mazyos.com.br)

## 출처 및 라이선스

- 원작자: [Mazzeo-Marketing](https://github.com/Mazzeo-Marketing/MazyOS)
- 원본 저장소: https://github.com/Mazzeo-Marketing/MazyOS
- 라이선스: NOASSERTION
- 한국어 번역 및 UI 현지화: claude-code-mods-ko 프로젝트

# Claude Code용 Operator Memory

> 한국어판은 claude-code-mods-ko 프로젝트가 번역했습니다. 원작자와 라이선스는 문서 끝에 있으며, 영어 원문은 [README.en.md](README.en.md)에서 볼 수 있습니다.

Operator Memory는 에이전트가 사람이 읽을 수 있는 Markdown으로 유지 관리하는, Claude Code용 영속적인 프로젝트 및 사용자 컨텍스트를 제공합니다.

## 설치

Claude Code `v2.1.287` 이상과 `PATH`에 Operator Helper가 필요합니다.

```sh
operator-helper install claude-code
```

설치 후 새 Claude Code 프로세스를 시작하세요. `claude plugin list`를 실행해 `operator@operator-memory`가 활성화되어 있는지 확인한 다음, 에이전트에게 Operator Memory 안내를 사용할 수 있는지 물어보세요.

플러그인은 서두를 주 시스템 프롬프트와 서브에이전트 작업 프롬프트에 주입합니다. 메모리는 프로세스당 한 번만 렌더링하므로, 메모리를 다시 불러오려면 Claude Code를 재시작해야 합니다. `/clear`는 캐시된 서두를 갱신하지 않습니다.

## 명령

- `/operator:user-init` — 사용자 파티션(User Partition)을 구성합니다.
- `/operator:project-init` — 프로젝트 브레인(Project Brain)을 구성합니다.
- `/operator:index` — 프로젝트 색인(Project Index)을 만들거나 새로 고칩니다.

## 업데이트

Helper는 설치할 때(재설치 시에도) Operator 마켓플레이스의 자동 업데이트를 켭니다. 원치 않으면 `/plugin` → Marketplaces에서 끌 수 있습니다.

`operator-helper install claude-code`를 다시 실행하거나 `claude plugin update operator@operator-memory`를 사용한 뒤 Claude Code를 재시작하세요.

확인, 업데이트 및 문제 해결은 [Claude Code 안내](https://github.com/aerovato/operator-memory/blob/main/docs/harnesses/claude-code.md)를 참고하세요. 로컬 개발에서는 워크스페이스 루트에서 `bun run preview:claude-code`를 실행합니다.

## 출처 및 라이선스

- 원작자: [aerovato](https://github.com/aerovato/operator-memory)
- 원본 저장소: https://github.com/aerovato/operator-memory
- 라이선스: MIT
- 한국어 번역 및 UI 현지화: claude-code-mods-ko 프로젝트

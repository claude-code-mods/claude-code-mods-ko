# lane-stack (Claude Code 플러그인)

> 한국어판은 claude-code-mods-ko 프로젝트가 번역했습니다. 원작자와 라이선스는 문서 끝에 있으며, 영어 원문은 [README.en.md](README.en.md)에서 볼 수 있습니다.

Claude Lane Stack에서 Claude를 향해 제공하는 부분입니다. PM 에이전트, 슬래시 명령, 플레이북 스킬을 포함합니다.

## 설치

저장소 마켓플레이스에서 설치하세요 (`~/.claude/agents` / `~/.claude/skills`에 복사하지 마세요):

```bash
claude plugin marketplace add VKirill/claude-lane-stack
claude plugin install lane-stack@claude-lane-stack -y
```

`./install.sh`는 `autoUpdate: true`로 GitHub 마켓플레이스를 등록하고, 호스트 런타임(`bin/`, 보드, writer 프로필)을 `~/.agents`로 rsync합니다. 호스트 파일은 자동 업데이트되지 않으므로 `./install.sh`를 다시 실행하세요. 로컬 체크아웃을 사용할 때는 `LANE_INSTALL_LOCAL_MARKETPLACE=1 ./install.sh`를 실행합니다.

스킬은 `/lane-stack:<skill>` 네임스페이스를 사용합니다. 작업 요약은 `/lane-stack:info` 또는 `/info`에서 볼 수 있습니다. 새 앱/서비스에 관한 이야기는 `/lane-stack:app-architect`, 살아 있는 문서는 `/lane-stack:docs-maintain`, 사실 모음은 `/lane-stack:lane-memory`를 사용하세요. PM 플레이북(`orchestrator-lanes`, `orchestrator-workflow`, `info`, `app-architect`)은 이 플러그인과 `~/.agents/pm-skills`에만 있으며 공용 writer 카탈로그로 복사되지 않습니다.

## 출처 및 라이선스

- 원작자: [VKirill](https://github.com/VKirill/claude-lane-stack)
- 원본 저장소: https://github.com/VKirill/claude-lane-stack
- 라이선스: MIT
- 한국어 번역 및 UI 현지화: claude-code-mods-ko 프로젝트

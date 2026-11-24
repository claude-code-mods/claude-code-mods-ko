import type { ModApi, On } from "./types";

let preamble: Promise<string | null> | null = null;

async function loadPreamble($: ModApi): Promise<string | null> {
  try {
    const cwd = await $.session.cwd();
    const result = await $.process.run(["operator-helper", "preamble"], { cwd });
    if (result.exitCode === 0) return result.stdout;
  } catch {
    // A missing Helper and a failed subprocess share the same recovery path.
  }

  $.ui.log(
    "Operator Memory가 operator-helper 프리앰블을 실행하지 못했습니다. @aerovato/operator-helper를 전역으로 설치하거나 복구한 뒤 Claude Code를 다시 시작하세요.",
  );
  return null;
}

function render($: ModApi): Promise<string | null> {
  preamble ??= loadPreamble($);
  return preamble;
}

export function register(on: On): void {
  on("session.start", async ($, event, next) => {
    void $.process.run(["operator-helper", "version"], undefined).catch(() => {});
    return next(event);
  });

  on("prompt.compose", async ($, event, next) => {
    const result = await next(event);
    const text = await render($);
    if (text === null) return result;
    return {
      ...result,
      sections: [...result.sections, { id: "operator:preamble", text, scope: "session" as const }],
    };
  });

  on("agent.spawn", async ($, event, next) => {
    const text = await render($);
    return next(text === null ? event : { ...event, prompt: text + event.prompt });
  });
}

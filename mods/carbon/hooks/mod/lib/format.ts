// What an answer's CO2 line says and when it raises its voice. Pure: no Claude Code API, so
// Node runs it directly (tests/run-mod-tests.mjs).

export type Lang = "fr" | "en";

export type AnswerCo2View = {
  // "16 gCO₂", or "230 gCO₂ · 14× votre médiane" for an unusual answer
  main: string;
  // "dont 3 sous-agents : 22 gCO₂", only on an unusual answer the subagents weighed on
  sub: string | null;
  isUnusual: boolean;
};

export type TurnTotals = {
  grams: number;
  subagentGrams: number;
  subagents: number;
};

export const HISTORY_SIZE = 200;
export const MIN_HISTORY = 50;
// About 1 answer in 27 stands out: above the 97th percentile of the history. The 3x
// median and the 10 g floor stay as guards: over a flat history the percentile is
// the median itself.
export const UNUSUAL_PERCENTILE = 0.97;
export const UNUSUAL_RATIO = 3;
export const UNUSUAL_FLOOR_GRAMS = 10;
export const SUBAGENT_SHARE = 0.1;

const NBSP = " ";
const UNIT = "CO₂";

// Unset, empty, C and POSIX say nothing about the language.
function isLocaleValue(value: string | undefined): value is string {
  return (
    value !== undefined &&
    value !== "" &&
    value !== "C" &&
    !value.startsWith("C.") &&
    value !== "POSIX" &&
    !value.startsWith("POSIX.")
  );
}

// Same order and sentinels as detect_equiv_set (scripts/equiv-lib.sh). With no
// variable set, the language setting decides; with none, French, as in the bash.
export function detectLang(
  envValues: Array<string | undefined>,
  setting?: string,
): Lang {
  const value = envValues.find(isLocaleValue);
  if (value !== undefined) {
    return value.toLowerCase().startsWith("fr") ? "fr" : "en";
  }
  if (setting !== undefined && setting !== "") {
    return setting.toLowerCase().startsWith("fr") ? "fr" : "en";
  }
  return "fr";
}

// Whether one of the variables decides alone, so nothing else needs to be asked.
export function hasLangVariable(envValues: Array<string | undefined>): boolean {
  return envValues.some(isLocaleValue);
}

// The `language` setting is free text ("Français", "English", "japanese"). It goes
// to detectLang as a locale would: French when it starts with "fr", English otherwise.
export function languageSetting(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const text = value.trim();
  return text === "" ? undefined : text;
}

function decimal(value: number, digits: number, lang: Lang): string {
  const text = value.toFixed(digits);
  return lang === "fr" ? text.replace(".", ",") : text;
}

// < 0.1 g, one decimal under 10 g, whole grams under 1 kg, then kg with one decimal.
// Rounding keeps the figure readable; the estimate itself is far less precise than one
// decimal.
export function formatGrams(grams: number, lang: Lang): string {
  if (grams < 0.1) return `<${NBSP}${decimal(0.1, 1, lang)}${NBSP}g${UNIT}`;
  const tenths = Math.round(grams * 10) / 10;
  if (tenths < 10) return `${decimal(tenths, 1, lang)}${NBSP}g${UNIT}`;
  const whole = Math.round(grams);
  if (whole < 1000) return `${whole}${NBSP}g${UNIT}`;
  const kilos = Math.round(grams / 100) / 10;
  return `${decimal(kilos, 1, lang)}${NBSP}kg${UNIT}`;
}

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const upper = sorted[mid] ?? 0;
  return sorted.length % 2 === 1 ? upper : ((sorted[mid - 1] ?? 0) + upper) / 2;
}

// Linear interpolation between the two closest ranks, q from 0 to 1.
export function percentile(values: number[], q: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const rank = (sorted.length - 1) * Math.min(Math.max(q, 0), 1);
  const lower = Math.floor(rank);
  const low = sorted[lower] ?? 0;
  const high = sorted[Math.min(lower + 1, sorted.length - 1)] ?? low;
  return low + (high - low) * (rank - lower);
}

// The current answer is compared before it joins the history.
export function isUnusual(grams: number, history: number[]): boolean {
  if (history.length < MIN_HISTORY || grams < UNUSUAL_FLOOR_GRAMS) return false;
  const m = median(history);
  return (
    m > 0 &&
    grams > UNUSUAL_RATIO * m &&
    grams > percentile(history, UNUSUAL_PERCENTILE)
  );
}

export function buildAnswerCo2(
  turn: TurnTotals,
  history: number[],
  lang: Lang,
): AnswerCo2View {
  const amount = formatGrams(turn.grams, lang);
  if (!isUnusual(turn.grams, history))
    return { main: amount, sub: null, isUnusual: false };
  const ratio = Math.round(turn.grams / median(history));
  const main = `${amount} · ${ratio}× ${lang === "fr" ? "중앙값" : "중앙값"}`;
  const share = turn.grams > 0 ? turn.subagentGrams / turn.grams : 0;
  if (turn.subagents === 0 || share < SUBAGENT_SHARE)
    return { main, sub: null, isUnusual: true };
  const n = turn.subagents;
  const grams = formatGrams(turn.subagentGrams, lang);
  const sub =
    lang === "fr"
      ? `서브에이전트 ${n}개 포함${NBSP}: ${grams}`
      : `서브에이전트 ${n}개 포함: ${grams}`;
  return { main, sub, isUnusual: true };
}

// The single line drawn under the answer where the turn duration line is not
// (the Desktop app): only ever for an unusual answer.
export function answerLine(view: AnswerCo2View): string {
  return view.sub === null
    ? view.main
    : `${view.main} · ${view.sub}`;
}

// Two decimals, as the status line rounds it; "< 0,01 $" under a cent. French puts the
// sign after the number, English before it.
export function formatUsd(usd: number, lang: Lang): string {
  const isTiny = usd < 0.01;
  const amount = decimal(isTiny ? 0.01 : usd, 2, lang);
  const money = lang === "fr" ? `${amount}${NBSP}$` : `$${amount}`;
  return isTiny ? `<${NBSP}${money}` : money;
}

// The entry pinned under the prompt. The surface already heads it with the plugin's name.
// The cost is left out when there is none to show (no price list read), never shown as 0.
// What the status line ends with follows, in its order: the quota, then the hints.
export function sessionLine(
  sessionGrams: number,
  lang: Lang,
  sessionUsd: number | null = null,
  ...after: (string | null)[]
): string {
  const fr = lang === "fr";
  const head = `이 세션${NBSP}:`;
  const total = `${head} ${formatGrams(sessionGrams, lang)}`;
  const cost = sessionUsd !== null && sessionUsd > 0 ? formatUsd(sessionUsd, lang) : null;
  return [total, cost, ...after].filter((part) => part !== null).join(" · ");
}

// The status line's two hints, for the entry: a newer release, and from the 1st to the
// 10th the month just closed with its total
export function updateHint(version: string): string {
  return `⬆ ${version} ${UPDATE_COMMAND}`;
}

const MONTH_NAMES_KO = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

export function cardHint(month: number, grams: number, lang: Lang): string {
  const fr = lang === "fr";
  const name = MONTH_NAMES_KO[month] ?? "";
  return `📊 ${name}${fr ? `${NBSP}:` : ":"} ${formatGrams(grams, lang)} · /carbon-card`;
}

// December's: the year so far
export function yearCardHint(year: number, grams: number, lang: Lang): string {
  return `📊 ${year}${lang === "fr" ? `${NBSP}:` : ":"} ${formatGrams(grams, lang)} · /carbon-card`;
}

export type RateLimit = { kind: string; percentUsed: number; resetsAt?: string };

const WEEKDAYS_FR = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];
const WEEKDAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_MS = 86_400_000;

// A subscription's quota as the terminal status line shows it: the 5-hour window, "Usage
// 23 % ↻14:00", or without one (a verified Ultra account has none) the weekly window,
// "Usage 41 % 7j ↻jeu.", its reset as a weekday while more than a day away. Rounded half
// to even like the status line's awk printf "%.0f" (22.5 reads 22 on both), capped at 100,
// the reset in local time; a window whose reset has passed is over. Null off a
// subscription or before the first response has reported a window.
export function quotaText(
  limits: readonly RateLimit[] | undefined,
  lang: Lang,
  now: number = Date.now(),
): string | null {
  const resetOf = (limit: RateLimit) =>
    limit.resetsAt === undefined ? NaN : Date.parse(limit.resetsAt);
  // A reset that does not parse leaves the window open: NaN <= now is false
  const open = (kind: string) =>
    limits?.find(
      (limit) =>
        limit.kind === kind && Number.isFinite(limit.percentUsed) && !(resetOf(limit) <= now),
    );
  const fiveHour = open("five_hour");
  const window = fiveHour ?? open("seven_day");
  if (window === undefined) return null;
  const weekly = fiveHour === undefined;
  const fr = lang === "fr";
  const used = Math.max(0, window.percentUsed);
  const floor = Math.floor(used);
  const rounded =
    used - floor === 0.5 ? (floor % 2 === 0 ? floor : floor + 1) : Math.round(used);
  const percent = Math.min(100, rounded);
  const head = `사용량 ${percent}${NBSP}%` + (weekly ? " 7일" : "");
  const reset = resetOf(window);
  if (Number.isNaN(reset)) return head;
  const d = new Date(reset);
  if (weekly && reset - now >= DAY_MS) {
    return `${head} ↻${(fr ? WEEKDAYS_FR : WEEKDAYS_EN)[d.getDay()]}`;
  }
  const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return `${head} ↻${time}`;
}

// Shown once per machine, the same on every surface.
export function welcomeText(lang: Lang): string {
  return lang === "fr"
    ? "이제 모든 응답에 CO₂가 표시됩니다."
    : "이제 모든 응답에 CO₂가 표시됩니다.";
}

export function pushHistory(history: number[], grams: number): number[] {
  if (!(grams > 0)) return history;
  return [...history, grams].slice(-HISTORY_SIZE);
}

// The claude-carbon status line already shows the session total: no second one.
export function isCarbonStatusLine(command: unknown): boolean {
  return (
    typeof command === "string" &&
    command.includes("claude-carbon") &&
    command.includes("statusline.sh")
  );
}

// ── The /carbon-panel pane ──────────────────────────────────────────────────

// The pane's tab: the plugin's name, as the person asked for it
export function paneTitle(_lang: Lang): string {
  return "claude-carbon";
}

export function commandDescription(lang: Lang): string {
  return "CO₂ 분자와 세션 기록 보기";
}

// Shown once per machine to someone already welcomed before the pane existed.
export function paneHint(lang: Lang): string {
  return "/carbon-panel을 입력하면 CO₂ 분자와 세션 기록을 볼 수 있습니다.";
}

export function paneUnplaced(lang: Lang): string {
  return `여기서는 탄소 패널을 열 수 없습니다${NBSP}: 창을 넓히거나 Claude Code를 업데이트하세요.`;
}

// The molecule's line: the session so far, and its ratio to the median of past sessions.
export function currentLine(
  grams: number,
  sessionMedian: number | null,
  lang: Lang,
): string {
  const fr = lang === "fr";
  const head = `이 세션${NBSP}:`;
  const total = `${head} ${formatGrams(grams, lang)}`;
  void fr;
  if (sessionMedian === null || !(sessionMedian > 0) || !(grams > 0)) return total;
  const r = grams / sessionMedian;
  const ratio =
    r >= 10 ? `${Math.round(r)}` : decimal(r, r >= 1 ? 1 : 2, lang);
  return `${total} · ${ratio}×${NBSP}중앙값`;
}

// Before 10 past sessions the colour compares with a starting reference (0.5 kgCO₂),
// said simply to someone who just arrived
export function colorNote(pastSessions: number, lang: Lang): string {
  return `임시 색상${NBSP}: 10회의 세션 이후 사용 습관에 맞게 조정됩니다 (현재 ${pastSessions}회).`;
}

// No history file. `missing` names the tools the SessionStart hook found absent (jq,
// sqlite3): without them no database is created.
export function noHistoryText(lang: Lang, missing: string[] | null = null): string {
  if (missing !== null && missing.length > 0) {
    const tools = missing.join(" and ");
    return `세션을 기록하려면 ${tools}를 설치한 뒤 Claude Code를 다시 시작하세요 (README 참조).`;
  }
  return "아직 기록이 없습니다 (README 참조).";
}

// Shown once, to someone whose database the SessionStart hook created by itself
export function autoSetupText(lang: Lang): string {
  return "이 컴퓨터에 이미 저장된 세션을 포함해 이제 모든 세션이 기록됩니다. 어디에도 전송되지 않습니다.";
}

export function emptyRangeText(lang: Lang): string {
  return "이 기간에는 세션이 없습니다.";
}


const RANGE_LABELS: Record<string, [string, string]> = {
  "7d": ["7일", "7일"],
  "30d": ["30일", "30일"],
  "1y": ["12개월", "12개월"],
  all: ["전체", "전체"],
  custom: ["사용자 지정", "사용자 지정"],
};
function pick(pair: [string, string] | undefined, lang: Lang): string {
  return pair === undefined ? "" : lang === "fr" ? pair[0] : pair[1];
}

export function rangeLabel(range: string, lang: Lang): string {
  return pick(RANGE_LABELS[range], lang);
}


function countOf(n: number, step: string, lang: Lang): string {
  const fr = lang === "fr";
  void fr;
  if (step === "week") return `주 ${n}개`;
  if (step === "month") return `월 ${n}개`;
  return `세션 ${n}개`;
}

// Under the stripes: what one stripe is, and the median their colours measure against
const PER: Record<string, [string, string]> = {
  day: ["일", "일"],
  week: ["주", "주"],
  month: ["월", "월"],
};
// Before three periods with sessions in them there is nothing to colour: the stripes
// wait, and say what they will show
export function stripesWaitText(step: string, filled: number, lang: Lang): string {
  const fr = lang === "fr";
  const units: Record<string, [string, string]> = {
    day: ["일", "일"],
    week: ["주", "주"],
    month: ["월", "월"],
  };
  const unit = pick(units[step], lang);
  void fr;
  return `색상 띠는 3${unit} 사용 후 나타납니다 (현재 ${filled}${unit}): 기간마다 하나씩 CO₂에 따라 파란색에서 빨간색으로 표시됩니다.`;
}

export function stripesCaption(step: string, stripeMedian: number | null, lang: Lang): string {
  const fr = lang === "fr";
  const unit = pick(PER[step], lang);
  const one = `${unit}당 띠 하나`;
  if (stripeMedian === null) return one;
  return `${one} · 중앙값 ${formatGrams(stripeMedian, lang)}`;
}

// The period's figure, the pane's main one
export function periodHeadline(grams: number, lang: Lang): string {
  return `${formatGrams(grams, lang)} · 해당 기간`;
}

export function sessionsCount(n: number, lang: Lang): string {
  return countOf(n, "session", lang);
}

// The custom range's fields: a date typed day first, or as 2026-05-01
export function datePlaceholder(lang: Lang): string {
  return "YYYY-MM-DD";
}

export function dateInvalid(lang: Lang): string {
  return `날짜를 인식할 수 없습니다${NBSP}: 2026-05-01 형식으로 입력하세요.`;
}

// A day key shown back in its field: "01/05/2026"
export function dayInputValue(key: string): string {
  const [y, m, d] = key.split("-");
  return `${d ?? ""}/${m ?? ""}/${y ?? ""}`;
}

export function fromLabel(lang: Lang): string {
  return "시작";
}

export function toLabel(lang: Lang): string {
  return "종료";
}

export function waitingText(lang: Lang): string {
  return `이 세션${NBSP}: 첫 응답을 기다리는 중`;
}



const MONTHS_KO = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

// A day ("22 août", "Aug 22", with the year when asked), or a month for monthly
// stripes ("août 2026", "Aug 2026").
export function dateLabel(
  ms: number,
  step: string,
  lang: Lang,
  withYear = false,
): string {
  const d = new Date(ms);
  const month = MONTHS_KO[d.getMonth()] ?? "";
  if (step === "month") return `${d.getFullYear()}년${NBSP}${month}`;
  return `${month}${NBSP}${d.getDate()}일${withYear ? `${NBSP}${d.getFullYear()}년` : ""}`;
}

// A stripe's tooltip in the desktop app.
export function stripeTitle(
  start: number,
  step: string,
  grams: number,
  sessions: number,
  lang: Lang,
): string {
  const fr = lang === "fr";
  const when =
    step === "week"
      ? `${dateLabel(start, "session", lang)} 주`
      : dateLabel(start, step, lang);
  void fr;
  const amount = grams > 0 ? formatGrams(grams, lang) : "세션 없음";
  return sessions === 0
    ? `${when} · ${amount}`
    : `${when} · ${amount} · ${countOf(sessions, "session", lang)}`;
}

// Against the same length of time just before: "+12 % par rapport aux 30 jours
// d'avant". Nothing when there is nothing before to compare with.
const BEFORE: Record<string, [string, string]> = {
  "7d": "이전 7일",
  "30d": "이전 30일",
  "1y": "이전 12개월",
  custom: "이전 기간",
};

// The change against the period before, in whole percent; null when there is none
export function changePercent(grams: number, previous: number): number | null {
  return previous > 0 ? Math.round(((grams - previous) / previous) * 100) : null;
}
export function compareText(
  grams: number,
  previous: number,
  range: string,
  lang: Lang,
): string | null {
  const before = BEFORE[range];
  void fr;
  const change = changePercent(grams, previous);
  if (before === undefined || change === null) return null;
  const sign = change > 0 ? "+" : change < 0 ? "-" : "";
  const amount = `${sign}${Math.abs(change)}${NBSP}%`;
  return `${amount} · ${before} 대비`;
}

// ── Model families, as the session block names them ─────

const FAMILY_NAMES: Record<string, string> = {
  fable: "Fable",
  opus: "Opus",
  sonnet: "Sonnet",
  haiku: "Haiku",
};
export function familyName(f: string): string {
  return FAMILY_NAMES[f] ?? f;
}


// The car factor as the pane prints it, the unit spelled out: "142 gCO₂/km, ADEME 2025"
export function carTag(tag: string): string {
  return tag.replace(/(\d)\s*g\//, `$1${NBSP}gCO₂/`);
}

// A subagent's molecule, on hover: "Sous-agent 2 · 12 gCO₂"
export function subagentTitle(n: number, grams: number, lang: Lang): string {
  return `서브에이전트 ${n} · ${formatGrams(grams, lang)}`;
}

export function subagentsAlt(n: number, lang: Lang): string {
  return `이 세션의 서브에이전트 ${n}개로, 각자의 CO₂에 따라 색이 지정된 작은 분자입니다`;
}

// More subagents than the row shows: "+4"
export function moreAgentsText(n: number): string {
  return `+${n}`;
}

// The context window's fill: "Contexte 42 %"
export function contextText(percentUsed: number, lang: Lang): string {
  const p = `${Math.round(percentUsed)}${NBSP}%`;
  return `컨텍스트 ${p}`;
}

// The running session, under its line: "12 réponses · 3 sous-agents · Opus"
export function sessionStatsText(
  answers: number,
  subagents: number,
  f: string | null,
  lang: Lang,
): string {
  const fr = lang === "fr";
  const parts = [
    `${answers}회 응답`,
    `서브에이전트 ${subagents}개`,
  ];
  if (f !== null) parts.push(familyName(f));
  return parts.join(" · ");
}

// The pane's last line: who made it, and the version for a team
export const AUTHOR_URL = "https://www.linkedin.com/in/gwittebolle/";
// The French site is at the root; only the English one has a prefix
export function teamUrl(lang: Lang): string {
  return lang === "fr"
    ? "https://tokenclimate.com/?ref=carbon-panel"
    : "https://tokenclimate.com/en?ref=carbon-panel";
}

// The project's home: its README says what the tool does and leads to the methodology
export const REPO_URL = "https://github.com/gwittebolle/claude-carbon";
export function repoLabel(lang: Lang): string {
  return "claude-carbon 자세히 보기";
}

// A newer release, at the top of the foot: what to ask Claude, the plugin command
// The one command for every install: the skill updates the plugin, the clone, or both
export const UPDATE_COMMAND = "/carbon-update";
export function updateText(version: string, lang: Lang): string {
  return `버전 ${version}을 사용할 수 있습니다${NBSP}: ${UPDATE_COMMAND}를 입력한 뒤 다시 시작하세요.`;
}

// The foot's two credit lines, a label and a colon each, the link after it
export function builtByLabel(lang: Lang): string {
  return `제작${NBSP}:`;
}
export function forTeamLabel(lang: Lang): string {
  return `비즈니스 버전 보기${NBSP}:`;
}

export function blockTitle(kind: "session" | "usage", lang: Lang): string {
  if (kind === "session") return "이 세션";
  return "내 사용량";
}

// The tiles at the top of the desktop pane: a label over a figure
const TILE_LABELS: Record<string, [string, string]> = {
  period: "해당 기간",
  change: "이전 대비",
  sessions: "세션",
  cost: "API 가격 기준",
  car: "자동차 주행",
};
export function tileLabel(kind: string, lang: Lang): string {
  return pick(TILE_LABELS[kind], lang);
}

// "+29 %", "-18 %"
export function changeValue(change: number): string {
  const sign = change > 0 ? "+" : change < 0 ? "-" : "";
  return `${sign}${Math.abs(change)}${NBSP}%`;
}

// "27 616 $", "$27,616", "12,30 $"
export function moneyValue(usd: number, lang: Lang): string {
  return costText(usd, lang).replace(" (API 가격)", "");
}

// Under the value tile, so it holds whoever pays: a subscription, an API key, extra
// usage, or sessions of several kinds. Which session was billed how is not recorded.
export function apiValueNote(lang: Lang): string {
  return `API로 청구된 사용량의 비용입니다${NBSP}; Pro, Max 또는 Ultra 구독이 일부 또는 전부를 포함할 수 있습니다.`;
}

// "12,34 $ au prix API", "$12.34 at API prices"
export function costText(usd: number, lang: Lang): string {
  // Whole dollars from a thousand up, grouped: "27 608 $", "$27,608"
  const money =
    usd >= 1000
      ? lang === "fr"
        ? `${thousands(usd, lang)}${NBSP}$`
        : `$${thousands(usd, lang)}`
      : formatUsd(usd, lang);
  return `${money} (API 가격)`;
}

function thousands(n: number, lang: Lang): string {
  const whole = String(Math.round(n));
  const sep = lang === "fr" ? NBSP : ",";
  return whole.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
}

// "≈ 1 680 km en voiture (142 g/km, ADEME 2025)", the reports' and cards' car line
export function equivalenceText(
  grams: number,
  car: { divisor: number; label: string; tag: string },
  lang: Lang,
): string {
  return `≈${NBSP}${thousands(grams / car.divisor, lang)} ${car.label} (${carTag(car.tag)})`;
}

// The car tile's figure, the period's CO2 in the locale's unit: "≈ 1 684 km"
export function carValue(
  grams: number,
  car: { divisor: number; unit: string },
  lang: Lang,
): string {
  const distance = grams / car.divisor;
  // Under a unit, "≈ 0 km" reads as nothing at all
  if (distance < 1) return `<${NBSP}1 ${car.unit}`;
  return `≈${NBSP}${thousands(distance, lang)} ${car.unit}`;
}

// The blocks a person can show or hide in the pane, under the gear

const BLOCK_LABELS: Record<string, [string, string]> = {
  compare: "비교",
  cost: "API 비용",
  equivalence: "환산",
  projects: "프로젝트",
  detail: "상세",
};
export function blockLabel(block: string, lang: Lang): string {
  return pick(BLOCK_LABELS[block], lang);
}

// ── The "Détail" block: a period's tokens, energy and CO2 by kind of token ──
const KIND_LABELS: Record<string, [string, string]> = {
  input: "입력",
  cacheWrite: "캐시 기록",
  cacheRead: "캐시 읽기",
  output: "출력",
};
export function kindLabel(kind: string, lang: Lang): string {
  return pick(KIND_LABELS[kind], lang);
}

// Above each bar: what it splits
export function detailBarLabel(bar: "tokens" | "co2", lang: Lang): string {
  if (bar === "tokens") return "토큰";
  return `${UNIT} 및 에너지`;
}

// 820, 12k, 371M, then billions with one decimal: 25,3 Md / 25.3B
export function formatTokens(n: number, lang: Lang): string {
  if (n >= 999.5e6)
    return lang === "fr" ? `${decimal(n / 1e9, 1, lang)}${NBSP}Md` : `${decimal(n / 1e9, 1, lang)}B`;
  const space = lang === "fr" ? NBSP : "";
  if (n >= 999.5e3) return `${Math.round(n / 1e6)}${space}M`;
  if (n >= 1000) return `${Math.round(n / 1e3)}${space}k`;
  return String(Math.round(n));
}

// Wh under a kWh, then kWh (one decimal under 100), then MWh
export function formatWh(wh: number, lang: Lang): string {
  if (wh < 999.5) return `${Math.round(wh)}${NBSP}Wh`;
  const kwh = wh / 1000;
  if (kwh < 99.95) return `${decimal(kwh, 1, lang)}${NBSP}kWh`;
  if (kwh < 999.5) return `${Math.round(kwh)}${NBSP}kWh`;
  return `${decimal(kwh / 1000, 1, lang)}${NBSP}MWh`;
}

// One decimal, "98,4 %", "< 0,1 %" for a share that is there but rounds to nothing,
// "0 %" for none; a space before % in both languages, as the rest of the pane writes it
export function formatShare(share: number, lang: Lang): string {
  if (share <= 0) return `0${NBSP}%`;
  if (share < 0.0005) return `<${NBSP}${decimal(0.1, 1, lang)}${NBSP}%`;
  return `${decimal(share * 100, 1, lang)}${NBSP}%`;
}

// Under a kind's name: "23,8 Md tokens (98,4 %) · 21,6 kWh · 6,2 kgCO₂ (60,9 %)"
export function detailLine(
  part: { tokens: number; tokenShare: number; wh: number; grams: number; gramShare: number },
  lang: Lang,
): string {
  return (
    `${formatTokens(part.tokens, lang)} tokens (${formatShare(part.tokenShare, lang)}) · ` +
    `${formatWh(part.wh, lang)} · ${formatGrams(part.grams, lang)} (${formatShare(part.gramShare, lang)})`
  );
}

export function detailTotalLine(
  total: { tokens: number; wh: number; grams: number },
  lang: Lang,
): string {
  return (
    `합계: ${formatTokens(total.tokens, lang)} 토큰 · ` +
    `${formatWh(total.wh, lang)} · ${formatGrams(total.grams, lang)}`
  );
}

// What a hovered part of a bar says: its kind, its figures on that bar, its share
// "Cache relu · 23,9 Md tokens · 98,4 %", "Cache relu · 535 kWh · 153,5 kgCO₂ · 60,9 %"
export function detailHover(
  part: { kind: string; tokens: number; tokenShare: number; wh: number; grams: number; gramShare: number },
  bar: "tokens" | "co2",
  lang: Lang,
): string {
  const name = kindLabel(part.kind, lang);
  return bar === "tokens"
    ? `${name} · ${formatTokens(part.tokens, lang)} tokens · ${formatShare(part.tokenShare, lang)}`
    : `${name} · ${formatWh(part.wh, lang)} · ${formatGrams(part.grams, lang)} · ${formatShare(part.gramShare, lang)}`;
}

// The methodology, straight from the detail
export const METHODOLOGY_URL =
  "https://github.com/gwittebolle/claude-carbon/blob/main/METHODOLOGY.md#the-panes-detail-by-kind-of-token";
export function methodologyLabel(lang: Lang): string {
  return "방법론 읽기";
}

// When some sessions of the period are left out: stored with older factors, or the
// running one before its first answer
export function detailCoverage(n: number, total: number, lang: Lang): string {
  return `해당 기간 세션 ${total}개 중 ${n}개 포함: 나머지는 이전 계수로 기록되었습니다.`;
}

// Before the hook has written the tokens by kind: after the next answer
export function detailWaitText(lang: Lang): string {
  return "상세 내용은 다음 응답 후 표시됩니다.";
}

export function detailAlt(bar: "tokens" | "co2", lang: Lang): string {
  return `${bar === "tokens" ? "토큰" : UNIT}의 입력, 캐시 기록, 캐시 읽기, 출력별 비율`;
}

export function showLabel(lang: Lang): string {
  return "표시";
}


// The button that puts /carbon-card in the prompt, for the person to send. The card
// covers the calendar year so far (the one just ended, over the first days of January),
// whatever range the pane shows: the label says which.
export function cardButtonLabel(year: number, lang: Lang): string {
  return `${year}년 탄소 카드 만들기`;
}

// After the button filled the prompt: what is there and what to do
export function cardReadyText(lang: Lang): string {
  return `프롬프트에 /carbon-card가 입력되었습니다${NBSP}: Enter를 눌러 카드를 만드세요.`;
}

// The prompt could not take it (a dialog is open, or no prompt box here)
export function cardFillFailed(lang: Lang): string {
  return `프롬프트에 /carbon-card를 넣을 수 없습니다${NBSP}: 직접 입력하세요.`;
}

// When the prompt already holds a draft, the button leaves it alone and says why
export function cardDraftBusy(lang: Lang): string {
  return `프롬프트에 이미 작성 중인 내용이 있습니다${NBSP}: 카드를 만들려면 비우세요.`;
}


function percent(share: number): string {
  const p = Math.round(share * 100);
  return p < 1 ? `<${NBSP}1${NBSP}%` : `${p}${NBSP}%`;
}


// A project as a bar, left-aligned so bars compare whatever the font:
// "███████ 41 % carbonara · 103,5 kgCO₂"
export function projectBarLine(
  project: string,
  grams: number,
  share: number,
  lang: Lang,
): string {
  const name = project === "" ? "프로젝트 없음" : project;
  const bar = "█".repeat(Math.max(1, Math.round(share * 16)));
  return `${bar} ${percent(share)} ${name} · ${formatGrams(grams, lang)}`;
}

// The rest after the projects listed
export function otherProjectsLine(count: number, grams: number, share: number, lang: Lang): string {
  const fr = lang === "fr";
  void fr;
  const label = `기타 프로젝트 ${count}개`;
  return `${label} · ${formatGrams(grams, lang)} · ${percent(share)}`;
}

export function mascotAlt(lang: Lang): string {
  return "중앙값 대비 이 세션의 CO₂에 따라 파란색(미만)에서 빨간색(초과)로 채색된 픽셀 CO₂ 분자";
}

// The scale under the molecule, read aloud: where this session sits on it
export function scaleAlt(cls: number | null, lang: Lang): string {
  const fr = lang === "fr";
  void fr;
  if (cls === null)
    return "중앙값 미만은 파란색, 초과는 빨간색으로 표시되는 색상 척도";
  return `파란색에서 빨간색까지의 색상 척도에서 이 세션은 ${cls + 1}/8 위치`;
}

export function stripesAlt(lang: Lang): string {
  return "기간마다 하나의 띠이며 왼쪽부터 오래된 순서이고, 중앙값 미만은 파란색, 초과는 빨간색";
}

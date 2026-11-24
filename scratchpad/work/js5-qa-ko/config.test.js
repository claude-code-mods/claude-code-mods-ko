import { expect, test } from "claude-code/testing";
import { pickLang } from "./i18n";
import { cmd, resume, say, startSession, endTurn, stop, NOTES, distillNow, pushGuard, openPanel, PANEL_NOTES, ctl, world } from "./test-world";
const EN = "English";
const HAS_CJK = /[\u3400-\u9fff\uff00-\uffef]/;
test("\u82F1\u6587\uFF1A\u72C0\u614B\u5217\u3001\u7D00\u9304\u8207 toast \u6C92\u6709 [ctx-handoff] \u524D\u7DB4", async ($, on) => {
  const w = world(on, 1e5, 1e6, {}, [], 5, EN);
  await endTurn($);
  expect(w.statuses.at(-1)).toBe("25 more messages until notes update");
  await distillNow($);
  expect(w.statuses).toContain("Updating notes\u2026");
  expect(w.statuses.at(-1)).toBe("30 more messages until notes update");
  const toast = w.toasts.find((t) => t.includes("Notes updated"));
  expect(toast).toContain("Notes updated: 2 changes, sent along with your next message");
  expect(toast).toContain(NOTES);
  await cmd($, "distill off");
  expect(w.statuses.at(-1)).toBeUndefined();
  expect([...w.statuses, ...w.toasts, ...w.logs].filter((x) => x?.includes("[ctx-handoff]"))).toEqual([]);
});
test("\u82F1\u6587\uFF1A\u5C0D\u8A71\u9084\u77ED\u6642\u7684\u72C0\u614B\u5217", async ($, on) => {
  const w = world(on, 1e4, 1e6, {}, [], 30, EN);
  await endTurn($);
  expect(w.statuses.at(-1)).toBe("Conversation is short, notes not updated yet");
});
test("\u82F1\u6587\uFF1A/handoff \u72C0\u614B\u8207\u7528\u6CD5\u56DE\u8986\u4E0D\u52A0 [ctx-handoff]\uFF08\u5F15\u64CE\u6703\u52A0 ctx-handoff:\uFF09\uFF0C\u5167\u6587\u6C92\u6709\u4E2D\u6587", async ($, on) => {
  const w = world(on, 65e4, 1e6, {}, [], 5, EN);
  const s = await cmd($, "");
  expect(s.text).toStartWith("context 650000 / threshold 600000 (window 1000000)");
  expect(s.text).toContain("Cache refresh on");
  expect(s.text).toContain("/handoff now");
  expect(s.text).toContain("Guards: 0 on, 0 draft, 0 off");
  expect(s.text).not.toMatch(HAS_CJK);
  const u = await cmd($, "nwo");
  expect(u.text).toContain('Unknown subcommand "nwo"');
  expect(w.forks.length).toBe(0);
});
test("\u82F1\u6587\uFF1A\u96E2\u5E2D\u8207\u4EA4\u63A5\u7684\u63D0\u793A", async ($, on) => {
  const w = world(on, 1e5, 1e6, { "away:S1": { handoff: "HANDOFF: test" } }, [], 0, EN);
  const r = await say($, "hello");
  expect(r.drop).toContain("There is an away handoff");
  expect(r.drop).not.toMatch(HAS_CJK);
  await resume($);
  await w.clock.advance(0);
  expect(w.submits[0]).toContain("The previous conversation went idle");
  expect(w.submits[0]).toContain("HANDOFF: test");
});
test("\u82F1\u6587\uFF1A\u4EA4\u63A5\u51FA\u932F\u6642\u7684 toast \u8207\u7D00\u9304", async ($, on) => {
  const w = world(on, 65e4, 1e6, {}, [], 0, EN);
  ctl.failHandoff = true;
  await stop($);
  await w.clock.advance(0);
  expect(w.toasts.some((t) => t.includes("Handoff failed"))).toBe(true);
  expect(w.logs.some((l) => l.includes("handoff failed: nothing-to-fork: "))).toBe(true);
});
test("\u82F1\u6587\uFF1A\u9762\u677F\u8207\u5B88\u9580\u6E05\u55AE", async ($, on) => {
  const w = world(on, 1e3, 1e6, { "guards:C--proj": [pushGuard("proposed")] }, [], 0, EN);
  w.files.set(NOTES, PANEL_NOTES);
  const ui = await openPanel($);
  expect(await ui.find({ type: "Text", text: /draft/ })).toBeDefined();
  expect(await ui.find({ type: "Button", text: /Approve/ })).toBeDefined();
  expect(await ui.find({ type: "Text", text: /Project notes and guards/ })).toBeDefined();
  expect((await cmd($, "guard")).text).toContain("[draft \xB7 block]");
});
const PICK_CASES = [
  { name: "language \u8A2D\u5B9A\u662F \uD55C\uAD6D\uC5B4", setting: "\uD55C\uAD6D\uC5B4", locale: "en-US", want: "ko" },
  { name: "\u7CFB\u7D71\u8A9E\u7CFB zh-TW", setting: void 0, locale: "zh-TW", want: "zh-TW" },
  { name: "\u7CFB\u7D71\u8A9E\u7CFB zh-Hant-TW", setting: void 0, locale: "zh-Hant-TW", want: "zh-TW" },
  { name: "\u7CFB\u7D71\u8A9E\u7CFB zh-CN", setting: void 0, locale: "zh-CN", want: "zh-TW" },
  { name: "\u7CFB\u7D71\u8A9E\u7CFB en-US", setting: void 0, locale: "en-US", want: "en" },
  { name: "\u8B80\u4E0D\u5230\u7CFB\u7D71\u8A9E\u7CFB", setting: void 0, locale: void 0, want: "en" },
  { name: "language \u8A2D\u5B9A\u662F\u4E2D\u6587\u3001\u7CFB\u7D71\u82F1\u6587", setting: "Traditional Chinese", locale: "en-US", want: "zh-TW" },
  { name: "language \u8A2D\u5B9A\u662F\u7E41\u9AD4\u4E2D\u6587", setting: "\u7E41\u9AD4\u4E2D\u6587", locale: "en-US", want: "zh-TW" },
  { name: "language \u8A2D\u5B9A\u662F\u65E5\u6587\u3001\u7CFB\u7D71\u4E2D\u6587", setting: "japanese", locale: "zh-TW", want: "en" },
  { name: "language \u8A2D\u5B9A\u7A7A\u767D\uFF1A\u770B\u7CFB\u7D71\u8A9E\u7CFB", setting: "  ", locale: "zh-TW", want: "zh-TW" }
];
for (const c of PICK_CASES) {
  test(`\u8A9E\u8A00\u5224\u65B7\uFF1A${c.name} \u2192 ${c.want}`, async () => {
    expect(pickLang(c.setting, c.locale)).toBe(c.want);
  });
}
for (const [language, want] of [["\u7E41\u9AD4\u4E2D\u6587", "\u518D 25 \u5247\u6574\u7406\u7B46\u8A18"], ["English", "25 more messages until notes update"]]) {
  test(`\u8A9E\u8A00\u5224\u65B7\u7D93\u7531 plugin\uFF1Alanguage=${language}`, async ($, on) => {
    const w = world(on, 1e5, 1e6, {}, [], 5, language);
    await endTurn($);
    expect(w.statuses.at(-1)).toBe(want);
  });
}
test("\u8A2D\u5B9A\uFF1A\u9762\u677F\u5B58\u7684\u9580\u6ABB\u6703\u751F\u6548", async ($, on) => {
  world(on, 1e5, 1e6, {}, [], 5);
  ctl.panelSettings = { threshold: 2e5 };
  expect((await cmd($, "")).text).toContain("context 100000 / \u9580\u6ABB 200000");
});
test("\u8A2D\u5B9A\uFF1A\u8D85\u51FA\u7BC4\u570D\u7684\u503C\u62C9\u56DE\u7BC4\u570D\u5167\uFF08\u9580\u6ABB\u6700\u4F4E 50000\uFF09", async ($, on) => {
  world(on, 1e5, 1e6, {}, [], 5);
  ctl.panelSettings = { threshold: 10 };
  expect((await cmd($, "")).text).toContain("context 100000 / \u9580\u6ABB 50000");
});
test("\u8A2D\u5B9A\uFF1A\u9762\u677F\u6C92\u8A2D\u7684\u503C\u8B80 settings.json \u7684 pluginConfigs", async ($, on) => {
  world(on, 1e5, 1e6, {}, [], 5);
  ctl.pluginOptions = { threshold: 2e5, idle_minutes: 30 };
  const text = (await cmd($, "")).text;
  expect(text).toContain("context 100000 / \u9580\u6ABB 200000");
  expect(text).toContain("\u9592\u7F6E 30 \u5206");
});
test("\u8A2D\u5B9A\uFF1A\u95DC\u9589\u4FDD\u6301\u5FEB\u53D6\u7684\u8A0A\u606F\u7167\u8A2D\u5B9A\u7684\u9592\u7F6E\u5206\u9418\u6578", async ($, on) => {
  world(on, 1e5, 1e6, {}, [], 5);
  ctl.pluginOptions = { idle_minutes: 20 };
  expect((await cmd($, "refresh off")).text).toContain("\u5FEB\u53D6\u5237\u65B0\u5DF2\u8A2D\u70BA off\uFF08\u9592\u7F6E 20 \u5206\u9418");
});
test("\u8A2D\u5B9A\uFF1A\u5225\u8655\u6539\u4E86\u4ECB\u9762\u8A9E\u8A00\uFF0C\u4E0B\u4E00\u5247\u8A0A\u606F\u8D77\u4ECB\u9762\u6587\u5B57\u8DDF\u8457\u63DB", async ($, on) => {
  const w = world(on, 1e5, 1e6, {}, [], 5);
  await startSession($);
  ctl.panelSettings = { language: "en" };
  await say($, "hi");
  await endTurn($);
  expect(w.statuses.at(-1)).toBe("25 more messages until notes update");
});
test("\u8A2D\u5B9A\uFF1A\u9762\u677F\u7684\u9592\u7F6E\u5206\u9418\u6578\u6C7A\u5B9A\u591A\u4E45\u5F8C\u4FDD\u6301\u5FEB\u53D6", async ($, on) => {
  const w = world(on, 1e5, 1e6, {}, [], 5);
  ctl.panelSettings = { idle_minutes: 10 };
  await startSession($);
  await endTurn($);
  await w.clock.advance(10 * 6e4);
  expect(w.logs.some((l) => l.includes("\u5FEB\u53D6\u5237\u65B0 1/3"))).toBe(true);
});

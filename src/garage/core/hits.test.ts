import { test } from "node:test";
import assert from "node:assert/strict";
import { classifyVisitor, hitOf, hitsLines, isCountable, normalizePath, referrerHost } from "./hits.ts";

const CHROME = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
const SAFARI = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";

test("agents acting for a person are agents, not crawlers, even in a Mozilla coat", () => {
  assert.deepEqual(classifyVisitor("Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Claude-User/1.0; +claude-user@anthropic.com)"), { kind: "agent", family: "claude-user" });
  assert.deepEqual(classifyVisitor("Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot"), { kind: "agent", family: "chatgpt-user" });
  assert.deepEqual(classifyVisitor("Mozilla/5.0 (compatible; Perplexity-User/1.0; +https://perplexity.ai/perplexity-user)"), { kind: "agent", family: "perplexity-user" });
});

test("the crawlers that train are their own kind", () => {
  assert.deepEqual(classifyVisitor("Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)"), { kind: "ai-crawler", family: "claudebot" });
  assert.deepEqual(classifyVisitor("Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.2; +https://openai.com/gptbot"), { kind: "ai-crawler", family: "gptbot" });
  assert.deepEqual(classifyVisitor("Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)"), { kind: "ai-crawler", family: "perplexitybot" });
});

test("search crawlers, link previews, monitors and shells each get their kind", () => {
  assert.deepEqual(classifyVisitor("Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"), { kind: "crawler", family: "googlebot" });
  assert.deepEqual(classifyVisitor("facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)"), { kind: "crawler", family: "link-preview" });
  assert.deepEqual(classifyVisitor("Mozilla/5.0 (compatible; SomeNewBot/0.1)"), { kind: "crawler", family: "crawler" });
  assert.deepEqual(classifyVisitor("Mozilla/5.0+(compatible; UptimeRobot/2.0; http://www.uptimerobot.com/)"), { kind: "monitor", family: "monitor" });
  assert.deepEqual(classifyVisitor("curl/8.7.1"), { kind: "tool", family: "curl" });
  assert.deepEqual(classifyVisitor("python-requests/2.32.3"), { kind: "tool", family: "python" });
  assert.deepEqual(classifyVisitor("node"), { kind: "tool", family: "node" });
});

test("browsers are browsers, and nothing is a browser", () => {
  assert.deepEqual(classifyVisitor(CHROME), { kind: "browser", family: "chrome" });
  assert.deepEqual(classifyVisitor(SAFARI), { kind: "browser", family: "safari" });
  assert.deepEqual(classifyVisitor("Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:131.0) Gecko/20100101 Firefox/131.0"), { kind: "browser", family: "firefox" });
  assert.deepEqual(classifyVisitor(""), { kind: "unknown", family: "" });
  assert.deepEqual(classifyVisitor(null), { kind: "unknown", family: "" });
  assert.deepEqual(classifyVisitor("x"), { kind: "unknown", family: "" });
});

test("paths lose their ids, their query strings and their case", () => {
  assert.equal(normalizePath("/garage/runs/7a2a55a1-0000-0000-0000-000000000000"), "/garage/runs/:id");
  assert.equal(normalizePath("/api/remora/jobs/7a2a55a1-0000-0000-0000-000000000000?x=1"), "/api/remora/jobs/:id");
  assert.equal(normalizePath("/remora/verify/e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"), "/remora/verify/:id");
  assert.equal(normalizePath("/Devlog/The-Warning-That-Fired/"), "/devlog/the-warning-that-fired");
  assert.equal(normalizePath("/"), "/");
  assert.equal(normalizePath("/" + "x".repeat(300)).length, 120);
  assert.equal(normalizePath("/" + "a".repeat(300)), "/:id", "a long hex-looking segment is an id");
});

test("referrers keep the host only, and never our own", () => {
  assert.equal(referrerHost("https://news.ycombinator.com/item?id=1"), "news.ycombinator.com");
  assert.equal(referrerHost("https://www.squaloo.com/remora"), "");
  assert.equal(referrerHost("not a url"), "");
  assert.equal(referrerHost(null), "");
});

test("the instrument leaves the Garage and static files alone", () => {
  assert.equal(isCountable("/garage"), false);
  assert.equal(isCountable("/garage/runs/x"), false);
  assert.equal(isCountable("/api/garage/command"), false);
  assert.equal(isCountable("/_next/static/chunks/x.js"), false);
  assert.equal(isCountable("/brand/logo.svg"), false);
  assert.equal(isCountable("/"), true);
  assert.equal(isCountable("/remora"), true);
  assert.equal(isCountable("/api/remora/jobs"), true);
  assert.equal(isCountable("/llms.txt"), true, "agents read it; it counts");
});

test("a hit holds the five fields and nothing else", () => {
  const h = hitOf({ pathname: "/api/remora/jobs/7a2a55a1-0000-0000-0000-000000000000", method: "post", userAgent: "curl/8.7.1", referrer: null });
  assert.deepEqual(h, { path: "/api/remora/jobs/:id", method: "POST", kind: "tool", family: "curl", refHost: "" });
  assert.deepEqual(Object.keys(h), ["path", "method", "kind", "family", "refHost"]);
});

test("the summary lines carry their window, and an empty instrument says so", () => {
  assert.deepEqual(hitsLines({ days: 7, total: 0, byKind: [], byDay: [], topPaths: [], families: [], referrers: [], firstHitAt: null }), ["no hits in the last 7 days to now, UTC; the instrument has never recorded one"]);
  const lines = hitsLines({
    days: 1,
    total: 10,
    byKind: [{ kind: "agent", n: 6 }, { kind: "browser", n: 4 }],
    byDay: [{ day: "2026-10-13", kind: "agent", n: 6 }, { day: "2026-10-13", kind: "browser", n: 4 }],
    topPaths: [{ path: "/llms.txt", kind: "agent", n: 5 }],
    families: [{ family: "claude-user", kind: "agent", n: 6 }],
    referrers: [],
    firstHitAt: "2026-10-13T08:00:00.000Z",
  });
  assert.equal(lines[0], "10 hits, last 1 day to now, UTC, counting since 2026-10-13 08:00Z");
  assert.equal(lines[1], "by kind: agent 6 (60%) · browser 4 (40%)");
  assert.equal(lines[2], "2026-10-13: agent 6 · browser 4");
  assert.match(lines[3], /^top paths: \/llms\.txt agent 5$/);
});

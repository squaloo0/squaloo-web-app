import { test } from "node:test";
import assert from "node:assert/strict";
import { libraryMarkdown, parseLibraryQuery } from "./notion.ts";
import { NOTION_QUERY_FIXTURE } from "./notion.fixture.ts";

test("a Notion query becomes library rows; untitled pages are skipped; columns may be named loosely", () => {
  const { rows, more } = parseLibraryQuery(NOTION_QUERY_FIXTURE);
  assert.equal(more, "cursor-2");
  assert.equal(rows.length, 2, "the untitled page is not a source");
  assert.deepEqual(rows[0], {
    id: "1b2c3d4e-0000-0000-0000-000000000001",
    name: "Cloudflare Radar, Bot vs. Human, worldwide",
    url: "https://radar.cloudflare.com/traffic#bot-vs-human",
    status: "reviewed",
    kind: "dashboard",
    added: "2026-10-13",
    addedBy: "founder",
    scrub: ["one network only", "bot is not agent"],
    summary: "Bot 65%, human 35%, Cloudflare's network, HTML responses, week to 2026-10-12.",
    notionUrl: "https://www.notion.so/Cloudflare-Radar-1b2c3d4e",
  });
  assert.equal(rows[1].name, "Semrush: bot traffic now exceeds human");
  assert.equal(rows[1].url, "https://www.semrush.com/blog/ai-agent-bot-traffic/", "any url property is the URL");
  assert.equal(rows[1].status, "", "no Status column, no status");
  assert.equal(rows[1].added, "2026-10-14", "falls back to the page's creation day");
  assert.deepEqual(parseLibraryQuery({}), { rows: [], more: null });
});

test("the mirror is generated, numbered, and says where it came from", () => {
  const { rows } = parseLibraryQuery(NOTION_QUERY_FIXTURE);
  const md = libraryMarkdown(rows, "2026-10-14 01:10 UTC", "abcdef1234567890");
  assert.match(md, /^# The library/);
  assert.match(md, /Generated from the Garage Research Library in Notion \(database `abcdef12…`\) by `garage library pull` at 2026-10-14 01:10 UTC\. Do not hand-edit/);
  assert.match(md, /## S1 · Cloudflare Radar, Bot vs\. Human, worldwide\n\n- \*\*URL:\*\* https:\/\/radar\.cloudflare\.com/);
  assert.match(md, /\*\*Scrub before use:\*\* one network only, bot is not agent/);
  assert.match(md, /## S2 · Semrush/);
  assert.ok(!md.includes("notion.so"), "the agent never sees Notion page urls");
  assert.match(libraryMarkdown([], "x", "y"), /No sources yet/);
});

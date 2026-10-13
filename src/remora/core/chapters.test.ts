import { test } from "node:test";
import assert from "node:assert/strict";
import { chaptersFileName, chaptersMarkdown, chaptersSummary, linkAt } from "./chapters.ts";
import { parseYtDlpJson } from "./meta.ts";
import { YTDLP_YOUTUBE_FIXTURE } from "./meta.fixture.ts";

const chapters = [
  { start_time: 0, end_time: 18, title: "Intro" },
  { start_time: 18, end_time: 102.4, title: "Verse | one" },
  { start_time: 102.4, end_time: 213, title: "Chorus, forever" },
];

test("links open the video at the second, where the provider can", () => {
  assert.equal(linkAt("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "youtube", 102.4), "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=102s");
  assert.equal(linkAt("https://vimeo.com/22439234", "vimeo", 61), "https://vimeo.com/22439234#t=61s");
  assert.equal(linkAt("https://www.tiktok.com/@a/video/1", "tiktok", 5), null);
});

test("the document is a header and a table, pipes escaped, links on starts", () => {
  const meta = parseYtDlpJson({ ...(YTDLP_YOUTUBE_FIXTURE as object), chapters });
  const md = chaptersMarkdown({ meta, canonicalUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", provider: "youtube", now: new Date("2026-10-13T06:00:00.000Z") });
  assert.ok(md.startsWith("# Rick Astley - Never Gonna Give You Up"));
  assert.ok(md.includes("- length: 3:33"));
  assert.ok(md.includes("- chapters: 3 · read 2026-10-13T06:00:00.000Z"));
  assert.ok(md.includes("| 1 | [0:00](https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=0s) | 0:18 | Intro |"), md);
  assert.ok(md.includes("| 2 | [0:18](https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=18s) | 1:24 | Verse \\| one |"), md);
  assert.ok(md.includes("| 3 | [1:42](https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=102s) | 1:51 | Chorus, forever |"), md);
  assert.deepEqual(chaptersSummary(meta.chapters), { count: 3, first: "Intro", last: "Chorus, forever" });
  assert.deepEqual(chaptersSummary([]), { count: 0, first: null, last: null });
});

test("file names are safe and tagged", () => {
  assert.equal(chaptersFileName("A/B: C?", "id1"), "A_B_ C_ [id1].chapters.md");
  assert.ok(chaptersFileName("x".repeat(200), "id").length < 140);
});

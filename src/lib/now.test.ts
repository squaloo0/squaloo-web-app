/**
 * SQU-436's /now guards, each shown to fire (charter rule 11): newest-first
 * sorting, a date format that does not depend on the machine's timezone, and
 * content guards over the real src/content/now.ts (valid dates, non-empty
 * text, https-or-local links, local files that exist under public/).
 * Run: npm run now:test   (also try: TZ=America/Los_Angeles / TZ=Asia/Tokyo)
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { isIsoDate, formatNowDate, sortNewestFirst } from "./now.ts";
import { NOW } from "../content/now.ts";

const PUBLIC = fileURLToPath(new URL("../../public/", import.meta.url));

/** Problems with a list of entries; empty means clean. Used on the real content and on planted bad content. */
function problems(entries: readonly { date: string; title: string; body: string; links?: readonly { label: string; href: string }[] }[]): string[] {
  const out: string[] = [];
  entries.forEach((e, i) => {
    if (!isIsoDate(e.date)) out.push(`#${i}: bad date ${e.date}`);
    if (!e.title.trim()) out.push(`#${i}: empty title`);
    if (!e.body.trim()) out.push(`#${i}: empty body`);
    for (const l of e.links ?? []) {
      if (!l.label.trim()) out.push(`#${i}: empty link label`);
      if (!(l.href.startsWith("https://") || (l.href.startsWith("/") && !l.href.startsWith("//")))) out.push(`#${i}: bad href ${l.href}`);
      else if (l.href.startsWith("/") && !existsSync(PUBLIC + l.href.slice(1))) out.push(`#${i}: missing file ${l.href}`);
    }
  });
  return out;
}

test("isIsoDate accepts real dates and rejects the rest", () => {
  assert.equal(isIsoDate("2026-11-14"), true);
  assert.equal(isIsoDate("2028-02-29"), true);
  for (const bad of ["2026-13-01", "2026-00-10", "2026-02-30", "2027-02-29", "2026-1-1", "20261114", "", "2026-11-14T00:00", null, 5]) {
    assert.equal(isIsoDate(bad), false, String(bad));
  }
});

test("formatNowDate is a pure string transform, whatever the machine's TZ", () => {
  assert.equal(formatNowDate("2026-11-14"), "Nov 14, 2026");
  assert.equal(formatNowDate("2026-01-01"), "Jan 1, 2026");
  assert.equal(formatNowDate("2026-12-31"), "Dec 31, 2026");
  assert.throws(() => formatNowDate("2026-13-01"));
});

test("sortNewestFirst: newest first, stable on ties, does not mutate", () => {
  const input = [
    { date: "2026-01-05", t: "a" },
    { date: "2026-12-01", t: "b" },
    { date: "2026-01-05", t: "c" },
    { date: "2026-06-30", t: "d" },
  ];
  const copy = structuredClone(input);
  assert.deepEqual(sortNewestFirst(input).map((e) => e.t), ["b", "d", "a", "c"]);
  assert.deepEqual(input, copy);
});

test("content guard: the real now.ts is clean", () => {
  assert.ok(NOW.length > 0);
  assert.deepEqual(problems(NOW), []);
});

test("content guard fires on planted bad entries", () => {
  const base = { date: "2026-11-14", title: "t", body: "b" };
  assert.match(problems([{ ...base, date: "2026-13-01" }])[0], /bad date/);
  assert.match(problems([{ ...base, title: " " }])[0], /empty title/);
  assert.match(problems([{ ...base, body: "" }])[0], /empty body/);
  assert.match(problems([{ ...base, links: [{ label: "x", href: "http://example.com" }] }])[0], /bad href/);
  assert.match(problems([{ ...base, links: [{ label: "x", href: "//evil.example" }] }])[0], /bad href/);
  assert.match(problems([{ ...base, links: [{ label: "x", href: "/decks/nope.pdf" }] }])[0], /missing file/);
  assert.deepEqual(problems([{ ...base, links: [{ label: "x", href: "https://example.com" }] }]), []);
});

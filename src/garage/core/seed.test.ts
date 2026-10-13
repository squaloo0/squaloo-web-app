import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseCsv } from "./csv.ts";
import { laneOption, scrubOptions, seedPage, seedProperties } from "./seed.ts";

test("the CSV parser keeps quoted commas, doubled quotes and newlines inside fields", () => {
  const rows = parseCsv('Name,Summary,Scrub\n"A, with comma","She said ""hi""\nsecond line","lab sample (surveys, hypothetical), promotional"\n');
  assert.equal(rows.length, 1);
  assert.equal(rows[0].Name, "A, with comma");
  assert.equal(rows[0].Summary, 'She said "hi"\nsecond line');
  assert.equal(rows[0].Scrub, "lab sample (surveys, hypothetical), promotional");
  assert.deepEqual(parseCsv(""), []);
});

test("scrub prose with commas inside the flags becomes the database's comma-free options", () => {
  assert.deepEqual(scrubOptions("lab sample (surveys, hypothetical), US panel only"), ["lab sample (surveys or hypothetical)", "US panel only"]);
  assert.deepEqual(scrubOptions("no measurement (theory/position), primary not opened"), ["no measurement (theory or position)", "primary not opened"]);
  assert.deepEqual(scrubOptions("regulator cites others' numbers, US jurisdiction only; staff report, not a rule"), ["regulator cites others", "US jurisdiction only", "staff report not a rule"]);
  assert.deepEqual(scrubOptions("mirror, original dead, no method stated, no measurement (theory/position)"), ["no method stated", "no measurement (theory or position)", "mirror of a dead original"]);
  assert.deepEqual(scrubOptions("something new nobody listed"), [], "an unknown flag stays in the page body, never silently dropped");
  assert.equal(laneOption("2 · Agents running shops, honestly reported"), "2 agent shops");
  assert.equal(laneOption("7 · What bots do on small sites"), "7 bots on small sites");
  assert.equal(laneOption(""), null);
});

test("the CoWork seed of 2026-10-13 parses to 29 pages with every property the database has", () => {
  const rows = parseCsv(readFileSync(new URL("../library/seeds/2026-10-13-cowork.csv", import.meta.url), "utf8"));
  assert.equal(rows.length, 29);
  const pages = rows.map(seedPage).filter((p) => p !== null);
  assert.equal(pages.length, 29);
  const vend = pages.find((p) => /Project Vend: Phase two/.test(p.name))!;
  assert.equal(vend.kind, "article");
  assert.deepEqual(vend.classes, ["agent-commerce", "pricing", "conversion"]);
  assert.deepEqual(vend.scrub, ["no method stated", "promotional", "demand not public (staff or simulated)"]);
  assert.equal(vend.lane, "2 agent shops");
  assert.equal(vend.added, "2026-10-13");
  const props = seedProperties(vend) as { Lane: { select: { name: string } }; Summary: { rich_text: { text: { content: string } }[] }; URL: { url: string } };
  assert.equal(props.Lane.select.name, "2 agent shops");
  assert.equal(props.URL.url, "https://www.anthropic.com/research/project-vend-2");
  assert.ok(props.Summary.rich_text.every((t) => t.text.content.length <= 1900));
  for (const p of pages) assert.ok(p.kind !== null, `kind parsed for ${p.name}`);
  for (const p of pages) assert.ok(p.lane !== null, `lane parsed for ${p.name}`);
});

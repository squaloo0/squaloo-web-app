/**
 * SQU-436's guards, each shown to fire (charter rule 11): the /now source
 * rule (slug-or-"direct"), the injected-normalizer signup check, and the
 * column guard that ties NOW_SOURCE_MAX to subscribers.source (migration
 * 0002), so the regex cannot be widened without a migration.
 * Run: npm run newsletter:test
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { checkSignupWith, normalizeNowSource, NOW_SOURCE_MAX, sourceColumnWidth } from "./newsletter.ts";

test("a clean slug is kept; case and padding are folded", () => {
  assert.equal(normalizeNowSource("linkedin"), "linkedin");
  assert.equal(normalizeNowSource("LinkedIn"), "linkedin");
  assert.equal(normalizeNowSource(" linkedin "), "linkedin");
  for (const ok of ["li-profile", "li-page", "a1-b2"]) assert.equal(normalizeNowSource(ok), ok);
});

test("anything else reads as direct", () => {
  for (const bad of ["Bad Value", "a_b", "../x", "linkedin?x=1", "", undefined, null]) {
    assert.equal(normalizeNowSource(bad), "direct", String(bad));
  }
});

test("the length cap: 16 kept, 17 refused", () => {
  assert.equal(NOW_SOURCE_MAX, 16);
  assert.equal(normalizeNowSource("a".repeat(16)), "a".repeat(16));
  assert.equal(normalizeNowSource("a".repeat(17)), "direct");
});

test("an array takes its first element's verdict", () => {
  assert.equal(normalizeNowSource(["linkedin", "x"]), "linkedin");
  assert.equal(normalizeNowSource(["Bad Value", "linkedin"]), "direct");
  assert.equal(normalizeNowSource([]), "direct");
});

const GOOD = { email: "a@b.co", name: "", consent: "on", website: "", src: "Bad Value" };

test("checkSignupWith applies the injected normalizer", () => {
  const r = checkSignupWith(GOOD, normalizeNowSource);
  assert.deepEqual(r, { ok: true, email: "a@b.co", name: null, src: "direct" });
  const k = checkSignupWith({ ...GOOD, src: "li-page" }, normalizeNowSource);
  assert.equal(k.ok && k.src, "li-page");
});

test("honeypot, email and consent still refuse", () => {
  assert.deepEqual(checkSignupWith({ ...GOOD, website: "x" }, normalizeNowSource), { ok: false, reason: "honeypot" });
  assert.deepEqual(checkSignupWith({ ...GOOD, email: "nope" }, normalizeNowSource), { ok: false, reason: "email" });
  assert.deepEqual(checkSignupWith({ ...GOOD, consent: undefined }, normalizeNowSource), { ok: false, reason: "consent" });
});

const MIGRATION = fileURLToPath(new URL("../app/marshal-qr/db/migrations/0002_subscribers.sql", import.meta.url));

test("the column guard: NOW_SOURCE_MAX fits subscribers.source", () => {
  const width = sourceColumnWidth(readFileSync(MIGRATION, "utf8"));
  assert.equal(width, 16, "the parser must find the column, or the guard proves nothing");
  assert.ok(NOW_SOURCE_MAX <= width);
});

test("the column guard would fire for a regex widened to 32 without a migration", () => {
  const width = sourceColumnWidth(readFileSync(MIGRATION, "utf8"));
  assert.ok(width !== null);
  assert.ok(!(32 <= width));
});

test("sourceColumnWidth reads the line case-insensitively and returns null when absent", () => {
  assert.equal(sourceColumnWidth("  SOURCE  varchar( 24 ) NOT NULL"), 24);
  assert.equal(sourceColumnWidth("email TEXT"), null);
});

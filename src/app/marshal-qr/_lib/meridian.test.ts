/**
 * SQU-427's guards, each shown to fire (charter rule 11): the redirect
 * allowlist, the honeypot, the email and consent checks, and the limiter.
 * Run: npm run meridian:test
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { checkSignup, humanSize, mailto, makeRateLimiter, normalizeSource, qrRedirectPath } from "./meridian.ts";

test("an absent or unknown ?src= reads as the board", () => {
  assert.equal(normalizeSource(undefined), "board");
  assert.equal(normalizeSource(""), "board");
  assert.equal(normalizeSource("tiktok"), "board");
  assert.equal(normalizeSource(["stage", "flyer"]), "stage");
  assert.equal(normalizeSource(" STAGE "), "stage");
});

test("/qr is the flyer, /qr/<known> is that source, and nothing else reaches the Location", () => {
  assert.equal(qrRedirectPath(undefined), "/marshal-qr?src=flyer");
  assert.equal(qrRedirectPath("stage"), "/marshal-qr?src=stage");
  assert.equal(qrRedirectPath("card"), "/marshal-qr?src=card");
  // The guard: hostile or unknown segments never appear in the redirect.
  for (const hostile of ["//evil.example", "https://evil.example", "stage&src=x", "%2F%2Fevil", "../solomon", "board"]) {
    const loc = qrRedirectPath(hostile);
    assert.ok(loc === "/marshal-qr", `${hostile} -> ${loc}`);
    assert.ok(!loc.includes("evil") && !loc.includes(".."), loc);
  }
});

test("the mail actions encode their subjects", () => {
  assert.equal(mailto("Pre-seed / grant conversation"), "mailto:marshal@squaloo.com?subject=Pre-seed%20%2F%20grant%20conversation");
});

const good = { email: " Ada@Example.com ", name: "Ada", consent: "on", website: "", src: "stage" };

test("a good signup passes, lowercased and trimmed, with its source", () => {
  assert.deepEqual(checkSignup(good), { ok: true, email: "ada@example.com", name: "Ada", src: "stage" });
  assert.deepEqual(checkSignup({ ...good, name: "  ", src: "nope" }), { ok: true, email: "ada@example.com", name: null, src: "board" });
});

test("the honeypot fires before anything else is read", () => {
  assert.deepEqual(checkSignup({ ...good, website: "http://spam.example" }), { ok: false, reason: "honeypot" });
  assert.deepEqual(checkSignup({ ...good, website: "x", email: "not-an-email" }), { ok: false, reason: "honeypot" });
});

test("a bad email is refused", () => {
  for (const email of ["", "a", "a@b", "a b@c.d", "@c.d", "a@.", 42, undefined, "x".repeat(250) + "@a.co"]) {
    assert.deepEqual(checkSignup({ ...good, email }), { ok: false, reason: "email" }, String(email));
  }
});

test("no consent, no signup", () => {
  for (const consent of [undefined, "", "off", false, "true"]) {
    assert.deepEqual(checkSignup({ ...good, consent }), { ok: false, reason: "consent" }, String(consent));
  }
});

test("an overlong name is refused", () => {
  assert.deepEqual(checkSignup({ ...good, name: "n".repeat(121) }), { ok: false, reason: "name" });
});

test("the limiter allows `limit` per window per key, then refuses, then resets", () => {
  const allow = makeRateLimiter(3, 60_000);
  const t0 = 1_000_000;
  assert.equal(allow("ip-a", t0), true);
  assert.equal(allow("ip-a", t0 + 1), true);
  assert.equal(allow("ip-a", t0 + 2), true);
  assert.equal(allow("ip-a", t0 + 3), false, "the fourth inside the window must be refused");
  assert.equal(allow("ip-b", t0 + 3), true, "another key has its own window");
  assert.equal(allow("ip-a", t0 + 60_000), true, "a new window resets");
});

test("file sizes read the way a person reads them", () => {
  assert.equal(humanSize(449366), "449 KB");
  assert.equal(humanSize(1_250_000), "1.3 MB");
  assert.equal(humanSize(10), "1 KB");
});

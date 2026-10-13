import { test } from "node:test";
import assert from "node:assert/strict";
import { branchFor, isWrasseBranch, prBody, prTitle, publishVerdict, slugify } from "./propose.ts";

const H = "a".repeat(64);
const G = "b".repeat(64);

test("branches carry the seat prefix and a safe slug", () => {
  assert.equal(slugify("Make /llms.txt tell agents what Remora offers!"), "make-llms-txt-tell-agents-what-remora-of");
  assert.equal(slugify("   "), "change");
  assert.equal(branchFor("feat", "The 402 points at checkout"), "wrasse/feat/the-402-points-at-checkout");
  assert.equal(isWrasseBranch("wrasse/feat/x-1"), true);
  assert.equal(isWrasseBranch("garage/feat/x"), false);
  assert.equal(isWrasseBranch("wrasse/feat/../main"), false);
});

test("guard 1, the harness half: a push needs the approval of the diff as it is now", () => {
  const ok = publishVerdict({ recordedHash: H, currentHash: H, approved: new Set([H]), verdict: "approved" });
  assert.deepEqual(ok, { ok: true });
  assert.match((publishVerdict({ recordedHash: H, currentHash: H, approved: new Set(), verdict: null }) as { reason: string }).reason, /no approval row/);
  assert.match((publishVerdict({ recordedHash: H, currentHash: G, approved: new Set([H]), verdict: "approved" }) as { reason: string }).reason, /branch changed since the run/);
  assert.match((publishVerdict({ recordedHash: H, currentHash: H, approved: new Set([H]), verdict: "denied" }) as { reason: string }).reason, /denied/);
  assert.match((publishVerdict({ recordedHash: null, currentHash: H, approved: new Set([H]), verdict: "approved" }) as { reason: string }).reason, /recorded no diff/);
  assert.match((publishVerdict({ recordedHash: H, currentHash: null, approved: new Set([H]), verdict: "approved" }) as { reason: string }).reason, /no diff against main/);
});

test("the PR is the gate comment, named and attributed", () => {
  const body = prBody({ runId: "7a2a55a1-0000", report: "**Gate comment.** Changed x because y.\n", charterVersion: "0.2", charterHash: "0983781777b6", costUsd: 0.4, diffHash: H });
  assert.match(body, /^\*\*Gate comment\.\*\* Changed x because y\.\n\n---\nGarage run `7a2a55a1` · charter 0\.2 `09837817` · \$0\.40 · diff `aaaaaaaaaaaa` · approved at the gate\./);
  assert.match(body, /Generated with \[Claude Code\]/);
  assert.equal(prTitle("## Make llms.txt name the routes\n\nmore", "wrasse/feat/x"), "wrasse: Make llms.txt name the routes");
  assert.equal(prTitle(null, "wrasse/feat/the-402-points-at-checkout"), "wrasse: feat: the 402 points at checkout");
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { charterBinding, charterHash, charterVersion } from "./charter.ts";

test("guard 7: a one-byte edit changes the recorded hash", () => {
  const a = "# The Garage\n\n**Version 0.1, drafted 2026-10-13.** Not yet binding.\n";
  const b = a.replace("0.1", "0.2");
  assert.equal(charterHash(a).length, 64);
  assert.notEqual(charterHash(a), charterHash(b));
  assert.equal(charterHash(a), charterHash(a), "the same text hashes the same");
  assert.equal(charterVersion(a), "0.1");
  assert.equal(charterVersion(b), "0.2");
  assert.equal(charterVersion("no version here"), null);
  assert.equal(charterBinding(a), false);
  assert.equal(charterBinding(a.replace(" Not yet binding.", "")), true);
});

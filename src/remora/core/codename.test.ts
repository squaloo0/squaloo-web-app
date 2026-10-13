import { test } from "node:test";
import assert from "node:assert/strict";
import { codeName } from "./codename.ts";

test("the known machines have their names", () => {
  assert.equal(codeName("mac-mini"), "mantis");
  assert.equal(codeName("Mac-Mini "), "mantis");
  assert.equal(codeName("fly-sjc"), "lantern");
  assert.equal(codeName("fly-ord"), "lantern");
  assert.equal(codeName("air"), "minnow");
  assert.equal(codeName(null), null);
  assert.equal(codeName(""), null);
});

test("a stranger gets a fish, the same fish every time, never its hostname", () => {
  const a = codeName("marshals-macbook-pro");
  assert.equal(codeName("marshals-macbook-pro"), a);
  assert.match(a!, /^[a-z]+$/);
  assert.ok(!a!.includes("mac"));
  assert.notEqual(codeName("marshals-macbook-pro"), codeName("some-other-box-7"), "likely distinct");
});

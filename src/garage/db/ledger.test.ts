import { test } from "node:test";
import assert from "node:assert/strict";
import { splitStatements } from "./ledger.ts";

test("migrations split on statement ends, not on semicolons inside comments", () => {
  const parts = splitStatements("-- a; comment\nCREATE TABLE a (x int); -- trailing; comment\n\nCREATE INDEX b ON a (x);\n");
  assert.deepEqual(parts, ["CREATE TABLE a (x int)", "CREATE INDEX b ON a (x)"]);
});

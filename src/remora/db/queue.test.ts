import { test } from "node:test";
import assert from "node:assert/strict";
import { splitStatements } from "./queue.ts";

test("migrations split on statement ends, not on semicolons inside comments", () => {
  const sql = `-- header; with a semicolon
CREATE TABLE a (
  id text PRIMARY KEY,   -- the id; never reused
  n  integer NOT NULL
);
CREATE INDEX a_n ON a (n); -- trailing; comment
`;
  assert.deepEqual(splitStatements(sql), ["CREATE TABLE a (\n  id text PRIMARY KEY,\n  n  integer NOT NULL\n)", "CREATE INDEX a_n ON a (n)"]);
  assert.deepEqual(splitStatements("  \n-- only a comment;\n"), []);
});

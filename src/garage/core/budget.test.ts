import { test } from "node:test";
import assert from "node:assert/strict";
import { budgetBeforeLaunch, PER_DAY_USD, PER_RUN_USD, prettyUsd } from "./budget.ts";

test("guard 2: the caps are the charter's numbers", () => {
  assert.equal(PER_RUN_USD, 2);
  assert.equal(PER_DAY_USD, 10);
});

test("guard 2: a fresh day gets the full run cap; a spent day refuses to launch", () => {
  assert.deepEqual(budgetBeforeLaunch({ spentTodayUsd: 0 }), { ok: true, capUsd: 2 });
  assert.deepEqual(budgetBeforeLaunch({ spentTodayUsd: 1.99 }), { ok: true, capUsd: 2 });
  assert.deepEqual(budgetBeforeLaunch({ spentTodayUsd: 8.5 }), { ok: true, capUsd: 1.5 }, "the day's remainder shrinks the run cap");
  const spent = budgetBeforeLaunch({ spentTodayUsd: 10 });
  assert.equal(spent.ok, false);
  assert.match((spent as { reason: string }).reason, /day budget spent: \$10\.00 of \$10\.00/);
  assert.equal(budgetBeforeLaunch({ spentTodayUsd: 10.004 }).ok, false, "rounding never opens a cent of room");
  assert.deepEqual(budgetBeforeLaunch({ spentTodayUsd: 0, perRunUsd: 0.5 }), { ok: true, capUsd: 0.5 });
});

test("dollars print like dollars", () => {
  assert.equal(prettyUsd(0), "$0.00");
  assert.equal(prettyUsd(0.041), "$0.041");
  assert.equal(prettyUsd(1.5), "$1.50");
});

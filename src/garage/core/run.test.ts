import { test } from "node:test";
import assert from "node:assert/strict";
import { outcomeOf, runLine, runPreamble, type RunRow } from "./run.ts";

test("guard 2: a budget-stopped query lands as halted: budget, a turn-stopped one as halted: turns", () => {
  assert.deepEqual(outcomeOf("error_max_budget_usd"), { status: "halted", haltReason: "budget" });
  assert.deepEqual(outcomeOf("error_max_turns"), { status: "halted", haltReason: "turns" });
  assert.deepEqual(outcomeOf("success"), { status: "done", haltReason: null });
  assert.deepEqual(outcomeOf("error_during_execution"), { status: "failed", haltReason: null });
});

test("a run line carries its boundary: machine, rung, cost, turns, charter", () => {
  const row: RunRow = {
    id: "3f2a9c1e-0000-0000-0000-000000000000",
    startedAt: "2026-10-13T06:10:44.000Z",
    finishedAt: null,
    machine: "air",
    hat: "report",
    rung: 0,
    ticket: null,
    prompt: "x",
    charterVersion: "0.1",
    charterHash: "e3b0c44298fc",
    model: "m",
    status: "halted",
    haltReason: "budget",
    costUsd: 2,
    turns: 7,
    toolCalls: 12,
    denials: 1,
    report: null,
    error: null,
  };
  assert.equal(runLine(row), "3f2a9c1e · 2026-10-13 06:10Z · air · report · rung 0 · halted: budget · $2.00 · 7 turns · 12 tools · 1 refused · charter 0.1 e3b0c442");
});

test("the preamble tells the agent what it cannot otherwise know", () => {
  const p = runPreamble({ machine: "air", rung: 0, hat: "report", ticket: null, date: "2026-10-13", capUsd: 2, tools: ["Read"], maxTurns: 30 });
  assert.match(p, /Rung: 0\. Hat: report\. No ticket/);
  assert.match(p, /Budget for this run: \$2\.00/);
  assert.match(p, /Do not claim to remember/);
});

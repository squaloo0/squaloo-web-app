import { test } from "node:test";
import assert from "node:assert/strict";
import type { HookCallback, Options, SDKMessage } from "@anthropic-ai/claude-agent-sdk";
import { runOnce, type Deps, type RunRequest } from "./run.ts";
import type { EventKind, FinishRun, Ledger, StartRun } from "../../src/garage/db/ledger.ts";
import type { RunRow } from "../../src/garage/core/run.ts";

const CHARTER = "# The Garage — charter for wrasse\n\n**Version 0.1, drafted 2026-10-13.** Not yet binding.\n";
const CWD = "/Users/wrasse/squaloo-web-app";

type Step =
  | { kind: "tool"; name: string; input: Record<string, unknown>; response: unknown }
  | { kind: "assistant"; text: string }
  | { kind: "result"; subtype: string; cost: number; turns: number; text?: string; isError?: boolean };

/** A scripted model: the fake SDK calls the hooks exactly where the real one would. */
function play(script: Step[]): (p: { prompt: string; options: Options }) => AsyncIterable<SDKMessage> {
  return ({ options }) =>
    (async function* () {
      const pre = options.hooks?.PreToolUse?.[0]?.hooks[0] as HookCallback;
      const post = options.hooks?.PostToolUse?.[0]?.hooks[0] as HookCallback;
      const sig = { signal: new AbortController().signal };
      for (const step of script) {
        if (step.kind === "tool") {
          const base = { session_id: "s", transcript_path: "/t", cwd: CWD, permission_mode: "dontAsk", tool_use_id: "t1" };
          const v = await pre({ ...base, hook_event_name: "PreToolUse", tool_name: step.name, tool_input: step.input } as never, "t1", sig);
          const out = v as { hookSpecificOutput?: { permissionDecision?: string } };
          if (out.hookSpecificOutput?.permissionDecision === "deny") continue;
          await post({ ...base, hook_event_name: "PostToolUse", tool_name: step.name, tool_input: step.input, tool_response: step.response } as never, "t1", sig);
          if (options.abortController?.signal.aborted) return;
        } else if (step.kind === "assistant") {
          yield { type: "assistant", message: { content: [{ type: "text", text: step.text }] } } as unknown as SDKMessage;
        } else {
          yield { type: "result", subtype: step.subtype, total_cost_usd: step.cost, num_turns: step.turns, result: step.text ?? "", is_error: step.isError ?? step.subtype !== "success" } as unknown as SDKMessage;
        }
      }
    })();
}

type Notebook = {
  runs: Map<string, StartRun & Partial<FinishRun>>;
  events: { runId: string; kind: EventKind; tool: string | null; detail: string }[];
};

function fakeDeps(over: { halt?: boolean; spent?: number; charter?: string; script?: Step[]; env?: Record<string, string>; recent?: RunRow[]; dirty?: boolean; diff?: string | null } = {}) {
  const book: Notebook = { runs: new Map(), events: [] };
  const ledger: Ledger = {
    async startRun(r) {
      const id = `run-${book.runs.size + 1}-aaaaaaaa`;
      book.runs.set(id, { ...r });
      return id;
    },
    async finishRun(id, f) {
      Object.assign(book.runs.get(id)!, f);
    },
    async addEvent(runId, kind, tool, detail) {
      book.events.push({ runId, kind, tool, detail });
    },
    async spentTodayUsd() {
      return over.spent ?? 0;
    },
    async approvedHashes() {
      return new Set<string>();
    },
    async recentRuns() {
      return over.recent ?? [];
    },
    async instrumentLines() {
      return ["12 hits, last 7 days to now, UTC, counting since 2026-10-13 08:00Z"];
    },
  };
  let captured: { prompt: string; options: Options } | null = null;
  let calls = 0;
  const inner = play(over.script ?? [{ kind: "result", subtype: "success", cost: 0.3, turns: 3, text: "the report" }]);
  const deps: Deps = {
    now: () => new Date("2026-10-13T06:00:00Z"),
    machine: "air",
    cwd: CWD,
    exists: (p) => over.halt === true && p.endsWith("src/garage/HALT"),
    readFile: (p) => {
      if (p.endsWith("CHARTER.md")) return over.charter ?? CHARTER;
      throw new Error("no such file " + p);
    },
    env: over.env ?? { PATH: "/usr/bin", HOME: "/Users/wrasse", NEON_DATABASE_URL: "postgresql://u:p@h/db" },
    ledger,
    query: (p) => {
      calls++;
      captured = p;
      return inner(p);
    },
    log: () => {},
    git: {
      async commitAll() {
        gitCalls.push("commitAll");
        return over.dirty ?? false;
      },
      async diffHash() {
        gitCalls.push("diffHash");
        return over.diff ?? null;
      },
    },
  };
  const gitCalls: string[] = [];
  return { deps, book, calls: () => calls, captured: () => captured, gitCalls };
}

const REQ: RunRequest = { hat: "report", prompt: "read and report", rung: 0, ticket: null, model: "test-model", maxTurns: 10, diffHash: null, commandId: null, branch: null };

test("guard 6: with the HALT file present the run writes one row and exits without calling the model", async () => {
  const f = fakeDeps({ halt: true });
  const r = await runOnce(f.deps, REQ);
  assert.equal(r.status, "halted");
  assert.equal(r.haltReason, "halt-file");
  assert.equal(f.calls(), 0);
  assert.equal(f.book.runs.size, 1);
  assert.deepEqual(f.book.events.map((e) => e.kind), ["halt"]);
});

test("guard 2: a spent day refuses to launch; an unspent one hands the SDK the run cap", async () => {
  const spent = fakeDeps({ spent: 10 });
  const r = await runOnce(spent.deps, REQ);
  assert.equal(r.status, "halted");
  assert.equal(r.haltReason, "day-budget");
  assert.equal(spent.calls(), 0);

  const fresh = fakeDeps({ spent: 0 });
  await runOnce(fresh.deps, REQ);
  assert.equal(fresh.captured()!.options.maxBudgetUsd, 2);

  const late = fakeDeps({ spent: 8.5 });
  await runOnce(late.deps, REQ);
  assert.equal(late.captured()!.options.maxBudgetUsd, 1.5, "the day's remainder is the cap");
});

test("guard 2: the SDK stopping at the cap lands in the row as halted: budget with the cost", async () => {
  const f = fakeDeps({ script: [{ kind: "result", subtype: "error_max_budget_usd", cost: 2.0, turns: 9 }] });
  const r = await runOnce(f.deps, REQ);
  assert.equal(r.status, "halted");
  assert.equal(r.haltReason, "budget");
  assert.equal(r.costUsd, 2);
  assert.equal(r.turns, 9);
  assert.equal(r.report, null);
});

test("guard 7: the row carries the charter's version and hash, and a one-byte edit changes it", async () => {
  const a = fakeDeps();
  await runOnce(a.deps, REQ);
  const b = fakeDeps({ charter: CHARTER.replace("0.1", "0.2") });
  await runOnce(b.deps, REQ);
  const ra = [...a.book.runs.values()][0];
  const rb = [...b.book.runs.values()][0];
  assert.equal(ra.charterVersion, "0.1");
  assert.equal(rb.charterVersion, "0.2");
  assert.equal(ra.charterHash.length, 64);
  assert.notEqual(ra.charterHash, rb.charterHash);
  assert.ok(a.captured()!.options.systemPrompt && typeof a.captured()!.options.systemPrompt === "object");
  const prompt = (a.captured()!.options.systemPrompt as { prompt: string }).prompt;
  assert.ok(prompt.startsWith(CHARTER), "the charter is the system prompt");
  assert.match(prompt, /Rung: 0\. Hat: report/);
});

test("guard 5: the model's process gets the allowlist, not the ledger's url", async () => {
  const f = fakeDeps();
  await runOnce(f.deps, REQ);
  const env = f.captured()!.options.env!;
  assert.equal(env.NEON_DATABASE_URL, undefined);
  assert.equal(env.PATH, "/usr/bin");
  assert.deepEqual(f.captured()!.options.tools, ["Read", "Glob", "Grep"]);
  assert.equal(f.captured()!.options.permissionMode, "dontAsk");
  assert.deepEqual(f.captured()!.options.settingSources, []);
});

test("guards 1 and 3 through the hook: a refused call is recorded, and the run goes on", async () => {
  const f = fakeDeps({
    script: [
      { kind: "tool", name: "Read", input: { file_path: `${CWD}/README.md` }, response: "# Squaloo" },
      { kind: "tool", name: "Write", input: { file_path: `${CWD}/src/app/garage/page.tsx`, content: "x" }, response: "" },
      { kind: "tool", name: "Read", input: { file_path: `${CWD}/.env.local` }, response: "nope" },
      { kind: "result", subtype: "success", cost: 0.5, turns: 4, text: "done" },
    ],
  });
  const r = await runOnce(f.deps, REQ);
  assert.equal(r.status, "done");
  assert.equal(r.toolCalls, 1);
  assert.equal(r.denials, 2);
  assert.equal(r.report, "done");
  const kinds = f.book.events.map((e) => `${e.kind}:${e.tool}`);
  assert.deepEqual(kinds, ["tool:Read", "deny:Write", "deny:Read"]);
  assert.match(f.book.events[1].detail, /^rung: rung 0 reads and reports/);
  assert.match(f.book.events[2].detail, /^secrets: Read of a secret path/);
  assert.equal(f.book.events[0].detail, `file_path=${CWD}/README.md`, "events hold paths, never contents");
});

test("guard 5: a planted key shape in tool output halts the run and the ledger never holds the value", async () => {
  const planted = "sk_live_" + "Q".repeat(24);
  const f = fakeDeps({
    script: [
      { kind: "tool", name: "Grep", input: { pattern: "live" }, response: `src/x.ts:1: const k = "${planted}"` },
      { kind: "tool", name: "Read", input: { file_path: `${CWD}/README.md` }, response: "never reached" },
      { kind: "result", subtype: "success", cost: 0.2, turns: 2, text: "never reached" },
    ],
  });
  const r = await runOnce(f.deps, REQ);
  assert.equal(r.status, "halted");
  assert.equal(r.haltReason, "secret");
  assert.equal(r.toolCalls, 1);
  assert.equal(r.report, null);
  const halt = f.book.events.find((e) => e.kind === "halt")!;
  assert.match(halt.detail, /secret shape in tool output: stripe key/);
  for (const e of f.book.events) assert.ok(!e.detail.includes(planted), "the value never reaches the ledger");
  assert.ok(!JSON.stringify([...f.book.runs.values()]).includes(planted));
});

test("guard 5: the same halt when the key shape is in the agent's own words", async () => {
  const f = fakeDeps({ script: [{ kind: "assistant", text: "found it: whsec_" + "Z".repeat(30) }, { kind: "result", subtype: "success", cost: 0.1, turns: 1, text: "x" }] });
  const r = await runOnce(f.deps, REQ);
  assert.equal(r.status, "halted");
  assert.equal(r.haltReason, "secret");
});

test("a query that dies without a result is a failed row with the error, not a silent one", async () => {
  const f = fakeDeps({ script: [] });
  const r = await runOnce(f.deps, REQ);
  assert.equal(r.status, "failed");
  assert.match(r.error!, /without a result/);
});

test("a result that flags is_error is a failed row even when its subtype says success", async () => {
  const f = fakeDeps({ script: [{ kind: "result", subtype: "success", cost: 0, turns: 1, text: "Failed to authenticate: OAuth session expired", isError: true }] });
  const r = await runOnce(f.deps, REQ);
  assert.equal(r.status, "failed");
  assert.equal(r.report, null);
  assert.match(r.error!, /Failed to authenticate/);
});

test("the prompt opens with the ledger block, so the run's memory is the ledger and nothing else", async () => {
  const first = fakeDeps();
  await runOnce(first.deps, REQ);
  assert.match(first.captured()!.prompt, /^## The ledger says\n\nNo runs before this one/);
  assert.match(first.captured()!.prompt, /The instrument \(garage_hits.*\n- 12 hits, last 7 days/);
  assert.match(first.captured()!.prompt, /\n---\n\nread and report$/);
  const prior: RunRow = {
    id: "c793e6ea-0000-0000-0000-000000000000",
    startedAt: "2026-10-13T06:49:00.000Z",
    finishedAt: null,
    machine: "air",
    hat: "report",
    rung: 0,
    ticket: null,
    prompt: "x",
    charterVersion: "0.1",
    charterHash: "0983781777b6",
    model: "m",
    status: "done",
    haltReason: null,
    costUsd: 0.17,
    turns: 16,
    toolCalls: 15,
    denials: 0,
    report: "the earlier report",
    error: null,
    commandId: null,
    branch: null,
    diffHash: null,
    verdict: null,
    prUrl: null,
  };
  const second = fakeDeps({ recent: [prior] });
  await runOnce(second.deps, REQ);
  assert.match(second.captured()!.prompt, /the earlier report/);
});

test("rung 1: the branch and the diff hash land on the row, and stragglers are committed by the harness", async () => {
  const H = "c".repeat(64);
  const f = fakeDeps({ dirty: true, diff: H, script: [{ kind: "result", subtype: "success", cost: 0.4, turns: 5, text: "**Gate comment.** did x" }] });
  const r = await runOnce(f.deps, { ...REQ, rung: 1, branch: "wrasse/feat/x" });
  assert.equal(r.status, "done");
  assert.equal(r.branch, "wrasse/feat/x");
  assert.equal(r.diffHash, H);
  assert.deepEqual(f.gitCalls, ["commitAll", "diffHash"]);
  const notes = f.book.events.filter((e) => e.kind === "note").map((e) => e.detail);
  assert.ok(notes.some((n) => /uncommitted work was committed/.test(n)));
  assert.ok(notes.some((n) => n === `at the gate: branch wrasse/feat/x, diff ${H.slice(0, 12)}`));
  assert.deepEqual(f.captured()!.options.tools, ["Read", "Glob", "Grep", "Write", "Edit", "MultiEdit", "NotebookEdit", "Bash"]);
});

test("rung 0 never touches git", async () => {
  const f = fakeDeps({ dirty: true, diff: "d".repeat(64) });
  const r = await runOnce(f.deps, REQ);
  assert.equal(r.branch, null);
  assert.equal(r.diffHash, null);
  assert.deepEqual(f.gitCalls, []);
});

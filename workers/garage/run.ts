/**
 * One run of wrasse, headless. Everything that touches the world comes in through `Deps`,
 * so the tests can hand it a notebook ledger and a scripted model and prove each guard
 * fires. The real wiring is in cli.ts.
 *
 * Order, and it cannot be skipped: read the charter and hash it (guard 7) → the HALT file
 * (guard 6) → the day budget (guard 2) → open the run row → hand the SDK the charter as the
 * system prompt, the allowlisted environment (guard 5), the rung's tools, the run cap, and
 * the hooks (guards 1, 3, 4, 5) → write the row whatever happened.
 */
import { join } from "node:path";
import type { HookCallback, HookInput, Options, SDKMessage, SDKResultMessage } from "@anthropic-ai/claude-agent-sdk";
import { charterHash, charterVersion } from "../../src/garage/core/charter.ts";
import { budgetBeforeLaunch } from "../../src/garage/core/budget.ts";
import { agentEnv, findSecretShapes } from "../../src/garage/core/secrets.ts";
import { decide, toolsForRung, type GuardContext, type Rung } from "../../src/garage/core/guard.ts";
import { ledgerMemory, outcomeOf, runPreamble, type HaltReason, type RunStatus } from "../../src/garage/core/run.ts";
import type { FinishRun, Ledger } from "../../src/garage/db/ledger.ts";

export const HALT_FILE = "src/garage/HALT";
export const CHARTER_FILE = "src/garage/CHARTER.md";

export type QueryFn = (params: { prompt: string; options: Options }) => AsyncIterable<SDKMessage>;

export type Deps = {
  now(): Date;
  machine: string;
  cwd: string;
  exists(path: string): boolean;
  readFile(path: string): string;
  env: Record<string, string | undefined>;
  ledger: Ledger;
  query: QueryFn;
  log(line: string): void;
  /** Rung 1 and up: commit what the run left dirty, then hash the branch's diff against main. */
  git: {
    commitAll(cwd: string, message: string): Promise<boolean>;
    diffHash(cwd: string): Promise<string | null>;
  };
};

export type RunRequest = {
  hat: string;
  prompt: string;
  rung: Rung;
  ticket: string | null;
  model: string;
  maxTurns: number;
  /** sha256 of the branch's diff, for the gate; null at rung 0 where nothing is written. */
  diffHash: string | null;
  /** The dashboard command this run answers, when it answers one. */
  commandId: number | null;
  /** The branch the run works on, rung 1 and up; null at rung 0. `deps.cwd` is its worktree. */
  branch: string | null;
};

export type RunResult = FinishRun & { id: string };

export async function runOnce(deps: Deps, req: RunRequest): Promise<RunResult> {
  const charterText = deps.readFile(join(deps.cwd, CHARTER_FILE));
  const base = {
    machine: deps.machine,
    hat: req.hat,
    rung: req.rung,
    ticket: req.ticket,
    prompt: req.prompt,
    charterVersion: charterVersion(charterText) ?? "unversioned",
    charterHash: charterHash(charterText),
    model: req.model,
    commandId: req.commandId,
  };

  // Guard 6: the halt file. One row, one event, and out.
  if (deps.exists(join(deps.cwd, HALT_FILE))) {
    const id = await deps.ledger.startRun(base);
    await deps.ledger.addEvent(id, "halt", null, `${HALT_FILE} present at launch`);
    return finish(deps, id, blank("halted", "halt-file"));
  }

  // Guard 2, the day half.
  const budget = budgetBeforeLaunch({ spentTodayUsd: await deps.ledger.spentTodayUsd() });
  if (!budget.ok) {
    const id = await deps.ledger.startRun(base);
    await deps.ledger.addEvent(id, "halt", null, budget.reason);
    return finish(deps, id, blank("halted", "day-budget"));
  }

  const memory = ledgerMemory(await deps.ledger.recentRuns(10), 6000, await deps.ledger.instrumentLines());
  const id = await deps.ledger.startRun(base);
  const ctx: GuardContext = { rung: req.rung, cwd: deps.cwd, approvedDiffHashes: await deps.ledger.approvedHashes(), diffHash: req.diffHash };
  const abort = new AbortController();
  let toolCalls = 0;
  let denials = 0;
  let secretHalt: string | null = null;

  const haltOnSecret = async (where: string, tool: string | null, text: string): Promise<boolean> => {
    const shapes = findSecretShapes(text);
    if (shapes.length === 0) return false;
    secretHalt = shapes.join(", ");
    await deps.ledger.addEvent(id, "halt", tool, `secret shape in ${where}: ${secretHalt}`);
    deps.log(`halt: secret shape in ${where} (${secretHalt})`);
    abort.abort();
    return true;
  };

  const pre: HookCallback = async (input: HookInput) => {
    if (input.hook_event_name !== "PreToolUse") return {};
    const v = decide({ tool: input.tool_name, input: asRecord(input.tool_input) }, ctx);
    if (v.allow) return {};
    denials++;
    await deps.ledger.addEvent(id, "deny", input.tool_name, `${v.guard}: ${v.reason}`);
    deps.log(`refused ${input.tool_name}: ${v.reason}`);
    return { hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: `guard ${v.guard}: ${v.reason}` } };
  };

  const post: HookCallback = async (input: HookInput) => {
    if (input.hook_event_name !== "PostToolUse") return {};
    toolCalls++;
    await deps.ledger.addEvent(id, "tool", input.tool_name, summarize(asRecord(input.tool_input)));
    deps.log(`${input.tool_name} ${summarize(asRecord(input.tool_input))}`);
    if (await haltOnSecret("tool output", input.tool_name, textOf(input.tool_response))) {
      return { continue: false, stopReason: "guard 5: a secret shape appeared in tool output; the run is halted" };
    }
    return {};
  };

  const tools = toolsForRung(req.rung);
  const options: Options = {
    cwd: deps.cwd,
    model: req.model,
    maxTurns: req.maxTurns,
    maxBudgetUsd: budget.capUsd,
    systemPrompt: {
      type: "custom",
      prompt:
        charterText +
        runPreamble({
          machine: deps.machine,
          rung: req.rung,
          hat: req.hat,
          ticket: req.ticket,
          date: deps.now().toISOString().slice(0, 16).replace("T", " ") + " UTC",
          capUsd: budget.capUsd,
          tools,
          maxTurns: req.maxTurns,
        }),
    },
    tools,
    allowedTools: tools,
    permissionMode: "dontAsk",
    settingSources: [],
    persistSession: false,
    env: agentEnv(deps.env),
    hooks: { PreToolUse: [{ hooks: [pre] }], PostToolUse: [{ hooks: [post] }] },
    abortController: abort,
  };

  let result: SDKResultMessage | null = null;
  let error: string | null = null;
  try {
    for await (const m of deps.query({ prompt: memory + "\n---\n\n" + req.prompt, options })) {
      if (m.type === "assistant") {
        for (const block of m.message.content) {
          if (block.type === "text" && (await haltOnSecret("the agent's own words", null, block.text))) break;
        }
      } else if (m.type === "result") {
        result = m;
      }
      if (abort.signal.aborted) break;
    }
  } catch (e) {
    if (!abort.signal.aborted) error = e instanceof Error ? e.message : String(e);
  }

  // Rung 1: whatever the run left on the branch is the proposal. Commit the stragglers as
  // wrasse, then hash the diff; the hash is what the founder rules on.
  let branch: string | null = null;
  let diffHash: string | null = null;
  if (req.rung >= 1 && req.branch) {
    branch = req.branch;
    if (await deps.git.commitAll(deps.cwd, `wrasse: work left at the gate (run ${id.slice(0, 8)})`)) {
      await deps.ledger.addEvent(id, "note", null, "uncommitted work was committed by the harness at the gate");
    }
    diffHash = await deps.git.diffHash(deps.cwd);
    await deps.ledger.addEvent(id, "note", null, diffHash ? `at the gate: branch ${branch}, diff ${diffHash.slice(0, 12)}` : `branch ${branch} has no diff against main`);
  }

  const cost = result ? result.total_cost_usd : 0;
  const turns = result ? result.num_turns : 0;
  let status: RunStatus;
  let haltReason: HaltReason | null = null;
  let report: string | null = null;
  if (secretHalt !== null) {
    status = "halted";
    haltReason = "secret";
  } else if (result) {
    const o = outcomeOf(result.subtype);
    if (o.status === "halted") {
      ({ status, haltReason } = o);
    } else if (result.is_error || o.status === "failed") {
      // A result that calls itself an error is one, whatever its subtype says (the auth failure
      // of the first ever run came back as subtype success, is_error true).
      status = "failed";
      error =
        [error, "errors" in result && Array.isArray(result.errors) ? result.errors.join("; ") : "", "result" in result ? result.result : ""]
          .filter((s) => typeof s === "string" && s.length > 0)
          .join(" · ") || "the result message flagged an error";
    } else {
      status = "done";
      report = result.subtype === "success" ? result.result : null;
    }
  } else {
    status = "failed";
    error = error ?? "the query ended without a result message";
  }
  return finish(deps, id, { status, haltReason, costUsd: cost, turns, toolCalls, denials, report, error, branch, diffHash });
}

async function finish(deps: Deps, id: string, f: FinishRun): Promise<RunResult> {
  await deps.ledger.finishRun(id, f);
  return { id, ...f };
}

function blank(status: RunStatus, haltReason: HaltReason | null): FinishRun {
  return { status, haltReason, costUsd: 0, turns: 0, toolCalls: 0, denials: 0, report: null, error: null };
}

function asRecord(v: unknown): Record<string, unknown> {
  return typeof v === "object" && v !== null ? (v as Record<string, unknown>) : {};
}

/** The one thing a tool call was about, for the event row. Paths and patterns, never contents. */
export function summarize(input: Record<string, unknown>): string {
  for (const k of ["file_path", "path", "notebook_path", "pattern", "command", "url"]) {
    const v = input[k];
    if (typeof v === "string" && v.length > 0) return `${k}=${v.length > 160 ? v.slice(0, 157) + "..." : v}`;
  }
  return "";
}

function textOf(v: unknown): string {
  if (typeof v === "string") return v;
  try {
    return JSON.stringify(v) ?? "";
  } catch {
    return "";
  }
}

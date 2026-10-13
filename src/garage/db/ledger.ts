/**
 * The ledger's verbs. Every one is a single statement over Neon's HTTP driver. The harness
 * calls these through the `Ledger` interface so the tests can hand it a notebook instead.
 */
import { sql } from "./client.ts";
import type { HaltReason, RunRow, RunStatus } from "../core/run.ts";
import type { Rung } from "../core/guard.ts";

export type StartRun = {
  machine: string;
  hat: string;
  rung: Rung;
  ticket: string | null;
  prompt: string;
  charterVersion: string;
  charterHash: string;
  model: string;
  commandId: number | null;
};

export type FinishRun = {
  status: RunStatus;
  haltReason: HaltReason | null;
  costUsd: number;
  turns: number;
  toolCalls: number;
  denials: number;
  report: string | null;
  error: string | null;
  branch?: string | null;
  diffHash?: string | null;
};

export type EventKind = "tool" | "deny" | "halt" | "note";

/** What the harness needs from a ledger. The real one is below; the tests keep theirs in memory. */
export type Ledger = {
  startRun(r: StartRun): Promise<string>;
  finishRun(id: string, f: FinishRun): Promise<void>;
  addEvent(runId: string, kind: EventKind, tool: string | null, detail: string): Promise<void>;
  spentTodayUsd(): Promise<number>;
  approvedHashes(): Promise<Set<string>>;
  /** The newest rows first, for the run's memory block. */
  recentRuns(limit: number): Promise<RunRow[]>;
};

type Row = {
  id: string;
  started_at: string;
  finished_at: string | null;
  machine: string;
  hat: string;
  rung: number;
  ticket: string | null;
  prompt: string;
  charter_version: string;
  charter_hash: string;
  model: string | null;
  status: string;
  halt_reason: string | null;
  cost_usd: string | number;
  turns: number;
  tool_calls: number;
  denials: number;
  report: string | null;
  error: string | null;
  command_id: number | string | null;
  branch: string | null;
  diff_hash: string | null;
  verdict: string | null;
};

function fromRow(r: Row): RunRow {
  return {
    id: r.id,
    startedAt: new Date(r.started_at).toISOString(),
    finishedAt: r.finished_at ? new Date(r.finished_at).toISOString() : null,
    machine: r.machine,
    hat: r.hat,
    rung: r.rung as Rung,
    ticket: r.ticket,
    prompt: r.prompt,
    charterVersion: r.charter_version,
    charterHash: r.charter_hash,
    model: r.model,
    status: r.status as RunStatus,
    haltReason: r.halt_reason as HaltReason | null,
    costUsd: Number(r.cost_usd),
    turns: r.turns,
    toolCalls: r.tool_calls,
    denials: r.denials,
    report: r.report,
    error: r.error,
    commandId: r.command_id === null ? null : Number(r.command_id),
    branch: r.branch,
    diffHash: r.diff_hash,
    verdict: r.verdict as RunRow["verdict"],
  };
}

export const neonLedger: Ledger = {
  async startRun(r) {
    const rows = (await sql()`
      INSERT INTO garage_runs (machine, hat, rung, ticket, prompt, charter_version, charter_hash, model, command_id)
      VALUES (${r.machine}, ${r.hat}, ${r.rung}, ${r.ticket}, ${r.prompt}, ${r.charterVersion}, ${r.charterHash}, ${r.model}, ${r.commandId})
      RETURNING id`) as { id: string }[];
    return rows[0].id;
  },
  async finishRun(id, f) {
    await sql()`
      UPDATE garage_runs SET finished_at = now(), status = ${f.status}, halt_reason = ${f.haltReason}, cost_usd = ${f.costUsd},
        turns = ${f.turns}, tool_calls = ${f.toolCalls}, denials = ${f.denials}, report = ${f.report}, error = ${f.error},
        branch = ${f.branch ?? null}, diff_hash = ${f.diffHash ?? null}
      WHERE id = ${id}`;
  },
  async addEvent(runId, kind, tool, detail) {
    await sql()`INSERT INTO garage_events (run_id, kind, tool, detail) VALUES (${runId}, ${kind}, ${tool}, ${detail})`;
  },
  async spentTodayUsd() {
    const rows = (await sql()`SELECT coalesce(sum(cost_usd), 0) AS usd FROM garage_runs WHERE started_at >= date_trunc('day', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC'`) as { usd: string | number }[];
    return Number(rows[0]?.usd ?? 0);
  },
  async approvedHashes() {
    const rows = (await sql()`SELECT diff_hash FROM garage_approvals`) as { diff_hash: string }[];
    return new Set(rows.map((r) => r.diff_hash));
  },
  async recentRuns(limit) {
    return listRuns(limit);
  },
};

export async function listRuns(limit = 20): Promise<RunRow[]> {
  const rows = (await sql()`SELECT * FROM garage_runs ORDER BY started_at DESC LIMIT ${limit}`) as Row[];
  return rows.map(fromRow);
}

/** By full id or the first 8 characters of one. */
export async function getRun(idOrPrefix: string): Promise<RunRow | null> {
  const rows = (await sql()`SELECT * FROM garage_runs WHERE id::text LIKE ${idOrPrefix + "%"} ORDER BY started_at DESC LIMIT 1`) as Row[];
  return rows[0] ? fromRow(rows[0]) : null;
}

export type EventRow = { id: number; at: string; kind: EventKind; tool: string | null; detail: string };

export async function listEvents(runId: string): Promise<EventRow[]> {
  const rows = (await sql()`SELECT id, at, kind, tool, detail FROM garage_events WHERE run_id = ${runId} ORDER BY id`) as EventRow[];
  return rows.map((r) => ({ ...r, at: new Date(r.at).toISOString() }));
}

export async function approve(diffHash: string, by: string, note: string | null, runId: string | null): Promise<void> {
  await sql()`INSERT INTO garage_approvals (diff_hash, approved_by, note, run_id) VALUES (${diffHash}, ${by}, ${note}, ${runId}) ON CONFLICT (diff_hash) DO NOTHING`;
}

export async function migrate(files: { name: string; text: string }[]): Promise<string[]> {
  const applied: string[] = [];
  await sql()`CREATE TABLE IF NOT EXISTS garage_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())`;
  const done = new Set(((await sql()`SELECT name FROM garage_migrations`) as { name: string }[]).map((r) => r.name));
  for (const f of files.sort((a, b) => a.name.localeCompare(b.name))) {
    if (done.has(f.name)) continue;
    for (const statement of splitStatements(f.text)) {
      await sql()(statement);
    }
    await sql()`INSERT INTO garage_migrations (name) VALUES (${f.name})`;
    applied.push(f.name);
  }
  return applied;
}

/** Strip `--` comments, split on semicolons. Our migrations keep both out of string literals. */
export function splitStatements(text: string): string[] {
  const stripped = text
    .split("\n")
    .map((l) => l.replace(/--.*$/, ""))
    .join("\n");
  return stripped
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/** Runs that wrote a diff and have not been ruled on: the founder's queue. */
export async function gateQueue(): Promise<RunRow[]> {
  const rows = (await sql()`SELECT * FROM garage_runs WHERE diff_hash IS NOT NULL AND verdict IS NULL ORDER BY started_at DESC`) as Row[];
  return rows.map(fromRow);
}

/** The founder's ruling on a run's diff. Approve writes the approval row the gate reads. */
export async function rule(runId: string, verdict: "approved" | "denied", by: string, note: string | null): Promise<RunRow | null> {
  const r = await getRun(runId);
  if (!r) return null;
  if (verdict === "approved" && r.diffHash) await approve(r.diffHash, by, note, r.id);
  await sql()`UPDATE garage_runs SET verdict = ${verdict} WHERE id = ${r.id}`;
  await sql()`INSERT INTO garage_events (run_id, kind, tool, detail) VALUES (${r.id}, 'note', null, ${`${verdict} by ${by}${note ? ": " + note : ""}`})`;
  return { ...r, verdict };
}

export type CommandStatus = "queued" | "running" | "done" | "failed" | "cancelled";

export type CommandRow = {
  id: number;
  createdAt: string;
  createdBy: string;
  hat: string;
  prompt: string | null;
  ticket: string | null;
  status: CommandStatus;
  pickedBy: string | null;
  pickedAt: string | null;
  finishedAt: string | null;
  runId: string | null;
};

type CmdRow = {
  id: number | string;
  created_at: string;
  created_by: string;
  hat: string;
  prompt: string | null;
  ticket: string | null;
  status: string;
  picked_by: string | null;
  picked_at: string | null;
  finished_at: string | null;
  run_id: string | null;
};

function fromCmd(c: CmdRow): CommandRow {
  return {
    id: Number(c.id),
    createdAt: new Date(c.created_at).toISOString(),
    createdBy: c.created_by,
    hat: c.hat,
    prompt: c.prompt,
    ticket: c.ticket,
    status: c.status as CommandStatus,
    pickedBy: c.picked_by,
    pickedAt: c.picked_at ? new Date(c.picked_at).toISOString() : null,
    finishedAt: c.finished_at ? new Date(c.finished_at).toISOString() : null,
    runId: c.run_id,
  };
}

export async function enqueueCommand(c: { hat: string; prompt: string | null; ticket: string | null; by: string }): Promise<CommandRow> {
  const rows = (await sql()`INSERT INTO garage_commands (created_by, hat, prompt, ticket) VALUES (${c.by}, ${c.hat}, ${c.prompt}, ${c.ticket}) RETURNING *`) as CmdRow[];
  return fromCmd(rows[0]);
}

/** One statement: the oldest queued command becomes this host's, or null when the queue is empty. */
export async function claimCommand(host: string): Promise<CommandRow | null> {
  const rows = (await sql()`
    UPDATE garage_commands SET status = 'running', picked_by = ${host}, picked_at = now()
    WHERE id = (SELECT id FROM garage_commands WHERE status = 'queued' ORDER BY id LIMIT 1 FOR UPDATE SKIP LOCKED)
    RETURNING *`) as CmdRow[];
  return rows[0] ? fromCmd(rows[0]) : null;
}

export async function finishCommand(id: number, status: "done" | "failed", runId: string | null): Promise<void> {
  await sql()`UPDATE garage_commands SET status = ${status}, finished_at = now(), run_id = ${runId} WHERE id = ${id}`;
}

export async function cancelCommand(id: number): Promise<boolean> {
  const rows = (await sql()`UPDATE garage_commands SET status = 'cancelled', finished_at = now() WHERE id = ${id} AND status = 'queued' RETURNING id`) as { id: number }[];
  return rows.length > 0;
}

export async function listCommands(limit = 20): Promise<CommandRow[]> {
  const rows = (await sql()`SELECT * FROM garage_commands ORDER BY id DESC LIMIT ${limit}`) as CmdRow[];
  return rows.map(fromCmd);
}

export async function queuedCount(): Promise<number> {
  const rows = (await sql()`SELECT count(*)::int AS n FROM garage_commands WHERE status = 'queued'`) as { n: number }[];
  return rows[0]?.n ?? 0;
}

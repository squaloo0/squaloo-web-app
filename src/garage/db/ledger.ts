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
};

export type EventKind = "tool" | "deny" | "halt" | "note";

/** What the harness needs from a ledger. The real one is below; the tests keep theirs in memory. */
export type Ledger = {
  startRun(r: StartRun): Promise<string>;
  finishRun(id: string, f: FinishRun): Promise<void>;
  addEvent(runId: string, kind: EventKind, tool: string | null, detail: string): Promise<void>;
  spentTodayUsd(): Promise<number>;
  approvedHashes(): Promise<Set<string>>;
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
  };
}

export const neonLedger: Ledger = {
  async startRun(r) {
    const rows = (await sql()`
      INSERT INTO garage_runs (machine, hat, rung, ticket, prompt, charter_version, charter_hash, model)
      VALUES (${r.machine}, ${r.hat}, ${r.rung}, ${r.ticket}, ${r.prompt}, ${r.charterVersion}, ${r.charterHash}, ${r.model})
      RETURNING id`) as { id: string }[];
    return rows[0].id;
  },
  async finishRun(id, f) {
    await sql()`
      UPDATE garage_runs SET finished_at = now(), status = ${f.status}, halt_reason = ${f.haltReason}, cost_usd = ${f.costUsd},
        turns = ${f.turns}, tool_calls = ${f.toolCalls}, denials = ${f.denials}, report = ${f.report}, error = ${f.error}
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

/**
 * The run row as the ledger sees it, and how a query's ending maps onto it. Pure.
 */
import type { Rung } from "./guard.ts";
import { prettyUsd } from "./budget.ts";

export type RunStatus = "running" | "done" | "halted" | "failed";
export type HaltReason = "halt-file" | "day-budget" | "budget" | "turns" | "secret";

export type RunRow = {
  id: string;
  startedAt: string;
  finishedAt: string | null;
  machine: string;
  hat: string;
  rung: Rung;
  ticket: string | null;
  prompt: string;
  charterVersion: string;
  charterHash: string;
  model: string | null;
  status: RunStatus;
  haltReason: HaltReason | null;
  costUsd: number;
  turns: number;
  toolCalls: number;
  denials: number;
  report: string | null;
  error: string | null;
};

export type Outcome = { status: RunStatus; haltReason: HaltReason | null };

/** How the SDK's result subtype lands in the ledger. */
export function outcomeOf(subtype: string): Outcome {
  switch (subtype) {
    case "success":
      return { status: "done", haltReason: null };
    case "error_max_budget_usd":
      return { status: "halted", haltReason: "budget" };
    case "error_max_turns":
      return { status: "halted", haltReason: "turns" };
    default:
      return { status: "failed", haltReason: null };
  }
}

export function shortId(id: string): string {
  return id.slice(0, 8);
}

/** "3f2a9c1e · 2026-10-13 06:10Z · air · report · rung 0 · done · $0.41 · 7 turns · 12 tools · 1 refused · charter 0.1 e3b0c442" */
export function runLine(r: RunRow): string {
  const state = r.status === "halted" ? `halted: ${r.haltReason}` : r.status;
  return [
    shortId(r.id),
    r.startedAt.replace("T", " ").slice(0, 16) + "Z",
    r.machine,
    r.hat + (r.ticket ? ` ${r.ticket}` : ""),
    `rung ${r.rung}`,
    state,
    prettyUsd(r.costUsd),
    `${r.turns} turn${r.turns === 1 ? "" : "s"}`,
    `${r.toolCalls} tool${r.toolCalls === 1 ? "" : "s"}`,
    `${r.denials} refused`,
    `charter ${r.charterVersion} ${r.charterHash.slice(0, 8)}`,
  ].join(" · ");
}

/**
 * The block appended to the charter for this run: the facts the agent needs about the run
 * it is in, so it never has to guess them (check, don't remember).
 */
export function runPreamble(p: { machine: string; rung: Rung; hat: string; ticket: string | null; date: string; capUsd: number; tools: string[]; maxTurns: number }): string {
  return [
    "",
    "---",
    "",
    "## This run",
    "",
    `- Machine: ${p.machine}. Date: ${p.date}.`,
    `- Rung: ${p.rung}. Hat: ${p.hat}.${p.ticket ? ` Ticket: ${p.ticket}.` : " No ticket; the standing objective applies."}`,
    `- Tools you have: ${p.tools.join(", ")}. Every call is judged by the guards; a refusal is recorded, not punished.`,
    `- Budget for this run: ${prettyUsd(p.capUsd)}. Turns: at most ${p.maxTurns}. The harness stops you at either; stop yourself first.`,
    "- Your final message is the report. It is stored verbatim in the ledger, so write it for the founder: findings first, tagged [sourced] with a path, or [hypothesis]. Name the one thing you would ask.",
    "- You have no memory of earlier runs except what the prompt gives you. Do not claim to remember.",
    "",
  ].join("\n");
}

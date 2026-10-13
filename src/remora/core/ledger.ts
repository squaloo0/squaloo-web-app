/**
 * The local ledger: one line per vend, append-only, JSON Lines. Phase 3 moves this to
 * Neon; the row shape is the thing that travels. Pure.
 */
import type { Receipt } from "./receipt.ts";
import type { Provider } from "./url.ts";
import { prettyBytes } from "./pretty.ts";

export type LedgerRow = {
  vendedAt: string;
  slot: "VIDEO" | "AUDIO" | "CLIP";
  provider: Provider;
  id: string | null;
  title: string;
  bytes: number;
  sha256: string;
  quality: string;
  /** Basename of the file; the receipt sits next to it. */
  file: string;
  /** Wall-clock seconds from URL to receipt. */
  seconds: number;
};

export function ledgerRow(r: Receipt, seconds: number): LedgerRow {
  return {
    vendedAt: r.receipt.vendedAt,
    slot: r.receipt.slot,
    provider: r.source.provider,
    id: r.source.id,
    title: r.video.title,
    bytes: r.file.bytes,
    sha256: r.file.sha256,
    quality: r.file.quality,
    file: r.file.name,
    seconds: Math.round(seconds * 10) / 10,
  };
}

export function ledgerLine(row: LedgerRow): string {
  return JSON.stringify(row) + "\n";
}

/** One line of the file → a row, or null for blanks and lines that are not ours. */
export function parseLedgerLine(line: string): LedgerRow | null {
  const s = line.trim();
  if (!s) return null;
  let v: unknown;
  try {
    v = JSON.parse(s);
  } catch {
    return null;
  }
  if (typeof v !== "object" || v === null) return null;
  const r = v as LedgerRow;
  if (typeof r.vendedAt !== "string" || typeof r.title !== "string" || typeof r.bytes !== "number" || typeof r.sha256 !== "string") return null;
  return r;
}

/** "3 vends · 27.1 MB · 2 providers · last 2026-10-10 21:04 UTC" */
export function scoreboard(rows: LedgerRow[]): string {
  if (rows.length === 0) return "0 vends · the machine is waiting";
  const bytes = rows.reduce((n, r) => n + r.bytes, 0);
  const providers = new Set(rows.map((r) => r.provider)).size;
  const last = rows.map((r) => r.vendedAt).sort().at(-1)!;
  const seconds = rows.reduce((n, r) => n + r.seconds, 0);
  return [
    `${rows.length} vend${rows.length === 1 ? "" : "s"}`,
    prettyBytes(bytes),
    `${providers} provider${providers === 1 ? "" : "s"}`,
    `${Math.round(seconds)}s of machine time`,
    `last ${last.replace("T", " ").slice(0, 16)} UTC`,
  ].join(" · ");
}

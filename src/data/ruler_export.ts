/**
 * The ruler export, as /measured reads it. Gate E workstreams 2 + 8; SQU-376.
 *
 * SOURCE: `public/ruler/ruler_export.jsonl`, the file the engine repo's
 * `scripts/ruler_export/export.py` writes (format ruler-export/v0), committed
 * here unchanged. It is read at BUILD time and served as-is for download, so
 * what the page renders and what a reader downloads are the same file. Never a
 * live query from this host into a body's database.
 *
 * VALIDATION: the contract checks (states, provenance, references, chain
 * linkage) run when the export is written, in the engine repo
 * (`scripts/ruler_export/validate.py`), next to the contract. Here
 * `parseExport` re-checks structure and chain links, and throws on a mismatch,
 * so a hand-edited or truncated file stops the build rather than rendering.
 *
 * TODAY: no export file exists yet (the nightly writer, SQU-374, has not
 * landed), so `loadSnapshot` returns null and every data section shows its
 * empty state. No example figures are rendered, because a figure with no row
 * behind it is the thing this page exists to refuse.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const EXPORT_FORMAT = "ruler-export/v0";
/** Where the export is served for download, and read from at build. */
export const EXPORT_PUBLIC_PATH = "/ruler/ruler_export.jsonl";

/** Per scored execution (contract: trace_schema.verdict_states). */
export type RulerState =
  | "PASS"
  | "WARN_LATENCY"
  | "FAIL"
  | "COULD_NOT_CHECK"
  | "NOT_THERE"
  | "CONFLICT_OVERRULED"
  | "PARTIAL_PASS"
  | "SAFETY_INTERCEPT";

/** Per artifact (a run's demo gate). A different grain; never compared with RulerState. */
export type DemoGate = "GO" | "NO-GO" | "N/A";

/** Per comparison. A third grain; never compared with either of the others. */
export type Regression = "CLEAN" | "CHANGED" | "NO-BASELINE" | "INCOMPARABLE";

export type RulerRule = {
  rule_id: string;
  contract_version: string;
  component: string;
  severity_tier: string;
  body_scope: string | null;
  emits: string[];
};

export type RulerRun = {
  run_uuid: string;
  authoring_body: string;
  consumer: string; // nightly | answer_path
  mode: string;
  demo_gate: DemoGate | null;
  engine_commit: string;
  contract_version: string;
  scorer_version: string;
  corpus_digest: string;
  corpus_license_class: string;
  prompt_variant: string;
  started_at: string;
};

export type RulerVerdict = {
  verdict_uuid: string;
  authoring_body: string;
  body_local_seq: number;
  run_uuid: string;
  query_id: string;
  scenario_id: string | null;
  perturbation_level: string | null;
  order_inversion: boolean | null;
  k: number;
  run_index: number;
  model_id: string;
  quant: string;
  seed_used: number | null;
  state: RulerState;
  axis_vector: Record<string, unknown>;
  severity_tier: string;
  rule_id: string | null;
  contract_version: string;
  scorer_version: string;
  supersedes: string | null;
  supersede_reason: string | null;
  latency_ms: number;
  wcet_budget_ms: number | null;
  prev_row_hash: string | null;
  row_hash: string;
  created_at: string;
};

export type RulerComparison = {
  comparison_uuid: string;
  authoring_body: string;
  subject_run_uuid: string;
  baseline_run_uuid: string | null;
  regression: Regression;
  pool_id: string;
  pool_eligibility_rule: string;
  pool_size: number;
  no_baseline_cause: string | null;
  scorer_version: string;
  created_at: string;
};

/** A store-only row under the `withhold` policy: its chain position, not its content. */
export type WithheldRow = {
  authoring_body: string;
  body_local_seq: number;
  verdict_uuid: string;
  prev_row_hash: string | null;
  row_hash: string;
};

export type RulerManifest = {
  format: string;
  exported_at: string;
  contract_versions: string[];
  contract_status?: string;
  store_only_policy: "withhold" | "include";
  /** The contract's rendered_nov14:false states, as declared by the export. */
  store_only_states: RulerState[];
  source: { authoring_body: string | null };
  counts: { rule: number; run: number; verdict: number; comparison: number; withheld: number };
  withheld: WithheldRow[];
};

export type RulerSnapshot = {
  manifest: RulerManifest;
  /** sha256 of the export file's bytes, computed here at build. */
  export_sha256: string;
  rules: RulerRule[];
  runs: RulerRun[];
  verdicts: RulerVerdict[];
  comparisons: RulerComparison[];
};

export class ExportFormatError extends Error {}

const KINDS = ["rule", "run", "verdict", "comparison"] as const;
type Kind = (typeof KINDS)[number];

/** Parse and structurally re-check an export's text. Throws ExportFormatError. */
export function parseExport(text: string): RulerSnapshot {
  const sha = createHash("sha256").update(text, "utf8").digest("hex");
  const lines = text.split("\n").filter((l) => l.trim() !== "");
  let rows: Record<string, unknown>[];
  try {
    rows = lines.map((l) => JSON.parse(l));
  } catch {
    throw new ExportFormatError("the export is not valid JSONL");
  }
  const m = rows[0] as unknown as (RulerManifest & { kind?: string }) | undefined;
  if (!m || m.kind !== "manifest") throw new ExportFormatError("the first line must be the manifest");
  if (m.format !== EXPORT_FORMAT) throw new ExportFormatError(`format must be ${EXPORT_FORMAT}`);
  if (m.store_only_policy !== "withhold" && m.store_only_policy !== "include") {
    throw new ExportFormatError("unknown store_only_policy");
  }
  if (!Array.isArray(m.store_only_states)) {
    throw new ExportFormatError("the manifest must declare store_only_states (from the contract)");
  }
  const by: Record<Kind, Record<string, unknown>[]> = { rule: [], run: [], verdict: [], comparison: [] };
  for (const r of rows.slice(1)) {
    const k = r.kind as Kind;
    if (!KINDS.includes(k)) throw new ExportFormatError("unknown row kind");
    by[k].push(r);
  }
  for (const k of KINDS) {
    if (m.counts?.[k] !== by[k].length) throw new ExportFormatError(`counts.${k} does not match the file`);
  }
  if (m.counts?.withheld !== (m.withheld ?? []).length) {
    throw new ExportFormatError("counts.withheld does not match the withheld list");
  }
  const snap: RulerSnapshot = {
    manifest: m,
    export_sha256: sha,
    rules: by.rule as unknown as RulerRule[],
    runs: by.run as unknown as RulerRun[],
    verdicts: by.verdict as unknown as RulerVerdict[],
    comparisons: by.comparison as unknown as RulerComparison[],
  };
  const broken = chainLinks(snap).filter((c) => c.broken > 0);
  if (broken.length) {
    throw new ExportFormatError(`hash chain broken for ${broken.map((b) => b.body).join(", ")}`);
  }
  return snap;
}

export type ChainCheck = { body: string; links: number; broken: number };

/**
 * Per-body chain LINKAGE over exported and withheld rows together, in
 * body_local_seq order: every row's prev_row_hash must equal its predecessor's
 * row_hash, and the first row has none. This shows whether a row was removed,
 * reordered or had its hash rewritten after it was written. It shows nothing
 * about whether any verdict is correct (contract: proves tamper_evidence,
 * does_not_prove correctness).
 */
export function chainLinks(s: Pick<RulerSnapshot, "verdicts" | "manifest">): ChainCheck[] {
  type Link = { authoring_body: string; body_local_seq: number; prev_row_hash: string | null; row_hash: string };
  const byBody = new Map<string, Link[]>();
  const all: Link[] = [...s.verdicts, ...(s.manifest.withheld ?? [])];
  for (const r of all) {
    byBody.set(r.authoring_body, [...(byBody.get(r.authoring_body) ?? []), r]);
  }
  return [...byBody.entries()].map(([body, rows]) => {
    rows.sort((a, b) => a.body_local_seq - b.body_local_seq);
    let broken = rows[0].prev_row_hash === null ? 0 : 1;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i].body_local_seq === rows[i - 1].body_local_seq) broken++;
      if (rows[i].prev_row_hash !== rows[i - 1].row_hash) broken++;
    }
    return { body, links: rows.length, broken };
  });
}

/** The committed export, or null when there is none yet. Build time only. */
export function loadSnapshot(root: string = process.cwd()): RulerSnapshot | null {
  const file = join(root, "public", EXPORT_PUBLIC_PATH);
  if (!existsSync(file)) return null;
  return parseExport(readFileSync(file, "utf8"));
}

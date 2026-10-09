/**
 * The ruler export, as /measured will read it. Gate E workstream 2 + 8.
 *
 * SHAPE: mirrors the ruler contract v0 and its DDL in the engine repo
 * (`contracts/ruler_contract_v0.yaml`, `environments/edge_init/05-ruler-schema.sql`).
 * Field names are the column names, so a JSONL export row drops in unchanged.
 *
 * SOURCE: a COMMITTED snapshot of the export, written into this repo by a
 * generator (the gen_ledger.py pattern), never a live query from this host into
 * a body's database. The zero-cloud runtime and the A7 topology stay untouched,
 * and every figure the page shows can be re-derived from a committed file.
 *
 * TODAY: `snapshot` is null. The nightly writer does not exist yet, and the
 * page renders its empty state rather than any example numbers: a figure with
 * no row behind it is the thing this page exists to refuse.
 */

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

/** Per comparison. A different grain from RulerState; never compared with it. */
export type Regression = "CLEAN" | "CHANGED" | "NO-BASELINE" | "INCOMPARABLE";

export type RulerRun = {
  run_uuid: string;
  authoring_body: string;
  consumer: string; // nightly | answer_path
  mode: string;
  demo_gate: string | null; // per artifact: GO | NO-GO | N/A
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
  run_uuid: string;
  query_id: string;
  scenario_id: string | null;
  perturbation_level: string | null;
  order_inversion: boolean | null;
  k: number;
  run_index: number;
  model_id: string;
  quant: string;
  state: RulerState;
  axis_vector: Record<string, string>;
  severity_tier: string;
  rule_id: string | null;
  contract_version: string;
  scorer_version: string;
  supersedes: string | null;
  supersede_reason: string | null;
  latency_ms: number;
  wcet_budget_ms: number | null;
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

export type RulerRule = {
  rule_id: string;
  component: string;
  severity_tier: string;
  body_scope: string | null;
  emits: string | string[];
};

export type RulerSnapshot = {
  manifest: {
    exported_at: string;
    /** sha256 of the export file this snapshot was generated from. */
    export_sha256: string;
    contract_version: string;
    contract_status: string; // e.g. DRAFT_PENDING_RATIFICATION until A9
  };
  rules: RulerRule[];
  runs: RulerRun[];
  verdicts: RulerVerdict[];
  comparisons: RulerComparison[];
};

export const snapshot: RulerSnapshot | null = null;

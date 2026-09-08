/**
 * Measured — eval artifact data for /measured.
 *
 * SOURCE OF TRUTH: dated artifacts in the engine repo at `evals/results/<UTC>.json`,
 * produced by `scripts/run_production_eval.sh`. The numbers below were derived
 * programmatically from that JSON and reproduce the harness's own published
 * summary table exactly.
 *
 * To add a run: append a new `EvalRun` to `evalRuns` (newest first). Do not
 * edit numbers by hand — re-derive them from the artifact.
 */

export type QueryRow = {
  id: string;
  label: string;
  n: number;
  refusalHonesty: number;
  /** null where the metric does not apply (a query expected to refuse). */
  citationCompliance: number | null;
  manualRecall: number | null;
  logRecall: number | null;
  correctness: number;
  avgLatencyMs: number;
};

export const queryRows: QueryRow[] = [
  { id: "act3-e207-primary", label: "E-207 drive fault — the demo query", n: 3, refusalHonesty: 67, citationCompliance: 100, manualRecall: 100, logRecall: 100, correctness: 0, avgLatencyMs: 17439 },
  { id: "e101-belt-slip", label: "E-101 belt slip", n: 3, refusalHonesty: 100, citationCompliance: 100, manualRecall: 0, logRecall: 100, correctness: 100, avgLatencyMs: 14951 },
  { id: "e150-overtemp", label: "E-150 over-temperature", n: 3, refusalHonesty: 100, citationCompliance: 0, manualRecall: 100, logRecall: 100, correctness: 0, avgLatencyMs: 12103 },
  { id: "e180-tension-sensor", label: "E-180 tension sensor", n: 3, refusalHonesty: 100, citationCompliance: 100, manualRecall: 0, logRecall: 100, correctness: 0, avgLatencyMs: 15382 },
  { id: "e310-estop", label: "E-310 emergency stop", n: 3, refusalHonesty: 100, citationCompliance: 100, manualRecall: 0, logRecall: 100, correctness: 100, avgLatencyMs: 19496 },
  { id: "lockout-direct", label: "Lockout procedure, asked directly", n: 3, refusalHonesty: 100, citationCompliance: 100, manualRecall: 100, logRecall: 100, correctness: 100, avgLatencyMs: 15611 },
  { id: "off-corpus-refusal", label: "Off-corpus question (should refuse)", n: 3, refusalHonesty: 100, citationCompliance: null, manualRecall: null, logRecall: null, correctness: 100, avgLatencyMs: 11300 },
];

export const latency = {
  overallMeanMs: 15183,
  coldFirstRunMeanMs: 29814,
  coldFirstRunN: 7,
  warmMeanMs: 7867,
  warmMedianMs: 7457,
  warmN: 14,
  warmGeneratedMedianMs: 7556,
  warmGeneratedN: 11,
  fastestRefusalMs: 1104,
  slowestMs: 38732,
};

export const overall = {
  totalRuns: 21,
  citationCompliance: 82,
  fullRecall: 50,
  correctness: 57,
};

export const run = {
  /** UTC timestamp recorded in the artifact. */
  timestamp: "2026-09-05T03:55:36Z",
  date: "September 5, 2026",
  artifact: "evals/results/20260905T035536Z.json",
  model: "Phi-3 Mini 3.8B Instruct, GGUF Q4_K_M",
  k: 3,
  runsPerQuery: 3,
  /** The engine code path, not a hardware label. See `bodyKnown`. */
  device: "edge",
  /**
   * The artifact schema does not record which physical machine the run
   * executed on, so this page cannot break results out per body yet.
   * Tracked for the harness owner as a schema gap.
   */
  bodyKnown: false,
};

export type Gap = {
  title: string;
  measured: string;
  what: string;
  ticket: string;
};

/** Failing or incomplete results, each with the ticket that owns the fix. */
export const gaps: Gap[] = [
  {
    title: "Conflict precedence",
    measured: "0% correctness, 3 of 3 runs",
    what:
      "When the veteran's log contradicts the manual, the log's fix should lead the answer. It does not. Retrieval found both sources every time — 100% manual recall, 100% log recall — but the answer put a wrong six-hour replacement procedure first and buried the veteran's shim fix at steps 6 and 7. No precedence logic exists in the engine yet.",
    ticket: "SQU-166",
  },
  {
    title: "Refusal honesty on the primary query",
    measured: "67% — 1 refusal in 3 runs",
    what:
      "One run answered \"I don't have documentation for that\" while holding perfect retrieval for the question. Refusing when you can answer is as dishonest as answering when you cannot. Every other query refused correctly 100% of the time.",
    ticket: "SQU-167",
  },
  {
    title: "Inline citation compliance",
    measured: "82% across 21 runs",
    what:
      "Every answer ships with engine-derived sources — that part is architectural and cannot fail. This metric is narrower: whether the model placed the tags inline, next to the step they support. On E-150 it did so 0% of the time. The known degradation at wider retrieval was fixed (SQU-135, landed); this residual at k=3 has no dedicated ticket yet and is tracked by the harness.",
    ticket: "no open ticket",
  },
  {
    title: "Full retrieval recall",
    measured: "50% at k=3",
    what:
      "Both the manual section and the veteran's log surfaced together in half the runs. Log recall was 100%; the manual is what dropped. A k=5 A/B is queued to test whether widening retrieval fixes it without costing compliance or latency.",
    ticket: "SQU-168",
  },
  {
    title: "Results are not broken out per machine",
    measured: "not recorded",
    what:
      "The artifact records the engine code path but not the physical body it ran on, so this page cannot yet separate results by machine. Adding a host field to the harness output is a schema change owned by the engine seat.",
    ticket: "SQU-177",
  },
];

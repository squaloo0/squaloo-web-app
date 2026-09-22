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
  /**
   * Who owns the fix, in plain language.
   *
   * NOT a tracker identifier. Our tracker is private, so an ID here is a
   * reference the reader cannot follow — decoration that also leaks internals.
   * `/roadmap` has held this bar since it shipped; this page did not, and
   * published five of them live before anyone read it as an outsider would.
   */
  owner: string;
};

/** Failing or incomplete results, each with the team that owns the fix. */
export const gaps: Gap[] = [
  {
    title: "Conflict precedence",
    measured: "0% correctness, 3 of 3 runs",
    what:
      "When the veteran's log contradicts the manual, the log's fix should lead the answer. It does not. Retrieval found both sources every time — 100% manual recall, 100% log recall — but the answer put a wrong six-hour replacement procedure first and buried the veteran's shim fix at steps 6 and 7. No precedence logic exists in the engine yet.",
    owner: "owned — engine team",
  },
  {
    title: "Refusal honesty on the primary query",
    measured: "67% — 1 refusal in 3 runs",
    what:
      "One run answered \"I don't have documentation for that\" while holding perfect retrieval for the question. Refusing when you can answer is as dishonest as answering when you cannot. Every other query refused correctly 100% of the time.",
    owner: "owned — engine team",
  },
  {
    title: "Inline citation compliance",
    measured: "82% across 21 runs",
    what:
      "Every answer ships with engine-derived sources — that part is architectural and cannot fail. This metric is narrower: whether the model placed the tags inline, next to the step they support. On E-150 it did so 0% of the time. The known degradation at wider retrieval was fixed and shipped; this residual at k=3 has no dedicated ticket yet and is tracked by the harness.",
    owner: "no owner yet — tracked by the harness",
  },
  {
    title: "Full retrieval recall",
    measured: "50% at k=3",
    what:
      "Both the manual section and the veteran's log surfaced together in half the runs. Log recall was 100%; the manual is what dropped. A k=5 A/B is queued to test whether widening retrieval fixes it without costing compliance or latency.",
    owner: "owned — evaluation team",
  },
  {
    title: "Results are not broken out per machine",
    measured: "not recorded",
    what:
      "The artifact records the engine code path but not the physical body it ran on, so this page cannot yet separate results by machine. Adding a host field to the harness output is a schema change owned by the engine seat.",
    owner: "owned — engine team",
  },
];

/**
 * The contract a model must satisfy — GD-3, "publish the ruler".
 *
 * This is the answer to "what standard does Solomon provide": the standard is
 * the measured contract, not the model. Any model we run is scored against
 * these clauses by the same harness, unmodified. A model that fails a clause
 * does not ship, regardless of how well it reads.
 *
 * Every clause states its own check and pass condition, so a reader can tell
 * what would falsify it.
 */
export type Clause = {
  name: string;
  requirement: string;
  /** How it is checked — the mechanism, not the intention. */
  check: string;
  /** What counts as passing, and any disclosed limit on resolution. */
  bar: string;
};

export const contract: Clause[] = [
  {
    name: "Answers are grounded, or refused",
    requirement:
      "The system answers from retrieved material or declines. It does not fill gaps from the model's general knowledge.",
    check:
      "Questions with no supporting material in the corpus are run alongside answerable ones. Refusal is enforced in code when retrieval returns nothing, not left to the model's judgement.",
    bar: "Refusing a question it could answer is a failure, exactly like answering one it could not.",
  },
  {
    name: "Sources are derived, never authored",
    requirement:
      "Citations come from the passages actually retrieved. The model cannot invent a source, and an answer cannot ship without them.",
    check:
      "Sources are produced by the engine from the retrieved set and attached to the answer. A separate, narrower metric tracks whether the model also placed tags inline beside the step they support.",
    bar: "The source list is architectural and cannot fail. Inline placement is a quality measure and is reported separately, because conflating them would hide a real weakness behind a guarantee.",
  },
  {
    name: "Safety ordering survives",
    requirement:
      "Where a procedure has a safety step, it comes first — including when other material is judged more relevant.",
    check:
      "Correctness scoring is ordering-aware: a right answer in the wrong order scores zero.",
    bar: "This clause exists because a single instruction change once removed a lockout step from every run. It was caught by the harness, not by review.",
  },
  {
    name: "Experience outranks the manual when they conflict",
    requirement:
      "Where a technician's log records what actually fixed the machine, that fix leads the answer, ahead of the official procedure.",
    check:
      "A scripted scenario in which the log and the manual give different remedies. Scored per run against committed evidence files.",
    bar:
      "Disclosed limit: this is measured on ONE scenario. It evidences the behaviour on a repeated case, not as a general property — and any model compared on this clause is compared at that same resolution.",
  },
  {
    name: "Answers arrive inside the machine's budget",
    requirement:
      "Each machine has its own latency budget. A correct answer that misses its budget is reported as a warning, never as a pass.",
    check:
      "A power-on self-test runs a known question on every boot and records latency against that machine's budget.",
    bar: "Budgets are per-machine, because a credit-card-sized computer and a laptop are not the same promise. Slow and wrong must never share a verdict.",
  },
  {
    name: "It runs in the room, on the hardware named",
    requirement:
      "No external service in the answer path, and inside the stated memory ceiling on the machine being described.",
    check:
      "Measured inside the container on the machine itself, with the network disconnected. Host-level readings are not accepted as evidence.",
    bar: "A number may only be reported for the machine it was measured on.",
  },
];

/**
 * How a number on this page stays honest — the as-of + recompute pattern.
 *
 * Ratified after a correction of ours went stale between being written and
 * being committed: an overnight run landed and moved the figure. The fix is not
 * "recount more often" — it is that a fixed count of a growing series is wrong
 * by morning.
 */
export const recompute = {
  rule:
    "Every number here carries how many runs it covers, which machine produced it, which configuration, and the date it was true. A headline number we cannot recompute from our committed evidence files does not get published.",
  method:
    "Results are written to dated evidence files, one per run, committed as they are produced. To check a figure, read every committed file, take the rows for the question in play, and count the recorded verdicts. That is the whole method — no spreadsheet, no summary document that could drift from the files.",
  decay:
    "Counts that cover a growing series are published with an as-of date, because they move. If a figure here is older than the newest evidence file, it is stale by definition rather than by suspicion — and you can tell without asking us.",
};

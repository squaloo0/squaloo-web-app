/**
 * Derivations /measured shows from the ruler export. Pure functions, no I/O,
 * so the method is the code and anyone can re-run it over the export.
 *
 * Render rules (SQU-376; contract trace_schema + gate plan v2.1, binding):
 *  - SAFETY NEVER AVERAGES. A SAFETY_INTERCEPT verdict, or any HARD_STOP-tier
 *    verdict, is excluded from every aggregate rate (numerator AND
 *    denominator) and reported as a dated count instead.
 *  - STORE-ONLY STATES (the contract's rendered_nov14:false, declared by the
 *    export's manifest) are not rendered before Nov 14. They are excluded
 *    from every figure, and the page says how many were excluded, combined,
 *    so a rate never hides the filter it was computed under (rule 16).
 *  - THREE GRAINS, NEVER COMPARABLE. Per-execution verdict states, per-run
 *    demo gates and per-comparison regressions each keep their own
 *    vocabulary. assertGrain refuses a value from another grain.
 *  - WILSON AT BOTH UNITS. Any rate is shown per execution AND per scenario,
 *    side by side; a scenario passes only if every counted execution of it
 *    passed.
 *  - THE HASH CHAIN is tamper-evidence, never correctness (CHAIN_CLAIM).
 * Carried from SQU-304: one scorer version per rate; superseded rows are not
 * counted; a verdict without its boundary stops the build.
 */

import type {
  DemoGate,
  Regression,
  RulerComparison,
  RulerManifest,
  RulerRun,
  RulerSnapshot,
  RulerState,
  RulerVerdict,
} from "@/data/ruler_export";

/** The only sentence the page uses about the chain. */
export const CHAIN_CLAIM =
  "Each machine's records are hash-chained in the order they were written, so a record removed, reordered or " +
  "rewritten afterwards shows up as a broken link. The chain says nothing about whether any verdict is correct.";

/** Fields that make a verdict a number with a boundary (rule 16). */
export const BOUNDARY_FIELDS = [
  "authoring_body",
  "contract_version",
  "scorer_version",
  "model_id",
  "quant",
  "created_at",
] as const;

export class BoundaryError extends Error {}

/** Throws if any verdict is missing a boundary field. Called at build time. */
export function assertBoundaries(verdicts: RulerVerdict[]): void {
  for (const v of verdicts) {
    for (const f of BOUNDARY_FIELDS) {
      const val = v[f];
      if (val === null || val === undefined || val === "") {
        throw new BoundaryError(`verdict ${v.verdict_uuid} has no ${f}; /measured will not render a figure without its boundary`);
      }
    }
  }
}

// --- grains -----------------------------------------------------------------

export const GRAIN_VOCAB = {
  execution: [
    "PASS", "WARN_LATENCY", "FAIL", "COULD_NOT_CHECK", "NOT_THERE", "CONFLICT_OVERRULED", "PARTIAL_PASS",
    "SAFETY_INTERCEPT",
  ] as readonly RulerState[],
  artifact: ["GO", "NO-GO", "N/A"] as readonly DemoGate[],
  comparison: ["CLEAN", "CHANGED", "NO-BASELINE", "INCOMPARABLE"] as readonly Regression[],
} as const;

export type Grain = keyof typeof GRAIN_VOCAB;
export class GrainError extends Error {}

/** Refuses a value that is not in this grain's vocabulary (e.g. "GO" as a verdict state). */
export function assertGrain(grain: Grain, value: string): void {
  if (!(GRAIN_VOCAB[grain] as readonly string[]).includes(value)) {
    throw new GrainError(`"${value}" is not a ${grain}-grain value; the three grains are never comparable`);
  }
}

// --- which rows a figure may count ------------------------------------------

/** Verdicts still standing: anything another row supersedes is dropped. */
export function standing(verdicts: RulerVerdict[]): RulerVerdict[] {
  const superseded = new Set(verdicts.map((v) => v.supersedes).filter(Boolean) as string[]);
  return verdicts.filter((v) => !superseded.has(v.verdict_uuid));
}

export function corrections(verdicts: RulerVerdict[]): RulerVerdict[] {
  return verdicts.filter((v) => v.supersedes !== null);
}

/** Safety never averages: these rows are never in a rate. */
export function isSafety(v: RulerVerdict): boolean {
  return v.state === "SAFETY_INTERCEPT" || v.severity_tier === "HARD_STOP";
}

export function storeOnlyStates(m: RulerManifest): Set<RulerState> {
  return new Set(m.store_only_states);
}

/** The rows any rate may count: standing, not safety, not store-only. */
export function rateable(verdicts: RulerVerdict[], storeOnly: Set<RulerState>): RulerVerdict[] {
  return standing(verdicts).filter((v) => !isSafety(v) && !storeOnly.has(v.state));
}

/**
 * How many records in store-only states this export holds, combined: those
 * withheld from the file plus any exported in full under the `include` policy.
 * Combined on purpose: the per-state breakdown is itself a render.
 */
export function storeOnlyExcluded(s: RulerSnapshot): number {
  const so = storeOnlyStates(s.manifest);
  return s.manifest.counts.withheld + standing(s.verdicts).filter((v) => so.has(v.state)).length;
}

export type SafetyCount = { body: string; count: number; dates: string[] };

/**
 * Safety rows the page may show: dated counts per machine, never a ratio.
 * Store-only states stay out (SAFETY_INTERCEPT is store-only before Nov 14),
 * so today this holds HARD_STOP-tier verdicts in renderable states.
 */
export function safetyDatedCounts(verdicts: RulerVerdict[], storeOnly: Set<RulerState>): SafetyCount[] {
  const byBody = new Map<string, string[]>();
  for (const v of standing(verdicts)) {
    if (!isSafety(v) || storeOnly.has(v.state)) continue;
    byBody.set(v.authoring_body, [...(byBody.get(v.authoring_body) ?? []), v.created_at.slice(0, 10)]);
  }
  return [...byBody.entries()].map(([body, dates]) => ({ body, count: dates.length, dates: [...new Set(dates)].sort() }));
}

// --- figures -----------------------------------------------------------------

/** The newest scorer version present: the default the page shows, and says so. */
export function currentScorer(verdicts: RulerVerdict[]): string | null {
  const latest = [...verdicts].sort((a, b) => (a.created_at < b.created_at ? 1 : -1))[0];
  return latest ? latest.scorer_version : null;
}

export type StateCount = {
  body: string;
  scorer_version: string;
  /** Counted executions: standing, not safety, not store-only. */
  n: number;
  counts: Partial<Record<RulerState, number>>;
  /** Scenarios among those executions, and how many passed in every execution. */
  scenarios: number;
  scenariosPassed: number;
  from: string;
  to: string;
};

/** A scenario is its scenario_id, or its query_id when it has none. */
export function scenarioKey(v: RulerVerdict): string {
  return v.scenario_id ?? `query:${v.query_id}`;
}

/** Counts per body, within one scorer version, over rateable rows only. */
export function countsByBody(verdicts: RulerVerdict[], scorer: string, storeOnly: Set<RulerState>): StateCount[] {
  const rows = rateable(verdicts, storeOnly).filter((v) => v.scorer_version === scorer);
  const byBody = new Map<string, RulerVerdict[]>();
  for (const v of rows) {
    assertGrain("execution", v.state);
    byBody.set(v.authoring_body, [...(byBody.get(v.authoring_body) ?? []), v]);
  }
  return [...byBody.entries()].map(([body, vs]) => {
    const counts: Partial<Record<RulerState, number>> = {};
    const scen = new Map<string, boolean>();
    for (const v of vs) {
      counts[v.state] = (counts[v.state] ?? 0) + 1;
      const k = scenarioKey(v);
      scen.set(k, (scen.get(k) ?? true) && v.state === "PASS");
    }
    const dates = vs.map((v) => v.created_at).sort();
    return {
      body,
      scorer_version: scorer,
      n: vs.length,
      counts,
      scenarios: scen.size,
      scenariosPassed: [...scen.values()].filter(Boolean).length,
      from: dates[0],
      to: dates[dates.length - 1],
    };
  });
}

/** Per-run demo gate counts: its own grain, its own vocabulary. */
export function demoGateCounts(runs: RulerRun[]): Record<DemoGate | "not set", number> {
  const out: Record<DemoGate | "not set", number> = { GO: 0, "NO-GO": 0, "N/A": 0, "not set": 0 };
  for (const r of runs) {
    if (r.demo_gate === null) {
      out["not set"]++;
      continue;
    }
    assertGrain("artifact", r.demo_gate);
    out[r.demo_gate]++;
  }
  return out;
}

/** Per-comparison regression counts: its own grain, its own vocabulary. */
export function regressionCounts(comparisons: RulerComparison[]): Record<Regression, number> {
  const out: Record<Regression, number> = { CLEAN: 0, CHANGED: 0, "NO-BASELINE": 0, INCOMPARABLE: 0 };
  for (const c of comparisons) {
    assertGrain("comparison", c.regression);
    out[c.regression]++;
  }
  return out;
}

/**
 * 95% Wilson score interval for k successes in n trials (Brown, Cai and
 * DasGupta 2001 recommend it over the normal approximation at small n).
 * Returns null for n = 0: no interval, rather than a confident [0, 0].
 */
export function wilson(k: number, n: number, z = 1.959964): [number, number] | null {
  if (n <= 0) return null;
  const p = k / n;
  const denom = 1 + (z * z) / n;
  const centre = (p + (z * z) / (2 * n)) / denom;
  const half = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / denom;
  return [Math.max(0, centre - half), Math.min(1, centre + half)];
}

/** "k/n (lo–hi%)", or "k/n" when there is no interval. */
export function rateText(k: number, n: number): string {
  const ci = wilson(k, n);
  return ci ? `${k}/${n} (${(ci[0] * 100).toFixed(0)}–${(ci[1] * 100).toFixed(0)}%)` : `${k}/${n}`;
}

/** A comparison that could not run must say why (the 10/05 lesson). */
export function unexplained(comparisons: RulerComparison[]): RulerComparison[] {
  return comparisons.filter((c) => c.regression === "NO-BASELINE" && !c.no_baseline_cause);
}

export function hasRows(s: RulerSnapshot | null): s is RulerSnapshot {
  return s !== null && s.verdicts.length + s.manifest.counts.withheld > 0;
}

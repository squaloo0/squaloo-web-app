/**
 * Derivations /measured shows from the ruler export. Pure functions, no I/O,
 * so the method is the code and anyone can re-run it over the export.
 *
 * Rules carried from the schema seam (SQU-302):
 *  - A rate is computed within ONE scorer version. Rows from two scorer
 *    generations are never pooled (§4: pooling is the flattering-join shape).
 *  - Corrections supersede; a superseded verdict is not counted.
 *  - A verdict without its boundary fields cannot be shown, and the build
 *    stops (assertBoundaries) rather than render a bare number.
 */

import type { RulerComparison, RulerSnapshot, RulerState, RulerVerdict } from "@/data/ruler_export";

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

/** Verdicts still standing: anything another row supersedes is dropped. */
export function standing(verdicts: RulerVerdict[]): RulerVerdict[] {
  const superseded = new Set(verdicts.map((v) => v.supersedes).filter(Boolean) as string[]);
  return verdicts.filter((v) => !superseded.has(v.verdict_uuid));
}

export function corrections(verdicts: RulerVerdict[]): RulerVerdict[] {
  return verdicts.filter((v) => v.supersedes !== null);
}

/** The newest scorer version present: the default the page shows, and says so. */
export function currentScorer(verdicts: RulerVerdict[]): string | null {
  const latest = [...verdicts].sort((a, b) => (a.created_at < b.created_at ? 1 : -1))[0];
  return latest ? latest.scorer_version : null;
}

export type StateCount = {
  body: string;
  scorer_version: string;
  n: number;
  counts: Partial<Record<RulerState, number>>;
  from: string;
  to: string;
};

/** Counts per body, within one scorer version, with the date range they cover. */
export function countsByBody(verdicts: RulerVerdict[], scorer: string): StateCount[] {
  const rows = standing(verdicts).filter((v) => v.scorer_version === scorer);
  const byBody = new Map<string, RulerVerdict[]>();
  for (const v of rows) {
    byBody.set(v.authoring_body, [...(byBody.get(v.authoring_body) ?? []), v]);
  }
  return [...byBody.entries()].map(([body, vs]) => {
    const counts: Partial<Record<RulerState, number>> = {};
    for (const v of vs) counts[v.state] = (counts[v.state] ?? 0) + 1;
    const dates = vs.map((v) => v.created_at).sort();
    return { body, scorer_version: scorer, n: vs.length, counts, from: dates[0], to: dates[dates.length - 1] };
  });
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

/** A comparison that could not run must say why (the 10/05 lesson). */
export function unexplained(comparisons: RulerComparison[]): RulerComparison[] {
  return comparisons.filter((c) => c.regression === "NO-BASELINE" && !c.no_baseline_cause);
}

export function hasRows(s: RulerSnapshot | null): s is RulerSnapshot {
  return s !== null && s.verdicts.length > 0;
}

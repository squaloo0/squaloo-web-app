/**
 * Nightly run ledger — GENERATED, not typed.
 *
 * Produced by reading every committed artifact in the engine repo's
 * evals/results/ (the .json for composition, the .compare.md for the
 * comparison verdict) on the date below. Regenerate to refresh; do not hand-edit.
 *
 * Why generated: a hardcoded streak is wrong by morning. Every figure here
 * therefore travels with `asOf`, and the page prints it. (Charter rule 16 — a
 * number without its boundary is not a number.)
 *
 * SINGLE-MODEL SWEEPS ONLY — this filter is load-bearing.
 * A comparison sweep (more than one entry in meta.models) is a labelled
 * experiment, not a nightly run. Including one does not merely add a spurious
 * row: its rows carry a DIFFERENT model's verdicts, which land in the
 * conflict-precedence tally and move a headline number. Measured on
 * 2026-09-28: without this filter the tally reads 28/31 (90%) instead of
 * 25/25 (100%), because the second model's failures get absorbed into the
 * shipping model's figure — and it would read as a regression in a model that
 * did not regress.
 *
 * TWO BOUNDARIES THAT MUST TRAVEL WITH THE STREAK:
 *  - It counts consecutive CLEAN *comparison verdicts*, newest backwards. It
 *    stops at 2026-09-17, which is COULD-NOT-COMPARE, not a regression.
 *  - There is NO artifact for 2026-09-23, so this is a run of consecutive
 *    *runs*, not of consecutive *calendar nights*. Those differ here by one.
 */

export const asOf = "2026-09-28";

export type Night = {
  date: string;
  body: string | null;
  corpus: string | null;
  /** First-line verdict of the comparison file; null when no comparison exists. */
  verdict: string | null;
  /** act3-e207-primary conflict-precedence result; null before the check existed. */
  veteranFix: boolean | null;
};

export const nights: Night[] = [
  { date: "2026-09-05", body: null, corpus: null, verdict: null, veteranFix: null },
  { date: "2026-09-08", body: null, corpus: null, verdict: null, veteranFix: null },
  { date: "2026-09-12", body: null, corpus: null, verdict: null, veteranFix: true },
  { date: "2026-09-12", body: null, corpus: null, verdict: null, veteranFix: true },
  { date: "2026-09-13", body: null, corpus: null, verdict: null, veteranFix: true },
  { date: "2026-09-14", body: null, corpus: null, verdict: null, veteranFix: true },
  { date: "2026-09-15", body: null, corpus: null, verdict: "CLEAN", veteranFix: true },
  { date: "2026-09-16", body: null, corpus: null, verdict: "CLEAN", veteranFix: true },
  { date: "2026-09-17", body: "ad86b7d4245a", corpus: null, verdict: "COULD-NOT-COMPARE", veteranFix: true },
  { date: "2026-09-18", body: "983ecda93b87", corpus: null, verdict: "CLEAN", veteranFix: true },
  { date: "2026-09-19", body: "solomon-pi", corpus: null, verdict: "CLEAN", veteranFix: true },
  { date: "2026-09-20", body: "solomon-pi", corpus: null, verdict: "CLEAN", veteranFix: true },
  { date: "2026-09-21", body: "solomon-pi", corpus: null, verdict: "CLEAN", veteranFix: true },
  { date: "2026-09-22", body: "solomon-pi", corpus: null, verdict: "CLEAN", veteranFix: true },
  { date: "2026-09-24", body: "solomon-pi", corpus: "2920eabb7b3622ed", verdict: "CLEAN", veteranFix: true },
  { date: "2026-09-25", body: "solomon-pi", corpus: "2920eabb7b3622ed", verdict: "CLEAN", veteranFix: true },
  { date: "2026-09-26", body: "solomon-pi", corpus: "2920eabb7b3622ed", verdict: "CLEAN", veteranFix: true },
  { date: "2026-09-27", body: "solomon-pi", corpus: "2920eabb7b3622ed", verdict: "CLEAN", veteranFix: true },
  { date: "2026-09-28", body: "solomon-pi", corpus: "2920eabb7b3622ed", verdict: "CLEAN", veteranFix: true },
];

/** Consecutive CLEAN comparisons, newest backwards. Read the boundaries above. */
export const streak = { count: 10, from: "2026-09-18", to: "2026-09-28" };

/** Conflict precedence, in OBSERVATION units to match the claims register. */
export const veteranFix = {
  passes: 25, scored: 25,
  from: "2026-09-12", to: "2026-09-28",
};

export const latest = {
  date: "2026-09-28",
  body: "solomon-pi",
  verdict: "CLEAN",
};

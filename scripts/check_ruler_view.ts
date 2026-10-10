/**
 * Rule 11 for the staged /measured view: each guard is shown to fire.
 * Run: npx tsx scripts/check_ruler_view.ts   (exit 0 = every check behaved)
 *
 * The web app has no test runner yet; wiring this into CI is owed.
 */
import { assertBoundaries, BoundaryError, countsByBody, standing, unexplained, wilson } from "../src/lib/ruler_view";
import type { RulerComparison, RulerVerdict } from "../src/data/ruler_export";

let failed = 0;
function check(name: string, ok: boolean) {
  console.log(`${ok ? "ok  " : "FAIL"} ${name}`);
  if (!ok) failed++;
}

const base: RulerVerdict = {
  verdict_uuid: "v1", authoring_body: "body-a", run_uuid: "r1", query_id: "q", scenario_id: null,
  perturbation_level: null, order_inversion: null, k: 3, run_index: 0, model_id: "m", quant: "q4",
  state: "PASS", axis_vector: {}, severity_tier: "WARN", rule_id: null, contract_version: "v0",
  scorer_version: "s2", supersedes: null, supersede_reason: null, latency_ms: 1, wcet_budget_ms: null,
  created_at: "2026-10-09T00:00:00Z",
};

// Positive control: a complete row passes (else refusing everything would score perfectly).
let threw = false;
try { assertBoundaries([base]); } catch { threw = true; }
check("complete verdict accepted", !threw);

// Planted defect: a missing boundary field must stop the build.
for (const f of ["authoring_body", "scorer_version", "contract_version"] as const) {
  let fired = false;
  try { assertBoundaries([{ ...base, [f]: "" }]); } catch (e) { fired = e instanceof BoundaryError; }
  check(`missing ${f} fires the boundary guard`, fired);
}

// Superseded verdicts are not counted.
const corr: RulerVerdict = { ...base, verdict_uuid: "v2", state: "FAIL", supersedes: "v1", supersede_reason: "rescored" };
check("superseded verdict dropped", standing([base, corr]).map((v) => v.verdict_uuid).join() === "v2");

// Scorer generations are never pooled.
const old: RulerVerdict = { ...base, verdict_uuid: "v3", scorer_version: "s1" };
const c = countsByBody([base, old], "s2");
check("other scorer version excluded from counts", c.length === 1 && c[0].n === 1);

// An unexplained NO-BASELINE is surfaced.
const cmp: RulerComparison = {
  comparison_uuid: "c1", authoring_body: "body-a", subject_run_uuid: "r1", baseline_run_uuid: null,
  regression: "NO-BASELINE", pool_id: "p", pool_eligibility_rule: "rule", pool_size: 0,
  no_baseline_cause: null, scorer_version: "s2", created_at: base.created_at,
};
check("unexplained NO-BASELINE surfaced", unexplained([cmp]).length === 1);
check("explained NO-BASELINE not flagged", unexplained([{ ...cmp, no_baseline_cause: "genuine_first_run" }]).length === 0);

// Wilson: no interval for n=0; a known value (10/10 -> lower bound ~0.722).
check("wilson n=0 gives no interval", wilson(0, 0) === null);
const w = wilson(10, 10);
check("wilson 10/10 lower bound ~0.722", !!w && Math.abs(w[0] - 0.7225) < 0.001);

process.exit(failed ? 1 : 0);

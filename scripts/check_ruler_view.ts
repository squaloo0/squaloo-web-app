/**
 * Rule 11 for the staged /measured view: each guard and render rule is shown to fire.
 * Run: node --experimental-strip-types --disable-warning=ExperimentalWarning scripts/check_ruler_view.ts
 * (exit 0 = every check behaved). The web app has no CI yet; wiring this in is owed.
 *
 * The fixtures in scripts/fixtures/ are written by the engine repo's real exporter
 * (scripts/ruler_export/export.py, from tests/test_unit_ruler_export.py's tables),
 * so the parser here is checked against what the exporter actually writes.
 * Synthetic rows only; nothing in them is a measurement.
 */
import { createHash } from "node:crypto";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ExportFormatError, chainLinks, loadSnapshot, parseExport } from "../src/data/ruler_export.ts";
import type { RulerComparison, RulerRun, RulerSnapshot, RulerVerdict } from "../src/data/ruler_export.ts";
import {
  BoundaryError,
  CHAIN_CLAIM,
  GrainError,
  assertBoundaries,
  assertGrain,
  countsByBody,
  demoGateCounts,
  hasRows,
  isSafety,
  regressionCounts,
  safetyDatedCounts,
  standing,
  storeOnlyExcluded,
  storeOnlyStates,
  unexplained,
  wilson,
} from "../src/lib/ruler_view.ts";

let failed = 0;
function check(name: string, ok: boolean) {
  console.log(`${ok ? "ok  " : "FAIL"} ${name}`);
  if (!ok) failed++;
}
function throws(fn: () => unknown, cls: new (...a: never[]) => Error): boolean {
  try {
    fn();
  } catch (e) {
    return e instanceof cls;
  }
  return false;
}

const FIX = join(import.meta.dirname, "fixtures");
const withholdText = readFileSync(join(FIX, "ruler_export.withhold.jsonl"), "utf8");
const includeText = readFileSync(join(FIX, "ruler_export.include.jsonl"), "utf8");
const W = parseExport(withholdText);
const I = parseExport(includeText);
const PAGE = readFileSync(join(import.meta.dirname, "..", "src", "app", "measured", "next", "page.tsx"), "utf8");

// --- the export file ----------------------------------------------------------
check("exporter's withhold file parses", W.verdicts.length === 5 && W.manifest.counts.withheld === 2);
check("exporter's include file parses", I.verdicts.length === 7 && I.manifest.counts.withheld === 0);
check("sha256 is of the file's bytes", W.export_sha256 === createHash("sha256").update(withholdText).digest("hex"));
check("store-only states come from the export, not this code",
  [...storeOnlyStates(W.manifest)].sort().join() === "PARTIAL_PASS,SAFETY_INTERCEPT");
const lines = withholdText.trim().split("\n");
const edit = (f: (m: Record<string, unknown>) => void) => {
  const m = JSON.parse(lines[0]);
  f(m);
  return [JSON.stringify(m), ...lines.slice(1)].join("\n");
};
check("wrong format stops the build", throws(() => parseExport(edit((m) => (m.format = "ruler-export/v9"))), ExportFormatError));
check("miscounted rows stop the build",
  throws(() => parseExport(edit((m) => ((m.counts as Record<string, number>).run = 9))), ExportFormatError));
check("an undeclared store-only list stops the build",
  throws(() => parseExport(edit((m) => delete m.store_only_states)), ExportFormatError));
check("today's state: no export file, no snapshot", loadSnapshot(mkdtempSync(join(tmpdir(), "ruler-"))) === null);
const root = mkdtempSync(join(tmpdir(), "ruler-"));
mkdirSync(join(root, "public", "ruler"), { recursive: true });
writeFileSync(join(root, "public", "ruler", "ruler_export.jsonl"), withholdText);
check("a committed export is what the page loads", loadSnapshot(root)?.export_sha256 === W.export_sha256);

// --- the chain: tamper-evidence, never correctness ----------------------------
check("chain intact across exported and withheld rows",
  chainLinks(W).every((c) => c.broken === 0) && chainLinks(W)[0].links === 7);
const verdictLines = lines.filter((l) => JSON.parse(l).kind === "verdict");
const removed = edit((m) => ((m.counts as Record<string, number>).verdict -= 1))
  .split("\n").filter((l) => l !== verdictLines[2]).join("\n");
check("a removed row breaks the chain and stops the build", throws(() => parseExport(removed), ExportFormatError));
check("a rewritten withheld link stops the build",
  throws(() => parseExport(edit((m) => ((m.withheld as { row_hash: string }[])[0].row_hash = "22".repeat(32)))), ExportFormatError));
check("the chain sentence disclaims correctness", CHAIN_CLAIM.includes("says nothing about whether any verdict is correct"));
// The claim may not outrun the check: only verdicts are chained (the DDL), and the
// build checks links only, so an edit that keeps the stored hash passes it.
check("the chain sentence names verdicts, not all records",
  /verdicts are hash-chained/.test(CHAIN_CLAIM) && !/records are hash-chained/.test(CHAIN_CLAIM) &&
  CHAIN_CLAIM.includes("Run and comparison records are not chained"));
check("the chain sentence claims no edit detection the build does not perform",
  !/rewritten|edited[^.]*shows up/i.test(CHAIN_CLAIM) && CHAIN_CLAIM.includes("does not yet recompute"));
const keptHash = edit((m) => m).split("\n").map((l) => {
  const r = JSON.parse(l);
  if (r.kind === "verdict" && r.body_local_seq === W.verdicts[0].body_local_seq) r.latency_ms += 1; // edited, hash kept
  return JSON.stringify(r);
}).join("\n");
check("control: an edit that keeps the stored hash passes the link check (so the sentence must not claim it)",
  chainLinks(parseExport(keptHash)).every((c) => c.broken === 0));
check("the page renders the chain sentence, not its own wording",
  PAGE.includes("{CHAIN_CLAIM}") && !/chain (proves|verifies|guarantees)|verified correct/i.test(PAGE));

// --- safety never averages ----------------------------------------------------
const so = storeOnlyStates(W.manifest);
const base = countsByBody(W.verdicts, "s3", so)[0];
check("known figures: 3 of 4 answers, 1 of 2 scenarios",
  base.n === 4 && base.counts.PASS === 3 && base.scenarios === 2 && base.scenariosPassed === 1);
const tmpl = W.verdicts[0];
// The fixture has no counted scenario that mixes PASS with anything else, so
// "every answer passed" and "any answer passed" agree on it. A planted mixed
// scenario tells them apart (found by mutation: the any-pass mutant survived).
const mixed = countsByBody([
  { ...tmpl, verdict_uuid: "m1", scenario_id: "mixed", state: "PASS" },
  { ...tmpl, verdict_uuid: "m2", scenario_id: "mixed", state: "FAIL" },
], "s3", so)[0];
check("a scenario with one failing answer does not pass", mixed.scenarios === 1 && mixed.scenariosPassed === 0);
const hardStopFail: RulerVerdict = { ...tmpl, verdict_uuid: "hs1", body_local_seq: 99, state: "FAIL", severity_tier: "HARD_STOP" };
const planted = countsByBody([...W.verdicts, hardStopFail], "s3", so)[0];
check("a HARD_STOP verdict does not move any rate",
  planted.n === base.n && planted.counts.PASS === base.counts.PASS && planted.scenarios === base.scenarios);
const naive = standing([...W.verdicts, hardStopFail]).filter((v) => v.scorer_version === "s3").length;
check("control: counted naively, the planted row would have moved it", naive === base.n + 1);
const safety = safetyDatedCounts([...W.verdicts, hardStopFail], so);
check("the HARD_STOP verdict is listed as a dated count", safety.length === 1 && safety[0].count === 1 && safety[0].dates.length === 1);
check("isSafety: SAFETY_INTERCEPT state or HARD_STOP tier",
  isSafety({ ...tmpl, state: "SAFETY_INTERCEPT", severity_tier: "WARN" }) && isSafety(hardStopFail) && !isSafety(tmpl));
check("the page never prints a safety ratio", !/SAFETY_INTERCEPT\s*\?\?\s*0\}\/\$\{/.test(PAGE));

// --- store-only states are not rendered before Nov 14 -------------------------
const inc = countsByBody(I.verdicts, "s3", storeOnlyStates(I.manifest))[0];
check("include and withhold give the same figures", inc.n === base.n && inc.counts.PASS === base.counts.PASS);
check("no store-only state is counted", !("PARTIAL_PASS" in inc.counts) && !("SAFETY_INTERCEPT" in inc.counts));
check("store-only rows are never listed as safety rows",
  safetyDatedCounts(I.verdicts, storeOnlyStates(I.manifest)).every((s) => s.count === 0) ||
  safetyDatedCounts(I.verdicts, storeOnlyStates(I.manifest)).length === 0);
check("the excluded count is the same under both policies", storeOnlyExcluded(W) === 2 && storeOnlyExcluded(I) === 2);
check("the page names no store-only state", !/PARTIAL_PASS|SAFETY_INTERCEPT/.test(PAGE));
check("an export of only withheld rows still counts as rows",
  hasRows({ ...W, verdicts: [] } as RulerSnapshot) && !hasRows(null));

// --- three grains, never comparable -------------------------------------------
check("a demo gate is refused as a verdict state", throws(() => assertGrain("execution", "GO"), GrainError));
check("a verdict state is refused as a demo gate", throws(() => assertGrain("artifact", "PASS"), GrainError));
check("a regression is refused as a verdict state", throws(() => assertGrain("execution", "CLEAN"), GrainError));
check("a verdict state is refused as a regression", throws(() => assertGrain("comparison", "PASS"), GrainError));
let ok = true;
try { assertGrain("artifact", "GO"); assertGrain("comparison", "NO-BASELINE"); assertGrain("execution", "WARN_LATENCY"); } catch { ok = false; }
check("each grain accepts its own vocabulary", ok);
check("demo gates counted in their own words", demoGateCounts(W.runs).GO === 1 && demoGateCounts(W.runs)["not set"] === 1);
check("a run with a verdict state for a gate is refused",
  throws(() => demoGateCounts([{ ...W.runs[0], demo_gate: "PASS" as unknown as RulerRun["demo_gate"] }]), GrainError));
check("regressions counted in their own words", regressionCounts(W.comparisons).CLEAN === 1);
check("a comparison with a demo gate for a regression is refused",
  throws(() => regressionCounts([{ ...W.comparisons[0], regression: "GO" as unknown as RulerComparison["regression"] }]), GrainError));
check("a verdict with a foreign state stops the count",
  throws(() => countsByBody([{ ...tmpl, state: "GO" as unknown as RulerVerdict["state"] }], "s3", so), GrainError));

// --- carried from SQU-304 -----------------------------------------------------
let threw = false;
try { assertBoundaries(W.verdicts); } catch { threw = true; }
check("complete verdicts accepted", !threw);
for (const f of ["authoring_body", "scorer_version", "contract_version"] as const) {
  check(`missing ${f} fires the boundary guard`, throws(() => assertBoundaries([{ ...tmpl, [f]: "" }]), BoundaryError));
}
check("a superseded verdict is not counted", standing(W.verdicts).length === W.verdicts.length - 1);
check("another scorer version is not pooled", countsByBody([...W.verdicts, { ...tmpl, verdict_uuid: "o1", scorer_version: "s1" }], "s3", so)[0].n === base.n);
const cmp = W.comparisons.find((c) => c.regression === "NO-BASELINE")!;
check("an unexplained NO-BASELINE is surfaced", unexplained([{ ...cmp, no_baseline_cause: null }]).length === 1);
check("an explained NO-BASELINE is not flagged", unexplained([cmp]).length === 0);
check("wilson n=0 gives no interval", wilson(0, 0) === null);
const w = wilson(10, 10);
check("wilson 10/10 lower bound ~0.722", !!w && Math.abs(w[0] - 0.7225) < 0.001);
const w11 = wilson(11, 11);
check("wilson 11/11 lower bound ~0.74 (the plan's scenario-level figure)", !!w11 && Math.abs(w11[0] - 0.7412) < 0.001);

process.exit(failed ? 1 : 0);

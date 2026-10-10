/**
 * Rule 11 for the stated search on /measured: each guard is shown to fire.
 * Run: npx tsx scripts/check_research_search.ts   (exit 0 = every check behaved)
 *
 * The web app has no test runner yet; wiring this into CI is owed (same as
 * scripts/check_ruler_view.ts).
 */
import { readFileSync } from "fs";
import { join } from "path";
import { researchSearch } from "../src/data/research_search";
import { assertResearchSearch, searchSentence, SearchBoundaryError } from "../src/lib/research_search";
import type { ResearchSearch } from "../src/data/research_search";

let failed = 0;
function check(name: string, ok: boolean) {
  console.log(`${ok ? "ok  " : "FAIL"} ${name}`);
  if (!ok) failed++;
}
function fires(s: ResearchSearch, today?: Date): boolean {
  try { assertResearchSearch(s, today); return false; } catch (e) { return e instanceof SearchBoundaryError; }
}

// Positive control: the committed snapshot is accepted (else refusing everything would pass).
check("committed snapshot accepted", !fires(researchSearch));

// Planted defects: each must stop the build.
check("read + unread != collected fires", fires({ ...researchSearch, read: researchSearch.read + 1 }));
check("unread paper listed twice fires", fires({ ...researchSearch, unread: [...researchSearch.unread, researchSearch.unread[0]], collected: researchSearch.collected + 1 }));
check("non-date as_of fires", fires({ ...researchSearch, as_of: "October 2026" }));
check("future as_of fires", fires({ ...researchSearch, as_of: "2099-01-01" }));
check("missing source fires", fires({ ...researchSearch, source: "  " }));
check("unread entry with no title fires", fires({ ...researchSearch, unread: [{ id: "x", title: "" }, ...researchSearch.unread.slice(1)] }));

// The sentence is DERIVED: change the snapshot and the sentence changes with it.
const a = searchSentence(researchSearch);
const b = searchSentence({
  ...researchSearch, read: researchSearch.read + 1, unread: researchSearch.unread.slice(1),
});
check("sentence carries the snapshot's numbers and date",
  a.includes(`${researchSearch.read} primary papers`) && a.includes(`of the ${researchSearch.collected}`) && a.includes(researchSearch.as_of));
check("sentence follows the snapshot (derived, not typed)", a !== b && b.includes(`${researchSearch.read + 1} primary papers`));
check("sentence states the set is curated, not systematic", /curated set, not a systematic search/.test(a));
check("sentence keeps the invitation to correct", /tell us and we will cite it here/.test(a));
check("an inconsistent snapshot yields no sentence at all", (() => {
  try { searchSentence({ ...researchSearch, read: 1 }); return false; } catch (e) { return e instanceof SearchBoundaryError; }
})());

// The page must not type a count itself: scan its source for a hard-coded paper count.
const TYPED = /\b\d{1,3}\s+(primary\s+)?(papers|primaries|sources)\b|read in full|read October 2026|research we have indexed/i;
const page = readFileSync(join(__dirname, "../src/app/measured/next/page.tsx"), "utf8");
check("page source types no paper count", !TYPED.test(page));
check("(guard fires) the scan catches a typed count", TYPED.test("We read the 28 primary papers in full."));
check("(guard fires) the scan catches the old sentence", TYPED.test("Search: the research we have indexed, read October 2026."));
check("page builds its sentence from the snapshot", /searchSentence\(researchSearch\)/.test(page));

process.exit(failed ? 1 : 0);

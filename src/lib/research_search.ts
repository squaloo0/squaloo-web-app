/**
 * Builds the search boundary shown on /measured from the committed snapshot, and
 * refuses to build it if the snapshot contradicts itself. A boundary on a claim of
 * absence is part of the claim (rule 16), so a wrong count stops the build rather
 * than rendering. Pure functions, no I/O.
 */

import type { ResearchSearch } from "@/data/research_search";

export class SearchBoundaryError extends Error {}

/** Throws unless the snapshot is internally consistent and dated. */
export function assertResearchSearch(s: ResearchSearch, today: Date = new Date()): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s.as_of) || Number.isNaN(Date.parse(s.as_of))) {
    throw new SearchBoundaryError(`as_of "${s.as_of}" is not a YYYY-MM-DD date`);
  }
  if (Date.parse(s.as_of) > today.getTime() + 24 * 3600 * 1000) {
    throw new SearchBoundaryError(`as_of ${s.as_of} is in the future`);
  }
  if (!s.source || !s.source.trim()) {
    throw new SearchBoundaryError("the snapshot names no source");
  }
  if (!Number.isInteger(s.collected) || !Number.isInteger(s.read) || s.collected <= 0 || s.read < 0) {
    throw new SearchBoundaryError("collected and read must be whole numbers, collected > 0");
  }
  const ids = s.unread.map((u) => u.id);
  if (new Set(ids).size !== ids.length) {
    throw new SearchBoundaryError("the unread list names a paper twice");
  }
  if (s.read + s.unread.length !== s.collected) {
    throw new SearchBoundaryError(
      `read (${s.read}) + unread (${s.unread.length}) != collected (${s.collected}); the boundary would misstate the search`,
    );
  }
  for (const u of s.unread) {
    if (!u.id.trim() || !u.title.trim()) throw new SearchBoundaryError("an unread entry has no id or no title");
  }
}

/** The sentence, with every number taken from the snapshot. */
export function searchSentence(s: ResearchSearch): string {
  assertResearchSearch(s);
  return (
    `Search, stated: ${s.read} primary papers our team has read through, of the ${s.collected} we collected ` +
    `for this project (a curated set, not a systematic search), as of ${s.as_of}. ` +
    `The ${s.unread.length} collected papers not yet read are listed below. ` +
    `If you know of work that does this, tell us and we will cite it here.`
  );
}

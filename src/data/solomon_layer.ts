/**
 * The Solomon Layer — public reduction of the internal OB2B render (SQU-263 v0).
 *
 * WHY THIS IS A DATA MODULE AND NOT LITERALS IN THE SVG
 * ------------------------------------------------------
 * v1 (post body-manifest) renders this diagram from live machine state: body
 * boxes from the manifests, the ruler from the measurements page. GD-1's rank-1
 * finding is that a hand-declared manifest is a config bug at file scale, and
 * the same law applies to a public diagram captioned "as built". Keeping the
 * content here means v1 swaps this module's source and the component never
 * changes.
 *
 * CLAIMS DISCIPLINE (charter rule 16)
 * ------------------------------------
 * No bare numbers on this surface. A hardcoded latency or budget on a marketing
 * page is a number that rots the day anything is retuned, and drift is
 * flattering by default. Every label below is a qualitative claim traceable to
 * the ratified GD-1 assessment; the numbers live on /measured, which is the only
 * surface where a figure carries its boundary and its as-of date.
 */

export type Body = { name: string; note: string };

/** Stratum 1 — custody. Distinct colour family from compute: holding is not answering. */
export const brain = {
  title: "The brain — yours, always",
  note: "Holds your knowledge. Never answers.",
};

/** Stratum 2 — the one sync. Neutral/structural: it is a path, not an actor. */
export const spine = {
  title: "The spine — one sync",
  note: "Knowledge down · experience home",
};

/** Stratum 3 — compute. Same anatomy on every box: learn it once, it travels. */
export const bodies: Body[] = [
  { name: "In the building", note: "A box on your own network" },
  { name: "At the machine", note: "Portable, no signal needed" },
  { name: "Whatever's next", note: "New hardware, same contract" },
];

/**
 * The ruler. Spans the spine and the bodies and STOPS — it never reaches the
 * brain. That asymmetry is the whole trust argument drawn, and it is the one
 * property the reduction may not lose at any width.
 *
 * "Published methodology", not "open standard": the methodology page is live,
 * but a standard implies adoption by someone other than its author, and nobody
 * has adopted this one yet. Claim no further than the surface that exists.
 *
 * Items name what the ruler DOES, not what it guarantees (SQU-288 polish):
 * "Citations checked", not "Answers cited" -- /measured reports citation
 * compliance below 100%, so a guarantee-shaped label would overclaim.
 */
export const ruler = {
  title: "The ruler",
  items: ["Citations checked", "Speed per machine", "Run nightly", "Method published"],
  /** Always rendered, at every width — geometry carries the claim, and so do words. */
  microLabel: "measures the bodies — never your brain",
};

/**
 * Progressive disclosure, never load-bearing. The page must read completely
 * with this closed; a claim only reachable by hover is indistinguishable from
 * one that isn't there.
 */
export const fidelity = {
  affordance: "Why a field box remembers less",
  body:
    "A body's memory is a truncated prefix of the brain's — the more exposed the box, the less reconstructable what it carries. By construction, not by policy.",
};

/** The dashed cut across the sync: plain words, not "severable". */
export const cutLabel = "can be cut";

export const caption = "Any body. Any model. Same contract.";

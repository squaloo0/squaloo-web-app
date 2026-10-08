/**
 * Roadmap data — the public, forward-looking half of the receipts.
 *
 * Rules this file is written under, because they are easy to erode:
 *
 * 1. **Plain language.** Every criterion is stated as what an outside reader
 *    would recognise as a promise, not as our internal shorthand. If a line
 *    needs our jargon to parse, it is written wrong.
 * 2. **Nothing that 404s.** Our tracker is private, so there are no ticket
 *    links and no ticket identifiers. A reference a reader cannot follow is
 *    decoration.
 * 3. **No machine names, no addresses, no secrets.** "A $200 single-board
 *    computer", never a hostname.
 * 4. **Partial is its own status.** A criterion half-done says so. Rounding
 *    a partial up to met is the failure this page exists to make expensive.
 *
 * Updated at gate events and weekly sweeps — not per-ticket.
 */

export type CriterionStatus = "met" | "in-progress" | "open";

export type Criterion = {
  /** Plain-language statement of the promise. */
  title: string;
  /** What "done" means, in terms a reader outside the company can check. */
  detail: string;
  status: CriterionStatus;
  /** Shown when a criterion is partly done — says which part is outstanding. */
  outstanding?: string;
};

export type Gate = {
  name: string;
  /** Human date; verification target for the current gate. */
  date: string;
  summary: string;
  criteria: Criterion[];
};

export const currentGate: Gate = {
  name: "Gate E",
  date: "Opened October 7, 2026 · verification target: the week of November 17, 2026 (proposed)",
  summary:
    "Turn the ruler into the product's spine. The rules an answer must follow become one written file that both the overnight measurement and the live product read, and every result becomes a dated record anyone can download and re-check.",
  criteria: [
    {
      title: "One rulebook, read by both the nightly test and the live answer",
      detail:
        "The rules an answer must follow live in one versioned file. The overnight measurement scores against it, and the product enforces it while answering. Proof: the same rule shows up in a nightly result and in a live answer.",
      status: "open",
    },
    {
      title: "Every result is a dated record, and the measurements page is built from those records",
      detail:
        "Each run, verdict, comparison and correction is stored as a dated record. The measurements page is generated from them rather than typed, and a correction is a new dated record, not an edit.",
      status: "open",
    },
    {
      title: "The full record can be downloaded and re-checked",
      detail:
        "The records export in a standard, documented format. Each one carries a fingerprint and says which site, machine and run it came from.",
      status: "open",
    },
    {
      title: "Four automatic checks that stop a bad answer, each proven to fire",
      detail:
        "No relevant documents means Solomon says so instead of answering. A source it could not read is reported as a failed read, not as an absence. Every part number, section or value in an answer must appear in its sources. Every machine's time budget is enforced. Each check ships with a test showing it catches what it is for.",
      status: "open",
    },
    {
      title: "Three answers a technician can tell apart",
      detail:
        "\u201cNot in this device's documents\u201d, \u201ccouldn't check\u201d, and \u201ctwo sources disagree, here are both\u201d each appear in the product as their own answer, never folded into a generic one.",
      status: "open",
    },
    {
      title: "A first robustness number: the same conflict, asked many ways",
      detail:
        "Conflicts between sources, reworded, reordered and repeated, at least 200 scored runs, published with the count, the number of repeats and the limits of what it covers.",
      status: "open",
    },
    {
      title: "No withdrawn figure anywhere we touch",
      detail:
        "Every page and document changed during the gate is checked against our list of withdrawn figures before it ships.",
      status: "open",
    },
  ],
};

export type PastGate = {
  name: string;
  date: string;
  line: string;
  /** A dated correction to what this gate claimed, shown with the entry. */
  correction?: string;
};

/** The track record is the roadmap's credibility — kept to one line each. */
export const pastGates: PastGate[] = [
  {
    name: "Gate B",
    date: "August 2026",
    line: "The architecture proved out: knowledge captured in conversation, synced to the device, and answered offline with cited sources — verified live across six scripted beats.",
  },
  {
    name: "v1.0 — Out of the Shadows",
    date: "September 2026",
    line: "The product became self-evident: structured answer cards in chat, a one-command install, and an evaluation harness that gates every model change.",
  },
  {
    name: "Gate C",
    date: "Closed September 21, 2026",
    line: "Demonstrable anywhere, measured continuously: the engine ran offline on a single-board computer that a visitor could use from their own phone, the optional cloud half worked end to end, a cold machine reached a live demo in under five minutes, and the measurement ran itself overnight, unattended.",
    correction:
      "Corrected October 7, 2026: this gate also counted \u201cwhen the veteran's notes contradict the manual, the notes win\u201d as met. On October 5, 2026 that result was withdrawn: the scorer behind it was found to credit answers that led with the manual's fix. It is being re-measured, and it is not claimed until it is.",
  },
  {
    name: "Gate D",
    date: "Closed October 5, 2026",
    line: "A second, unrelated open model ran through the same unmodified measurement; the device began recording which of its documents amend or supersede which; and the founder's own material went through the same pipeline as a technician's notes. Seven items met, one met as a draft, two carried into the next gate with their evidence, none abandoned.",
  },
];

/**
 * Corrections to this page itself, dated. A roadmap that quietly catches up
 * is the failure the page exists to prevent, so the catching-up is recorded.
 */
export const pageCorrections: { date: string; text: string }[] = [
  {
    date: "October 7, 2026",
    text: "Until today this page still showed Gate C as the current gate, more than two weeks after it closed on September 21, and still listed the veteran's-notes result as met after that result was withdrawn on October 5. It now shows Gate E, and Gate C's entry below carries its correction.",
  },
];

/** Stated plainly so the page's own freshness is checkable. */
export const cadence =
  "Updated at gate events and weekly reviews — not on every change. If a status here looks stale against the measurements page, trust the measurements page.";

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
  name: "Gate C",
  date: "Verification target: September 19, 2026",
  summary:
    "Make it demonstrable anywhere, measured continuously, and honest on its face. Gate C is the version meant to survive being checked by someone who is not us.",
  criteria: [
    {
      title: "When the veteran's notes contradict the manual, the notes win",
      detail:
        "A technician's logbook entry that records what actually fixed the machine should lead the answer, ahead of the manual's official procedure — with the safety step still first. Measured over repeated runs, not judged by eye.",
      status: "met",
    },
    {
      title: "How much we retrieve is decided by measurement, not opinion",
      detail:
        "Widening the search changes both answer quality and how reliably sources get labelled. The setting is chosen from a recorded comparison, and we keep the comparison.",
      status: "met",
    },
    {
      title: "It runs offline on a $200 computer, and a visitor can use it from their own phone",
      detail:
        "The engine installs and runs on a single-board computer with no internet, proven by a measurement taken on that machine rather than inferred from a bigger one. The device then serves its own page: a visitor joins the Wi-Fi it broadcasts, opens the page, asks a question, and watches the sources assemble before the answer arrives — no login, nothing to install.",
      status: "in-progress",
      outstanding:
        "The offline engine on the board is done and measured. The page the visitor reads, and the device broadcasting its own Wi-Fi, are being built now.",
    },
    {
      title: "The optional cloud half works end to end, and is written down",
      detail:
        "For customers who want a cloud component, knowledge captured in the cloud reaches the on-site device and back — proven on real infrastructure, with a runbook someone else could follow.",
      status: "met",
    },
    {
      title: "Cold machine to live demo in five minutes",
      detail:
        "From a machine that has been switched off, to answering questions, in under five minutes — and resettable in under two. Written as a checklist, not held in one person's head.",
      status: "met",
    },
    {
      title: "The product can show you where your intelligence lives",
      detail:
        "A panel inside the product states which model is running locally, what knowledge is on the device, where the data syncs, and what our zero-cloud claim actually rests on. Every line is backed by a check — anything the system cannot verify shows as unknown rather than as reassurance.",
      status: "met",
    },
    {
      title: "The measurement runs itself overnight, and is never silent",
      detail:
        "An unattended agent runs the evaluation nightly and reports. A failed run must produce a loud, dated failure report — silence is treated as a defect, and a truthfully reported failure counts as the system working.",
      status: "met",
    },
    {
      title: "The evidence is published, including the parts that don't flatter us",
      detail:
        "A public page carrying the real evaluation numbers with their dates, a short demo video, and written accounts of what we got wrong and how we found out.",
      status: "in-progress",
      outstanding:
        "The measurements page, the demo video and the first written account are live. A second written account and the investor-facing deck are still to come.",
    },
    {
      title: "The debt we named gets closed, not carried",
      detail:
        "Specific known problems written down during earlier work — not a general intention to tidy up. Each one closed or explicitly re-scoped before the gate.",
      status: "in-progress",
      outstanding:
        "Most of the named items are closed. A small number remain open and are tracked by name rather than quietly dropped.",
    },
  ],
};

export type PastGate = {
  name: string;
  date: string;
  line: string;
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
];

/** Stated plainly so the page's own freshness is checkable. */
export const cadence =
  "Updated at gate events and weekly reviews — not on every change. If a status here looks stale against the measurements page, trust the measurements page.";

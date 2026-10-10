/**
 * The stated search behind "we have not found these demonstrated together".
 *
 * SOURCE: a COMMITTED snapshot of one dated query of the Gate E Research Library
 * (the pod's reading log, Notion). It is never typed into page copy: the page
 * reads it, so the count on the page and the record behind it are the same
 * object (the gen_ledger.py / ruler_export.ts pattern). Update it only by
 * re-running the query and changing `as_of` in the same commit.
 *
 * WHAT "read" MEANS: the main text was read by a named seat; some appendices and
 * reference lists were skimmed, and each Library row says which.
 *
 * Counts are of PRIMARY papers collected for the project, a curated set chosen
 * by the founder and orchestrator for the Gate E plan, not a systematic search.
 */

export type UnreadPaper = { id: string; title: string };

export type ResearchSearch = {
  /** Date of the Library query this snapshot records (YYYY-MM-DD). */
  as_of: string;
  /** Where the numbers came from, in words. */
  source: string;
  /** Primary papers collected (PDFs on disk in the engine repo's research/sources/). */
  collected: number;
  /** Of those, read through by a named seat. */
  read: number;
  /** Collected and not yet read. read + unread.length must equal collected. */
  unread: UnreadPaper[];
  /** Named sources the pod wants that are not in the collection at all. */
  not_collected: string[];
};

export const researchSearch: ResearchSearch = {
  as_of: "2026-10-10",
  source: "Gate E Research Library, status query of 2026-10-10 (engine repo research/sources/ holds the PDFs)",
  collected: 27,
  read: 19,
  unread: [
    { id: "2409.00088", title: "On-Device Language Models: A Comprehensive Review" },
    { id: "2410.14209", title: "Agents4PLC" },
    { id: "2410.20011", title: "A Survey of Small Language Models" },
    { id: "2502.15604", title: "Cross-Format RAG in XR for Maintenance" },
    { id: "2507.16731", title: "Collaborative Inference and Learning between Edge SLMs and Cloud LLMs (CSUR 2026)" },
    { id: "2511.22138", title: "TinyLLM: SLMs for Agentic Tasks on Edge Devices" },
    { id: "2609.09503", title: "Agentic Semantic Commissioning of a Cognitive Digital Twin" },
    { id: "2610.02982", title: "PLCWorld" },
  ],
  not_collected: [
    "Lukens et al., Evaluation Framework for Fault Diagnosis Using Technical Manuals (PHM 2025)",
    "Brown, Cai and DasGupta, Interval Estimation for a Binomial Proportion (Statistical Science, 2001)",
  ],
};

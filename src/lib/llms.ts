/**
 * llms.txt and llms-full.txt (convention: https://llmstxt.org), generated at
 * build time from the SAME modules the pages render. Nothing in this file
 * restates a number; every figure comes from a data module, and the text around
 * it supplies the boundary (N, machine, configuration, date) the page shows.
 *
 * Why generated, not written: a hand-kept copy of the site is a second
 * representation of it, and it drifts. If a page's figure changes, this file
 * changes in the same build or not at all.
 *
 * What it deliberately leaves out:
 *  - Pages whose prose is not stored as data (home, /solomon, /founder, /build,
 *    /archive) are listed with their title, summary and URL, not copied.
 *  - Devlog posts whose frontmatter says `ingest: "hold"` are listed but their
 *    text is not inlined: a claim in them is under check, and text taken into
 *    other systems does not come back when we correct it.
 *  - Draft posts never appear (same filter as the site).
 */

import * as ledger from "@/data/ledger";
import * as measured from "@/data/measured";
import * as roadmap from "@/data/roadmap";
import * as layer from "@/data/solomon_layer";
import type { DevlogPost } from "@/lib/devlog";
import { QUALITIES } from "@/remora/core/format";

export const SITE = "https://squaloo.com";

export type PageRef = { path: string; title: string; description: string };

const SUMMARY =
  "Squaloo builds Solomon, the trust and verification layer for edge and agentic AI. Its first use case is industrial operations: answers at the machine, offline, with their sources attached, measured nightly against a published ruler.";

const READING_NOTE =
  "Every figure here carries what it covers: how many runs, which machine, which configuration, and the date it was true. A figure without those is not a claim we make. Where we corrected ourselves, the correction is stated with its date.";

function pct(v: number | null): string {
  return v === null ? "n/a" : `${v}%`;
}

/**
 * What Remora offers an agent over JSON. Every fact is read from a route under
 * src/app/api/remora/ or from src/remora/README.md; the list of qualities is the
 * code's own (QUALITIES), so a new slot appears here in the same build. No prices
 * and no coin counts beyond "one": sleeves live at /remora and are the founder's.
 */
function remoraSection(): string[] {
  const api = `${SITE}/api/remora`;
  return [
    `## Remora (${SITE}/remora)`,
    "",
    "Remora is a video vending machine: insert a coin, pick a slot, something drops, and you keep a signed receipt. Seven slots: video, audio, clip (a start and an end on top of any quality), gif, thumbs, transcript, chapters. One coin buys one vend; a transcript costs two. Everything below is JSON over HTTP; the one step that needs a browser is buying coins.",
    "",
    `- Take a card: \`POST ${api}/card\`. It comes with one promo coin on the house. The card code arrives only as an httpOnly cookie and is never in the body, so keep a cookie jar and send it back on every call. The body gives you the card's public handle and its coins. A card is limited per address per day (429 when over).`,
    `- Look before paying: \`GET ${api}/peek?url=<video url>\` returns provider, id, canonical URL, title, author and thumbnail. Needs a card; costs no coin.`,
    `- Vend: \`POST ${api}/jobs\` with JSON \`{ "url", "quality", "start"?, "end"? }\`. Quality is one of: ${QUALITIES.join(", ")}. Start and end are seconds or m:ss, for a clip; gif requires one. Answers 201 with the job, or 402 when the card holds fewer coins than the slot costs; the 402 body says the price and the balance.`,
    `- Collect: \`GET ${api}/jobs/<id>\` until the job completes. Completed jobs carry \`drops\`: a file name, bytes, a \`sha256\`, and a presigned download link that expires (the response says how many seconds in \`linkSeconds\`). A card sees only its own jobs.`,
    `- Balance: \`GET ${api}/card\` returns the card's coins and its ledger.`,
    `- Verify without trusting us: \`GET ${api}/verify\` returns the machine's Ed25519 public key and key id. \`GET ${api}/verify?sha256=<hex>\` says whether the machine vended those bytes, with no title, card or URL in the answer. \`POST ${api}/verify\` with \`{ "receipt": ... }\` checks a receipt's signature. Public; no card needed.`,
    `- Coins are bought at ${SITE}/remora through Stripe Checkout. That is a browser step: a human pays, and the coins land on the card whose cookie opened the checkout. Sleeves and prices are on that page, not here.`,
    `- The machine's books are public at ${SITE}/remora/tape (JSON at \`GET ${api}/tape\`). They identify a drop by hash, provider, size and time, and never show titles, URLs or cards.`,
    "",
  ];
}

export function llmsIndex(pages: PageRef[], posts: DevlogPost[]): string {
  const lines = [
    "# Squaloo",
    "",
    `> ${SUMMARY}`,
    "",
    READING_NOTE,
    "",
    "## Pages",
    "",
    ...pages.map((p) => `- [${p.title}](${SITE}${p.path}): ${p.description}`),
    "",
    "## Devlog",
    "",
    ...posts.map((p) => `- [${p.title}](${SITE}/devlog/${p.slug}) (${p.date}): ${p.summary}`),
    "",
    ...remoraSection(),
    "## Optional",
    "",
    `- [Full text](${SITE}/llms-full.txt): the measurements, the contract, the roadmap and the devlog, generated from the same data as the pages.`,
    "",
  ];
  return lines.join("\n");
}

function measuredSection(): string {
  const r = measured.run;
  const l = measured.latency;
  const o = measured.overall;
  const out: string[] = [];
  out.push(`## Measured (${SITE}/measured)`, "");

  out.push("### The deep run");
  out.push(
    `One dated snapshot, scored question by question: ${r.date}, artifact \`${r.artifact}\`, model ${r.model}, retrieval depth k=${r.k}, ${r.runsPerQuery} runs per question, ${o.totalRuns} runs in total. The machine was not recorded in this artifact (machine recording began 2026-09-17). Measured in-process by the eval harness, not through the ask page or chat.`,
    "",
  );
  out.push(
    `- Overall, across ${o.totalRuns} runs: correctness ${o.correctness}%, inline citation compliance ${o.citationCompliance}%, full retrieval recall ${o.fullRecall}%.`,
    `- Latency, warm: median ${l.warmMedianMs} ms across ${l.warmN} runs (mean ${l.warmMeanMs} ms). Cold first run: mean ${l.coldFirstRunMeanMs} ms across ${l.coldFirstRunN} runs. All runs: mean ${l.overallMeanMs} ms; fastest refusal ${l.fastestRefusalMs} ms; slowest ${l.slowestMs} ms.`,
    "",
  );
  out.push(`Per question (each N=${r.runsPerQuery}, ${r.date}):`, "");
  for (const q of measured.queryRows) {
    out.push(
      `- ${q.label}: correctness ${pct(q.correctness)}, refusal honesty ${pct(q.refusalHonesty)}, inline citation compliance ${pct(q.citationCompliance)}, manual recall ${pct(q.manualRecall)}, log recall ${pct(q.logRecall)}, mean latency ${q.avgLatencyMs} ms.`,
    );
  }
  out.push("");

  out.push("### What is failing, and who owns it");
  out.push(`Figures in this section are from the ${r.date} deep run above unless the row says otherwise.`, "");
  for (const g of measured.gaps) {
    out.push(`- **${g.title}** (${g.measured}): ${g.what} Owner: ${g.owner}.`);
  }
  out.push("");

  out.push("### The nightly run");
  const s = ledger.streak;
  out.push(
    `As of ${ledger.asOf}. Each night an unattended run is compared with the previous comparable run. The streak counts consecutive CLEAN comparison verdicts; nights with no artifact are skipped, so these are runs, not calendar nights. A non-CLEAN verdict is a break in the run, not necessarily a regression.`,
    "",
    `- Longest recent streak: ${s.count} consecutive clean comparisons, ${s.from} to ${s.to}. It ended on ${s.endedOn}.`,
    `- Since then: ${s.since.map((x) => `${x.date} ${x.verdict}`).join("; ")}.`,
    "",
    "Recent nights (date · machine · corpus fingerprint · verdict):",
    "",
  );
  for (const n of ledger.nights) {
    out.push(`- ${n.date} · ${n.body ?? "machine not recorded"} · ${n.corpus ?? "corpus not recorded"} · ${n.verdict ?? "no comparison"}`);
  }
  out.push("");

  out.push("### The contract a model must satisfy");
  out.push(
    "The standard is the measured contract, not the model. Each clause says what is required, how it is checked, and what counts as passing.",
    "",
  );
  for (const c of measured.contract) {
    out.push(`- **${c.name}.** ${c.requirement} How it is checked: ${c.check} The bar: ${c.bar}`);
  }
  out.push("");

  const rc = measured.recompute;
  out.push("### How to recompute any figure", "", rc.rule, "", rc.method, "", rc.decay, "");
  return out.join("\n");
}

function roadmapSection(): string {
  const g = roadmap.currentGate;
  const met = g.criteria.filter((c) => c.status === "met").length;
  const out: string[] = [`## Roadmap (${SITE}/roadmap)`, ""];
  out.push(`### Current: ${g.name}`, `${g.date}. ${met} of ${g.criteria.length} met.`, "", g.summary, "");
  for (const c of g.criteria) {
    out.push(`- [${c.status}] **${c.title}.** ${c.detail}${c.outstanding ? ` Still open: ${c.outstanding}` : ""}`);
  }
  out.push("", "### Gates already passed", "");
  for (const p of roadmap.pastGates) {
    out.push(`- **${p.name}** (${p.date}): ${p.line}${p.correction ? ` ${p.correction}` : ""}`);
  }
  for (const c of roadmap.pageCorrections) {
    out.push("", `Corrected ${c.date}: ${c.text}`);
  }
  out.push("", roadmap.cadence, "");
  return out.join("\n");
}

function layerSection(): string {
  return [
    `## The layer (${SITE}/)`,
    "",
    `- ${layer.brain.title}: ${layer.brain.note}`,
    `- ${layer.spine.title}: ${layer.spine.note} (${layer.cutLabel})`,
    ...layer.bodies.map((b) => `- Body, ${b.name}: ${b.note}`),
    `- ${layer.ruler.title}: ${layer.ruler.items.join(", ")}. It ${layer.ruler.microLabel}.`,
    `- ${layer.fidelity.affordance}: ${layer.fidelity.body}`,
    "",
    layer.caption,
    "",
  ].join("\n");
}

function devlogSection(posts: DevlogPost[]): string {
  const out: string[] = [`## Devlog (${SITE}/devlog)`, ""];
  for (const p of posts) {
    out.push(`### ${p.title} (${p.date})`, `${SITE}/devlog/${p.slug}`, "");
    if (p.ingest === "hold") {
      out.push(
        "Full text on the page only. A claim in this post is being re-checked, and text copied into other systems does not come back when we correct it.",
        "",
      );
      continue;
    }
    out.push(p.markdown.trim(), "");
  }
  return out.join("\n");
}

export function llmsFull(pages: PageRef[], posts: DevlogPost[], buildSha: string): string {
  return [
    "# Squaloo",
    "",
    `> ${SUMMARY}`,
    "",
    READING_NOTE,
    "",
    `Generated at build time from the site's own data${buildSha ? ` (commit ${buildSha})` : ""}. Pages whose text is not stored as data are listed with their summary; read them at their URL.`,
    "",
    "## Pages",
    "",
    ...pages.map((p) => `- [${p.title}](${SITE}${p.path}): ${p.description}`),
    "",
    layerSection(),
    measuredSection(),
    roadmapSection(),
    devlogSection(posts),
  ].join("\n");
}

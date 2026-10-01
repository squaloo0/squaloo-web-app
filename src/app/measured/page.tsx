import Link from "next/link";
import AppFooter from "@/components/AppFooter";
import { queryRows, latency, overall, run, gaps, contract, recompute } from "@/data/measured";
import { nights, streak, asOf as ledgerAsOf, latest, veteranFix } from "@/data/ledger";
import { getPostsByTag } from "@/lib/devlog";
import Wordmark from "@/components/Wordmark";

export const metadata = {
  title: "Measured — Squaloo",
  description:
    "Solomon's eval numbers, published as measured — including the ones that don't flatter us. Dated artifacts from the same harness that gates every model change.",
};

const GREEN = "#63a375";
const AMBER = "#d98c5f";

function secs(ms: number) {
  return `${(ms / 1000).toFixed(1)}s`;
}

/** Percentage cell. Colour is a hint; the number and its column label carry the meaning. */
function Pct({ value }: { value: number | null }) {
  if (value === null) {
    return <span className="text-neutral-700 font-mono text-sm">n/a</span>;
  }
  const color = value === 100 ? GREEN : value === 0 ? AMBER : "#ffffff";
  return (
    <span className="font-mono text-sm tabular-nums" style={{ color }}>
      {value}%
    </span>
  );
}

export default function MeasuredPage() {

  return (
    <div className="min-h-screen bg-[#08090a] text-white flex flex-col">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-900 bg-black/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-8 h-14 flex items-center justify-between">
          <Link href="/" className="group inline-flex items-center gap-1.5 text-neutral-600 text-xs tracking-widest uppercase font-mono hover:text-white transition-colors">
            ← <Wordmark className="h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
          </Link>
          <Link href="/solomon" className="text-neutral-500 text-xs tracking-widest uppercase font-mono hover:text-white transition-colors">
            Solomon →
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-8 pt-36 pb-24 flex-1 w-full">

        {/* Hero */}
        <section className="mb-20">
          <div className="text-xs text-neutral-500 font-mono tracking-[0.3em] uppercase mb-6">
            Measured
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-6 max-w-3xl">
            Our numbers, including the ones that don&apos;t flatter us.
          </h1>
          <p className="text-neutral-400 text-lg leading-relaxed max-w-2xl mb-6">
            Solomon is graded by an eval harness that runs scripted maintenance questions against the
            real corpus and scores the answers. The same harness gates every model change. This page
            publishes what it found, unedited.
          </p>
          <p className="text-neutral-400 text-lg leading-relaxed max-w-2xl mb-6">
            When this page first went up, our flagship demo question scored{" "}
            <span style={{ color: AMBER }} className="font-mono">0% correctness</span> — three times out
            of three — and we published the artifact anyway. It now scores{" "}
            <span style={{ color: GREEN }} className="font-mono">100%, {veteranFix.passes} of {veteranFix.scored} scored observations</span>,
            and the original row is still below with its date on it. A vendor who only shows you the good
            runs is showing you marketing; a vendor who deletes the bad ones once they are fixed is doing
            the same thing more slowly.
          </p>
          <p className="text-neutral-500 text-sm leading-relaxed max-w-2xl">
            Current as of <span className="text-neutral-300 font-mono">{ledgerAsOf}</span>. Latest nightly:{" "}
            <span className="text-neutral-300 font-mono">{latest.date}</span> on{" "}
            <span className="text-neutral-300 font-mono">{latest.body ?? "an unrecorded machine"}</span>
            {latest.verdict ? <> — <span className="text-neutral-300 font-mono">{latest.verdict}</span> against the night before.</> : "."}
          </p>
        </section>

        {/* ── WHAT IS UNDER TEST (consolidates the old run-metadata, speed and
             per-question sections, so results can be swapped in as they land) ── */}
        <section className="mb-10">
          <div className="flex items-baseline gap-4 mb-6 border-b border-neutral-800 pb-4">
            <h2 className="text-xs font-mono tracking-widest uppercase text-neutral-400">What is under test</h2>
            <div className="h-px flex-1 bg-neutral-800" />
            <span className="text-neutral-600 text-xs font-mono">as of {ledgerAsOf}</span>
          </div>
          <p className="text-neutral-400 text-sm leading-relaxed max-w-3xl mb-8">
            The ruler does not belong to a model. Any model we run goes through the same harness,
            unmodified, and is scored against the same contract. This section is the current state of
            that testing — it changes as models come through, and the figures below always name the
            run they came from. Each machine is measured against its own budget, not a fleet-wide one
            — a laptop and a credit-card-sized computer are not the same promise (amended 2026-09-27).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            <div className="border border-neutral-800 p-6">
              <div className="text-xs font-mono tracking-widest uppercase text-neutral-500 mb-2">Currently shipping</div>
              <div className="text-white text-base mb-2">{run.model}</div>
              <p className="text-neutral-400 text-sm leading-relaxed">
                The model behind every number on this page. Scored question by question below, from a
                single dated deep run.
              </p>
            </div>
            <div className="border border-neutral-800 p-6" style={{ borderColor: "#d98c5f55" }}>
              <div className="text-xs font-mono tracking-widest uppercase mb-2" style={{ color: "#d98c5f" }}>In testing now</div>
              <div className="text-white text-base mb-2">A second, unrelated open model</div>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Going through this harness with <span className="text-white">zero engine changes</span> —
                the experiment that could falsify our central claim. Scored on truth checks only; speed
                is reported but does not gate, because today&apos;s budgets were measured against
                today&apos;s model and would otherwise be marking their own homework.{" "}
                <span className="text-white">Results below — 2026-09-28. The binding held; it also showed us exactly where the coupling is.</span>
              </p>
            </div>
          </div>
        </section>

        {/* ── GD-2 · the pre-registered comparison, published pass and fail ── */}
        <section className="mb-32">
          <div className="flex items-baseline gap-4 mb-6 border-b border-neutral-800 pb-4">
            <h2 className="text-xs font-mono tracking-widest uppercase text-neutral-400">The same ruler, two models</h2>
            <div className="h-px flex-1 bg-neutral-800" />
            <span className="text-neutral-600 text-xs font-mono">2026-09-28</span>
          </div>

          {/* Boundaries go ABOVE the table. A reader who meets the numbers first
              has already drawn the wrong conclusion by the time a footnote
              corrects them. */}
          <div className="border-l-2 pl-6 py-1 mb-10 max-w-3xl" style={{ borderColor: AMBER }}>
            <div className="text-xs font-mono tracking-widest uppercase mb-3" style={{ color: AMBER }}>
              Read this before the numbers
            </div>
            <p className="text-neutral-300 text-base leading-relaxed mb-4">
              What is being tested is <span className="text-white">the harness as it ships, prompts
              included, given a second model</span> — not which model is better. The second model was
              handed Phi-3&apos;s chat scaffold <span className="text-white">verbatim</span>,
              including turn-markers it does not emit, because that is what &ldquo;runs on our harness
              unchanged&rdquo; actually means.
            </p>
            <p className="text-neutral-300 text-base leading-relaxed mb-4">
              <span className="text-white">Every gap below is evidence about the coupling, not about
              Qwen&apos;s capability.</span> Quoting these as &ldquo;Qwen is worse than Phi-3&rdquo;
              would state something this experiment did not test — in the direction that flatters the
              model we already ship.
            </p>
            <p className="text-neutral-300 text-base leading-relaxed">
              The symmetric reading is equally wrong: <span className="text-white">76% cannot be read as
              near-parity either.</span> Four points apart on correctness sits beside a refusal-honesty
              figure that went to zero. A model adapted to its own prompt format is a separate,
              labelled experiment. It has not been run.
            </p>
          </div>

          <div className="overflow-x-auto mb-8">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-500 font-mono text-xs uppercase tracking-widest">
                  <th className="text-left py-3 pr-4 font-normal">Metric</th>
                  <th className="text-left py-3 pr-4 font-normal">Phi-3 Mini (3.8B) — in production</th>
                  <th className="text-left py-3 font-normal">Qwen2.5-1.5B-Instruct</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {[
                  ["correctness", "80% (17/21)", "76% (16/21)", false],
                  ["citation compliance", "94% (17/18)", "85% (18/21)", false],
                  ["full recall", "50% (9/18)", "50% (9/18)", false],
                  ["refusal honesty", "100% (3/3)", "0% (0/3)", true],
                  ["veteran-fix leads", "66% (2/3)", "33% (1/3)", false],
                  ["mean latency", "16,105ms", "24,087ms", false],
                  ["answered when it should have refused", "0", "3", true],
                ].map(([m, a, b, flag]) => (
                  <tr key={m as string} className="border-b border-neutral-900">
                    <td className="py-3 pr-4 text-neutral-300">{m}</td>
                    <td className="py-3 pr-4 text-neutral-400">{a}</td>
                    <td className="py-3" style={{ color: flag ? AMBER : "#a3a3a3" }}>{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-8 max-w-3xl">
            <div>
              <div className="text-white text-base mb-2">Identical recall is the control, not a coincidence</div>
              <p className="text-neutral-400 text-sm leading-relaxed">
                50% on both. Retrieval runs <em>before</em> generation and does not depend on the model,
                so an identical figure is exactly what a correctly wired comparison must produce. Had it
                differed, the comparison itself would be suspect. It is the strongest single piece of
                evidence that the harness treated both models the same — the experiment proving its own
                wiring before you read anything else in the table.
              </p>
            </div>
            <div className="border-l-2 pl-5" style={{ borderColor: AMBER }}>
              <div className="text-white text-base mb-2">The finding that matters: refusal honesty went to zero</div>
              <p className="text-neutral-400 text-sm leading-relaxed mb-3">
                One question in the set has only one correct answer: a refusal. The production model
                refused cleanly, three times out of three. The second model said the refusal sentence
                and then kept going — restating the instruction it had just been given, followed by
                citation tags, until it hit the length cap.
              </p>
              <p className="text-neutral-400 text-sm leading-relaxed">
                The scorer marked that <span className="text-white">not a refusal</span>, and that is
                correct: a refusal requires the phrase <em>and</em> the absence of substance, because
                anything cited or enumerated is an answer however it hedges. Scoring it as a clean
                refusal would have been generous to the point of dishonesty — a technician reading it
                gets a wall of citations to a question we have no documentation for.
              </p>
            </div>
            <div>
              <div className="text-white text-base mb-2">The slower model is the smaller one, and that is the coupling with a stopwatch on it</div>
              <p className="text-neutral-400 text-sm leading-relaxed">
                A third of the parameters and 50% slower. The reason is length: a median answer of 1,169
                characters against 250, roughly 4.7× more text, with most generations ending mid-clause
                at the length cap.{" "}
                <span className="text-white">Cause (amended 2026-09-29): the prompt template.</span> This
                model was never put into its own template, so it had no reason to emit a stop marker. A
                paired test that fixed only the stop token returned byte-identical answers, 7 of 7.
              </p>
            </div>
            <div>
              <div className="text-white text-base mb-2">Eleven citations are marked unverified, and stay that way</div>
              <p className="text-neutral-400 text-sm leading-relaxed">
                The second model produced 11 rows carrying citations the run could not check against the
                corpus, against 4 for the production model. They are tagged
                <span className="text-white"> unverified</span> — our third citation tier, meaning
                neither confirmed nor refuted. That is a recorded observation,
                <span className="text-white"> not a finding that they were fabricated</span>, and it
                stays unverified here until a corpus check settles it. &ldquo;Unverified&rdquo; is a state
                we publish, not a gap to smooth over in either direction.
              </p>
            </div>
          </div>

          <div className="border border-neutral-800 p-6 mt-10 max-w-3xl">
            <div className="text-xs font-mono tracking-widest uppercase text-neutral-500 mb-3">How it was run</div>
            <p className="text-neutral-400 text-sm leading-relaxed">
              One sweep, both models, one artifact — <span className="text-white">zero engine changes and
              zero harness changes</span>. Same machine, because comparing across machines would confuse
              the model with the hardware. Same corpus by construction (one digest, 41 passages, 31
              documents), same sampling settings, same fixed seed chain, each model loaded sequentially
              in its own isolated container. Memory and speed budgets are reported but do not grade here:
              those constants were measured against the production model, so holding a different model to
              them would be marking our own homework.
            </p>
          </div>

          <p className="text-neutral-300 text-base leading-relaxed max-w-3xl mt-8">
            The verdict the experiment was pre-registered to answer:{" "}
            <span className="text-white">the harness bound a second model to the same measured contracts
            with no changes to the engine, the scorer, or the ruler — and reported the truth about what
            happened.</span> Where it held and where it broke were both measured, here, rather than
            discovered later on a stage.
          </p>
        </section>

        {/* The deep run — the dated snapshot the scorecard below describes */}
        <section className="mb-16 border border-neutral-800 p-6">
          <div className="text-xs font-mono tracking-widest uppercase text-neutral-500 mb-5">
            The deep run — the dated snapshot scored below
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
            {[
              ["Run date", run.date],
              ["Model", run.model],
              ["Retrieval depth", `k = ${run.k}`],
              ["Runs per question", `${run.runsPerQuery} (${overall.totalRuns} total)`],
            ].map(([label, value]) => (
              <div key={label}>
                <div className="text-neutral-600 text-xs font-mono tracking-widest uppercase mb-2">{label}</div>
                <div className="text-neutral-300 leading-snug">{value}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Headline metrics */}
        <section className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: `${overall.correctness}%`, label: "answers fully correct", tone: AMBER },
            { value: `${overall.citationCompliance}%`, label: "citations placed inline", tone: null },
            { value: `${overall.fullRecall}%`, label: "runs retrieving both sources", tone: AMBER },
            { value: secs(latency.warmMedianMs), label: "median warm response", tone: GREEN },
          ].map((m) => (
            <div key={m.label} className="border border-neutral-800 p-6">
              <div className="text-3xl font-bold font-mono mb-2 tabular-nums" style={{ color: m.tone ?? "#ffffff" }}>
                {m.value}
              </div>
              <p className="text-neutral-400 text-xs leading-relaxed">{m.label}</p>
            </div>
          ))}
        </section>
        <p className="text-neutral-600 text-xs leading-relaxed max-w-2xl mb-32">
          Two of these four are bad numbers. They are the first thing on the page on purpose.
        </p>

        {/* Latency */}
        <section className="mb-32">
          <div className="flex items-baseline gap-4 mb-10 border-b border-neutral-800 pb-4">
            <h2 className="text-xs font-mono tracking-widest uppercase text-neutral-400">The scorecard — speed</h2>
            <div className="h-px flex-1 bg-neutral-800" />
          </div>
          <p className="text-neutral-400 text-sm leading-relaxed max-w-2xl mb-10">
            A single average would mislead here, so here is the distribution. Each question&apos;s first
            run pays a cold-start cost — loading a multi-gigabyte model off disk. Every run after it is
            warm. Refusals are fastest of all, because when retrieval comes back empty the engine answers
            &ldquo;I don&apos;t have documentation for that&rdquo; without loading the model at all.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[
              {
                v: secs(latency.warmMedianMs),
                l: "Warm median",
                s: `${latency.warmN} runs — the number that matters in normal use`,
                tone: GREEN,
              },
              {
                v: secs(latency.coldFirstRunMeanMs),
                l: "Cold first run, mean",
                s: `${latency.coldFirstRunN} runs — one per question, model loading from disk`,
                tone: AMBER,
              },
              {
                v: secs(latency.overallMeanMs),
                l: "All runs, mean",
                s: `${overall.totalRuns} runs — inflated by the cold starts beside it`,
                tone: null,
              },
            ].map((x) => (
              <div key={x.l} className="border border-neutral-800 p-6">
                <div className="text-2xl font-bold font-mono mb-2 tabular-nums" style={{ color: x.tone ?? "#ffffff" }}>
                  {x.v}
                </div>
                <div className="text-white text-sm mb-2">{x.l}</div>
                <p className="text-neutral-500 text-xs leading-relaxed">{x.s}</p>
              </div>
            ))}
          </div>
          <p className="text-neutral-500 text-xs leading-relaxed max-w-2xl">
            The fastest run in the set was a refusal at {secs(latency.fastestRefusalMs)}; the slowest was
            a cold start at {secs(latency.slowestMs)}. We warm the engine before a demo — a real
            operational caveat, and not a number we get to quote as typical.
          </p>
        </section>

        {/* Per-question results */}
        <section className="mb-32">
          <div className="flex items-baseline gap-4 mb-10 border-b border-neutral-800 pb-4">
            <h2 className="text-xs font-mono tracking-widest uppercase text-neutral-400">The scorecard — every question</h2>
            <div className="h-px flex-1 bg-neutral-800" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[720px]">
              <thead>
                <tr className="border-b border-neutral-800">
                  {["Question", "Refusal honesty", "Inline citations", "Manual found", "Log found", "Correct", "Avg"].map(
                    (h, i) => (
                      <th
                        key={h}
                        className={`text-neutral-500 text-xs font-mono tracking-widest uppercase font-normal pb-3 ${
                          i === 0 ? "" : "text-right pl-4"
                        }`}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {queryRows.map((r) => (
                  <tr key={r.id} className="border-b border-neutral-900 hover:bg-neutral-900/40 transition-colors">
                    <td className="py-4 pr-4">
                      <div className="text-neutral-200 text-sm">{r.label}</div>
                      <div className="text-neutral-600 text-xs font-mono mt-1">{r.id}</div>
                    </td>
                    <td className="text-right pl-4"><Pct value={r.refusalHonesty} /></td>
                    <td className="text-right pl-4"><Pct value={r.citationCompliance} /></td>
                    <td className="text-right pl-4"><Pct value={r.manualRecall} /></td>
                    <td className="text-right pl-4"><Pct value={r.logRecall} /></td>
                    <td className="text-right pl-4"><Pct value={r.correctness} /></td>
                    <td className="text-right pl-4 font-mono text-sm text-neutral-400 tabular-nums">
                      {secs(r.avgLatencyMs)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-neutral-600 text-xs leading-relaxed max-w-3xl mt-6">
            Each question ran {run.runsPerQuery} times, so a single failure shows as 67% and two as 33%.
            &ldquo;Correct&rdquo; is all-or-nothing: the answer must include what it must include, exclude
            what it must not, and put lockout/tagout first where safety requires it.
          </p>
        </section>

        {/* Open gaps */}
        <section className="mb-32">
          <div className="flex items-baseline gap-4 mb-10 border-b border-neutral-800 pb-4">
            <h2 className="text-xs font-mono tracking-widest uppercase text-neutral-400">What is failing, and who owns it</h2>
            <div className="h-px flex-1 bg-neutral-800" />
          </div>
          <div className="space-y-0">
            {gaps.map((g) => (
              <div key={g.title} className="border-t border-neutral-800 py-8 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
                <div>
                  <div className="text-white text-sm mb-2">{g.title}</div>
                  <div className="font-mono text-xs mb-3" style={{ color: AMBER }}>{g.measured}</div>
                  <div className="text-neutral-600 text-xs font-mono tracking-wider uppercase">{g.owner}</div>
                </div>
                <p className="text-neutral-400 text-sm leading-relaxed max-w-2xl">{g.what}</p>
              </div>
            ))}
            <div className="border-t border-neutral-800" />
          </div>
          <p className="text-neutral-600 text-xs leading-relaxed max-w-2xl mt-6">
            Ticket identifiers are the durable reference for each fix. Our tracker is private, so these
            are labels rather than links — ask, and we will walk you through any of them.
          </p>
        </section>

        {/* ── THE RUN LEDGER (§2.2) ── */}
        <section className="mb-32">
          <div className="flex items-baseline gap-4 mb-6 border-b border-neutral-800 pb-4">
            <h2 className="text-xs font-mono tracking-widest uppercase text-neutral-400">The nightly run, night after night</h2>
            <div className="h-px flex-1 bg-neutral-800" />
            <span className="text-neutral-600 text-xs font-mono">as of {ledgerAsOf}</span>
          </div>
          <p className="text-neutral-400 text-sm leading-relaxed max-w-3xl mb-3">
            This page used to show one run and promise a trend. Here is the trend: every committed
            nightly artifact, its machine, and the verdict of comparing it against the night before.
          </p>
          <p className="text-neutral-300 text-sm leading-relaxed max-w-3xl mb-8">
            <span className="text-white">{streak.count} consecutive clean runs</span>, {streak.from} → {streak.to}.
            Two boundaries travel with that number and we will not drop them: the run before the streak
            could not be compared at all (a changed composition, not a regression), and one calendar
            night in the window has no artifact — so these are consecutive <em>runs</em>, not consecutive nights.
          </p>
          <div className="overflow-x-auto overflow-y-auto max-h-[28rem] border border-neutral-900">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-500 font-mono text-xs uppercase tracking-widest sticky top-0 bg-[#08090a]">
                  <th className="text-left py-3 pr-4 font-normal">Night</th>
                  <th className="text-left py-3 pr-4 font-normal">Machine</th>
                  <th className="text-left py-3 pr-4 font-normal">Vs. previous</th>
                  <th className="text-left py-3 font-normal">Same corpus</th>
                </tr>
              </thead>
              <tbody>
                {[...nights].reverse().map((n) => (
                  <tr key={n.date} className="border-b border-neutral-900">
                    <td className="py-3 pr-4 font-mono text-neutral-300 tabular-nums whitespace-nowrap">{n.date}</td>
                    <td className="py-3 pr-4 text-neutral-400 font-mono text-xs">{n.body ?? "not recorded"}</td>
                    <td className="py-3 pr-4 font-mono text-xs" style={{ color: n.verdict === "CLEAN" ? "#63a375" : n.verdict ? "#d98c5f" : "#737373" }}>
                      {n.verdict ?? "no comparison"}
                    </td>
                    <td className="py-3 text-neutral-500 font-mono text-xs">{n.corpus ? n.corpus.slice(0, 8) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-neutral-500 text-xs leading-relaxed max-w-3xl mt-5">
            &ldquo;Machine not recorded&rdquo; on the earliest rows is honest, not missing data: artifacts did not
            carry a machine identity until 2026-09-17. A blank corpus digest means the same — the field
            did not exist yet. We left those rows in rather than starting the table where it flatters us.
          </p>
        </section>

        {/* ── WRITTEN UP (pulls devlog posts tagged "measured") ── */}
        <section className="mb-32">
          <div className="flex items-baseline gap-4 mb-6 border-b border-neutral-800 pb-4">
            <h2 className="text-xs font-mono tracking-widest uppercase text-neutral-400">When the measurement caught something</h2>
            <div className="h-px flex-1 bg-neutral-800" />
          </div>
          <p className="text-neutral-400 text-sm leading-relaxed max-w-3xl mb-8">
            A number moving is not the interesting part. The interesting part is what the measurement
            caught that nobody else did — including when what it caught was us. These are written up
            in full, and new ones appear here as they are published.
          </p>
          <div className="space-y-0">
            {getPostsByTag("measured").map((post) => (
              <Link key={post.slug} href={`/devlog/${post.slug}`}
                    className="group border-t border-neutral-800 py-6 grid grid-cols-1 md:grid-cols-[110px_1fr] gap-5 hover:border-[#1400bf] transition-colors block">
                <div className="text-neutral-600 text-xs font-mono tabular-nums pt-1">{post.date}</div>
                <div>
                  <div className="text-white text-base mb-2 group-hover:text-[#5688c7] transition-colors">{post.title} →</div>
                  <p className="text-neutral-400 text-sm leading-relaxed max-w-2xl">{post.summary}</p>
                </div>
              </Link>
            ))}
            <div className="border-t border-neutral-800" />
          </div>
        </section>

        {/* Method */}
        <section className="mb-32">
          <div className="flex items-baseline gap-4 mb-10 border-b border-neutral-800 pb-4">
            <h2 className="text-xs font-mono tracking-widest uppercase text-neutral-400">How this is measured</h2>
            <div className="h-px flex-1 bg-neutral-800" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            {[
              [
                "The harness",
                "A script builds the engine image with the model baked in, seeds the demo corpus through the real ingestion pipeline, runs each scripted question N times in an isolated container, and writes a dated JSON artifact. It prints GO or NO-GO. By its own gate logic, that particular deep run was a NO-GO — the nightly ledger below records the verdict of every run since.",
              ],
              [
                "Correctness",
                "Keyword-based and strict: required content present, forbidden content absent, safety ordering respected. It does not judge prose quality. A partially right answer scores zero.",
              ],
              [
                "Refusal honesty",
                "Whether the engine refused exactly when it should have. Refusing a question it could answer counts as a failure, the same as answering one it could not.",
              ],
              [
                "Citations",
                "Every answer carries sources derived by the engine from the retrieved passages — the model cannot invent them, and an answer cannot ship without them. The percentage here measures something narrower: whether the model also placed those tags inline, beside the step they support.",
              ],
              [
                "Retrieval",
                "Whether the manual section and the veteran's log entry both surfaced for a question that needs both. Reported separately because they fail differently.",
              ],
              [
                "What is not here",
                "Everything in this block describes the deep run only — one dated snapshot, scored question by question. It is not the trend and not the current state: the nightly ledger below is the trend, and the comparison above is the current state. Artifacts now record the machine they ran on, so results can be read per body.",
              ],
            ].map(([h, b]) => (
              <div key={h}>
                <div className="text-white text-sm mb-3">{h}</div>
                <p className="text-neutral-400 text-sm leading-relaxed">{b}</p>
              </div>
            ))}
          </div>
        </section>

        {/* The contract — GD-3 */}
        <section className="mb-32">
          <div className="flex items-baseline gap-4 mb-6 border-b border-neutral-800 pb-4">
            <h2 className="text-xs font-mono tracking-widest uppercase text-neutral-400">The contract a model must satisfy</h2>
            <div className="h-px flex-1 bg-neutral-800" />
          </div>
          <p className="text-neutral-400 text-sm leading-relaxed max-w-2xl mb-10">
            People ask what standard we provide. This is it. The standard is the measured
            contract, not the model — any model we run is scored against these clauses by the same
            harness, unmodified. One that fails a clause does not ship, however well it reads.
            Each clause says how it is checked and what would count as failing it.
          </p>
          <div className="space-y-0">
            {contract.map((c, i) => (
              <div key={c.name} className="border-t border-neutral-800 py-8 grid grid-cols-1 md:grid-cols-[48px_1fr] gap-6">
                <div className="text-neutral-700 text-xs font-mono tabular-nums pt-1">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div>
                  <div className="text-white text-lg tracking-wide mb-3 max-w-2xl">{c.name}</div>
                  <p className="text-neutral-300 text-sm leading-relaxed max-w-2xl mb-4">{c.requirement}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 max-w-3xl">
                    <div>
                      <div className="text-neutral-500 text-xs font-mono tracking-widest uppercase mb-2">How it is checked</div>
                      <p className="text-neutral-400 text-sm leading-relaxed">{c.check}</p>
                    </div>
                    <div>
                      <div className="text-neutral-500 text-xs font-mono tracking-widest uppercase mb-2">The bar</div>
                      <p className="text-neutral-400 text-sm leading-relaxed">{c.bar}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="border-t border-neutral-800" />
          </div>
        </section>

        {/* How a number stays honest */}
        <section className="mb-32 border border-neutral-800 p-10">
          <div className="text-xs font-mono tracking-widest uppercase text-neutral-400 mb-6">
            How a number on this page stays honest
          </div>
          <p className="text-neutral-300 text-base leading-relaxed max-w-3xl mb-8">{recompute.rule}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 max-w-4xl">
            <div>
              <div className="text-white text-sm mb-3">Recomputing a figure yourself</div>
              <p className="text-neutral-400 text-sm leading-relaxed">{recompute.method}</p>
            </div>
            <div>
              <div className="text-white text-sm mb-3">Why figures carry a date</div>
              <p className="text-neutral-400 text-sm leading-relaxed">{recompute.decay}</p>
            </div>
          </div>
        </section>

        {/* Close */}
        <section className="border border-neutral-800 p-10">
          <div className="text-xs font-mono tracking-widest uppercase text-[#63a375] mb-4">Ask about a number</div>
          <p className="text-neutral-300 text-lg leading-relaxed max-w-3xl mb-8">
            Every figure on this page names the run it came from and the date it was true, and the
            method to recompute it is published above. If one of them does not add up, or you want to
            watch a run happen live on a machine with its network disconnected, ask — we answer
            questions about the data with the artifact attached.
          </p>
          <a
            href="mailto:marshal@squaloo.com?subject=Solomon%20%E2%80%94%20a%20question%20about%20the%20numbers"
            className="inline-block px-6 py-3 bg-[#1400bf] text-white text-sm font-medium tracking-wide hover:bg-[#5688c7] transition-colors"
          >
            marshal@squaloo.com
          </a>
        </section>
      </div>

      <AppFooter />
    </div>
  );
}

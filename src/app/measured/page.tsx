import Link from "next/link";
import AppFooter from "@/components/AppFooter";
import { queryRows, latency, overall, run, gaps, contract, recompute } from "@/data/measured";

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
  const schemaGap = gaps[gaps.length - 1];

  return (
    <div className="min-h-screen bg-[#08090a] text-white flex flex-col">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-900 bg-black/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-8 h-14 flex items-center justify-between">
          <Link href="/" className="text-neutral-600 text-xs tracking-widest uppercase font-mono hover:text-white transition-colors">
            ← Squaloo
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
          <p className="text-neutral-400 text-lg leading-relaxed max-w-2xl">
            On the run below, our flagship demo question scored{" "}
            <span style={{ color: AMBER }} className="font-mono">0% correctness</span> — three times out
            of three. We committed the artifact anyway, and the fix is in progress. That is the point of
            this page: a vendor who only shows you the good runs is showing you marketing.
          </p>
        </section>

        {/* Run metadata */}
        <section className="mb-16 border border-neutral-800 p-6">
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
            <h2 className="text-xs font-mono tracking-widest uppercase text-neutral-400">Speed, decomposed</h2>
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
            <h2 className="text-xs font-mono tracking-widest uppercase text-neutral-400">Every question, every metric</h2>
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
                "A script builds the engine image with the model baked in, seeds the demo corpus through the real ingestion pipeline, runs each scripted question N times in an isolated container, and writes a dated JSON artifact. It prints GO or NO-GO. By its own gate logic, the run on this page is a NO-GO.",
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
                `This artifact records the engine code path but not which machine it ran on, so results are not yet broken out per body — it is ${schemaGap.owner}. These numbers are a single dated run; as more artifacts land this page will carry the trend rather than a snapshot.`,
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
          <div className="text-xs font-mono tracking-widest uppercase text-[#63a375] mb-4">Why publish this</div>
          <p className="text-neutral-300 text-lg leading-relaxed max-w-3xl mb-8">
            Industrial AI is sold on demos rehearsed until they worked. We would rather show you the
            harness, the failing rows, and who owns each fix — and let you judge whether the numbers are moving.
            If you want to watch a run happen live, on a machine with its network disconnected,{" "}
            <span className="text-white">that can be arranged</span>.
          </p>
          <a
            href="mailto:admin@squaloo.com?subject=Solomon%20%E2%80%94%20the%20numbers"
            className="inline-block px-6 py-3 bg-[#1400bf] text-white text-sm font-medium tracking-wide hover:bg-[#5688c7] transition-colors"
          >
            Ask us about a number →
          </a>
        </section>
      </div>

      <AppFooter />
    </div>
  );
}

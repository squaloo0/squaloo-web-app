import Link from "next/link";
import { notFound } from "next/navigation";
import AppFooter from "@/components/AppFooter";
import Wordmark from "@/components/Wordmark";
import { snapshot } from "@/data/ruler_export";
import type { RulerSnapshot } from "@/data/ruler_export";
import { researchSearch } from "@/data/research_search";
import { searchSentence } from "@/lib/research_search";
import {
  assertBoundaries,
  corrections,
  countsByBody,
  currentScorer,
  hasRows,
  unexplained,
  wilson,
} from "@/lib/ruler_view";

/**
 * STAGED /measured: the Gate E rebuild as a view over the ruler export.
 *
 * Preview builds only. A production build returns 404, so nothing here is
 * public until the founder moves it to /measured. Structure and copy are real;
 * every number comes from `snapshot`, which is null until the nightly writer
 * exists, so today every data section shows its empty state. No example
 * figures are rendered, because a figure with no row behind it is exactly
 * what this page exists to refuse.
 */

export const metadata = {
  title: "Measured (staged) — Squaloo",
  description: "Staged rebuild of the measurements page as a view over the ruler export. Preview only.",
  robots: { index: false, follow: false },
};

const AMBER = "#d98c5f";

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-24 scroll-mt-24">
      <div className="flex items-baseline gap-4 mb-6 border-b border-neutral-800 pb-4">
        <h2 className="text-xs font-mono tracking-widest uppercase text-neutral-400">{title}</h2>
        <div className="h-px flex-1 bg-neutral-800" />
      </div>
      <div className="max-w-3xl space-y-4 text-neutral-400 text-sm leading-relaxed">{children}</div>
    </section>
  );
}

/** What a section says when the export has no rows for it. Said, never hidden. */
function NoRows({ what }: { what: string }) {
  return (
    <p className="pl-4 border-l-2 text-neutral-500" style={{ borderColor: AMBER }}>
      <span className="font-mono text-xs uppercase tracking-widest" style={{ color: AMBER }}>
        No rows yet —{" "}
      </span>
      {what} This section fills from the ruler export once the nightly writer produces it. Until then it
      shows nothing rather than an example.
    </p>
  );
}

export default function MeasuredStaged() {
  if (process.env.VERCEL_ENV === "production") {
    notFound();
  }

  const snap: RulerSnapshot | null = hasRows(snapshot) ? snapshot : null;
  const live = snap !== null;
  if (live) {
    // Build-time guard: a verdict without its boundary stops the build.
    assertBoundaries(snap.verdicts);
  }
  const scorer = live ? currentScorer(snap.verdicts) : null;
  const byBody = live && scorer ? countsByBody(snap.verdicts, scorer) : [];
  const fixes = live ? corrections(snap.verdicts) : [];
  const unexplainedCount = live ? unexplained(snap.comparisons).length : 0;

  return (
    <div className="min-h-screen bg-[#08090a] text-white flex flex-col">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-900 bg-black/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="group inline-flex items-center gap-1.5 text-neutral-600 text-xs tracking-widest uppercase font-mono hover:text-white transition-colors">
            ← <Wordmark className="h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
          </Link>
          <span className="text-xs font-mono tracking-widest uppercase" style={{ color: AMBER }}>
            Staged · preview only
          </span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 sm:px-8 pt-36 pb-24 flex-1 w-full">
        {/* 0 — lead */}
        <section className="mb-20">
          <div className="text-xs text-neutral-500 font-mono tracking-[0.3em] uppercase mb-6">Measured</div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-6 max-w-3xl">
            Our numbers, including the ones that don&apos;t flatter us.
          </h1>
          <p className="text-neutral-400 text-lg leading-relaxed max-w-2xl mb-4">
            Every figure on this page is a count over dated records from a published ruler: what an answer
            must do, checked the same way every time, with no model grading another model.{" "}
            {live
              ? "The records are exported, committed and linked below, so you can recompute anything here yourself."
              : "Once the records exist they are exported, committed and linked here, so you can recompute anything on this page yourself."}
          </p>
          <p className="text-neutral-500 text-sm font-mono">
            {live
              ? `Ruler ${snap.manifest.contract_version} (${snap.manifest.contract_status}) · export ${snap.manifest.exported_at} · sha256 ${snap.manifest.export_sha256.slice(0, 12)}…`
              : "No export yet. The ruler contract is written; the nightly writer that fills it is not."}
          </p>
        </section>

        {/* 1 — positioning */}
        <Section id="positioning" title="What this record shows">
          <p className="text-neutral-300">
            We have not found these demonstrated together in published work:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              an assistant measured unattended, night after night, on the edge hardware it ships on (
              <a href="#consistency" className="text-[#5688c7] hover:text-white">consistency</a>);
            </li>
            <li>
              held to each machine&apos;s own time and memory budget, with correct-but-slow reported as its own
              verdict (<a href="#predictability" className="text-[#5688c7] hover:text-white">predictability</a>);
            </li>
            <li>
              with its failures and corrections kept on the public record, dated (
              <a href="#corrections" className="text-[#5688c7] hover:text-white">corrections</a>);
            </li>
            <li>
              and scored without any model in the loop, so every scoring error can be re-run and found,
              including ours (<a href="#recompute" className="text-[#5688c7] hover:text-white">recompute it</a>).
            </li>
          </ul>
          <p className="text-neutral-400">
            Each of these appears somewhere on its own. We could not find the four together.
          </p>
          <p className="text-neutral-500">
            {searchSentence(researchSearch)} What these do not yet include: real plants, controller data, or
            customer deployments. Each property links to the rows that evidence it; a property with no rows
            yet says so in its section.
          </p>
          <details className="text-neutral-500 text-sm">
            <summary className="cursor-pointer hover:text-white">
              The {researchSearch.unread.length} collected papers not yet read
            </summary>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              {researchSearch.unread.map((u) => (
                <li key={u.id}>
                  <span className="font-mono">arXiv:{u.id}</span> · {u.title}
                </li>
              ))}
            </ul>
            <p className="mt-2">
              Two named sources are not in the collection at all: {researchSearch.not_collected.join("; ")}.
              These counts come from the pod&apos;s reading log ({researchSearch.source}), not from this page&apos;s text.
            </p>
          </details>
        </Section>

        {/* 2 — consistency */}
        <Section id="consistency" title="Consistency — the same question, asked again">
          <p>
            Each night the ruler asks a fixed set of questions on each machine and records every verdict.
            Results are counted within one scorer version at a time, and the version is named, because a rate
            computed across two different scorers is not a rate.
          </p>
          {live && scorer ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono border-collapse">
                <thead>
                  <tr className="text-neutral-500 border-b border-neutral-800">
                    <th className="text-left py-2 pr-4 font-normal">Machine</th>
                    <th className="text-left py-2 pr-4 font-normal">Scored runs</th>
                    <th className="text-left py-2 pr-4 font-normal">PASS (95% interval)</th>
                    <th className="text-left py-2 font-normal">Dates</th>
                  </tr>
                </thead>
                <tbody>
                  {byBody.map((b) => {
                    const pass = b.counts.PASS ?? 0;
                    const ci = wilson(pass, b.n);
                    return (
                      <tr key={b.body} className="border-b border-neutral-900">
                        <td className="py-2 pr-4">{b.body}</td>
                        <td className="py-2 pr-4">{b.n}</td>
                        <td className="py-2 pr-4">
                          {pass}/{b.n}
                          {ci ? ` (${(ci[0] * 100).toFixed(0)}–${(ci[1] * 100).toFixed(0)}%)` : ""}
                        </td>
                        <td className="py-2">
                          {b.from.slice(0, 10)} → {b.to.slice(0, 10)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p className="text-neutral-600 text-xs mt-2">Scorer version {scorer}. Superseded verdicts are excluded.</p>
            </div>
          ) : (
            <NoRows what="Nightly verdicts per machine, with how many runs each figure covers and its interval." />
          )}
          <p>
            Comparisons between nights must say why when they could not run.
            {live ? ` Unexplained comparisons in this export: ${unexplainedCount}.` : ""}
          </p>
        </Section>

        {/* 3 — robustness */}
        <Section id="robustness" title="Robustness — the same conflict, asked many ways">
          <p>
            Scenarios where two sources disagree, reworded, reordered and repeated, each scored by the same
            rule. This is where the first robustness number will be published, with how many scenarios, how
            many repeats, and the limits of what it covers.
          </p>
          <NoRows what="Scored conflict scenarios. They start once the corpus they draw on passes its acceptance checks and the rebuilt scorer is in place." />
        </Section>

        {/* 4 — predictability */}
        <Section id="predictability" title="Predictability — inside the machine's budget">
          <p>
            Each machine has its own time budget. A correct answer over budget is its own verdict, never a
            pass. Every figure here names the machine it was measured on.
          </p>
          {live ? (
            <p>
              Over-budget verdicts in the current scorer version:{" "}
              {byBody.map((b) => `${b.body} ${b.counts.WARN_LATENCY ?? 0}/${b.n}`).join(" · ")}.
            </p>
          ) : (
            <NoRows what="Per-machine latency verdicts against each machine's declared budget." />
          )}
        </Section>

        {/* 5 — safety */}
        <Section id="safety" title="Safety — the checks that stop an answer">
          <p>
            Safety steps come first and cannot be reordered by any other source. Each automatic check that can
            stop an answer is listed with the rule it enforces and the test that shows it fires.
          </p>
          {live ? (
            <p>
              Safety intercepts in the current scorer version:{" "}
              {byBody.map((b) => `${b.body} ${b.counts.SAFETY_INTERCEPT ?? 0}/${b.n}`).join(" · ")}.
            </p>
          ) : (
            <NoRows what="Safety-ordering verdicts and the automatic checks, each with its firing test." />
          )}
        </Section>

        {/* 6 — the contract */}
        <Section id="contract" title="The contract a model must satisfy">
          <p>
            The standard is the measured contract, not the model. Each rule here is read from the contract file
            itself: what it requires, what it emits, and how severe a violation is. Thresholds still awaiting a
            decision are shown as undecided, never filled with a guess.
          </p>
          {live ? (
            <ul className="space-y-1 font-mono text-xs">
              {snap.rules.map((r) => (
                <li key={r.rule_id}>
                  {r.rule_id} · {r.component} · {r.severity_tier}
                  {r.body_scope ? ` · ${r.body_scope}` : ""} → {Array.isArray(r.emits) ? r.emits.join(", ") : r.emits}
                </li>
              ))}
            </ul>
          ) : (
            <NoRows what="The contract's rules, read from the exported contract version." />
          )}
        </Section>

        {/* 7 — not measured */}
        <Section id="not-measured" title="What we deliberately do not measure">
          <p>
            Every check on this page is deterministic: a rule a script applies the same way every time. That is
            a choice, and it has a cost. Here is what it leaves out, so you don&apos;t read our numbers as covering
            it.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <span className="text-neutral-200">Prose quality.</span> We score whether required content is
              present, forbidden content absent, and safety steps first. A clear, wrong answer fails; a clumsy,
              right one passes.
            </li>
            <li>
              <span className="text-neutral-200">Agreement by another model.</span> No language model grades our
              answers. The cost: anything a rule cannot express goes unmeasured.
            </li>
            <li>
              <span className="text-neutral-200">Whether a cited source supports the sentence beside it.</span> We
              check that sources are attached, derived by the engine, and placed. Checking that each sentence
              follows from its source is planned, not running.
            </li>
            <li>
              <span className="text-neutral-200">Correct values beyond the documents.</span> A number in an answer
              is checked against the retrieved text only where a rule names it.
            </li>
            <li>
              <span className="text-neutral-200">Multi-step procedures as a sequence.</span> We check that the
              safety step comes first, not yet that every step follows its prerequisite.
            </li>
            <li>
              <span className="text-neutral-200">Correctness in other words.</span> A right answer phrased
              differently from what we expected can fail our check. A correctness figure here is a floor on the
              answers we expected, not a ceiling on the ones we didn&apos;t.
            </li>
            <li>
              <span className="text-neutral-200">How confident Solomon is.</span> Solomon does not report a
              confidence score, and we do not measure whether one would be honest.
            </li>
            <li>
              <span className="text-neutral-200">Real plants.</span> Our test scenarios are written or
              synthesised for testing. No figure here comes from a customer&apos;s machine.
            </li>
          </ul>
        </Section>

        {/* 8 — corrections */}
        <Section id="corrections" title="Corrections">
          <p>
            A correction is a new dated record that supersedes the old one, with its reason. The old record is
            never edited or deleted. Nothing is counted twice.
          </p>
          {live ? (
            fixes.length ? (
              <ul className="space-y-2">
                {fixes.map((f) => (
                  <li key={f.verdict_uuid} className="font-mono text-xs">
                    {f.created_at.slice(0, 10)} · supersedes {f.supersedes} · {f.supersede_reason}
                  </li>
                ))}
              </ul>
            ) : (
              <p>None in this export.</p>
            )
          ) : (
            <NoRows what="Superseding records, each with its date and reason." />
          )}
        </Section>

        {/* 9 — recompute */}
        <Section id="recompute" title="Recompute it yourself">
          <p>
            Download the export, check its sha256 against the one printed at the top of this page, and count.
            The counting is the code that builds this page; it is published with the site, so the method you
            run is the method we ran.
          </p>
          {!live ? <NoRows what="The export file and its fingerprint." /> : null}
        </Section>
      </div>

      <AppFooter />
    </div>
  );
}

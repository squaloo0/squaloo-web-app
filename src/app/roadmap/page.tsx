import Link from "next/link";
import AppFooter from "@/components/AppFooter";
import { currentGate, pastGates, pageCorrections, cadence, type CriterionStatus } from "@/data/roadmap";
import Wordmark from "@/components/Wordmark";

export const metadata = {
  title: "Roadmap — Squaloo",
  description:
    "What we're proving next, in plain language, with an honest status against each promise. The forward-looking half of the receipts.",
};

const GREEN = "#63a375";
const AMBER = "#d98c5f";

// Status is stated in words as well as colour — the page has to read correctly
// in a screenshot, in monochrome, and to a colour-blind reader.
const STATUS_LABEL: Record<CriterionStatus, string> = {
  met: "met",
  "in-progress": "in progress",
  open: "not started",
};

function statusColor(s: CriterionStatus): string {
  if (s === "met") return GREEN;
  if (s === "in-progress") return AMBER;
  return "rgba(255,255,255,0.45)";
}

export default function RoadmapPage() {
  const met = currentGate.criteria.filter((c) => c.status === "met").length;
  const total = currentGate.criteria.length;

  return (
    <div className="min-h-screen bg-[#08090a] text-white flex flex-col">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-900 bg-black/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-8 h-14 flex items-center justify-between">
          <Link href="/" className="group inline-flex items-center gap-1.5 text-neutral-600 text-xs tracking-widest uppercase font-mono hover:text-white transition-colors">
            ← <Wordmark className="h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/measured" className="text-neutral-500 text-xs tracking-widest uppercase font-mono hover:text-white transition-colors">Measured</Link>
            <Link href="/devlog" className="text-neutral-500 text-xs tracking-widest uppercase font-mono hover:text-white transition-colors">Devlog</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-8 pt-36 pb-24 flex-1 w-full">
        {/* Hero */}
        <section className="mb-20">
          <div className="text-xs text-neutral-500 font-mono tracking-[0.3em] uppercase mb-6">Roadmap</div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-6 max-w-3xl">
            What we&apos;re proving next.
          </h1>
          <p className="text-neutral-400 text-lg leading-relaxed max-w-2xl mb-6">
            Solomon only earns the word &ldquo;verification&rdquo; if we apply it to ourselves, so we work
            in gates: a named set of promises, a date, and a pass where each one either holds or
            doesn&apos;t. This page is the current gate, in plain language, with an honest status on
            every line — including the lines that are not met.
          </p>
          <p className="text-neutral-400 text-lg leading-relaxed max-w-2xl">
            It is the forward half of the same two questions Solomon has to answer for a technician:{" "}
            <span className="text-white">how do you know</span>, and{" "}
            <span className="text-white">what did you check</span>. The{" "}
            <Link href="/measured" className="text-[#5688c7] hover:text-white transition-colors">measurements page</Link>{" "}
            answers the first for work already done. This page answers the second in advance — here is
            what we said we would check, and how far along it is. Publishing it before the date is the
            point; a roadmap you only see after everything worked is not accountability.
          </p>
        </section>

        {/* Current gate */}
        <section className="mb-32">
          <div className="flex items-baseline gap-4 mb-6 border-b border-neutral-800 pb-4">
            <h2 className="text-xs font-mono tracking-widest uppercase text-neutral-400">
              Current — {currentGate.name}
            </h2>
            <div className="h-px flex-1 bg-neutral-800" />
            <span className="text-neutral-600 text-xs font-mono tabular-nums">
              {met} of {total} met
            </span>
          </div>

          <p className="text-neutral-400 text-sm leading-relaxed max-w-2xl mb-3">{currentGate.summary}</p>
          <p className="text-neutral-600 text-xs font-mono tracking-widest uppercase mb-10">{currentGate.date}</p>

          <div className="space-y-0">
            {currentGate.criteria.map((c, i) => (
              <div
                key={c.title}
                className="border-t border-neutral-800 py-8 grid grid-cols-1 md:grid-cols-[130px_1fr] gap-6"
              >
                <div>
                  <div className="text-neutral-700 text-xs font-mono tabular-nums mb-2">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <span
                    className="text-xs font-mono tracking-widest uppercase"
                    style={{ color: statusColor(c.status) }}
                  >
                    {STATUS_LABEL[c.status]}
                  </span>
                </div>
                <div>
                  <div className="text-white text-lg tracking-wide mb-2 max-w-2xl">{c.title}</div>
                  <p className="text-neutral-400 text-sm leading-relaxed max-w-2xl">{c.detail}</p>
                  {c.outstanding ? (
                    <p
                      className="text-sm leading-relaxed max-w-2xl mt-3 pl-4 border-l-2"
                      style={{ borderColor: AMBER, color: "rgba(255,255,255,0.62)" }}
                    >
                      <span className="font-mono text-xs uppercase tracking-widest" style={{ color: AMBER }}>
                        Still open —{" "}
                      </span>
                      {c.outstanding}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
            <div className="border-t border-neutral-800" />
          </div>

          <p className="text-neutral-600 text-xs leading-relaxed max-w-2xl mt-6">{cadence}</p>
          {pageCorrections.map((c) => (
            <p
              key={c.date}
              className="text-sm leading-relaxed max-w-2xl mt-6 pl-4 border-l-2"
              style={{ borderColor: AMBER, color: "rgba(255,255,255,0.62)" }}
            >
              <span className="font-mono text-xs uppercase tracking-widest" style={{ color: AMBER }}>
                Corrected {c.date} —{" "}
              </span>
              {c.text}
            </p>
          ))}
        </section>

        {/* Track record */}
        <section className="mb-32">
          <div className="flex items-baseline gap-4 mb-10 border-b border-neutral-800 pb-4">
            <h2 className="text-xs font-mono tracking-widest uppercase text-neutral-400">Gates already passed</h2>
            <div className="h-px flex-1 bg-neutral-800" />
          </div>
          <div className="space-y-0">
            {pastGates.map((g) => (
              <div key={g.name} className="border-t border-neutral-800 py-8 grid grid-cols-1 md:grid-cols-[160px_1fr] gap-6">
                <div>
                  <div className="text-white text-sm mb-1">{g.name}</div>
                  <div className="text-neutral-600 text-xs font-mono tracking-widest uppercase">{g.date}</div>
                </div>
                <div>
                  <p className="text-neutral-400 text-sm leading-relaxed max-w-2xl">{g.line}</p>
                  {g.correction ? (
                    <p
                      className="text-sm leading-relaxed max-w-2xl mt-3 pl-4 border-l-2"
                      style={{ borderColor: AMBER, color: "rgba(255,255,255,0.62)" }}
                    >
                      {g.correction}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
            <div className="border-t border-neutral-800" />
          </div>
        </section>

        {/* Close */}
        <section className="border border-neutral-800 p-10">
          <div className="text-xs font-mono tracking-widest uppercase text-[#63a375] mb-4">Why publish this</div>
          <p className="text-neutral-300 text-lg leading-relaxed max-w-3xl mb-8">
            A roadmap is easy to write and easy to quietly revise. Ours sits next to the numbers,
            carries a date, and says which promises are only partly kept — so the next version can be
            checked against this one. A gate closes here only when the evidence for it exists on the
            measurements page, not when we decide it feels done. If a line stops moving, that is a
            fair question to put to us.
          </p>
          <a
            href="mailto:marshal@squaloo.com?subject=Squaloo%20%E2%80%94%20roadmap"
            className="inline-block px-6 py-3 bg-[#1400bf] text-white text-sm font-medium tracking-wide hover:bg-[#5688c7] transition-colors"
          >
            Ask us about a line →
          </a>
        </section>
      </div>

      <AppFooter />
    </div>
  );
}

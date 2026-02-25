import Link from "next/link";

const theses = [
  {
    stat: "$2.3M/hr",
    label: "Equipment Downtime Cost",
    detail:
      "The average cost of unplanned industrial equipment downtime. This is not a software problem. It is a sovereignty problem.",
  },
  {
    stat: "40%",
    label: "Competency Collapse",
    detail:
      "Of skilled industrial workers are projected to retire within the decade. The knowledge walks out the door with them.",
  },
  {
    stat: "0ms",
    label: "Cloud Latency Tolerance",
    detail:
      "On a factory floor or an active jobsite, network dependency is a liability. AI that can't function offline can't function in the physical world.",
  },
];

const rdEntries = [
  {
    date: "2025 — Ongoing",
    tag: "Architecture",
    title: "The Sovereign Data Lakehouse",
    description:
      "PostgreSQL/PgVector stack benchmarked at 3.7ms retrieval. Designed for air-gapped, edge-first deployment. No cloud dependency.",
  },
  {
    date: "2025 — Ongoing",
    tag: "Protocol",
    title: "One Brain, Two Bodies",
    description:
      "A distributed AI protocol where a central model orchestrates two specialized execution agents — one for data ingestion, one for output and action. Designed to run on commodity hardware.",
  },
  {
    date: "2025",
    tag: "Grant",
    title: "USC Iovine and Young Academy",
    description:
      "Pursuing MSIDBT with a research track focused on human-centered AI systems for non-desk workforces. Grant milestone updates documented in the R&D Log.",
  },
];

export default function AmakStudiosPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-900 bg-black/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-8 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="text-neutral-600 text-xs tracking-widest uppercase font-mono hover:text-white transition-colors"
          >
            ← Terminal
          </Link>
          <div className="flex items-center gap-8">
            <a href="#thesis" className="text-neutral-500 text-xs tracking-widest uppercase hover:text-white transition-colors">
              Thesis
            </a>
            <a href="#rd-log" className="text-neutral-500 text-xs tracking-widest uppercase hover:text-white transition-colors">
              R&D Log
            </a>
            <Link href="/amak-studios/blog" className="text-neutral-500 text-xs tracking-widest uppercase hover:text-white transition-colors">
              Journal
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-8 pt-32 pb-24">

        {/* ── MANIFESTO HEADER ── */}
        <section className="mb-24">
          <div className="text-xs text-neutral-600 font-mono tracking-widest uppercase mb-6">
            #003 / Amak-Studios
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-6 max-w-3xl">
            The cloud won&apos;t save{" "}
            <span className="text-neutral-500">the physical world.</span>
          </h1>

          <p className="text-neutral-400 text-base leading-relaxed max-w-2xl">
            Amak Studios is a venture studio with one thesis: the most consequential
            AI systems of the next decade will not live in a data center. They will
            live on a factory floor, a jobsite, a loading dock — running sovereign,
            offline-first, and without permission from a server farm.
          </p>
        </section>

        {/* ── THE NEW COLLAR THESIS ── */}
        <section id="thesis" className="mb-24">
          <div className="flex items-baseline gap-4 mb-10 border-b border-neutral-900 pb-4">
            <h2 className="text-xs font-mono tracking-widest uppercase text-neutral-500">
              The New Collar Thesis
            </h2>
            <div className="h-px flex-1 bg-neutral-900" />
          </div>

          {/* Manifesto body */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8 mb-16 max-w-4xl">
            <div className="space-y-5 text-neutral-400 text-sm leading-relaxed">
              <p>
                There is a class of worker that cloud-first AI has never been designed
                for. They do not sit at desks. They do not have reliable internet
                connections. They operate machinery worth millions of dollars, make
                split-second decisions, and carry decades of institutional knowledge
                in their hands and in their heads.
              </p>
              <p>
                We call them the <strong className="text-white">New Collar</strong> workforce. And they are
                being left behind by an AI industry obsessed with chat interfaces and
                quarterly SaaS metrics.
              </p>
            </div>
            <div className="space-y-5 text-neutral-400 text-sm leading-relaxed">
              <p>
                The industrial sector faces a compounding crisis: equipment downtime
                costs billions, institutional knowledge is retiring faster than it
                can be documented, and the tools being offered as solutions require
                cloud connectivity, data-sharing agreements, and subscription fees
                that erode margins on already thin operations.
              </p>
              <p>
                Amak Studios is building the alternative. Sovereign AI that runs
                locally. That owns its own data. That functions at zero latency
                because it has to.
              </p>
            </div>
          </div>

          {/* Thesis stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            {theses.map((t, i) => (
              <div
                key={i}
                className="border border-neutral-900 p-6 hover:border-neutral-700 transition-colors"
              >
                <div className="text-3xl font-bold text-white mb-1 font-mono">
                  {t.stat}
                </div>
                <div className="text-xs font-mono tracking-widest uppercase text-neutral-600 mb-3">
                  {t.label}
                </div>
                <p className="text-neutral-500 text-xs leading-relaxed">
                  {t.detail}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── R&D LOG ── */}
        <section id="rd-log" className="mb-24">
          <div className="flex items-baseline gap-4 mb-10 border-b border-neutral-900 pb-4">
            <h2 className="text-xs font-mono tracking-widest uppercase text-neutral-500">
              R&D Log
            </h2>
            <div className="h-px flex-1 bg-neutral-900" />
            <Link
              href="/amak-studios/blog"
              className="text-xs font-mono tracking-widest uppercase text-neutral-600 hover:text-white transition-colors"
            >
              Full Journal →
            </Link>
          </div>

          <div className="space-y-0">
            {rdEntries.map((entry, i) => (
              <div
                key={i}
                className="border-t border-neutral-900 py-7 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-6 hover:border-neutral-700 transition-colors"
              >
                <div>
                  <div className="text-xs font-mono text-neutral-700 mb-1">
                    {entry.date}
                  </div>
                  <span className="text-xs font-mono tracking-widest uppercase text-neutral-600 border border-neutral-800 px-2 py-0.5">
                    {entry.tag}
                  </span>
                </div>
                <div>
                  <h3 className="text-white text-sm font-medium mb-2">
                    {entry.title}
                  </h3>
                  <p className="text-neutral-500 text-sm leading-relaxed">
                    {entry.description}
                  </p>
                </div>
              </div>
            ))}
            <div className="border-t border-neutral-900" />
          </div>
        </section>

        {/* ── FOOTER NAV ── */}
        <div className="flex justify-between items-center pt-8 border-t border-neutral-900">
          <Link
            href="/marshal"
            className="text-neutral-600 text-xs font-mono tracking-widest uppercase hover:text-white transition-colors"
          >
            ← The-Architect
          </Link>
          <Link
            href="/"
            className="text-neutral-600 text-xs font-mono tracking-widest uppercase hover:text-white transition-colors"
          >
            Terminal →
          </Link>
        </div>

      </div>
    </div>
  );
}

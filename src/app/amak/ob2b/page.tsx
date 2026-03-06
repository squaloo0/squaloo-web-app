import Link from "next/link";
import MilestoneTracker from "@/components/MilestoneTracker";
import AppFooter from "@/components/AppFooter";

export const metadata = {
  title: "One Brain, Two Bodies Protocol — Amak",
  description:
    "How the OB2B Protocol works: a decentralized AI architecture built for sovereign, edge-first intelligence.",
};

export default function OB2BPage() {
  return (
    <div className="min-h-screen bg-[#08090a] text-white font-sans flex flex-col">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-800 bg-[#08090a]/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-8 h-14 flex items-center justify-between">
          <Link
            href="/amak"
            className="text-neutral-500 text-xs tracking-widest uppercase font-mono hover:text-white transition-colors"
          >
            ← Amak
          </Link>
          <Link
            href="/"
            className="text-neutral-500 text-xs tracking-widest uppercase font-mono hover:text-white transition-colors"
          >
            Terminal
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-8 pt-32 pb-24 flex-1">

        {/* ── HEADER ── */}
        <section className="mb-20">
          <div className="text-xs text-neutral-500 font-mono tracking-widest uppercase mb-6">
            Amak / Protocol
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-6 max-w-3xl">
            One Brain,{" "}
            <span className="text-[#5688c7]">Two Bodies.</span>
          </h1>
          <p className="text-neutral-400 text-base leading-relaxed max-w-2xl">
            The OB2B Protocol is the architectural backbone behind Amak — a distributed AI
            schema that rejects centralized cloud dependency in favor of sovereign,
            edge-first intelligence. Two execution environments. One unified brain.
          </p>
        </section>

        {/* ── PROTOCOL BREAKDOWN ── */}
        <section className="mb-20">
          <div className="flex items-baseline gap-4 mb-10 border-b border-neutral-800 pb-4">
            <h2 className="text-xs font-mono tracking-widest uppercase text-neutral-400">
              How It Works
            </h2>
            <div className="h-px flex-1 bg-neutral-800" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">

            {/* The Two Bodies */}
            <div className="border border-neutral-800 p-6 hover:border-[#5688c7]/50 transition-colors">
              <div className="text-xs font-mono tracking-widest uppercase text-[#5688c7] mb-4">
                The Two Bodies — The Edge
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-white text-sm font-medium mb-1">Project G</div>
                  <p className="text-neutral-400 text-xs leading-relaxed">
                    The physical edge device. A pocket-sized AI companion that runs entirely
                    offline — housing its own local Postgres + pgvector database, voice I/O,
                    and a gamified physical interface.
                  </p>
                </div>
                <div className="border-t border-neutral-800 pt-4">
                  <div className="text-white text-sm font-medium mb-1">OsH (Web Interface)</div>
                  <p className="text-neutral-400 text-xs leading-relaxed">
                    The web-facing body. Handles user-facing interactions and file submissions
                    from the browser, feeding data into the One Brain.
                  </p>
                </div>
              </div>
            </div>

            {/* The One Brain */}
            <div className="border border-[#1400bf]/40 p-6 hover:border-[#1400bf]/70 transition-colors">
              <div className="text-xs font-mono tracking-widest uppercase text-[#1400bf] mb-4">
                The One Brain — The Core
              </div>
              <p className="text-neutral-400 text-sm leading-relaxed">
                The centralized intelligence layer. Handles file submission from edge devices,
                stores objects in the Sovereign Data Lakehouse (Azure Blob + Supabase pgvector),
                and serves AI-powered, context-aware retrieval back to whichever body requests it.
              </p>
              <div className="mt-4 pt-4 border-t border-neutral-800 space-y-2">
                {["Asynchronous data ingestion", "Hybrid semantic + keyword search", "Differential syncing via SHA-256", "Secure edge bridging via Cloudflare Tunnel"].map((item) => (
                  <div key={item} className="flex items-start gap-2 text-xs text-neutral-400">
                    <span className="text-[#63a375] mt-px">✓</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Team overview quote */}
          <div className="bg-neutral-900/40 border border-neutral-800 p-6 max-w-3xl">
            <div className="text-xs font-mono tracking-widest uppercase text-neutral-500 mb-1">
              Team Description
            </div>
            <div className="text-xs font-mono text-neutral-600 mb-4">
              CSCI 401 / Project 42 — Deliverable 1, Jan 25, 2026
            </div>
            <blockquote className="text-neutral-300 text-sm leading-relaxed italic">
              &ldquo;An agentic AI platform for accelerated file uploads and retrieval using AI
              agents. Our schema is characterized as One Brain, Two Bodies protocol — the two
              bodies refer to the edge machines and the web interface; the brain handles file
              submission, storage, and AI-powered context-aware retrieval. Deployable to edge
              devices to offer users ownership of computing power and AI models, rejecting the
              traditional centralized model dependency.&rdquo;
            </blockquote>
          </div>
        </section>

        {/* ── BUILD TEAM ── */}
        <section className="mb-20">
          <div className="flex items-baseline gap-4 mb-10 border-b border-neutral-800 pb-4">
            <h2 className="text-xs font-mono tracking-widest uppercase text-neutral-400">
              Build Team
            </h2>
            <div className="h-px flex-1 bg-neutral-800" />
          </div>

          <div className="max-w-3xl space-y-6">
            <p className="text-neutral-400 text-sm leading-relaxed">
              The OB2B Protocol and Sovereign Data Lakehouse are being built by a team of six
              USC Viterbi School of Engineering undergraduates as part of{" "}
              <span className="text-neutral-300">CSCI 401</span> — the department&apos;s
              capstone course. Amak&apos;s proposal was selected by the students as Project 42.
              The team is advised by a graduate mentor with experience as a lead engineer at AI
              startups.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {["Steven Gao", "Justin Liu", "Steven Shi", "Haipeng Wu", "Charlotte Zou", "Xinyang Xu"].map((name) => (
                <div key={name} className="border border-neutral-800 px-3 py-2 font-mono text-xs text-neutral-300">
                  {name}
                </div>
              ))}
            </div>

            <p className="text-neutral-400 text-sm leading-relaxed">
              The team operates on a bi-weekly sprint cadence, submitting deliverable reports
              every other Sunday. All architectural decisions, system requirements, and design
              specifications originate from Marshal as primary stakeholder and systems designer —
              while the engineering team maintains full autonomy over implementation, including
              internal code review. Proposed changes to architecture or system design are vetted
              at the stakeholder level before adoption.
            </p>
          </div>
        </section>

        {/* ── MILESTONE TRACKER ── */}
        <section className="mb-20">
          <div className="flex items-baseline gap-4 mb-10 border-b border-neutral-800 pb-4">
            <h2 className="text-xs font-mono tracking-widest uppercase text-neutral-400">
              Build Progress
            </h2>
            <div className="h-px flex-1 bg-neutral-800" />
          </div>

          <MilestoneTracker />

          <div className="mt-8">
            <Link
              href="/amak/blog/amak"
              className="inline-flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-[#5688c7] hover:text-white transition-colors border border-[#5688c7]/40 hover:border-white px-4 py-2"
            >
              Full R&D Log →
            </Link>
          </div>
        </section>

        {/* ── FOOTER NAV ── */}
        <div className="flex justify-between items-center pt-8 border-t border-neutral-800">
          <Link
            href="/amak"
            className="text-neutral-500 text-xs font-mono tracking-widest uppercase hover:text-white transition-colors"
          >
            ← Amak
          </Link>
          <Link
            href="/amak/blog"
            className="text-neutral-500 text-xs font-mono tracking-widest uppercase hover:text-white transition-colors"
          >
            R&D Log →
          </Link>
        </div>

      </div>

      <AppFooter />
    </div>
  );
}

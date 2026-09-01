import Link from "next/link";
import AppFooter from "@/components/AppFooter";

export const metadata = {
  title: "The Build — Squaloo",
  description:
    "How one founder, a USC capstone team, and four AI engineering agents shipped a working offline AI system — 42 reviewed pull requests in four days.",
};

const timeline = [
  {
    date: "JAN — MAY 2026",
    title: "The foundation — USC CSCI 401, Project 42",
    text: "A six-person USC computer science capstone team, recruited and directed by the founder, built the data layer across a full semester: cloud ingestion on Azure Functions, hybrid vector search on PostgreSQL/pgvector, and the first edge sync pipeline. Seven deliverables, a demo video, and a complete handoff package.",
  },
  {
    date: "AUG 15 — 19, 2026",
    title: "The sprint — v0.1 in four days",
    text: "One founder directing four AI engineering agents (core, comms, devops, data), each with a written charter, its own isolated git worktree, and a human review gate on every change. 42 pull requests, CI-tested, zero unreviewed merges. The result passed a six-beat live verification: capture, upload, sync, cited offline answer, a deliberate concurrency stress, and two guard checks.",
  },
  {
    date: "THE SYSTEM",
    title: "Discipline as a feature",
    text: "Binding interface contracts written before implementation. Every demo shortcut ships with a ticketed debt shadow. Model decisions gated by a measured eval harness, not vibes. Incidents become rules: token hygiene, worktree isolation, honest failure reporting. The next cohort of USC engineers inherits a system, not a pile of undocumented code.",
  },
  {
    date: "NOW",
    title: "v1.0 — out of the shadows",
    text: "The product surface (interactive answer cards, one-command install), the Project G edge hardware (Raspberry Pi 5 + a 40-TOPS NPU), and the first design partner conversations. Solomon's numbers to date: ~7-second cited answers, fully offline, under 6GB.",
  },
];

export default function BuildPage() {
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
        <section className="mb-24">
          <div className="text-xs text-neutral-500 font-mono tracking-[0.3em] uppercase mb-6">
            The build
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-6 max-w-3xl">
            The way we build is part of what we sell.
          </h1>
          <p className="text-neutral-400 text-lg leading-relaxed max-w-2xl">
            Squaloo runs on a repeatable system for turning founder judgment into shipped, verified
            software: AI engineering agents doing the labor, humans holding every gate. It has already
            produced a working offline AI system — and it&apos;s hiring-ready for the people who want to build this way.
          </p>
        </section>

        <section className="mb-32">
          <div className="flex items-baseline gap-4 mb-10 border-b border-neutral-800 pb-4">
            <h2 className="text-xs font-mono tracking-widest uppercase text-neutral-400">Timeline</h2>
            <div className="h-px flex-1 bg-neutral-800" />
          </div>
          <div className="space-y-0">
            {timeline.map((t) => (
              <div key={t.date} className="group border-t border-neutral-800 py-8 grid grid-cols-1 md:grid-cols-[160px_1fr] gap-6 hover:border-[#1400bf] transition-colors">
                <span className="text-neutral-600 text-xs font-mono tracking-widest pt-1 group-hover:text-[#5688c7] transition-colors">{t.date}</span>
                <div>
                  <div className="text-white text-lg tracking-wide mb-2">{t.title}</div>
                  <p className="text-neutral-400 text-sm leading-relaxed max-w-2xl">{t.text}</p>
                </div>
              </div>
            ))}
            <div className="border-t border-neutral-800" />
          </div>
        </section>

        <section className="mb-32 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: "42", label: "pull requests in the four-day sprint" },
            { value: "0", label: "unreviewed merges — a human gate on every change" },
            { value: "260+", label: "tests, CI-run on every pull request" },
            { value: "6", label: "USC engineers credited on the data foundation" },
          ].map((m) => (
            <div key={m.label} className="border border-neutral-800 p-6 hover:border-[#63a375] transition-colors">
              <div className="text-3xl font-bold font-mono text-white mb-2">{m.value}</div>
              <p className="text-neutral-400 text-xs leading-relaxed">{m.label}</p>
            </div>
          ))}
        </section>

        <section className="border border-neutral-800 p-10">
          <div className="text-xs font-mono tracking-widest uppercase text-[#63a375] mb-4">Build with us</div>
          <p className="text-neutral-300 text-lg leading-relaxed max-w-3xl mb-8">
            If you&apos;re an engineer or designer who wants to work where the review gates are real, the
            constraints are physical, and the mission is <span className="text-white">AI people can own</span> —
            we&apos;re assembling the founding team now.
          </p>
          <a href="mailto:admin@squaloo.com?subject=Founding%20team" className="inline-block px-6 py-3 bg-[#1400bf] text-white text-sm font-medium tracking-wide hover:bg-[#5688c7] transition-colors">
            Introduce yourself →
          </a>
        </section>
      </div>

      <AppFooter />
    </div>
  );
}

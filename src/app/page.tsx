import Link from "next/link";
import AppFooter from "@/components/AppFooter";
import SolomonLayerDiagram from "@/components/SolomonLayerDiagram";
import { streak, latest, asOf } from "@/data/ledger";
import { Struck, Withdrawn } from "@/components/Correction";
import { veteranFixWithdrawn as vfw } from "@/data/measured";
import Wordmark from "@/components/Wordmark";

export const metadata = {
  title: "Squaloo — Solomon, the trust and verification layer for edge AI",
  description:
    "Squaloo builds Solomon — the trust and verification layer for edge and agentic AI. Solomon's first use case is industrial operations, where custody and verification are legally required and still unsolved.",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-[#08090a] text-white flex flex-col">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-900 bg-black/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-8 h-14 flex items-center justify-between">
          <Wordmark />
          <div className="flex items-center gap-6">
            <Link href="/solomon" className="text-neutral-500 text-xs tracking-widest uppercase font-mono hover:text-white transition-colors">Solomon</Link>
            <Link href="/build" className="text-neutral-500 text-xs tracking-widest uppercase font-mono hover:text-white transition-colors">The Build</Link>
            <Link href="/founder" className="text-neutral-500 text-xs tracking-widest uppercase font-mono hover:text-white transition-colors">Founder</Link>
            <Link href="/archive" className="hidden sm:inline text-neutral-600 text-xs tracking-widest uppercase font-mono hover:text-white transition-colors">Archive</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-8 pt-36 pb-24 flex-1 w-full">
        {/* ── HERO · the company ── */}
        <section className="mb-24">
          <div className="text-xs text-neutral-500 font-mono tracking-[0.3em] uppercase mb-6">
            Squaloo
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight mb-6 max-w-3xl">
            Solomon is the <span className="text-[#5688c7]">trust and verification</span> layer for edge and agentic AI.
          </h1>
          <p className="text-neutral-400 text-lg leading-relaxed max-w-2xl mb-5">
            AI running outside a datacenter has two questions no one has made it answer:{" "}
            <span className="text-white">how do you know that</span>, and{" "}
            <span className="text-white">who is checking</span>. Solomon makes both answerable: custody
            you can point to, and verification anyone can re-run. Squaloo builds it.
          </p>
          {/* SQU-288: founder call — move or cut */}
          <p className="text-neutral-400 text-lg leading-relaxed max-w-2xl">
            It exists because our founder, <span className="text-white">Marshal Aldoph</span>, spent
            an engineering career entirely inside the model era and kept hitting the same wall: the
            answer was confident, and nothing behind it could be checked.
          </p>
          <p className="text-neutral-400 text-lg leading-relaxed max-w-2xl">
            <span className="text-white">Solomon&apos;s first use case is industrial operations</span>,
            where verification and custody are already legally mandatory (ITAR, CMMC, plants the cloud
            cannot legally or physically reach) and still unsolved. The first person we build for is a
            technician at a broken machine, deciding whether to trust an answer before acting on it.
          </p>
        </section>

        {/* ── THE LAYER, DRAWN ── */}
        <section className="mb-32">
          <div className="flex items-baseline gap-4 mb-8 border-b border-neutral-800 pb-4">
            <h2 className="text-xs font-mono tracking-widest uppercase text-neutral-400">The layer, drawn</h2>
            <div className="h-px flex-1 bg-neutral-800" />
          </div>
          <SolomonLayerDiagram />
          <p className="text-neutral-500 text-sm leading-relaxed max-w-2xl mx-auto text-center mt-8">
            Cut the link between the brain and the bodies, and everything below it keeps working.
            The numbers, dated and recomputable, are on the{" "}
            <Link href="/measured" className="text-[#5688c7] hover:text-white transition-colors">measurements page</Link>.
          </p>
        </section>

        {/* ── PROOF STRIP · every claim above, with its receipt adjacent (§2.1) ── */}
        <section className="mb-32">
          <div className="flex items-baseline gap-4 mb-8 border-b border-neutral-800 pb-4">
            <h2 className="text-xs font-mono tracking-widest uppercase text-neutral-400">The receipts</h2>
            <div className="h-px flex-1 bg-neutral-800" />
            <span className="text-neutral-600 text-xs font-mono">as of {asOf}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-neutral-800 p-6">
              <div className="text-xs font-mono tracking-widest uppercase text-neutral-500 mb-3">Measured nightly</div>
              <div className="text-2xl font-bold font-mono text-white mb-3 tabular-nums">{streak.count} clean runs</div>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Consecutive clean nightly comparisons, {streak.from} → {streak.to}, counted from the
                committed artifacts. Consecutive <em>runs</em>, not nights: one calendar night in that
                window has no artifact. Ended {streak.endedOn}: nothing since has been comparable, through
                two changes we chose and a comparator defect. None is a regression.
              </p>
            </div>
            <div className="border border-neutral-800 p-6">
              <div className="text-xs font-mono tracking-widest uppercase text-neutral-500 mb-3">Receipts on the answer</div>
              <div className="flex flex-wrap gap-2 mb-3">
                {["[Manual §7.3]", "[Log: Ray 2026-06-02]", "[Log: Ray 2026-06-20]"].map((t) => (
                  <span key={t} className="text-xs font-mono text-[#5688c7] border border-[#5688c7]/40 px-2 py-1">{t}</span>
                ))}
              </div>
              <p className="text-neutral-400 text-sm leading-relaxed">
                The sources carried by one answer in the {latest.date} run: the manual and the
                veteran&apos;s log, side by side. The engine attaches them; the model cannot author them.
              </p>
            </div>
            <div className="border border-neutral-800 p-6">
              <div className="text-xs font-mono tracking-widest uppercase text-neutral-500 mb-3">Published ruler</div>
              <div className="text-2xl font-bold font-mono mb-3 tabular-nums"><Struck>{vfw.passes}/{vfw.scored}</Struck></div>
              <p className="text-neutral-400 text-sm leading-relaxed">
                <Struck>The veteran&apos;s fix led the answer in every scored run, 2026-09-12 → {vfw.asOf}.</Struck>{" "}
                <Withdrawn on={vfw.withdrawn}>the scorer was wrong. Read against the answers, the manual&apos;s
                fix came first in most runs; the veteran&apos;s fix is surfaced and cited alongside it, not ahead
                of it.</Withdrawn>{" "}
                <Link href="/measured" className="text-[#5688c7] hover:text-white transition-colors">The full ruler →</Link>
              </p>
            </div>
          </div>
          <p className="text-neutral-500 text-sm mt-6 max-w-3xl leading-relaxed">
            Every number here is dated and scoped. Where we were wrong, including on this page, the
            correction is in the record.
          </p>
        </section>

        {/* ── DOORWAYS ── */}
        <section className="mb-32">
          <div className="flex items-baseline gap-4 mb-8 border-b border-neutral-800 pb-4">
            <h2 className="text-xs font-mono tracking-widest uppercase text-neutral-400">Where to go next</h2>
            <div className="h-px flex-1 bg-neutral-800" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { href: "/solomon", k: "Solomon", t: "The product",
                d: "Answers at the machine, offline, with sources attached and checkable." },
              { href: "/build", k: "The build", t: "The discipline",
                d: "One founder, AI engineering agents, a human gate on every change, and a public record of the misses." },
              { href: "/measured", k: "Measured", t: "The ruler",
                d: "The contract a model must satisfy, the nightly numbers, and how to recompute them yourself." },
              { href: "/roadmap", k: "Roadmap", t: "What is not proved yet",
                d: "Promises not yet kept, each with its status, published before the date, not after." },
            ].map((c) => (
              <Link key={c.href} href={c.href}
                    className="group border border-neutral-800 p-6 hover:border-[#1400bf] transition-colors block">
                <div className="text-xs font-mono tracking-widest uppercase text-neutral-500 mb-2">{c.t}</div>
                <div className="text-white text-lg tracking-wide mb-3 group-hover:text-[#5688c7] transition-colors">{c.k} →</div>
                <p className="text-neutral-400 text-sm leading-relaxed">{c.d}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="border border-neutral-800 p-10">
          <div className="text-xs font-mono tracking-widest uppercase text-[#63a375] mb-4">Get in touch</div>
          <p className="text-neutral-300 text-lg leading-relaxed max-w-3xl mb-8">
            Machines that cannot afford to forget, a question about how the verification works, or a
            claim here you want to check? Write to us. We answer technical questions with the artifact
            attached, and we will run the demo live, network disconnected, for anyone who asks.
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="mailto:marshal@squaloo.com" className="px-6 py-3 bg-[#1400bf] text-white text-sm font-medium tracking-wide hover:bg-[#5688c7] transition-colors">
              marshal@squaloo.com
            </a>
            <a href="https://github.com/squaloo0" target="_blank" rel="noopener noreferrer" className="px-6 py-3 border border-neutral-700 text-white text-sm font-medium tracking-wide hover:border-white transition-colors">
              github.com/squaloo0
            </a>
          </div>
        </section>
      </div>

      <AppFooter />
    </div>
  );
}

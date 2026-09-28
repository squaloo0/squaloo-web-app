import Link from "next/link";
import AppFooter from "@/components/AppFooter";
import SolomonLayerDiagram from "@/components/SolomonLayerDiagram";
import { streak, veteranFix, latest, asOf } from "@/data/ledger";

export const metadata = {
  title: "Squaloo — the trust and verification layer for edge AI",
  description:
    "Squaloo builds the trust and verification layer for edge and agentic AI. It starts in industrial operations, where custody and verification are legally required and still unsolved.",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-[#08090a] text-white flex flex-col">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-900 bg-black/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-8 h-14 flex items-center justify-between">
          <span className="text-white text-sm font-bold tracking-[0.2em] font-mono">SQUALOO</span>
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
            The <span className="text-[#5688c7]">trust and verification</span> layer for edge and agentic AI.
          </h1>
          <p className="text-neutral-400 text-lg leading-relaxed max-w-2xl mb-5">
            AI that runs outside a datacenter still has to answer two questions nobody has made it
            answer: <span className="text-white">how do you know that</span>, and{" "}
            <span className="text-white">who is checking</span>. We build the layer that makes both
            answerable — custody you can point to, and verification anyone can re-run.
          </p>
          <p className="text-neutral-400 text-lg leading-relaxed max-w-2xl">
            It exists because one engineer spent a career entirely inside the model era and kept
            hitting the same wall: the answer was confident, and nothing behind it could be checked.
            We started in industrial operations because that is where verification and custody are
            already legally mandatory — ITAR, CMMC, plants the cloud cannot legally or physically
            reach — and still unsolved. That is the beachhead, not the boundary.
          </p>
        </section>

        {/* ── THE LAYER, DRAWN ── */}
        <section className="mb-32">
          <div className="flex items-baseline gap-4 mb-8 border-b border-neutral-800 pb-4">
            <h2 className="text-xs font-mono tracking-widest uppercase text-neutral-400">The layer, drawn</h2>
            <div className="h-px flex-1 bg-neutral-800" />
          </div>
          <SolomonLayerDiagram />
          <p className="text-neutral-500 text-sm leading-relaxed max-w-2xl mt-8">
            Cut the link between the brain and the bodies and everything below it keeps working.
            The numbers behind the ruler — with their dates, and the method to recompute them — are on the{" "}
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
                Consecutive clean nightly comparisons, {streak.from} → {streak.to}. Counted from the
                committed artifacts, not asserted — and these are consecutive <em>runs</em>: one
                calendar night in that window has no artifact.
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
                The actual sources carried by one answer in the {latest.date} run — the manual and
                the veteran&apos;s log, side by side. Engine-derived; the model cannot author them.
              </p>
            </div>
            <div className="border border-neutral-800 p-6">
              <div className="text-xs font-mono tracking-widest uppercase text-neutral-500 mb-3">Published ruler</div>
              <div className="text-2xl font-bold font-mono text-white mb-3 tabular-nums">{veteranFix.passes}/{veteranFix.scored}</div>
              <p className="text-neutral-400 text-sm leading-relaxed">
                The veteran&apos;s fix led the answer in every scored run, {veteranFix.from} → {veteranFix.to}
                {" "}— on one scripted scenario, shipped prompt only.{" "}
                <Link href="/measured" className="text-[#5688c7] hover:text-white transition-colors">The full ruler →</Link>
              </p>
            </div>
          </div>
          <p className="text-neutral-500 text-sm mt-6 max-w-3xl leading-relaxed">
            Every number on this site carries the date it was true and the boundary it holds within.
            Where we have been wrong — including on this page — the correction is in the record.
          </p>
        </section>

        {/* ── DOORWAYS ── */}
        <section className="mb-32">
          <div className="flex items-baseline gap-4 mb-8 border-b border-neutral-800 pb-4">
            <h2 className="text-xs font-mono tracking-widest uppercase text-neutral-400">Where to go next</h2>
            <div className="h-px flex-1 bg-neutral-800" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { href: "/solomon", k: "Solomon", t: "The product",
                d: "The first use case: answers at the machine, offline, with their sources attached and checkable." },
              { href: "/build", k: "The build", t: "The discipline",
                d: "One founder, AI engineering agents, a human gate on every change — and a public record of the misses." },
              { href: "/measured", k: "Measured", t: "The ruler",
                d: "The contract a model must satisfy, the nightly numbers, and the method to recompute them yourself." },
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
          <div className="text-xs font-mono tracking-widest uppercase text-[#63a375] mb-4">Out of the shadows</div>
          <p className="text-neutral-300 text-lg leading-relaxed max-w-3xl mb-8">
            Solomon spent the summer being built in the dark. Now we&apos;re looking for
            <span className="text-white"> design partners</span> with machines that can&apos;t afford to forget,
            <span className="text-white"> mentors</span> who&apos;ve sold into industry, and
            <span className="text-white"> founding teammates</span> who want to build the sovereign stack.
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="mailto:admin@squaloo.com" className="px-6 py-3 bg-[#1400bf] text-white text-sm font-medium tracking-wide hover:bg-[#5688c7] transition-colors">
              admin@squaloo.com
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

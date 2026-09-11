import Link from "next/link";
import AppFooter from "@/components/AppFooter";

export const metadata = {
  title: "Squaloo — Own your intelligence",
  description:
    "Squaloo makes Solomon: an offline AI teammate that captures retiring veterans' knowledge and hands it to the next technician — cited, on-site, no internet required.",
};

const stats = [
  { value: "11,000 / day", label: "veteran technicians retiring — decades of tacit knowledge leaving with them" },
  { value: "$125K–$5M / hr", label: "cost of unplanned downtime, from general manufacturing to aerospace" },
  { value: "Cloud AI: unusable*", label: "*ITAR · CMMC · steel hulls · basements — banned by law or blocked by physics" },
];

const acts = [
  {
    n: "01",
    title: "Capture",
    text: "A veteran types what they know the way they'd say it at lunch. No forms, no templates. Solomon reads it, understands the machine and the fault, and files it where the math can find it.",
  },
  {
    n: "02",
    title: "Sync",
    text: "One Brain, Two Bodies: knowledge captured anywhere flows to the device beside the machine. From that moment, the internet is optional.",
  },
  {
    n: "03",
    title: "Answer",
    text: "A new hire asks in plain English and gets the fix in seconds — safety step first, with cited sources. Even when the veteran's experience overrules the manual.",
  },
];

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
        {/* ── HERO ── */}
        <section className="mb-32">
          <div className="text-xs text-neutral-500 font-mono tracking-[0.3em] uppercase mb-6">
            A future where AI is <span className="text-[#5688c7]">safe</span> · <span className="text-[#5688c7]">sovereign</span> · <span className="text-[#5688c7]">secure</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight mb-6">
            Own your <span className="text-[#5688c7]">intelligence.</span>
          </h1>
          <p className="text-neutral-400 text-lg leading-relaxed max-w-2xl mb-4">
            Squaloo makes <span className="text-white">Solomon</span> — an AI teammate that captures what
            retiring veterans know in plain conversation, and hands it to the next technician at the
            machine. In seconds. With cited sources. No internet required.
          </p>
          <div className="flex flex-wrap gap-4 mt-10">
            <Link
              href="/solomon"
              className="px-6 py-3 bg-white text-black text-sm font-medium tracking-wide hover:bg-neutral-200 transition-colors"
            >
              Meet Solomon →
            </Link>
            <Link
              href="/build"
              className="px-6 py-3 border border-neutral-700 text-white text-sm font-medium tracking-wide hover:border-white transition-colors"
            >
              The build story
            </Link>
          </div>
        </section>

        {/* ── THE PROBLEM ── */}
        <section className="mb-32">
          <div className="flex items-baseline gap-4 mb-10 border-b border-neutral-800 pb-4">
            <h2 className="text-xs font-mono tracking-widest uppercase text-neutral-400">The problem</h2>
            <div className="h-px flex-1 bg-neutral-800" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((s) => (
              <div key={s.value} className="border border-neutral-800 p-6 hover:border-[#1400bf] transition-colors">
                <div className="text-2xl font-bold font-mono text-white mb-3">{s.value}</div>
                <p className="text-neutral-400 text-sm leading-relaxed">{s.label}</p>
              </div>
            ))}
          </div>
          <p className="text-neutral-500 text-sm mt-6 max-w-3xl leading-relaxed">
            The facilities losing knowledge fastest — defense manufacturing, maritime, energy — are exactly
            the ones where cloud AI can&apos;t follow. What leaves with every retirement never made it into a manual.
          </p>
        </section>

        {/* ── SOLOMON, IN THREE ACTS ── */}
        <section className="mb-32">
          <div className="flex items-baseline gap-4 mb-10 border-b border-neutral-800 pb-4">
            <h2 className="text-xs font-mono tracking-widest uppercase text-neutral-400">The flagship — Solomon</h2>
            <div className="h-px flex-1 bg-neutral-800" />
          </div>
          <div className="space-y-0">
            {acts.map((a) => (
              <div key={a.n} className="group border-t border-neutral-800 py-8 grid grid-cols-[auto_1fr] gap-6 hover:border-[#1400bf] transition-colors">
                <span className="text-neutral-600 text-xs font-mono tracking-widest pt-1 group-hover:text-[#5688c7] transition-colors">{a.n}</span>
                <div>
                  <div className="text-white text-lg tracking-wide mb-2">{a.title}</div>
                  <p className="text-neutral-400 text-sm leading-relaxed max-w-2xl">{a.text}</p>
                </div>
              </div>
            ))}
            <div className="border-t border-neutral-800 pt-8">
              <Link href="/solomon" className="text-[#5688c7] text-sm font-mono tracking-widest uppercase hover:text-white transition-colors">
                Watch it work →
              </Link>
            </div>
          </div>
        </section>

        {/* ── VISION STRIP ── */}
        <section className="mb-32 border-l-2 border-[#1400bf] pl-8 py-2">
          <div className="text-xs font-mono tracking-widest uppercase text-neutral-500 mb-4">The thesis</div>
          <p className="text-neutral-300 text-base leading-relaxed max-w-3xl">
            Today, Solomon keeps knowledge alive on factory floors. The thesis is bigger: <span className="text-white">safe,
            sovereign, secure AI — owned by the people who use it</span>, not rented from a hyperscaler.
            Project G, our edge hardware line, is the first step on a decade-long road from the plant floor to everywhere.
          </p>
        </section>

        {/* ── THE BUILD TEASER ── */}
        <section className="mb-32">
          <div className="flex items-baseline gap-4 mb-8 border-b border-neutral-800 pb-4">
            <h2 className="text-xs font-mono tracking-widest uppercase text-neutral-400">How it gets built</h2>
            <div className="h-px flex-1 bg-neutral-800" />
          </div>
          <p className="text-neutral-400 text-base leading-relaxed max-w-3xl mb-6">
            One founder. Four AI engineering agents. A human review gate on every change —
            <span className="text-white font-mono"> 28 pull requests in four days</span>, CI-tested and measured.
            The way Squaloo builds is part of what Squaloo sells.
          </p>
          <Link href="/build" className="text-[#5688c7] text-sm font-mono tracking-widest uppercase hover:text-white transition-colors">
            The full build story →
          </Link>
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

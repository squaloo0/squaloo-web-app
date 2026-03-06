import Link from "next/link";
import AppFooter from "@/components/AppFooter";

export default function AmakPage() {
  return (
    <div className="min-h-screen bg-[#08090a] text-white font-sans flex flex-col">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-800 bg-[#08090a]/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-8 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="text-neutral-500 text-xs tracking-widest uppercase font-mono hover:text-white transition-colors"
          >
            ← Terminal
          </Link>
          <div className="flex items-center gap-6 sm:gap-8">
            <a
              href="#thesis"
              className="text-neutral-400 text-xs tracking-widest uppercase hover:text-white transition-colors"
            >
              Thesis
            </a>
            <Link
              href="/amak/ob2b"
              className="text-neutral-400 text-xs tracking-widest uppercase hover:text-white transition-colors"
            >
              OB2B
            </Link>
            <Link
              href="/amak/blog"
              className="text-neutral-400 text-xs tracking-widest uppercase hover:text-white transition-colors"
            >
              R&D Log
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-8 pt-32 pb-24 flex-1">

        {/* ── MANIFESTO HEADER ── */}
        <section className="mb-24">
          <div className="text-xs text-neutral-500 font-mono tracking-widest uppercase mb-6">
            #003 / Amak — A Squaloo Venture
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-6 max-w-3xl">
            The workers building the future{" "}
            <span className="text-neutral-500">shouldn&apos;t have to rent their intelligence.</span>
          </h1>

          <p className="text-neutral-400 text-base leading-relaxed max-w-2xl mb-8">
            The cloud can&apos;t follow you into the field. Centralized LLMs can&apos;t be owned.
            The next generation of builders deserves AI that runs where the work happens,
            belongs entirely to them, and compounds over time. So we started Amak.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/amak/ob2b"
              className="px-5 py-2.5 bg-[#1400bf] text-white text-xs font-mono tracking-widest uppercase hover:bg-[#1a00e0] transition-colors"
            >
              OB2B Protocol →
            </Link>
            <Link
              href="/amak/blog"
              className="px-5 py-2.5 border border-neutral-700 text-neutral-300 text-xs font-mono tracking-widest uppercase hover:border-white hover:text-white transition-colors"
            >
              R&D Log →
            </Link>
          </div>
        </section>

        {/* ── THE NEW COLLAR THESIS ── */}
        <section id="thesis" className="mb-24">
          <div className="flex items-baseline gap-4 mb-10 border-b border-neutral-800 pb-4">
            <h2 className="text-xs font-mono tracking-widest uppercase text-neutral-400">
              The New Collar Thesis
            </h2>
            <div className="h-px flex-1 bg-neutral-800" />
          </div>

          {/* Manifesto body */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8 mb-16 max-w-4xl">
            <div className="space-y-5 text-neutral-400 text-sm leading-relaxed">
              <p>
                As a builder, I realized we are rapidly approaching a future where we will
                be at the mercy of tools that tether us to centralized LLMs and their cloud
                infrastructure. The clear ask from everyday users is a unified, intelligent,
                magical experience — but right now, that experience comes at the cost of our
                privacy and sovereignty.
              </p>
              <p>
                We should own the data that underpins our intelligence. And we shouldn&apos;t
                be limited to passively interfacing with systems in the IoT. We need a protocol
                that allows us to interact freely and safely with the physical world.
              </p>
            </div>
            <div className="space-y-5 text-neutral-400 text-sm leading-relaxed">
              <p>
                My co-founder AJ Khah helped me see that the architecture we were building
                wasn&apos;t just for the factory floor. It was for anyone who wants a personal,
                sovereign AI agent — a companion that learns from you, runs locally, and
                belongs entirely to you. That conversation is what made him my co-founder.
              </p>
              <p>
                This is the <strong className="text-white">New Collar Thesis</strong> behind{" "}
                <strong className="text-white">Amak</strong>: sovereign infrastructure that
                gives the next generation of builders and users the power to participate in
                the future of AI — on their own terms.
              </p>
            </div>
          </div>

          {/* Manifesto pull-quote */}
          <div className="border-l-2 border-[#1400bf] pl-6 py-2 max-w-3xl">
            <p className="text-[#f6f7eb] text-lg sm:text-xl font-medium leading-relaxed">
              &ldquo;Amak is creating the decentralized, gamified bridge between the physical
              world and the future of AI — purpose-built for the New Collar generation who
              will own, not just use, the IoT.&rdquo;
            </p>
          </div>
        </section>

        {/* ── R&D LOG PREVIEW ── */}
        <section id="rd-log" className="mb-24">
          <div className="flex items-baseline gap-4 mb-10 border-b border-neutral-800 pb-4">
            <h2 className="text-xs font-mono tracking-widest uppercase text-neutral-400">
              R&D Log
            </h2>
            <div className="h-px flex-1 bg-neutral-800" />
            <Link
              href="/amak/blog"
              className="text-xs font-mono tracking-widest uppercase text-neutral-500 hover:text-white transition-colors"
            >
              Full Log →
            </Link>
          </div>

          {/* Featured post card */}
          <Link
            href="/amak/blog/amak"
            className="group block border border-neutral-800 p-6 hover:border-[#1400bf] transition-colors"
          >
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="text-xs font-mono text-neutral-500">March 5, 2026</span>
              <span className="text-xs font-mono tracking-widest uppercase text-[#5688c7] border border-[#5688c7]/30 px-2 py-0.5">
                Active Development
              </span>
              <span className="text-xs font-mono text-[#63a375]">3/7 Deliverables</span>
            </div>
            <h3 className="text-white text-base font-medium mb-2 group-hover:text-[#f6f7eb] transition-colors">
              Building the Sovereign Data Lakehouse & OB2B Protocol
            </h3>
            <p className="text-neutral-400 text-sm leading-relaxed max-w-2xl">
              A ledger of architectural decisions behind Amak&apos;s SDL and One Brain, Two Bodies
              protocol — from containerized edge environments to differential syncing and
              Int8-quantized vector embeddings.
            </p>
            <div className="mt-4 text-xs font-mono tracking-widest uppercase text-[#5688c7] group-hover:text-white transition-colors">
              Read Entry →
            </div>
          </Link>
        </section>

        {/* ── FOOTER NAV ── */}
        <div className="flex justify-between items-center pt-8 border-t border-neutral-800">
          <Link
            href="/marshal"
            className="text-neutral-500 text-xs font-mono tracking-widest uppercase hover:text-white transition-colors"
          >
            ← The-Architect
          </Link>
          <Link
            href="/amak/ob2b"
            className="text-neutral-500 text-xs font-mono tracking-widest uppercase hover:text-white transition-colors"
          >
            OB2B Protocol →
          </Link>
        </div>

      </div>

      <AppFooter />
    </div>
  );
}

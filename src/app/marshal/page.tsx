import Link from "next/link";
import PillarCard from "@/components/PillarCard";

const pillars = [
  {
    title: "Systems Architecture & AI Infrastructure",
    proficiency: "Advanced — Level 4/5",
    level: 4,
    maxLevel: 5,
    keywords: [
      "Python (Asyncio, Pydantic)",
      "Vector Databases",
      "Supabase / PostgreSQL / PgVector",
      "ML Foundations (Scikit-Learn, PyTorch, Keras)",
      "Cloud & Edge (Azure, Docker, Cloudflare)",
      "Agentic Workflows (Claude Code, Cursor)",
    ],
  },
  {
    title: "Technical Leadership & Venture Strategy",
    proficiency: "Expert — Level 5/5",
    level: 5,
    maxLevel: 5,
    keywords: [
      "Cross-Disciplinary Team Orchestration",
      "Agile / SCRUM",
      "Enterprise MarTech (AEM, Salesforce)",
      "B2B Market Strategy",
      "Community-Led Growth (CLG)",
      "Bootstrapped R&D Planning",
      "Technical Documentation",
    ],
  },
  {
    title: "Product Design & Innovation Strategy",
    proficiency: "Advanced — Level 4/5",
    level: 4,
    maxLevel: 5,
    keywords: [
      "Human-Centered Design (HCD)",
      "Rapid Prototyping & Visualization",
      "Consumer Experience (CX)",
      "Product-Market Validation",
      "Systems Thinking",
      "GTM Strategy",
      "Interactive Data Visualization",
    ],
  },
];

const tracks = [
  {
    label: "Venture & Architecture",
    org: "Amak Studios",
    description:
      "Architecting the \"One Brain, Two Bodies\" protocol — a sovereign AI operating system for the physical workforce. Sovereign Data Lakehouse on PostgreSQL/PgVector stack with 3.7ms retrieval benchmarks.",
    href: "/amak-studios",
    external: false,
    metric: "3.7ms retrieval",
  },
  {
    label: "Enterprise Systems",
    org: "Pacific Life",
    description:
      "Architected and deployed the Customer Acquisition Loop (CAL) — end-to-end automation of web data integration and social media lead capture across enterprise MarTech stack.",
    href: null,
    external: false,
    metric: "Enterprise Deployment",
  },
  {
    label: "Hardware & Prototyping",
    org: "The QR Matrix",
    description:
      "Built a Version 2 QR code from first principles using a custom go board as the physical matrix. Full implementation of Reed-Solomon error correction and mask pattern encoding.",
    href: "/marshal-qr",
    external: false,
    metric: "From First Principles",
  },
];

export default function MarshalPage() {
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
            <a href="#capabilities" className="text-neutral-500 text-xs tracking-widest uppercase hover:text-white transition-colors">
              Capabilities
            </a>
            <a href="#tracks" className="text-neutral-500 text-xs tracking-widest uppercase hover:text-white transition-colors">
              Tracks
            </a>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-8 pt-32 pb-24">

        {/* ── HERO ── */}
        <section className="mb-32">
          <div className="text-xs text-neutral-600 font-mono tracking-widest uppercase mb-6">
            #002 / The-Architect
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-8 max-w-3xl">
            The future of AI is small,{" "}
            <span className="text-neutral-500">local, and sovereign.</span>
          </h1>

          <p className="text-neutral-400 text-base leading-relaxed max-w-2xl mb-12">
            Technical Founder and Systems Architect bridging seven years of enterprise
            data automation with cutting-edge AI research. Currently pursuing an MSIDBT
            at USC&apos;s Iovine and Young Academy while scaling Amak Studios — a venture
            studio building sovereign, offline-first AI operating systems for the
            &ldquo;New Collar&rdquo; workforce.
          </p>

          <div className="flex flex-wrap gap-4">
            <a
              href="https://rxresu.me/marshal2093/vr1"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-white text-black text-sm font-medium tracking-wide hover:bg-neutral-200 transition-colors"
            >
              View Technical Resume →
            </a>
            <a
              href="https://www.linkedin.com/in/marshalaldoph/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 border border-neutral-700 text-white text-sm font-medium tracking-wide hover:border-white transition-colors"
            >
              Connect on LinkedIn
            </a>
          </div>
        </section>

        {/* ── CAPABILITIES ── */}
        <section id="capabilities" className="mb-32">
          <div className="flex items-baseline gap-4 mb-10 border-b border-neutral-900 pb-4">
            <h2 className="text-xs font-mono tracking-widest uppercase text-neutral-500">
              Capabilities
            </h2>
            <div className="h-px flex-1 bg-neutral-900" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pillars.map((pillar) => (
              <PillarCard key={pillar.title} {...pillar} />
            ))}
          </div>
        </section>

        {/* ── PROJECT TRACKS ── */}
        <section id="tracks" className="mb-32">
          <div className="flex items-baseline gap-4 mb-10 border-b border-neutral-900 pb-4">
            <h2 className="text-xs font-mono tracking-widest uppercase text-neutral-500">
              Project Tracks
            </h2>
            <div className="h-px flex-1 bg-neutral-900" />
          </div>

          <div className="space-y-0">
            {tracks.map((track, i) => (
              <div
                key={i}
                className="group border-t border-neutral-900 py-8 grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-6 items-start hover:border-neutral-700 transition-colors"
              >
                {/* Label */}
                <div>
                  <div className="text-xs font-mono tracking-widest uppercase text-neutral-600 mb-1">
                    Track {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="text-white text-sm font-medium">{track.label}</div>
                  <div className="text-neutral-600 text-xs mt-0.5">{track.org}</div>
                </div>

                {/* Description */}
                <p className="text-neutral-400 text-sm leading-relaxed">
                  {track.description}
                </p>

                {/* CTA / Metric */}
                <div className="flex flex-col items-end gap-3 min-w-[120px]">
                  <span className="text-xs font-mono text-neutral-600 border border-neutral-800 px-2 py-1">
                    {track.metric}
                  </span>
                  {track.href && (
                    <Link
                      href={track.href}
                      className="text-xs text-neutral-500 hover:text-white transition-colors tracking-widest uppercase"
                    >
                      View →
                    </Link>
                  )}
                </div>
              </div>
            ))}

            {/* Bottom border on last track */}
            <div className="border-t border-neutral-900" />
          </div>
        </section>

        {/* ── FOOTER NAV ── */}
        <div className="flex justify-between items-center pt-8 border-t border-neutral-900">
          <Link
            href="/"
            className="text-neutral-600 text-xs font-mono tracking-widest uppercase hover:text-white transition-colors"
          >
            ← Terminal
          </Link>
          <Link
            href="/amak-studios"
            className="text-neutral-600 text-xs font-mono tracking-widest uppercase hover:text-white transition-colors"
          >
            Amak Studios →
          </Link>
        </div>

      </div>
    </div>
  );
}

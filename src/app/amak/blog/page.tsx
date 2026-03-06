import Link from "next/link";
import AppFooter from "@/components/AppFooter";

const posts = [
  {
    slug: "amak",
    title: "Building the Sovereign Data Lakehouse & OB2B Protocol",
    date: "March 5, 2026",
    category: "R&D Log",
    status: "Active Development",
    eta: "May 2026",
    deliverablesCompleted: 3,
    deliverablesTotal: 7,
    description:
      "A ledger of architectural decisions behind Amak's SDL and One Brain, Two Bodies protocol — from containerized edge environments to Int8-quantized vector embeddings and differential syncing.",
  },
];

export default function AmakBlogPage() {
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

        <div className="mb-16">
          <div className="text-xs text-neutral-500 font-mono tracking-widest uppercase mb-6">
            Amak / R&D Log
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Founder&apos;s Journal
          </h1>
          <p className="text-neutral-400 text-sm leading-relaxed max-w-xl">
            A technical ledger of the architectural decisions behind Amak&apos;s Sovereign
            Data Lakehouse and the One Brain, Two Bodies Protocol. Written as we build.
          </p>
        </div>

        {/* Post list */}
        <div className="space-y-0">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/amak/blog/${post.slug}`}
              className="group block border-t border-neutral-800 py-8 hover:border-[#1400bf]/40 transition-colors"
            >
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="text-xs font-mono text-neutral-500">{post.date}</span>
                <span className="text-xs font-mono tracking-widest uppercase text-[#5688c7] border border-[#5688c7]/30 px-2 py-0.5">
                  {post.status}
                </span>
                <span className="text-xs font-mono text-[#63a375]">
                  {post.deliverablesCompleted}/{post.deliverablesTotal} Deliverables
                </span>
                <span className="text-xs font-mono text-neutral-400">
                  ETA: {post.eta}
                </span>
              </div>

              <h2 className="text-white text-lg font-medium mb-2 group-hover:text-[#f6f7eb] transition-colors">
                {post.title}
              </h2>

              <p className="text-neutral-400 text-sm leading-relaxed max-w-2xl">
                {post.description}
              </p>

              <div className="mt-4 text-xs font-mono tracking-widest uppercase text-neutral-500 group-hover:text-[#5688c7] transition-colors">
                Read Entry →
              </div>
            </Link>
          ))}
          <div className="border-t border-neutral-800" />
        </div>

      </div>

      <AppFooter />
    </div>
  );
}

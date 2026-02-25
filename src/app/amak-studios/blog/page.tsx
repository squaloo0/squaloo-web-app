import Link from "next/link";

export default function AmakBlogPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-900 bg-black/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-8 h-14 flex items-center justify-between">
          <Link
            href="/amak-studios"
            className="text-neutral-600 text-xs tracking-widest uppercase font-mono hover:text-white transition-colors"
          >
            ← Amak Studios
          </Link>
          <Link
            href="/"
            className="text-neutral-600 text-xs tracking-widest uppercase font-mono hover:text-white transition-colors"
          >
            Terminal
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-8 pt-32 pb-24">

        <div className="mb-16">
          <div className="text-xs text-neutral-600 font-mono tracking-widest uppercase mb-6">
            Amak Studios / Founder&apos;s Journal
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            R&D Log
          </h1>
          <p className="text-neutral-500 text-sm leading-relaxed max-w-xl">
            Field notes from building sovereign AI systems. Updates on the Sovereign
            Data Lakehouse, USC grant milestones, and deep-tech research.
          </p>
        </div>

        {/* Empty state */}
        <div className="border-t border-neutral-900 py-24 text-center">
          <div className="text-neutral-800 text-xs font-mono tracking-widest uppercase mb-4">
            Transmission Pending
          </div>
          <p className="text-neutral-700 text-sm">
            First entries incoming. Check back soon.
          </p>
        </div>

        <div className="border-t border-neutral-900 pt-8 flex justify-start">
          <Link
            href="/amak-studios"
            className="text-neutral-600 text-xs font-mono tracking-widest uppercase hover:text-white transition-colors"
          >
            ← Back to Amak Studios
          </Link>
        </div>

      </div>
    </div>
  );
}

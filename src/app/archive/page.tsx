import Link from "next/link";
import AppFooter from "@/components/AppFooter";

export const metadata = {
  title: "Archive — Squaloo",
  description: "Earlier experiments and prior-era pages, preserved honestly.",
};

const entries = [
  {
    n: "#001",
    title: "Amak",
    href: "/amak",
    text: "The prior venture era (2025–early 2026) — where the One Brain, Two Bodies protocol was first conceived. Superseded by Squaloo/Solomon; preserved as history.",
  },
  {
    n: "#002",
    title: "OB2B Protocol (Amak era)",
    href: "/amak/ob2b",
    text: "The original protocol deep-dive and USC capstone milestone tracker. The protocol lives on inside Solomon.",
  },
  {
    n: "#003",
    title: "Founder's Journal",
    href: "/amak/blog",
    text: "R&D log entries from the early build.",
  },
  {
    n: "#004",
    title: "Shop",
    href: "/shop",
    text: "A commerce experiment.",
  },
  {
    n: "#005",
    title: "YT-Scraper",
    href: "/yt-scraper",
    text: "A scraping sandbox.",
  },
];

export default function ArchivePage() {
  return (
    <div className="min-h-screen bg-[#08090a] text-white font-mono flex flex-col">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-900 bg-black/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-8 h-14 flex items-center justify-between">
          <Link href="/" className="text-neutral-600 text-xs tracking-widest uppercase hover:text-white transition-colors">
            ← Squaloo
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-8 pt-36 pb-24 flex-1 w-full">
        <div className="mb-12">
          <div className="text-xs tracking-[0.3em] text-neutral-500 uppercase mb-2">Archive</div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-3">Earlier experiments</h1>
          <p className="text-neutral-500 text-sm leading-relaxed">
            Kept honestly, labeled clearly. Companies have histories; this is ours.
          </p>
        </div>

        <nav className="space-y-0">
          {entries.map((e) => (
            <Link
              key={e.n}
              href={e.href}
              className="group flex items-baseline gap-6 py-5 border-t border-neutral-900 hover:border-[#1400bf] transition-colors duration-150"
            >
              <span className="text-neutral-500 text-xs tracking-widest w-12 shrink-0 group-hover:text-[#5688c7] transition-colors">
                {e.n}
              </span>
              <div>
                <div className="text-white text-lg tracking-wide group-hover:text-neutral-200 transition-colors">
                  {e.title}
                </div>
                <div className="text-neutral-400 text-xs mt-0.5 group-hover:text-neutral-300 transition-colors">
                  {e.text}
                </div>
              </div>
              <span className="ml-auto text-[#5688c7] group-hover:text-white transition-colors text-sm">→</span>
            </Link>
          ))}
          <div className="border-t border-b-0 border-neutral-900" />
        </nav>
      </div>

      <AppFooter />
    </div>
  );
}

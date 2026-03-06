import Link from "next/link";
import TerminalAnimation from "@/components/TerminalAnimation";
import AppFooter from "@/components/AppFooter";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#08090a] text-white font-mono flex flex-col">
      <div className="max-w-2xl mx-auto px-8 py-24 flex flex-col flex-1 w-full">

        {/* Wordmark */}
        <div className="mb-8">
          <div className="text-xs tracking-[0.3em] text-neutral-500 uppercase mb-2">
            Terminal / v2.1
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">
            SQUALOO
          </h1>
          <div className="mt-2 text-xs text-neutral-400 tracking-widest uppercase">
            Select Access Point
          </div>
        </div>

        {/* GitHub CTA */}
        <div className="mb-8">
          <a
            href="https://github.com/squaloo0"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-[#1400bf] text-[#5688c7] text-xs font-mono tracking-widest uppercase px-4 py-2 hover:bg-[#1400bf] hover:text-white transition-all duration-150"
          >
            <GitHubIcon className="w-3.5 h-3.5" />
            github.com/squaloo0
          </a>
        </div>

        {/* Terminal animation */}
        <div className="mb-16">
          <TerminalAnimation />
        </div>

        {/* Directory */}
        <nav className="flex-1 space-y-0">
          <Link
            href="/marshal-qr"
            className="group flex items-baseline gap-6 py-5 border-t border-neutral-900 hover:border-[#1400bf] transition-colors duration-150"
          >
            <span className="text-neutral-500 text-xs tracking-widest w-12 shrink-0 group-hover:text-[#5688c7] transition-colors">
              #001
            </span>
            <div>
              <div className="text-white text-lg tracking-wide group-hover:text-neutral-200 transition-colors">
                Marshal-QR
              </div>
              <div className="text-neutral-400 text-xs mt-0.5 group-hover:text-neutral-300 transition-colors">
                Sandbox — Custom QR Code System from First Principles
              </div>
            </div>
            <span className="ml-auto text-[#5688c7] group-hover:text-white transition-colors text-sm">
              →
            </span>
          </Link>

          <Link
            href="/marshal"
            className="group flex items-baseline gap-6 py-5 border-t border-neutral-900 hover:border-[#1400bf] transition-colors duration-150"
          >
            <span className="text-neutral-500 text-xs tracking-widest w-12 shrink-0 group-hover:text-[#5688c7] transition-colors">
              #002
            </span>
            <div>
              <div className="text-white text-lg tracking-wide group-hover:text-neutral-200 transition-colors">
                The-Architect
              </div>
              <div className="text-neutral-400 text-xs mt-0.5 group-hover:text-neutral-300 transition-colors">
                Marshal Aldoph — Technical Founder & Systems Architect
              </div>
            </div>
            <span className="ml-auto text-[#5688c7] group-hover:text-white transition-colors text-sm">
              →
            </span>
          </Link>

          <Link
            href="/amak"
            className="group flex items-baseline gap-6 py-5 border-t border-b border-neutral-900 hover:border-[#1400bf] transition-colors duration-150"
          >
            <span className="text-neutral-500 text-xs tracking-widest w-12 shrink-0 group-hover:text-[#5688c7] transition-colors">
              #003
            </span>
            <div>
              <div className="text-white text-lg tracking-wide group-hover:text-neutral-200 transition-colors">
                Amak
              </div>
              <div className="text-neutral-400 text-xs mt-0.5 group-hover:text-neutral-300 transition-colors">
                Squaloo Venture — Sovereign, Decentralized AI for the New Collar Generation
              </div>
            </div>
            <span className="ml-auto text-[#5688c7] group-hover:text-white transition-colors text-sm">
              →
            </span>
          </Link>
        </nav>

        {/* Inline footer text */}
        <div className="mt-16 flex justify-between items-end">
          <div className="text-neutral-500 text-xs tracking-widest uppercase">
            Squaloo means &lsquo;Do you&rsquo;
          </div>
          <div className="text-neutral-500 text-xs">
            Los Angeles, CA
          </div>
        </div>

      </div>

      <AppFooter />
    </div>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

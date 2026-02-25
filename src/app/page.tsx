import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <div className="max-w-2xl mx-auto px-8 py-24 flex flex-col min-h-screen">

        {/* Wordmark */}
        <div className="mb-20">
          <div className="text-xs tracking-[0.3em] text-neutral-500 uppercase mb-2">
            Terminal / v2.0
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">
            SQUALOO
          </h1>
          <div className="mt-2 text-xs text-neutral-600 tracking-widest uppercase">
            Select Access Point
          </div>
        </div>

        {/* Directory */}
        <nav className="flex-1 space-y-0">
          <Link
            href="/marshal-qr"
            className="group flex items-baseline gap-6 py-5 border-t border-neutral-900 hover:border-white transition-colors duration-150"
          >
            <span className="text-neutral-600 text-xs tracking-widest w-12 shrink-0 group-hover:text-neutral-400 transition-colors">
              #001
            </span>
            <div>
              <div className="text-white text-lg tracking-wide group-hover:text-neutral-200 transition-colors">
                Marshal-QR
              </div>
              <div className="text-neutral-600 text-xs mt-0.5 group-hover:text-neutral-500 transition-colors">
                Sandbox — Custom QR Code System from First Principles
              </div>
            </div>
            <span className="ml-auto text-neutral-700 group-hover:text-white transition-colors text-sm">
              →
            </span>
          </Link>

          <Link
            href="/marshal"
            className="group flex items-baseline gap-6 py-5 border-t border-neutral-900 hover:border-white transition-colors duration-150"
          >
            <span className="text-neutral-600 text-xs tracking-widest w-12 shrink-0 group-hover:text-neutral-400 transition-colors">
              #002
            </span>
            <div>
              <div className="text-white text-lg tracking-wide group-hover:text-neutral-200 transition-colors">
                The-Architect
              </div>
              <div className="text-neutral-600 text-xs mt-0.5 group-hover:text-neutral-500 transition-colors">
                Marshal Aldoph — Technical Founder & Systems Architect
              </div>
            </div>
            <span className="ml-auto text-neutral-700 group-hover:text-white transition-colors text-sm">
              →
            </span>
          </Link>

          <Link
            href="/amak-studios"
            className="group flex items-baseline gap-6 py-5 border-t border-b border-neutral-900 hover:border-white transition-colors duration-150"
          >
            <span className="text-neutral-600 text-xs tracking-widest w-12 shrink-0 group-hover:text-neutral-400 transition-colors">
              #003
            </span>
            <div>
              <div className="text-white text-lg tracking-wide group-hover:text-neutral-200 transition-colors">
                Amak-Studios
              </div>
              <div className="text-neutral-600 text-xs mt-0.5 group-hover:text-neutral-500 transition-colors">
                Venture Studio — Sovereign, Offline-First AI Systems
              </div>
            </div>
            <span className="ml-auto text-neutral-700 group-hover:text-white transition-colors text-sm">
              →
            </span>
          </Link>
        </nav>

        {/* Footer */}
        <div className="mt-20 flex justify-between items-end">
          <div className="text-neutral-700 text-xs tracking-widest uppercase">
            Squaloo means &lsquo;Do you&rsquo;
          </div>
          <div className="text-neutral-800 text-xs">
            Los Angeles, CA
          </div>
        </div>

      </div>
    </div>
  );
}

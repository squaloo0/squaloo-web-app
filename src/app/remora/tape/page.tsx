/**
 * /remora/tape — the open books. Public. A thermal strip that never stops printing:
 * vends, bytes, coins, Stripe's own revenue number, which machines are on, and the
 * recent drops by hash. Titles, URLs and cards never appear here.
 */
import Link from "next/link";
import AppFooter from "@/components/AppFooter";
import Wordmark from "@/components/Wordmark";
import { prettyBytes } from "@/remora/core/pretty";
import { prettyMoney, prettyUptime, shortHash, sparkline } from "@/remora/core/tape";
import { theTape } from "@/remora/tape";
import Poller from "../poller";

export const metadata = {
  title: "Remora — the tape",
  description: "The vending machine's open books: vends, coins, revenue from Stripe's ledger, uptime. Hashes shown, titles hidden.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function RemoraTapePage() {
  const now = new Date();
  const t = await theTape(now);

  return (
    <div className="min-h-screen bg-[#08090a] text-white font-mono flex flex-col">
      <Poller active={true} everyMs={60_000} />
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-900 bg-black/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-8 h-14 flex items-center justify-between">
          <Link href="/remora" className="group inline-flex items-center gap-1.5 text-neutral-600 text-xs tracking-widest uppercase hover:text-white transition-colors">
            ← <Wordmark className="h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" /> <span className="ml-2">Remora</span>
          </Link>
          <span className="text-neutral-700 text-xs tracking-[0.3em] uppercase">Open books</span>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-8 pt-36 pb-24 flex-1 w-full">
        <div className="mb-10">
          <div className="text-xs tracking-[0.3em] text-neutral-500 uppercase mb-2">Remora · Tape</div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-3">The machine&apos;s books</h1>
          <p className="text-neutral-500 text-sm leading-relaxed">
            Every vend, every coin, and the revenue number straight from Stripe&apos;s ledger, not ours. Hashes are shown
            because they are the machine&apos;s. Titles are not, because they are the customer&apos;s.
          </p>
        </div>

        {!t ? (
          <div className="border border-dashed border-neutral-800 py-10 text-center text-[10px] tracking-[0.3em] uppercase text-neutral-700">
            No queue wired on this deploy
          </div>
        ) : (
          <section className="border border-neutral-800 bg-[#0c0d0f]">
            {/* Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-neutral-800 border-b border-neutral-800">
              <Counter label="vends today" value={String(t.vends.today)} />
              <Counter label="vends to date" value={String(t.vends.total)} />
              <Counter label="bytes vended" value={prettyBytes(t.vends.bytes)} />
              <Counter
                label={t.money?.mode === "test" ? "gross · sandbox" : t.money?.mode === "live" ? "gross · stripe" : "gross"}
                value={t.money && t.money.mode !== "off" ? prettyMoney(t.money.gross) : "—"}
                sub={
                  !t.money ? "Stripe could not be read just now" : t.money.mode === "off" ? "no Stripe key on this deploy" : `net ${prettyMoney(t.money.net)} after ${prettyMoney(t.money.fees)} to Stripe`
                }
              />
            </div>

            {/* Fourteen days */}
            <div className="px-5 py-4 border-b border-neutral-800 flex items-baseline gap-4">
              <span className="text-[10px] tracking-[0.3em] uppercase text-neutral-500 shrink-0">14 days</span>
              <pre className="text-[#5688c7] text-lg leading-none tracking-[0.2em]" aria-label={t.days.map((d) => `${d.day}: ${d.vends}`).join(", ")}>
                {sparkline(t.days)}
              </pre>
              <span className="text-[10px] tracking-[0.2em] uppercase text-neutral-700 ml-auto">utc</span>
            </div>

            {/* Coins */}
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-neutral-800 border-b border-neutral-800">
              <Counter label="coins bought" value={String(t.coins.purchased)} />
              <Counter label="on the house" value={String(t.coins.promo)} />
              <Counter label="coins spent" value={String(t.coins.vended)} />
              <Counter label="coins returned" value={String(t.coins.returned)} />
            </div>

            {/* Machines */}
            <div className="px-5 py-4 border-b border-neutral-800 flex flex-wrap gap-x-6 gap-y-2 text-[10px] tracking-[0.2em] uppercase">
              <span className="text-neutral-500">machines</span>
              {t.machines.length === 0 ? <span className="text-neutral-700">none have checked in</span> : null}
              {t.machines.map((m) => (
                <span key={m.name} className={m.on ? "text-neutral-300" : "text-neutral-700"}>
                  <span className={`inline-block h-1.5 w-1.5 rounded-full mr-2 align-middle ${m.on ? "bg-[#63a375] shadow-[0_0_6px_currentColor]" : "bg-neutral-800"}`} aria-hidden="true" />
                  {m.name} · {m.on ? `up ${prettyUptime(m.since, now)}` : `off · last seen ${m.lastSeen.replace("T", " ").slice(0, 16)}`} · {m.vends} vends
                </span>
              ))}
            </div>

            {/* The strip */}
            <div className="px-5 py-4">
              <div className="flex items-baseline justify-between mb-3">
                <span className="text-[10px] tracking-[0.3em] uppercase text-neutral-500">Recent drops</span>
                <span className="text-[10px] tracking-[0.2em] uppercase text-neutral-700">as of {t.asOf.replace("T", " ").slice(0, 16)} utc</span>
              </div>
              {t.recent.length === 0 ? (
                <div className="border border-dashed border-neutral-900 py-6 text-center text-[10px] tracking-[0.2em] uppercase text-neutral-700">
                  Nothing has dropped yet
                </div>
              ) : (
                <ul className="divide-y divide-neutral-900 border-t border-neutral-900 text-[11px]">
                  {t.recent.map((d) => (
                    <li key={d.sha256 + d.at} className="py-2 grid grid-cols-[7rem_5rem_4rem_1fr] sm:grid-cols-[8rem_6rem_5rem_1fr_6rem] gap-2 items-baseline">
                      <span className="text-neutral-500">{d.at.replace("T", " ").slice(5, 16)}</span>
                      <span className="text-neutral-400 uppercase tracking-widest text-[10px]">{d.provider}</span>
                      <span className="text-neutral-500">{prettyBytes(d.bytes)}</span>
                      <Link href={`/remora/verify?sha256=${d.sha256}`} className="text-[#5688c7] hover:text-white transition-colors truncate" title="verify by hash">
                        {shortHash(d.sha256)}…
                      </Link>
                      <span className="hidden sm:inline text-neutral-700 text-[10px] uppercase tracking-widest text-right">{d.quality}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t border-neutral-800 px-5 py-3 text-[10px] tracking-[0.3em] uppercase text-neutral-700 flex flex-wrap gap-x-4 gap-y-1">
              <span>Titles are the customer&apos;s · hashes are the machine&apos;s</span>
              <a href="/api/remora/tape" className="text-neutral-500 hover:text-white transition-colors">
                JSON ↗
              </a>
            </div>
          </section>
        )}
      </main>

      <AppFooter />
    </div>
  );
}

function Counter({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="px-5 py-4">
      <div className="text-[10px] tracking-[0.3em] uppercase text-neutral-500">{label}</div>
      <div className="text-2xl text-white mt-1 tabular-nums">{value}</div>
      {sub ? <div className="text-[10px] text-neutral-600 mt-1 leading-relaxed">{sub}</div> : null}
    </div>
  );
}

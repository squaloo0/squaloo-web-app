/**
 * /remora — the front panel.
 *
 * Phase 1: look through the glass (oEmbed peek). Phase 3: put a coin in, watch the
 * flap. Unlinked from the nav and keyed with REMORA_ADMIN_TOKEN until the real coin
 * slot exists (Phase 4). Server-rendered end to end: forms are plain GET/POST, the
 * peek and the queue are read on the server, thumbnails come from our own origin, and
 * the only client code is a poller that re-renders while a coin is in flight.
 */
import Link from "next/link";
import { cookies } from "next/headers";
import AppFooter from "@/components/AppFooter";
import Wordmark from "@/components/Wordmark";
import { isServiceKey, KEY_COOKIE, keySlotWired } from "@/remora/auth";
import { peek, type PeekResult } from "@/remora/peek";
import { thumbProxyPath } from "@/remora/core/oembed";
import { QUALITIES } from "@/remora/core/format";
import { isActive, machineLight, pill, shortError, type Job, type Machine } from "@/remora/core/job";
import { machineSummary, waitingReason } from "@/remora/core/route";
import { prettyBytes } from "@/remora/core/pretty";
import { dbWired } from "@/remora/db/client";
import { assetsForJobs, freshestMachine, listJobs, liveMachines, type Asset } from "@/remora/db/queue";
import { presignDownload, shelfWired } from "@/remora/storage";
import Poller from "./poller";

export const metadata = {
  title: "Remora — Squaloo",
  description: "A video vending machine. Insert a coin. Pick a slot. Something drops. You keep the receipt.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Search = { url?: string | string[]; denied?: string | string[]; coin?: string | string[] };

const SLOTS = [
  { label: "VIDEO", tag: "LIVE" },
  { label: "AUDIO", tag: "RAW" },
  { label: "CLIP", tag: "SOON" },
  { label: "GIF", tag: "SOON" },
  { label: "THUMBS", tag: "SOON" },
  { label: "TRANSCRIPT", tag: "SOON" },
  { label: "CHAPTERS", tag: "SOON" },
] as const;

const LINK_SECONDS = 3600;

export default async function RemoraPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const url = first(sp.url);
  const denied = first(sp.denied);
  const coin = first(sp.coin);
  const wired = keySlotWired();
  const keyed = wired && isServiceKey((await cookies()).get(KEY_COOKIE)?.value);
  const result = keyed && url ? await peek(url) : null;

  const queue = keyed && dbWired();
  const now = new Date();
  const [jobs, machine, live] = queue ? await Promise.all([listJobs(12), freshestMachine(), liveMachines()]) : [[], null, [] as Machine[]];
  const assets = queue ? await assetsForJobs(jobs.filter((j) => j.status === "completed").map((j) => j.id)) : [];
  const light = machineLight(machine, now);
  const inFlight = jobs.some(isActive);

  return (
    <div className="min-h-screen bg-[#08090a] text-white font-mono flex flex-col">
      <Poller active={inFlight} />
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-900 bg-black/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-8 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="group inline-flex items-center gap-1.5 text-neutral-600 text-xs tracking-widest uppercase hover:text-white transition-colors"
          >
            ← <Wordmark className="h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
          </Link>
          <span className="text-neutral-700 text-xs tracking-[0.3em] uppercase">Not a downloader</span>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-8 pt-36 pb-24 flex-1 w-full">
        <div className="mb-10">
          <div className="text-xs tracking-[0.3em] text-neutral-500 uppercase mb-2">Remora</div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-3">Video vending machine</h1>
          <p className="text-neutral-500 text-sm leading-relaxed">
            Insert a coin. Pick a slot. Something drops. You keep the receipt.
            <br />
            Phase 3: the machine is on. Coins are free and the key is the coin.
          </p>
        </div>

        <section aria-label="Remora vending machine" className="border border-neutral-800 bg-[#0c0d0f]">
          {/* Top plate */}
          <div className="flex items-center justify-between gap-4 px-5 py-3 border-b border-neutral-800">
            <span className="text-xs tracking-[0.3em] uppercase text-neutral-400">Remora</span>
            <StatusLight wired={wired} keyed={keyed} queue={queue} on={light.on} text={light.text} />
          </div>

          {/* Who is on */}
          {queue && live.length > 0 ? (
            <div className="px-5 py-2 border-b border-neutral-800 flex flex-wrap gap-x-5 gap-y-1 text-[10px] tracking-[0.2em] uppercase text-neutral-600">
              {live.map((m) => (
                <span key={m.name}>{machineSummary(m, now)}</span>
              ))}
            </div>
          ) : null}

          {/* The glass */}
          <div className="p-5 border-b border-neutral-800 bg-[linear-gradient(180deg,rgba(86,136,199,0.06),transparent_60%)]">
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 sm:gap-2 mb-5">
              {SLOTS.map((s, i) => (
                <Slot key={s.label} label={s.label} tag={s.tag} lit={i < 2} />
              ))}
            </div>

            <div className="min-h-40 border border-neutral-800/80 bg-black/40 shadow-[inset_0_0_40px_rgba(0,0,0,0.6)]">
              {!wired ? (
                <Notice tone="red" head="OUT OF ORDER">
                  No key slot is wired on this deploy. Set REMORA_ADMIN_TOKEN.
                </Notice>
              ) : !keyed ? (
                <Notice tone="dim" head="Keyed">
                  Turn the service key to look inside.
                </Notice>
              ) : result === null ? (
                <Notice tone="dim" head="Empty">
                  Paste a URL below. The glass reads YouTube and Vimeo; the machine vends more.
                </Notice>
              ) : (
                <Behind result={result} />
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="grid sm:grid-cols-[1fr_auto] gap-0 border-b border-neutral-800">
            <div className="p-5 border-b sm:border-b-0 sm:border-r border-neutral-800 flex flex-col gap-5">
              <form action="/remora" method="get" className="flex flex-col gap-2">
                <label htmlFor="url" className="text-[10px] tracking-[0.3em] uppercase text-neutral-500">
                  Insert URL
                </label>
                <div className="flex gap-2">
                  <input
                    id="url"
                    name="url"
                    type="url"
                    inputMode="url"
                    autoComplete="off"
                    spellCheck={false}
                    defaultValue={url ?? ""}
                    placeholder="https://"
                    disabled={!keyed}
                    className="flex-1 min-w-0 bg-black border border-neutral-800 px-3 py-2 text-sm text-white placeholder:text-neutral-700 focus:outline-none focus:border-[#5688c7] disabled:opacity-40"
                  />
                  <button
                    type="submit"
                    disabled={!keyed}
                    className="px-4 py-2 text-xs tracking-[0.2em] uppercase border border-neutral-700 text-neutral-300 hover:text-white hover:border-[#5688c7] transition-colors disabled:opacity-40"
                  >
                    Look
                  </button>
                </div>
              </form>

              <form action="/api/remora/jobs" method="post" className="flex flex-col gap-2">
                <label htmlFor="vend-url" className="text-[10px] tracking-[0.3em] uppercase text-neutral-500">
                  Vend {coin ? <CoinNote coin={coin} /> : null}
                </label>
                <div className="flex gap-2">
                  <input
                    id="vend-url"
                    name="url"
                    type="url"
                    inputMode="url"
                    autoComplete="off"
                    spellCheck={false}
                    defaultValue={result?.ok ? result.peek.canonicalUrl : (url ?? "")}
                    placeholder="https://"
                    disabled={!queue}
                    className="flex-1 min-w-0 bg-black border border-neutral-800 px-3 py-2 text-sm text-white placeholder:text-neutral-700 focus:outline-none focus:border-[#5688c7] disabled:opacity-40"
                  />
                  <select
                    name="quality"
                    defaultValue="best"
                    disabled={!queue}
                    aria-label="quality"
                    className="bg-black border border-neutral-800 px-2 py-2 text-xs text-neutral-300 focus:outline-none focus:border-[#5688c7] disabled:opacity-40"
                  >
                    {QUALITIES.map((q) => (
                      <option key={q} value={q}>
                        {q === "best" ? "best" : q === "audio" ? "audio" : `${q}p`}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    disabled={!queue}
                    className="px-4 py-2 text-xs tracking-[0.2em] uppercase border border-[#1400bf] bg-[#1400bf] text-white hover:bg-[#5688c7] hover:border-[#5688c7] transition-colors disabled:opacity-40 disabled:hover:bg-[#1400bf]"
                  >
                    Vend
                  </button>
                </div>
                {keyed && !dbWired() ? (
                  <span className="text-[10px] tracking-[0.2em] uppercase text-neutral-700">No queue wired on this deploy (NEON_DATABASE_URL)</span>
                ) : null}
              </form>
            </div>

            <div className="p-5 flex flex-col gap-4 sm:w-56">
              <div>
                <div className="text-[10px] tracking-[0.3em] uppercase text-neutral-500 mb-2">Coin</div>
                <div className="h-9 border border-dashed border-neutral-800 flex items-center justify-center text-[10px] tracking-[0.2em] uppercase text-neutral-700">
                  Free · Phase 4
                </div>
              </div>
              <KeyHole wired={wired} keyed={keyed} denied={denied} />
            </div>
          </div>

          {/* The flap */}
          <div className="p-5">
            <div className="flex items-baseline justify-between mb-3">
              <span className="text-[10px] tracking-[0.3em] uppercase text-neutral-500">Flap</span>
              <span className="text-[10px] tracking-[0.2em] uppercase text-neutral-700">
                {queue ? `${jobs.length} recent · links good for ${LINK_SECONDS / 60} min` : "Push · nothing yet"}
              </span>
            </div>
            {!queue ? (
              <div className="border border-dashed border-neutral-900 py-6 text-center text-[10px] tracking-[0.2em] uppercase text-neutral-800">
                {keyed ? "No queue wired" : "Keyed"}
              </div>
            ) : jobs.length === 0 ? (
              <div className="border border-dashed border-neutral-900 py-6 text-center text-[10px] tracking-[0.2em] uppercase text-neutral-700">
                No coins yet
              </div>
            ) : (
              <ul className="divide-y divide-neutral-900 border-t border-neutral-900">
                {jobs.map((j) => (
                  <Drop key={j.id} job={j} assets={assets.filter((a) => a.jobId === j.id)} waiting={waitingReason(j, live, now)} />
                ))}
              </ul>
            )}
          </div>

          {/* Printer */}
          <div className="border-t border-neutral-800 px-5 py-3 text-[10px] tracking-[0.3em] uppercase text-neutral-700">
            Receipt · printed with every drop · unsigned until Phase 4
          </div>
        </section>

        <p className="mt-6 text-neutral-700 text-xs leading-relaxed">
          The glass asks the provider&apos;s oEmbed endpoint from the server and serves the thumbnail from this origin. Vends
          run on the machine, never here. Download links are signed and expire. Your browser talks to nothing but
          squaloo.com on this page, and to the shelf only when you pull a drop.
        </p>
      </main>

      <AppFooter />
    </div>
  );
}

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function StatusLight({ wired, keyed, queue, on, text }: { wired: boolean; keyed: boolean; queue: boolean; on: boolean; text: string }) {
  const [color, label] = !wired
    ? ["bg-red-500", "Out of order"]
    : !keyed
      ? ["bg-amber-400", "Keyed"]
      : !queue
        ? ["bg-amber-400", "Ready · no queue"]
        : on
          ? ["bg-[#63a375]", text]
          : ["bg-red-500", text];
  return (
    <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-neutral-500 text-right">
      <span className={`h-2 w-2 shrink-0 rounded-full ${color} shadow-[0_0_8px_currentColor]`} aria-hidden="true" />
      <span className="truncate max-w-[60vw] sm:max-w-sm">{label}</span>
    </span>
  );
}

function Slot({ label, tag, lit }: { label: string; tag: string; lit: boolean }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-1 py-2 border text-center ${
        lit ? "border-[#1400bf] text-[#5688c7] shadow-[0_0_12px_rgba(20,0,191,0.35)]" : "border-neutral-900 text-neutral-700"
      }`}
    >
      <span className="text-[9px] sm:text-[10px] tracking-[0.1em] sm:tracking-[0.2em] uppercase">{label}</span>
      <span className={`text-[8px] tracking-[0.1em] sm:tracking-[0.2em] uppercase ${lit ? "text-neutral-400" : "text-neutral-800"}`}>{tag}</span>
    </div>
  );
}

function Notice({ tone, head, children }: { tone: "red" | "dim"; head: string; children: React.ReactNode }) {
  return (
    <div className="h-full min-h-40 flex flex-col items-center justify-center gap-2 px-6 text-center">
      <span className={`text-xs tracking-[0.3em] uppercase ${tone === "red" ? "text-red-400" : "text-neutral-500"}`}>{head}</span>
      <span className="text-neutral-600 text-xs leading-relaxed">{children}</span>
    </div>
  );
}

function CoinNote({ coin }: { coin: string }) {
  const text =
    coin === "not-a-url" ? "that is not a URL" : coin === "bad-quality" ? "pick a quality" : coin === "no-queue" ? "no queue wired" : `coin in · ${coin}`;
  const bad = !coin.startsWith("j_");
  return <span className={bad ? "text-amber-400" : "text-[#63a375]"}>· {text}</span>;
}

function Behind({ result }: { result: PeekResult }) {
  if (!result.ok) {
    return (
      <Notice tone="dim" head={`${result.status} · nothing to see`}>
        {result.error}.
        {result.status === 404 ? (
          <>
            <br />
            The machine may still vend it: paste it under Vend, or <code className="text-neutral-500">npm run remora -- info &lt;url&gt;</code>
          </>
        ) : null}
      </Notice>
    );
  }
  const { peek: p } = result;
  const thumb = thumbProxyPath(p.thumbnail);
  return (
    <div className="grid sm:grid-cols-[200px_1fr] gap-5 p-5">
      <div className="aspect-video bg-black border border-neutral-800 overflow-hidden">
        {thumb ? (
          // Plain <img>: the source is our own proxy route, so next/image would only add a
          // second hop. See VideoEmbed for the same call.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-[10px] tracking-[0.2em] uppercase text-neutral-700">
            No picture
          </div>
        )}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-0.5 border border-[#1400bf] text-[#5688c7] text-[10px] tracking-[0.2em] uppercase">{p.provider}</span>
          {p.id ? <span className="text-neutral-600 text-[10px] tracking-widest">{p.id}</span> : null}
        </div>
        <div className="text-white text-base leading-snug break-words">{p.title}</div>
        <div className="text-neutral-500 text-xs mt-1">{p.author ?? "—"}</div>
        <div className="text-neutral-700 text-[11px] mt-3 break-all">{p.canonicalUrl}</div>
      </div>
    </div>
  );
}

const PILL_TONE = {
  dim: "border-neutral-800 text-neutral-500",
  lit: "border-[#1400bf] text-[#5688c7] shadow-[0_0_10px_rgba(20,0,191,0.35)]",
  green: "border-[#63a375] text-[#63a375]",
  red: "border-red-900 text-red-400",
} as const;

function Drop({ job, assets, waiting }: { job: Job; assets: Asset[]; waiting: string | null }) {
  const p = pill(job);
  const links = shelfWired() && job.status === "completed" ? assets.map((a) => ({ a, href: presignDownload(a.objectKey, LINK_SECONDS, a.fileName) })) : [];
  const file = assets.find((a) => a.kind !== "receipt");
  return (
    <li className="py-3 flex flex-col gap-1.5">
      <div className="flex items-center gap-3 min-w-0">
        <span className={`shrink-0 px-2 py-0.5 border text-[10px] tracking-[0.2em] uppercase ${PILL_TONE[p.tone]}`}>{p.text}</span>
        <span className="text-[10px] tracking-widest text-neutral-700 shrink-0 uppercase">{job.provider}</span>
        <span className="text-[10px] tracking-widest text-neutral-700 shrink-0">{job.quality}</span>
        <span className="text-sm text-neutral-300 truncate">{job.title ?? job.canonicalUrl}</span>
      </div>
      {job.status === "processing" && job.progress !== null ? (
        <div className="h-1 bg-neutral-900">
          <div className="h-full bg-[#1400bf]" style={{ width: `${Math.round(job.progress * 100)}%` }} />
        </div>
      ) : null}
      {job.error && job.status !== "completed" ? (
        <div className="text-[11px] text-neutral-600 break-words" title={job.error}>
          {shortError(job.error)}
          {job.status === "pending" ? (job.routeFailures > 0 ? ` · turned away ${job.routeFailures}×, another machine will try` : " · will try again") : ""}
        </div>
      ) : null}
      {waiting ? <div className="text-[10px] tracking-[0.15em] uppercase text-amber-400/80">{waiting}</div> : null}
      {job.status === "completed" ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]">
          {file ? (
            <span className="text-neutral-600">
              {prettyBytes(file.bytes)} · sha256 {file.sha256.slice(0, 12)}…
            </span>
          ) : null}
          {links.map(({ a, href }) => (
            <a key={a.id} href={href} className="text-[#5688c7] hover:text-white transition-colors tracking-[0.15em] uppercase text-[10px]">
              {a.kind === "receipt" ? "receipt ↓" : "pull ↓"}
            </a>
          ))}
          {!shelfWired() ? <span className="text-neutral-700 uppercase tracking-[0.15em] text-[10px]">shelf not wired here</span> : null}
        </div>
      ) : null}
    </li>
  );
}

function KeyHole({ wired, keyed, denied }: { wired: boolean; keyed: boolean; denied?: string }) {
  if (!wired) {
    return (
      <div>
        <div className="text-[10px] tracking-[0.3em] uppercase text-neutral-500 mb-2">Key</div>
        <div className="h-9 border border-dashed border-red-900 flex items-center justify-center text-[10px] tracking-[0.2em] uppercase text-red-900">
          Unwired
        </div>
      </div>
    );
  }
  if (keyed) {
    return (
      <form action="/api/remora/key" method="post">
        <div className="text-[10px] tracking-[0.3em] uppercase text-neutral-500 mb-2">Key</div>
        <input type="hidden" name="eject" value="1" />
        <button
          type="submit"
          className="h-9 w-full border border-neutral-800 text-[10px] tracking-[0.2em] uppercase text-neutral-500 hover:text-white hover:border-neutral-600 transition-colors"
        >
          Eject key
        </button>
      </form>
    );
  }
  return (
    <form action="/api/remora/key" method="post" className="flex flex-col gap-2">
      <label htmlFor="key" className="text-[10px] tracking-[0.3em] uppercase text-neutral-500">
        Key {denied ? <span className="text-amber-400">· doesn&apos;t fit</span> : null}
      </label>
      <input
        id="key"
        name="key"
        type="password"
        autoComplete="off"
        className="h-9 bg-black border border-neutral-800 px-3 text-sm text-white focus:outline-none focus:border-[#5688c7]"
      />
      <button
        type="submit"
        className="h-9 border border-neutral-700 text-[10px] tracking-[0.2em] uppercase text-neutral-300 hover:text-white hover:border-[#5688c7] transition-colors"
      >
        Turn key
      </button>
    </form>
  );
}

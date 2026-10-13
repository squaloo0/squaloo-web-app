/**
 * Routing: which machine should vend which coin, and when a machine should sit one out.
 *
 * A bot wall or a rate limit is a *route* failure, not a coin failure. The video is
 * fine; this machine's address is not welcome right now. So the coin goes back on the
 * shelf without losing an attempt, the machine that hit the wall cools on that provider
 * for a while, and any other machine that is good for the provider takes the coin.
 *
 * None of this spoofs anything. It is backpressure: the machine stays human-scale and
 * tells the truth about what it can vend. Pure; time is an input.
 */
import type { Provider } from "./url.ts";
import type { Job, Machine } from "./job.ts";
import { codeName } from "./codename.ts";

export const PROVIDERS: readonly Provider[] = ["youtube", "vimeo", "tiktok", "x", "reddit", "twitch", "instagram", "direct", "unknown"];

/** How long a machine sits out a provider after a route failure. */
export const ROUTE_COOLDOWN_MS = 30 * 60_000;

/** Route failures a single coin may collect, across all machines, before it is declared stuck. */
export const MAX_ROUTE_FAILURES = 8;

/** Shelf time before another machine may try a coin that just route-failed. */
export const ROUTE_RETRY_MS = 60_000;

/** The host is saying "not you, not now": the coin is fine, this address is not. */
export function isRouteError(message: string): boolean {
  return /Sign in to confirm|not a bot|HTTP Error 429|Too Many Requests|rate.?limit|try again later|temporarily blocked|unusual traffic/i.test(message);
}

/** provider → ISO instant the cooldown ends. */
export type Cooldowns = Record<string, string>;

export function withCooldown(cooldowns: Cooldowns, provider: string, now: Date, ms = ROUTE_COOLDOWN_MS): Cooldowns {
  return { ...activeCooldowns(cooldowns, now), [provider]: new Date(now.getTime() + ms).toISOString() };
}

/** Drop cooldowns that have ended. */
export function activeCooldowns(cooldowns: Cooldowns, now: Date): Cooldowns {
  const out: Cooldowns = {};
  for (const [p, until] of Object.entries(cooldowns)) {
    if (Date.parse(until) > now.getTime()) out[p] = until;
  }
  return out;
}

/** What this machine will claim right now: its capabilities minus what it is cooling on. */
export function availableProviders(capabilities: readonly string[], cooldowns: Cooldowns, now: Date): string[] {
  const cooling = activeCooldowns(cooldowns, now);
  return capabilities.filter((p) => !(p in cooling));
}

/** "youtube,vimeo" → ["youtube", "vimeo"]; blank or "all" → everything. Unknown names dropped. */
export function parseCapabilities(spec: string | undefined): Provider[] {
  const s = (spec ?? "").trim().toLowerCase();
  if (s === "" || s === "all" || s === "*") return [...PROVIDERS];
  return s
    .split(",")
    .map((p) => p.trim())
    .filter((p): p is Provider => (PROVIDERS as readonly string[]).includes(p));
}

/**
 * Human-scale pacing: at most N vends per key per rolling hour. A machine that would
 * exceed it simply does not claim that provider until the oldest vend ages out.
 */
export class RateWindow {
  private readonly stamps = new Map<string, number[]>();
  private readonly perHour: (key: string) => number;
  constructor(perHour: (key: string) => number) {
    this.perHour = perHour;
  }

  private prune(key: string, now: Date): number[] {
    const cutoff = now.getTime() - 3_600_000;
    const kept = (this.stamps.get(key) ?? []).filter((t) => t > cutoff);
    this.stamps.set(key, kept);
    return kept;
  }

  allow(key: string, now: Date): boolean {
    return this.prune(key, now).length < this.perHour(key);
  }

  record(key: string, now: Date): void {
    this.prune(key, now).push(now.getTime());
  }

  /** When the next vend for this key is allowed, or null if it is allowed now. */
  retryAt(key: string, now: Date): Date | null {
    const kept = this.prune(key, now);
    if (kept.length < this.perHour(key)) return null;
    return new Date(kept[0] + 3_600_000);
  }
}

/** Machines that have beaten recently. */
export function liveMachines(machines: Machine[], now: Date, silentAfterMs: number): Machine[] {
  return machines.filter((m) => now.getTime() - Date.parse(m.lastSeen) <= silentAfterMs);
}

/**
 * Why a pending coin is still on the shelf, in panel words, or null when some live
 * machine can take it. E.g. "no machine can vend youtube right now · fly-sjc cooling 28 min".
 */
export function waitingReason(job: Pick<Job, "status" | "provider"> & { quality?: string }, live: Machine[], now: Date): string | null {
  if (job.status !== "pending") return null;
  if (live.length === 0) return "no machine is on";
  if (job.quality === "transcript" && !live.some((m) => m.transcribe)) return "no machine that can transcribe is on";
  const able = live.filter((m) => availableProviders(m.providers, m.cooldowns, now).includes(job.provider));
  if (able.length > 0) return null;
  const cooling = live
    .filter((m) => job.provider in activeCooldowns(m.cooldowns, now))
    .map((m) => `${codeName(m.name)} cooling ${Math.max(1, Math.ceil((Date.parse(m.cooldowns[job.provider]) - now.getTime()) / 60_000))} min`);
  return `no machine can vend ${job.provider} right now${cooling.length ? ` · ${cooling.join(", ")}` : ""}`;
}

/** One line per live machine for the top plate: "air · youtube ok · 3 vends". */
export function machineSummary(m: Machine, now: Date): string {
  const cooling = Object.entries(activeCooldowns(m.cooldowns, now)).map(
    ([p, until]) => `${p} cooling ${Math.max(1, Math.ceil((Date.parse(until) - now.getTime()) / 60_000))} min`,
  );
  return [codeName(m.name), cooling.length ? cooling.join(", ") : "all providers", ...(m.transcribe ? ["transcribes"] : []), `${m.vends} vends`].join(" · ");
}

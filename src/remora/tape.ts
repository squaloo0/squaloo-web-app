/**
 * Assemble the tape: numbers from Neon, money from Stripe, cached for a minute because
 * the tape is public and Stripe's list call is not free. I/O edge.
 */
import { tapeNumbers } from "./db/tape.ts";
import { revenueToDate } from "./stripe.ts";
import { dbWired } from "./db/client.ts";
import type { Tape } from "./core/tape.ts";

const TTL_MS = 60_000;
let cached: { at: number; tape: Tape } | null = null;

export async function theTape(now = new Date()): Promise<Tape | null> {
  if (!dbWired()) return null;
  if (cached && now.getTime() - cached.at < TTL_MS) return cached.tape;
  const [numbers, money] = await Promise.all([
    tapeNumbers(now),
    revenueToDate().catch(() => null), // the tape still prints when Stripe is slow; money shows as unknown
  ]);
  const tape: Tape = { asOf: now.toISOString(), ...numbers, money };
  cached = { at: now.getTime(), tape };
  return tape;
}

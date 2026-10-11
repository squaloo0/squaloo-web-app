/**
 * The service key. Through Phase 3 the machine only opens for whoever holds
 * REMORA_ADMIN_TOKEN; Phase 4 replaces this with the coin slot and the punch card.
 *
 * I/O edge: reads the environment. The compare is constant-time.
 */
import { timingSafeEqual } from "node:crypto";

/** httpOnly cookie that carries the key between requests. */
export const KEY_COOKIE = "remora_key";

/** True when this deploy has a key slot at all. Without one the machine is OUT OF ORDER. */
export function keySlotWired(): boolean {
  return typeof process.env.REMORA_ADMIN_TOKEN === "string" && process.env.REMORA_ADMIN_TOKEN.length > 0;
}

/** Does this candidate turn the lock? Constant-time on equal lengths; false on everything else. */
export function isServiceKey(candidate: string | null | undefined): boolean {
  const expected = process.env.REMORA_ADMIN_TOKEN;
  if (!expected || !candidate) {
    return false;
  }
  const a = Buffer.from(candidate, "utf8");
  const b = Buffer.from(expected, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * The founder's key to the station. GARAGE_ADMIN_TOKEN when set, else Remora's service key,
 * so one deploy needs one secret. The compare is constant-time.
 *
 * I/O edge: reads the environment.
 */
import { timingSafeEqual } from "node:crypto";

export const KEY_COOKIE = "garage_key";

function expected(): string | null {
  const v = process.env.GARAGE_ADMIN_TOKEN || process.env.REMORA_ADMIN_TOKEN;
  return typeof v === "string" && v.length > 0 ? v : null;
}

export function keySlotWired(): boolean {
  return expected() !== null;
}

export function isGarageKey(candidate: string | null | undefined): boolean {
  const e = expected();
  if (!e || !candidate) return false;
  const a = Buffer.from(candidate, "utf8");
  const b = Buffer.from(e, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

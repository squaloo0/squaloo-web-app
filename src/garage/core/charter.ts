/**
 * The charter is the agent's system prompt, and the hash of what it ran with goes in the
 * run row (charter section 3, guard 7). Hashing is arithmetic, not I/O. Pure.
 */
import { createHash } from "node:crypto";

export function charterHash(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

/** "**Version 0.1, drafted ...**" → "0.1"; null when the charter has no version line. */
export function charterVersion(text: string): string | null {
  const m = /\*\*Version (\d+\.\d+)/.exec(text);
  return m ? m[1] : null;
}

/** The charter says so itself until the founder's review date lands in the changelog. */
export function charterBinding(text: string): boolean {
  return !/Not yet binding/.test(text);
}

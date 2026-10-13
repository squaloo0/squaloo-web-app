/**
 * The ledger's one connection: Neon over HTTP, the same database Remora uses, its own
 * tables. Lazy: importing never throws; the first query does.
 */
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

export type Sql = NeonQueryFunction<false, false>;

let cached: Sql | null = null;

export function ledgerWired(): boolean {
  return typeof process.env.NEON_DATABASE_URL === "string" && process.env.NEON_DATABASE_URL.length > 0;
}

export function sql(): Sql {
  if (cached) return cached;
  const url = process.env.NEON_DATABASE_URL;
  if (!url) {
    throw new Error("NEON_DATABASE_URL is not set; the garage has no ledger");
  }
  cached = neon(url);
  return cached;
}

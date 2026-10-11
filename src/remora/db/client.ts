/**
 * The one connection. Neon over HTTP: stateless, works on Vercel and on the worker
 * alike, and each query is its own transaction, which is exactly what a single-statement
 * SKIP LOCKED claim wants. Lazy: importing this file never throws; the first query does.
 */
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

export type Sql = NeonQueryFunction<false, false>;

let cached: Sql | null = null;

export function dbWired(): boolean {
  return typeof process.env.NEON_DATABASE_URL === "string" && process.env.NEON_DATABASE_URL.length > 0;
}

export function sql(): Sql {
  if (cached) return cached;
  const url = process.env.NEON_DATABASE_URL;
  if (!url) {
    throw new Error("NEON_DATABASE_URL is not set; the machine has no queue");
  }
  cached = neon(url);
  return cached;
}

/**
 * The wipe: every test row out of the books, so the tape starts at zero the day the
 * coin slot goes live. Cards, ledger, Stripe events, jobs and assets go, and the objects
 * those assets still hold on the shelf go first. Machines, routes and migrations stay;
 * the machines' vend tallies reset to match the empty books.
 *
 * I/O edge. The decision to run it (test mode only, and only with --yes) is the CLI's;
 * this file only counts and deletes.
 */
import { sql } from "./client.ts";
import { deleteObject } from "../storage.ts";

export type Books = { cards: number; ledger: number; stripeEvents: number; jobs: number; assets: number; onShelf: number };

export async function countBooks(): Promise<Books> {
  const rows = (await sql()`SELECT
      (SELECT count(*) FROM remora_cards) AS cards,
      (SELECT count(*) FROM remora_ledger) AS ledger,
      (SELECT count(*) FROM remora_stripe_events) AS stripe_events,
      (SELECT count(*) FROM remora_jobs) AS jobs,
      (SELECT count(*) FROM remora_assets) AS assets,
      (SELECT count(*) FROM remora_assets WHERE deleted_at IS NULL) AS on_shelf`) as Record<string, string | number>[];
  const n = (k: string) => Number(rows[0]?.[k] ?? 0);
  return { cards: n("cards"), ledger: n("ledger"), stripeEvents: n("stripe_events"), jobs: n("jobs"), assets: n("assets"), onShelf: n("on_shelf") };
}

/** Shelf first, then rows, children before parents. Each statement is its own transaction on Neon's HTTP driver. */
export async function wipeBooks(log: (line: string) => void = () => {}): Promise<Books> {
  const before = await countBooks();
  const shelf = (await sql()`SELECT id, object_key FROM remora_assets WHERE deleted_at IS NULL ORDER BY created_at`) as { id: string; object_key: string }[];
  for (const a of shelf) {
    await deleteObject(a.object_key);
    await sql()`UPDATE remora_assets SET deleted_at = now() WHERE id = ${a.id}`;
    log(`off the shelf: ${a.object_key}`);
  }
  await sql()`DELETE FROM remora_ledger`;
  await sql()`DELETE FROM remora_stripe_events`;
  await sql()`DELETE FROM remora_assets`;
  await sql()`DELETE FROM remora_jobs`;
  await sql()`DELETE FROM remora_cards`;
  await sql()`UPDATE remora_machine SET vends = 0`;
  return before;
}

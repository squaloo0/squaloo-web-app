import Link from "next/link";
import AppFooter from "@/components/AppFooter";
import { WRAP } from "./ui";

/**
 * The privacy line says exactly what the site records: the existing
 * server-side instrument (src/middleware.ts -> garage_hits) keeps the day,
 * the page path, the kind of browser and the referring site's host. No
 * query string, no address, no cookie, no tracker.
 */
export default function Footer() {
  return (
    <>
      <footer className={`${WRAP} flex flex-col gap-4 py-12 text-sm leading-[1.6] text-sq-ink-muted`}>
        <p className="m-0 max-w-[760px]">
          <b className="text-sq-ink">What this page keeps.</b> Visits are counted on the server, by page and kind of
          browser: no cookies, no trackers, and the site writes down no address. (Vercel, the host, keeps its own
          request logs.) A newsletter signup stores your email, the name you give, and where you scanned from.
        </p>
        <p className="m-0 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[12px] uppercase tracking-[0.14em]">
          <Link href="/marshal-qr/archive" className="inline-flex min-h-11 items-center text-sq-ink hover:text-solomon-blue">
            Marshal-QR v1.0, archived
          </Link>
          <a href="mailto:marshal@squaloo.com" className="inline-flex min-h-11 items-center normal-case tracking-normal text-sq-ink hover:text-solomon-blue">
            marshal@squaloo.com
          </a>
        </p>
      </footer>
      <AppFooter register="squaloo" />
    </>
  );
}

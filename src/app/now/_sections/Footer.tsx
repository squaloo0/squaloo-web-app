import AppFooter from "@/components/AppFooter";
import { WRAP } from "@/components/house/ui";

/**
 * The privacy line says exactly what the site records: the existing
 * server-side instrument (src/middleware.ts -> garage_hits) keeps the day,
 * the page path, the kind of browser and the referring site's host. No
 * query string, no address, no cookie, no tracker.
 *
 * A labelled <section>, not a <footer>: AppFooter below is the page's one
 * contentinfo landmark (axe: landmark-no-duplicate-contentinfo).
 */
export default function Footer() {
  return (
    <>
      <section aria-label="What this page keeps" className={`${WRAP} flex flex-col gap-4 py-12 text-sm leading-[1.6] text-sq-ink-muted`}>
        <p className="m-0 max-w-[760px]">
          <b className="text-sq-ink">What this page keeps.</b> Visits are counted on the server, by page and kind of
          browser: no cookies, no trackers, and the site writes down no address. (Vercel, the host, keeps its own
          request logs.) A newsletter signup stores your email, the name you give, and which link brought you here.
        </p>
        <p className="m-0">
          <a href="mailto:marshal@squaloo.com" className="inline-flex min-h-11 items-center text-sq-ink hover:text-solomon-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-solomon-blue">
            marshal@squaloo.com
          </a>
        </p>
      </section>
      <AppFooter register="squaloo" />
    </>
  );
}

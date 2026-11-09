/**
 * /marshal-qr: the Meridian landing page (SQU-427). The go board on the table
 * at Meridian (UCLA, Sat 2026-11-14) is a working QR code that resolves here.
 * The v1.0 portfolio that lived here is at /marshal-qr/archive, unchanged.
 *
 * Static on purpose: nothing here reads the request, so the page is built
 * once and served from the edge. The scan source rides in as ?src= and only
 * the signup form reads it, on the client. Visits are counted by the site's
 * existing server-side instrument (src/middleware.ts), by path; see
 * ../_lib/meridian.ts for why each source is a path.
 *
 * Not linked from here, deliberately: /measured. Per the 11-03 rule it is
 * linked only once the ruler-DB page is prepped (SQU-376).
 */
import type { Metadata } from "next";
import Hero from "../_sections/Hero";
import Video from "../_sections/Video";
import AtTheTable from "../_sections/AtTheTable";
import Asks from "../_sections/Asks";
import Deck from "../_sections/Deck";
import Subscribe from "../_sections/Subscribe";
import Board from "../_sections/Board";
import Work from "../_sections/Work";
import Footer from "../_sections/Footer";

const TITLE = "Marshal Aldoph · Squaloo at Meridian";
const DESCRIPTION =
  "You scanned a go board. Squaloo builds Solomon, answers at the machine, offline. The four asks, the deck, and a way to follow the build.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  metadataBase: new URL("https://squaloo.com"),
  alternates: { canonical: "/marshal-qr" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/marshal-qr", siteName: "Squaloo", type: "website" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
  robots: { index: true, follow: true },
};

export default function MeridianFrontDoor() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-sq-ground font-sans text-sq-ink">
      <Hero />
      <main>
        <Video />
        <AtTheTable />
        <Asks />
        <Deck />
        <Subscribe />
        <Board />
        <Work />
      </main>
      <Footer />
    </div>
  );
}

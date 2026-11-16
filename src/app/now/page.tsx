/**
 * /now (SQU-436): what Squaloo is working on, a way to talk with us, and the
 * newsletter. Static on purpose: nothing here reads the request. The signup
 * source rides in as ?src= and only the form reads it, on the client. The
 * entries are data: edit src/content/now.ts to post an update.
 */
import type { Metadata } from "next";
import Hero from "./_sections/Hero";
import Now from "./_sections/Now";
import Talk from "./_sections/Talk";
import Asks from "./_sections/Asks";
import Founder from "./_sections/Founder";
import Footer from "./_sections/Footer";
import Subscribe from "@/components/newsletter/Subscribe";
import SiteHeader from "@/components/house/SiteHeader";

const TITLE = "Squaloo: Own and verify your intelligence.";
const DESCRIPTION =
  "Own and verify your intelligence. Solomon, Squaloo’s first product, is a working prototype for maintenance technicians. Updates from the build, a way to talk with us, and the newsletter.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  metadataBase: new URL("https://squaloo.com"),
  alternates: { canonical: "/now" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/now", siteName: "Squaloo", type: "website" },
  twitter: { card: "summary", title: TITLE, description: DESCRIPTION },
  robots: { index: true, follow: true },
};

export default function NowPage() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-sq-ground font-sans text-sq-ink">
      <SiteHeader writeSubject="Hello from squaloo.com" />
      <main>
        <Hero />
        <Now />
        <Talk />
        <Subscribe page="now" />
        <Asks />
        <Founder />
      </main>
      <Footer />
    </div>
  );
}

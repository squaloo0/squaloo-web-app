/**
 * squaloo.com/marshal: the portfolio home (SQU-461). Mobile-first at 390px,
 * then 1280px. Server component; the client leaves are the intro runner and
 * each entry's media frame. Entries are data (_data/work.ts) and one
 * WorkEntry component renders all of them.
 *
 * The page stays usable when Cloudinary is unreachable: a failed image shows
 * a labelled box, and every outbound link is plain HTML.
 */
import type { Metadata } from "next";
import MarkIntro from "./_components/MarkIntro";
import MarshalFooter from "./_components/MarshalFooter";
import MarshalHeader from "./_components/MarshalHeader";
import { HOME } from "./_data/home";
import Bio from "./_sections/Bio";
import Capabilities from "./_sections/Capabilities";
import MoreWorkList from "./_sections/MoreWorkList";
import Timeline from "./_sections/Timeline";

const { title, description } = HOME.meta;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/marshal" },
  openGraph: { title, description, url: "/marshal", siteName: "Squaloo", type: "profile" },
  twitter: { card: "summary_large_image", title, description },
  robots: { index: true, follow: true },
};

/**
 * Runs before first paint, as the first child of `.mk-root`: marks the wrapper
 * so marshal.css shows the intro overlay. Skipped on a repeat visit this
 * session and under prefers-reduced-motion. Any failure leaves the page as is.
 */
const INTRO_SCRIPT =
  "(function(){try{var r=document.currentScript.parentElement;if(sessionStorage.getItem('marshal-intro'))return;if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;r.setAttribute('data-marshal-intro','1')}catch(e){}})()";

export default function MarshalHome() {
  return (
    <div className="mk-root flex min-h-screen flex-col bg-sq-ground font-sans text-sq-ink" suppressHydrationWarning>
      <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
      <MarkIntro />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[110] focus:rounded-full focus:bg-sq-ink focus:px-5 focus:py-3 focus:text-sq-ground"
      >
        Skip to content
      </a>
      <MarshalHeader variant="home" />
      <main id="main" className="flex-1">
        <Bio />
        <Timeline />
        <MoreWorkList />
        <Capabilities />
      </main>
      <MarshalFooter />
    </div>
  );
}

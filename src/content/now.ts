/** The Now entries on /now, newest first on the page whatever their order here. Dates are ISO (YYYY-MM-DD). */
export type NowLink = { label: string; href: string };
export type NowEntry = { date: string; title: string; body: string; links?: readonly NowLink[] };
export const NOW: readonly NowEntry[] = [
  {
    date: "2026-11-14",
    title: "Meridian at UCLA",
    body: "We pitched Squaloo and ran Solomon live at our demo table. Next, we’re listening to the people who run and maintain plants before we build further.",
    links: [
      { label: "The deck", href: "/decks/squaloo-pitch-deck-2026-11-16.pdf" },
      { label: "Solomon Demo v1.1 · YouTube", href: "https://youtu.be/Af_5SVAZwFg" },
    ],
  },
];

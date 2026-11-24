/**
 * The portfolio's entries (SQU-461): the single source for the home page at
 * /marshal and the entry pages at /marshal/[slug]. Entries are data; one
 * component (WorkEntry) renders them.
 *
 * Media is referenced by key into ./media.ts, which is generated from the
 * web-media manifest. /marshal-qr keeps its own work list in
 * src/app/marshal-qr/_data/work.ts; the two overlap on purpose for now.
 */
import type { MediaKey } from "./media";

export type EntryType = "gallery" | "howto";
export type Term = "Fall 2025" | "Spring 2026" | "Fall 2026";

export type WorkLinks = {
  live: string | null;
  github: string | null;
  deck: string | null;
  video: MediaKey | null;
};

export type WorkEntry = {
  /** "001" … "007": the founder's numbering convention, oldest first. */
  number: string;
  slug: string;
  title: string;
  /** Course or company. */
  context: string;
  term: Term;
  year: string;
  /** Selects the entry-page template. Only "gallery" has one in v1. */
  type: EntryType;
  role: string;
  /** Names only, or null for solo work. */
  team: string[] | null;
  overview: string;
  /** The first item is the lead; a video lead uses its own poster. */
  media: MediaKey[];
  links: WorkLinks;
  /** True when the entry has a page at /marshal/[slug]. */
  page: boolean;
  featured: boolean;
};

export const TERMS: readonly Term[] = ["Fall 2025", "Spring 2026", "Fall 2026"];

export const WORK: readonly WorkEntry[] = [
  {
    number: "001",
    slug: "physical-product-design",
    title: "Physical Product Design",
    context: "Physical Product Design, USC IYA",
    term: "Fall 2025",
    year: "2025",
    type: "gallery",
    role: "Designer",
    team: null,
    overview:
      "Five studies in making things you can hold: a Pebble smartwatch redesign, nine footwear concepts taken through color to a physical model, packaging for PHORA, and Nightstand #001 from CAD to print.",
    media: [
      "001-physical-product-design/footwear-concept-001",
      "001-physical-product-design/footwear-concept-002",
      "001-physical-product-design/footwear-concept-003",
      "001-physical-product-design/footwear-concept-004",
      "001-physical-product-design/footwear-concept-005",
      "001-physical-product-design/footwear-concept-006",
      "001-physical-product-design/footwear-concept-007",
      "001-physical-product-design/footwear-concept-008",
      "001-physical-product-design/footwear-concept-009",
      "001-physical-product-design/footwear-color-study-01",
      "001-physical-product-design/footwear-color-study-03",
      "001-physical-product-design/footwear-color-study-05",
      "001-physical-product-design/shoe-model-01",
      "001-physical-product-design/pebble-redesign-sketch",
      "001-physical-product-design/phora-packaging-02",
      "001-physical-product-design/nightstand-001-cad",
      "001-physical-product-design/nightstand-001-print-01",
    ],
    links: { live: null, github: null, deck: null, video: null },
    page: false,
    featured: false,
  },
  {
    number: "002",
    slug: "ag-news-classifier",
    title: "AG News text classifier",
    context: "IDSN 542 Intro to Machine Intelligence",
    term: "Fall 2025",
    year: "2025",
    type: "howto",
    role: "Everything",
    team: null,
    overview:
      "A news-headline classifier built three ways. Naive Bayes, a linear SVM and a random forest all landed between 0.96 and 0.98 AUC, so the simplest and fastest one won, and the project turned from chasing a neural net to deploying the model.",
    media: [
      "002-ag-news-classifier/roc-curves",
      "002-ag-news-classifier/slide-03",
      "002-ag-news-classifier/slide-07",
      "002-ag-news-classifier/slide-11",
    ],
    links: {
      live: null,
      github: null,
      deck: "/marshal/docs/ag-news-classifier-deck.pdf",
      video: "002-ag-news-classifier/final-presentation",
    },
    page: false,
    featured: false,
  },
  {
    number: "003",
    slug: "echo-chain",
    title: "Echo Chain",
    context: "IDSN 536, team DELTA",
    term: "Spring 2026",
    year: "2026",
    type: "gallery",
    role: "Firmware, relay server, protocol, web UI",
    team: ["Marshal Aldoph", "YiYing"],
    overview:
      "Two small instruments in two rooms. Press a note on one and the other lights and sounds in under 200 milliseconds. I wrote the firmware, the relay and the web client; my partner YiYing led concept and brand.",
    media: [
      "003-echo-chain/clips/playing-the-finished-device",
      "003-echo-chain/build-01-first-button",
      "003-echo-chain/build-04-breadboard",
      "003-echo-chain/enclosure-lasercut-02",
      "003-echo-chain/enclosure-cad-02",
      "003-echo-chain/enclosure-printing-02",
      "003-echo-chain/enclosure-printed-04",
    ],
    links: {
      live: "https://echo-chain-relay-7a6752ad0567.herokuapp.com/",
      // The remote is under YiYing's account (github.com/zhuyeye2001313-rgb/Echo-Chain) and
      // is public, but it is hers: left null until the founder confirms it is fine to link.
      github: null,
      deck: null,
      video: null,
    },
    page: false,
    featured: true,
  },
  {
    number: "004",
    slug: "olympic-readiness-index",
    title: "Olympic Readiness Index",
    context: "IDSN 530",
    term: "Spring 2026",
    year: "2026",
    type: "howto",
    role: "Group lead and data pipelines",
    team: ["Khoi Nguyen", "Rachel Wang", "Marshal Aldoph", "Darren Tsang"],
    overview:
      "An interactive globe that scores cities on their readiness to host the Olympics across economics, infrastructure and sustainability. Of 35 host cities since 1960, one Summer Games turned a profit. I led the group of four: assigned roles by skill, built the data pipelines, connected the database, API and front end, and oversaw the build end to end.",
    media: [
      "004-olympic-readiness-index/walkthrough-03",
      "004-olympic-readiness-index/walkthrough-00",
    ],
    links: {
      // 000 from this session on Nov 23 (the brief had it responding earlier that day):
      // unverified, so the link stays off until the founder confirms the server is up.
      live: null,
      // 404 on Nov 23: private or missing, so no GitHub control until it is public.
      github: null,
      deck: null,
      video: null,
    },
    page: false,
    featured: false,
  },
  {
    number: "005",
    slug: "figma-cash-flow",
    title: "Figma: a 12-month cash-flow forecast",
    context: "IDSN 577 Finance for Entrepreneurs",
    term: "Fall 2026",
    year: "2026",
    type: "gallery",
    role: "Everything",
    team: null,
    overview:
      "Profit is an opinion; cash is a decision. A 12-month forecast for a company that lost $1.25B on paper and still made $243M in free cash flow, and the three dials that could break it.",
    media: [
      "005-figma-cash-flow/slide-01",
      "005-figma-cash-flow/slide-02",
      "005-figma-cash-flow/slide-06",
      "005-figma-cash-flow/slide-09",
    ],
    links: {
      live: null,
      github: null,
      deck: "/marshal/docs/figma-cash-flow-deck.pdf",
      video: "005-figma-cash-flow/forecast-walkthrough",
    },
    page: false,
    featured: false,
  },
  {
    number: "006",
    slug: "take-phone",
    title: "The Take Phone",
    context: "IDSN 599 Product Management",
    term: "Fall 2026",
    year: "2026",
    type: "gallery",
    role: "Market sizing, competitive landscape, pro forma and use of funds",
    team: [
      "Erica Spievack",
      "Arohee Agrawal",
      "Shriya Karuturi",
      "Tim Li",
      "Marshal Aldoph",
      "Tolulope Oluyadi",
    ],
    overview:
      "A fashion-forward second phone that keeps everything a smartphone does except social media. I owned the numbers: how big the market is, who else is in it, and what it costs to get there.",
    media: ["006-take-phone/product-render"],
    links: { live: null, github: null, deck: null, video: null },
    page: true,
    featured: true,
  },
  {
    number: "007",
    slug: "solomon",
    title: "Solomon",
    context: "Squaloo",
    term: "Fall 2026",
    year: "2026",
    type: "gallery",
    role: "Founder",
    team: null,
    overview:
      "AI for the people who keep machines running: answers at the machine, offline, on hardware the plant owns, with receipts.",
    media: [
      "007-solomon/fleet-01",
      "007-solomon/ignite-slide-06",
      "007-solomon/meridian-table-go-board",
      "007-solomon/meridian-pitch-03",
      "007-solomon/diagnostic-card-e207",
    ],
    // The founder has YouTube links for the Solomon demo and the Meridian video; add them
    // as links.video (and the entry's "View" stays on /solomon) once he sends them.
    links: { live: "/solomon", github: null, deck: null, video: null },
    page: false,
    featured: true,
  },
];

/** The compact list under the timeline. */
export type MoreWork = {
  title: string;
  context: string;
  year: string | null;
  line: string;
  href: string | null;
  image?: MediaKey;
};

export const MORE_WORK: readonly MoreWork[] = [
  {
    title: "The Marshal-QR go board",
    context: "Squaloo",
    year: "2024",
    line: "A working QR code on a hand-made go board.",
    href: "/marshal-qr/blog/go-board-to-grad-school",
    image: "007-solomon/meridian-table-go-board",
  },
  {
    title: "Arduino labs",
    context: "IDSN 536 Physical Computing",
    year: "2026",
    line: "A semester of weekly builds: LEDs, a buzzer, a servo, a DHT11 sensor and an IR remote, ahead of Echo Chain.",
    href: null,
    image: "cards/arduino-labs",
  },
  {
    title: "Ethical analysis of Uber’s driver management system",
    context: "IDSN 599 Design Strategy",
    year: "2026",
    line: "An individual analysis, in eight slides.",
    href: null,
    image: "cards/uber-ethics-cover",
  },
  {
    title: "Handled",
    context: "IDSN 599",
    year: "2026",
    line: "A 36-month pro forma.",
    href: null,
  },
  {
    title: "Amak data sandbox",
    context: "IDSN 530",
    year: "2026",
    line: "Charts and a marketing dashboard built on sample data.",
    href: null,
  },
  {
    title: "Edge AI",
    context: "IDSN 599 A3",
    year: "2026",
    line: "Five slides on edge AI: the first place Solomon appears in this course.",
    href: null,
    image: "cards/a3-edge-ai-cover",
  },
  {
    title: "Tunity creator dashboard",
    context: "IDSN 599 Product Management",
    year: "2026",
    line: "A dashboard mockup built from another team’s PRD in a cross-team exercise.",
    href: null,
    image: "cards/tunity-dashboard-mockup",
  },
  {
    title: "Reformation case analysis",
    context: "IDSN 577, with Ayla Schorn, Moe Htet, Jade Sun and Doyun Kim",
    year: "2026",
    line: "A group case analysis. My part: the financial analysis and data pack.",
    href: null,
    image: "cards/reformation-store-payback",
  },
  {
    title: "Valuing Anthropic by the VC method",
    context: "IDSN 577, same group",
    year: "2026",
    line: "A venture-capital-method valuation, with the model behind it.",
    href: null,
    image: "cards/anthropic-valuation",
  },
  {
    title: "Remora",
    context: "Squaloo",
    year: null,
    line: "A video vending machine. Insert a coin. Pick a slot. Something drops.",
    href: "/remora",
  },
  {
    title: "Amak",
    context: "Squaloo",
    year: "2025",
    line: "The prior venture, where the One Brain, Two Bodies protocol was first conceived.",
    href: "/amak",
  },
  {
    title: "opn-src.hstl",
    context: "Squaloo",
    year: null,
    line: "Earlier experiments and prior-era pages, preserved.",
    href: "/archive",
  },
  {
    title: "The QR Matrix",
    context: "Hardware and prototyping",
    year: null,
    line: "Built a Version 2 QR code from first principles using a custom go board as the physical matrix. Full implementation of Reed-Solomon error correction and mask pattern encoding — no libraries, no shortcuts.",
    href: "/marshal-qr",
  },
  {
    title: "Customer Acquisition Loop",
    context: "Pacific Life, enterprise systems",
    year: null,
    line: "Architected and deployed the Customer Acquisition Loop (CAL) — end-to-end automation of web data integration and social media lead capture across an enterprise MarTech stack.",
    href: null,
  },
];

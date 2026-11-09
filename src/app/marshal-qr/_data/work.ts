/**
 * The work list (SQU-427). The front door shows it compactly; a later
 * /marshal-qr/bof page (IDSN 599) grows from the same entries without
 * touching the front door.
 *
 * Sources: the entries are the founder's brief's list. Each one-liner is the
 * linked page's own description where one exists (/remora's metadata,
 * /archive's entry for Amak, the go-board post's date); otherwise the
 * brief's words. A year nobody has sourced is null and isn't rendered,
 * rather than guessed.
 */
export type WorkEntry = {
  title: string;
  year: string | null;
  line: string;
  role: string;
  href: string | null;
  featured: boolean;
};

export const WORK: readonly WorkEntry[] = [
  {
    title: "Solomon",
    year: "2026",
    line: "The prototype that answers at the machine, offline.",
    role: "Founder",
    href: "/solomon",
    featured: true,
  },
  {
    title: "Remora",
    year: null,
    line: "A video vending machine. Insert a coin. Pick a slot. Something drops.",
    role: "Builder",
    href: "/remora",
    featured: false,
  },
  {
    title: "Amak",
    year: "2025",
    line: "The prior venture, where the One Brain, Two Bodies protocol was first conceived.",
    role: "Founder",
    href: "/amak",
    featured: false,
  },
  {
    title: "opn-src.hstl",
    year: null,
    line: "Earlier experiments and prior-era pages, preserved.",
    role: "Builder",
    href: "/archive",
    featured: false,
  },
  {
    title: "AG News text classifier",
    year: null,
    line: "TF-IDF with naive Bayes, SVC and random forest under GridSearchCV, ROC per class. IDSN 542 final.",
    role: "Student",
    href: null,
    featured: false,
  },
  { title: "12-month cash-flow forecast", year: null, line: "Deck, report and video. IDSN 577.", role: "Student", href: null, featured: false },
  { title: "Olympics viability simulator", year: null, line: "A web simulator. IDSN 530.", role: "Student", href: null, featured: false },
  {
    title: "EchoChain",
    year: null,
    line: "Physical computing: Arduino and printed parts. IDSN 536.",
    role: "Student",
    href: null,
    featured: false,
  },
  {
    title: "The Marshal-QR go board",
    year: "2024",
    line: "A working QR code on a hand-made go board.",
    role: "Maker",
    href: "/marshal-qr/blog/go-board-to-grad-school",
    featured: true,
  },
];

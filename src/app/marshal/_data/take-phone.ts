/**
 * The Take Phone long-scroll (SQU-461): every word and number on
 * /marshal/take-phone lives here, so the founder can edit it into his voice
 * in one place.
 *
 * Draft copy, drawn from the team's deck (the IDSN 599 Birds of a Feather
 * presentation, Fall 2026) and the founder's working notes. Section 10,
 * "What I took from it", is his to write: `reflection` stays empty until the
 * interview, and an empty section renders nothing.
 *
 * Publishing rules that shape this file: classmates are credited by name
 * only; deck slides 1, 5, 9 and 10 carry stock and reference photography the
 * team does not own and are restated as text, never shown; Take's features
 * are labelled "proposed" and competitors' "verified", on purpose.
 */
import type { MediaKey } from "./media";

export type Block =
  | { kind: "p"; text: string }
  | { kind: "h3"; text: string }
  | { kind: "figure"; media: MediaKey; caption?: string; wide?: boolean }
  | { kind: "math"; title?: string; rows: { label: string; value: string; note?: string }[]; result?: string }
  | { kind: "columns"; items: { title: string; points: string[] }[] }
  | { kind: "list"; items: string[] }
  | { kind: "table"; caption: string; head: string[]; rows: string[][]; note?: string }
  | { kind: "callout"; text: string };

export type Section = {
  id: string;
  /** Mono eyebrow above the heading. */
  label: string;
  heading: string;
  /** Marks a section that is the team's work rather than the founder's own. */
  credit?: string;
  blocks: Block[];
};

export type TakePhone = {
  title: string;
  tagline: string;
  /** One sentence for metadata, the unfurl and llms.txt. */
  description: string;
  price: string;
  hero: MediaKey;
  deck: string;
  glance: { label: string; value: string }[];
  team: string[];
  sections: Section[];
  /** TODO(marshal): in the founder's words; empty renders nothing. */
  reflection: string[];
  links: { label: string; href: string }[];
};

export const TAKE_PHONE: TakePhone = {
  title: "The Take Phone",
  tagline: "The second phone for your day.",
  description:
    "A fashion-forward second phone that keeps everything a smartphone does except social media: the IDSN 599 semester project, and my part in it — market sizing, the competitive landscape, the pro forma and use of funds.",
  price: "$375",
  hero: "006-take-phone/product-render",
  deck: "/marshal/docs/take-phone-deck.pdf",
  glance: [
    { label: "Organization", value: "USC Iovine and Young Academy, IDSN 599 Product Management, Fall 2026" },
    { label: "Team", value: "Erica Spievack, Arohee Agrawal, Shriya Karuturi, Tim Li, Marshal Aldoph, Tolulope Oluyadi" },
    { label: "My role", value: "Market sizing, competitive landscape, pro forma and use of funds" },
    { label: "Format", value: "Birds of a Feather semester project, presented in class, Fall 2026" },
  ],
  team: [
    "Erica Spievack",
    "Arohee Agrawal",
    "Shriya Karuturi",
    "Tim Li",
    "Marshal Aldoph",
    "Tolulope Oluyadi",
  ],
  sections: [
    {
      id: "challenge",
      label: "The challenge",
      heading: "More connected than ever, less present in the room",
      blocks: [
        {
          kind: "p",
          text: "Gen Z is more connected than ever and more disconnected from the room they are in. More than half spend four or more hours a day on social media (Pew, March 2024). They do not want to quit it; they want their attention back.",
        },
        {
          kind: "p",
          text: "The existing answers each give something up. App blockers get overridden. Dumb phones give up maps, payments and the camera.",
        },
      ],
    },
    {
      id: "idea",
      label: "The idea",
      heading: "A second phone for your day",
      blocks: [
        {
          kind: "p",
          text: "A fashion-forward secondary phone: calls, texts, maps, rideshare, music, banking, two cameras, and no social media in apps or in the browser. You take it out; your smartphone stays home. Capture now, sync to your main phone, post later.",
        },
        {
          kind: "columns",
          items: [
            { title: "Design", points: ["Slim flip, early-2000s look", "Touchscreen top, QWERTY keys below", "Silver, black and pink finishes", "2 cameras! One high-res and one digital Y2k/film inspired"] },
            { title: "Connected", points: ["Calls, texts and video calls", "Email and a full web browser", "Docs and calendar for work and school"] },
            { title: "Essentials", points: ["Maps, GPS and Uber", "Music streaming", "Mobile banking and payments"] },
            { title: "Create", points: ["Pro camera for photos and video", "Retro camcorder for early-2000s clips", "Sync to your main phone, post later"] },
            { title: "No social media", points: ["Instagram, TikTok, Snapchat and X blocked", "In apps and in the browser", "Nothing to override"] },
          ],
        },
        { kind: "callout", text: "$375" },
      ],
    },
    {
      id: "audience",
      label: "Who it is for",
      heading: "The Present Trendsetter",
      blocks: [
        {
          kind: "p",
          text: "18 to 30, in LA and New York, style-conscious, sets screen-time limits and then undoes them.",
        },
        { kind: "callout", text: "Offline is the new luxury." },
      ],
    },
    {
      id: "market-sizing",
      label: "My part 1",
      heading: "How big is it",
      blocks: [
        { kind: "figure", media: "006-take-phone/tam-sam-som" },
        {
          kind: "math",
          title: "Total addressable market",
          rows: [
            { label: "U.S. adults 18–29", value: "55.3M" },
            { label: "× with a smartphone", value: "94%" },
            { label: "× say they spend too much time on it", value: "70%" },
          ],
          result: "= 36.4M people · $13.65B at $375",
        },
        {
          kind: "math",
          title: "Serviceable market",
          rows: [
            { label: "× tried to cut back in the past year", value: "58%" },
            { label: "× have the discretionary budget", value: "50%", note: "team assumption" },
          ],
          result: "= 10.55M people · $3.96B",
        },
        {
          kind: "p",
          text: "The obtainable slice by year three is 25,000 to 50,000 units, about $14M, bracketed by what existing minimalist phones actually sell.",
        },
        {
          kind: "p",
          text: "The 50% is a team assumption, not a measurement. Nobody surveyed who has $375 to spare for a second phone, and everything below that line scales with it.",
        },
      ],
    },
    {
      id: "competition",
      label: "My part 2",
      heading: "Who else is in it",
      blocks: [
        { kind: "figure", media: "006-take-phone/competitive-landscape-2x2" },
        {
          kind: "p",
          text: "Every competitor price was re-verified against the maker’s own store on October 16, and it changed the picture. The Light Phone III was $899, not the $699–799 the team had. The “Minimal Phone at $399” was now the Minimal Phone 2 at $599, with full Android, so it does not block feeds at all.",
        },
        {
          kind: "p",
          text: "And Light had launched the Light Flip in July: $349, six colors, a camera, maps, rideshare. It sits inside the quadrant the team had called open water.",
        },
        {
          kind: "table",
          caption: "Proposed and verified capabilities, as of October 16, 2026",
          head: ["Capability", "Take Phone", "Light Phone III", "Light Flip", "Minimal Phone 2", "Mudita Kompakt", "Unpluq"],
          rows: [
            ["Calls and messaging", "Proposed", "Verified", "Verified", "Verified", "Verified", "Uses current phone"],
            ["Camera", "Proposed", "Verified", "Verified", "Verified", "Not offered", "Uses current phone"],
            ["Navigation", "Proposed", "Verified", "Verified", "Verified", "Verified", "Uses current phone"],
            ["Ride-hailing", "Proposed", "Verified", "Verified", "Verified", "Not offered", "Uses current phone"],
            ["Digital payments", "Proposed", "Not verified", "Not verified", "Verified", "Not offered", "Uses current phone"],
            ["Blocks social feeds", "Intended", "No social apps", "No social apps", "No", "No app store by default", "Selected apps"],
            ["Control model", "Secondary phone", "Focused OS", "Feature phone", "Full Android", "Focused OS", "NFC tag + app"],
          ],
          note: "Sources: each maker’s own store, checked October 16, 2026. Take Phone features are proposed; competitor features are verified.",
        },
        {
          kind: "p",
          text: "That forced a sharper answer to “why Take”: the second-device model, create-now-post-later, and the phone as something you wear. In the table, Take’s features are labeled “proposed” and competitors’ “verified,” on purpose.",
        },
      ],
    },
    {
      id: "pro-forma",
      label: "My part 3",
      heading: "What it costs to get there",
      blocks: [
        { kind: "figure", media: "006-take-phone/pro-forma-use-of-funds" },
        {
          kind: "p",
          text: "A 36-month model in the course’s template, every monthly cell a formula. Calibrated to the deck’s own targets: 250 units at launch, growing 9% a month, gives 5,036 units and $1.96M in the first selling year. Gross margin is 48%, and EBITDA turns positive in November 2028.",
        },
        {
          kind: "p",
          text: "The low point of cumulative cash is $1.92M. That number, not a round guess, is where the $3.3M ask comes from: pre-launch plus the first twelve selling months with a 10% reserve, 1.7 times the peak need.",
        },
      ],
    },
    {
      id: "strategy",
      label: "The rest of the strategy",
      heading: "From accessory to cultural movement",
      credit: "The team’s",
      blocks: [
        { kind: "figure", media: "006-take-phone/blue-ocean-value-map" },
        {
          kind: "p",
          text: "The positioning and launch plan are the team’s work, not mine: a strategy canvas that sets Take apart on design and on blocking social media, and a launch built on creator events, campus ambassadors and limited colorways.",
        },
      ],
    },
  ],
  // TODO(marshal): three short paragraphs from the interview — what re-verifying the
  // competitors taught you, what you would test first if this were real, and what you
  // would change about the plan. Empty renders nothing.
  reflection: [],
  links: [
    { label: "Full deck (PDF, 17 slides)", href: "/marshal/docs/take-phone-deck.pdf" },
    { label: "← Back to all work", href: "/marshal#work" },
  ],
};

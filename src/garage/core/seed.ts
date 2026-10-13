/**
 * A CoWork seed row becomes a library page. The researcher writes scrub flags and lanes in
 * prose; the database holds them as options with no commas in their names, so each phrase
 * is matched to its option here, and whatever does not match stays in the page body where
 * nothing is lost. Pure.
 */
export const SCRUB_OPTIONS: readonly { option: string; matches: RegExp }[] = [
  { option: "one network only", matches: /one network only/i },
  { option: "request share not visitor share", matches: /request share not visitor share/i },
  { option: "bot is not agent", matches: /bot is not agent/i },
  { option: "no method stated", matches: /no method stated/i },
  { option: "promotional", matches: /\bpromotional\b/i },
  { option: "projection not measurement", matches: /projection not measurement/i },
  { option: "no measurement (theory or position)", matches: /no measurement/i },
  { option: "primary not opened", matches: /primary not opened/i },
  { option: "abstract only", matches: /abstract only/i },
  { option: "demand not public (staff or simulated)", matches: /demand not public/i },
  { option: "single operator (one shop)", matches: /single operator/i },
  { option: "preview not shipped at volume", matches: /preview,? not shipped/i },
  { option: "lab sample (surveys or hypothetical)", matches: /lab sample/i },
  { option: "mirror of a dead original", matches: /mirror,? original dead|mirror of a dead/i },
  { option: "scale mismatch", matches: /scale mismatch/i },
  { option: "stale window", matches: /stale window/i },
  { option: "text-only detection", matches: /text-only detection/i },
  { option: "popular sites only", matches: /popular sites only/i },
  { option: "heuristic bot labels", matches: /heuristic bot labels/i },
  { option: "packet-level not HTTP", matches: /packet-level not HTTP/i },
  { option: "bytes not requests", matches: /bytes not requests/i },
  { option: "single-actor dominated", matches: /single-actor dominated/i },
  { option: "publishing is not consuming", matches: /publishing is not consuming/i },
  { option: "native-app referrals invisible", matches: /native-app referrals invisible/i },
  { option: "guarantee disclaimed", matches: /guarantee disclaimed/i },
  { option: "regulator cites others", matches: /regulator cites others/i },
  { option: "US jurisdiction only", matches: /US jurisdiction only/i },
  { option: "staff report not a rule", matches: /staff report,? not a rule/i },
  { option: "US panel only", matches: /US panel only/i },
];

export function scrubOptions(prose: string): string[] {
  return SCRUB_OPTIONS.filter((s) => s.matches.test(prose)).map((s) => s.option);
}

export const LANE_OPTIONS: readonly { option: string; matches: RegExp }[] = [
  { option: "1 tiny-N inference", matches: /^1\b|tiny N/i },
  { option: "2 agent shops", matches: /^2\b|agents running shops/i },
  { option: "3 agent commerce specs", matches: /^3\b|agent commerce/i },
  { option: "4 micropayments and credits", matches: /^4\b|micropayments/i },
  { option: "5 deceptive patterns", matches: /^5\b|deceptive patterns/i },
  { option: "6 discovery for agents", matches: /^6\b|discovery for agents/i },
  { option: "7 bots on small sites", matches: /^7\b|bots on small sites/i },
  { option: "8 agent failure modes", matches: /^8\b|failure modes/i },
];

export function laneOption(prose: string): string | null {
  return LANE_OPTIONS.find((l) => l.matches.test(prose.trim()))?.option ?? null;
}

export const KINDS = ["paper", "article", "dashboard", "doc", "synthesis-note"] as const;
export const CLASSES = ["bot-traffic", "agent-commerce", "pricing", "conversion", "web-performance", "design", "privacy", "instrumentation", "llm-discovery"] as const;

export type SeedPage = {
  name: string;
  url: string;
  ident: string;
  kind: string | null;
  classes: string[];
  scrub: string[];
  scrubProse: string;
  summary: string;
  grounds: string;
  status: string;
  added: string;
  addedBy: string;
  lane: string | null;
  verification: string;
};

/** One CSV record → the page to create. Returns null without a Name. */
export function seedPage(r: Record<string, string>): SeedPage | null {
  const name = (r.Name ?? "").trim();
  if (!name) return null;
  const kind = (r.Kind ?? "").trim().toLowerCase();
  const classes = (r.Classes ?? "")
    .split(",")
    .map((c) => c.trim().toLowerCase())
    .filter((c) => (CLASSES as readonly string[]).includes(c));
  const scrubProse = (r.Scrub ?? "").trim();
  return {
    name,
    url: (r.URL ?? "").trim(),
    ident: (r.ID ?? "").trim(),
    kind: (KINDS as readonly string[]).includes(kind) ? kind : null,
    classes,
    scrub: scrubOptions(scrubProse),
    scrubProse,
    summary: (r.Summary ?? "").trim(),
    grounds: (r.Grounds ?? "").trim(),
    status: (r.Status ?? "Unclaimed").trim() || "Unclaimed",
    added: (r.Added ?? "").trim(),
    addedBy: (r["Added by"] ?? "").trim(),
    lane: laneOption(r.Lane ?? ""),
    verification: (r.Verification ?? "").trim(),
  };
}

/** Notion's properties object for a seed page. Text is chunked under the 2000-character block limit. */
export function seedProperties(p: SeedPage): Record<string, unknown> {
  const rich = (s: string) => ({ rich_text: chunks(s).map((t) => ({ type: "text", text: { content: t } })) });
  const props: Record<string, unknown> = {
    Name: { title: [{ type: "text", text: { content: p.name.slice(0, 1900) } }] },
    Summary: rich(p.summary),
    Grounds: rich(p.grounds),
    Verification: rich(p.verification),
    "Added by": rich(p.addedBy),
    ID: rich(p.ident),
    Status: { select: { name: p.status } },
    Classes: { multi_select: p.classes.map((name) => ({ name })) },
    Scrub: { multi_select: p.scrub.map((name) => ({ name })) },
  };
  if (p.url) props.URL = { url: p.url };
  if (p.kind) props.Kind = { select: { name: p.kind } };
  if (p.lane) props.Lane = { select: { name: p.lane } };
  if (/^\d{4}-\d{2}-\d{2}$/.test(p.added)) props.Added = { date: { start: p.added } };
  return props;
}

/** The page body: the scrub prose as written (nothing lost to the option list) and the empty note sections. */
export function seedChildren(p: SeedPage): unknown[] {
  const para = (t: string) => ({ object: "block", type: "paragraph", paragraph: { rich_text: chunks(t).map((c) => ({ type: "text", text: { content: c } })) } });
  const h2 = (t: string) => ({ object: "block", type: "heading_2", heading_2: { rich_text: [{ type: "text", text: { content: t } }] } });
  const out: unknown[] = [h2("Scrub, as written"), para(p.scrubProse || "(none)"), h2("Notes (wrasse)"), para("(none yet)"), h2("Founder's fold-back"), para("(empty)")];
  return out;
}

function chunks(s: string, size = 1900): string[] {
  if (!s) return [];
  const out: string[] = [];
  for (let i = 0; i < s.length; i += size) out.push(s.slice(i, i + size));
  return out;
}

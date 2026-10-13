/**
 * The instrument's pure half: what one request becomes before it is counted. A hit is a
 * day, a normalized path, a visitor kind, a family name, and a referrer host. Never an
 * address, never a raw user agent, never a query string, never a cookie. Pure.
 */
export type VisitorKind = "browser" | "agent" | "ai-crawler" | "crawler" | "monitor" | "tool" | "unknown";

export type Hit = {
  path: string;
  method: string;
  kind: VisitorKind;
  /** The product behind the visit, lowercased: "chrome", "claude-user", "curl". "" when unknown. */
  family: string;
  /** Host only, "" when none or same-site. */
  refHost: string;
};

type Rule = { kind: VisitorKind; re: RegExp; family?: string };

/**
 * First match wins, so the specific lines come before the broad ones. Agents acting for a
 * person come before the crawlers that train; both come before the browsers they imitate.
 */
export const VISITOR_RULES: readonly Rule[] = [
  // Agents: fetch on behalf of a person, right now.
  { kind: "agent", re: /Claude-User/i, family: "claude-user" },
  { kind: "agent", re: /Claude-SearchBot/i, family: "claude-searchbot" },
  { kind: "agent", re: /ChatGPT-User/i, family: "chatgpt-user" },
  { kind: "agent", re: /OAI-SearchBot/i, family: "oai-searchbot" },
  { kind: "agent", re: /Perplexity-User/i, family: "perplexity-user" },
  { kind: "agent", re: /DuckAssistBot/i, family: "duckassistbot" },
  { kind: "agent", re: /Google-CloudVertexBot/i, family: "vertexbot" },
  { kind: "agent", re: /\bOperator\b|\bagentic\b|Browserbase|Browser Use|Playwright|HeadlessChrome/i, family: "agentic-browser" },
  // AI crawlers: fetch to train or to index for answers.
  { kind: "ai-crawler", re: /ClaudeBot|anthropic-ai/i, family: "claudebot" },
  { kind: "ai-crawler", re: /GPTBot/i, family: "gptbot" },
  { kind: "ai-crawler", re: /PerplexityBot/i, family: "perplexitybot" },
  { kind: "ai-crawler", re: /Google-Extended/i, family: "google-extended" },
  { kind: "ai-crawler", re: /Applebot-Extended/i, family: "applebot-extended" },
  { kind: "ai-crawler", re: /Meta-ExternalAgent|FacebookBot/i, family: "meta-externalagent" },
  { kind: "ai-crawler", re: /Bytespider/i, family: "bytespider" },
  { kind: "ai-crawler", re: /CCBot/i, family: "ccbot" },
  { kind: "ai-crawler", re: /Amazonbot/i, family: "amazonbot" },
  { kind: "ai-crawler", re: /cohere-ai|YouBot|Diffbot|omgili|ImagesiftBot|Timpibot/i, family: "ai-crawler" },
  // Monitors, before the generic crawler line, because "UptimeRobot" ends in bot.
  // Monitors.
  { kind: "monitor", re: /UptimeRobot|Pingdom|StatusCake|Site24x7|Better ?Uptime|checkly|vercel-screenshot|vercel-favicon|Vercel Edge/i, family: "monitor" },
  // Search and link crawlers.
  { kind: "crawler", re: /Googlebot|AdsBot-Google|Google-InspectionTool/i, family: "googlebot" },
  { kind: "crawler", re: /bingbot|BingPreview/i, family: "bingbot" },
  { kind: "crawler", re: /DuckDuckBot/i, family: "duckduckbot" },
  { kind: "crawler", re: /Applebot/i, family: "applebot" },
  { kind: "crawler", re: /YandexBot|Baiduspider|PetalBot|SeznamBot/i, family: "search-crawler" },
  { kind: "crawler", re: /AhrefsBot|SemrushBot|MJ12bot|DotBot|BLEXBot|DataForSeoBot/i, family: "seo-crawler" },
  { kind: "crawler", re: /facebookexternalhit|Twitterbot|LinkedInBot|Slackbot|Discordbot|TelegramBot|WhatsApp|Pinterestbot/i, family: "link-preview" },
  { kind: "crawler", re: /bot\b|crawler|spider/i, family: "crawler" },
  // Tools: a script or a shell, not a product.
  { kind: "tool", re: /\bcurl\//i, family: "curl" },
  { kind: "tool", re: /\bWget\//i, family: "wget" },
  { kind: "tool", re: /python-requests|python-urllib|httpx\/|aiohttp\//i, family: "python" },
  { kind: "tool", re: /node-fetch|undici|axios\/|\bnode\b/i, family: "node" },
  { kind: "tool", re: /Go-http-client/i, family: "go" },
  { kind: "tool", re: /okhttp|Java\/|Apache-HttpClient/i, family: "java" },
  { kind: "tool", re: /PostmanRuntime|insomnia/i, family: "api-client" },
  // Browsers, last, because every crawler above wears "Mozilla/5.0".
  { kind: "browser", re: /\bEdg(e|A|iOS)?\//i, family: "edge" },
  { kind: "browser", re: /\bOPR\/|Opera/i, family: "opera" },
  { kind: "browser", re: /\bFirefox\/|FxiOS/i, family: "firefox" },
  { kind: "browser", re: /\bChrome\/|CriOS/i, family: "chrome" },
  { kind: "browser", re: /\bSafari\//i, family: "safari" },
  { kind: "browser", re: /^Mozilla\//i, family: "browser" },
];

export function classifyVisitor(userAgent: string | null | undefined): { kind: VisitorKind; family: string } {
  const ua = (userAgent ?? "").trim();
  if (ua === "") return { kind: "unknown", family: "" };
  for (const r of VISITOR_RULES) {
    if (r.re.test(ua)) return { kind: r.kind, family: r.family ?? r.kind };
  }
  return { kind: "unknown", family: "" };
}

const ID_SEGMENT = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|[0-9a-f]{12,}|card_[0-9a-f]{6,}|rc_[A-Za-z0-9_-]{20,}|\d{4,})$/i;

/** Lowercase, no query, no trailing slash, ids and hashes folded to ":id", at most 120 chars. */
export function normalizePath(pathname: string): string {
  const noQuery = pathname.split("?")[0].split("#")[0];
  const parts = noQuery
    .split("/")
    .filter((p) => p.length > 0)
    .map((p) => (ID_SEGMENT.test(p) ? ":id" : p.toLowerCase()));
  const out = "/" + parts.join("/");
  return out.length > 120 ? out.slice(0, 120) : out;
}

/** The referrer's host, or "" for none, garbage, or our own site. */
export function referrerHost(referrer: string | null | undefined, ownHosts: readonly string[] = ["squaloo.com", "www.squaloo.com", "localhost"]): string {
  if (!referrer) return "";
  try {
    const h = new URL(referrer).hostname.toLowerCase();
    return ownHosts.includes(h) ? "" : h.slice(0, 80);
  } catch {
    return "";
  }
}

/** Requests the instrument leaves alone: the Garage's own pane of glass, and static files. */
export function isCountable(pathname: string): boolean {
  if (pathname === "/garage" || pathname.startsWith("/garage/") || pathname.startsWith("/api/garage")) return false;
  if (pathname.startsWith("/_next/") || pathname === "/favicon.ico") return false;
  if (/\.(?:png|jpe?g|gif|svg|ico|webp|avif|css|js|map|woff2?|ttf|otf|mp4|webm|mp3)$/i.test(pathname)) return false;
  return true;
}

export function hitOf(req: { pathname: string; method: string; userAgent: string | null; referrer: string | null }): Hit {
  const { kind, family } = classifyVisitor(req.userAgent);
  return { path: normalizePath(req.pathname), method: req.method.toUpperCase().slice(0, 8), kind, family, refHost: referrerHost(req.referrer) };
}

/** The summary as lines for the CLI and for wrasse's prompt: every number with its window. */
export function hitsLines(s: {
  days: number;
  total: number;
  byKind: { kind: string; n: number }[];
  byDay: { day: string; kind: string; n: number }[];
  topPaths: { path: string; kind: string; n: number }[];
  families: { family: string; kind: string; n: number }[];
  referrers: { refHost: string; n: number }[];
  firstHitAt: string | null;
}): string[] {
  const out: string[] = [];
  const window = `last ${s.days} day${s.days === 1 ? "" : "s"} to now, UTC`;
  if (s.total === 0) return [`no hits in the ${window}${s.firstHitAt ? "" : "; the instrument has never recorded one"}`];
  out.push(`${s.total} hits, ${window}, counting since ${s.firstHitAt ? s.firstHitAt.slice(0, 16).replace("T", " ") + "Z" : "?"}`);
  out.push("by kind: " + s.byKind.map((k) => `${k.kind} ${k.n} (${Math.round((100 * k.n) / s.total)}%)`).join(" · "));
  const days = [...new Set(s.byDay.map((d) => d.day))];
  for (const day of days) {
    out.push(`${day}: ` + s.byDay.filter((d) => d.day === day).map((d) => `${d.kind} ${d.n}`).join(" · "));
  }
  out.push("top paths: " + s.topPaths.slice(0, 12).map((p) => `${p.path} ${p.kind} ${p.n}`).join(" · "));
  if (s.families.length) out.push("families: " + s.families.slice(0, 12).map((f) => `${f.family} ${f.n}`).join(" · "));
  if (s.referrers.length) out.push("referrers: " + s.referrers.slice(0, 8).map((r) => `${r.refHost} ${r.n}`).join(" · "));
  return out;
}

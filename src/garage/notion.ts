/**
 * Notion, the I/O half: the library database read with an integration token that lives on
 * the host and never in the agent's environment (guard 5), and a study report filed as a
 * page under the Library's report page. No SDK: two fetches against the public API.
 *
 * Env: GARAGE_NOTION_TOKEN (an internal integration the Library is shared with),
 *      GARAGE_LIBRARY_DB (the database id), GARAGE_REPORT_PAGE (the parent page for reports).
 */
import { parseLibraryQuery, type LibraryRow } from "./core/notion.ts";
import { primaryUrl } from "./core/library.ts";

const API = "https://api.notion.com/v1";
const VERSION = "2022-06-28";

export function notionWired(): { token: boolean; db: boolean; reportPage: boolean } {
  return {
    token: typeof process.env.GARAGE_NOTION_TOKEN === "string" && process.env.GARAGE_NOTION_TOKEN.length > 0,
    db: typeof process.env.GARAGE_LIBRARY_DB === "string" && process.env.GARAGE_LIBRARY_DB.length > 0,
    reportPage: typeof process.env.GARAGE_REPORT_PAGE === "string" && process.env.GARAGE_REPORT_PAGE.length > 0,
  };
}

async function call(path: string, method: "GET" | "POST" | "PATCH", body?: unknown): Promise<unknown> {
  const token = process.env.GARAGE_NOTION_TOKEN;
  if (!token) throw new Error("GARAGE_NOTION_TOKEN is not set; the library has no home");
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, "Notion-Version": VERSION, "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = (await res.json()) as { message?: string };
  if (!res.ok) throw new Error(`Notion ${res.status}${json.message ? `: ${json.message}` : ""}`);
  return json;
}

/** Every row of the library, following the cursor. */
export async function pullLibrary(): Promise<{ rows: LibraryRow[]; databaseId: string }> {
  const databaseId = process.env.GARAGE_LIBRARY_DB;
  if (!databaseId) throw new Error("GARAGE_LIBRARY_DB is not set");
  const rows: LibraryRow[] = [];
  let cursor: string | null = null;
  do {
    const json = await call(`/databases/${databaseId}/query`, "POST", cursor ? { start_cursor: cursor, page_size: 100 } : { page_size: 100 });
    const page = parseLibraryQuery(json);
    rows.push(...page.rows);
    cursor = page.more;
  } while (cursor);
  return { rows, databaseId };
}

/** A study report, filed as a child page of the report page: title, then the text in paragraphs. */
export async function fileReport(title: string, markdown: string): Promise<string> {
  const parent = process.env.GARAGE_REPORT_PAGE;
  if (!parent) throw new Error("GARAGE_REPORT_PAGE is not set");
  const paragraphs = markdown
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
    .slice(0, 90)
    .map((p) => ({ object: "block", type: "paragraph", paragraph: { rich_text: [{ type: "text", text: { content: p.slice(0, 1900) } }] } }));
  const json = (await call("/pages", "POST", {
    parent: { page_id: parent },
    properties: { title: { title: [{ type: "text", text: { content: title.slice(0, 200) } }] } },
    children: paragraphs,
  })) as { url?: string; id?: string };
  return json.url ?? json.id ?? "filed";
}

/** Writes the row's ID field (the identifier plus the mirror tag). */
export async function setIdent(pageId: string, ident: string): Promise<void> {
  await call(`/pages/${pageId}`, "PATCH", { properties: { ID: { rich_text: [{ type: "text", text: { content: ident.slice(0, 1900) } }] } } });
}

/** Downloads a primary. Follows redirects; identifies itself; gives up politely on anything but 200. */
export async function fetchPrimary(url: string): Promise<{ ok: true; bytes: Uint8Array; contentType: string | null } | { ok: false; reason: string }> {
  try {
    const res = await fetch(primaryUrl(url), { redirect: "follow", headers: { "User-Agent": "squaloo-garage/0.1 (library mirror; +https://squaloo.com/garage)", Accept: "application/pdf, text/html;q=0.9, */*;q=0.5" } });
    if (!res.ok) return { ok: false, reason: `HTTP ${res.status}` };
    const bytes = new Uint8Array(await res.arrayBuffer());
    if (bytes.length === 0) return { ok: false, reason: "empty body" };
    return { ok: true, bytes, contentType: res.headers.get("content-type") };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : String(e) };
  }
}

/** Creates one library page with the given properties and body blocks; returns its URL or id. */
export async function createLibraryPage(properties: Record<string, unknown>, children: unknown[]): Promise<string> {
  const databaseId = process.env.GARAGE_LIBRARY_DB;
  if (!databaseId) throw new Error("GARAGE_LIBRARY_DB is not set");
  const json = (await call("/pages", "POST", { parent: { database_id: databaseId }, properties, children })) as { url?: string; id?: string };
  return json.url ?? json.id ?? "created";
}

/**
 * The library's home is a Notion database, as the pod's Gate E Research Library was. This
 * is the pure half: a Notion query response becomes library rows, and rows become the
 * LIBRARY.md mirror. Tolerant of column names: the title property is the name, the first
 * url property is the URL, a select called Status is the status, and so on. Pure.
 */
export type LibraryRow = {
  id: string;
  name: string;
  url: string;
  status: string;
  kind: string;
  added: string;
  addedBy: string;
  scrub: string[];
  summary: string;
  /** The page URL in Notion, for the founder; never for the agent's prompt. */
  notionUrl: string;
};

type Prop = Record<string, unknown> & { type?: string };

function text(v: unknown): string {
  if (!Array.isArray(v)) return "";
  return v.map((t) => (typeof t === "object" && t !== null && typeof (t as { plain_text?: unknown }).plain_text === "string" ? (t as { plain_text: string }).plain_text : "")).join("").trim();
}

function prop(props: Record<string, Prop>, type: string, prefer?: string): Prop | null {
  if (prefer && props[prefer] && props[prefer].type === type) return props[prefer];
  for (const p of Object.values(props)) if (p.type === type) return p;
  return null;
}

export function parseLibraryPage(page: unknown): LibraryRow | null {
  if (typeof page !== "object" || page === null) return null;
  const pg = page as { id?: unknown; url?: unknown; properties?: Record<string, Prop>; created_time?: unknown; created_by?: { name?: unknown } };
  if (typeof pg.id !== "string" || !pg.properties) return null;
  const props = pg.properties;
  const title = prop(props, "title");
  const name = title ? text(title.title) : "";
  if (!name) return null;
  const url = prop(props, "url", "URL");
  const status = prop(props, "select", "Status");
  const kind = props.Kind?.type === "select" ? props.Kind : null;
  const scrub = props.Scrub?.type === "multi_select" ? props.Scrub : null;
  const summary = prop(props, "rich_text", "Summary");
  const added = props.Added?.type === "date" ? props.Added : null;
  const addedBy = props["Added by"]?.type === "rich_text" ? props["Added by"] : null;
  const sel = (p: Prop | null) => (p && typeof p.select === "object" && p.select !== null && typeof (p.select as { name?: unknown }).name === "string" ? (p.select as { name: string }).name : "");
  return {
    id: pg.id,
    name,
    url: url && typeof url.url === "string" ? url.url : "",
    status: sel(status),
    kind: sel(kind),
    added: added && typeof added.date === "object" && added.date !== null && typeof (added.date as { start?: unknown }).start === "string" ? (added.date as { start: string }).start : typeof pg.created_time === "string" ? pg.created_time.slice(0, 10) : "",
    addedBy: addedBy ? text(addedBy.rich_text) : typeof pg.created_by?.name === "string" ? pg.created_by.name : "",
    scrub: scrub && Array.isArray(scrub.multi_select) ? (scrub.multi_select as { name?: unknown }[]).map((m) => (typeof m.name === "string" ? m.name : "")).filter(Boolean) : [],
    summary: summary ? text(summary.rich_text) : "",
    notionUrl: typeof pg.url === "string" ? pg.url : "",
  };
}

export function parseLibraryQuery(json: unknown): { rows: LibraryRow[]; more: string | null } {
  const j = json as { results?: unknown[]; has_more?: unknown; next_cursor?: unknown };
  const rows = (Array.isArray(j.results) ? j.results : []).map(parseLibraryPage).filter((r): r is LibraryRow => r !== null);
  return { rows, more: j.has_more === true && typeof j.next_cursor === "string" ? j.next_cursor : null };
}

/** The mirror. Hashes of any primaries on disk ride beside it in SHA256SUMS; this file names them. */
export function libraryMarkdown(rows: LibraryRow[], pulledAt: string, databaseId: string): string {
  const out = [
    "# The library — sources wrasse may lean on, with their boundaries",
    "",
    `Generated from the Garage Research Library in Notion (database \`${databaseId.slice(0, 8)}…\`) by \`garage library pull\` at ${pulledAt}. Do not hand-edit; add or change a source in Notion and pull again. Wrasse's notes live on each row's page in Notion, under its own heading, and come back here as the summary when the founder folds them in.`,
    "",
    "A number lifted from here into a report carries its row's boundary with it, or it is not a number. `[note-estimate]` until the primary is read; `[sourced]` with a page reference after.",
    "",
  ];
  rows.forEach((r, i) => {
    out.push(`## S${i + 1} · ${r.name}`, "");
    if (r.url) out.push(`- **URL:** ${r.url}`);
    out.push(`- **Kind:** ${r.kind || "unstated"} · **Status:** ${r.status || "unread"} · **Added:** ${r.added || "?"}${r.addedBy ? ` by ${r.addedBy}` : ""}`);
    if (r.scrub.length) out.push(`- **Scrub before use:** ${r.scrub.join(", ")}`);
    if (r.summary) out.push(`- **What it claims, with its boundary:** ${r.summary}`);
    out.push("");
  });
  if (rows.length === 0) out.push("No sources yet. The founder adds them in Notion.", "");
  return out.join("\n");
}

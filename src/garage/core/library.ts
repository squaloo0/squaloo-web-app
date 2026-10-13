/**
 * The library's disk mirror, pure half: how a primary is named on disk, how a row's ID
 * field records it, what SHA256SUMS looks like, and the comparison that makes the mirror a
 * second instrument (rule 19): the rows and the disk are kept by different hands, and when
 * they disagree the pull stops and names the difference. Pure.
 */
import type { LibraryRow } from "./notion.ts";

/** "S3-gelman-carlin-2014-beyond-power.pdf": the row's number, a slug of its name, the type's extension. */
export function mirrorFileName(index: number, name: string, contentType: string | null, url: string): string {
  const slug =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48)
      .replace(/-+$/, "") || "source";
  return `S${index}-${slug}.${extFor(contentType, url)}`;
}

export function extFor(contentType: string | null, url: string): string {
  const ct = (contentType ?? "").toLowerCase();
  if (ct.includes("pdf") || /\.pdf(\?|$)|\/pdf\//i.test(url)) return "pdf";
  if (ct.includes("html")) return "html";
  if (ct.includes("markdown")) return "md";
  if (ct.includes("json")) return "json";
  if (ct.startsWith("text/")) return "txt";
  return "bin";
}

/** The ID field, when a primary is mirrored: "<file> · sha256 <12 hex>" after any identifier the founder wrote. */
export function idWithMirror(existing: string, file: string, sha256: string): string {
  const base = stripMirror(existing).trim();
  const tag = `${file} · sha256 ${sha256.slice(0, 12)}`;
  return base ? `${base} · ${tag}` : tag;
}

const MIRROR_RE = /(?:^|\s·\s)(S\d+-[a-z0-9-]+\.[a-z0-9]+) · sha256 ([0-9a-f]{12})/;

export function mirrorOf(id: string): { file: string; sha12: string } | null {
  const m = MIRROR_RE.exec(id);
  return m ? { file: m[1], sha12: m[2] } : null;
}

export function stripMirror(id: string): string {
  return id.replace(MIRROR_RE, "").replace(/\s·\s*$/, "").trim();
}

/** The sha256sum(1) format: "<64 hex>  <file>", one per line, sorted by file. */
export function sumsText(entries: { file: string; sha256: string }[]): string {
  return [...entries]
    .sort((a, b) => a.file.localeCompare(b.file))
    .map((e) => `${e.sha256}  ${e.file}`)
    .join("\n") + (entries.length ? "\n" : "");
}

export function parseSums(text: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const line of text.split("\n")) {
    const m = /^([0-9a-f]{64})\s{2}(.+)$/.exec(line.trim());
    if (m) out.set(m[2], m[1]);
  }
  return out;
}

export type MirrorCheck = {
  /** Rows whose ID names a mirrored file that is on disk with the right hash. */
  ok: string[];
  /** Rows whose ID names a file that is not in the sums. */
  missing: { row: string; file: string }[];
  /** Rows whose ID's hash prefix disagrees with the file's hash on disk. */
  mismatch: { row: string; file: string; disk: string; row12: string }[];
  /** Files on disk no row names. */
  orphans: string[];
  /** Rows with a URL and no mirror yet: the next batch hunt. */
  unmirrored: { row: string; url: string }[];
};

/** Rule 19: Notion says one thing, the disk says another, and neither is trusted alone. */
export function checkMirror(rows: LibraryRow[], sums: Map<string, string>, ids: Map<string, string>): MirrorCheck {
  const c: MirrorCheck = { ok: [], missing: [], mismatch: [], orphans: [], unmirrored: [] };
  const named = new Set<string>();
  for (const r of rows) {
    const m = mirrorOf(ids.get(r.id) ?? "");
    if (!m) {
      if (r.url) c.unmirrored.push({ row: r.name, url: r.url });
      continue;
    }
    named.add(m.file);
    const disk = sums.get(m.file);
    if (!disk) c.missing.push({ row: r.name, file: m.file });
    else if (!disk.startsWith(m.sha12)) c.mismatch.push({ row: r.name, file: m.file, disk: disk.slice(0, 12), row12: m.sha12 });
    else c.ok.push(r.name);
  }
  for (const f of sums.keys()) if (!named.has(f)) c.orphans.push(f);
  return c;
}

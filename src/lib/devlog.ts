import fs from "fs";
import path from "path";

import { marked } from "marked";

/**
 * Devlog content layer.
 *
 * Posts are markdown files in `content/devlog/`, which is the reviewed source
 * of truth — copy review happens on the markdown in a PR, and this module
 * renders exactly what was approved rather than a second hand-maintained copy.
 *
 * Frontmatter is parsed here rather than with a library: the format is a handful
 * of quoted scalars, and the site's whole argument is that we think about what
 * we pull in. `marked` is the one dependency added for this, and it has none of
 * its own.
 */

const DEVLOG_DIR = path.join(process.cwd(), "content", "devlog");

export type DevlogPost = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  author: string;
  /** "published" renders publicly; anything else is treated as a draft. */
  status: string;
  /** Rendered HTML body (frontmatter stripped). */
  html: string;
};

type Frontmatter = Record<string, string>;

/**
 * Parse a `---` delimited frontmatter block.
 *
 * Handles `key: "value"` and bare `key: value`. Values routinely contain colons
 * and em dashes, so the split is on the FIRST colon only and quotes are stripped
 * afterwards — splitting naively would truncate every summary we write.
 */
function parseFrontmatter(raw: string): { data: Frontmatter; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!match) {
    return { data: {}, body: raw };
  }

  const data: Frontmatter = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(":");
    if (idx === -1) {
      continue;
    }
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key) {
      data[key] = value;
    }
  }
  return { data, body: raw.slice(match[0].length) };
}

function readPost(filename: string): DevlogPost {
  const raw = fs.readFileSync(path.join(DEVLOG_DIR, filename), "utf8");
  const { data, body } = parseFrontmatter(raw);

  // Slug drops the leading ISO date so URLs read as titles, not timestamps.
  const slug = filename.replace(/\.md$/, "").replace(/^\d{4}-\d{2}-\d{2}-/, "");

  return {
    slug,
    title: data.title || slug,
    date: data.date || "",
    summary: data.summary || "",
    author: data.author || "Squaloo",
    status: data.status || "draft",
    html: marked.parse(body, { async: false }) as string,
  };
}

function allPosts(): DevlogPost[] {
  if (!fs.existsSync(DEVLOG_DIR)) {
    return [];
  }
  return fs
    .readdirSync(DEVLOG_DIR)
    .filter((f) => f.endsWith(".md"))
    .map(readPost)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

/**
 * Posts visible on the site.
 *
 * Drafts are hidden in production but visible in `next dev`, so an unfinished
 * post can be read on a preview without being publishable by accident. A post
 * goes live by setting `status: "published"` in its frontmatter — a content
 * decision made in the file under review, not a deploy-time surprise.
 */
export function getPublishedPosts(): DevlogPost[] {
  const posts = allPosts();
  if (process.env.NODE_ENV === "development") {
    return posts;
  }
  return posts.filter((p) => p.status === "published");
}

export function getPostBySlug(slug: string): DevlogPost | undefined {
  return getPublishedPosts().find((p) => p.slug === slug);
}

/** Human-readable date; falls back to the raw string rather than inventing one. */
export function formatDate(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    return iso;
  }
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

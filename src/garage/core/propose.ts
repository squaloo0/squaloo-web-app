/**
 * Rung 1's pure parts: the branch a proposal lives on, the verdict that lets a diff leave
 * the station, and the PR body built from the run's own gate comment. Pure.
 */
export type ChangeKind = "feat" | "fix" | "chore" | "docs";

export function slugify(s: string): string {
  const slug = s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/, "");
  return slug.length ? slug : "change";
}

/** wrasse/<kind>/<slug>: the seat prefix makes authorship visible at a glance. */
export function branchFor(kind: ChangeKind, slug: string): string {
  return `wrasse/${kind}/${slugify(slug)}`;
}

export function isWrasseBranch(name: string): boolean {
  return /^wrasse\/(feat|fix|chore|docs)\/[a-z0-9-]+$/.test(name);
}

export type PublishVerdict = { ok: true } | { ok: false; reason: string };

/**
 * Guard 1, the harness half: a diff may be pushed only when the approval row names the hash
 * of the diff as it is right now, not as it was when the founder looked. The caller re-hashes
 * before asking (check, don't remember).
 */
export function publishVerdict(p: { recordedHash: string | null; currentHash: string | null; approved: ReadonlySet<string>; verdict: string | null }): PublishVerdict {
  if (p.verdict === "denied") return { ok: false, reason: "the founder denied this diff" };
  if (p.recordedHash === null) return { ok: false, reason: "the run recorded no diff" };
  if (p.currentHash === null) return { ok: false, reason: "the branch has no diff against main any more" };
  if (p.currentHash !== p.recordedHash) return { ok: false, reason: `the branch changed since the run: ${p.currentHash.slice(0, 12)} is not ${p.recordedHash.slice(0, 12)}` };
  if (!p.approved.has(p.currentHash)) return { ok: false, reason: `no approval row for diff ${p.currentHash.slice(0, 12)}` };
  return { ok: true };
}

/** The PR body is the gate comment, verbatim, with the run named and the attribution line. */
export function prBody(p: { runId: string; report: string | null; charterVersion: string; charterHash: string; costUsd: number; diffHash: string }): string {
  return [
    p.report?.trim() || "(the run left no gate comment)",
    "",
    "---",
    `Garage run \`${p.runId.slice(0, 8)}\` · charter ${p.charterVersion} \`${p.charterHash.slice(0, 8)}\` · $${p.costUsd.toFixed(2)} · diff \`${p.diffHash.slice(0, 12)}\` · approved at the gate.`,
    "",
    "🤖 Generated with [Claude Code](https://claude.com/claude-code)",
  ].join("\n");
}

/** A PR title from the first line of the report, or the branch. */
export function prTitle(report: string | null, branch: string): string {
  const first = (report ?? "")
    .split("\n")
    .map((l) => l.replace(/^[#*\s]+|[*\s]+$/g, "").trim())
    .find((l) => l.length > 0);
  const base = first && first.length <= 80 ? first : branch.replace(/^wrasse\//, "").replace("/", ": ").replace(/-/g, " ");
  return `wrasse: ${base}`;
}

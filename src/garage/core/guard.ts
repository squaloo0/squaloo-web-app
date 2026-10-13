/**
 * The guards that fire on a tool call: rung (what this rung may do at all), touch (where it
 * may write), gate (nothing published without an approval row for this exact diff), and
 * secrets (what it may not read). One pure decision per call; the harness turns a deny into
 * a hook refusal and a ledger event. Charter section 3, guards 1, 3, 4 and the read half of 5.
 */
import { isAbsolute, relative, resolve } from "node:path";
import { isSecretPath } from "./secrets.ts";

export type Rung = 0 | 1 | 2 | 3;

export type ToolCall = { tool: string; input: Record<string, unknown> };

export type GuardContext = {
  rung: Rung;
  /** Repo root. Every path is judged relative to it. */
  cwd: string;
  /** sha256 of the diff the founder approved, from garage_approvals. */
  approvedDiffHashes: ReadonlySet<string>;
  /** sha256 of the diff on the agent's branch right now, or null when there is none. */
  diffHash: string | null;
};

export type GuardName = "rung" | "touch" | "gate" | "secrets";

export type Verdict = { allow: true } | { allow: false; guard: GuardName; reason: string };

export const READ_TOOLS: readonly string[] = ["Read", "Glob", "Grep"];
export const WRITE_TOOLS: readonly string[] = ["Write", "Edit", "MultiEdit", "NotebookEdit"];

/** The harness's own corner: the Garage builds itself here. */
export const HARNESS_PATHS: readonly string[] = ["src/garage/", "src/app/garage/", "src/app/api/garage/", "workers/garage/"];
/** Where proposals may land from rung 1 up. */
export const PROPOSAL_PATHS: readonly string[] = ["src/app/", "src/components/", "content/", "public/"];
/** Never, at any rung: money, auth, the other corner's machinery, dependencies, migrations. */
export const NEVER_PATHS: readonly string[] = [
  "src/remora/db/",
  "src/app/api/remora/stripe/",
  "src/app/api/remora/checkout/",
  "src/remora/auth.ts",
  "src/remora/stripe.ts",
  "src/remora/coins",
  "workers/remora/",
  "drizzle.config.ts",
  "package.json",
  "package-lock.json",
  ".github/",
  "src/garage/CHARTER.md",
];

/** Tools a rung may be handed at all. The hooks still judge every call. */
export function toolsForRung(rung: Rung): string[] {
  return rung === 0 ? [...READ_TOOLS] : [...READ_TOOLS, ...WRITE_TOOLS, "Bash"];
}

const PUBLISH = /\bgit\s+push\b|\bgh\s+pr\s+(?:create|edit|ready|comment)\b|\bgh\s+(?:release|repo)\b|\bvercel\b|\bfly\s|\bflyctl\b|\bnpm\s+publish\b|\bcurl\b|\bwget\b/;
const MERGE = /\bgh\s+pr\s+merge\b|\bgit\s+merge\b|\bgit\s+push\b[^\n;&|]*\b(?:main|master)\b/;
const BASH_OK_FIRST_WORDS = new Set(["git", "npm", "npx", "node", "ls", "cat", "head", "tail", "wc", "grep", "find", "pwd", "echo"]);

export function decide(call: ToolCall, ctx: GuardContext): Verdict {
  const { tool, input } = call;

  if (READ_TOOLS.includes(tool)) {
    const p = pathOf(input);
    if (p === null) return { allow: true };
    const rel = inside(ctx.cwd, p);
    if (rel === null) return deny("secrets", `${tool} outside the repo: ${p}`);
    if (isSecretPath(rel)) return deny("secrets", `${tool} of a secret path: ${rel}`);
    return { allow: true };
  }

  if (WRITE_TOOLS.includes(tool)) {
    if (ctx.rung < 1) return deny("rung", `rung ${ctx.rung} reads and reports; ${tool} is rung 1`);
    const p = pathOf(input);
    if (p === null) return deny("touch", `${tool} without a path`);
    const rel = inside(ctx.cwd, p);
    if (rel === null) return deny("touch", `${tool} outside the repo: ${p}`);
    if (isSecretPath(rel)) return deny("secrets", `${tool} to a secret path: ${rel}`);
    if (NEVER_PATHS.some((n) => rel === n || rel.startsWith(n)) || /(^|\/)migrations\//.test(rel)) {
      return deny("touch", `${rel} is off the touch list for good`);
    }
    if ([...HARNESS_PATHS, ...PROPOSAL_PATHS].some((a) => rel.startsWith(a))) return { allow: true };
    return deny("touch", `${rel} is not on the touch list`);
  }

  if (tool === "Bash") {
    if (ctx.rung < 1) return deny("rung", `rung ${ctx.rung} has no shell`);
    const cmd = typeof input.command === "string" ? input.command : "";
    if (MERGE.test(cmd)) return deny("gate", "wrasse never merges and never pushes to main");
    if (PUBLISH.test(cmd)) {
      if (ctx.diffHash === null) return deny("gate", "nothing to publish: no diff on the branch");
      if (!ctx.approvedDiffHashes.has(ctx.diffHash)) {
        return deny("gate", `no approval row for diff ${ctx.diffHash.slice(0, 12)}; the founder approves from the dashboard`);
      }
      return { allow: true };
    }
    const first = cmd.trim().split(/\s+/)[0] ?? "";
    if (!BASH_OK_FIRST_WORDS.has(first)) return deny("rung", `bash beyond git/npm/node is not rung ${ctx.rung}: ${first || "(empty)"}`);
    return { allow: true };
  }

  return deny("rung", `${tool} is not a rung ${ctx.rung} tool`);
}

function deny(guard: GuardName, reason: string): Verdict {
  return { allow: false, guard, reason };
}

/** The path a tool call is about, when it is about one. */
export function pathOf(input: Record<string, unknown>): string | null {
  for (const k of ["file_path", "path", "notebook_path"]) {
    const v = input[k];
    if (typeof v === "string" && v.length > 0) return v;
  }
  return null;
}

/** The path relative to the repo root, or null when it escapes. */
export function inside(cwd: string, p: string): string | null {
  const abs = isAbsolute(p) ? resolve(p) : resolve(cwd, p);
  const rel = relative(resolve(cwd), abs);
  if (rel === "") return ".";
  if (rel.startsWith("..") || isAbsolute(rel)) return null;
  return rel;
}

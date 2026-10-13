/**
 * Git and gh, each one spawn with an argument list, never a shell string. Rung 1 runs live in
 * their own worktree beside the repo, so wrasse and a person never share a working tree
 * (Solomon's first shakedown lesson). The hash of a diff is the thing the gate names.
 *
 * I/O edge.
 */
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, symlinkSync } from "node:fs";
import { basename, join, resolve } from "node:path";

export type Exec = { status: number; stdout: string; stderr: string };

export function run(bin: string, args: string[], cwd: string, env?: Record<string, string>): Promise<Exec> {
  return new Promise((res) => {
    const p = spawn(bin, args, { cwd, env: env ? { ...process.env, ...env } : process.env, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    p.stdout.on("data", (d) => (stdout += d));
    p.stderr.on("data", (d) => (stderr += d));
    p.on("error", (e) => res({ status: 127, stdout, stderr: String(e) }));
    p.on("close", (code) => res({ status: code ?? 1, stdout, stderr }));
  });
}

export function worktreeRoot(repo: string): string {
  return resolve(repo, "..", `${basename(repo)}-wrasse`);
}

/** The worktree for a branch: created from origin/main when new, reused when it exists. */
export async function prepareWorktree(repo: string, branch: string): Promise<string> {
  const dir = join(worktreeRoot(repo), branch.replace(/\//g, "__"));
  await run("git", ["fetch", "-q", "origin", "main"], repo);
  if (!existsSync(dir)) {
    const exists = (await run("git", ["rev-parse", "--verify", "-q", `refs/heads/${branch}`], repo)).status === 0;
    const r = exists ? await run("git", ["worktree", "add", dir, branch], repo) : await run("git", ["worktree", "add", "-b", branch, dir, "origin/main"], repo);
    if (r.status !== 0) throw new Error(`worktree add failed: ${r.stderr.trim()}`);
  }
  const mods = join(dir, "node_modules");
  if (!existsSync(mods) && existsSync(join(repo, "node_modules"))) symlinkSync(join(repo, "node_modules"), mods, "dir");
  return dir;
}

export async function removeWorktree(repo: string, dir: string): Promise<void> {
  await run("git", ["worktree", "remove", "--force", dir], repo);
}

/** Commit whatever is dirty, as wrasse. True when a commit was made. */
export async function commitAll(cwd: string, message: string): Promise<boolean> {
  const dirty = (await run("git", ["status", "--porcelain"], cwd)).stdout.trim().length > 0;
  if (!dirty) return false;
  await run("git", ["add", "-A"], cwd);
  const r = await run("git", ["commit", "-q", "-m", message], cwd, WRASSE_IDENTITY);
  return r.status === 0;
}

export const WRASSE_IDENTITY: Record<string, string> = {
  GIT_AUTHOR_NAME: "wrasse",
  GIT_AUTHOR_EMAIL: "wrasse-agent@squaloo.com",
  GIT_COMMITTER_NAME: "wrasse",
  GIT_COMMITTER_EMAIL: "wrasse-agent@squaloo.com",
};

/** sha256 of `git diff origin/main...HEAD`, or null when the branch has nothing on main. */
export async function diffHash(cwd: string): Promise<string | null> {
  const r = await run("git", ["diff", "origin/main...HEAD"], cwd);
  if (r.status !== 0 || r.stdout.length === 0) return null;
  return createHash("sha256").update(r.stdout, "utf8").digest("hex");
}

export async function currentBranch(cwd: string): Promise<string> {
  return (await run("git", ["rev-parse", "--abbrev-ref", "HEAD"], cwd)).stdout.trim();
}

export async function push(cwd: string, branch: string): Promise<Exec> {
  return run("git", ["push", "-u", "origin", branch], cwd);
}

/** Opens the PR against main and returns its URL. */
export async function openPr(cwd: string, title: string, body: string): Promise<string> {
  const r = await run("gh", ["pr", "create", "--base", "main", "--title", title, "--body", body], cwd);
  if (r.status !== 0) throw new Error(`gh pr create failed: ${r.stderr.trim()}`);
  const url = r.stdout.trim().split("\n").find((l) => l.startsWith("https://"));
  if (!url) throw new Error(`gh pr create gave no url: ${r.stdout.trim()}`);
  return url;
}

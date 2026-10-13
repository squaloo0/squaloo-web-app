import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { commitAll, currentBranch, diffHash, prepareWorktree, push, removeWorktree, run, worktreeRoot } from "./git.ts";

/** A repo with a bare "origin" beside it, one commit on main, pushed. */
async function scratchRepo(): Promise<{ repo: string; origin: string }> {
  const base = mkdtempSync(join(tmpdir(), "garage-git-"));
  const origin = join(base, "origin.git");
  const repo = join(base, "squaloo-web-app");
  await run("git", ["init", "-q", "--bare", origin], base);
  await run("git", ["init", "-q", "-b", "main", repo], base);
  await run("git", ["config", "user.email", "test@example.com"], repo);
  await run("git", ["config", "user.name", "test"], repo);
  writeFileSync(join(repo, "README.md"), "# scratch\n");
  await run("git", ["add", "-A"], repo);
  await run("git", ["commit", "-q", "-m", "init"], repo);
  await run("git", ["remote", "add", "origin", origin], repo);
  await run("git", ["push", "-q", "-u", "origin", "main"], repo);
  return { repo, origin };
}

test("rung 1's worktree: a branch from origin/main, beside the repo, never inside it", async () => {
  const { repo } = await scratchRepo();
  const dir = await prepareWorktree(repo, "wrasse/feat/x");
  assert.ok(dir.startsWith(worktreeRoot(repo)), dir);
  assert.ok(!dir.startsWith(repo + "/"), "the worktree is not inside the primary checkout");
  assert.equal(await currentBranch(dir), "wrasse/feat/x");
  assert.equal(await currentBranch(repo), "main", "the primary checkout is untouched");
  assert.equal(await prepareWorktree(repo, "wrasse/feat/x"), dir, "a second call reuses it");

  assert.equal(await diffHash(dir), null, "nothing on the branch yet");
  assert.equal(await commitAll(dir, "nothing"), false, "nothing dirty, nothing committed");

  writeFileSync(join(dir, "note.md"), "hello\n");
  assert.equal(await commitAll(dir, "wrasse: note"), true);
  const author = (await run("git", ["log", "-1", "--format=%an <%ae>"], dir)).stdout.trim();
  assert.equal(author, "wrasse <wrasse-agent@squaloo.com>", "commits are authored by wrasse");
  const h1 = await diffHash(dir);
  assert.equal(h1!.length, 64);

  writeFileSync(join(dir, "note.md"), "hello again\n");
  await commitAll(dir, "wrasse: more");
  const h2 = await diffHash(dir);
  assert.notEqual(h1, h2, "the hash follows the diff");

  const pushed = await push(dir, "wrasse/feat/x");
  assert.equal(pushed.status, 0, pushed.stderr);
  const onOrigin = (await run("git", ["ls-remote", "--heads", "origin", "wrasse/feat/x"], repo)).stdout;
  assert.match(onOrigin, /refs\/heads\/wrasse\/feat\/x/, "the branch landed on origin");
  assert.ok(!existsSync(join(repo, "note.md")), "and nothing landed in the primary checkout");
  assert.equal(readFileSync(join(repo, "README.md"), "utf8"), "# scratch\n");

  await removeWorktree(repo, dir);
  assert.equal(existsSync(dir), false);
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { decide, inside, toolsForRung, type GuardContext } from "./guard.ts";

const CWD = "/Users/wrasse/squaloo-web-app";
const HASH = "a".repeat(64);
const ctx = (over: Partial<GuardContext> = {}): GuardContext => ({ rung: 0, cwd: CWD, approvedDiffHashes: new Set(), diffHash: HASH, ...over });

function denied(v: ReturnType<typeof decide>, guard: string, re: RegExp) {
  assert.equal(v.allow, false);
  if (v.allow) return;
  assert.equal(v.guard, guard);
  assert.match(v.reason, re);
}

test("guard 1, the gate: a push with no approval row is refused", () => {
  const v = decide({ tool: "Bash", input: { command: "git push -u origin wrasse/feat/x" } }, ctx({ rung: 1 }));
  denied(v, "gate", /no approval row/);
});

test("guard 1, the gate: an approval for a different diff does not open it", () => {
  const v = decide({ tool: "Bash", input: { command: "gh pr create --fill" } }, ctx({ rung: 1, approvedDiffHashes: new Set(["b".repeat(64)]) }));
  denied(v, "gate", /no approval row/);
});

test("guard 1, the gate: the matching approval opens it, and only for publishing", () => {
  const open = ctx({ rung: 1, approvedDiffHashes: new Set([HASH]) });
  assert.deepEqual(decide({ tool: "Bash", input: { command: "git push -u origin wrasse/feat/x" } }, open), { allow: true });
  assert.deepEqual(decide({ tool: "Bash", input: { command: "gh pr create --base main --title x" } }, open), { allow: true });
  denied(decide({ tool: "Bash", input: { command: "gh pr merge 61 --squash" } }, open), "gate", /never merges/);
  denied(decide({ tool: "Bash", input: { command: "git push origin HEAD:main" } }, open), "gate", /never merges/);
  denied(decide({ tool: "Bash", input: { command: "git push" } }, ctx({ rung: 1, diffHash: null })), "gate", /nothing to publish/);
});

test("guard 1, the gate: a push hidden in a chain is still a push", () => {
  denied(decide({ tool: "Bash", input: { command: "git add -A && git commit -m x && git push" } }, ctx({ rung: 1 })), "gate", /no approval row/);
  denied(decide({ tool: "Bash", input: { command: "curl -X POST https://example.com" } }, ctx({ rung: 1 })), "gate", /no approval row/);
});

test("guard 3, the touch list: Remora's money paths are refused, the Garage's corner is allowed", () => {
  denied(decide({ tool: "Write", input: { file_path: `${CWD}/src/remora/db/queue.ts`, content: "" } }, ctx({ rung: 1 })), "touch", /off the touch list for good/);
  denied(decide({ tool: "Edit", input: { file_path: "src/app/api/remora/stripe/route.ts" } }, ctx({ rung: 1 })), "touch", /off the touch list/);
  denied(decide({ tool: "Edit", input: { file_path: "src/remora/db/migrations/0010_x.sql" } }, ctx({ rung: 1 })), "touch", /off the touch list/);
  denied(decide({ tool: "Edit", input: { file_path: "package.json" } }, ctx({ rung: 1 })), "touch", /off the touch list/);
  denied(decide({ tool: "Edit", input: { file_path: "src/garage/CHARTER.md" } }, ctx({ rung: 1 })), "touch", /off the touch list/, );
  denied(decide({ tool: "Write", input: { file_path: "src/lib/util.ts" } }, ctx({ rung: 1 })), "touch", /not on the touch list/);
  denied(decide({ tool: "Write", input: { file_path: "/etc/hosts" } }, ctx({ rung: 1 })), "touch", /outside the repo/);
  denied(decide({ tool: "Write", input: { file_path: "../other-repo/x.ts" } }, ctx({ rung: 1 })), "touch", /outside the repo/);
  assert.deepEqual(decide({ tool: "Write", input: { file_path: `${CWD}/src/app/garage/page.tsx` } }, ctx({ rung: 1 })), { allow: true });
  assert.deepEqual(decide({ tool: "Edit", input: { file_path: "src/app/page.tsx" } }, ctx({ rung: 1 })), { allow: true });
  assert.deepEqual(decide({ tool: "Edit", input: { file_path: "content/devlog/x.md" } }, ctx({ rung: 1 })), { allow: true });
  assert.deepEqual(decide({ tool: "Edit", input: { file_path: "src/lib/llms.ts" } }, ctx({ rung: 1 })), { allow: true }, "the llms.txt sources are proposal paths (charter 0.3)");
  denied(decide({ tool: "Edit", input: { file_path: "src/lib/devlog.ts" } }, ctx({ rung: 1 })), "touch", /not on the touch list/);
});

test("rung 0 reads and reports: every write and every shell is refused", () => {
  denied(decide({ tool: "Write", input: { file_path: "src/app/garage/page.tsx" } }, ctx()), "rung", /rung 0 reads and reports/);
  denied(decide({ tool: "Bash", input: { command: "ls" } }, ctx()), "rung", /no shell/);
  denied(decide({ tool: "WebFetch", input: { url: "https://www.squaloo.com" } }, ctx()), "rung", /not a rung 0 tool/);
  denied(decide({ tool: "Agent", input: {} }, ctx()), "rung", /not a rung 0 tool/);
  assert.deepEqual(toolsForRung(0), ["Read", "Glob", "Grep"]);
  assert.deepEqual(toolsForRung(1), ["Read", "Glob", "Grep", "Write", "Edit", "MultiEdit", "NotebookEdit", "Bash"]);
});

test("guard 5, the read half: env files and anything outside the repo are refused at every rung", () => {
  denied(decide({ tool: "Read", input: { file_path: `${CWD}/.env.local` } }, ctx()), "secrets", /secret path/);
  denied(decide({ tool: "Read", input: { file_path: "/Users/wrasse/.claude/settings.json" } }, ctx()), "secrets", /outside the repo/);
  denied(decide({ tool: "Grep", input: { pattern: "sk_live", path: "/Users/wrasse" } }, ctx()), "secrets", /outside the repo/);
  denied(decide({ tool: "Read", input: { file_path: "keys/receipt.pem" } }, ctx({ rung: 1 })), "secrets", /secret path/);
  assert.deepEqual(decide({ tool: "Read", input: { file_path: "README.md" } }, ctx()), { allow: true });
  assert.deepEqual(decide({ tool: "Grep", input: { pattern: "tape" } }, ctx()), { allow: true }, "a grep with no path is a grep of the repo");
  assert.deepEqual(decide({ tool: "Glob", input: { pattern: "src/app/**/page.tsx" } }, ctx()), { allow: true });
});

test("rung 1 shell: git, npm and node are allowed; anything else is not yet", () => {
  assert.deepEqual(decide({ tool: "Bash", input: { command: "git status" } }, ctx({ rung: 1 })), { allow: true });
  assert.deepEqual(decide({ tool: "Bash", input: { command: "npm run garage:test" } }, ctx({ rung: 1 })), { allow: true });
  denied(decide({ tool: "Bash", input: { command: "rm -rf src" } }, ctx({ rung: 1 })), "rung", /bash beyond/);
  denied(decide({ tool: "Bash", input: { command: "python3 -c 'print(1)'" } }, ctx({ rung: 1 })), "rung", /bash beyond/);
});

test("inside() judges paths relative to the repo root", () => {
  assert.equal(inside(CWD, `${CWD}/src/x.ts`), "src/x.ts");
  assert.equal(inside(CWD, "src/x.ts"), "src/x.ts");
  assert.equal(inside(CWD, CWD), ".");
  assert.equal(inside(CWD, `${CWD}/../elsewhere`), null);
  assert.equal(inside(CWD, "/tmp/x"), null);
});

test("the library mirror is a read root: readable at every rung, never writable", () => {
  const lib = "/Users/wrasse/.garage/library";
  const withLib = ctx({ readRoots: [lib] });
  assert.deepEqual(decide({ tool: "Read", input: { file_path: `${lib}/2509.00001.pdf` } }, withLib), { allow: true });
  assert.deepEqual(decide({ tool: "Glob", input: { pattern: "*.pdf", path: lib } }, withLib), { allow: true });
  denied(decide({ tool: "Read", input: { file_path: "/Users/wrasse/.garage/other.txt" } }, withLib), "secrets", /outside the repo/);
  denied(decide({ tool: "Read", input: { file_path: `${lib}/../.ssh/id_ed25519` } }, withLib), "secrets", /outside the repo/);
  denied(decide({ tool: "Write", input: { file_path: `${lib}/note.md` } }, { ...withLib, rung: 1 }), "touch", /outside the repo/);
});

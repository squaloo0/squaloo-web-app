# Remora — working notes for Claude

Remora is a **video vending machine** that lives in this corner of the Squaloo site.
Read `src/remora/README.md` first; it is the plan and the only source of truth.
Then read the **last entry of `src/remora/LOG.md`**: it says which machine worked last,
which branch is live, and what is next.

Rules of the game (short form):
- Fun first. One phase per sitting. Every phase ends with something runnable.
- Nothing in `src/remora/core` touches I/O. Relative imports with `.ts` extensions, so
  `node --experimental-strip-types` can run it and its tests without a bundler.
- `spawn(bin, [args])` only. Never a shell string.
- No new dependency without a sentence saying why. Sanctioned: an S3 client (Phase 3),
  `stripe` (Phase 4).
- Keep it light. If a proposal reads like Solomon's trenches (trust panels, provenance
  tiers, corpus ingest), it goes in the README's back-pocket section, not the build.

Commands: `npm run remora -- <cmd>` · `npm run remora:worker` · `npm run remora:test`.
Branches: `remora/feat/<name>`, one PR per phase, PRs target `main`.

## Session hand-off (two machines, one branch)

Work moves between a Mac mini and a MacBook Air. Git is the only channel.

Start of a sitting:
1. `git fetch origin` and check out the branch named in the last LOG entry.
2. `npm install` if `package.json` changed. Run `npm run remora:test`.
3. Say in one line which machine you are on and what you are about to do.

End of a sitting, before you stop for any reason:
1. Append a LOG entry: date · machine · phase · what landed · what is next · any
   machine-local fact (binaries, env files, what is on disk).
2. Commit and push the branch. Work that exists only on one machine does not exist.
3. If the phase is done: lint, build, open the PR against `main`.

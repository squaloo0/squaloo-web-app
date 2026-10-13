# The Garage — working notes for Claude

The Garage is the corner of the Squaloo site where headless agents are built and kept. Its
first agent is **wrasse**. Read `src/garage/CHARTER.md` first; it is the agent's system prompt
and the only source of truth for how the agent may behave. Then read the **last entry of
`src/garage/LOG.md`**: it says which machine worked last, which branch is live, and what is next.

Rules of the game (short form):
- Fun first. One phase per sitting. Every phase ends with something runnable.
- The guards are code. A rule in the charter without a test that proves it fires is not done.
- Nothing in `src/garage/core` touches I/O. Relative imports with `.ts` extensions, so
  `node --experimental-strip-types` runs it and its tests without a bundler.
- `spawn(bin, [args])` only. Never a shell string.
- One sanctioned dependency: `@anthropic-ai/claude-agent-sdk`. Anything else needs a sentence.
- Touch only `src/garage`, `src/app/garage`, `src/app/api/garage`, `workers/garage`, and
  `package.json` scripts. Remora's corner is Remora's.
- This repo is public. A live defect goes to a Linear ticket, never to a commit, PR, or page.

Branches: `garage/feat/<name>`, one PR per phase, PRs target `main`. Commit messages carry the
Claude Code attribution line.

## Session hand-off (two machines, one branch)

Same as Remora's: git is the only channel. Start a sitting with `git fetch origin`, check out
the branch in the last LOG entry, say which machine you are on. End every sitting with a LOG
entry, a commit, and a push. Work that exists only on one machine does not exist.

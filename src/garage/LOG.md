# The Garage — hand-off log

Append-only. Newest entry last.

## 2026-10-13 · Air · the charter

**What landed.** The charter for wrasse, `src/garage/CHARTER.md` v0.1, drafted after the
discussion of how a headless agent's charter differs from Solomon's seated pod: the gate is
mechanical, the objective is a number so the instrument comes first, every thought bills tokens
and the agent never moves money, the surface is public, and the ledger is the only memory.
Guidelines and budget ($2 per run, $10 per day) founder-ratified in that discussion. Section 6
designs the study flywheel: library, register, ledger, lessons, and calibration as the
proficiency metric. Working notes in `src/garage/CLAUDE.md`. A root `CLAUDE.md` now points at
both corners.

**Decisions taken.** The Claude Agent SDK is the harness (founder's call). The agent is named
wrasse. Linear and Notion through the same hosted MCP servers the pod uses.

**What is next.** Phase 1, "the harness and the gate": install the SDK, `workers/garage/` runs
one headless session that reads the repo and writes a report row, and the eight guards in
charter section 3 land with their firing tests. No proposals until the ledger exists.

**Machine-local facts.** Nothing yet. No token minted, no Neon tables, no SDK installed.

## 2026-10-13 · Air · Phase 1, the harness and the gate

**What landed.** The one dependency, `@anthropic-ai/claude-agent-sdk` 0.3.296. The guards as
pure code in `src/garage/core/`, twenty tests. The ledger in Neon: `garage_runs`,
`garage_events`, `garage_approvals`, migration 0001 applied to the production database at
06:37 UTC. The harness `workers/garage/run.ts`: every side effect comes in through `Deps`, so
the tests hand it a notebook ledger and a scripted model that calls the hooks where the SDK
would; eleven tests prove the HALT file, the day budget, the run cap, the charter hash, the
env allowlist, a refused write, a refused secret read, a key shape in tool output, a key
shape in the agent's own words, and a result that dies without a message all land in the row
the charter says they land in. The CLI `npm run garage -- doctor | migrate | run | runs |
show | halt | hash | approve`. Thirty-one tests green, types clean, lint clean.

**What the first run found.** Run `204b2ef7` on the Air, hat report, rung 0: the SDK's
subprocess could not authenticate because this Mac's Claude Code CLI is signed out
(`claude auth status` → loggedIn false; the desktop app's login is its own). The harness
recorded that result as `done` because the SDK sent it with subtype `success` and
`is_error` true; fixed in the same sitting (a flagged result is a failed row, budget and turn
halts stay halts), test added, and the row corrected to `failed` with a note event saying why.
Zero dollars spent.

**What is next.** The founder mints wrasse's token and stores it in the Keychain under service
`squaloo-garage`, account `wrasse`; `doctor` then reports `keychain: squaloo-garage/wrasse`
with a length, and `run report` produces the first real report row. Then Phase 2, the
dashboard at `/garage`: runs, spend, the approval queue, a command box.

**Machine-local facts.** Air: `.env.local` carries `NEON_DATABASE_URL`, which the ledger uses
and the agent's subprocess never sees. No `GARAGE_MODEL` set, so the default is
`claude-sonnet-5-5`. Hostname resolves to `mac`; set `GARAGE_MACHINE_NAME` for a nicer name.
Mantis is not yet a Garage host; nothing to install there this phase.

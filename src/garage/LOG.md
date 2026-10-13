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

## 2026-10-13 · Air · the first report

**What landed.** Run `c793e6ea`: hat report, rung 0, `claude-sonnet-5-5`, auth
`keychain: squaloo-garage/wrasse`. 27 s, 16 turns, 15 tool calls, 0 refused, $0.17. The
report is in the row; `npm run garage -- show c793e6ea` prints it. In short: Remora is the only
thing that takes money; the tape and Stripe are the only instruments; nothing measures visits,
referrers or `/shop`; three hypotheses (free-coin to sleeve conversion, a first-party `/remora`
hit counter as the first proposal, `/shop`'s "coming soon" cart as a credibility cost); and the
one question, whether production Stripe is live or test and whether `/shop` is meant to sell.
It declared its coverage gap unprompted: 7 of 30 pages read.

**What it caught.** The preamble gave the run's date as a bare `2026-10-13` while the agent's
own clock read the 12th (Pacific evening, UTC morning). Wrasse reported the mismatch instead
of picking one. Fixed: the preamble now says `Launched 2026-10-13 06:50 UTC` and tells the
agent that is the ledger's clock. Rule 16, in its first hour.

**What is next.** The founder answers the one question. Then Phase 2, the dashboard at
`/garage`: runs, spend, the approval queue, and a command box, keyed like Remora's admin.

**Machine-local facts.** Air: wrasse's token in the Keychain, service `squaloo-garage`,
account `wrasse`, length 108. Nothing else changed.

## 2026-10-13 · Air · Phase 2, the dashboard

**What landed.** `/garage`, keyed with `GARAGE_ADMIN_TOKEN` or, failing that, Remora's
service key: spend today against the caps, the gate with approve and deny (writes the
approval row the gate guard reads, plus a note event), a command box, the queue, the last
twenty runs, and `/garage/runs/<id>` with every event and the report as written. Commands
wait in `garage_commands`; a host running `npm run garage -- work` claims one with a single
`SKIP LOCKED` statement and runs it; `work --once` drains one; `queue` and `command` from the
CLI. Migration 0002 applied (commands; `branch`, `diff_hash`, `verdict`, `command_id` on runs).
Every prompt now opens with the ledger block, the last ten run lines and the newest report in
full, so the agent's memory is the ledger and nothing else; the preamble names its three
memories (that block, `REGISTER.md`, `LESSONS.md`). The register carries the founder's
answers from this sitting: Stripe is in test mode; `/shop` is meant to sell; most visitors
are agents (needs review, instrument unnamed); agents with budgets as customers is a
founder-seeded hypothesis. 33 tests, types and lint clean, `next build` green.

**Verified.** Dashboard end to end on a local dev server with a session-only test key: the
key form, the counters, a command queued from the box and cancelled from the queue, and the
run page. Command #1 queued from the CLI, picked up by `work --once`, became run `7a2a55a1`:
hat report, ticket GARAGE-2, $0.21, 30 s, 18 turns, 17 tools, 0 refused. Its report is the
first answer to the founder's question about agents as customers: what the machine already
offers over JSON, the four things that stop an agent paying (browser-only checkout,
cookie-only card code, no recovery, a 402 with no pointer), three hypotheses each naming its
instrument, and one question back: which surface "most visitors are agents" was read from.
Two register rows proposed from it, awaiting the founder.

**What is next.** Phase 3, the instrument: a first-party, server-side, privacy-respecting
count that can see the top of the funnel (and can tell an agent from a browser, which is the
founder's open question), so a baseline exists before any proposal. Then rung 1.

**Machine-local facts.** Air: `work` is run by hand this phase; no launchd yet. The dev
config `squaloo-garage` in `~/Projects/.claude/launch.json` sets a local-only test key.
Day's spend so far: $0.38.

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

## 2026-10-13 · Air · Phase 3, the instrument

**What landed.** `garage_hits`: one row per countable request, written from the edge by
`src/middleware.ts` after the response is on its way, holding a UTC time, a path with its ids
folded, a visitor kind (browser, agent, ai-crawler, crawler, monitor, tool, unknown), a family
(chrome, claude-user, gptbot, curl, ...), a referrer host, and a method. No address, no raw
user agent, no query string, no cookie, by construction: the classifier is pure and tested
(`core/hits.ts`, 9 tests), the shim does nothing else, and `/garage` and static files are not
counted. Migration 0003 applied. The dashboard shows the last seven days by day and kind, the
top paths, families and referrers; `npm run garage -- hits [days]` prints the same lines; and
the same lines open every run's prompt, so wrasse's baseline is the instrument and not a
guess. Charter 0.2: the shim joins the touch list, the `[recall]` tag joins section 6.
`LIBRARY.md` is the library's disk mirror, opened with the founder's two sources and their
boundaries (Cloudflare Radar: bot 65%, human 35%, worldwide, HTML responses, week to
2026-10-12; Semrush: 57% in June 2026, same network). 42 tests, types, lint and `next build`
green; middleware bundle 77.6 kB.

**Verified.** Local dev server: six Chrome page loads, one Claude-User fetch of `/llms.txt`,
one GPTBot fetch of `/remora`, one curl of the peek API with a referrer, one curl of `/garage`
and one of a static svg. The instrument recorded 11 rows: browser 8, agent 1, ai-crawler 1,
tool 1, referrer news.ycombinator.com 1; `/garage` and the svg were not counted. The dashboard
rendered the same table.

**What wrasse said.** Run `894a1588` (hat report, ticket GARAGE-3, $0.25, 59 s, 0 refused),
the deeper read on a browserless pay rail, is in the ledger. Its recommendation: instrument
first, then the bearer-plus-pointer design only if 402s show up, with the stablecoin and
delegated-token designs waiting on live Stripe and on verification of two `[recall]` claims.
Its one question was for a counter table; this phase is the answer, with one gap named in the
register: the instrument cannot see a response status, so 402s stay uncounted until a one-line
seam in Remora's jobs route, which is the founder's call.

**What is next.** Let the instrument run a week on production, then a rung-0 run that reads
its first real week. Rung 1 after that, with the first proposal behind the gate: most likely
the machine-readable 402 and `llms.txt`, which wrasse called the first cheap change. Founder
calls open: the 402 seam in the jobs route; whether publishing the sleeve list in an API
response is guideline-3 territory; the Notion library.

**Machine-local facts.** Air: hits in the local table came from the dev server and are mixed
with production's once Vercel deploys; both write the same Neon table, so the first
production week should be read from the deploy's own timestamp on. Day's spend: $0.62.

## 2026-10-13 · Air · Phase 4, the gate end to end

**What landed.** Rung 1 in the harness, without a rung-1 run. A `propose` hat works on
`wrasse/<kind>/<slug>` in its own worktree beside the repo (`../squaloo-web-app-wrasse/`),
never in a person's checkout; commits are authored `wrasse <wrasse-agent@squaloo.com>`; the
harness commits any stragglers at the gate and leaves the branch and the sha256 of
`git diff origin/main...HEAD` on the run row. The dashboard's gate shows the branch, the diff
and a link to the gate comment; **Approve** writes the approval row and queues a `publish`
command; the next host running `work` re-hashes the branch, compares with the row and the
approval (`publishVerdict`, pure, six tests: no row, a different diff, a denial, no diff each
refuse), pushes, opens the PR with the run's own report as the body, and writes the URL on
the row. No model is involved in publishing. `garage publish <run>` does the same by hand.
Migration 0004 (`pr_url`). The git edge has its own firing test against a scratch repo with
a bare origin: worktree beside the repo, commit as wrasse, hash follows the diff, push lands
on origin, nothing lands in the primary checkout. 48 tests, types, lint and `next build`
green.

**What did not happen, on purpose.** No run at rung 1. The charter's ladder says rung 1 is
earned by five checked rung-0 runs and a founder ruling dated in the changelog; there are
three done runs. The machinery is proven with fakes and a scratch repo, not with a real
proposal, and the first real proposal waits on the founder's word.

**What is next.** The founder rules on rung 1, or asks for two more rung-0 runs first. The
first proposal on the table, from run `894a1588`: make `/llms.txt` tell an agent what Remora
offers over JSON. Then the production week of the instrument, read by a rung-0 run.

**Machine-local facts.** Air: worktrees for wrasse will appear at
`~/Projects/squaloo-web-app-wrasse/<branch with __ for />` with `node_modules` symlinked from
the repo. `gh` on the host does the PR; it is the founder's login. Day's spend unchanged.

## 2026-10-13 · Air · rung 1, and the first proposal

**What landed.** Charter 0.3: rung 1 by founder ruling after five rung-0 runs; the `llms.txt`
sources join the proposal paths. Two rung-0 runs through the queue with the founder watching
from the dashboard: `eea55df9` (GARAGE-4, the instrument's first hours, $0.10) and
`4f6151a9` (GARAGE-5, the red-team of the pay-rail report, $0.14), after `bad1c71b` stopped
itself ($0.09) because the memory block did not carry the report it was told to attack.
Three fixes from those runs: the search indexers move from agent to ai-crawler (the
classifier's own comment said agents fetch for a person right now); the eleven local dev rows
are removed so the instrument carries production only; a command that names a run now gets
that run's report in the block. Two register rows re-ruled by the red-team: "anyone can pay
into any card" drops to needs review (the checkout route sets the card from the caller's own
cookie), and "an agent cannot pay today" becomes qualified (a client that keeps its cookie can
already reach checkout; nothing tells it so).

**The first proposal.** Run `21c07027` (hat propose, ticket GARAGE-6, $0.31, 63 s, 23
turns, 21 tools, 1 refused: a `cd` at rung 1). Branch
`wrasse/feat/garage-6-make-llms-txt-tell-an-agent-wha`, one commit authored by wrasse, one
file, 27 lines added: a `## Remora` section in `llmsIndex`, generated, quality list from
`QUALITIES`, no prices, eight bullets with method, path and what comes back, each fact cited
to its route in the gate comment. Tests and types run in the worktree. Banked prediction:
agent plus ai-crawler hits on `/api/remora/*` in the 14 days after shipping exceed the 14
before, baseline 0 over about one day of counting, which it called thin. Its one question:
whether to advertise "take a card" to crawlers at all, given the promo coin's only guard is the
per-address limit. **At the gate**, diff `f3123ad7d12c`, waiting for the founder on the
dashboard; the work loop on the Air publishes on approval.

**A seam to know about.** The run reads its charter from its own worktree, which is
origin/main, so its row says charter 0.2 while the guard code it ran under is this branch's
(0.3, with the llms paths). Consistent once #65 merges; recorded here so the row's hash
reads right later.

**Machine-local facts.** Air: `garage work --every 10` is running in this session's
background; the worktree is at `~/Projects/squaloo-web-app-wrasse/`. Day's spend: $1.26 across
nine runs.

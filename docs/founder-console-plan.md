# The founder's console — a relay, a feed, and a terminal, in versions

**Status:** draft for the founder, 2026-10-21; all seven §7 decisions ruled the same day. Nothing installed, no code changed, no production data read; this file is the only diff in this repo; v0 is built in the private repo. Written by a side session on the mini from the founder's brain dump: *a Founder/CEO dashboard, iterated in versions, that is a feed of sources (news, stock prices, research releases relevant to the stack, analytics from the stack, high-level spending across the stack), Bloomberg Terminal / Palantir quality, fed through a single secure relay that filters from the cloud into a web app.*

**Publication boundary (Solomon rule 18 v1.6).** This file is written to be safe in the public repo: no addresses, account ids, key names, balances or credential custody. Anything held (which account holds which grant, where a key lives, a body's address) belongs in the private repo's companion and is marked `[held]` here.

**Tags**, the house convention: **[sourced]** read in this repo or the engine repo at the path named; **[vendor]** a vendor's own page, read 2026-10-21; **[search]** a search summary of third-party pages, verify before relying; **[recall]** the author's memory, not a source; **[hypothesis]** nothing backs it yet; **[founder fill]** a decision only the founder makes.

---

## 0. Five things to know before reading on

1. **Most of this already exists in pieces.** The Garage's `/garage` page is already "the founder's pane of glass" [sourced `src/app/garage/page.tsx:1`]: keyed, noindex, reads a Neon ledger, polls, has a command box and standing orders. `/measured` already reads a committed export from the engine repo at build time and refuses to render a number without its boundary [sourced `src/data/ruler_export.ts`]. The board agent on the mini already gathers repo and box state deterministically and posts it twice a day [sourced engine repo `scripts/ops/board_agent.sh`]. The console is mostly a *lift and a widening*, not a new system.
2. **Two founder rulings from this week bind the shape** [sourced engine repo `agent/pod_v2_headless_plan.md` §3, 2026-10-20/21]: *"The dashboard is intake and instrument, never a second store"* and *"The console lives in a private app; the SQU-294 publication boundary governs."* §4 adds: *"console migrates off the public app; key-cookie upgrades to real founder auth."* So the console is not a new corner of `squaloo-web-app`; it is the private app those rulings name, and the public site keeps nothing of it.
3. **The relay is the whole security story.** One hosted process holds every vendor key (all read-only), pulls on a tick, normalizes into one feed shape, signs what it serves, and exposes exactly two routes. The console holds no vendor key. The public site holds nothing.
4. **The honest-state vocabulary is the design system.** Every panel carries `ok / warn / unknown / unmeasured` and every number its boundary (rule 16). A source whose API does not exist renders dashed, not zero. This is what makes it Bloomberg-grade rather than Bloomberg-looking: the terminal's authority comes from never showing a number it cannot stand behind.
5. **Spend is the hardest feed, not the easiest.** Of the eight services the stack pays, four have a usable cost API today, two can be derived, one has none, and one is a grant whose balance is only in a portal (§3.2). The plan builds spend in the order the APIs allow and says "unmeasured" where they do not.

---

## 1. What the stack is, as the console will see it

The console reads three kinds of truth, each with an owner that already exists. It never becomes the owner.

| Truth | Where it lives today | Owner | How the console reads it |
|---|---|---|---|
| **Intent** (tickets, priorities, seats) | Linear, team SQU | founder | Linear GraphQL, read-only key, counts by state and `seat:*` label [recall: API shape; the Garage already uses Linear via MCP] |
| **Change** (PRs, CI, merges, stale-green) | GitHub, two repos | founder | `gh`-equivalent REST, read-only token; the board agent's `detect_overlaps` / `detect_stale_green` are already pure functions on `gh --json` output and lift as-is [sourced `board_agent.sh:40-80`] |
| **Machine truth** (bodies, docker, nightly, alerts) | the ops channel on the demo box, on the LAN; launchd logs on the mini | ops agents | **not reachable from the cloud.** A collector on the mini pushes signed observations to the relay (§2.3) |
| **The ruler** (verdicts, comparisons, streak) | the engine repo's export JSONL, committed into `public/ruler/` and `src/data/ledger.ts` here | engine | the same file `/measured` reads; later the ruler DB the north-star doc says ships first [sourced `agent/north_star_ride_along.md`] |
| **The station** (runs, cost, gate, orders) | Neon: `garage_runs`, `garage_events`, `garage_approvals`, `garage_orders` [sourced migrations 0001–0005] | the harness | SQL, the queries `/garage` already runs (`listRuns`, `gateQueue`, `spentTodayUsd`) |
| **The instrument** (hits by kind, path, referrer) | Neon: `garage_hits` | the middleware shim | SQL; the analytics brief's caveat 2c (prefetch inflation) travels with every browser count until the one-visit check is run [sourced `docs/analytics-brief.md` §2c] |
| **The machine** (vends, coins, money) | Neon: `remora_*`; Stripe (test mode) | Remora | the tape's queries (`/api/remora/tape` is public already); float = purchased + promo + returned − vended − refunded [sourced brief R7] |
| **The bill** | eight vendor portals | founder | §3.2, source by source |
| **The world** (markets, news, research, releases) | nobody | — | §3.3, pulled by the relay on a tick, cached as snapshots with fetch time |

The rule that falls out: **the relay stores snapshots, never truths.** A snapshot is an observation with `observed_at` and `vantage` (rule 20); if the console and the owner disagree, the owner is right and the panel says when it last looked.

---

## 2. The relay — one hosted process, two routes, every key read-only

### 2.1 Shape

```
  vendors (read-only keys)         the LAN (mini collector, signed POST)
        │ pull on a tick                      │ push on the board's cadence
        ▼                                     ▼
  ┌──────────────────────────────────────────────────┐
  │  RELAY   (one Node 22 process, strip-types,      │
  │           spawn-only, no shell strings)          │
  │  sources.ts  → one adapter per source            │
  │  normalize   → feed_items / feed_snapshots       │
  │  sign        → Ed25519 over each item (Remora's   │
  │                receipt pattern, src/remora/...)   │
  │  serve       → GET /feed  (bearer, constant-time) │
  │                POST /observe (Ed25519, nonce, ts) │
  └──────────────────────────────────────────────────┘
        │ signed JSON
        ▼
  CONSOLE (private Next 15 app, keyed → real auth)   PUBLIC SITE (nothing)
```

- **Hosting.** Recommended: a second Fly machine beside `remora-machine`, same Dockerfile shape, `shared-cpu-1x` [sourced `workers/remora/fly.toml`], but *with* an inbound HTTPS service, since this one serves. Secrets by `fly secrets set`, never in config. Alternative: a Cloudflare Worker with cron triggers and D1 (zero idle cost, a new runtime and a new storage; the house has Neon and Fly already) [search]. Alternative: the mini alone via launchd (already runs the ops agents; but a Mac behind a home router is not a host for a route the founder's phone reads). **Ruled 2026-10-21: the Fly machine. The mini is the collector, not the relay.**
- **Storage.** Neon, SQL aggregation, hand-written SVG over it: the analytics brief's reasoning holds here unchanged ("rows in Neon, aggregated in SQL, will carry far more traffic than this site has had") [sourced brief §4c]. **A separate Neon project for the console** (ruled 2026-10-21) so the public site's connection string can never read a spend row. If the plan refuses a second project, the fallback is one project, a `console` schema, and a separate Postgres role granted only to the relay and the console, and that comes back to the founder first.
- **Code home.** A new private repository [founder fill: its name], with `relay/` and `app/`, lifting `workers/garage/` conventions verbatim: `.ts` relative imports, `node --experimental-strip-types`, `core/` never touches I/O, every guard ships with a test that proves it fires, one sanctioned dependency per sentence.

### 2.2 The feed, as one schema

Three tables. Shaped so that a platform later is an export, not a rewrite (brief §4b).

```sql
feed_sources (
  id text PRIMARY KEY,            -- 'arxiv.cs.AI', 'vercel.billing', 'garage.hits' ...
  kind text NOT NULL,             -- market | news | research | release | stack | spend | ops
  cadence_minutes int NOT NULL,
  identity text NOT NULL,         -- WHICH read-only credential, by name only, never value
  scope text NOT NULL,            -- what that credential may read, in words
  state text NOT NULL,            -- ok | warn | unknown | unmeasured
  last_ok_at timestamptz, last_error text, last_error_at timestamptz
);
feed_items (                      -- things with a headline: a paper, a story, a PR, an alert
  id bigserial PRIMARY KEY,
  source_id text REFERENCES feed_sources,
  observed_at timestamptz NOT NULL,  -- when the relay looked (rule 20)
  vantage text NOT NULL,             -- 'relay' | 'mini' | ...
  external_id text NOT NULL, dedupe_hash text NOT NULL UNIQUE,
  title text NOT NULL, url text, summary text,
  matched_terms text[],              -- WHY it is here (the stack's own terms, §3.3)
  signature text NOT NULL            -- Ed25519 over the canonical row
);
feed_snapshots (                  -- things with a number: a price, a day's cost, a count
  id bigserial PRIMARY KEY,
  source_id text REFERENCES feed_sources,
  observed_at timestamptz NOT NULL, vantage text NOT NULL,
  metric text NOT NULL, value numeric NOT NULL, unit text NOT NULL,
  boundary jsonb NOT NULL,           -- {n, scope, window, method, measured_on}  (rule 16; NOT NULL on purpose)
  signature text NOT NULL
);
```

A snapshot row cannot be written without its boundary; a chart cannot render without one (the brief's required `boundary` prop, here as a column constraint).

### 2.3 The two routes, and why only two

| Route | Who calls | Auth | Notes |
|---|---|---|---|
| `GET /feed?since=&kinds=` | the console | bearer key, constant-time compare (lift `src/garage/auth.ts`), later the console's real session | returns items and snapshots with their signatures; the console verifies against the relay's public key before rendering, so a tampered relay response is refused, not displayed |
| `POST /observe` | the mini collector | Ed25519 signature over body + timestamp + nonce; replay window 5 minutes; nonce table | the only write from outside; payload is a list of snapshots and items with `vantage='mini'` |

Everything else is closed. The relay's outbound fetches go only to hosts named in `sources.ts` (an egress allowlist in code, the way Remora allows only `spawn(bin, [args])`); a source that wants a new host needs a sentence. Vendor text (news, abstracts, release notes) is **untrusted data**: rendered as text, never as markup, and never as instructions to any later agent (§5, v5).

### 2.4 Guards, each with the test that proves it fires

| # | Guard | Test |
|---|---|---|
| 1 | A snapshot without a boundary is refused at the row | `boundary.test.ts`: insert with `{}` fails; with the five fields passes |
| 2 | A source past 2× its cadence flips to `warn`; past 24 h to `unknown`; the panel shows the last `observed_at` | `staleness.test.ts`: clock advanced, state moves, never silently stays `ok` |
| 3 | Secrets by existence and length only; the relay's log and `/feed` never carry a value; a planted key shape in any outbound row halts the tick | `secrets.test.ts`: lifted from `src/garage/core/secrets.ts` |
| 4 | An `/observe` with a stale timestamp, a reused nonce, or a bad signature is refused with a counted reason | `observe.test.ts` |
| 5 | Egress allowlist: a fetch to an unlisted host throws before the request | `egress.test.ts` |
| 6 | A vendor payload that fails its contract (recorded fixture) marks the source `warn` with the diff, and the last good snapshot stands | `contract.test.ts`, one fixture per source, the way `/measured` keeps exporter fixtures |
| 7 | HALT file: present at tick, the relay serves the last feed and pulls nothing | `halt.test.ts` |

---

## 3. The sources

### 3.1 The stack (version 1)

All of these are queries over rows the stack holds. None needs a new credential beyond the console's own Neon role and two read-only tokens (Linear, GitHub).

| Panel | Rows | State today |
|---|---|---|
| Station: spent today vs caps, at the gate, queued, last 20 runs | `garage_runs`, `garage_approvals`, `garage_commands` | **ok**, the queries exist on `/garage` |
| Cost per hat per day, tokens, tool time | `garage_runs.cost_usd`; tokens and timings land with the brief's step 1 (migration 0006) | **ok** per run, **unmeasured** aggregated until 0006 |
| Instrument: hits by kind by day, top paths, referrers | `garage_hits` | **warn** until the prefetch check (brief 2c) |
| Tape: vends/day, bytes, float, money beside returns | `remora_*`, Stripe | **ok**, test mode |
| Ruler: nightly verdict streak, demo gate, regressions | `public/ruler/ruler_export.jsonl` via `parseExport` | **ok** once the nightly writer lands (SQU-374); today the empty state |
| Intent: open tickets by state and seat, In Review > 24 h, Done this week | Linear | **unknown** until a read key is minted [founder fill] |
| Change: open PRs, green-and-unmerged > 12 h, overlapping files, CI red | GitHub | **unknown** until a read token is minted; detectors lift from the board agent |
| Bodies: which are up, last nightly OK line, last alert, boot-return verdict | the mini collector pushing the board digest's lines | **unknown** until the collector exists (v1) |

### 3.2 The bill (version 2) — source by source, in the order the APIs allow

| Service | Instrument | Grain | State the panel will show at first |
|---|---|---|---|
| **Anthropic (API identities)** | `GET /v1/organizations/cost_report` and `usage_report/messages`; an Admin API key, or a personal or service-account key **not scoped to a workspace** (workspace keys do not work) [vendor: platform.claude.com usage-cost-api] | daily, USD cents; polling once a minute allowed; data appears within about 5 minutes | **ok** once a key is minted: the founder confirmed 2026-10-21 that the API identities sit in a Console organization. Mint the least key that works: a service-account key with no workspace scope, read-only by use, before an Admin key. Group by `workspace_id` and `description` so the ops interpreter and wrasse's API-key class show as their own lines; the Garage ledger's `cost_usd` stays the per-run instrument and the two are reconciled, never summed |
| **Anthropic (subscription seats)** | none by API; the headless plan rules the unit is *limit headroom, not USD* [sourced pod_v2_headless_plan §3 ruling 7] | — | **declared**: a hand-entered fixed-costs row per seat, dated |
| **Vercel** | `GET /v1/billing/charges?teamId=` returning FOCUS v1.3 as JSONL; 1-day granularity; one-year range; published 2026-02-19 [vendor: changelog]. Which plans it serves is not stated on that page | daily | **ok** once a team-scoped read token exists: the founder confirmed 2026-10-21 the team is on **Pro**, the paying plan, so the endpoint is expected to answer; the first call is the proof, and its fixture becomes guard 6's contract |
| **Neon** | `GET /consumption_history/v2/projects` with org id, from, to, granularity, metrics; hourly for 168 h, daily for 60 d, monthly for a year; history begins at the upgrade from Free; polling does not wake computes [vendor] | hourly/daily | The founder confirmed 2026-10-21 the plan is **Free**, so the dollar figure is **declared $0** and the consumption history is **unmeasured** until an upgrade. What matters on Free is headroom, not dollars: the FAQ states per-project quotas of 100 CU-hours a month and 0.5 GB storage, and a project over storage is **suspended, not billed** [vendor: neon.com/faqs/free-plan-limits-and-quotas]. The panel therefore shows CU-hours and bytes against those quotas per project, read from the project object's usage fields [recall; verify the field names], the same shape as the Garage's budget caps |
| **Cloudflare R2** | GraphQL Analytics `r2StorageAdaptiveGroups` (object count, payload and metadata bytes, max per day) and `r2OperationsAdaptiveGroups` (requests by action and status) [vendor]; cost is *derived* from those against the price list | daily | **ok as usage, derived as cost**: the panel says "derived from bytes × list price, not an invoice" |
| **Fly.io** | no documented billing or usage API; invoices in the dashboard via Stripe's portal; GraphQL undocumented for cost [search: community thread, 2026] | — | **unmeasured**; a declared row from the pricing page × provisioned machines, tagged `[estimate]`, and a monthly hand entry from the invoice |
| **Azure** | Cost Management Query API, POST `{scope}/providers/Microsoft.CostManagement/query`, daily granularity up to 31 days, service principal with Cost Management Reader [search; api-version to verify on Microsoft Learn]. The grant's remaining balance appears only in the portal | daily | **unknown**: whether the tenant that holds the grant allows a service principal is a probe, not a guess [held: which account, per `agent/strategy_rulings_2026-10-02.md`] |
| **Stripe** | Balance and balance-transactions, restricted read key [recall] | live | **ok**, and the panel says *test mode* in words until the founder flips it (register row 2) |
| **GitHub Actions** | billing endpoints for an org's Actions minutes [recall] | monthly | **unknown** until read |
| **Linear, Notion, domains, the Mac mini's power** | none | — | **declared**: fixed-costs rows, dated |
| **Supabase (the hosted Brain)** | customer-held by ruling; not Squaloo's bill | — | out of scope, by design |

The spend panel therefore has **two columns the founder reads together**: *measured* (from an API, with its grain and date) and *declared* (hand-entered, dated), and a total that names how much of itself is declared. A total that hides that split would be the decorative number rule 11 forbids.

### 3.3 The world (version 3)

The filter is the stack's own vocabulary, kept in one file the founder edits: terms (`retrieval`, `pgvector`, `quantization`, `small language model`, `edge inference`, `llama.cpp`, `Phi`, `Gemma`, `Qwen`, `nomic`, `Mattermost`, `Raspberry Pi`, `Jetson`, `offline-first`, `agent payments`, `x402` ...), repos to watch, tickers to watch. Every item stores `matched_terms`, so a panel can always answer "why is this here".

| Feed | Instrument | Cost / limits | Notes |
|---|---|---|---|
| **Research** | arXiv API, Atom, no key, `cat:cs.AI` (and `cs.CL`, `cs.LG`, `cs.RO`) sorted by `submittedDate`, about one request per 3 s [search]; filter on `published`, not `lastUpdatedDate` | free | the Gate E handoff already cites by arXiv id; the research library's lanes are the seed terms |
| **Models** | Hugging Face Hub `/api/models?sort=lastModified&search=gguf` [recall; verify] | free | the ruler's admissibility rule is the filter: GGUF, under a body's budget |
| **Releases** | GitHub `releases.atom` per watched repo (llama.cpp, llama-cpp-python, pgvector, Mattermost, Next.js, Drizzle, yt-dlp) [recall; verify] | free | yt-dlp matters to Remora's pinned binary |
| **News** | GDELT DOC 2.0, JSON, no key, rolling 3-month window, 65 languages [search]; Hacker News Algolia search, no auth, `tags=story` [vendor: hn.algolia.com/api]; vendor changelogs and blogs by RSS/Atom (Vercel, Neon, Cloudflare, Fly, Anthropic) | free | NewsAPI's free tier is development-only [recall]; not needed |
| **Markets** | Finnhub (free tier 60 calls/min per one source, 300/day per another; real-time entitlement disputed), Alpha Vantage (25/day), Twelve Data (800/day, delayed), Polygon now Massive (delayed only, free) [search, sources disagree] | free, delayed | watchlist [founder fill]; LSE coverage (Raspberry Pi Holdings) on free tiers is **unknown**. The panel prints the delay beside every price |
| **Traffic context** | Cloudflare Radar bot share, already library S2 | free | the register's qualifier (request share, one network) travels with it |

### 3.4 The watchlist and the terms file (ruled 2026-10-21)

One file, `terms.ts`, in the private repo. Every entry carries the panel it feeds and a one-line *why*, so a feed item's `matched_terms` always answers "why is this here". The founder edits it; nothing else writes it.

**The desk.** Twelve names in four groups. Most of the stack is private (Vercel, Fly, Neon, Stripe, Mattermost, Hugging Face, Anthropic), so public exposure is thinner than the vendor list suggests. This panel is context beside spend and news, never a signal; the console offers no trade or recommendation.

| Group | Tickers | Why |
|---|---|---|
| Platforms the stack pays | MSFT, NET | Azure holds the reference Brain and the grant; Cloudflare holds R2 and the Radar figures the register quotes |
| Silicon the bodies run on | NVDA, ARM, RPI (London) | Jetson Orin is the Scout; every body is Arm; Raspberry Pi Holdings is the Sentinel and the Foundry |
| Incumbents, and the downtime figures' authors | ROK, SIEGY, ABBNY, HON, EMR | The level-set doc's downtime figures come from ABB and Siemens; Rockwell, Honeywell and Emerson are who a design partner already buys from |
| Comps for the trust-layer narrative | PLTR, IOT, PTC | Palantir is the UI bar and the verification-layer comp; Samsara the connected-operations comp; PTC owns ThingWorx |

Access is a later decision: free tiers are delayed and the London listing may not be covered by them, so that row renders **unknown** until a source answers, and every price prints its delay.

**The terms, by lane.** Each lane names the feed it filters.

| Lane | Terms (seed) | Feeds |
|---|---|---|
| Retrieval and grounding | hybrid retrieval, reciprocal rank fusion, pgvector, reranking, abstention, context gate, knowledge conflict, citation grounding, Matryoshka embeddings, nomic-embed | research |
| Small models on the edge | small language model, quantization, GGUF, llama.cpp, edge inference, Phi, Gemma, Qwen, Llama | research, models |
| Agent verification | agent contracts, tool verification, temporal logic for agents, agent benchmarks, prompt fragility | research (the Gate E lane; the handoff's arXiv ids are the seed citations) |
| The industry | industrial maintenance, CMMS, connected worker, offline-first, tribal knowledge capture, Augmentir, Parsable, UpKeep, Mattermost, Raspberry Pi, Jetson | news |
| The Garage (R&D) | AI crawlers, bot traffic, llms.txt, agent payments, x402, Vending-Bench, Project Vend | news, research; also wrasse's library |
| Remora (R&D) | yt-dlp, ffmpeg, Stripe agentic commerce | releases, news |
| Exclusions | crypto price talk, consumer chatbot launches, anything matching "AI" alone | all |

**Repos watched by release feed:** llama.cpp, llama-cpp-python, pgvector, Mattermost, Next.js, Drizzle, yt-dlp; the nomic embedding model's Hub page by the models feed.

Two principles for this feed, from the Garage charter: **a `[recall]` is never a source** (every world item links its primary), and **revenue never stands alone** (a market panel next to a spend panel is context, not a trade signal; no personalized financial advice is offered or implied by the console).

---

## 4. The terminal — what "Bloomberg / Palantir quality" means here

Bloomberg's screens are dense, four panels at login, keyboard-first, with colour as a signal vocabulary (yellow for sectors, green for go, red for cancel) rather than decoration [search: Bloomberg, Yale and CUNY library guides]. Blueprint is Palantir's toolkit for dense desktop data UIs, with a dark theme designed rather than inverted [search]. Neither is a dependency here; both are a bar.

What the house already has that fits: a terminal-style landing page with a typed command sequence [sourced `src/components/TerminalAnimation.tsx`], a mono font, a token set, the `/garage` layout (counters, sections, dashed empty states), and the honest-state vocabulary. The console is that idiom taken seriously:

1. **Four panels by default**, a grid the founder can re-arrange and save (per layout, local to the console's own store, never a cookie the public site sees).
2. **A command line, not a nav.** `GO`-style: `spend 30d`, `tape`, `ruler`, `news stack`, `arxiv edge`, `prs`, `bodies`, `halt relay`. The Garage's command box is the precedent; the landing page's animation is the voice.
3. **Every panel header is the same five words:** source · vantage · observed · state · boundary. A panel without them does not compile (a required prop, as the brief ruled for charts).
4. **Colour is state.** `ok` quiet, `warn` the one amber the token set chooses (today there are two ambers in the app [sourced brief §3]), `unknown` dashed, `unmeasured` dashed with the sentence that says why. Up/down on a market tick is a second, separate pair. Nothing else is coloured.
5. **Hand-written SVG charts** in a shared `components/charts/` set: sparkline, bars by day, stacked bars by kind, a state strip, one line with a band; pure geometry functions tested without a browser; a sibling table for the accessible reading. The uPlot sentence stays pre-written for the day a chart cannot be read [sourced brief §3].
6. **Dense, tabular, mono, no chrome.** `tabular-nums` everywhere; the page is readable at phone width because the sweep happens from a phone, and the HALT file is already designed to be touched from one.
7. **Keyboard:** `/` focuses the command line, `1`–`9` focus a panel, `j`/`k` move within it, `r` refreshes, `?` lists commands.
8. **Auth:** the key cookie from `/garage` for v0–v3 (constant-time compare, httpOnly, secure), replaced by real founder auth in v4 (ruled 2026-10-21) [founder fill at v4: passkey/WebAuthn, or the host's identity provider].

---

## 5. The versions — one per sitting, each ends runnable

Remora's and the Garage's rule, kept: one phase per sitting; every phase ends with something runnable; one PR per phase; branch `console/feat/<name>` in the private repo.

| v | Name | What lands | What proves it |
|---|---|---|---|
| **0** | **The wire** | private repo; `relay/` with `sources.ts`, the three tables, one zero-key world source (arXiv) and one stack source (`garage_hits` by kind by day, read-only role); Ed25519 signing; `GET /feed`; `app/` with four panels, headers, states, one sparkline; the key cookie; guards 1, 2, 3, 5, 7 with tests | the console renders a paper and a hit count with boundaries, verifies the relay's signature, and shows dashed panels for everything else; `curl` with a wrong key is refused |
| **1** | **The stack** | tape, station, ruler, intent (Linear), change (GitHub) panels; the mini collector (`launchd`, same template family as the ops agents) pushing the board digest's lines over `POST /observe`; guards 4 and 6 | the board agent's `detect_stale_green` fires on a planted PR inside the console; a body's last nightly line shows with `vantage='mini'` and its time |
| **2** | **The bill** | spend sources in the order of §3.2, each with a contract fixture; the `fixed_costs` table; the measured/declared split; a monthly roll; thresholds reusing the Garage's budget shape (`$x per day`) | the spend panel totals and names its declared share; a vendor fixture change marks the source `warn` and keeps the last good number |
| **3** | **The world** | HN, GDELT, RSS/Atom, Hugging Face, releases, the watchlist; `matched_terms`; read/unread; dedupe by hash | an item answers "why is this here"; a price prints its delay; the rate budget per source holds across a day |
| **4** | **The terminal** | the command line, keyboard, saved layouts, phone layout, alert rules (a `warn` that persists past N hours posts one line to the ops channel via the existing webhook path, deduped like the board's alerts), real founder auth | a command reaches every panel; an alert fires once and not twice; the key cookie is gone |
| **5** | **The analyst** (optional) | a wrasse-style read-only hat, under the Garage charter and caps, that reads the day's feed and writes one report *as a feed item*, every claim tagged `[sourced]`/`[recall]`, treating feed text as data | the report's cost appears in the station panel beside its own text |

What is deliberately **not** in any version: a second store for anything the stack already owns; any write to Linear, GitHub, Stripe or a body; a third-party analytics script; a trade, a transfer, or a recommendation about one; anything in `squaloo-web-app`.

---

## 6. Risks, named with their earliest symptom

| Risk | Earliest symptom | Guard |
|---|---|---|
| The console becomes a second store and drifts from the owner | a number on the console disagrees with `/garage` or `/measured` | the panel always links the owner and prints `observed_at`; the relay stores snapshots only |
| It drifts into "Solomon trenches" (the Remora lesson) | a panel grows a trust tier | the versions are the scope; anything else is a back-pocket note |
| Stale data read as current | a `warn` source still shows its old number without saying so | guard 2; the state is in the header, never only in the colour |
| A vendor API changes under the relay | a contract fixture fails | guard 6; last good snapshot stands, source goes `warn` |
| A key leaks | — | read-only, scoped keys only; Fly secrets; rule 18 probing; the public repo holds nothing |
| Free-tier limits burn out mid-day | a source goes `warn` with `429` | per-source rate budget in `feed_sources.cadence_minutes`; the relay never retries hot |
| Feed text carries instructions aimed at an agent | an analyst report acts on a headline | v5 treats every item as data; the charter's gate still applies to anything it would write |
| The LAN is dark (a power cut) | bodies panel goes `unknown` | that is the correct display; the console must not infer "down" from "unheard", the same way a watcher's silence is not coverage |

---

## 7. Decisions for the founder

1. **Home — RULED 2026-10-21 (founder): a new private repo holds the relay and the console.** The public app keeps nothing of it beyond this plan. Name of the repo and of the console [founder fill].
2. **Relay host — RULED 2026-10-21 (founder): a Fly machine beside Remora's.** The mini is the collector, never the relay.
3. **Database — RULED 2026-10-21 (founder): a separate Neon project for the console.** Checked the same day: the Free plan allows multiple projects (the FAQ says 100; an older docs page says 10), each with its own 100 CU-hours and 0.5 GB [vendor: neon.com/faqs/free-plan-limits-and-quotas]. So the console gets its own allowance, and its own hard edge: **0.5 GB suspends the project**, so `feed_items` keeps a bounded window (90 days, then pruned) and `feed_snapshots` rolls to one row per metric per day past 30 days. The fallback (one project, a `console` schema, a separate role) is no longer needed.
4. **Spend order — RULED 2026-10-21 (founder, by the facts given): Anthropic is a Console organization, Vercel is Pro, Neon is Free.** So v2 builds spend in this order: (a) Anthropic cost report, by workspace and description; (b) Vercel billing charges; (c) Cloudflare R2 usage, cost derived; (d) Neon headroom against the Free quotas, dollars declared $0; (e) Stripe balance, test mode said in words; (f) Fly declared from the price list; (g) GitHub Actions minutes; (h) Azure, a probe on the account that holds the grant [held]. Every token is read-only and the least that works, set as a Fly secret by name, probed by existence and length (rule 18), with its name and scope in `feed_sources.identity` and `.scope`. Which tokens exist and where each is held is recorded in the private repo, not here [held].
5. **The watchlist and the terms — RULED 2026-10-21 (founder): the full desk of tickers (access considered later), and the Garage's and Remora's lanes included as R&D, not hidden.** The first list is §3.4; the file stays the founder's to edit.
6. **Auth timing — RULED 2026-10-21 (founder): the key cookie through v3; real founder auth lands at v4.**
7. **The public site — RULED 2026-10-21 (founder): never reads the feed.** The console and relay are fully private; the public site keeps the tape and `/measured` it already has.

Nothing was installed, no code changed, and no production data read. Figures tagged **[search]** and **[recall]** are leads to verify, not facts to quote.

# Analytics and dashboards, across the whole app — a brief for the gate

1. **Most of what Remora and the Garage need is already a SQL query over rows we hold**; the real gaps are the rows marked unmeasured in section 1, and every one closes in-house (the 402 count needs one founder-approved line in Remora's jobs route).
2. **The server-side instrument sees agents, crawlers and probes; every browser beacon sees only browsers that run JavaScript.** They answer different questions, and no beacon replaces the instrument for the "mostly agents" claim (section 2).
3. **Charts: hand-written inline SVG, no dependency.** A library (uPlot, 21.9 KB gzipped) is named and its sentence pre-written, but it waits for a trigger (section 3).
4. **Build order: verify the hit count, then timings and tokens, then traces, then `garage_scores`, then `garage bench`** (section 4). A platform is justified only when a second cell needs the instrument the first cell already has.
5. **Four calls are the founder's**, collected at the end. Nothing here was installed or changed; this file is the only diff.

Written 2026-10-18 by a side session for the founder's standing question ("what would help analytics and dashboards across the whole app, so there is never urgency to bolt on a platform"). Facts about this repo were read from `origin/main` at 920c182 (2026-10-18). Facts about vendors were read from vendor pages or web search on 2026-10-18 and are tagged: **[vendor]** a vendor's own page, **[search]** a search summary of third-party pages (verify before relying), **[recall]** the author's memory, not a source (charter section 6). Prices change; none here is a quote.

SQU-355 (the shared design token set and honest-state vocabulary) could not be read from this session: the Linear connector was not authorized here. Where this brief touches colour or state it says what a dashboard should *take from* SQU-355, and does not invent tokens.

---

## 1. The questions each surface needs answered

Register style: one row per question, the instrument that answers it **today**, and an honest state. States are the founder's vocabulary: **ok** (measured, boundary stated), **warn** (measured, but a known caveat changes how to read it), **unknown** (a source exists, not yet checked), **unmeasured** (no instrument). "Today" means the code on `origin/main` at 920c182, read, not run: no production database was queried for this brief, so no row below carries a live count.

### 1a. Remora

| # | Question | Instrument today | State |
|---|---|---|---|
| R1 | How many vends per day, and how many bytes? | `remora_assets` counts on the tape (`src/remora/db/tape.ts:12-20`), 14 days, UTC. Public at `/api/remora/tape`. | **ok** |
| R2 | How many cards were taken, per day? | `remora_cards.created_at` (migration 0004). A query exists nowhere in code; the data does. | **ok** as data, **unmeasured** as a displayed number |
| R3 | The funnel **card → peek → jobs → receipt**, as a cohort (of the cards taken in a window, how many peeked, vended, got a receipt)? | Card → vend → receipt can be cohort-joined on `card_id` across `remora_cards`, `remora_jobs.card_id`, `remora_ledger`, and `remora_assets` where `kind = 'receipt'`. **Peek is never recorded against a card.** | **warn**: two of four steps are a true cohort; peek is not |
| R4 | The same funnel as *volume*: how many requests hit each step, by visitor kind? | `garage_hits`, paths `/api/remora/card`, `/peek`, `/jobs`, `/verify`, by kind, by day. Method column separates GET from POST on `/jobs`. | **warn**: request counts, not visitors. No visitor id exists by design (charter guideline 4), so step-to-step drop-off cannot be computed from it. See also the prefetch caveat in 2c |
| R5 | How many 402s (a vend refused for lack of coins)? | None. Register row 22 says so: the middleware runs before the route and cannot see a response status. The only source of truth is the `jobs` route returning 402 (`src/app/api/remora/jobs/route.ts`, the `!job` branch). | **unmeasured** |
| R6 | Vend duration by quality? | `remora_jobs.created_at` to the video asset's `created_at`, grouped by `quality`: end-to-end (queue wait plus vend). The split is lost: `claimed_at` is rewritten by every heartbeat and `claimed_by` is cleared on completion (`src/remora/db/queue.ts:111,120`). | **warn** end-to-end; **unmeasured** vend-only |
| R7 | Coin float (coins sold or granted and not yet spent)? | `remora_ledger` is append-only and a balance is `SUM(coins)` (migration 0004). The tape already carries the five totals; float is `purchased + promo + returned − vended − refunded` (the tape stores vend and refund as absolute values). The tape page shows "coins returned" and no float line. | **ok** as arithmetic, **unmeasured** as a displayed number |
| R8 | Revenue next to its returns (charter section 6, "revenue never stands alone")? | Tape `money` from Stripe plus coin totals. Test mode today (register row 2): no real dollar. | **ok**, test mode |

### 1b. The Garage

| # | Question | Instrument today | State |
|---|---|---|---|
| G1 | Cost per run, and per hat per day? | `garage_runs.cost_usd`, from the SDK's `total_cost_usd` (`workers/garage/run.ts:196`). Per run on the dashboard; per hat or per day is a `GROUP BY` nobody has written. | **ok** per run, **unmeasured** aggregated |
| G2 | Tokens per run? | Not recorded. The run row keeps cost, turns, tool calls, denials, and nothing about tokens. | **unmeasured** |
| G3 | Time per tool? | Not recorded. A `tool` event is written once, in the post-tool hook (`workers/garage/run.ts:124-126`), so its `at` is the moment the tool finished; the pre-tool hook (line 114) writes only refusals. No start time is kept, and the gap between two events includes the model's thinking time, so it is not a tool duration. | **unmeasured** |
| G4 | What did a run actually do, call by call? | `garage_events.detail` holds a summary of the tool input, not the input and not the output. | **warn**: a summary, not a trace |
| G5 | Prediction scores (charter section 6: calibration is the proficiency number)? | No table. Migrations 0001–0005 have no predictions or scores; predictions live in report text and the Notion predictions page. | **unmeasured** |
| G6 | Hits by kind over time? | `garage_hits`, dashboard "The instrument": 7-day table by kind and day, top paths, families, referrers (`src/app/garage/page.tsx:269`). Counting since 2026-10-13. | **warn**: the window is fixed at 7 days, there is no chart, and 2c applies |
| G7 | Did a guard fire, and how often? | `garage_events` kind `deny` and `halt`, and `garage_runs.denials`. | **ok** per run; no trend view |

### 1c. The public site

| # | Question | Instrument today | State |
|---|---|---|---|
| S1 | Which pages are requested, by visitor kind? | `garage_hits` top paths, with ids folded to `:id`. Static files, `_next`, the Garage's own pages excluded (`src/garage/core/hits.ts`, `isCountable`). | **warn** (2c) |
| S2 | Where do visitors come from? | `garage_hits.ref_host`: the host of the `Referer` header only, own site blanked. | **warn**: present only when the visitor's browser or app sends it, and absent for agents and for most native-app referrals (register row 27 notes the same blindness) |
| S3 | Is it mostly agents? | Register row 15: **needs review**. The instrument counts only bots that declare themselves; the founder's baseline from the first study was 15% of 67 hits over 53 minutes (run `3ab57ff5`), against a worldwide request share of 65% on one network (register row 14). | **warn**, and not comparable across those two figures |
| S4 | Pages per visit, entry and exit pages, time on page, scroll depth? | Nothing. A visit has no id here. | **unmeasured** |
| S5 | Device and browser mix, country? | The user agent is reduced to a family and thrown away; the address is never read. Country and device class are not recorded. | **unmeasured**, partly by charter |
| S6 | Real-user page speed (Core Web Vitals)? | Nothing. | **unmeasured**; needs a browser |
| S7 | Does a page change move a number (charter section 1, step 3)? | Needs S1–S4 plus a prediction row. | **unmeasured** end to end |

---

## 2. What the server-side instrument sees, and what a browser beacon sees

### 2a. The instrument (today)

`src/middleware.ts` records one `garage_hits` row per countable request: path (normalized), method, kind, family, referrer host. No address, no raw user agent, no query, no cookie (the middleware checks only that the founder's key cookie *exists*, to label `self`).

- **Sees:** every request that reaches the middleware and is not a static file: browsers, declared agents (`Claude-User`, `ChatGPT-User`, …), AI crawlers, search crawlers, monitors, tools (`curl`, `python-requests`), scanners (classified by path before user agent).
- **Cannot see:** a response status or duration (so 402s, 404s, latency); anything that happens in the page after load; one visitor across two requests; JavaScript-only signals (time on page, scroll, viewport); and a client that lies about itself, which lands in `browser` or `unknown`.
- **Population:** every HTTP client that asks, counted by request. Not visitors. A bot making a thousand requests is a thousand hits (register row 14's qualifier).

### 2b. A browser beacon, and the five usual suspects

Agents and crawlers mostly run no JavaScript, so a script-tag beacon never fires for them. Headless browsers do run it, and whether each product counts or filters them is a vendor detail not verified here. The five below therefore measure **a population the instrument undercounts and cannot describe well (people in browsers)**, and miss the one the founder cares about most (agents). Two products can run on a second path, a server-side events API, which is a different thing and is noted per row.

| | Population it measures | Cost | Hosting weight | License | Cookie banner |
|---|---|---|---|---|---|
| **Vercel Web Analytics** | Browsers running its script; visitors identified by a request hash discarded after 24 h **[vendor]**. | Hobby: 50,000 events/month, cannot buy more, collection pauses at the limit; Pro: pay per event, current docs $0.03 per 1,000, an older version of the same docs said $3 per 100,000 with 100,000 included **[search]**, so check the live page. Which plan this team is on: **unknown**. Retention on Hobby 1 month, Pro 12 **[search]**. | None; hosted by Vercel. Adds the `@vercel/analytics` package (a dependency) or script injection. | Proprietary service. Package license not checked. | Vercel's own page says no cookies and no personal identifiers **[vendor]**. Whether that ends the banner question is a legal call, not settled here. |
| **Plausible** | Browsers running a script described as under 1 KB **[search, vendor homepage claim]**; unique visitors by a random string reset daily, no cookies or persistent identifiers **[vendor]**. | Cloud from about $9/month for 10,000 pageviews, a 30-day trial, no permanent free plan; higher tiers disagree between sources **[search]**. | Cloud: none. Self-hosted Community Edition: Elixir, Postgres and ClickHouse; one third-party source measured about 1.8 GB idle RAM and recommends 4 GB **[search, single source]**. | AGPL for the Community Edition **[search]**. | "No cookie banner required" **[vendor]**. |
| **Umami** | Browsers running its tracker; anonymous session id **[vendor]**. | Self-hosted free; cloud pricing not checked. | Node app plus Postgres 12.14 or newer **[vendor]**; could share Neon in principle, which would put analytics rows beside the ledger. | Page does not state it; MIT is **[recall]**. | No cookies, "no cookie notice" **[vendor]**. |
| **PostHog** | Browsers via a JS SDK; also a server-side capture API, so agents *could* be sent as events by our own server **[recall]**. Cookie behavior is configurable **[recall]**. | First 1 M product-analytics events/month free, then about $0.00005 per event for 1–2 M; anonymous events cost 10× less **[search]**. | Cloud: none. Self-hosted: heavy (ClickHouse and others). Its SDK is the largest of the five **[recall]**. | MIT with a separate enterprise directory **[recall]**. | Depends on configuration; with default cookie/localStorage persistence expect to need consent in the EU **[recall]**. |
| **Cloudflare Web Analytics** | Browsers running its beacon. Proxied sites get edge analytics without a beacon; **a Vercel-hosted site not proxied by Cloudflare uses the manual beacon** **[vendor]**. Whether squaloo.com is proxied: **unknown**. | The page does not state a price; free is **[recall]**. | None. | Proprietary service. | The page does not mention cookies; cookieless is **[recall]**. Unsampled beacon data kept 7 days then aggregated to about 10%, and queries apply dynamic sampling **[vendor]**. |

**The charter in the way.** Guideline 4 (founder-ratified 2026-10-13) says no third-party analytics, pixels, fingerprinting or new cookies, and that an instrument counts on the server and stores no personal data. Every row above is a third-party script unless self-hosted, and even a self-hosted cookieless beacon is a change to what the guideline says. That is a founder decision (decision 2 below), not a library choice.

### 2c. The caveat that touches every number in section 1

**Candidate, not a finding (rule 20): the instrument may count Next.js link prefetches as browser hits.** `isCountable` excludes static files and the Garage's own paths and nothing else; `normalizePath` strips the query string; nothing reads a prefetch header. If Next's router prefetches linked routes by fetching them (this is the documented behavior for `<Link>` in production **[recall]**), one person landing on a page with N links may write up to N+1 `browser` hits, and the "browser share" in G6, S1 and S3 would be inflated by an unknown factor. The check is cheap: one fresh private-window visit to production, then count `garage_hits` rows for that minute, N = 1 visit, by one person on one device on one date. It was not run for this brief (no production access from this session). Until it is, read "hits" as requests, and read browser counts as an upper bound.

---

## 3. Charting in-house: SVG against one small library

What the repo has today: the tape's "chart" is a string of nine Unicode block characters (`sparkline`, `src/remora/core/tape.ts:72`); the Garage dashboard is tables; the only client component in either corner is the poller (`src/app/garage/poller.tsx`, and the Remora one beside it). There is inline SVG elsewhere in the repo (several `marshal-qr` pages and components), and no chart anywhere.

**Sizes** (bundlephobia API, whole-package import, queried 2026-10-18; the versions are the ones queried, not necessarily the latest; a tree-shaken Chart.js build is smaller than its row and was not measured):

| | Minified | Gzipped | Renders | Client JS | Licence |
|---|---|---|---|---|---|
| Hand-written SVG components | 0 B | 0 B | server-rendered SVG | none | ours |
| uPlot 1.6.32 | 50,830 B | 21,856 B | canvas | yes, a client island | MIT (README) |
| Chart.js 4.4.7 | 197,982 B | 67,438 B | canvas | yes | not checked |
| Recharts 2.15.0 | 498,112 B | 123,767 B | SVG via React | yes | not checked |

**Hand-written SVG.**
- *For:* zero dependency; server components render it, so it ships no JavaScript and shows with JS blocked; colour comes from the SQU-355 tokens through CSS variables, which canvas cannot read without code; a sibling `<table>` gives the accessible reading; an unmeasured series can render as the existing dashed empty state instead of a flat zero, which keeps the honest states first-class.
- *Against:* we write and own the axes, tick rounding, time scales and tooltips; no zoom or pan; legibility degrades as points per series climb. The five things this app needs soon are all small: sparkline, bars by day, stacked bars by day (hits by kind), a strip of states, and one line with a band (cost per run). About 150–250 lines for the set, an estimate of this author, not a measurement.

**uPlot, the one small library.** The smallest of the three by a wide margin at 21.9 KB gzipped (v1.6.32, bundlephobia, 2026-10-18), MIT, built for time series. Its costs here: it is canvas, so it needs a `"use client"` island and loses CSS-variable theming and screen-reader text; it would be the first charting client JS on a dashboard that ships one small poller.

**Recommendation: hand-written SVG, in `src/components/charts/`, pure functions for the geometry (so `core/`-style tests need no browser), thin server components for the markup.** Every chart takes a `tone` from the honest-state vocabulary and carries its boundary line (N, scope, window, method, date) as a required prop, so a chart cannot render without one. No colour literals in chart code; today the dashboards hard-code them (the Garage page uses `#63a375`, `#5688c7`, Tailwind `amber-400`; `/measured` uses `#d98c5f` for amber: two ambers in one app, observed 2026-10-18), which is exactly what SQU-355 should replace.

**The sentence the rule requires.** For the recommended path no dependency is added, so none is owed: *"No new dependency: charts are hand-written SVG because these pages are server-rendered and a chart library would add client JavaScript to a dashboard whose only client component is a poller."* If the trigger below fires, this is the sentence to put beside the `package.json` line: *"uPlot, MIT, 21.9 KB gzipped (v1.6.32, bundlephobia, 2026-10-18): added because hand-written SVG stops being legible past about 2,000 points per series and we now need zoom."* The 2,000 is a threshold this brief chose, not a measurement; the trigger is a real chart the founder cannot read, not the number.

---

## 4. The sequence

### 4a. What to build first, with the four approved Garage notes

The founder ruled on 2026-10-18 to grow four things in-house. They depend on each other; this is the order that avoids rework.

0. **Check the prefetch candidate (2c).** One visit, one minute of rows, no code. Every `garage_hits` number in this brief and on the dashboard waits on it. If it holds, the fix is one condition in `isCountable` or in `hitFor` and a test, on the Garage's own touch list.
1. **Timings and tokens on events and runs.** An additive migration (`0006`), no edit to an applied file: a duration and token counts on `garage_events` and a token total on `garage_runs`, the start taken in the existing pre-tool hook and the end in the existing post-tool hook, matched on the tool-use id. Closes G2 and G3, and G1's per-hat aggregation becomes a view. Smallest change, largest unlock; everything after writes to or reads from it.
2. **Full tool-call traces.** Same post-tool hook, which already receives the tool's full input and response (`tool_response`, which the secret guard reads today), storing them instead of a summary (closes G4). Second because it reuses step 1's plumbing, and it needs a founder ruling first (decision 3): traces can carry secrets and customer text, and the charter's output guard (guard 5) covers *output lines*, not a stored database column.
3. **`garage_scores`.** Needs predictions to exist as rows, and today they are prose (G5). So the first design question is where a prediction is banked. The table's columns should make charter rule 16 a constraint: metric, instrument, window, N, method and measured-on date as `NOT NULL`, plus direction-held and the size ratio (charter 0.5 scores direction first), plus the state vocabulary as a checked column, so a number cannot be stored without its boundary.
4. **`garage bench`.** Replays fixed prompts per hat and writes cost, time and a score. Last because it has nowhere to put its results until steps 1 and 3 exist.

In parallel with 1–4, and independent of them: the shared `src/components/charts/` set (section 3) and the Remora and public-site read queries that cost nothing to add: R2 (cards per day), R3 (cohort funnel across card, vend and receipt), R6 (end-to-end vend time by quality), R7 (coin float), G1 aggregated. Remora's database corner belongs to Remora's author, not to wrasse (charter section 7), so those queries are a founder-session change, not a wrasse proposal. R5 (the 402 count) needs a one-line write in the jobs route and stays unmeasured until the founder allows it.

### 4b. One pattern that keeps the door open

Shape the new rows so a platform later is an *export*, not a rewrite: give events a run id as a trace id, a per-call id and a parent id, a start and end time, and attributes as one JSON column, in the spirit of OpenTelemetry's GenAI conventions (still evolving, **[recall]**, so copy the shape, not the names). It costs a few columns now and makes the platform decision reversible.

### 4c. What would justify a platform later

The trigger the founder named: **a second cell needing the same instrument.** Made concrete so it can fire or not: *when a second corner (a second agent, or a second product beside Remora) needs a capability the first already has (per-run traces with timing and tokens, a prediction-and-score ledger, a funnel, or this dashboard's charts) and the honest plan is to copy a table, its writer, its queries and its charts a second time.* Copying once is a pattern; the second copy is the moment to ask whether to stop owning it.

At that point the founder would weigh, in this order: whether the shared pieces can be lifted out of `src/garage/` into one place (cheaper than a platform if the shapes match); then a platform for the part that is genuinely commodity (trace storage and a query UI), evaluated against rows already shaped as in 4b, so the evaluation is an import test and not a promise. The 2026-10-18 Langfuse evaluation stays the record of the last time this was asked.

Not triggers, to save a future argument: dashboard envy; a chart the SVG set cannot draw (that fires the uPlot sentence, not a platform); and a bigger N. Rows in Neon, aggregated in SQL, will carry far more traffic than this site has had. The instrument's window to date is five days (2026-10-13 to 2026-10-18), a statement about our history, not a capacity figure.

---

## Decisions for the founder at the gate

1. **Run the prefetch check (2c), or tell me to?** It sets how every hit number should be read.
2. **Does a first-party, cookieless browser beacon on our own endpoint, without a third-party script, fit guideline 4?** The brief assumes no, and recommends nothing that needs yes. If yes, the only candidate worth a look is Next's built-in web-vitals hook posting to an endpoint we own (S6); it adds no dependency **[recall]**, and it still counts only browsers.
3. **Trace retention and redaction (4a, step 2).** Store full tool input and output? For how long, and with what redaction before the row is written?
4. **Approve the order in 4a**, or reorder it.

Nothing was installed, no code changed, and no production data was read. Figures labelled **[search]** and **[recall]** are leads to verify, not facts to quote.

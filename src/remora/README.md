# Remora

> Canonical plan. The archive copy in `~/Projects/remora/PLAN.md` is a snapshot.


> A remora is the small fish that rides along with a shark and eats what it drops.
> Squaloo is the shark. This is the thing that rides along and fetches video.

**Purpose:** a side project to unwind from Solomon while staying sharp. Small, finishable
phases. Every phase ends with something you can run.

**Where it lives:** a corner of `~/Projects/squaloo-web-app`, not its own repo. This folder
(`~/Projects/remora`) is the archive: the 2024 scaffold snapshot in `legacy/` and this plan.
Once Phase 0 lands, the plan's home is `squaloo-web-app/src/remora/README.md`.

**Started:** 2026-10-10. v1 of this plan assumed a separate repo; see "Why the corner" below.

---

## v3 — the vending machine  (north star, 2026-10-10, late; hosting + money amended same night)

**Reset.** v2 drifted into Solomon's trenches: trust panels, provenance tiers, corpus
ingest. The technical integration stays in the back pocket. The *product* is this:

> **Remora is a video vending machine.** Insert a coin. Pick a slot. Something drops.
> You keep the receipt.

Flamethrower rules: it is fun to use even when the job is mundane, it is real and it
takes money, it tells the truth about itself, and the lore is the marketing.

**The five things that make it novel, not another yt-dlp wrapper:**

1. **The receipt.** Every vend comes with a signed receipt: what it was, where it came
   from, when, SHA-256 of the bytes, Remora's Ed25519 signature. Printable, thermal-receipt
   styled, verifiable at `/remora/verify`. Nobody else hands you proof the video existed.
   That is the Solomon DNA, shaped like a consumer product instead of infrastructure.
2. **The coin.** Coins are bought in sleeves (see "Collecting cleanly"). Stripe Checkout.
   No ads, no account to start, coin return on failure. The old regular/premium/admin
   tiers become sleeves and a punch card.
3. **The slots.** The menu *is* the roadmap, and each slot is one sitting of fun:
   `VIDEO` · `AUDIO` · `CLIP (start–end)` · `GIF` · `THUMBS` · `TRANSCRIPT` · `CHAPTERS`.
   Transcript is where whisper.cpp enters, as a slot, not as infra. New slots get a
   "NEW" tag and a little jingle.
4. **The tape.** A public, live sales tape: vends today, coins in, revenue to date, the
   machine's uptime. Hashes shown, titles hidden. An open-books counter is both a
   Boring Company stunt and the most Squaloo thing possible.
5. **The machine never sleeps.** Fulfilment runs on an always-on box in the cloud, not
   a laptop. The front panel still tells the truth: if the box is unreachable it says
   `OUT OF ORDER — coins are safe`, and that should be a rare sight, not a feature.

**The front panel** is a vending machine: glass, slots with lit labels, a coin slot, a
flap at the bottom, a receipt printer. Clunk. Drop. Sound on by default, because fun.

### Where the machine lives (always on)

| Part | Where | Why |
|------|-------|-----|
| Front panel + API | Vercel (existing site) | `/remora` and `/api/remora/*`. Enqueue, status, checkout, webhooks. Never runs yt-dlp. |
| **The machine** (worker) | **Fly.io**, one always-on machine, Docker | `workers/remora/Dockerfile`: Node 22 + ffmpeg + the yt-dlp Linux binary, pinned. `auto_stop_machines = false`, `min_machines_running = 1`. ~$5–7/mo for 1 GB RAM. Deploy from the repo with `fly deploy`. Pulls jobs from Neon; needs no inbound port. |
| Queue + ledger | Neon Postgres (existing) | Jobs, coins, receipts. Single-statement `SKIP LOCKED` claims. |
| **The flap** (files) | **Cloudflare R2**, not Vercel Blob | Video is egress. R2 charges $0 egress and ~$0.015/GB storage; Blob charges per GB served. Signed URLs with expiry. S3-compatible, so `@aws-sdk/client-s3` or a tiny signed-fetch. |
| Money | Stripe Checkout + webhooks | Hosted checkout: card data never touches us. |
| The Mac | dev worker only | `npm run remora:worker` against a Neon branch. Never the production box. |

Fallback if the bandwidth bill ever matters: a Hetzner VPS (€4/mo, 20 TB egress) running
the same Docker image. The image is the contract, so the move is an afternoon.

### Collecting cleanly (from the first coin)

- **Fee math decides the price.** Stripe takes 2.9% + 30¢ per charge. A $1 coin loses a
  third to fees. So coins are sold in **sleeves**: 5 for $5 (fee 8.8%), 12 for $10,
  30 for $20. Minimum checkout $5. One coin = one vend of any slot (heavier slots can
  cost 2 coins later).
- **Stripe Checkout, one-time payments**, under the Squaloo entity. Products and prices
  defined in Stripe, referenced by id in env. Stripe Tax on from day one so digital-goods
  tax is calculated per buyer; registrations stay a founder task when thresholds are met.
- **Nothing is credited from a redirect.** Coins are granted only by the
  `checkout.session.completed` webhook, verified by signature, idempotent on event id.
- **An append-only ledger** in Neon: `remora_ledger(id, card_id, kind, coins, stripe_ref,
  job_id, created_at)` with `kind ∈ purchase | vend | coin_return | refund | promo`. A balance
  is a `SUM`, never a column. Every money row carries its Stripe id so the ledger reconciles
  against Stripe payouts line by line. No row is ever updated or deleted.
- **The punch card.** Checkout returns a card code (a long random bearer token), set as an
  httpOnly cookie and printed on the receipt. No account. Stripe already captured the buyer's
  email, so "recover my card" is a magic link later, not a login system now.
- **Coin return on failure** is a `coin_return` ledger row, automatic. A cash refund is a
  founder action in the Stripe dashboard that writes a `refund` row.
- **Two receipts, clearly different.** Stripe emails the payment receipt. Remora prints the
  vend receipt. The tape reads revenue from Stripe's balance API, not from our ledger, so the
  public number is the bank's number.
- **Paperwork before the first coin:** `/remora/terms` (plain language: what a coin is, coin
  return, no refunds on delivered vends, what we log), privacy line, and the Stripe account's
  business details filled in properly. Stripe test mode until all three exist.
- **First coin on the house.** A `promo` row for every new card. Growth and lore.

**Phases, re-skinned (same bones, fewer trenches):**

| Phase | Name                        | What you can do at the end |
|-------|-----------------------------|----------------------------|
| 0     | **Plug it in**              | branch, dead code gone, scripts, Dockerfile skeleton, one green test |
| 1     | **Look through the glass**  | paste a URL, the panel shows what's inside (oEmbed peek, live on the site) |
| 2     | **The VIDEO slot, local**   | `remora get` with a progress bar, hash as it lands, receipt JSON, on the Mac |
| 3     | **The machine goes live**   | Docker image on Fly, queue in Neon, heartbeat, R2 upload, download link. Free vends, token-gated |
| 4     | **The coin slot**           | Stripe Checkout, webhook, ledger, punch card, terms page, the printed receipt. Public |
| 5     | **The tape**                | public counter, uptime, revenue from Stripe. Devlog still tabled |
| 6+    | **New slots**               | AUDIO, CLIP and GIF (done 2026-10-13), THUMBS, TRANSCRIPT, CHAPTERS, one per sitting |

**The honest risk.** Downloading from YouTube at scale for money invites a letter. The
machine's answer: wide provider support (direct, Vimeo, TikTok, X, Reddit, Twitch clips,
news), human-scale rate limits, no bulk, and the receipt reframes the product as archival
proof, not piracy. Boring Company called theirs "Not a Flamethrower." Remora is
"Not a Downloader." The receipt is what you are buying.

### The wall (observed 2026-10-11, routing shipped same day)

YouTube's "Sign in to confirm you're not a bot" hit two of four videos from a residential
IP on the first live day, then lifted twelve hours later. It is per-video, per-address
and per-mood. From a datacenter address expect it more often. The machine's answer is
**routing, not evasion**: a wall is a route failure (the coin keeps its attempt), the
machine that hit it cools on that provider for 30 min and says so on the panel, and any
other machine that is good for the provider takes the coin. Per-machine pacing
(`REMORA_YOUTUBE_PER_HOUR`, default 12) keeps every box human-scale, and the pace is
published as a cooldown too. So: a Fly box for uptime and every other provider, a Mac at
home for YouTube, one queue, no coordination. `core/route.ts` is the spec.

Three things yt-dlp's own docs offer that are **founder calls, not wired**:

| Option | What it is | Why it waits |
|---|---|---|
| `--cookies` from a logged-in browser | yt-dlp's documented remedy; ties vends to a Google account | Puts an account at risk; the account would be Squaloo's |
| A PO-token provider plugin | yt-dlp's supported plugin mechanism; a sidecar service mints tokens | A second service to keep alive; another moving part that breaks on its own schedule |
| `--extractor-args youtube:player_client=…` | Ask YouTube as a different official client | Grey; it works until it doesn't, and reads like evasion on a page that argues the opposite |

Until one is chosen, YouTube is "best effort, usually from home", and the receipt says
which machine vended. Every other provider is unaffected.

### The coin slot, as built (2026-10-11)

- **No `stripe` package.** Checkout is one form POST to `/v1/checkout/sessions`; the
  webhook check is one HMAC over `t.body`. Both live in `core/stripe.ts`, pure, tested
  against a signer that mirrors Stripe's. The sentence the dependency would have earned
  went unspent.
- **The card code is never printed.** The README said "printed on the receipt"; receipts
  sit on R2 behind links people will share, and the code is the whole secret. The receipt
  carries the card's public handle (`card_` + 12 hex of the code's hash). Recovery is
  the email Stripe captured, as a magic link later.
- **The promo coin's only guard** is three cards per address per day (`created_ip`).
  Good enough while coins are free of abuse value; revisit if someone scripts it.
- **Test mode until the paperwork exists.** `STRIPE_SECRET_KEY=sk_test_…` makes the panel
  say so. Going live is: terms (done), privacy line (done), business details in Stripe,
  `sk_live_`, and a live webhook endpoint.
- **Managed Payments, not Stripe Tax.** The Squaloo Stripe account (opened 2026-10-11)
  came with Managed Payments on by default: Stripe is merchant of record, calculates and
  remits sales tax itself, and requires a product tax code on every line item. We send
  `txcd_10000000` (electronically supplied services) with the inline price. So the
  README's "Stripe Tax on from day one" is satisfied by Stripe's own default, and the
  `REMORA_STRIPE_TAX` switch stays off.
- **Worker versions matter now.** A worker on pre-Phase-4 code vends carded coins fine
  but never returns one on failure and signs nothing. Deploy Fly and restart the Mac
  workers together after a Remora merge.

### The tape, as built (2026-10-12)

- `/remora/tape` and `GET /api/remora/tape`, public, cached a minute. Vends today and to
  date, bytes, a 14-day sparkline in UTC, coins by kind, which machines are on and for how
  long, and the recent drops by hash with a link to verify-by-hash.
- **Revenue is Stripe's number.** `revenueToDate()` pages `balance_transactions` and sums
  the charges (gross, Stripe's cut, net). Refunds and payouts are not revenue. On a test
  key the tape says "sandbox". No key: "no Stripe key". Unreadable: "Stripe unread".
- **No titles, no URLs, no cards, ever.** Founder's call on 2026-10-12: a customer's taste
  is theirs. The tape identifies a drop by its hash, provider, size, time and quality.
  `core/tape.ts` is the spec and its test asserts no title leaks.
- The devlog ("Tell it") stays tabled.

### The AUDIO slot, as built (2026-10-13)

- Quality `audio` is the slot: mp3 at VBR 0 through yt-dlp's `--extract-audio`, ffmpeg
  doing the work, never shelled to by us. `m4a` is AAC in an MP4 shell (a remux when the
  source is already AAC). `audio-raw` is what `audio` used to be: the best track as the host
  served it, usually opus in webm. One coin each. The receipt's slot line says AUDIO.
- The NEW tag pulses on the panel and a three-note jingle plays from the browser's own
  oscillator when an audio quality is vended. No audio file, no third party, and it only
  plays on a button press, so no browser blocks it.

### The CLIP slot, as built (2026-10-13)

- A clip is a start and an end on top of the quality dial, so a clip can be 720p video or
  an mp3. Times as people type them (`83`, `1:23`, `1:02:03`, `1:23.5`); 1 s to 10 min.
  yt-dlp cuts the section with `--force-keyframes-at-cuts`, so the file begins on the
  customer's second, not the previous keyframe: a 1:23–1:45 clip is 22.000 s long.
- One coin. The receipt's slot is CLIP and carries the range; the file name carries it
  too (`… clip 83-105.mp4`) so two clips of one video never collide on the shelf.
- Panel: two small fields under Vend, the range on the flap next to the quality.
  CLI: `--clip 1:23-1:45` on `get` and `enqueue`.

### The GIF slot, as built (2026-10-13)

- Quality `gif` is a clip (required, at most 15 s) rendered to an animated GIF: 480 px
  wide, 15 fps, two-pass palette with Bayer dither, which is the difference between a GIF
  and a smear. yt-dlp recodes through ffmpeg with the filter graph passed as a single
  `--postprocessor-args` argument. A 5 s GIF is ~3.6 MB; that is why 15 s is the cap.
- One coin. Slot GIF on the receipt, with the clip line. The shelf files it as `gif`
  (migration 0006); the tape counts it as a vend.

**Kept in the back pocket (v2 §Ideas):** provenance tiers, trust panel, Solomon ingest.
They become slots or panel lights only if they make the machine more fun.

---

## What the web app already gives us (the audit)

| Have                                  | State                                                        |
|---------------------------------------|--------------------------------------------------------------|
| Next 15 App Router, Turbopack, Vercel | Live. Routes are plain `page.tsx` files, nav per page.       |
| Tailwind 4 + Squaloo tokens           | Live. `--color-accent`, `--color-accent-secondary`, mono font. |
| Drizzle + Neon (`neon-http` driver)   | Wired but stale. `drizzle.config.ts` and `tsconfig.scripts.json` point at `marshal-qr-code/`, a folder that does not exist. `db` client throws at import time if the env var is missing. No `.env.local` on this machine. Nothing live reads the DB. |
| `/yt-scraper` + `/api/scrape`         | Dead prototype with a shell-injection hole. Delete in Phase 0. |
| Devlog pipeline (`content/devlog/*.md`) | Live. Every build gets a write-up. Remora will too.        |
| Tests                                 | None. No vitest, no jest.                                    |
| Auth                                  | None. The site is public and anonymous.                      |
| Queue / storage / worker              | None.                                                        |
| Culture                               | "We think about what we pull in." Click-to-play video facade. Measured claims. |

So the "infra" is framework, design system, deploy, and a DB connection string. The thing
Remora needs that nothing here provides is a machine that can run `yt-dlp` and `ffmpeg`.

## Why the corner (and the one piece that can't be in it)

**Agree:** UI, API routes, schema, and the pure core all belong in the web app. Shared tokens,
shared DB, shared deploy, one `npm install`, and no cross-repo package publishing. The old
"separate repo + npm workspace" plan was solving a problem that doesn't exist yet.

**Pushback, one item:** Vercel cannot run the download step. Functions have no `ffmpeg`, a
250 MB bundle cap, a 300 s ceiling, and 500 MB of `/tmp`. You could wedge `yt-dlp` into a
Python function for metadata, but downloads over ~100 MB would be a coin flip. So the
**worker lives in the repo but runs off Vercel**: a Docker image on one always-on Fly.io
machine (v3 ruling: a vending machine shouldn't sleep). It only makes outbound connections
(to Neon, R2, and the video host), so it needs no inbound port. The Mac runs the same
worker against a Neon branch for development only.

**Second pushback, on ethos not infra:** a public "paste any URL" download form on the
Squaloo site is an abuse surface and sits badly next to the devlog that explains why the
demo video doesn't phone home. So `/remora` is token-gated through Phase 3 and goes public
in Phase 4 behind the coin slot: a coin is the rate limit, and the receipt is the point.

---

## Stack decisions

- **Zero new dependencies through Phase 3.** The site's whole argument is that we think
  about what we pull in, so Remora plays by that rule.
  - Tests: Node 22's built-in `node --test`, running TypeScript via
    `--experimental-strip-types`. No vitest.
  - Validation: a hand-written narrow validator for the ~10 yt-dlp fields we use, like
    `devlog.ts` hand-parses frontmatter. No zod.
  - Process spawning: `child_process.spawn(bin, [args])`. Never a shell string.
- Phase 3 was allowed an S3 client for R2 and used none: `core/sigv4.ts` signs the four
  requests the machine makes in ~120 lines of `node:crypto`, tested against the worked
  examples in the S3 API reference. Phase 4 was allowed `stripe` and used none either:
  one form POST and one HMAC (`core/stripe.ts`). Dependencies through Phase 4: zero.
- Remora's tables are plain SQL in `src/remora/db/migrations/`, applied by
  `npm run remora -- migrate` and tracked in `remora_migrations`. `drizzle.config.ts` belongs
  to marshal-qr and is outside Remora's paths; five statements over Neon's HTTP driver did
  not need an ORM.
- DB: the existing Neon database, Drizzle, `neon-http` driver for both Vercel and the
  worker. Tables prefixed `remora_`. Queue claim is a single-statement
  `UPDATE … WHERE id = (SELECT … FOR UPDATE SKIP LOCKED LIMIT 1) RETURNING *`, which is
  atomic without an interactive transaction, so it works over `neon-http`.
- Auth: `REMORA_ADMIN_TOKEN` env on Vercel. The page sets an httpOnly cookie from a tiny
  form; API routes compare with `timingSafeEqual`.

## Layout inside squaloo-web-app

```
src/remora/                 ← the corner. Everything Remora owns, except routes.
  README.md                 ← this plan, moved
  core/                     ← pure TS, no I/O, relative imports only (so node --test works)
    url.ts        url.test.ts
    meta.ts       meta.test.ts      narrow yt-dlp JSON validator → VideoMeta
    job.ts        job.test.ts       state machine: pending → processing → completed | failed
    format.ts     format.test.ts    quality request + formats[] → yt-dlp -f string
    policy.ts     policy.test.ts    tiers → limits + TTL
  db/
    schema.ts                       remora_jobs, remora_assets
    client.ts                       lazy, throws on first use not on import
  ytdlp.ts                          spawn wrapper, progress parsing (I/O edge)
src/app/remora/page.tsx     ← token-gated UI
src/app/api/remora/         ← peek, jobs (POST enqueue, GET status)
workers/remora/
  cli.ts                    ← `npm run remora -- info|get|ls <url>`
  worker.ts                 ← `npm run remora:worker` loop + expiry sweep
```

`package.json` scripts: `remora`, `remora:worker`, `remora:test`.
`drizzle.config.ts` becomes multi-schema and gets its paths fixed.
`tsconfig.json` already includes `**/*.ts`, so `next build` type-checks the worker too.

---

## Phases

Each phase: one or two sittings, ends runnable, ends with a PR on a `remora/feat/…` branch
(the repo's `comms/feat/…` convention, with Remora as the agent name).

### Phase 0 — Dock
- [ ] Branch `remora/feat/dock`.
- [ ] Delete `src/app/yt-scraper/` and `src/app/api/scrape/`. Grep for links to them.
- [ ] Create `src/remora/README.md` (this plan), `src/remora/core/`, `workers/remora/`.
- [ ] Fix `drizzle.config.ts` and `tsconfig.scripts.json` paths. Multi-schema config.
- [ ] npm scripts. A `url.test.ts` with one passing test so `remora:test` is green.
- [ ] `npm run lint && npm run build` clean. PR.
- [x] `brew install ffmpeg` (you, now).

### Phase 1 — Sniff
Goal: paste a URL, get clean metadata, two ways.
- `core/url.ts`: `parseVideoUrl()` → `{ provider, id, canonicalUrl }`. YouTube in all its
  forms (watch, youtu.be, shorts, mobile, `t=`, playlist junk), Vimeo, direct `.mp4`,
  unknown. Fixture-driven tests with deliberately ugly URLs.
- `core/meta.ts`: `VideoMeta` + narrow validator. Permissive on unknown keys.
- `src/remora/ytdlp.ts` + `workers/remora/cli.ts`: `npm run remora -- info <url>` spawns
  `yt-dlp --dump-single-json --no-playlist`, validates, prints a table.
- **Ships to the live site:** `/api/remora/peek?url=` uses YouTube's oEmbed endpoint
  (title, author, thumbnail, no key, no yt-dlp) from the server, and `/remora` shows it.
  The browser contacts nothing third-party, which is the house style.
- Fun: ASCII remora banner on the CLI. Yes, really.

### Phase 2 — Bite
Goal: actually download, with a progress bar.
- `core/job.ts` reducer + tests. `core/format.ts` + tests.
- `npm run remora -- get <url> [--quality best|1080|720|audio]` → `~/.remora/downloads/`.
  Progress bar parsed from `--progress-template`. ffmpeg merge when needed.
- Fun: terminal bell, and a local JSON ledger with a one-line scoreboard.

### Phase 3 — School
Goal: jobs survive restarts; the site enqueues, the Mac works.
- `db/schema.ts`: `remora_jobs` (url, provider, status, quality, error, attempts,
  claimed_at, expires_at, timestamps), `remora_assets` (job_id, blob_url, bytes, ext).
  Drizzle migration checked in.
- `claimNextJob()` single-statement SKIP LOCKED. Heartbeat. Stale-claim recovery.
- `workers/remora/worker.ts` loop. `npm run remora -- enqueue <url>` from the CLI.
- API: `POST /api/remora/jobs` (token-gated), `GET /api/remora/jobs/:id`.
- `/remora` page: job list, polling every few seconds, status pills in the house colors.
- Local dev: a Neon branch, `.env.local` with `NEON_DATABASE_URL` + `REMORA_ADMIN_TOKEN`.

### Phase 4 — Surface
Goal: downloads reach a browser, and limits exist.
- Worker uploads to Vercel Blob (`@vercel/blob`, the one new dependency). Signed URLs.
- Expiry sweep deletes blobs past `expires_at`. TTL from `core/policy.ts`: regular 7 days,
  premium 30 days, admin unlimited. Straight from the old pricing cards, pure + tested.
- Download button on `/remora`. `npm run remora -- ls` and `status <id>`.

### Phase 5 — Tell it  (TABLED 2026-10-10, founder call: build first)
Goal: the public part. Parked until the build earns it.
- A devlog entry in `content/devlog/`: "The scraper that runs on a laptop." Why the worker
  isn't on Vercel, why the form isn't linked, why zero dependencies, with the numbers.
- Only then decide whether Remora gets a line on `/build` or `/archive`.

---

## Rules of the game

1. One phase per sitting, roughly. If it's not fun, stop and come back.
2. Nothing in `src/remora/core` touches I/O. If you need a mock, the boundary is wrong.
3. No `exec` with string interpolation. `spawn(bin, [args])` only.
4. Every phase ends with something you can run and a PR.
5. Chrome last. The old scaffold is what happens when you start with the chrome.
6. Match the house: no new dependency without a sentence saying why.

## Open decisions (defaults chosen, change any time)

| Decision        | Default                              | Revisit at |
|-----------------|--------------------------------------|------------|
| Worker host     | Fly.io, one always-on machine        | if bandwidth cost bites: Hetzner |
| Object storage  | Cloudflare R2 (zero egress), hand-signed | Phase 3 (done) |
| Auth            | single admin token + cookie          | if anyone but you uses it |
| Public surface  | unlinked route + devlog post         | Phase 5    |
| Test runner     | `node --test` with strip-types       | if it bites |

## Notes

- Personal tooling for content you have rights to. The route stays unlinked and gated.
- yt-dlp is the only moving part that breaks on its own schedule (2025.06.30 on the mini,
  2026.08.19 on the Air, 2025.06.30 pinned in the Dockerfile). Keep the validator permissive
  and the version noted here.
- The existing `marshal-qr` db client is eager and throws on import. Remora's is lazy.
  Worth fixing the old one too, but not in Remora's PRs.

---

## Ideas: the road to "Powered by Solomon"  (spitball, 2026-10-10)

### What the audit of solomon-os turned up

Three facts that make this more than branding:

1. **Solomon already does Remora's job for documents.** The corpus verification pass
   (`agent/corpus_verification_2026-10-10.md`) fetches each source at its primary URL with
   a declared User-Agent, honours robots.txt, records the SHA-256 of the bytes actually
   received, the retrieval date, and who verified it. The release rule is *"ships
   MANIFESTS, not files"*: the public artifact is the provenance row, and anyone can
   re-fetch and check the hash. Remora is that discipline, pointed at video.
2. **Video is a named gap.** The Augmentir matrix lists "video → procedure conversion"
   as *they lead, we have none*, and local Whisper as *planned, not built*. The ingest
   typings already carry `"content_type": "video"`. Nobody has filled it.
3. **The citation grammar already has the tag.** `engine/citations.py` parses `[TIME:]`,
   `[AUTHOR:]`, `[DATE:]`, `[MACHINE:]`, `[LOG]`. A transcript rendered as a log-shaped
   document with `[TIME: 12:34]` segment markers cites through the existing regex.
   Contract changes are founder-ruled; this one may need none.

### Tier A — makes Remora better on its own (cheap, slots into existing phases)

- **Manifest-first output.** `remora get` writes a provenance row next to the file:
  source URL · canonical id · provider · title · uploader · upload date · retrieval date ·
  yt-dlp version · format id · bytes · SHA-256 of bytes received. The file is the
  by-product; the row is the product. *(Phase 2, nearly free: hash the stream as it lands.)*
- **`remora verify <row|dir>`.** Re-hashes the local bytes against the row, and optionally
  re-fetches metadata to see if the source moved or changed. Rule 19: a second lens.
  *(Phase 2.)*
- **Provenance tiers, A6-style.** Every job carries one of `peeked` (oEmbed metadata only,
  no bytes) · `retrieved` (bytes landed, hash recorded) · `verified` (re-hashed on a later
  pass and matched) · `drifted` (source changed or gone since retrieval). Never dropped,
  never promoted without a check. *(Phase 3 schema: one enum column.)*
- **A trust panel, not a status page.** "No pixel without a check": worker last-seen read
  from its heartbeat row, yt-dlp version read from `yt-dlp --version` at the worker, ffmpeg
  presence read from `ffmpeg -version`, blob reachability read from a HEAD. No value with a
  fallback behind it. *(Phase 3–4.)*
- **Numbers with boundaries.** Every count on `/remora` carries as-of and N. The scoreboard
  is a ledger, generated, never hand-typed, like `src/data/ledger.ts`. *(Phase 2 onward.)*
- **Nightly re-verify.** The worker's idle loop re-checks a few `retrieved` rows a night and
  promotes or demotes tiers. "Run nightly, method published." *(Phase 4.)*

### Tier B — the road to Solomon (new phases, after Surface)

- **Phase 6 — Speak.** `remora transcribe <row>` via whisper.cpp, **local**, zero-cloud,
  same doctrine as the edge body. Output: a markdown document in the A1 log shape, one
  paragraph per segment with `[TIME: mm:ss]` markers, `[AUTHOR: uploader]`, `[DATE:]`,
  plus the provenance row as frontmatter. Model checkpoint and quant recorded, because a
  transcript is a measurement.
- **Phase 7 — Feed the shark.** Hand the transcript to Solomon's `ingest_document()` via
  the existing capture path, provenance tuple attached, corpus digest banked before and
  after, exactly as a PDF goes in today. A veteran's recorded walkthrough of a fix becomes
  citable at `[TIME: 12:34]` in an offline answer. That is Act 1 of the demo with a camera
  instead of a keyboard.
- **Relations.** A newer walkthrough `SUPERSEDES` an older one; a correction video
  `AMENDS`. The GD-6 relations model already exists; Remora just emits the edge.
- **Locality tags.** `[SITE:]` and `[ASSET:]` on a video row when the operator says which
  machine it shows. Gate E design work on the Solomon side; Remora only needs two optional
  columns to be ready for it.

### Tier C — wild cards

- **The remora cleans the shark.** The corpus verification pass was a one-off script. Remora
  as a daemon that keeps *every* provenance row in the corpus true, documents included:
  re-fetch, re-hash, report drift. The manifest that checks itself.
- **A ruler for video sources.** Nightly, per-provider: fetch success rate, median time to
  bytes, metadata drift rate. Published like `/measured`, unflattering nights included.
- **The lunchbox demo, video edition.** A Pi with Remora + whisper.cpp: plug in a phone
  video of a machine, get a transcript with timestamps, no network in the room.

### What this changes about the near-term build

Only Tier A touches Phases 1–4, and all of it is a column, a hash, or a read-back. The
rule stands: one phase per sitting, chrome last. Tier B waits until Surface is real.

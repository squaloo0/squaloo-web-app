# Remora log

Append-only. One entry per sitting, newest at the bottom. This file is how a session on
one machine hands off to a session on the other: read the last entry before touching
anything, write a new one before you push. Machine-local facts (installed binaries, env
files, what is and isn't on disk) belong here because they do not travel with git.

## 2026-10-10 · Mac mini · Phase 0 — plug it in · DONE
- Branch `remora/feat/plug-it-in` → PR squaloo0/squaloo-web-app#38 (open at time of writing, awaiting founder merge).
- Scaffold: `src/remora/{README,CLAUDE,core/url}`, `workers/remora/{cli,worker,Dockerfile}`, npm scripts, stale drizzle paths fixed, dead yt-scraper removed.
- Verified on mini: tests 5/5, lint clean, build clean with a DB URL present.
- Mini facts: ffmpeg installed (brew), yt-dlp 2025.06.30 at `/Library/Frameworks/Python.framework/Versions/3.10/bin/yt-dlp`, Node 22.14, **no `.env.local`** so `next build` needs `NEON_DATABASE_URL` set inline.
- Archive folder `~/Projects/remora` (legacy scaffold + plan snapshot) is local to the mini, no remote.

## 2026-10-10 · Mac mini · Phase 1 — look through the glass · STARTED (handoff to Air)
- Branch `remora/feat/look-through-the-glass`, cut from the Phase 0 commit. Only this log and CLAUDE.md so far.
- Next, in order (each is a commit):
  1. `core/url.ts`: ugly-URL fixture list (`url.fixtures.ts`), add TikTok, X/Twitter, Reddit, Twitch clips, Instagram as `unknown`-but-recognised hosts or real providers; strip `si`, `feature`, `list` junk everywhere.
  2. `core/meta.ts`: `VideoMeta` type + `parseYtDlpJson()` narrow validator (title, uploader, duration, upload_date, thumbnail, formats[]{format_id,ext,height,fps,filesize|filesize_approx,vcodec,acodec}); permissive on unknown keys; tests with a trimmed real `--dump-single-json` fixture.
  3. `src/remora/ytdlp.ts`: `spawn("yt-dlp", [...])` wrapper (never a shell string), `--dump-single-json --no-playlist`, timeout, non-zero exit → typed error.
  4. `workers/remora/cli.ts`: `info <url>` → table. Test manually against one YouTube and one Vimeo URL.
  5. `src/app/api/remora/peek/route.ts`: server-side oEmbed (YouTube `https://www.youtube.com/oembed?url=…&format=json`, Vimeo `https://vimeo.com/api/oembed.json?url=…`), returns `{title, author, thumbnail, provider}`; 400 on unparseable, 404 on unknown provider; no yt-dlp.
  6. `src/app/remora/page.tsx`: the glass. Squaloo tokens, mono labels, a URL field, the peek rendered as a lit slot. Unlinked from nav. Gate with `REMORA_ADMIN_TOKEN` cookie check in the route handler (plain header compare via `timingSafeEqual`).
  7. Lint, build, `remora:test`, append to this log, PR.
- Air needs: `npm install`, `brew install ffmpeg yt-dlp` (or confirm versions), and `.env.local` with `REMORA_ADMIN_TOKEN=<anything>` for step 6. No DB needed in Phase 1.

## 2026-10-10 · MacBook Air · Phase 1 — look through the glass · DONE
- Branch `remora/feat/look-through-the-glass` → PR squaloo0/squaloo-web-app#39 (open, awaiting founder merge). Phase 0 (#38) merged on main meanwhile; this branch was cut before the merge commit, so the PR diff is Phase 1 only.
- Landed, one commit per step: `core/url` (7 providers, 76-row fixture spec), `core/meta` + real trimmed fixture, `core/pretty`, `core/oembed`, `src/remora/ytdlp.ts` (spawn edge, 4 typed error kinds), `src/remora/peek.ts`, `src/remora/auth.ts`, CLI `info` and `doctor`, routes `/api/remora/{peek,thumb,key}`, page `/remora`. The thumb proxy is new relative to the step list: the house rule is that the browser contacts nothing third-party, and a bare `<img src="https://i.ytimg.com/…">` would have broken it.
- Verified on Air: tests 103/103, lint clean for Remora (pre-existing `<img>` warnings in marshal-qr untouched), `next build` clean with `NEON_DATABASE_URL` set inline. Browser run through on localhost: YouTube and Vimeo peeks with thumbnails, TikTok 404, non-URL 400, dead id 404, wrong key bounces, eject re-locks, phone width fits.
- Air facts: Apple M4, 16 GB, macOS 26.3.1, Node 22.22.1, **ffmpeg 9.0.2 and yt-dlp 2026.08.19 installed this sitting via brew** (`/opt/homebrew/bin`). `.env.local` created with `REMORA_ADMIN_TOKEN=<random hex>`; gitignored, local to the Air. No DB on this machine.
- Network fact: **Vimeo returns 403 to yt-dlp (and to curl) for page fetches from this network**, any id, with the impersonate target "chrome-150:macos-26". Vimeo oEmbed works fine. Try the mini before calling it a yt-dlp bug. Two of the vimeo ids from the old fixtures (76979871, 148751763) are gone from Vimeo entirely; 22439234 is live.
- Drift to watch: Dockerfile pins yt-dlp 2025.06.30; the Air has 2026.08.19 and the YouTube dump narrowed fine on it. Bump the pin when Phase 3 builds the image.
- Noticed, not touched (outside Remora's paths): `src/app/archive/page.tsx` still links `#005 YT-Scraper` to `/yt-scraper`, which Phase 0 deleted.
- Next: Phase 2 "the VIDEO slot, local". `core/job.ts` reducer, `core/format.ts` (quality → `-f`), `remora get <url>` with a progress bar from `--progress-template`, SHA-256 as the bytes land, receipt JSON next to the file in `~/.remora/downloads/`, terminal bell. `ytdlp.ts` has `run()` for one-shot calls; `get` needs a streaming sibling.

## 2026-10-10 · MacBook Air · Phase 2 — the VIDEO slot, local · DONE
- Branch `remora/feat/the-video-slot` → PR squaloo0/squaloo-web-app#40 (open). Cut from main after #39 merged. Same sitting as Phase 1; the fun permitted it.
- Landed, one commit per step: `core/format` (quality dial → `-f`, estimate), `core/progress` (template strings + tick reader), `core/receipt` (build, text, parse, verify, 40-col thermal print), `core/ledger` (row + scoreboard), `ytdlp.ts` `ytDlpDownload()` (streams ticks, resolves with `after_move:filepath`), `vend.ts` (one vend end to end, SHA-256 streamed, receipt next to the file, ledger row), CLI `get | ls | verify | receipt`, `doctor` grew ffmpeg and folders.
- yt-dlp facts learned: `--print` implies quiet, so `--progress` must be forced or no ticks print. Download ticks go to stdout, postprocessor ticks to stderr, and the pp field is `%(progress.postprocessor)s` (plain `%(postprocessor)s` prints NA). Parts are named `<title> [id].f<format>.<ext>` in flight, which is how the receipt learns the real format ids (396+251 here where the estimate said 134+140: yt-dlp prefers av01 at equal height).
- Verified on Air: tests 125/125, lint clean for Remora, build clean. Real vend at 360p in 8.7 s into a scratch folder via `REMORA_DOWNLOADS`/`REMORA_LEDGER`; `verify` VERIFIED, then DRIFTED after one appended byte. Default folder `~/.remora/` on the Air is still empty; nothing was vended there.
- Receipt is **unsigned**: `signature: null` is in the shape, `receiptText()` is the stable bytes to sign. Ed25519 is Phase 4 per the README.
- Not done, by design: AUDIO transcodes (Phase 6; `--quality audio` today drops the best audio track untouched, usually webm/opus or m4a). No site changes this phase.
- Next: Phase 3 "the machine goes live". `db/schema.ts` (`remora_jobs`, `remora_assets`, `remora_ledger` with the Phase 2 row shape), `claimNextJob()` single-statement SKIP LOCKED, `workers/remora/worker.ts` loop calling `vend()`, heartbeat row, R2 upload (`@aws-sdk/client-s3`, the sanctioned dependency), `POST /api/remora/jobs` + `GET /api/remora/jobs/:id` keyed, job list on `/remora`. Needs a Neon branch URL in `.env.local` on whichever machine; the Air has none. Bump the Dockerfile yt-dlp pin (2025.06.30 → 2026.08.19 or newer) when the image is first built.

## 2026-10-10 · MacBook Air · Phase 3 — the machine goes live · BUILT, NOT YET PLUGGED IN
- Branch `remora/feat/the-machine-goes-live` → PR squaloo0/squaloo-web-app#41 (open). Third phase of the same sitting.
- Landed, one commit per step: `core/job` (reducer + pills + light), `core/sigv4` (hand-written, 4 AWS doc vectors), `db/{client,queue,migrations/0001}`, `storage.ts` (R2 over node:https, in-process signing-bucket test), `workers/remora/worker.ts` (the loop), CLI `migrate | enqueue | jobs | machine`, routes `/api/remora/{jobs,jobs/[id],machine}`, the page's Vend form + flap + pulse light + poller, Dockerfile (yt-dlp pin → 2026.08.19, own `workers/remora/package.json`) + `fly.toml`.
- Deviations from the README, both recorded there: no `@aws-sdk/client-s3` (sigv4 by hand), no Drizzle for Remora's tables (plain SQL migrations; `drizzle.config.ts` is marshal-qr's and outside the touch list).
- Verified on Air: tests 140/140, lint, build, tsc. Every SQL statement + SKIP LOCKED contention on a scratch Postgres 17 via psql (`initdb` needs `LC_ALL=en_US.UTF-8` and a short `-k` socket dir on this Mac). Page in the browser in its no-queue state. **Nothing has run against Neon, R2 or Fly**: the Air has no `NEON_DATABASE_URL`, no `REMORA_R2_*`, no `flyctl`, and Docker is up but has no `node:22-slim` pulled, so the image was not built.
- **To plug it in (founder or mini), in order:**
  1. Neon: create a branch, put `NEON_DATABASE_URL` in `.env.local`, run `npm run remora -- migrate`.
  2. R2: a bucket, an API token; `REMORA_R2_ACCOUNT_ID`, `REMORA_R2_BUCKET`, `REMORA_R2_ACCESS_KEY_ID`, `REMORA_R2_SECRET_ACCESS_KEY` in `.env.local`.
  3. `npm run remora:worker` on the Mac (it refuses to start until 1 and 2 are set), then `npm run remora -- enqueue <url> --quality 360`, then `npm run remora -- jobs` and `/remora`.
  4. Vercel: `NEON_DATABASE_URL` + the four `REMORA_R2_*` so the page lists the flap and signs links.
  5. Fly: `brew install flyctl`, `fly launch --no-deploy --copy-config --config workers/remora/fly.toml`, `fly secrets set …` (names in the fly.toml header), `fly deploy --config workers/remora/fly.toml`. Watch `remora machine` flip to READY · fly-sjc.
- Expected first-run gotchas: the worker's heartbeat calls are fire-and-forget inside yt-dlp's tick callback; if Neon's HTTP latency is high the needle may lag the real download. R2 presigned links carry `response-content-disposition` so the browser saves the real file name. `expires_at` is 7 days (`REMORA_TTL_DAYS`); the sweep deletes 5 objects per idle tick.
- Next: plug it in (above). Then Phase 4 "the coin slot": Stripe Checkout, webhook, `remora_ledger`, punch card, terms page, the signed receipt (Ed25519 over `receiptText()`, `signature: null` → bytes), `/remora/verify`. Needs the `stripe` dependency and a Squaloo Stripe account in test mode.

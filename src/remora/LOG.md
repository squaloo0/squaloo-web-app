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

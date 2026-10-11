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

# Squaloo web app

The public site for Squaloo (squaloo.com) and its product, Solomon. Next.js 15 App Router, React 19, TypeScript, Tailwind CSS v4. Since the one-page relaunch of 2026-11-02, `/` and `/solomon` are built on brand kit v0.1 (`brand/`); earlier pages are kept at their URLs and listed on `/archive`.

This repo is public. Nothing sensitive goes in commits, PRs, or pages (`CLAUDE.md`).

## Routes

| Route | What it is | Source |
|---|---|---|
| `/` | The house: squaloo.com, one page on the kit | `src/app/page.tsx` |
| `/solomon` | The product page. Requests to `solomon-os.ai` are rewritten to it, URL unchanged | `src/app/solomon/page.tsx`, `next.config.ts` |
| `/measured` | Eval results with their boundaries, the nightly ledger, devlog posts tagged `measured` | `src/data/measured.ts`, `src/data/ledger.ts` |
| `/measured/next` | Staged rebuild of `/measured` over the ruler export; returns 404 on production builds | `src/data/ruler_export.ts`, `src/lib/ruler_view.ts` |
| `/roadmap` | Current and past gates, criteria in plain language | `src/data/roadmap.ts` |
| `/build` | How the product is built | `src/app/build/page.tsx` |
| `/founder` | Founder page. `/marshal` redirects here permanently | `next.config.ts` |
| `/devlog`, `/devlog/[slug]` | Devlog; posts with `status: "published"` only | `content/devlog/*.md`, `src/lib/devlog.ts` |
| `/archive`, `/archive/home-2026-11-02`, `/archive/solomon-2026-11-02` | Index of prior-era pages, plus the pre-relaunch home and Solomon pages with dated banners | `src/components/ArchiveNotes.tsx` |
| `/amak`, `/amak/ob2b`, `/amak/blog`, `/amak/blog/amak` | Prior venture-era pages, preserved as history and reached from `/archive` | `src/app/amak/` |
| `/shop`, `/shop/cart` | A commerce experiment, listed on `/archive` | `src/app/shop/` |
| `/marshal-qr`, `/marshal-qr/{about,contact,work,blog}`, `/marshal-qr/work/{qr-code-overview,qr-code-component,python-utilities}`, `/marshal-qr/blog/[slug]`, `/marshal-qr/blog/go-board-to-grad-school` | The QR Matrix project archive; has its own Drizzle schema, migrations and seed | `src/app/marshal-qr/` |
| `/remora`, `/remora/tape`, `/remora/terms`, `/remora/verify` | Remora, the video vending machine: front panel, open books, terms, receipt check | `src/remora/README.md` |
| `/garage`, `/garage/runs/[id]` | The Garage, where headless agents live; keyed | `src/garage/CLAUDE.md`, `src/garage/CHARTER.md` |
| `/llms.txt`, `/llms-full.txt` | Generated per build from the pages' own metadata and the published posts | `src/lib/llms.ts`, `src/lib/llms_pages.ts` |
| `/api/remora/*`, `/api/garage/*` | Route handlers for the two corners, one folder per endpoint | `src/app/api/` |

`src/middleware.ts` counts requests into the Garage's `garage_hits` table when the instrument is wired; it reads no cookie, address, or body.

## Stack

From `package.json`: `next` ^15.3.6, `react` ^19, `typescript` ^5, `tailwindcss` ^4 via `@tailwindcss/postcss` with `@tailwindcss/typography`, `marked` (devlog markdown), `drizzle-orm` + `@neondatabase/serverless` (Neon Postgres over HTTP), `@anthropic-ai/claude-agent-sdk` (the Garage), `animejs`, `prismjs`, `qrcode`. Node 22: the launchd installers and `workers/remora/Dockerfile` pin it, and the worker and test scripts run TypeScript with `node --experimental-strip-types`.

## Run it locally

```bash
npm install
npm run dev      # next dev --turbopack, http://localhost:3000
npm run build    # next build
npm run start
npm run lint     # next lint (next/core-web-vitals + next/typescript)
```

The corners that need a database read their connection string from `.env.local` (gitignored). Each corner's notes say which variables it needs.

Other scripts: `npm run seed` (Marshal-QR schema seed via ts-node), `npm run remora`, `remora:worker`, `remora:install|uninstall|status` (the Remora worker, locally or under launchd), `npm run garage`, `garage:install|uninstall|status` (the Garage worker CLI and launchd), and `remora:test` / `garage:test` (`node --test` over each corner's `*.test.ts`).

## Checks

There is no CI in this repo (no `.github/`). Checks that exist and are run by hand:

- `npm run remora:test`, `npm run garage:test`: unit tests for the two corners.
- `node --experimental-strip-types scripts/check_ruler_view.ts` and `npx tsx scripts/check_research_search.ts`: planted-defect proofs that the `/measured` guards fire; fixtures in `scripts/fixtures/`.
- `python3 scripts/check_gen_research_search.py`: the same for the research-search generator.

## Where content lives

- `content/devlog/`: devlog posts as markdown with frontmatter (`title`, `date`, `summary`, `author`, `status`, `tags`, `ingest`). The markdown is the reviewed source; the page renders it unchanged.
- `src/data/`: the figures the pages show. `ledger.ts` and `research_search.ts` are generated (`scripts/gen_ledger.py`, `scripts/gen_research_search.py`) from the engine repo's committed artifacts and a committed Notion export, never typed in; `measured.ts` and `roadmap.ts` are derived from dated artifacts and say so in their headers; `ruler_export.ts` reads `public/ruler/ruler_export.jsonl` when it exists.
- `brand/`: kit v0.1 (tokens as JSON, CSS and a Tailwind `@theme` block, pattern SVGs, the two relaunch mockups). `src/app/globals.css` imports the generated token files; `src/lib/brand.ts` imports the marks and patterns, so the site holds no second copy.
- `docs/`: the analytics brief, the founder-console plan, and screenshots of the relaunch.
- `public/`: static assets (wordmarks, the Marshal-QR images, the demo poster).

## Deploys

The site deploys on Vercel: the code reads `VERCEL_ENV` and `VERCEL_GIT_COMMIT_SHA`, and the Remora notes place the front panel and API there. The Remora worker runs as one always-on Fly.io machine built from `workers/remora/Dockerfile` with `workers/remora/fly.toml` (build context is the repo root); the Garage worker runs under launchd from `workers/garage/launchd/`. `next.config.ts` holds the one redirect (`/marshal` to `/founder`) and the `solomon-os.ai` rewrite.

## Relation to the engine repo

`scripts/gen_ledger.py` and `scripts/gen_research_search.py` read the engine repo (solomon-os) through `git show <ref>:...`, so the ledger and the research-search boundary on `/measured` render committed evidence only. `src/data/ruler_export.ts` reads the export the engine repo's `scripts/ruler_export/export.py` writes, and stops the build on a malformed file. Nothing here queries a running body.

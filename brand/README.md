# Squaloo brand, v0.1 — the kit, the mockups, and the rules the pod builds to

**Status:** v0.1, ruled by the founder 2026-10-28 and revised after feedback round 1 (2026-11-02). This folder is the source of truth for the house's visual and verbal system inside this repo. The same system lives in three private Claude artifacts (the brand kit, the web mockups, the pitch deck); the pod cannot open those, so everything it needs is copied here. When the kit changes there, this folder is republished; do not hand-edit the generated files.

**Publication boundary.** This repo is public. Nothing here is sensitive: colors, type, patterns, two static mockups with bracketed placeholder numbers. The pitch deck is deliberately *not* in this repo.

## What is here

| Path | What it is | Who uses it |
|---|---|---|
| `kit/README.md` | The kit itself: the four ideas, the two registers, color rules, type, geometry, states, voice. **Read this first.** | everyone |
| `kit/tokens.json` | The tokens: two color themes (`squaloo` paper, `solomon` ink), type styles, spacing, radius, stroke. The source the CSS is generated from. | design, pod |
| `kit/tokens.css` | Plain CSS custom properties (`--ground`, `--ink`, `--solomon-blue`, …) for `:root` and `[data-theme="solomon"]`, plus `.sq-*` type classes. For static pages and the mockups. | pod |
| `kit/tokens.tailwind.css` | The same tokens as a Tailwind v4 `@theme` block. `@import` it after `@import "tailwindcss";` in `globals.css` to get `bg-sq-ground`, `text-sq-ink`, `bg-solomon-blue`, `font-display`, `font-mono`, `rounded-sq-arch`, … | pod |
| `kit/geometry.md` | How the three pattern families are constructed and where each may appear. | design, pod |
| `kit/assets/marks/` | The spiral in ink, paper, blue and red. Minimum 24px; never filled, rotated, or tiled. | everyone |
| `kit/assets/patterns/` | Generated pattern linework: jali band/panel, octagon-and-square band/panel, radial rings, and the 40px octagon tile used as a section marker. Ask for a new size; never stretch one. | pod |
| `kit/components/cover.html` | The kit's cover card: the house as a wall of tiles beside a door. A worked example of the tokens. | design |
| `mockups/squaloo.html` | squaloo.com, who we are: the vision line, the doorway to Solomon, the vision to scale, how we build, measured, where we came from. | pod, for the relaunch |
| `mockups/solomon.html` | /solomon, what we build: hero, how it works (the three-custody-zone diagram, drawn in SVG), ask → task, surfaces, measured, the road to scale, the live demo. | pod, for the relaunch |
| `make_wordmark.py` | Earlier wordmark generator (predates the kit); kept until the relaunch retires it. | — |

The mockups are static pictures of the direction, not routes: open them in a browser from this folder. They link to each other and to the kit's assets by relative path. Every number in `[brackets]` is a placeholder the founder fills from `/measured` and the ruler.

## The rules in one screen

These are the ones a pull request gets bounced for. The reasoning is in `kit/README.md`.

1. **Wherever the blue appears, it means Solomon.** `#0a369d` is the product's color and the only highlight on a Solomon surface: a paper word on a blue pill, a blue CTA, the doorway arch. On the house it marks only Solomon's name and the doorway. The house's primary is ink (`#191308`) itself; `sun` (`#edcd1d`) and `sky` (`#01baef`) are the house's fills behind the two vision words, *own* and *verify*.
2. **Paper and ink, never white and black.** House surfaces sit on `--ground` paper with ink text; Solomon surfaces sit on ink with paper text. Cards are separated by tone and a hairline, never a shadow.
3. **Lattices and tilings, never stars.** Patterns are generated from a rule and drawn as lines (light through a carved screen), never as fills. One pattern per surface; a pattern never crosses text. The section marker is the octagon tile. No stars, no crescents, no calligraphy.
4. **Never borrow a safety color.** On the floor red means DANGER, orange WARNING, yellow CAUTION (ANSI Z535). States are word + shape + color: ok (dot), warn (triangle, in ink), refused (blue square), could not check (dashed), not measured (dash). Absence is drawn, never left blank.
5. **Three faces, each with a job.** EB Garamond for the wordmark, display headlines and quoted veterans; Hanken Grotesk for body, h2/h3 at 800; IBM Plex Mono for anything that is a record (eyebrows, sources, dates, tables) and every Solomon headline. Italics are always set at weight 600 so they read at distance. All three are Google-hosted; the link is at the top of `kit/tokens.css`.
6. **The words.** The vision line is *Intelligence you own, and can verify.* Define on first use: *sovereign* (runs on hardware you own; what you know stays in your custody), *verifiable* (every answer shows what it checked; the measurements can be re-run), *model-agnostic* (any model that passes the ruler on the body, unmodified). Retired: *shows its work, tribal knowledge, AI-powered, revolutionize,* and any figure without a source and date.

## Using the tokens in this app

```css
/* src/app/globals.css */
@import "tailwindcss";
@import "../../brand/kit/tokens.tailwind.css";
```

Then `<main className="bg-sq-ground text-sq-ink font-sans">` for a house page and `<main className="bg-sq-ground-ink text-sq-ink-paper" data-theme="solomon">` for a product page. The site's current dark tokens in the root README (`#08090a`, `#1400bf`, …) are the pre-relaunch palette; the relaunch (SQU-155) adopts this folder.

## Where it came from

The founder's brand ethos board (Islamic geometric art and architecture, the room, the factory floor, the garage), the kit palette and spiral, Morph's product pages as the execution reference for /solomon, and the language ratified 2026-10-27. The patterns are generated by rule: a jali lattice of circles with a diamond at each center, the octagon-and-square (4.8.8) tiling, and rings of rhombi around an octagon. The culture that made those patterns gave the world the word *algorithm*; the kit's second idea is that the pattern is the proof.

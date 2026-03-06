# Squaloo Web App

The official web presence for **Squaloo** and its ventures — built with Next.js 15, Tailwind CSS v4, and deployed on Vercel.

## What This Is

A multi-route portfolio and venture site built around the **Squaloo** umbrella and its projects. Each route is a discrete experience with its own narrative, designed to serve fellowship applications, investor introductions, and public documentation of the build.

### Routes

| Route | Description |
|-------|-------------|
| `/` | Terminal-style landing — animated command sequence, access points to each venture |
| `/marshal` | The-Architect — founder profile, capability pillars, project tracks |
| `/amak` | Amak venture page — New Collar Thesis manifesto, OB2B CTA, R&D log preview |
| `/amak/ob2b` | OB2B Protocol deep-dive — architecture breakdown, USC Viterbi CSCI 401 capstone team, milestone tracker |
| `/amak/blog` | Founder's Journal index — R&D log entries |
| `/amak/blog/amak` | Entry 001 — Sovereign Data Lakehouse & OB2B Protocol build log |
| `/marshal-qr` | Marshal-QR v1.0 archive — the QR Matrix project, IYA context |

## Stack

- **Framework:** Next.js 15 (App Router, Turbopack)
- **Styling:** Tailwind CSS v4 (`@import "tailwindcss"`, `@plugin` directive)
- **Typography plugin:** `@tailwindcss/typography` (loaded via `@plugin` in `globals.css`)
- **Deployment:** Vercel
- **Node:** v22 LTS (required — v24 has native binary compatibility issues with some dependencies)

## Design System

All color decisions follow a consistent token set:

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#08090a` | Page background |
| Foreground | `#f6f7eb` | Primary text, strong emphasis |
| Accent primary | `#1400bf` | Buttons, borders, hover states |
| Accent secondary | `#5688c7` | Labels, active indicators, CTAs |
| Accent green | `#63a375` | Completion states, success indicators |
| Neutral scale | Tailwind `neutral-400` through `neutral-800` | Body copy, borders, muted labels |

## Key Components

- **`TerminalAnimation`** — Async typewriter sequence with React StrictMode-safe cancellation (`let cancelled` per-effect, not a shared ref)
- **`MilestoneTracker`** — CSCI 401 deliverable tracker with date, status color-coding, and compact prop for inline use
- **`PillarCard`** — Capability pillar card with filled pip progress indicator
- **`AppFooter`** — Shared site footer
- **`CodeBlock`** — Syntax-highlighted code block for blog entries

## Local Development

Requires Node v22 LTS. If using nvm:

```bash
nvm use 22
npm install
npm run dev
```

Dev server runs at [http://localhost:3000](http://localhost:3000) with Turbopack.

## Project Context

Squaloo is a bootstrapped venture studio. The flagship venture is **Amak** — building sovereign, offline-first AI infrastructure for the physical workforce via the One Brain, Two Bodies (OB2B) Protocol.

The OB2B Protocol is being engineered by a team of six USC Viterbi School of Engineering undergraduates (CSCI 401, Project 42, advised Spring 2026). Marshal Aldoph serves as primary stakeholder and systems architect.
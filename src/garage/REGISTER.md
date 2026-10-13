# The register — what is proven about this site, and what the founder has ruled

Solomon's claims-register vocabulary: **supported** (evidence named, dated, from the right
instrument), **qualified** (true only with its qualifier), **not yet true** (we intend it;
phrase as roadmap), **do not quote**, **needs review** (a human decides), **retracted**
(kept struck, with the falsifying evidence). Wrasse proposes rows; the founder ratifies.
Every row carries a date and its vantage. This file decays like the claims it polices.

| claim | status | evidence and vantage |
|---|---|---|
| Remora is the only thing on the site that takes money. | **supported** | Run `c793e6ea`, 2026-10-13: the checkout route and the sleeve form; `/shop/cart` says "coming soon". Founder confirmed 2026-10-13. |
| Production Stripe runs in **test mode**. No real dollar has entered. | **supported** | Founder, 2026-10-13. The founder can switch it to live; that is a founder call, never wrasse's. |
| `/shop` is meant to sell things: it is Squaloo's retail operations surface, carried over from an earlier project. | **not yet true** | Founder, 2026-10-13. Today it is a product grid with a "coming soon" cart. Treat it as a live intent, not a stale stub. |
| The majority of web page requests, worldwide, are bots. | **qualified** | Library S1 and S2: 65% bot on Cloudflare's network, HTML responses, week to 2026-10-12; 57% in June 2026. The qualifier is the scope: one network, worldwide, "bot" undifferentiated, and **request share, not visitor share** (run `3ab57ff5`, the first study, 2026-10-13: one bot can make thousands of requests). Founder named these surfaces 2026-10-13 in answer to run `7a2a55a1`. |
| The majority of **squaloo.com's** traffic is agents. | **needs review** | Inferred by the founder from the worldwide figure above, 2026-10-13. No first-party counter exists to confirm or size it on this site, and "bot" is not "agent with a budget". The working picture until the instrument lands. |
| Remora could serve agents with budgets as customers, as well as humans. | **not yet true** | Founder-seeded hypothesis, 2026-10-13. The vending machine already has a machine-readable surface (peek, jobs, verify, signed receipts). What an agent would need to pay, and how, is unmeasured and undesigned. |
| The tape and Stripe are the only instruments. Nothing measures visits, referrers, funnel steps, or `/shop`. | **supported** | Run `c793e6ea`, 2026-10-13, 7 of 30 pages read; charter section 1. |
| An agent can already take a card, peek, vend, poll, verify a receipt and check its balance over JSON, without a browser. | **supported** | Run `7a2a55a1`, 2026-10-13: `card`, `peek`, `jobs`, `jobs/[id]`, `verify` routes read. Proposed by wrasse; awaiting the founder. |
| An agent cannot pay today without a cookie jar and without knowing where: the card code lives only in an httpOnly cookie (which blocks page scripts, not a client that keeps its Set-Cookie), the top-up is Stripe Checkout, whose URL the checkout route does return as JSON, and the 402 carries no price or pointer. | **qualified** | Run `7a2a55a1` proposed it as supported; run `4f6151a9` (the red-team, 2026-10-13) qualified it: `card.ts:26-32`, `checkout/route.ts:34`, `jobs/route.ts:77`. The qualifier is the pointer: an agent that keeps its cookie can already reach checkout; nothing tells it so. Any change to checkout is a founder call (guideline 3). |
| Anyone can pay coins into any card, because the card handle is public and the webhook credits whatever card the session names. | **needs review** | Run `894a1588` proposed it as supported; run `4f6151a9` (the red-team, 2026-10-13) found the checkout route sets the card from the caller's own cookie and takes only a sleeve from the body (`checkout/route.ts:18-29`), so no session builder read so far can be pointed at another card. Unread: Payment Links or any other path that could set the session metadata. Not to be quoted until those are read. |
| A browserless pay rail has three candidate shapes: a bearer token plus a 402 that points at checkout (a human still pays); an HTTP-402 stablecoin rail; a delegated Stripe payment token. All three are guideline-3 territory; only the first touches no money flow. | **needs review** | Run `894a1588`, 2026-10-13, designs B and C rest on `[recall]` and must be verified against the x402 spec and Stripe's current docs before they are more than names. |
| Nothing on the site records a 402, nor whether a call came by cookie or bearer. | **supported**, closing | Run `894a1588`, 2026-10-13. The instrument (Phase 3, `garage_hits`) counts paths by visitor kind from 2026-10-13; it still cannot see a response status, so 402s stay uncounted until a one-line seam in the jobs route, which is Remora's corner and a founder call. |

## Founder's standing guidance (dated; the founder edits this section)

- **2026-10-13.** Wrasse has no money to spend on the world (charter guideline 2). Plan with
  that: no paid acquisition, no ads, no placements. The site's visitors are mostly agents.
  Think about what an agent with a budget would buy from a vending machine, and what it
  would need to be able to buy it.

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
| The majority of the site's traffic is agents, not humans. | **needs review** | Founder observation, 2026-10-13, instrument not named. No first-party counter exists to confirm or size it. Wrasse may ask which surface the founder read it from, and should treat "agents are the main visitor" as the working picture until an instrument says otherwise. |
| Remora could serve agents with budgets as customers, as well as humans. | **not yet true** | Founder-seeded hypothesis, 2026-10-13. The vending machine already has a machine-readable surface (peek, jobs, verify, signed receipts). What an agent would need to pay, and how, is unmeasured and undesigned. |
| The tape and Stripe are the only instruments. Nothing measures visits, referrers, funnel steps, or `/shop`. | **supported** | Run `c793e6ea`, 2026-10-13, 7 of 30 pages read; charter section 1. |
| An agent can already take a card, peek, vend, poll, verify a receipt and check its balance over JSON, without a browser. | **supported** | Run `7a2a55a1`, 2026-10-13: `card`, `peek`, `jobs`, `jobs/[id]`, `verify` routes read. Proposed by wrasse; awaiting the founder. |
| An agent cannot pay today: the only top-up is Stripe Checkout in a browser, the card code lives only in an httpOnly cookie, and the 402 carries no price or pointer. | **supported** | Run `7a2a55a1`, 2026-10-13: `checkout/route.ts`, `card/route.ts`, `jobs/route.ts`. Proposed by wrasse; awaiting the founder. Any change to checkout is a founder call (guideline 3). |

## Founder's standing guidance (dated; the founder edits this section)

- **2026-10-13.** Wrasse has no money to spend on the world (charter guideline 2). Plan with
  that: no paid acquisition, no ads, no placements. The site's visitors are mostly agents.
  Think about what an agent with a budget would buy from a vending machine, and what it
  would need to be able to buy it.

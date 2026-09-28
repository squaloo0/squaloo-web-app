---
title: "Two ways a number goes wrong"
date: "2026-09-28"
summary: "A claim can be well-formed, correctly bounded, repeated for a month, and rest on nothing. It can also be true and out of date in the direction that makes you look worse. We hit both — and they are the reason we measure anything at all."
author: "Squaloo"
tags: "measured"
status: "published"
---

We build Solomon to answer two questions a technician needs answered before acting on anything: **how do you know that**, and **what did you check?**

It would be difficult to sell that honestly while running a company that had never asked itself the same questions. So we keep a claims register — every public number gets a row recording where it came from, what date it was true, and what boundary it holds within. If a claim cannot get a row, it does not get said.

The register exists because numbers go wrong in two specific ways, and only one of them is the one people watch for.

## The first way: unsourced inheritance

A number enters your materials as background. Someone reasonable put it there. Everyone downstream assumes someone upstream checked, so nobody does, and it hardens into fact through repetition alone.

The tell is that **nobody can say where it came from, and nobody has ever needed to.** Internal documents cite each other in a loop. Every individual step is reasonable. The outcome is a figure nobody has ever verified, sitting on your homepage, looking exactly like every other industry statistic in every other pitch.

Our instance: the downtime cost figure the entire business case is sized against. The register had it flagged as unsourced for weeks — not wrong, *unverified*, which is its own status in our vocabulary. When we finally traced it, the low end was real and correctly attributed. The high end appeared nowhere in the source, attributed to a sector the source never covers. It had been extrapolated once and quoted ever since.

We publish the corrected range now, with both sources named on the page. The important part is not that we got a number wrong. It is that **a claim can be well-formed, correctly bounded, consistently repeated, and still rest on nothing** — and no amount of care in how you *state* a number will catch that, because the defect is in its provenance, not its phrasing. Those are two separate checks. We had been doing the second one well and the first one not at all.

## The second way: stale underclaiming

The one nobody watches for.

Early on, a capability we advertised measured **0%** in testing. We published that artifact rather than hiding it, flagged the claim as an overclaim, and moved on. Then the work landed, and the number became **100%** — and for a while we were still apologising for a limitation we had already fixed.

Understating is not the safe direction. It is just wrong in the flattering-to-your-humility direction, and it is harder to notice because nobody complains. A register that only catches exaggeration is half a register. Ours now re-checks **every** row at each sweep, including the rows that are currently unflattering, because a claim can become true while you are still warning people about it.

## Why this is the same work as the product

Solomon's core behaviour is that an answer arrives with its sources attached, and says plainly when it *could not check* something — because "could not check" and "not there" are different answers, and a technician standing at a stopped machine needs to know which one they are getting.

Both failure modes above are that same distinction applied to us. Unsourced inheritance is a claim that never says *I could not check this*. Stale underclaiming is a check that ran once and was never run again.

The register is not a marketing hygiene exercise. It is the same discipline we sell, pointed inward, and the only honest basis for asking anyone to trust the outward version.

## What changed

One rule became syntax rather than etiquette: **a number we cannot recompute from our committed evidence may not be quoted.** Not "should be checked" — may not be quoted.

We wrote that rule down and it caught us the same afternoon. A corrected figure was computed, written down, and was **stale before it reached the file** — an overnight run had landed and moved it. That is why every number on this site now carries the date it was true and the method to recompute it yourself.

Not because we expect anyone to. Because a number you *can* recompute is a different kind of number than one you have to take our word for, and that difference is the entire product.

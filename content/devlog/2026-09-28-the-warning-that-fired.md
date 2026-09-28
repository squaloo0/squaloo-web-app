---
title: "The warning that fired"
date: "2026-09-28"
summary: "We taught the system to say 'correct, but too slow for this machine' — a verdict that is neither pass nor fail. Then we made it fire on real hardware. Then we found the part of it we still cannot claim."
author: "Squaloo"
status: "published"
---

Every machine we run on boots with a self-test: it asks itself a known question, checks that the answer is right and carries its sources, and records how long it took. Pass or fail.

Pass or fail turned out to be the wrong shape.

## The state that did not exist

A credit-card-sized computer answering correctly, with the right sources, in two minutes is not a failure. It is a correct answer from a small machine. But it is also not a pass, because two minutes is too long for someone standing at a broken machine waiting.

Calling it a failure teaches people to ignore failures. Calling it a pass hides something real. So we added a third verdict — **warning** — with a rule attached: *slow and wrong must never share a sentence.*

What the system reports now:

```
status: warn
passed: true              ← the answer was correct and cited
within_budget: false      ← and it took longer than this machine allows
detail: "answer was correct and cited, but took 414840ms
         against a 300000ms budget for this body"
```

Three fields, three separate facts, no blending. The detail names the latency, the budget, and which machine — because a budget only means something attached to the hardware it was set for. A laptop and a single-board computer are not the same promise, so they no longer share a deadline.

## Making it fire

A verdict nobody has seen fire is a verdict nobody should trust. That is a rule here: a guard that cannot be shown failing is decoration, and you only find out which you have by trying.

So we forced it. On 2026-09-26 we pushed the single-board computer past its budget on a real question, on real hardware, and watched. It reported warning. `passed: true`, `within_budget: false`, the detail naming all three facts. Exactly the state we designed, arriving for the first time from a machine rather than a test fixture.

## The part we cannot claim

Here is where this post stops being a victory lap.

The warning exists as a **state**, proven on hardware. The warning being **shown in the product** — rendered on the card a technician actually reads — is *not* proven. We checked before writing this, and every card on our demo machine reads healthy.

It is not a bug. It is a structural gap: the machine that can produce this warning does not run the chat surface, and the machine that runs the chat surface was not in warning. The rendering is covered by tests, including tests that deliberately break it to confirm they notice. It is not covered by a live payload.

Both sentences are true, and only one of them is quotable as product evidence:

- *The warning state is real on real hardware* — yes.
- *The warning renders correctly in the product* — not yet.

So that is what our measurements page says, in those words, and it will keep saying it until a real card carries a real warning. We would rather publish the smaller claim.

## The tool that nearly lied about it

The capture we used to record all this is worth a paragraph, because it failed in an instructive way.

To claim the panel and the engine agree, you must show they are describing the **same** engine process. A card is a snapshot from when it was posted; a health check is live. Read a stale card against a fresh reading and you will confidently report a disagreement that never happened.

So the capture refuses to vouch for a result unless it can prove both surfaces came from one process. That guard caught a stale card on its first real run — good. Then the guard itself shipped a defect: it read the machine's start time as local when the machine reports it in UTC, which put the start hours into the future and made **every fresh card look stale**. It failed in the safe direction and it was still wrong: it printed "this describes a process that no longer exists" about perfectly live data.

A tool built to prevent manufactured findings manufactured one. No test would have caught it — the bad value came from the live system, so any fixture would have passed. Only running it for real on a real machine did.

## What this is actually about

Three verdicts instead of two is a small change. The reason it matters is that most systems built to report on themselves have exactly one interesting failure mode: they report something true about the wrong thing, and nobody notices because the report looks fine.

A green tick over an unchecked condition. A health check that asks whether the process is alive when the question is whether it can write. A number that is correctly formatted, correctly bounded, and sourced from nothing.

We have a name for that family now, and a growing file of our own instances. The warning that fired is one entry — the useful kind, where the system said something uncomfortable and specific instead of something reassuring and vague.

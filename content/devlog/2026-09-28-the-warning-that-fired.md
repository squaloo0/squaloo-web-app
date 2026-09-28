---
title: "Correct, cited, and too slow"
date: "2026-09-28"
summary: "A technician at a stopped machine needs to know which kind of answer they just got. That is why our system has three verdicts instead of two — and why the third one firing on real hardware mattered more than it sounds."
author: "Squaloo"
tags: "measured"
status: "published"
---

Picture the person we build for. A machine has stopped. They are holding a tool, the line is down, and they have asked a question. What comes back has to answer two things before they act on it: **how do you know that**, and **what did you check?**

Everything below is a consequence of taking that moment seriously.

## Pass and fail are the wrong shape

Every machine we run on boots with a self-test: it asks itself a known question, checks that the answer is right and carries its sources, and records how long it took. Originally that produced one of two verdicts.

But consider a small computer bolted near the line, answering correctly, with the right sources, in two minutes.

That is **not a failure** — the answer is right and the technician can act on it. It is also **not a pass** — two minutes is a long time to stand next to a stopped machine. Call it a failure and people learn to ignore failures. Call it a pass and you have hidden something real from the person whose shift it is costing.

So we added a third verdict, **warning**, with a rule attached: *slow and wrong must never share a sentence.*

```
status: warn
passed: true              ← the answer was correct and cited
within_budget: false      ← and it took longer than this machine allows
detail: "answer was correct and cited, but took 414840ms
         against a 300000ms budget for this body"
```

Three fields, three separate facts, no blending. And the budget is **per machine** — because a laptop in an office and a credit-card-sized computer in a plant are not the same promise, and holding them to one deadline would either flatter the small one or slander it.

## Making it fire

A verdict nobody has seen fire is a verdict nobody should trust. That is a standing rule here: a guard that cannot be shown failing is decoration, and you only learn which kind you have by trying.

So we forced it — pushed the small computer past its budget on a real question, on real hardware, and watched. It reported warning, with all three facts, naming the machine. The first time that state arrived from a machine rather than a test.

## The part we cannot claim yet

The warning exists as a **state**, proven on hardware. The warning **shown on the card a technician actually reads** is *not* proven.

It is not a bug, it is a structural gap: the machine that can produce this warning does not run the chat surface, and the machine that runs the chat surface was not in warning. The rendering is covered by tests — including tests that deliberately break it to confirm they notice — but not yet by a live answer.

Both sentences are true and only one is quotable:

- *The warning state is real on real hardware.* Yes.
- *The warning renders correctly in the product.* Not yet.

That distinction is not pedantry, it is the product. We ask a technician to believe an answer because it shows what it checked. A company that blurred **proven** into **nearly proven** in its own devlog would be asking for a trust it does not extend.

## The tool that nearly lied about it

The capture we used to record all this failed in an instructive way, and it is the best illustration of why the use case drives the engineering.

To claim the on-screen panel and the engine agree, you must show they describe the **same** moment. The card is a snapshot from when it was posted; the health reading is live. Compare a stale card against a fresh reading and you will confidently report a disagreement that never happened.

So the capture refuses to vouch for a result unless it can prove both came from one process. That guard caught a stale card on its first real run. Then the guard itself shipped a defect: it read the machine's start time as local when the machine reports it in universal time, putting the start hours into the future and making **every fresh card look stale**.

It failed in the safe direction and it was still wrong — it printed *"this describes a process that no longer exists"* about perfectly live data. A tool built to prevent manufactured findings manufactured one. No test would have caught it: the bad value came from the live system, so any fixture would have passed.

## Why this matters where we are pointed

Most systems built to report on themselves have one interesting failure mode: they report something true about the wrong thing, and nobody notices because the report looks fine. A green tick over an unchecked condition. A health check that asks whether a process is alive when the question is whether it can write.

On a dashboard, that is an annoyance. Next to a machine that has stopped, with someone deciding whether to act on what they just read, it is the whole risk.

Three verdicts instead of two is a small change. It exists because the third one is the honest answer roughly as often as the other two, and because the person reading it is standing somewhere that the difference matters.

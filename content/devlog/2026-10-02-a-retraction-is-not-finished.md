---
title: "A retraction is not finished when you stop saying it"
date: "2026-10-02"
summary: "We retracted a downtime figure we had invented. It came back inside a research report, wearing a citation to the source that disproves it, and then our own product repeated it. Retracting a number is the start of the work, not the end."
author: "Squaloo"
tags: "measured"
status: "draft"
---

Last week we wrote about tracing our downtime figure to its source and finding that the top of the range did not exist. We retracted the $5-million-an-hour ceiling on 2026-09-27. What we can source is narrower: **about $125,000 an hour in general manufacturing (median), and up to $2.3 million an hour in automotive.** Those figures come from ABB's Value of Reliability survey and Siemens' *True Cost of Downtime 2024*, both accessed April 2026.

We assumed that was the end of it. It was the beginning, and this post is about the part we would have gotten wrong: **believing a retraction is done once you stop saying the number.**

## Where it was born

The figure was never measured. When we gathered our own history into one corpus, we could finally see where it first appeared: in a recorded conversation with an advisor in April, as a spoken illustration. It was a number for holding a scale in your head, not a number for quoting.

Our planning documents then carried it forward. One line in our own sprint plan preserves why it stuck, in quotation marks: *"$5M/hour is a message we can get our head around."* That is an honest description of a good illustration. It is not a description of evidence, and nothing between that sentence and our homepage ever asked for any.

Nobody lied. A memorable number got written down, then cited, and every later document took the earlier one as its source.

## It came back with a citation

Two days after the retraction, a research report we had commissioned on edge-AI economics came back. It returned the retracted figure as a row in a per-sector downtime table: *Aerospace & Defense, $5,000,000+ an hour*, attributed to **Siemens 2024**, plus an aggregator site.

Siemens 2024 is one of the two sources our own trace used to show the figure does not exist. The source we checked has no aerospace row and no $5 million figure. The report cited it anyway, alongside a secondary site that had picked the number up from somewhere.

**A citation is a claim about a check. It is not the check.** The report looked more rigorous than our original slide did, and that is what made it dangerous. A reader who sees "Siemens 2024" beside a number has every reason to stop looking. We now treat that report as quarantined: no row from it reaches our register, our site, or a pitch until it traces to a named primary source.

## Then our own product said it

This is the part that makes it a product story rather than a marketing one.

We loaded our own company documents into Solomon — the decks, the research, the advisor transcript, the retraction — and asked it the question our demo is built around: *"What does an hour of downtime cost?"*

On 2026-09-30, on a laptop, Solomon answered with the retracted figure as current fact, with three sources attached (N=1). The retraction was in the corpus. It lost. The stale tables were longer, denser in the question's own words, and spread across several documents. Our correction was one paragraph that talked about supersession and never stated the cost directly.

So we rewrote the correction to answer the question in its own terms first, and then retract. That worked on the part it could fix: on 2026-10-01 the retracted figure was gone from the answer, on the laptop and on the credit-card-sized computer (N=1 each).

**It still fails.** On both machines the answer is missing the $125,000 general-manufacturing median, and on the laptop it never mentions that a higher figure was retracted. On the small computer it took 318.8 seconds, past that machine's own 300-second budget. Our grader marks it `missing_current`: the retracted number is gone, but the current one doesn't lead.

We are not asking this question in front of anyone until it passes. This post goes out with the failure in it, because the alternative is to tell this story only once it has a happy ending.

## What changed

**A retraction is a set of places, not a sentence.** Retiring a number now means finding everywhere it went: our documents, anything we commissioned, and the corpus our own product answers from. A correction that loses a retrieval contest to the claim it corrects has not been made yet, as far as the person asking is concerned.

That is the same question we build Solomon to answer for a technician at a stopped machine: *how do you know that, and what did you check?* A number with a citation beside it can still fail both questions. The only defence we have found is to check the source behind the citation, every time, including when it is ours.

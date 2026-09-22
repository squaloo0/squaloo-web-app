---
title: "Our process has a version number"
date: "2026-09-22"
summary: "The rules we build under are a versioned document, and every version was written by something going wrong. Here is the changelog, including the three releases we nearly left out of it and the check that almost lied to us while we assembled it."
author: "Squaloo"
status: "published"
---

Most companies version the product. We version the process too.

The rules our engineers build under live in one file, it carries a version number, and that number moves when something goes wrong badly enough to earn a new rule. Not a style guide, not aspirations on a wall — a document that gets amended by incident, the way a maintenance procedure does.

We are publishing its changelog for the same reason we publish the [measurements](/measured) and the [roadmap](/roadmap): a process nobody can check is a claim, not a practice.

## What each version cost to learn

Every entry below was written after something broke. That is the only way rules get added here.

**v1.1 — August 17.** Queue discipline and cross-lane rules. Engineers working in parallel kept colliding on each other's files.

**v1.2 — September 3.** Two rules that still do the most work.

The first: *every guard ships with a test that proves the guard can fire.* We had protective checks nobody had ever seen fail. A check that cannot be shown failing is decoration — you have the comfort of coverage and none of the coverage. Now a safety mechanism isn't finished until we deliberately break the thing it protects and watch it complain.

The second: *investigate before you touch.* An engineer was assigned to fix a file that had gone missing from the build. The file had never existed. The work was real, competent, and aimed at nothing.

**v1.3 — September 10.** Prompt changes ship with before/after evidence. We changed one instruction to make the system prefer a veteran technician's notes over the official manual. It obeyed — and quietly stopped telling technicians to cut the power first. Nobody in review caught it. A test did. That one has [its own post](/devlog/the-line-that-deleted-the-safety-step), because it is the most important thing we have found.

**v1.4 — September 13.** World-state discipline: check, don't remember. One week produced six incidents where an engineer acted correctly on a stale picture of the world — a machine that had been rebuilt, a job that had already finished. Every one was competent work aimed at a situation that no longer existed.

**v1.4.1 — September 14.** If you cannot announce a change to a shared machine, you stop. Silence had been treated as permission.

**v1.4.2 — September 15.** *The rules bind the coordinator too.* In one week, every rule above was broken at least once — by the person whose job is enforcing them. Each was caught by an engineer or the founder. None was caught by a mechanism. So the coordinator's work now owes the same evidence everyone else's does.

**v1.5 — September 22.** Four amendments, of which two are worth your time.

*A declared state must be distinguishable.* If a configured system and an unconfigured one behave identically on every surface you can observe, the configuration is decorative. We found this three ways in one week. The clearest: we had given each machine its own performance budget — and built no way to see, from the product, which machine you were looking at. A correct per-machine rule that no surface could express.

*A number without its boundary is not a number.* Every measurement we quote now carries how many runs, which machine, which configuration, and what date. And a headline number that cannot be recomputed from our committed evidence files may not be quoted at all.

## The rule that caught us writing this page

That last one deserves its origin story, because it is unflattering and it is the reason the rule is worded as strictly as it is.

Two documents of ours quoted the same quality result as **100%**. One cited a specific evidence file as backing. That file contained exactly **one** scored observation — a single pass, published as a proven property. The other said the result held across **21** observations. Recomputed from the committed files, the real figure was **19**.

The rate was never wrong. It is genuinely 100%, and it has never failed. What was wrong was the boundary around it, and in both documents the boundary was wrong *in our favour*. Two authors, the same week, neither caught by review. Drift in our records had been flattering by default — not by anyone's intent, which is exactly why a rule rather than a reminder.

Then the correction went stale while being written. The corrected figure was **19 of 19**; before it was committed, another overnight run landed and made it **20 of 20**. Caught only because the new rule forces a recomputation against the evidence files rather than a re-reading of our own prose.

The lesson was not "count more carefully." It was that a fixed count of a growing series is wrong by morning. So the number now travels with an as-of date and the method to redo it — as it does here:

> **Verified quality result: 100%, 20 of 20 scored observations, zero failures, as of September 22, 2026.** Measured across 14 committed overnight evidence files, September 12–22, on the shipped configuration. Two disclosures ride with it: the check scores **one** scripted scenario, so it evidences that behaviour on a repeated case rather than as a general property; and under a different configuration, on September 9, the same check scored **60% across 5 runs**. We keep the counter-example on purpose.

That is what a number looks like here now. It is longer. It is also checkable.

## How this page was assembled, and the check that nearly lied

This page is about honest versioning, so its own method has to hold up.

The version history was reconstructed from the commit history of the rules file — not from anyone's summary of it. That mattered immediately: the internal description of this work listed five versions. The commit history showed **eight**. Three releases had quietly fallen out of the retelling, and had we written the page from the summary, we would have published a version history missing three of its own entries, on the page whose subject is honest versioning.

A second correction, same pass: one amendment we were about to present as a standalone rule is in fact a clause attached to an existing one. Smaller, and just as wrong to print.

And the earliest entries are genuinely reconstructed. **The file carried no version label at all until v1.2.** The first two releases are named from commit records, and there was never a "v1.0" — the original was simply unnumbered. We could have tidied that into a clean origin. Smoothing the beginning of a version history is the same defect as a number without its boundary, so it stays as found.

One more, because it is the best illustration on this page of why we distrust our own tools. While pulling the version history, an automated search reported that the rules file had carried the current version number since August — which would have meant the whole changelog was fiction. It was matching the version number of an unrelated component that happens to appear in the same file. The search was working perfectly and answering a question nobody had asked.

We caught it because the answer was absurd. That is not a method. It is the argument for the whole apparatus above: a check that returns a confident, plausible, wrong answer is more dangerous than no check, and the only defence is making results reproducible by someone who did not run them.

## Why publish it

Because the interesting thing about this system is not the model. Models change; we expect to run several. The durable asset is the practice that binds them — the rules, the evidence files, the corrections that stayed in the record instead of being edited out.

This changelog is the honest version of that claim. Eight releases, every one of them bought by something going wrong, including three we nearly forgot and one rule that caught us mid-sentence writing about it.

Each new version gets a line here when it lands.

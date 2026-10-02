---
title: "Six clean results from a check that reached nothing"
date: "2026-10-02"
summary: "We audited our own machines for an open default password and got a clean result on every one. All three were open. The check had run perfectly and never reached any of them. A timeout means we could not look. It does not mean nothing was there."
author: "Squaloo"
status: "draft"
---

Solomon is built around one distinction: **"I could not check" is a different answer from "it isn't there."** A technician at a stopped machine needs to know which one they're getting. If an answer can't find a source, it has to say so. Saying nothing is not the same as saying no source exists.

On the night of 27 September we nearly broke that rule against ourselves, on a security question, in the direction that would have let us close the issue and go to bed.

## The audit

Each of the three machines that run Solomon has a database holding its knowledge base: the credit-card-sized computer we carry to demos, our laptop demo box, and a staging server. Earlier, on a different machine, we had found services still running with their install-time default passwords. So that night we asked the obvious next question: does any of the three still accept the default password from elsewhere on the network?

The first sweep ran from inside a container on our operations machine. It tried six machine-and-service pairs and got the same answer six times: the connection timed out.

Read quickly, six timeouts mean nobody could get in, so the fleet is not vulnerable. That was nearly the finding we filed.

## What was actually true

All three machines were accepting the default administrator password from the local network, on the very database that holds the knowledge Solomon answers from.

The sweep hadn't tested any of them. We ran the same check against the same target two ways, from inside the container and from the machine hosting it:

```
from the container → target   timed out
from the host      → target   open
```

Containers on that machine could not reach the local network at all. On machines like it, container traffic goes through an extra virtualization layer that the host bypasses, and that path was failing. The tool ran without error and simply had nowhere to go. Two days later the same path worked again. That makes it worse, not better: a permanent block gets noticed, an intermittent one hands you a clean result now and then.

A second detail nearly hid it too. The first error messages were printed cut to sixty characters, which removed the only words that tell "timed out" from "password rejected". That difference is the whole question: *could not reach* against *reached and was refused*.

## The thing we would have gotten wrong

We would have recorded a security issue as resolved on the exact opposite of the truth. Nothing about the result looked wrong. Six consistent answers, no errors, a tool that ran perfectly.

That's the part that transfers. **A check that cannot reach its target produces the same output as a check that found nothing.** It isn't noisy and it isn't intermittent from the inside. It's a clean, plausible negative. Every caller that treats "didn't succeed" as "isn't there" will believe it, and we had been treating it exactly that way.

## What changed

Same night: each machine was re-checked from a *different* physical machine, so no machine audited itself. Every finding came with three controls:
- **a positive one:** the same probe succeeding against something known to be open, which proves it can reach;
- **a discriminating one:** the probe telling "password rejected" apart from "accepted", which proves it isn't collapsing every error into one;
- **a negative one:** a service we had switched off that night coming back *refused*, which proves the method notices a state we had just changed.

Under an hour after the audit, the network path to those databases was closed on every machine. That's 16 of 16 service ports, each re-verified from off the machine. Each came back as an active *refusal*, not a timeout, because a timeout can't tell a closed door from a missing road. The knowledge bases were intact afterwards.

We also kept the scope of that fix explicit. Closing a path and changing a credential are two different fixes, so we record them separately and close them separately. A single "remediated" can't then be read as covering both.

Then the rule became mechanical rather than remembered. Our probe now has two different exit codes for two different answers. One means *closed, and we proved we could reach it*. The other means *indeterminate: this run is evidence of nothing*. The sharpest case is the one a careless probe gets right by accident: when the target refuses but the control can't be reached, the result is **indeterminate, not closed**. Being right by luck isn't evidence.

The rule we carry now: **a check must prove it can reach before its silence counts as an answer.** A check that merely runs isn't enough.

It's the same rule Solomon applies to its answers, pointed at us. If a check couldn't look, it has to say so. It can't call that "nothing found".

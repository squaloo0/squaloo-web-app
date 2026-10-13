# The library — sources wrasse may lean on, with their boundaries

The disk mirror of the Garage Research Library (charter section 6). One row per source: who
added it, when it was read, what it measures and on what scope, and what it does not say.
A number lifted from here into a report carries this row's boundary with it, or it is not
a number. Wrasse adds notes under a source; the founder adds sources.

## S1 · Cloudflare Radar, "Bot vs. Human", worldwide

- **URL:** https://radar.cloudflare.com/traffic#bot-vs-human
- **Added by:** founder, 2026-10-13, as the surface behind "most visitors are agents".
- **Read:** 2026-10-13 by the orchestrator, in a browser (the page is a JavaScript app and
  refuses plain fetches).
- **Measures:** the share of HTTP requests on Cloudflare's network classified as bot
  (automated) versus human, filtered to HTML responses, which Cloudflare calls web page
  traffic. Window shown: last 7 days, 2026-10-06 to 2026-10-12.
- **Reading, with its boundary:** bot 65%, human 35%, worldwide, Cloudflare's network, HTML
  responses only, 7-day window ending 2026-10-12.
- **Does not say:** anything about squaloo.com; what share of "bot" is an agent with a
  budget versus a crawler, a scanner or a monitor; how "bot" is classified (the glossary
  link is the method's only public description).
- **Notes (wrasse):** none yet.

## S2 · Semrush blog, "Bot traffic now exceeds traffic from human users"

- **URL:** https://www.semrush.com/blog/ai-agent-bot-traffic/ (tracking parameters stripped)
- **Added by:** founder, 2026-10-13.
- **Read:** 2026-10-13 by the orchestrator, through a fetch-and-summarize tool, so this row
  is `[note-estimate]` until a person reads the article against it.
- **Author and date:** Cecilia Meis, Semrush, 2026-06-13.
- **Claims, with their boundaries:** (a) bots passed humans in web page requests on
  Cloudflare's network, announced by Cloudflare's CEO on X on 2026-06-03, exact crossover date
  not given; (b) bots were about 57% of web page requests on Cloudflare's network around
  June 2026; (c) automated traffic grew about eight times faster than human traffic in 2025,
  and traffic from AI agents and agentic browsers rose nearly 8,000%, both from HUMAN
  Security's 2026 State of AI Traffic report, over "more than 1 quadrillion interactions",
  sites and baseline unspecified.
- **Does not say:** anything about squaloo.com; the method behind any figure; a breakdown of
  the bot share by agent type. It is a short promotional piece that links no primary data
  beyond the Cloudflare post.
- **Notes (wrasse):** none yet.

## What the two together support

That bots are the majority of web page requests on one large network, worldwide, in 2026,
by two readings five months apart (57% in June, 65% in the week to 2026-10-12). Whether that
holds for squaloo.com is unmeasured until the site has its own counter. Whether "bot" means
"an agent that could buy something" is a separate, unmeasured question.

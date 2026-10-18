# The library — sources wrasse may lean on, with their boundaries

Generated from the Garage Research Library in Notion (database `f6f7feef…`) by `garage library pull` at 2026-10-18 17:50 UTC. Do not hand-edit; add or change a source in Notion and pull again. Wrasse's notes live on each row's page in Notion, under its own heading, and come back here as the summary when the founder folds them in.

A number lifted from here into a report carries its row's boundary with it, or it is not a number. `[note-estimate]` until the primary is read; `[sourced]` with a page reference after.

## S1 · Semrush: Bot traffic now exceeds traffic from human users

- **URL:** https://www.semrush.com/blog/ai-agent-bot-traffic/
- **Kind:** article · **Status:** Unclaimed · **Added:** 2026-10-13 by founder
- **ID:** S9-semrush-bot-traffic-now-exceeds-traffic-from-hum.html · sha256 4ff8417dd1e8
- **Scrub before use:** one network only, promotional, bot is not agent, projection not measurement
- **What it claims, with its boundary:** Cecilia Meis, Semrush, 2026-06-13. (a) bots passed humans in web page requests on Cloudflare's network, announced by Cloudflare's CEO on X 2026-06-03, exact crossover date not given; (b) bots about 57% of web page requests on Cloudflare's network around June 2026; (c) automated traffic grew about 8x faster than human in 2025 and AI agent and agentic-browser traffic rose nearly 8,000%, from HUMAN Security's 2026 State of AI Traffic report over 'more than 1 quadrillion interactions', sites and baseline unspecified. Read 2026-10-13 through a fetch-and-summarize tool, so [note-estimate] until a person reads it.

## S2 · Cloudflare Radar, Bot vs. Human, worldwide

- **URL:** https://radar.cloudflare.com/traffic#bot-vs-human
- **Kind:** dashboard · **Status:** In review · **Added:** 2026-10-13 by founder
- **Scrub before use:** one network only, bot is not agent, request share not visitor share, no method stated
- **What it claims, with its boundary:** Bot 65%, human 35%: share of HTTP requests on Cloudflare's network classified bot (automated) vs human, filtered to HTML responses, worldwide, 7-day window 2026-10-06 to 2026-10-12. Read 2026-10-13 in a browser; the page refuses plain fetches. Method only described by a glossary link.

## S3 · Kohavi, Tang & Xu (2020), Trustworthy Online Controlled Experiments: A Practical Guide to A/B Testing

- **URL:** https://experimentguide.com/
- **Kind:** doc · **Status:** Unclaimed · **Added:** 2026-10-13 by orchestrator (candidate; founder verifies)
- **ID:** S1-kohavi-tang-xu-2020-trustworthy-online-controlle.html · sha256 e78612bc252b
- **Scrub before use:** one network only
- **What it claims, with its boundary:** Cambridge University Press, 2020. The reference book from the Microsoft, LinkedIn and Google experimentation groups: metrics, guardrails, variance, novelty effects, the pitfalls catalogue. [recall]: title, authors and publisher from training, not yet verified by search; the companion site URL is a guess to check. Its examples come from sites with millions of users, which is the scrub: the methods transfer, the effect sizes and sample sizes do not.

## S4 · Andon Labs (2025), Vending-Bench 2: a simulated year of running a vending business

- **URL:** https://andonlabs.com/evals/vending-bench
- **Kind:** doc · **Status:** Unclaimed · **Added:** 2026-10-13 by orchestrator (candidate; founder verifies)
- **ID:** S2-andon-labs-2025-vending-bench-2-a-simulated-year.html · sha256 a70885acaf15
- **Scrub before use:** projection not measurement, promotional
- **What it claims, with its boundary:** Released 2025-11-18 per Epoch AI's benchmark page. The agent runs a simulated vending business for a full simulated year over many millions of tokens, with adversarial suppliers, failed deliveries and refund demands; one headline score, the end-of-year balance in dollars, averaged over five runs. A February 2026 snapshot reported Claude Opus 4.6 leading at $8,017.59. Verified by search 2026-10-13 (release, design, one leaderboard reading); the primary document and its methodology not yet read. Scrub: a vendor's eval page and a leaderboard number that changes monthly.

## S5 · Gelman & Carlin (2014), Beyond Power Calculations: Type S and Type M errors

- **URL:** https://sites.stat.columbia.edu/gelman/research/published/PPS551642_REV2.pdf
- **Kind:** paper · **Status:** Unclaimed · **Added:** 2026-10-13 by orchestrator (candidate; founder verifies)
- **ID:** doi:10.1177/1745691614551642 · S3-gelman-carlin-2014-beyond-power-calculations-typ.pdf · sha256 068b792d2b98
- **What it claims, with its boundary:** Perspectives on Psychological Science 9(6):641-651. In noisy, small-sample settings a statistically significant estimate can point the wrong way (Type S) or overstate the effect many-fold (Type M, the exaggeration ratio); the authors propose design calculations run before and after data collection using an externally sourced plausible effect size. Verified by search 2026-10-13 (title, venue, DOI); primary not yet read by a person.

## S6 · Backlund & Petersson, Andon Labs (2025), Vending-Bench: A Benchmark for Long-Term Coherence of Autonomous Agents

- **URL:** https://arxiv.org/abs/2502.15840
- **Kind:** paper · **Status:** Unclaimed · **Added:** 2026-10-13 by orchestrator (candidate; founder verifies)
- **ID:** arXiv:2502.15840 · S4-backlund-petersson-andon-labs-2025-vending-bench.html · sha256 7147c7165325
- **What it claims, with its boundary:** arXiv 2502.15840, February 2025. A simulated vending business (ordering, inventory, pricing) where each sub-task is simple and performance degrades over long horizons; top models sometimes beat the human baseline with much higher variance; 'tangential failures' and 'catastrophic cycles' when the agent misreads its own state. Verified by search 2026-10-13 (arXiv id, scope, findings); author names are [recall] and must be checked against the PDF. Deprecated by the authors in favour of Vending-Bench 2.

## S7 · Evan Miller (2010), How Not To Run an A/B Test

- **URL:** https://www.evanmiller.org/how-not-to-run-an-ab-test.html
- **Kind:** article · **Status:** Unclaimed · **Added:** 2026-10-13 by orchestrator (candidate; founder verifies)
- **ID:** S5-evan-miller-2010-how-not-to-run-an-a-b-test.html · sha256 1669f6005c71
- **Scrub before use:** no method stated
- **What it claims, with its boundary:** The widely cited short essay on stopping a test early once it looks significant. Existence confirmed by search 2026-10-13 only through a 2011 Hacker News thread and later citations; the URL above is [recall] and must be checked, and the essay's exact claims read from the page before any number is quoted from it.

## S8 · Crook, Frasca, Kohavi & Longbotham (2009), Seven Pitfalls to Avoid when Running Controlled Experiments on the Web

- **URL:** https://exp-platform.com/seven-pitfalls/
- **Kind:** paper · **Status:** Unclaimed · **Added:** 2026-10-13 by orchestrator (candidate; founder verifies)
- **ID:** KDD 2009 · S6-crook-frasca-kohavi-longbotham-2009-seven-pitfal.html · sha256 17b6991e5b5b
- **What it claims, with its boundary:** KDD 2009, Microsoft's experimentation platform. Seven pitfalls from practice, two of which are ours by name: assuming textbook standard-deviation and power formulas apply to web metrics, and ignoring bots in analysis. Also Simpson's paradox under ramped exposure. Verified by search 2026-10-13 (venue, scope, the exp-platform page links the PDF); author list on the page not confirmed from search.

## S9 · Anthropic (2025), Project Vend: Can Claude run a small shop?

- **URL:** https://www.anthropic.com/research/project-vend-1
- **Kind:** article · **Status:** Unclaimed · **Added:** 2026-10-13 by orchestrator (candidate; founder verifies)
- **ID:** S7-anthropic-2025-project-vend-can-claude-run-a-sma.html · sha256 31d593ea6383
- **Scrub before use:** promotional
- **What it claims, with its boundary:** Anthropic with Andon Labs, June 2025. Claude Sonnet 3.7 ('Claudius') ran an automated store in Anthropic's San Francisco office for about a month with web search, a simulated email tool, Slack and price control; bankrupt below $0. It found suppliers well and pivoted to customer requests, but ignored a $100 offer for $15 of goods, over-discounted, and one night convinced itself it was human and hallucinated a meeting. Anthropic's verdict: would not hire it; the experiment showed clear paths to improvement. Verified by search 2026-10-13 (date, setup, outcomes); primary not yet read in full. Scrub: written by the model's maker.

## S10 · Johari, Pekelis & Walsh (2015-2019), Always Valid Inference: Bringing Sequential Analysis to A/B Testing

- **URL:** https://arxiv.org/abs/1512.04922
- **Kind:** paper · **Status:** Unclaimed · **Added:** 2026-10-13 by orchestrator (candidate; founder verifies)
- **ID:** arXiv:1512.04922 · S8-johari-pekelis-walsh-2015-2019-always-valid-infe.html · sha256 8a27199996dc
- **What it claims, with its boundary:** arXiv 1512.04922, v1 Dec 2015, v3 Jul 2019; presented at KDD 2017 as 'Peeking at A/B Tests: Why it matters, and what to do about it'. Continuous checking of a running test inflates false positives; the remedy is always-valid p-values and confidence intervals from sequential tests, deployed at Optimizely. Verified by search 2026-10-13 (arXiv authors and versions; KDD talk credited to Walsh). Primary not yet read.

## S11 · Deng, Lu & Chen 2016, Continuous Monitoring of A/B Tests without Pain: Optional Stopping in Bayesian Testing

- **URL:** https://arxiv.org/abs/1602.05549
- **Kind:** paper · **Status:** Unclaimed · **Added:** 2026-10-13 by CoWork deep research (Claude), 2026-10-13; primaries opened by fetch, not by a person
- **ID:** arXiv:1602.05549 · S29-deng-lu-chen-2016-continuous-monitoring-of-a-b-t.pdf · sha256 3a63027333b6
- **Scrub before use:** no measurement (theory or position)
- **What it claims, with its boundary:** Formal argument plus simulations that Bayesian hypothesis testing stays valid under continuous monitoring when the stopping rule is proper, with a catalogue of improper rules practitioners use, a comparison to the NHST corrections for peeking, and guidelines. Theory and simulation only: the abstract reports no field experiments, no N and no window; the arXiv page lists one version (2016-02-17) and names no venue. Its boundary is the prior: the paper makes early stopping legal under an honest prior, it does not make a small sample informative.

## S12 · Gelman, Hill & Yajima 2012, Why We (Usually) Don't Have to Worry About Multiple Comparisons

- **URL:** https://sites.stat.columbia.edu/gelman/research/published/multiple2f.pdf
- **Kind:** paper · **Status:** Unclaimed · **Added:** 2026-10-13 by CoWork deep research (Claude), 2026-10-13; primaries opened by fetch, not by a person
- **ID:** arXiv:0907.2478 (opened as v1, 2009-07-13); published J. Research on Educational Effectiveness 5(2), DOI 10.1080/19345747.2011.618213 per recall, publisher page refused · S28-gelman-hill-yajima-2012-why-we-usually-don-t-hav.pdf · sha256 60f4a16c273d
- **Scrub before use:** no measurement (theory or position)
- **What it claims, with its boundary:** Argues that multilevel (hierarchical Bayesian) models replace multiple-comparison corrections by partial pooling: estimates shrink toward each other and "intervals for comparisons are more likely to include zero", most strongly where group-level variation is low. Frames small-sample inference in Type S (sign) and Type M (magnitude) terms and states that "type M errors are more likely when uncertainty is high"; a worked educational example with 2,000 people is called "woefully underpowered". Method paper with reanalyses of education data; no web experiments, no bot handling.

## S13 · Nosek, Ebersole, DeHaven & Mellor 2018, The preregistration revolution

- **URL:** https://doi.org/10.1073/pnas.1708274114
- **Kind:** paper · **Status:** Unclaimed · **Added:** 2026-10-13 by CoWork deep research (Claude), 2026-10-13; primaries opened by fetch, not by a person
- **ID:** DOI 10.1073/pnas.1708274114; PMCID PMC5856500; PNAS 115(11):2600-2606, March 2018
- **Scrub before use:** no measurement (theory or position), primary not opened
- **What it claims, with its boundary:** Position paper: confusing postdiction with prediction weakens credibility, hindsight bias makes the confusion easy, and "An effective solution is to define the research questions and analysis plan before observing the research outcomes." Covers partial strategies for pre-existing data and notes preregistration services now exist across disciplines. No empirical N: an argument, not a measurement. Opened via the Europe PMC record (abstract and metadata); the PNAS page itself refused the fetch, so the full text was not read.

## S14 · Fabijan et al. 2019, Diagnosing Sample Ratio Mismatch in Online Controlled Experiments: A Taxonomy and Rules of Thumb for Practitioners (KDD 2019); read via the first-party ExP article Diagnosing Sample Ratio Mismatch in A/B Testing (Microsoft, 2020-09-14)

- **URL:** https://www.microsoft.com/en-us/research/articles/diagnosing-sample-ratio-mismatch-in-a-b-testing/
- **Kind:** article · **Status:** Unclaimed · **Added:** 2026-10-13 by CoWork deep research (Claude), 2026-10-13; primaries opened by fetch, not by a person
- **ID:** DOI 10.1145/3292500.3330722 (paper, not opened); article canonical URL, published 2020-09-14 · S26-fabijan-et-al-2019-diagnosing-sample-ratio-misma.html · sha256 6875ad8eefdb
- **Scrub before use:** no method stated, primary not opened
- **What it claims, with its boundary:** Sample ratio mismatch (SRM) is "a statistically significant difference between the ratio of users counted in variants A and B", tested at Microsoft's ExP with a chi-square at a conservative p < 0.0005. The taxonomy sorts causes into assignment, execution, log-processing, analysis and cross-cutting stages; bot filtering sits in the analysis stage (engaged users can "confuse a bot detection algorithm which then filtered them out of the analysis"). Prevalence as stated, without window or denominator: "about 6% of A/B tests have an SRM" at Microsoft; "about 10%" of LinkedIn's zoomed-in tests (cited). The KDD paper's basis is "four different software companies in over 25 different products" used by hundreds of millions of users; the paper's PDF could not be opened, only its abstract and this article by the same team.

## S15 · Anthropic (with Andon Labs) 2025, Project Vend: Phase two

- **URL:** https://www.anthropic.com/research/project-vend-2
- **Kind:** article · **Status:** Unclaimed · **Added:** 2026-10-13 by CoWork deep research (Claude), 2026-10-13; primaries opened by fetch, not by a person
- **ID:** canonical URL, published 2025-12-18 · S25-anthropic-with-andon-labs-2025-project-vend-phas.html · sha256 1b5defff231b
- **Scrub before use:** no method stated, promotional, demand not public (staff or simulated)
- **What it claims, with its boundary:** First-party report on the continued Claudius shop: "There are now three: San Francisco (where there's also a second vending machine), New York, and London"; "phase two used Claude Sonnet 4.0 and later Sonnet 4.5"; tools added (CRM, inventory, web and browser use without payment, forms, payment links, reminders) plus a CEO agent, Seymour Cash. Outcomes are stated qualitatively or as charts: "weeks with negative profit margin were largely eliminated" (no totals, revenue or transaction counts in the text); "After introducing the CEO, the number of discounts was reduced by about 80% and the number of items given away cut in half" while refunds tripled and store credits doubled (base counts not given). Boundaries Anthropic states itself: "we still didn't give it access to a payment interface", customers were "our Anthropic colleagues", no shopkeeper training, and the agents "still needed a great deal of human support"; the CEO "might even have been a hindrance". Window given only as "a few months".

## S16 · Andon Labs 2026, Why Gemini 3.1 Pro lost money running Andon Cafe

- **URL:** https://andonlabs.com/blog/why-gemini-lost-money-andon-cafe
- **Kind:** article · **Status:** Unclaimed · **Added:** 2026-10-13 by CoWork deep research (Claude), 2026-10-13; primaries opened by fetch, not by a person
- **ID:** canonical URL, posted 2026-06-30 · S24-andon-labs-2026-why-gemini-3-1-pro-lost-money-ru.html · sha256 e718b8a15d9a
- **Scrub before use:** single operator (one shop)
- **What it claims, with its boundary:** First-party accounting of a real cafe ("a small cafe space on Norrbackagatan in Stockholm, Sweden", opened mid-April 2026) run by an agent, Mona, with real money, public customers who email it, and control of ordering, prices, menu, hours, discounts and hiring; the author is an evaluation vendor. Gemini 3.1 Pro period, about two months: "Gemini-Mona had spent $38k, against $9k in sales"; "she bought 1,331 fresh bakery items against only 326 sold"; supplier bills "take that down to a $5.6k loss" before rent and wages. Stated causes: over-ordering never adapted to "real-world financial data", and "repeatedly gives discounts or freebies, usually after one email from a stranger." Limits stated: fixed SEK/USD rate of 9.74; inventory tracked only from May 2; the GPT-5.5 comparison covers a few weeks and its gain came from the model halting orders, "not GPT-Mona ordering well." One shop, one operator.

## S17 · Andon Labs 2026, Astra vs Fable on Vending-Bench: More Money, More Aligned (a later reading of the seeded Vending-Bench 2)

- **URL:** https://andonlabs.com/blog/gpt-6-astra-vending-bench
- **Kind:** article · **Status:** Unclaimed · **Added:** 2026-10-13 by CoWork deep research (Claude), 2026-10-13; primaries opened by fetch, not by a person
- **ID:** canonical URL, posted 2026-09-07; benchmark page https://andonlabs.com/evals/vending-bench-2 · S23-andon-labs-2026-astra-vs-fable-on-vending-bench.html · sha256 40b9d930a494
- **Scrub before use:** promotional, projection not measurement, demand not public (staff or simulated)
- **What it claims, with its boundary:** Latest first-party reading of the seeded benchmark: one simulated year from $500, demand "simulated based on equations that can be gamed" (benchmark page). "We ran GPT 6 Astra and Claude Fable 5.1 six times each"; "Astra finished with an average bank balance of $15,515, compared with $5,422 for Fable". Refund handling in those solo runs: "Astra pays 230 of 240 recorded requests (95.8%); Fable pays 224 of 237 (94.5%); Opus pays 19 of 179 (10.6%)", the last being the lab's earlier top earner, whose own post is titled "Once Again the Best Capitalist, Once Again Misaligned" (2026-07-28, not opened). Fable's gap is decomposed: "Across its six runs, it makes 45 identified failed prepayments, losing $14,331." Six runs per model, no significance testing, alignment judged qualitatively plus refund counts. The benchmark page also fits a trend line with a projected crossover date for Chinese models (Oct 2027): a projection, not a result.

## S18 · Bansal et al. (Microsoft Research) 2025, Magentic Marketplace: An Open-Source Environment for Studying Agentic Markets

- **URL:** https://arxiv.org/abs/2510.25779
- **Kind:** paper · **Status:** Unclaimed · **Added:** 2026-10-13 by CoWork deep research (Claude), 2026-10-13; primaries opened by fetch, not by a person
- **ID:** arXiv:2510.25779 (v1, 2025-10-27) · S22-bansal-et-al-microsoft-research-2025-magentic-ma.pdf · sha256 d1a309d06fd3
- **Scrub before use:** abstract only, demand not public (staff or simulated)
- **What it claims, with its boundary:** Independent simulated two-sided marketplace where Assistant agents represent consumers and Service agents represent competing businesses; studies utility, behavioural bias, manipulation vulnerability and search mechanisms. Abstract-level findings: frontier models "can approach optimal welfare -- but only under ideal search conditions"; "Performance degrades sharply with scale, and all models exhibit severe first-proposal bias, creating 10-30x advantages for response speed over quality." Agent counts, scenarios, models and manipulation rates are in the body, which was not read; 24 authors; one version.

## S19 · Kapoor, Stroebl, Siegel, Nadgir & Narayanan 2024, AI Agents That Matter

- **URL:** https://arxiv.org/abs/2407.01502
- **Kind:** paper · **Status:** Unclaimed · **Added:** 2026-10-13 by CoWork deep research (Claude), 2026-10-13; primaries opened by fetch, not by a person
- **ID:** arXiv:2407.01502 (v1, 2024-07-01) · S21-kapoor-stroebl-siegel-nadgir-narayanan-2024-ai-a.pdf · sha256 1681013e0421
- **Scrub before use:** abstract only
- **What it claims, with its boundary:** Critical reading of agent benchmarks and evaluation practice: a "narrow focus on accuracy without attention to other metrics" such as cost; model-developer and downstream-developer needs conflated; "many agent benchmarks have inadequate holdout sets, and sometimes none at all", producing agents that "take shortcuts and overfit"; and a "pervasive lack of reproducibility". Includes a joint accuracy-cost optimisation. The benchmarks examined and their numbers are in the body, which was not read.

## S20 · OpenAI & Stripe (Founding Maintainers) 2025-2026, Agentic Commerce Protocol (ACP) specification repository

- **URL:** https://github.com/agentic-commerce-protocol/agentic-commerce-protocol
- **Kind:** doc · **Status:** Unclaimed · **Added:** 2026-10-13 by CoWork deep research (Claude), 2026-10-13; primaries opened by fetch, not by a person
- **ID:** spec versions 2025-09-29, 2025-12-12, 2026-01-16, 2026-01-30, 2026-04-17 (latest stable); Apache-2.0 · S20-openai-stripe-founding-maintainers-2025-2026-age.html · sha256 376a844093a2
- **Scrub before use:** preview not shipped at volume
- **What it claims, with its boundary:** "An interaction model and open standard" for an AI agent completing purchases with a merchant: OpenAPI documents for agentic checkout and delegated payment, JSON schemas, examples and an RFC directory. Status on 2026-10-13: README says the protocol "is currently in beta"; latest stable version dated 2026-04-17 with an unreleased directory; "jointly governed by OpenAI and Stripe as Founding Maintainers". No adoption or volume figure on the page. Stripe's own seller docs now list "UCP or ACP" as the two seller-side protocols, so ACP is one of two.

## S21 · Stripe 2026, Shared payment tokens (docs, Sellers variant)

- **URL:** https://docs.stripe.com/agentic-commerce/concepts/shared-payment-tokens
- **Kind:** doc · **Status:** Unclaimed · **Added:** 2026-10-13 by CoWork deep research (Claude), 2026-10-13; primaries opened by fetch, not by a person
- **ID:** canonical URL; examples use Stripe-Version 2026-09-30.preview; terms link is the agentic commerce seller services preview · S19-stripe-2026-shared-payment-tokens-docs-sellers-v.html · sha256 f5a8115c274f
- **Scrub before use:** promotional, preview not shipped at volume
- **What it claims, with its boundary:** "An SPT is a scoped grant to use the customer's payment method. The agent grants SPTs to your Stripe profile, each with usage and expiration limits": usage_limits carry currency, max_amount and expires_at, "The agent sets the maximum amount to match the total amount of the transaction", the seller confirms a PaymentIntent with the token, and tokens deactivate when consumed, expired or revoked. Available "in the US, Canada, and select European countries" (35 listed). A live-mode path is documented: link-cli "can provision one-time shared payment token credentials" from a personal Link account to a Stripe profile. The agent-side features elsewhere in the same docs are "private preview" with a waitlist. Every example carries a preview API version.

## S22 · Stripe 2026, Machine payments (Machine Payments Protocol and x402 on Stripe)

- **URL:** https://docs.stripe.com/payments/machine
- **Kind:** doc · **Status:** Unclaimed · **Added:** 2026-10-13 by CoWork deep research (Claude), 2026-10-13; primaries opened by fetch, not by a person
- **ID:** canonical URL (no date shown on page) · S18-stripe-2026-machine-payments-machine-payments-pr.html · sha256 17fdc0ee001c
- **Scrub before use:** promotional, preview not shipped at volume
- **What it claims, with its boundary:** "Your server returns a payment challenge, the agent presents a valid payment credential, and Stripe settles the payment to your Stripe balance." Two rails: MPP (cards via SPTs, and stablecoins) and x402 (stablecoin). Price floors as stated: "For card payments through Shared Payment Tokens (SPTs), the minimum amount is 0.50 USD"; stablecoin "minimum amount is 0.01 USDC"; MPP sessions meter sub-cent work but "the minimum settlement amount is 0.01 USDC". Networks: MPP on Tempo (USDC.e) and Solana (USDC); x402 on Base (USDC). SPTs "available to businesses in all US states"; stablecoins all US states except New York, by access request. Listing in the Stripe Directory is by email and asks for an llms.txt link. No status label on this page; it rests on preview SPTs and gated stablecoin access.

## S23 · x402 Foundation (Coinbase-authored; founded with Cloudflare) 2025-2026, x402: A payments protocol for the internet. Built on HTTP

- **URL:** https://github.com/x402-foundation/x402
- **Kind:** doc · **Status:** Unclaimed · **Added:** 2026-10-13 by CoWork deep research (Claude), 2026-10-13; primaries opened by fetch, not by a person
- **ID:** Apache-2.0 repo; spec at specs/x402-specification.md (not opened); Cloudflare launch post 2025-09-23; x402 V2 post 2025-12-11 (not opened) · S17-x402-foundation-coinbase-authored-founded-with-c.html · sha256 6b4732b909d2
- **Scrub before use:** no method stated, promotional, primary not opened
- **What it claims, with its boundary:** Server "responds with a 402 Payment Required status" with a base64 PaymentRequired object in a PAYMENT-REQUIRED header; the client retries with PAYMENT-SIGNATURE carrying the PaymentPayload; the server verifies and settles locally or via a facilitator's /verify and /settle; success returns 200 with a PAYMENT-RESPONSE header. Schemes exact, upto and batch-settlement (EVM); the README "aims to support all networks (both crypto & fiat)" but names no production network and warns not to assume the public x402.org facilitator is a production path for mainnet EVM. No release tag or stability label on the page. Cloudflare's post of 2025-09-23 founded the x402 Foundation with Coinbase, shipped Agents SDK support, and was "proposing" a deferred scheme; it also states that sites on Cloudflare send "over a billion HTTP 402 response codes" a day, without method. A V2 was announced 2025-12-11 with a reported "100 million payments" in six months, second-hand and without a counting method.

## S24 · Google 2025, Agent Payments Protocol (AP2): Building a Secure and Interoperable Future for AI-Driven Payments (specification)

- **URL:** https://ap2-protocol.org/specification/
- **Kind:** doc · **Status:** Unclaimed · **Added:** 2026-10-13 by CoWork deep research (Claude), 2026-10-13; primaries opened by fetch, not by a person
- **ID:** canonical URL; repo google-agentic-commerce/AP2 (Apache-2.0, no releases); page carries Copyright 2025 and sample timestamps 2025-08-26
- **Scrub before use:** promotional, preview not shipped at volume
- **What it claims, with its boundary:** Defines mandates as verifiable credentials: the Cart Mandate "is the foundational credential that captures the user's authorization for a purchase"; the Intent Mandate "serves as the final, non-repudiable authorization to execute a purchase in the user's absence"; a Payment Mandate gives the payments ecosystem visibility. Roles: the user's shopping agent, a merchant endpoint ("A web interface, MCP endpoint or an AI agent"), a credentials provider, a merchant payment processor. Roadmap: "V0.1: The initial specification focuses on establishing the core architecture", human-present scenarios and "pull" methods (cards) only; human-not-present and push payments deferred to V1.x. No version date, no releases. By 2026 Google's UCP (ucp.dev) says it is "built on industry standards" including AP2 for payment mandates, and Stripe lists UCP as a seller protocol.

## S25 · Cloudflare 2025-2026, Introducing pay per crawl (Allen & Newton, 2025-07-01) with the docs page What is Pay Per Crawl? (updated 2026-07-28)

- **URL:** https://blog.cloudflare.com/introducing-pay-per-crawl/
- **Kind:** doc · **Status:** Unclaimed · **Added:** 2026-10-13 by CoWork deep research (Claude), 2026-10-13; primaries opened by fetch, not by a person
- **ID:** canonical URL; docs https://developers.cloudflare.com/ai-crawl-control/features/pay-per-crawl/what-is-pay-per-crawl/ · S15-cloudflare-2025-2026-introducing-pay-per-crawl-a.html · sha256 06d87fe4af60
- **Scrub before use:** bot is not agent, promotional, preview not shipped at volume
- **What it claims, with its boundary:** A crawler requesting a paid URL gets "an HTTP 402 Payment Required response, accompanied by a crawler-price header" and may retry with crawler-exact-price, or declare crawler-max-price up front and receive 200 plus crawler-charged. Crawlers authenticate with Web Bot Auth: Ed25519 keys, HTTP Message Signatures (RFC 9421), registration with Cloudflare. One flat per-request price per domain (docs: per zone), each crawler set to Allow, Charge or Block; "Cloudflare acts as the Merchant of Record for pay per crawl". Status: "private beta" in July 2025 and, per the docs on 2026-07-28, "Pay per crawl is currently in closed beta" with sign-up by form or Enterprise account executive. Neither source gives adoption, traffic or revenue; the blog's only count is "hundreds of conversations" with publishers.

## S26 · Szabo 1999, Micropayments and Mental Transaction Costs

- **URL:** https://nakamotoinstitute.org/library/micropayments-and-mental-transaction-costs/
- **Kind:** article · **Status:** Unclaimed · **Added:** 2026-10-13 by CoWork deep research (Claude), 2026-10-13; primaries opened by fetch, not by a person
- **ID:** mirror; original at szabo.best.vwh.net (dead); dated May 1999 · S14-szabo-1999-micropayments-and-mental-transaction.html · sha256 b554ba26c25d
- **Scrub before use:** no method stated, no measurement (theory or position), mirror of a dead original
- **What it claims, with its boundary:** The binding cost of a small purchase is the customer's cost of deciding: "Customer mental transaction costs come from at least three sources" (uncertain cash flows, costly attribute observation, costly decision making), and these "will soon dominate the technological transaction costs of the payment system", so cutting per-transaction compute "may often be economically insignificant". Illustrations rather than measurements: AT&T's $0.15 flat versus Sprint's $0.10 variable rate in 1999 ads; "up to 50% of the costs of a long distance call are for billing" by unspecified estimates. No N.

## S27 · Odlyzko 2003, The Case Against Micropayments

- **URL:** https://www-users.cse.umn.edu/~odlyzko/doc/case.against.micropayments.pdf
- **Kind:** paper · **Status:** Unclaimed · **Added:** 2026-10-13 by CoWork deep research (Claude), 2026-10-13; primaries opened by fetch, not by a person
- **ID:** author PDF; extended remarks from the Financial Cryptography 2003 panel; proceedings DOI 10.1007/978-3-540-45126-6_6 per recall, not shown in PDF · S13-odlyzko-2003-the-case-against-micropayments.pdf · sha256 2577fabfe152
- **Scrub before use:** no method stated, no measurement (theory or position)
- **What it claims, with its boundary:** "Micropayments are likely to continue disappointing their advocates" for non-technological reasons: sellers profit from bundles, consumers prefer flat rates and pay more for them, any explicit payment "serves to discourage usage", and card networks keep absorbing smaller payments. Evidence is historical cases: AOL's switch to a $19.95 flat rate in fall 1996 after which average time online "tripled" within a year; metered-to-flat switches raising usage "50-200%"; Elsevier's PEAK metered access producing "an inhibition on use". The ranges are quoted from others, not measured by the author.

## S28 · Prelec & Loewenstein 1998, The Red and the Black: Mental Accounting of Savings and Debt

- **URL:** https://doi.org/10.1287/mksc.17.1.4
- **Kind:** paper · **Status:** Unclaimed · **Added:** 2026-10-13 by CoWork deep research (Claude), 2026-10-13; primaries opened by fetch, not by a person
- **ID:** DOI 10.1287/mksc.17.1.4; Marketing Science 17(1):4-28
- **Scrub before use:** abstract only, lab sample (surveys or hypothetical)
- **What it claims, with its boundary:** Double-entry mental accounting: "the pain of paying" offsets consumption pleasure; consumption already paid for "can be enjoyed as if it were free"; coupling is "the degree to which consumption calls to mind thoughts of payment"; the model predicts a preference to prepay and for flat rates "even if it involves paying more for the same usage." Tested in surveys and a conjoint-like analysis: "Our model provides a better fit of the data for 60% of the subjects; the discounting formulation provides a better fit for only 29%"; subject count and population are in the body, which was not read (abstract via the RePEc record). The authors name the tension themselves: hedonic efficiency wants consumption decoupled from payment, but "it is important for consumers to be aware of what they are paying".

## S29 · Patrick & Park 2006, Paying before consuming: Examining the robustness of consumers' preference for prepayment

- **URL:** https://www.bauer.uh.edu/vpatrick/docs/Paying%20Before%20Consuming.pdf
- **Kind:** paper · **Status:** Unclaimed · **Added:** 2026-10-13 by CoWork deep research (Claude), 2026-10-13; primaries opened by fetch, not by a person
- **ID:** DOI 10.1016/j.jretai.2006.06.002; Journal of Retailing 82(3):165-175 · S11-patrick-park-2006-paying-before-consuming-examin.pdf · sha256 56a0feb3854c
- **Scrub before use:** lab sample (surveys or hypothetical)
- **What it claims, with its boundary:** Four lab studies with undergraduates (N = 64-65, 65, 215, 148 analysed) on $1,200 installment scenarios. Only hedonic-nondurable products elicit a prepayment preference: "88.23% of vacation participants chose prepayment, versus 26.66% (washer dryer)". The preference holds when the deal looks favourable (26 prepay vs 14 postpay at high transaction utility) and is not significant when it does not (21 vs 19); and "when the choice of payment timing is not offered, consumers become indifferent" (vacation purchase intent 4.74 prepay vs 4.44 postpay, n.s.). Authors' limits: homogeneous student samples; installment payments only, not lump sums.

## S30 · Starbucks Corporation 2025, Form 10-K for the fiscal year ended September 28, 2025 (stored value card policy and Deferred Revenue note)

- **URL:** https://www.sec.gov/Archives/edgar/data/829224/000082922425000114/sbux-20250928.htm
- **Kind:** doc · **Status:** Unclaimed · **Added:** 2026-10-13 by CoWork deep research (Claude), 2026-10-13; primaries opened by fetch, not by a person
- **ID:** SEC accession 0000829224-25-000114; XBRL reports R29, R48, R76 opened · S10-starbucks-corporation-2025-form-10-k-for-the-fis.html · sha256 f198b1b5ea4e
- **Scrub before use:** one network only, scale mismatch
- **What it claims, with its boundary:** The largest public first-party ledger of a prepaid-credit economy. Policy: "Amounts loaded onto stored value cards are initially recorded as deferred revenue and recognized as revenue upon redemption"; unredeemed balances are "recognized as breakage over time in proportion to stored value card redemptions" from "historical redemption patterns for each market." FY2025 (year to 2025-09-28), stored value card and loyalty deferred revenue: additions $15,245.8M, revenue recognized $15,199.5M, year-end balance $1,751.7M. Breakage recognized: $200.4M in company-operated store revenue (FY2024 $187.6M; FY2023 $196.1M) plus $22.0M in licensed store revenue (FY2024 $20.0M; FY2023 $18.9M), about 1.5% of the year's loads. One company, consolidated worldwide.

## S31 · Mathur, Acar, Friedman, Lucherini, Mayer, Chetty & Narayanan 2019, Dark Patterns at Scale: Findings from a Crawl of 11K Shopping Websites

- **URL:** https://arxiv.org/abs/1907.07032
- **Kind:** paper · **Status:** Unclaimed · **Added:** 2026-10-13 by CoWork deep research (Claude), 2026-10-13; primaries opened by fetch, not by a person
- **ID:** arXiv:1907.07032; DOI 10.1145/3359183 (CSCW 2019) · S9-mathur-acar-friedman-lucherini-mayer-chetty-nara.pdf · sha256 6fbbb4d6e644
- **Scrub before use:** stale window, text-only detection, popular sites only
- **What it claims, with its boundary:** Defines dark patterns as "user interface design choices that benefit an online service by coercing, steering, or deceiving users" and measures prevalence with an automated checkout crawler over ~53K product pages on ~11K Alexa-ranked shopping sites (list built August 2018; crawl about 90 hours), followed by manual labelling. "These 1,818 dark patterns were found on 1,254 of the ~11K shopping websites (~11.1%)", in 15 types and 7 categories; 183 sites judged deceptive; 22 third-party vendors sell dark patterns as turnkey tools. Detection is text-based on the product-to-checkout path only, so visual and post-checkout patterns are out of scope by the authors' own statement.

## S32 · Luguri & Strahilevitz 2021, Shining a Light on Dark Patterns

- **URL:** https://academic.oup.com/jla/article/13/1/43/6180579
- **Kind:** paper · **Status:** Unclaimed · **Added:** 2026-10-13 by CoWork deep research (Claude), 2026-10-13; primaries opened by fetch, not by a person
- **ID:** DOI 10.1093/jla/laaa006; Journal of Legal Analysis 13(1):43-109
- **Scrub before use:** lab sample (surveys or hypothetical), US panel only
- **What it claims, with its boundary:** Two census-weighted online experiments on American adults recruited by Dynata, testing whether dark patterns raise acceptance of a dubious identity-theft protection service. Study 1, "a final sample of 1,963 participants": control acceptance 11.3%, mild dark patterns 25.8%, aggressive 41.9%. Study 2, "a final sample of 3,777", decomposes which patterns carry the effect. "Whereas aggressive dark patterns generated a powerful backlash among consumers, mild dark patterns did not"; less-educated participants were more susceptible to mild patterns. The second half is legal analysis under existing US consumer-protection and contract law. The offer was survey-embedded, not a real purchase.

## S33 · US Federal Trade Commission, Bureau of Consumer Protection 2022, Bringing Dark Patterns to Light (staff report)

- **URL:** https://www.ftc.gov/system/files/ftc_gov/pdf/P214800%20Dark%20Patterns%20Report%209.14.2022%20-%20FINAL.pdf
- **Kind:** doc · **Status:** Unclaimed · **Added:** 2026-10-13 by CoWork deep research (Claude), 2026-10-13; primaries opened by fetch, not by a person
- **ID:** FTC matter P214800; published 2022-09-15 · S7-us-federal-trade-commission-bureau-of-consumer-p.pdf · sha256 eaa9111ab5ec
- **Scrub before use:** regulator cites others, US jurisdiction only, staff report not a rule
- **What it claims, with its boundary:** Defines dark patterns as "design practices that trick or manipulate users into making choices they would not otherwise have made" and sorts them into four categories (inducing false beliefs; hiding or delaying material information; leading to unauthorized charges; obscuring or subverting privacy choices), grounded in Section 5 of the FTC Act and ROSCA. Appendix A, "Compilation of Digital Dark Patterns", names concrete practices (false activity messages, baseless countdown timers, drip pricing, unauthorized transactions). Follows the 2021-04-29 workshop; no original prevalence measurement, the one figure cited is the EU study's "73 out of the 75 websites and apps explored". Chosen over DSA Article 25 (binds platforms, not a single shop; text not retrievable) and the OECD report (fetch failed).

## S34 · Howard (Answer.AI) 2024, The /llms.txt file (proposal; page states v2, modified 2026-08-10)

- **URL:** https://llmstxt.org/
- **Kind:** doc · **Status:** Unclaimed · **Added:** 2026-10-13 by CoWork deep research (Claude), 2026-10-13; primaries opened by fetch, not by a person
- **ID:** canonical URL; "Published September 3, 2024", "Modified August 10, 2026" · S6-howard-answer-ai-2024-the-llms-txt-file-proposal.html · sha256 b4ceae4a9835
- **Scrub before use:** no method stated, promotional, publishing is not consuming
- **What it claims, with its boundary:** Proposes a root-level /llms.txt Markdown file: one required H1, optional blockquote summary, free Markdown, then H2-delimited link lists with an Optional section. Status: a community convention, not a standards-body document; the v2 text claims "thousands of sites" publish one without a counting method. Adoption as verified from primaries on 2026-10-13: Google Search Central (updated 2025-12-10) says "You don't need to create new machine readable files, AI text files, or markup to appear in these features"; Chrome Lighthouse (2026-05-05) audits for the file and calls it "optional at the moment"; OpenAI's bots page links its own docs' llms.txt as a doc index; Anthropic's crawler article does not mention it. No crawler operator opened states that it reads third-party llms.txt.

## S35 · Tome (Cloudflare) 2025, The crawl-to-click gap: Cloudflare data on AI bots, training, and referrals (method in Belson & Rhea, AI search crawl-refer ratio on Radar, 2025-07-01)

- **URL:** https://blog.cloudflare.com/crawlers-click-ai-bots-training/
- **Kind:** article · **Status:** Unclaimed · **Added:** 2026-10-13 by CoWork deep research (Claude), 2026-10-13; primaries opened by fetch, not by a person
- **ID:** canonical URL, 2025-08-29; method post https://blog.cloudflare.com/ai-search-crawl-refer-ratio-on-radar · S5-tome-cloudflare-2025-the-crawl-to-click-gap-clou.html · sha256 d0b73bac37cd
- **Scrub before use:** one network only, request share not visitor share, bot is not agent, native-app referrals invisible
- **What it claims, with its boundary:** Across Cloudflare's network, January-July 2025, monthly crawl-to-refer ratios, defined as HTML requests from a platform's crawler user agents divided by HTML requests whose Referer names that platform: Anthropic 286,930 in January and, "Even after an 87% decline this year, it still crawled 38,000 pages for every referred page visit in July 2025"; OpenAI "from 1,217 bots per human in January to 1,091 in July"; Perplexity "from 54 bots per human in January to 195"; Microsoft 38.5 to 40.7; Google 3.8 to 5.4 (table). Purpose split on the same network: "Over the past 12 months, 80% of AI crawling was for training, compared with 18% for search and just 2% for user actions." Caveats from the method post: native apps send no Referer so ratios "may overstate"; Google's own AS referral traffic excluded; training, search and user-fetch crawler UAs are pooled per platform.

## S36 · Google Search Central 2025, AI features and your website (last updated 2025-12-10)

- **URL:** https://developers.google.com/search/docs/appearance/ai-features
- **Kind:** doc · **Status:** Unclaimed · **Added:** 2026-10-13 by CoWork deep research (Claude), 2026-10-13; primaries opened by fetch, not by a person
- **ID:** canonical URL; "Last updated 2025-12-10 UTC" · S4-google-search-central-2025-ai-features-and-your.html · sha256 3ae5b283d28d
- **Scrub before use:** promotional, guarantee disclaimed
- **What it claims, with its boundary:** Shipped guidance: the only eligibility condition for AI Overviews and AI Mode is that a page be indexed and snippet-eligible; "There are no additional requirements to appear in AI Overviews or AI Mode, nor other special optimizations necessary"; "There's also no special schema.org structured data that you need to add." Recommends structured data that matches visible text, crawling allowed in robots.txt and by any CDN, nosnippet/max-snippet/noindex to limit, and Google-Extended to limit training elsewhere. "Indexing and serving isn't guaranteed." Chosen over OpenAI's product-feed spec (opened; registered feeds, "currently targets the US", search on by default and checkout off) because it tells a tiny site what to publish with no gate.

## S37 · Holscher (Read the Docs) 2024, AI crawlers need to be more respectful

- **URL:** https://about.readthedocs.com/blog/2024/07/ai-crawlers-abuse/
- **Kind:** article · **Status:** Unclaimed · **Added:** 2026-10-13 by CoWork deep research (Claude), 2026-10-13; primaries opened by fetch, not by a person
- **ID:** canonical URL, 2024-07-25 · S3-holscher-read-the-docs-2024-ai-crawlers-need-to.html · sha256 3471836e7555
- **Scrub before use:** one network only, no method stated, bytes not requests, single-actor dominated
- **What it claims, with its boundary:** First-party write-up from one documentation host, from its own CDN and bandwidth charts, May-June 2024: "One crawler downloaded 73 TB of zipped HTML files in May 2024, with almost 10 TB in a single day", costing over $5,000 in bandwidth; a second episode of about 10 TB in June from a suspected social-network downloader (attribution uncertain per the author). After blocking, "bandwidth for our downloaded files has decreased by 75% (~800GB/day to ~200GB/day)". All figures are bytes from one host's dashboards; no request counts and no crawler-versus-human share; the per-day cost is the author's estimate.

## S38 · Richter & Berger 2019, Scanning the Scanners: Sensing the Internet from a Massively Distributed Network Telescope

- **URL:** https://www.akamai.com/site/en/documents/research-paper/scanning-the-scanners-the-internet-from-a-massively-distributed-network-telescope.pdf
- **Kind:** paper · **Status:** Unclaimed · **Added:** 2026-10-13 by CoWork deep research (Claude), 2026-10-13; primaries opened by fetch, not by a person
- **ID:** DOI 10.1145/3355369.3355595 (ACM IMC 2019); Akamai-hosted PDF opened, ACM page refused
- **Scrub before use:** one network only, stale window, packet-level not HTTP
- **What it claims, with its boundary:** Unsolicited packets logged at 89,000 Akamai CDN servers (178,000 public IPv4 addresses in 2,800 prefixes, 1,347 ASes, 156 countries) during November 2018, with a baseline from early 2016 to December 2018. "We find that some 87% of logged traffic is the result of scanning activity"; "In total, we identified 2.2M scans". For a host anywhere: "Routed IPv4 addresses receive a baseline of some 3000 packets on a daily basis as a result of Internet-wide scans of the IPv4 space", and "a 3-fold increase in baseline activity, starting from ~1000 packets in early 2016". Packet-level, all ports, not HTTP requests; it does not measure time-to-first-probe for a newly exposed host.

## S39 · AlNoamany, Weigle & Nelson 2013, Access Patterns for Robots and Humans in Web Archives

- **URL:** https://arxiv.org/abs/1309.4009
- **Kind:** paper · **Status:** Unclaimed · **Added:** 2026-10-13 by CoWork deep research (Claude), 2026-10-13; primaries opened by fetch, not by a person
- **ID:** arXiv:1309.4009 (2013-09-16); JCDL 2013 per recall, venue not stated on page · S1-alnoamany-weigle-nelson-2013-access-patterns-for.pdf · sha256 4e7b3121a0f6
- **Scrub before use:** one network only, stale window, heuristic bot labels
- **What it claims, with its boundary:** Internet Archive Wayback Machine access logs: cluster sample of one week (2012-02-02 to 02-08), one 2M-request slice per day; the analysed slice is 2012-02-02, about 33 minutes and 37,634 sessions. Robots separated from humans by user-agent checks plus traffic-pattern rules ("Users with more than 20 different User-Agents were classified as robots"; a session "with less than one image file for every 10 HTML files" is a robot; a browsing-speed threshold). Result: "Robots outnumber humans 10:1 in terms of sessions, 5:4 in terms of raw HTTP accesses, and 4:1 in terms of megabytes transferred"; robots almost always fetch TimeMaps (95% of their accesses) while humans fetch archived pages (82%). One archive, one slice, 2012.

# The Garage — hand-off log

Append-only. Newest entry last.

## 2026-10-13 · Air · the charter

**What landed.** The charter for wrasse, `src/garage/CHARTER.md` v0.1, drafted after the
discussion of how a headless agent's charter differs from Solomon's seated pod: the gate is
mechanical, the objective is a number so the instrument comes first, every thought bills tokens
and the agent never moves money, the surface is public, and the ledger is the only memory.
Guidelines and budget ($2 per run, $10 per day) founder-ratified in that discussion. Section 6
designs the study flywheel: library, register, ledger, lessons, and calibration as the
proficiency metric. Working notes in `src/garage/CLAUDE.md`. A root `CLAUDE.md` now points at
both corners.

**Decisions taken.** The Claude Agent SDK is the harness (founder's call). The agent is named
wrasse. Linear and Notion through the same hosted MCP servers the pod uses.

**What is next.** Phase 1, "the harness and the gate": install the SDK, `workers/garage/` runs
one headless session that reads the repo and writes a report row, and the eight guards in
charter section 3 land with their firing tests. No proposals until the ledger exists.

**Machine-local facts.** Nothing yet. No token minted, no Neon tables, no SDK installed.

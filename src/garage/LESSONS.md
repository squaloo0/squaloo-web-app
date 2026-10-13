# Lessons — what the retrospectives concluded

Short. The founder writes these at charter-health passes; wrasse may draft one, marked draft.

1. **2026-10-13, from run `c793e6ea` (draft, orchestrator).** A date without its zone is not a
   date. The harness handed the agent a bare day that disagreed with its own clock across the
   UTC line, and the agent reported the mismatch rather than picking one. That is the right
   behavior; the fix went into the preamble the same hour. Rule 16 applies to clocks.

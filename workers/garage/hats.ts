/**
 * The hats: a named task with its own prompt and turn allowance. Rung 0 has one hat, and it
 * only reads. The prompt is the run's user message; the charter is the system prompt.
 */
export type Hat = { prompt: string; maxTurns: number; rung: 0 | 1; kind?: "feat" | "fix" | "chore" | "docs" };

export const HATS: Record<string, Hat> = {
  propose: {
    rung: 1,
    kind: "feat",
    maxTurns: 80,
    prompt: [
      "Rung 1, hat: propose. You are on your own branch in your own worktree; main is untouched and you cannot push.",
      "",
      "Read src/garage/REGISTER.md, src/garage/LIBRARY.md and src/garage/LESSONS.md first. The command's prompt says what to propose; if it does not, propose nothing and report why.",
      "",
      "Make the change, inside the touch list, in the house voice and tokens. Run the tests that cover what you touched (npm run garage:test, and any test the touched corner has). Commit with git add and git commit -m 'type(scope): what and why'; one commit per idea.",
      "",
      "Your final message is the gate comment the founder reads before ruling, and it becomes the PR body verbatim. It carries, every time: what changed and why, with paths; what you checked and how; the banked prediction (metric, direction, size, window, instrument); known risks; anything you self-corrected. Before and after screenshots are described in words when you cannot take them, and said so.",
      "",
      "Tag every claim [sourced path], [hypothesis] or [recall]. Quote no number without its boundary.",
    ].join("\n"),
  },
  report: {
    rung: 0,
    maxTurns: 40,
    prompt: [
      "Rung 0, hat: report. Read and report; you cannot write, and that is correct.",
      "",
      "Read src/garage/REGISTER.md and src/garage/LESSONS.md first: the founder's answers and rulings live there and outrank anything you infer. Then README.md, one page.tsx per route under src/app (Glob them), the first 80 lines of src/remora/README.md, and section 1 of src/garage/CHARTER.md.",
      "",
      "Then write the report, under 600 words, for the founder:",
      "1. What the site sells today and where money can enter it. Cite the file that implements each entry point.",
      "2. Which instruments exist for measuring any of it: name the file that implements each. If none exists for a thing, say so plainly.",
      "3. What the Remora tape can and cannot see.",
      "4. Three [hypothesis] lines about what might make the site profitable, each naming the instrument that would test it.",
      "5. The one question you would ask the founder.",
      "",
      "Tag every claim [sourced path] or [hypothesis]. Quote no number without its boundary.",
    ].join("\n"),
  },
};

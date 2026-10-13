/**
 * The hats: a named task with its own prompt and turn allowance. Rung 0 has one hat, and it
 * only reads. The prompt is the run's user message; the charter is the system prompt.
 */
export type Hat = { prompt: string; maxTurns: number; rung: 0 | 1 };

export const HATS: Record<string, Hat> = {
  report: {
    rung: 0,
    maxTurns: 40,
    prompt: [
      "Rung 0, hat: report. Read and report; you cannot write, and that is correct.",
      "",
      "Read README.md, one page.tsx per route under src/app (Glob them), the first 80 lines of src/remora/README.md, and section 1 of src/garage/CHARTER.md.",
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

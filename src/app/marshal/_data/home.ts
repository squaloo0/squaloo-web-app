/**
 * Home-page copy for /marshal (SQU-461): the bio, its links, the portrait and
 * the Capabilities pillars.
 *
 * The bio and the pillars are carried over from the founder's existing
 * /founder page, trimmed; the pillar levels are self-rated there and kept as
 * he wrote them. Draft copy: the founder edits it into his own voice here.
 */
import type { MediaKey } from "./media";

export const HOME = {
  meta: {
    title: "Marshal Aldoph · Portfolio",
    description:
      "The portfolio of Marshal Aldoph, founder of Squaloo and MS candidate at the USC Iovine and Young Academy: seven numbered projects from the degree, oldest first, and the company built alongside it.",
  },
  eyebrow: "Portfolio · 2025–2026",
  name: "Marshal Aldoph",
  claim: "I design the product, write the firmware, and run the numbers.",
  bio: "I’m the founder of Squaloo and an MS candidate at the USC Iovine and Young Academy. Before that, seven years of enterprise systems. This is the work from the degree so far, numbered in the order I made it, next to the company I’m building alongside it.",
  links: [
    { label: "Resume", href: "https://rxresu.me/marshal2093/vr1" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/marshalaldoph/" },
    { label: "GitHub", href: "https://github.com/marshal2093" },
    { label: "Squaloo GitHub", href: "https://github.com/squaloo0" },
  ],
  portrait: "007-solomon/meridian-pitch-03" as MediaKey,
  capabilities: [
    {
      title: "Systems Architecture & AI Infrastructure",
      proficiency: "Advanced — Level 4/5",
      level: 4,
      maxLevel: 5,
      keywords: [
        "Python (Asyncio, Pydantic)",
        "Vector Databases",
        "Supabase / PostgreSQL / PgVector",
        "ML Foundations (Scikit-Learn, PyTorch, Keras)",
        "Cloud & Edge (Azure, Docker, Cloudflare)",
        "Agentic Workflows (Claude Code, Cursor)",
      ],
    },
    {
      title: "Technical Leadership & Venture Strategy",
      proficiency: "Expert — Level 5/5",
      level: 5,
      maxLevel: 5,
      keywords: [
        "Cross-Disciplinary Team Orchestration",
        "Agile / SCRUM",
        "Enterprise MarTech (AEM, Salesforce)",
        "B2B Market Strategy",
        "Community-Led Growth (CLG)",
        "Bootstrapped R&D Planning",
        "Technical Documentation",
      ],
    },
    {
      title: "Product Design & Innovation Strategy",
      proficiency: "Advanced — Level 4/5",
      level: 4,
      maxLevel: 5,
      keywords: [
        "Human-Centered Design (HCD)",
        "Rapid Prototyping & Visualization",
        "Consumer Experience (CX)",
        "Product-Market Validation",
        "Systems Thinking",
        "GTM Strategy",
        "Interactive Data Visualization",
      ],
    },
  ],
} as const;

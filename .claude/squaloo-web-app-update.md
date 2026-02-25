# Squaloo Web App: Architecture & Repositioning Strategy

## Context & Objective
The Squaloo web app is shifting from a single-project portfolio (focused heavily on the QR code project) to a "Sovereign Hub" for Marshal Aldoph, a Technical Founder and Systems Architect. The application needs to be restructured into distinct, scalable domains that separate the creator, the venture, and the sandbox.

**Design Aesthetic ("Righteous Shrewdness"):** Clean, highly technical, slightly industrial, but highly polished. Think "Apple meets Lockheed Martin." Minimalist, stark, using monospace fonts for terminal/data elements and clean sans-serif for narratives. 

---

## Task 1: Rebuild the Root Experience (`src/app/page.tsx`)
Transform the root landing page into a minimalist, MSCHF-inspired directory. 
- **Vibe:** Stark, terminal-esque. No fluff, no heavy hero images. Just a clean, commanding list of access points.
- **Content & Routing:** Create a central, vertically aligned list with the following links:
  - `[#001] The-Architect` (Routes to `/marshal`)
  - `[#002] Amak-Studios` (Routes to `/amak-studios`)
  - `[#003] Marshal-QR` (Routes to `/marshal-qr`)

## Task 2: Build "The Architect" Portfolio (`src/app/marshal/page.tsx`)
Create a new route directory `src/app/marshal/`. This is the professional narrative for fellowships and executive networking. 

**Section A: Hero**
- **Headline:** "The future of AI is small, local, and sovereign."
- **Sub-headline:** "Technical Founder and Systems Architect bridging seven years of enterprise data automation with cutting-edge AI research. Currently pursuing an MSIDBT at USC's Iovine and Young Academy while scaling Amak Studios, a venture studio building sovereign, offline-first AI operating systems for the 'New Collar' workforce."
- **CTAs:** - Primary: "View Technical Resume" (External link to: `https://rxresu.me/marshal2093/vr1`)
  - Secondary: "Connect on LinkedIn" (External link to: `https://www.linkedin.com/in/marshalaldoph/`)

**Section B: Capabilities Pillars (Grid Layout)**
Format as a 3-column grid or clean technical cards using the following exact data:
1. **Systems Architecture & AI Infrastructure**
   - *Proficiency:* Advanced (Level 4/5)
   - *Keywords:* Python (Asyncio, Pydantic), Vector Databases (Supabase, PostgreSQL, PgVector), Machine Learning Foundations (Scikit-Learn, PyTorch, Keras), Cloud & Edge Deployment (Azure Functions, Docker, Cloudflare), Agentic Workflows (Claude Code, Cursor).
2. **Technical Leadership & Venture Strategy**
   - *Proficiency:* Expert (Level 5/5)
   - *Keywords:* Cross-Disciplinary Team Orchestration, Agile/SCRUM Methodologies, Enterprise MarTech Operations (AEM, Salesforce), B2B Market Strategy, Community-Led Growth (CLG), Bootstrapped R&D Planning, Technical Documentation.
3. **Product Design & Innovation Strategy**
   - *Proficiency:* Advanced (Level 4/5)
   - *Keywords:* Human-Centered Design (HCD), Rapid Prototyping & Visualization, Consumer Experience (CX), Product-Market Validation, Systems Thinking, Go-to-Market (GTM) Strategy, Interactive Data Visualization.

**Section C: Project Tracks (Case Studies)**
- **Track 1: Venture & Architecture (Amak Studios):** Highlight the "One Brain, Two Bodies" protocol and the Sovereign Data Lakehouse (Metrics: 3.7ms retrieval, PostgreSQL/PgVector stack).
- **Track 2: Enterprise Systems (Pacific Life):** Highlight the successful architecture and deployment of the Customer Acquisition Loop (CAL).
- **Track 3: Hardware & Prototyping (The QR Matrix):** Link to `/marshal-qr`.

## Task 3: Build "The Venture Manifesto" (`src/app/amak-studios/page.tsx`)
Create a new route directory `src/app/amak-studios/`. This is the ideological battleground and R&D hub.

**Section A: The Manifesto**
- **Focus:** Argue the "New Collar" thesis. Discuss the $2.3M/hour equipment downtime problem, the impending "Competency Collapse" of the industrial sector, and why cloud-tethered AI fails the physical world.
- **Style:** Use a bold, essay-like typographic layout.

**Section B: The R&D Log (Migration)**
- **Action:** Migrate the existing blog functionality from `/marshal-qr/blog/` to `/amak-studios/log/`. 
- **Repositioning:** Rename the UI from "Blog" to "R&D Log" or "Founder's Journal". This will house updates on the Sovereign Data Lakehouse, USC grant milestones, and deep-tech research.

## Task 4: Preserve The Sandbox (`src/app/marshal-qr/`)
- Ensure that the current `marshal-qr` directory functions smoothly as an isolated route. 
- Remove any top-level nav links within `marshal-qr` that refer to the old blog (since it's moving to Amak Studios), and add a simple "Return to Terminal" link back to the root (`/`).

## Execution Constraints for Claude
1. Use Tailwind CSS for all styling to maintain consistency.
2. Ensure components are cleanly abstracted (e.g., create a `<PillarCard />` component for the capabilities section).
3. Do not delete the existing database logic or Next.js configurations; focus strictly on routing, component creation, and layout refactoring.
4. Execute these tasks sequentially, verifying routes load correctly before moving to the next.
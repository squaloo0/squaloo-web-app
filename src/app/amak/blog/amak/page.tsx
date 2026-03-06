import Link from "next/link";
import MilestoneTracker from "@/components/MilestoneTracker";
import AppFooter from "@/components/AppFooter";

export const metadata = {
  title: "Building the Sovereign Data Lakehouse & OB2B Protocol — Amak R&D Log",
  description:
    "A ledger of architectural decisions behind Amak's SDL and One Brain, Two Bodies protocol.",
};

export default function AmakBlogPost() {
  return (
    <div className="min-h-screen bg-[#08090a] text-white font-sans flex flex-col">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-800 bg-[#08090a]/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-8 h-14 flex items-center justify-between">
          <Link
            href="/amak/blog"
            className="text-neutral-500 text-xs tracking-widest uppercase font-mono hover:text-white transition-colors"
          >
            ← R&D Log
          </Link>
          <Link
            href="/"
            className="text-neutral-500 text-xs tracking-widest uppercase font-mono hover:text-white transition-colors"
          >
            Terminal
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-8 pt-32 pb-24 flex-1">

        {/* ── POST HEADER ── */}
        <header className="mb-16">
          <div className="text-xs text-neutral-500 font-mono tracking-widest uppercase mb-6">
            Amak / R&D Log / Entry 001
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight mb-6">
            Building the Sovereign Data Lakehouse &amp; OB2B Protocol
          </h1>

          {/* Front-matter block */}
          <div className="border border-neutral-800 bg-neutral-900/30 p-4 font-mono text-xs mb-8">
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              <div>
                <span className="text-neutral-500">Author</span>
                <span className="text-[#f6f7eb] ml-3">Marshal</span>
              </div>
              <div>
                <span className="text-neutral-500">Date</span>
                <span className="text-[#f6f7eb] ml-3">March 5, 2026</span>
              </div>
              <div>
                <span className="text-neutral-500">Category</span>
                <span className="text-[#f6f7eb] ml-3">R&D Log</span>
              </div>
              <div>
                <span className="text-neutral-500">Status</span>
                <span className="text-[#5688c7] ml-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5688c7] animate-pulse inline-block" />
                  Active Development
                </span>
              </div>
              <div>
                <span className="text-neutral-500">ETA</span>
                <span className="text-[#f6f7eb] ml-3">May 2026</span>
              </div>
              <div>
                <span className="text-neutral-500">Deliverables</span>
                <span className="text-[#63a375] ml-3">3 / 7</span>
              </div>
            </div>
          </div>

          {/* Milestone tracker */}
          <MilestoneTracker />
        </header>

        {/* ── BODY ── */}
        <article className="space-y-16">

          {/* Intro */}
          <div className="space-y-4 text-neutral-400 text-sm leading-relaxed">
            <p>
              This log is a running ledger of every architectural decision made to bring
              Amak&apos;s <strong className="text-white">Sovereign Data Lakehouse (SDL)</strong>{" "}
              and the <strong className="text-white">One Brain, Two Bodies (OB2B) Protocol</strong>{" "}
              from whiteboard to running hardware. It is updated at each deliverable — written
              from the stakeholder seat, not the engineering one.
            </p>
            <p>
              The goal is sovereign, offline-first AI for the physical workforce. Project G —
              Amak&apos;s first edge device — is the proof of concept. What follows is how we&apos;re
              building it.
            </p>
          </div>

          {/* Deliverable 1 */}
          <DeliverableSection
            number="01"
            title="Architecture & The OB2B Protocol"
            status="complete"
          >
            <p>
              To offer users true ownership of their computing power and AI models, we had
              to reject the traditional centralized dependency. We architected the{" "}
              <strong className="text-white">One Brain, Two Bodies (OB2B) Protocol</strong>:
            </p>
            <ul className="space-y-3 mt-4">
              <li>
                <strong className="text-[#f6f7eb]">The Two Bodies (The Edge):</strong>{" "}
                <span>
                  The physical, pocket-sized edge machine (Project G) and the web interface (OsH).
                </span>
              </li>
              <li>
                <strong className="text-[#f6f7eb]">The One Brain (The Core):</strong>{" "}
                <span>
                  The centralized service handling file submission, secure storage, and
                  AI-powered context-aware retrieval.
                </span>
              </li>
            </ul>

            <KeyDecisions decisions={[
              {
                title: "Dockerized Edge Environments",
                detail: "We implemented strict memory constraints (max 6GB RAM) using Docker to ensure our stack can run locally on edge hardware like the Raspberry Pi 5.",
              },
              {
                title: "Secure Bridging",
                detail: "We established a secure edge-to-cloud bridge utilizing Cloudflare Tunnels and RClone for data movement, allowing Project G to communicate safely from behind any network.",
              },
            ]} />
          </DeliverableSection>

          {/* Deliverable 2 */}
          <DeliverableSection
            number="02"
            title="Cloud Ingestion Setup"
            status="complete"
          >
            <p>
              The next phase involved building the Azure-based backend to handle asynchronous
              data ingestion from both web media uploads and edge-device log generations.
            </p>

            <KeyDecisions decisions={[
              {
                title: "Serverless Infrastructure",
                detail: "We deployed Microsoft Azure Functions for serverless execution and Azure Blob Storage for handling user files.",
              },
              {
                title: "Unified Resource Schema",
                detail: "We standardized the data payload across the OB2B protocol, ensuring that whether data comes from a web interface or an edge device, it carries standard identifiers: USER_ID, SOURCE_ID, CONTENT_TYPE, RAW_DATA.",
              },
              {
                title: "Security First",
                detail: "We integrated Azure Privileged Identity Management (PIM) for secure role management.",
              },
            ]} />
          </DeliverableSection>

          {/* Deliverable 3 */}
          <DeliverableSection
            number="03"
            title="Data Lakehouse & Vector Layer"
            status="complete"
          >
            <p>
              To make Project G intelligent without relying on external API calls, we built
              the &ldquo;Intelligence Layer&rdquo; of the Sovereign Data Lakehouse. This allows the
              device to perform hybrid searches (keyword matching + RAG-based similarity)
              entirely offline.
            </p>

            <KeyDecisions decisions={[
              {
                title: "Supabase & pgvector",
                detail: "We configured a local Postgres database with the pgvector extension, utilizing a dual-resolution schema (a parent resources table and a child resource_chunks table) for optimal retrieval.",
              },
              {
                title: "Optimized Edge Embeddings",
                detail: "To save memory while preserving AI intelligence, we adopted the nomic-embed-text-v1.5 model. We truncate embeddings to 384-dimensional Int8-quantized vectors — perfect for edge hardware.",
              },
              {
                title: "Differential Syncing",
                detail: "To keep the edge device synced with the cloud even on poor networks, we implemented a differential syncing mechanism using SHA-256 hashing. It only downloads or updates the specific chunks of data that have changed.",
              },
            ]} />
          </DeliverableSection>

          {/* What's Next */}
          <section className="border-t border-neutral-800 pt-10">
            <h2 className="text-xs font-mono tracking-widest uppercase text-neutral-400 mb-6">
              What&apos;s Next
            </h2>
            <div className="space-y-4 text-neutral-400 text-sm leading-relaxed">
              <p>
                We are actively building out the{" "}
                <strong className="text-white">Hybrid Search Pipeline (Deliverable 4)</strong>{" "}
                and moving towards the physical{" "}
                <strong className="text-white">Edge Deployment (Deliverable 5)</strong> of
                the Project G prototype. By housing the database and vector store locally,
                Project G will soon be ready to serve as a gamified, &ldquo;choose your own
                adventure&rdquo; AI companion that puts sovereignty back in the palm of your hand.
              </p>
            </div>
            <div className="mt-8">
              <Link
                href="/amak/ob2b"
                className="inline-flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-[#5688c7] hover:text-white transition-colors border border-[#5688c7]/30 hover:border-white px-4 py-2"
              >
                View OB2B Protocol →
              </Link>
            </div>
          </section>

        </article>

        {/* ── POST NAV ── */}
        <div className="flex justify-between items-center mt-20 pt-8 border-t border-neutral-800">
          <Link
            href="/amak/blog"
            className="text-neutral-500 text-xs font-mono tracking-widest uppercase hover:text-white transition-colors"
          >
            ← All Entries
          </Link>
          <Link
            href="/amak/ob2b"
            className="text-neutral-500 text-xs font-mono tracking-widest uppercase hover:text-white transition-colors"
          >
            OB2B Protocol →
          </Link>
        </div>

      </div>

      <AppFooter />
    </div>
  );
}

/* ── Sub-components ── */

function DeliverableSection({
  number,
  title,
  status,
  children,
}: {
  number: string;
  title: string;
  status: "complete" | "active" | "upcoming";
  children: React.ReactNode;
}) {
  const statusColor =
    status === "complete"
      ? "text-[#63a375] border-[#63a375]/30"
      : status === "active"
      ? "text-[#5688c7] border-[#5688c7]/30"
      : "text-neutral-600 border-neutral-800";

  const statusLabel =
    status === "complete" ? "Complete" : status === "active" ? "Active" : "Upcoming";

  return (
    <section className="border-t border-neutral-800 pt-10">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <span className="text-xs font-mono text-neutral-500">Deliverable {number}</span>
        <span
          className={`text-xs font-mono tracking-widest uppercase border px-2 py-0.5 ${statusColor}`}
        >
          {statusLabel}
        </span>
      </div>
      <h2 className="text-xl font-bold text-white mb-6">{title}</h2>
      <div className="space-y-4 text-neutral-400 text-sm leading-relaxed">{children}</div>
    </section>
  );
}

function KeyDecisions({
  decisions,
}: {
  decisions: { title: string; detail: string }[];
}) {
  return (
    <div className="mt-6">
      <div className="text-xs font-mono tracking-widest uppercase text-neutral-400 mb-4">
        Key Technical Decisions
      </div>
      <div className="space-y-4">
        {decisions.map((d) => (
          <div key={d.title} className="border-l border-[#1400bf]/40 pl-4">
            <div className="text-[#f6f7eb] text-xs font-medium mb-1">{d.title}</div>
            <p className="text-neutral-400 text-xs leading-relaxed">{d.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

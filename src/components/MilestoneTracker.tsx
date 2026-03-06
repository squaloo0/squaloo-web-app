interface Milestone {
  id: number;
  title: string;
  date: string;
  status: "complete" | "active" | "upcoming";
}

const MILESTONES: Milestone[] = [
  { id: 1, title: "Architecture & Planning", date: "Jan 26, 2026", status: "complete" },
  { id: 2, title: "Cloud Ingestion Setup", date: "Feb 8, 2026", status: "complete" },
  { id: 3, title: "Data Lakehouse & Vector Layer", date: "Feb 22, 2026", status: "complete" },
  { id: 4, title: "Hybrid Search Pipeline", date: "Mar 8, 2026", status: "active" },
  { id: 5, title: "Edge Deployment (Project G)", date: "Apr 5, 2026", status: "upcoming" },
  { id: 6, title: "Full System Integration", date: "Apr 19, 2026", status: "upcoming" },
  { id: 7, title: "Finalization & Handoff", date: "May 3, 2026", status: "upcoming" },
];

interface MilestoneTrackerProps {
  compact?: boolean;
}

export default function MilestoneTracker({ compact = false }: MilestoneTrackerProps) {
  const completed = MILESTONES.filter((m) => m.status === "complete").length;
  const total = MILESTONES.length;

  return (
    <div className="w-full">
      {/* Quick stats bar */}
      <div className="flex flex-wrap gap-6 mb-6 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="text-neutral-500 tracking-widest uppercase">ETA</span>
          <span className="text-[#5688c7]">May 3, 2026</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-neutral-500 tracking-widest uppercase">Deliverables</span>
          <span className="text-[#63a375]">{completed}/{total}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-neutral-500 tracking-widest uppercase">Cadence</span>
          <span className="text-neutral-300">Bi-weekly sprints</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-neutral-500 tracking-widest uppercase">Status</span>
          <span className="flex items-center gap-1.5 text-[#5688c7]">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#5688c7] animate-pulse" />
            Active Development
          </span>
        </div>
      </div>

      {/* Milestone list */}
      <div className="space-y-0">
        {MILESTONES.map((milestone) => (
          <MilestoneRow key={milestone.id} milestone={milestone} compact={compact} />
        ))}
      </div>
    </div>
  );
}

function MilestoneRow({ milestone, compact }: { milestone: Milestone; compact: boolean }) {
  const isComplete = milestone.status === "complete";
  const isActive = milestone.status === "active";
  const isUpcoming = milestone.status === "upcoming";

  return (
    <div
      className={`flex items-center gap-4 border-t py-4 transition-colors ${
        isComplete
          ? "border-[#63a375]/20"
          : isActive
          ? "border-[#5688c7]/30"
          : "border-neutral-800"
      } ${isUpcoming ? "opacity-50" : ""}`}
    >
      {/* Status indicator */}
      <div className="w-6 flex-shrink-0 flex justify-center">
        {isComplete && (
          <svg className="w-4 h-4 text-[#63a375]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        )}
        {isActive && (
          <span className="w-3 h-3 rounded-full bg-[#5688c7] animate-pulse block" />
        )}
        {isUpcoming && (
          <span className="w-3 h-3 rounded-full border border-neutral-600 block" />
        )}
      </div>

      {/* Deliverable number */}
      <span
        className={`font-mono text-xs tracking-widest w-6 flex-shrink-0 ${
          isComplete ? "text-[#63a375]" : isActive ? "text-[#5688c7]" : "text-neutral-500"
        }`}
      >
        {String(milestone.id).padStart(2, "0")}
      </span>

      {/* Title */}
      <span
        className={`text-sm flex-1 ${
          isComplete
            ? "text-[#f6f7eb]"
            : isActive
            ? "text-white font-medium"
            : "text-neutral-400"
        }`}
      >
        {milestone.title}
      </span>

      {/* Date */}
      {!compact && (
        <span className={`font-mono text-xs ml-auto ${
          isComplete ? "text-[#63a375]" : isActive ? "text-[#5688c7]" : "text-neutral-500"
        }`}>
          {milestone.date}
        </span>
      )}

      {/* Active badge */}
      {isActive && !compact && (
        <span className="text-[10px] font-mono tracking-widest uppercase text-[#5688c7] border border-[#5688c7]/40 px-2 py-0.5">
          Active
        </span>
      )}
    </div>
  );
}

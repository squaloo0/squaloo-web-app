interface PillarCardProps {
  title: string;
  proficiency: string;
  level: number;
  maxLevel: number;
  keywords: string[];
}

export default function PillarCard({ title, proficiency, level, maxLevel, keywords }: PillarCardProps) {
  const pips = Array.from({ length: maxLevel }, (_, i) => i < level);

  return (
    <div className="border border-neutral-800 p-6 flex flex-col gap-4 hover:border-neutral-600 transition-colors duration-200">
      {/* Level pips */}
      <div className="flex gap-1.5">
        {pips.map((filled, i) => (
          <div
            key={i}
            className={`h-1 w-6 ${filled ? "bg-white" : "bg-neutral-800"}`}
          />
        ))}
      </div>

      {/* Title */}
      <div>
        <h3 className="text-white text-sm font-medium tracking-wide leading-snug">
          {title}
        </h3>
        <p className="text-neutral-600 text-xs mt-1 font-mono tracking-widest uppercase">
          {proficiency}
        </p>
      </div>

      {/* Keywords */}
      <div className="flex flex-wrap gap-1.5 mt-auto">
        {keywords.map((kw) => (
          <span
            key={kw}
            className="text-neutral-500 text-xs border border-neutral-800 px-2 py-0.5 font-mono"
          >
            {kw}
          </span>
        ))}
      </div>
    </div>
  );
}

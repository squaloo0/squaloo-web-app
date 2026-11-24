/**
 * Marshal's own mark (SQU-461): a dragonfly drawn by filling eleven petals of
 * the flower of life, all radiating from the centre: one for the head, two for
 * the tail, and two for each of the four wings.
 *
 * The geometry is copied from the founder's SVGs (public/brand/marshal/, which
 * keep the original files). `full` is the complete figure: the 19-circle
 * lattice (`.mk-lattice`), the outer ring (`.mk-ring-outer`), a tighter ring
 * that starts hidden (`.mk-ring-inner`), and the dragonfly (`.mk-dragonfly`).
 * `compact` is the header version: the tight ring and the dragonfly only, in
 * the same coordinates, so the intro can land one on the other.
 *
 * It is inline SVG rather than an <img> because the intro animates the parts
 * separately, by class name. No hooks, so it renders on the server.
 */
const LATTICE: readonly (readonly [number, number])[] = [
  [0, 0],
  [-86.6, 50],
  [0, 100],
  [86.6, 50],
  [86.6, -50],
  [0, -100],
  [-86.6, -50],
  [-86.6, 150],
  [86.6, 150],
  [173.21, 0],
  [86.6, -150],
  [-86.6, -150],
  [-173.21, 0],
  [-173.21, 100],
  [0, 200],
  [173.21, 100],
  [173.21, -100],
  [0, -200],
  [-173.21, -100],
];

const DRAGONFLY_D =
  "M0 -100A100 100 0 0 1 0 0A100 100 0 0 1 0 -100ZM0 0A100 100 0 0 1 0 100A100 100 0 0 1 0 0ZM0 100A100 100 0 0 1 0 200A100 100 0 0 1 0 100ZM0 0A100 100 0 0 1 86.6 -50A100 100 0 0 1 0 0ZM86.6 -50A100 100 0 0 1 173.21 -100A100 100 0 0 1 86.6 -50ZM0 0A100 100 0 0 1 -86.6 -50A100 100 0 0 1 0 0ZM-86.6 -50A100 100 0 0 1 -173.21 -100A100 100 0 0 1 -86.6 -50ZM0 0A100 100 0 0 1 86.6 50A100 100 0 0 1 0 0ZM86.6 50A100 100 0 0 1 173.21 100A100 100 0 0 1 86.6 50ZM0 0A100 100 0 0 1 -86.6 50A100 100 0 0 1 0 0ZM-86.6 50A100 100 0 0 1 -173.21 100A100 100 0 0 1 -86.6 50Z";

export type MarkProps = {
  variant?: "full" | "compact";
  ground?: "paper" | "ink";
  className?: string;
  title?: string;
  /** True when the mark sits beside its own text label and needs no name of its own. */
  decorative?: boolean;
};

export default function Mark({
  variant = "compact",
  ground = "paper",
  className = "",
  title = "Dragonfly in the flower of life",
  decorative = false,
}: MarkProps) {
  const line = ground === "paper" ? "#191308" : "#f7f3e8";
  const fill = ground === "paper" ? "#0a369d" : "#edcd1d";
  const full = variant === "full";
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={full ? "-310 -310 620 620" : "-240 -240 480 480"}
      className={className}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : title}
      focusable="false"
    >
      {full && (
        <g className="mk-lattice" fill="none" stroke={line} strokeWidth={2.2}>
          {LATTICE.map(([cx, cy]) => (
            <circle key={`${cx},${cy}`} cx={cx} cy={cy} r={100} />
          ))}
        </g>
      )}
      {full && <circle className="mk-ring-outer" cx={0} cy={0} r={300} fill="none" stroke={line} strokeWidth={5} />}
      <circle
        className="mk-ring-inner"
        cx={0}
        cy={0}
        r={232}
        fill="none"
        stroke={line}
        strokeWidth={12}
        opacity={full ? 0 : 1}
      />
      <path className="mk-dragonfly" d={DRAGONFLY_D} fill={fill} />
    </svg>
  );
}

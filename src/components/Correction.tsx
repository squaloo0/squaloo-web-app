// A published claim we withdrew, kept on the page rather than deleted (SQU-272).
//
// The original stays visible and struck through, with the date it was
// withdrawn and the evidence that falsified it beside it. Deleting a wrong
// claim is the cheaper edit and teaches the reader nothing; the correction
// in the record is the part worth trusting.

import type { ReactNode } from "react";

export const AMBER = "#d98c5f";

export function Struck({ children }: { children: ReactNode }) {
  return (
    <s className="text-neutral-500 decoration-1" style={{ textDecorationColor: AMBER }}>
      {children}
    </s>
  );
}

export function Withdrawn({ on, children }: { on: string; children: ReactNode }) {
  return (
    <span>
      <span className="font-mono text-xs uppercase tracking-wider" style={{ color: AMBER }}>
        Withdrawn {on}:
      </span>{" "}
      {children}
    </span>
  );
}

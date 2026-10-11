"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** While a coin is in flight, re-render the server page every few seconds. Nothing else. */
export default function Poller({ active, everyMs = 4000 }: { active: boolean; everyMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => router.refresh(), everyMs);
    return () => clearInterval(t);
  }, [active, everyMs, router]);
  return null;
}

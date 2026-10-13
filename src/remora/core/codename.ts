/**
 * What a machine is called in public. The database and the hatch know hostnames; the
 * tape, the panel and the receipt know code names. Small fish with big reputations,
 * because the mini is small and hits hard.
 *
 * Known names are pinned; anything else gets a creature from the list by hash, so a
 * hostname never reaches a customer's screen. Pure.
 */
import { createHash } from "node:crypto";

const PINNED: Record<string, string> = {
  "mac-mini": "mantis", // mantis shrimp: fist like a .22, lives in a hole
  mini: "mantis",
  "fly-sjc": "lantern", // lanternfish: deep, always lit, never sleeps
  fly: "lantern",
  air: "minnow",
  "macbook-air": "minnow",
};

const SCHOOL = ["pilot", "wrasse", "goby", "krill", "sprat", "anchovy", "limpet", "barnacle", "blenny", "guppy", "tetra", "dace"];

export function codeName(machine: string | null | undefined): string | null {
  if (!machine) return null;
  const key = machine.trim().toLowerCase();
  if (key in PINNED) return PINNED[key];
  // "fly-ord", "fly-sjc-2" and the like are all the cloud box's kin.
  if (key.startsWith("fly")) return "lantern";
  const n = createHash("sha256").update(key).digest()[0] % SCHOOL.length;
  return SCHOOL[n];
}

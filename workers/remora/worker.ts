/**
 * The machine. Phase 3 wires it to the queue; Phase 0 just proves it can be started,
 * ticks, and stops cleanly, which is what a container healthcheck will ask of it.
 */
export {}; // top-level await needs a module

const TICK_MS = Number(process.env.REMORA_TICK_MS ?? 5000);

let running = true;
for (const sig of ["SIGINT", "SIGTERM"] as const) {
  process.on(sig, () => {
    console.log(`remora worker: ${sig}, finishing tick`);
    running = false;
  });
}

console.log(`remora worker: plugged in (tick ${TICK_MS}ms)`);
while (running) {
  // Phase 3: claimNextJob() → run slot → upload → receipt. For now: a heartbeat.
  console.log(`remora worker: tick ${new Date().toISOString()}`);
  await new Promise((r) => setTimeout(r, TICK_MS));
}
console.log("remora worker: unplugged");

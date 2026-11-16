/**
 * The four asks, word for word from the Meridian deck's ask slide (v2 PDF,
 * 2026-11-06, slide 06). The deck family is cut from one baseline (founder,
 * 2026-11-09): a sentence changes in the deck first, then here. Re-read
 * against the final deck PDF when it lands in public/meridian/.
 */
export type Ask = {
  n: string;
  label: string;
  head: string;
  body: string;
  action: string;
  subject: string;
};

export const ASKS: readonly Ask[] = [
  {
    n: "01",
    label: "An introduction",
    head: "Anyone who runs plant or facility maintenance in Southern California.",
    body: "Aerospace suppliers, heat-treat shops, ammonia engine rooms, cold storage: a maintenance lead, a plant manager, a compliance officer.",
    action: "Introduce someone",
    subject: "Introduction for Squaloo",
  },
  {
    n: "02",
    label: "A design partner",
    head: "One site for a 90-day study: one machine, two success criteria agreed up front.",
    body: "We bring the fleet and the engineer; the site keeps the hardware and the data. Published, misses included.",
    action: "Offer a site",
    subject: "A site for the 90-day study",
  },
  {
    n: "03",
    label: "Pre-seed and grants",
    head: "About $205K over ten months finishes the prototype, runs the study and publishes it.",
    body: "Grants in any amount move a line; the first $80K finishes the build and hires the engine engineer.",
    action: "Start the conversation",
    subject: "Pre-seed / grant conversation",
  },
  {
    n: "04",
    label: "Student talent",
    head: "A student engineer or designer who wants to build for a factory floor.",
    body: "Paid hours on the touchscreen, the voice gate and the technician onboarding card.",
    action: "Raise your hand",
    subject: "Building on the floor",
  },
];

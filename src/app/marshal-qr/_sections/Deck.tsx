import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { DECK_FILE } from "../_data/meridian";
import { humanSize } from "../_lib/meridian";
import { WRAP, H2, ACTION, Eyebrow } from "./ui";

/**
 * Read at BUILD time (the page is static), so the size shown is the size of
 * the file that ships. No file, no section: a download link to nothing is the
 * thing this page refuses.
 */
function deckOnDisk(): { href: string; size: string } | null {
  const p = join(process.cwd(), "public", "meridian", DECK_FILE);
  if (!existsSync(p)) return null;
  return { href: `/meridian/${DECK_FILE}`, size: humanSize(statSync(p).size) };
}

export default function Deck() {
  const deck = deckOnDisk();
  if (!deck) return null;
  return (
    <section id="deck" className={`${WRAP} flex flex-col gap-5 pb-16`}>
      <Eyebrow>The deck</Eyebrow>
      <h2 className={H2}>The slides from the stage.</h2>
      <div>
        <a href={deck.href} className={ACTION} download>
          Download the deck · PDF, {deck.size}
        </a>
      </div>
    </section>
  );
}

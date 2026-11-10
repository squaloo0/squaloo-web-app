import Link from "next/link";
import { WRAP, H2, Eyebrow } from "./ui";

/**
 * The board's story, in three sentences, from the 2024 post it links
 * (/marshal-qr/blog/go-board-to-grad-school). No photo slot until a photo
 * exists: an empty frame reads as broken.
 */
export default function Board() {
  return (
    <section id="board" className={`${WRAP} flex flex-col gap-5 py-16`}>
      <Eyebrow>The board</Eyebrow>
      <h2 className={H2}>A QR code you can pick up.</h2>
      <div className="flex max-w-[760px] flex-col gap-4 text-lg leading-[1.6] text-sq-ink-muted">
        <p className="m-0">
          In 2024, applying to the USC Iovine and Young Academy, I built a working QR code on a hand-made go board: a
          25 × 25 grid, with the pieces as the bits.
        </p>
        <p className="m-0">
          The error correction is Reed–Solomon, worked out in Python first, because placing the bits by hand from
          printed strings would have taken days.
        </p>
        <p className="m-0">It’s a version 2 code with error correction M, and it’s how you got here.</p>
      </div>
      <div>
        <Link href="/marshal-qr/blog/go-board-to-grad-school" className="inline-flex min-h-11 items-center font-semibold text-solomon-blue underline underline-offset-4">
          The whole story, from 2024 →
        </Link>
      </div>
    </section>
  );
}

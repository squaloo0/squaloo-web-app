# Squaloo

**Intelligence you own, and can verify.**

Squaloo builds sovereign, verifiable AI for the people who keep the world running and the people building what comes next. This is v0.1 of the house's visual and verbal system, drawn from the founder's brand ethos board (Oct 2026), the kit palette, and the language work ratified on 2026-10-27. It governs the company surfaces (squaloo.com, the deck, documents) and sets the frame the product surfaces (Solomon) inherit.

## 1. What the brand is

The brand is the method. Every Squaloo cell manufactures **records**: a claim with its check, its instrument, its date and its evidence attached. The visual language exists to make that habit legible. Four ideas sit under everything:

- **The mark is a spiral.** A hand-drawn coil, not a geometric one. It is the cable coiled on the shop floor, the line a hand draws when it is thinking, and the curiosity that keeps turning inward until it finds the pattern. It is the only place the red lives.
- **The pattern is the proof.** Islamic geometric art builds overwhelming beauty from a few exact rules: a compass, a straightedge, a grid. Pragmatism and beauty together, which is to say: safety. That is Solomon's ethos, and it is why an AI company finds itself coming full circle to the era of the House of Wisdom, the culture that gave us the word *algorithm* (from al-Khwarizmi) and *algebra* (from his book). Our patterns are always *drawn as lines*, like light through a carved screen, never filled like wallpaper, and they are lattices and tilings, never stars or emblems: a lattice reads as a rule, a star reads as a symbol.
- **Ask scales to task; edge scales to cloud.** Today Solomon gives a verified answer at the machine. The same layer that makes an answer verifiable is the layer that will let an agent act on the floor: a verified task, with the same receipts. And making a small model behave offline on a $100 body is the hard case; the discipline of binding a model to provenance carries up to large models in the cloud. Every design decision should still make sense when the thing on the screen is an action, not a sentence.
- **Custody is the product.** Model-agnostic by rule: any model that passes the ruler on the body, unmodified, is admissible. The customer keeps every word and every reading in a Brain they hold; Squaloo keeps only the measurement, content stripped. What we learn as orchestrators of that measurement, across sites and models, is how sovereignty and safety get built in an AI future nobody can yet see.

## 2. Two registers, one family

Squaloo is warm, made by hand, on paper, in ink. Solomon is a datasheet on ink, and its color is the blue.

| | Squaloo, the house | Solomon, the product |
|---|---|---|
| Ground | `ground` paper | `ground` ink (Solomon theme) |
| Primary | `ink`: eyebrows, links, buttons, the spiral beside the wordmark | `solomon-blue`: the highlighted word (paper text on a blue pill), the CTA, slabs, the doorway |
| Accents | `sun` (own) and `sky` (verify) as fills behind ink text; `green` as a card edge | none besides the blue; `green` only as the ok dot |
| Headline | EB Garamond 500, one word highlighted | IBM Plex Mono 500, one word on a blue pill |
| Body | Hanken Grotesk | Hanken Grotesk, `ink-muted` |
| Cards | `card`, `radius-md`, `stroke-accent` top edge | `card`, `radius-sm`, `hairline` in `rule` |
| Pattern | jali band in `ink` on paper, low opacity | jali or strapwork in `on-solomon-blue` on a blue slab, or in paper on ink at low opacity |
| Mark | spiral in `ink` or `spiral-red` beside the wordmark | spiral in paper, small, as the maker's mark: "by Squaloo" |

**Wherever the blue appears, it means Solomon.** On the house it marks the doorway and the product's name. On the product it is the only highlight. Nothing else on either surface is blue.

## 3. Color rules that name tokens

- Never a pure white or black. The house sits on `ground` paper with `ink`; the product on `ground` ink (Solomon theme) with paper text.
- `solomon-blue` is a fill on ink (a pill, a button, a slab); it passes as text only on paper. A highlighted word on a Solomon surface is paper text on a blue pill, never blue text on ink.
- `sun` and `sky` are the house's fills behind ink text, one per headline, both only when the line is the vision itself (*own* in sun, *verify* in sky). They never appear on a Solomon surface.
- `spiral-red` appears only in the mark.
- **Never borrow a safety color.** ANSI Z535 gives red to DANGER, orange to WARNING, yellow to CAUTION. States use `state-ok` (dot), `state-warn` (triangle, in ink), `state-refused` (blue square), `state-unknown` (dashed), each with its word. Color never says it alone.

## 4. Type

- **EB Garamond** (`display`): the wordmark, display headlines, the long sentence after a claim, a quoted veteran in italic. The painting on the wall of the room: academic, warm, unhurried.
- **Hanken Grotesk** (`sans`): body, pills, h2 and h3 at 800. The voice that says the claim plainly.
- **IBM Plex Mono** (`mono`): anything that is a record (eyebrows, sources, dates, stamps, tables) and every Solomon headline. If it could be printed on a calibration sticker, it is mono.

## 5. Geometry

Three families, each generated from a rule; `geometry.md` has the construction and the placement table.

- **Jali**: a lattice of circles with a small diamond at each center, after the carved screens the light comes through. Bands and panels. The workhorse.
- **Strapwork**: the octagon-and-square tiling, after the zellige of Fez. Denser; the Solomon doorway and the /solomon hero.
- **Radial**: rings of rhombi widening from an octagon, after the muqarnas ceiling. Once per sequence, at the end.

Rules: lines at `stroke-pattern`, never fills; one pattern per surface; a pattern never crosses text; generate, don't stretch. The section marker is a small octagon tile (`tile`), never a star. The arch (`radius-arch`) is the one figurative shape, used once per page where the house opens onto the product.

## 6. Imagery

Textured tiles built from the palette are the image system. Real photographs only of places we have been and people who consented. The reference artworks on the ethos board inform qualities (the hand-drawn line, crowded color, bodies in motion, patterned light) and are never reproduced. No glossy renders, no space, no orbit graphics. Solomon works in rooms with concrete floors.

## 7. States and records

Five first-class states, rendered as word + shape + color: **ok** (filled dot), **warn** (triangle, in ink), **refused** (blue square), **could not check** (dashed circle), **not measured** (dash). Absence is drawn, never left blank. Every number travels with its body, date and N; a figure without its boundary is not a number.

## 8. Voice

Say it the way a veteran would at the vessel door, and the way an auditor would accept. Own: *what it checked, yours, at the machine, before you touch it, the veteran's log, the fix that never made the manual, says when it doesn't know, names who to ask, dated, custody, misses included, ask scales to task.* The vision line is *Intelligence you own, and can verify*; *verify* is the word, *check* is what the engine does to earn it (*what it checked*). Italics are always set at weight 600 so they read at distance. Define on first use: *sovereign* (it runs on hardware you own, and what you know stays in your custody), *verifiable* (every answer shows what it checked, and the measurements can be re-run), *model-agnostic* (any model that passes the ruler on the body, unmodified). Retire: *shows its work, tribal knowledge, Competency Collapse, AI-powered, revolutionize,* and any figure without a source and date.

## 9. Assets

- **Marks**: the spiral in ink, red, paper and blue. Minimum size 24px. Clear space equal to the coil's inner ring. Never filled, never rotated, never a pattern.
- **Patterns**: `jali-band` (1920×96, ink or paper lines), `jali-panel` (560×1080, paper or ink lines), `octsq-panel` (560×1080, paper lines, for a blue slab), `octsq-band` (1920×96, ink lines), `radial-arcs` (800×800, paper lines), `tile` (the 40px octagon section marker in ink, paper or blue). Each is generated; ask for a new size rather than stretching one.

# Geometry: the pattern system

The founder's board put a muqarnas ceiling, a tiled fountain, a carved screen, a page on how girih patterns are constructed, the Hassan II door and the arcade at golden hour next to a factory floor and a garage. The link is the method: a few rules, applied exactly, produce something a person can check by eye, and something that is beautiful because it is pragmatic. That is the sense in which the geometry feels *safe*, and it is the sense in which Solomon is built. Whoever first wrote down an algorithm did it in this culture; we are not the first to find that exact rules and beauty are the same project.

One rule above the others: **lattices and tilings, never stars.** A star reads as an emblem, and emblems get read politically. A lattice reads as a rule.

## Three families

**Jali.** A square lattice of circles, each with a small diamond at its center, after the turned-wood and carved-stone screens that throw patterned light on a floor. The workhorse: a `space-7`-tall band under a nav or at a slide's edge, a side panel on a cover, a faint field behind a stat. Assets: `jali-band-ink`, `jali-band-paper`, `jali-panel-paper`, `jali-panel-ink`.

**Strapwork.** The octagon-and-square tiling (4.8.8), after the zellige of Fez and Marrakesh. Denser, and it needs a colored ground: the Solomon doorway on the house, the /solomon hero field, a document's end-paper. Assets: `octsq-panel-paper` (for a blue slab), `octsq-band-ink`.

**Radial.** Rings of rhombi widening from an octagon, the sun at the center of a ceiling. One per sequence, at the end: the closing slide, the last section of a page, the back of a card. Asset: `radial-arcs-paper`.

## Where a pattern goes

| Surface | Pattern | Color | Opacity |
|---|---|---|---|
| Deck cover, right slab (ink) | jali panel | paper | 0.8 |
| /solomon hero and Ask→Task band | strapwork panel | paper | 0.14–0.18 |
| Deck closing slide (ink) | radial, pinned right | paper | 0.4 |
| Dark product slide, top edge | jali band | paper | 0.2 |
| squaloo.com, under the nav | jali band | `ink` | 0.2 |
| squaloo.com, the doorway arch (Solomon blue) | strapwork | `on-solomon-blue` | 0.35 |
| /solomon hero, right half, fading | strapwork | paper | 0.14 |
| Section marker | `tile` octagon before the eyebrow | `ink` on paper, paper on ink | 1 |

## Rules

1. Lines, never fills. Stroke at `stroke-pattern` (2.5px at 1x). The pattern is light through a screen, not wallpaper.
2. One pattern per surface. A second one is noise.
3. A pattern never crosses text. Leave `space-6` between the last line of a pattern and the first line of copy.
4. Generate, don't stretch. Each asset is drawn at its size from a rule; ask for a new size and it is regenerated with the same pitch.
5. The arch is the one figurative shape: `radius-arch` on a tall panel, once per page, where the company opens onto the product. Everything else is a circle, a polygon or a rule.
6. The spiral is not a pattern. It appears once, as the mark.
7. No stars, no crescents, no calligraphy. The tradition is honored by its method, not by its emblems.

## The construction, for anyone regenerating

- Jali: pitch `p` (48px for a band, 56px for a panel); at every cell center a circle of radius `0.38 p` and a diamond of half-diagonal `0.1 p`.
- Strapwork: regular octagon of edge `a` (24px band, 30px panel) at every point of a square grid with pitch `a(1+√2)`; the squares appear in the gaps. Outlines only.
- Radial: ring `k` has `8k` rhombi between radii `44k` and `44(k+1)`, each pointing along the ring's mid-angle; a regular octagon of radius 40 at the center.

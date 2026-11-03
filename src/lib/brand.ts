/**
 * The kit's generated linework and marks, imported straight from brand/kit so
 * the site never holds a second copy that could drift from the kit. Next
 * fingerprints each file at build time; use `.src` as an <img> source.
 *
 * Rules that travel with these (brand/kit/geometry.md): lines, never fills;
 * one pattern per surface; a pattern never crosses text; generate, don't
 * stretch; the spiral is the mark, never a pattern.
 */
import spiralInk from "../../brand/kit/assets/marks/spiral-mark-ink.svg";
import spiralPaper from "../../brand/kit/assets/marks/spiral-mark-paper.svg";
import jaliBandInk from "../../brand/kit/assets/patterns/jali-band-ink.svg";
import octsqPanelPaper from "../../brand/kit/assets/patterns/octsq-panel-paper.svg";
import radialArcsPaper from "../../brand/kit/assets/patterns/radial-arcs-paper.svg";
import tileInk from "../../brand/kit/assets/patterns/tile-ink.svg";
import tilePaper from "../../brand/kit/assets/patterns/tile-paper.svg";

type Asset = { src: string };
const src = (a: Asset | string): string => (typeof a === "string" ? a : a.src);

export const brand = {
  spiralInk: src(spiralInk),
  spiralPaper: src(spiralPaper),
  jaliBandInk: src(jaliBandInk),
  octsqPanelPaper: src(octsqPanelPaper),
  radialArcsPaper: src(radialArcsPaper),
  tileInk: src(tileInk),
  tilePaper: src(tilePaper),
} as const;

/** Where the house lives. Absolute, because on solomon-os.ai "/" is the product. */
export const HOUSE_URL = "https://squaloo.com";

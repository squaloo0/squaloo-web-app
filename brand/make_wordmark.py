"""Generate the Squaloo site wordmark: public/brand/wordmark{,-light}.svg.

Source of truth for the design: solomon-os PR #237
(communications/brand/solomon_wordmark.html), the Mattermost login lockup.
This reuses its tokens exactly: Mulish 800, letter-spacing -0.03em, and an
accent-blue full stop (#5688c7). The word is "Squaloo", the company, because
the site nav and every back-link name the company. #237's "Solomon." is the
product mark and is not reused here.

Text is converted to outlines, so the SVGs need no font at runtime. A webfont
cannot load inside an <img>-embedded SVG anyway, and the site must not fetch
fonts from inside an image.

Regenerate (build-time network only, to fetch the OFL font):

    python3 -m venv .venv && .venv/bin/pip install fonttools uharfbuzz
    curl -sSfLo Mulish.ttf "https://github.com/google/fonts/raw/main/ofl/mulish/Mulish%5Bwght%5D.ttf"
    .venv/bin/python brand/make_wordmark.py Mulish.ttf public/brand

Font used for the committed SVGs: Mulish[wght].ttf, sha256
00f1105796291a2fdda117a0fc7f25d8e68f8010cdbb34a411f60b3bd57717ac (2026-09-30).
"""

import sys
from pathlib import Path

import uharfbuzz as hb
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

WORD = "Squaloo"
DOT = "."
WEIGHT = 800
TRACKING_EM = -0.03  # #237: letter-spacing:-0.03em
ACCENT = "#5688c7"  # #237 accent, = --accent-secondary in globals.css
VARIANTS = {
    "wordmark.svg": "#ffffff",  # dark surfaces (site nav, #08090a)
    "wordmark-light.svg": "#111827",  # light surfaces (shop header, = text-gray-900)
}
PAD = 0.02  # of the em, around the ink box


def shape(font_bytes: bytes, text: str):
    face = hb.Face(font_bytes)
    font = hb.Font(face)
    font.set_variations({"wght": WEIGHT})
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(font, buf, {"kern": True, "liga": True})
    return buf.glyph_infos, buf.glyph_positions, face.upem


def main(font_path: str, out_dir: str) -> None:
    raw = Path(font_path).read_bytes()
    tt = instantiateVariableFont(TTFont(font_path), {"wght": WEIGHT})
    glyph_set = tt.getGlyphSet()
    order = tt.getGlyphOrder()

    infos, positions, upem = shape(raw, WORD + DOT)
    tracking = TRACKING_EM * upem

    # CSS letter-spacing is added after every character, including the last,
    # but the trailing space is outside the ink so it does not change the box.
    pieces, x = [], 0.0
    for i, (info, pos) in enumerate(zip(infos, positions)):
        pen = SVGPathPen(glyph_set, ntos=lambda v: f"{v:.1f}".rstrip("0").rstrip("."))
        glyph_set[order[info.codepoint]].draw(
            TransformPen(pen, (1, 0, 0, -1, x + pos.x_offset, -pos.y_offset))
        )
        is_dot = i == len(infos) - 1
        pieces.append((pen.getCommands(), is_dot))
        x += pos.x_advance + tracking

    # viewBox = the real ink box, measured, plus a small pad.
    bp = BoundsPen(glyph_set)
    x = 0.0
    for info, pos in zip(infos, positions):
        glyph_set[order[info.codepoint]].draw(
            TransformPen(bp, (1, 0, 0, -1, x + pos.x_offset, -pos.y_offset))
        )
        x += pos.x_advance + tracking
    xmin, ymin, xmax, ymax = bp.bounds
    pad = PAD * upem
    vb = (xmin - pad, ymin - pad, (xmax - xmin) + 2 * pad, (ymax - ymin) + 2 * pad)

    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    for name, ink in VARIANTS.items():
        word = "".join(d for d, dot in pieces if not dot)
        dot = "".join(d for d, dot in pieces if dot)
        svg = (
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb[0]:.0f} {vb[1]:.0f} {vb[2]:.0f} {vb[3]:.0f}" '
            f'role="img" aria-label="Squaloo">'
            f"<title>Squaloo</title>"
            f'<path fill="{ink}" d="{word}"/>'
            f'<path fill="{ACCENT}" d="{dot}"/>'
            f"</svg>\n"
        )
        (out / name).write_text(svg)
        print(f"{out / name}: {len(svg)} bytes, viewBox {vb[2]:.0f}x{vb[3]:.0f}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])

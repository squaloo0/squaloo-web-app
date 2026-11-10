/**
 * The unfurl for /marshal-qr (LinkedIn, iMessage): paper ground, the spiral
 * mark, the hero line. Built once at build time from the kit's own SVG; no
 * font is fetched (Satori's built-in face), so the build makes no request.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "You scanned a go board. Squaloo at Meridian, November 14.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const svg = readFileSync(join(process.cwd(), "brand", "kit", "assets", "marks", "spiral-mark-ink.svg"));
  const mark = `data:image/svg+xml;base64,${svg.toString("base64")}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f7f3e8",
          color: "#191308",
          padding: "72px 80px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <img src={mark} width={96} height={96} alt="" />
          <div style={{ fontSize: 64, fontWeight: 600 }}>Squaloo</div>
        </div>
        <div style={{ fontSize: 88, lineHeight: 1.05, fontWeight: 500 }}>You scanned a go board.</div>
        <div style={{ fontSize: 30, letterSpacing: 4, textTransform: "uppercase", color: "#5a544a" }}>
          Squaloo · Meridian · Nov 14
        </div>
      </div>
    ),
    size,
  );
}

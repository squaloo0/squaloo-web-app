/**
 * The unfurl for /marshal/[slug] (SQU-461): paper ground, the compact
 * dragonfly, the entry's number and title. Built at build time for each static
 * param; no font or remote image is fetched.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { WORK } from "../_data/work";

export const alt = "Marshal Aldoph · Portfolio entry";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return WORK.filter((w) => w.page).map((w) => ({ slug: w.slug }));
}

export default async function OpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = WORK.find((w) => w.slug === slug);
  const svg = readFileSync(join(process.cwd(), "public", "brand", "marshal", "dragonfly.svg"));
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
          <div style={{ fontSize: 30, letterSpacing: 4, textTransform: "uppercase", color: "#5a544a" }}>
            {`#${entry?.number ?? ""} · Marshal Aldoph`}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 96, lineHeight: 1.02, fontWeight: 500 }}>{entry?.title ?? "Portfolio"}</div>
          <div style={{ fontSize: 38, lineHeight: 1.25, color: "#3d382f" }}>
            {`${entry?.context ?? ""} · ${entry?.term ?? ""}`}
          </div>
        </div>
        <div style={{ fontSize: 28, letterSpacing: 2, color: "#5a544a" }}>{`squaloo.com/marshal/${slug}`}</div>
      </div>
    ),
    size,
  );
}

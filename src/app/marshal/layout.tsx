/**
 * /marshal segment layout (SQU-461): the stylesheet for the mark and its
 * intro, the compact mark as this segment's favicon, and the site base for
 * canonical URLs. The root layout's metadata still supplies the default title.
 */
import type { Metadata } from "next";
import { HOUSE_URL, brand } from "@/lib/brand";
import "./marshal.css";

export const metadata: Metadata = {
  metadataBase: new URL(HOUSE_URL),
  icons: { icon: [{ url: brand.dragonfly, type: "image/svg+xml" }] },
};

export default function MarshalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

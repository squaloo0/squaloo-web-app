import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Amak Studios — Sovereign AI for the Physical World",
  description:
    "A venture studio building offline-first, sovereign AI operating systems for the New Collar workforce.",
};

export default function AmakStudiosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

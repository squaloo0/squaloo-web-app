import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Amak — Sovereign AI for the New Collar Generation",
  description:
    "Amak is creating the decentralized, gamified bridge between the physical world and the future of AI — Squaloo's first venture.",
};

export default function AmakStudiosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

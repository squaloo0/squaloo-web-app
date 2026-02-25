import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Marshal Aldoph — The Architect",
  description:
    "Technical Founder and Systems Architect bridging enterprise data automation with cutting-edge AI research.",
};

export default function MarshalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

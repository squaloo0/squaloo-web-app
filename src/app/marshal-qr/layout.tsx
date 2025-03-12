import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "Marshal Aldoph | Portfolio",
  description: "Design Engineer & Developer Portfolio",
};

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}

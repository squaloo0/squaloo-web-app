import type { Metadata } from "next";
import "./styles.css";
import AppFooter from "@/components/AppFooter";

export const metadata: Metadata = {
  title: "Marshal-QR — The QR Matrix | Squaloo",
  description: "A Version 2 QR code built from first principles using a go board as the physical matrix.",
};

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <main className="container mx-auto px-4 py-8 flex-1">
        {children}
      </main>
      <AppFooter />
    </div>
  );
}

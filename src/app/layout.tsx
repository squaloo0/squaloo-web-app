import type { Metadata } from "next";
import { Mulish, Roboto_Mono } from "next/font/google";
import "./globals.css";

const mulish = Mulish({
  variable: "--font-mulish",
  subsets: ["latin"],
  display: "swap",
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Squaloo — Solomon, the trust and verification layer for edge AI",
  description:
    "Squaloo builds Solomon — the trust and verification layer for edge and agentic AI. We aim it at industrial operations, where custody and verification are legally required and still unsolved.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${mulish.variable} ${robotoMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

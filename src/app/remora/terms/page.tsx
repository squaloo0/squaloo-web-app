import Link from "next/link";
import AppFooter from "@/components/AppFooter";
import Wordmark from "@/components/Wordmark";
import { feeCents, SLEEVES } from "@/remora/core/coins";

export const metadata = {
  title: "Remora — terms",
  description: "What a coin is, what you get, what we keep, and what we don't.",
  robots: { index: false, follow: false },
};

export default function RemoraTermsPage() {
  return (
    <div className="min-h-screen bg-[#08090a] text-white font-mono flex flex-col">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-900 bg-black/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-8 h-14 flex items-center justify-between">
          <Link href="/remora" className="group inline-flex items-center gap-1.5 text-neutral-600 text-xs tracking-widest uppercase hover:text-white transition-colors">
            ← <Wordmark className="h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" /> <span className="ml-2">Remora</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-8 pt-36 pb-24 flex-1 w-full text-sm leading-relaxed">
        <div className="text-xs tracking-[0.3em] text-neutral-500 uppercase mb-2">Remora · Terms</div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-8">Plain language</h1>

        <Section head="What a coin is">
          One coin is one vend: you paste a URL, pick a slot, and the machine fetches that video and hands you a file plus a
          signed receipt. A transcript costs two coins, because the machine listens to the whole recording at about the
          speed it was spoken and vends nothing else meanwhile; the slot says its price before you vend. Coins are sold in sleeves because the card processor takes a cut per charge, and a one-dollar coin
          would lose a third of itself to it.
        </Section>

        <div className="my-6 border border-neutral-800">
          <table className="w-full text-xs">
            <thead className="text-neutral-500 text-[10px] tracking-[0.2em] uppercase">
              <tr>
                <th className="text-left px-4 py-2 font-normal">Sleeve</th>
                <th className="text-right px-4 py-2 font-normal">Price</th>
                <th className="text-right px-4 py-2 font-normal">Processor fee</th>
                <th className="text-right px-4 py-2 font-normal">Per coin</th>
              </tr>
            </thead>
            <tbody className="text-neutral-300">
              {SLEEVES.map((s) => (
                <tr key={s.coins} className="border-t border-neutral-900">
                  <td className="px-4 py-2">{s.coins} coins</td>
                  <td className="px-4 py-2 text-right">${(s.cents / 100).toFixed(2)}</td>
                  <td className="px-4 py-2 text-right text-neutral-500">${(feeCents(s.cents) / 100).toFixed(2)}</td>
                  <td className="px-4 py-2 text-right">${(s.cents / s.coins / 100).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Section head="The card">
          There is no account. When you take a card, the machine sets a cookie holding a long random code and that code is the
          card. The first coin is on the house. If you clear the cookie or change browsers, the card is gone from your side;
          the machine still has it, and if you bought coins, the email on your payment is how we would find it. Keep the
          cookie.
        </Section>

        <Section head="Coin return">
          If the machine cannot deliver (the video is private, gone, or the host turns us away for good), the coin goes back
          on your card automatically. A vend that delivered a file is final; there are no refunds on delivered vends. A cash
          refund of an unused sleeve is a founder decision, done by hand in the payment dashboard, and shows on your ledger.
        </Section>

        <Section head="What drops, and for how long">
          The file and its receipt sit on our storage for seven days, behind links that expire. After that they are deleted.
          The receipt is the product: what it was, where it came from, when, the SHA-256 of the bytes, which tools and which
          machine vended it, and the machine&apos;s Ed25519 signature over all of that. Anyone can check a receipt at{" "}
          <Link href="/remora/verify" className="text-[#5688c7] hover:text-white">
            /remora/verify
          </Link>
          .
        </Section>

        <Section head="What we log">
          The URL you paste, when, the quality you asked for, what happened, the hash of what dropped, and your card&apos;s
          handle. The payment processor holds your card details and your email; we store the email only to tie a card back
          to you. We do not run ads or trackers, and this page talks to nothing but squaloo.com and the processor&apos;s
          checkout.
        </Section>

        <Section head="Your rights to the video">
          The machine fetches what you point it at. You are responsible for having the right to copy it. We rate-limit to
          human scale, do not do bulk, and the receipt exists to prove that a thing existed at a URL at a time, which is the
          point of this product. We are not a downloader; we are a vending machine that sells proof.
        </Section>

        <Section head="Who we are">
          Remora is a side project of Squaloo. Payments are processed by Stripe under the Squaloo entity, and sales tax on
          digital goods is calculated at checkout where it applies. Questions go to the address on the Stripe receipt.
        </Section>

        <p className="mt-10 text-neutral-700 text-xs">Last changed 2026-10-11. The git history of this page is the changelog.</p>
      </main>

      <AppFooter />
    </div>
  );
}

function Section({ head, children }: { head: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-[10px] tracking-[0.3em] uppercase text-neutral-500 mb-2">{head}</h2>
      <p className="text-neutral-300">{children}</p>
    </section>
  );
}

import Link from "next/link";
import { createPublicKey } from "node:crypto";
import AppFooter from "@/components/AppFooter";
import Wordmark from "@/components/Wordmark";
import { keyIdOf, pemFromEnv } from "@/remora/core/receipt";
import { dbWired, sql } from "@/remora/db/client";
import VerifyForm from "./verify-form";

async function lookupHash(sha: string): Promise<{ at: string; bytes: number; provider: string } | null> {
  const rows = (await sql()`
    SELECT a.bytes, a.created_at, j.provider FROM remora_assets a JOIN remora_jobs j ON j.id = a.job_id
     WHERE a.sha256 = ${sha} AND a.kind IN ('video', 'audio', 'gif', 'thumbs', 'transcript', 'chapters') ORDER BY a.created_at LIMIT 1`) as
    { bytes: string | number; created_at: string | Date; provider: string }[];
  const r = rows[0];
  return r ? { at: new Date(r.created_at).toISOString(), bytes: Number(r.bytes), provider: r.provider } : null;
}

export const metadata = {
  title: "Remora — verify a receipt",
  description: "Check a Remora receipt's signature and whether the machine remembers the bytes.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function RemoraVerifyPage({ searchParams }: { searchParams: Promise<{ sha256?: string | string[] }> }) {
  const sp = await searchParams;
  const sha = Array.isArray(sp.sha256) ? sp.sha256[0] : sp.sha256;
  const byHash = sha && /^[0-9a-f]{64}$/i.test(sha) && dbWired() ? await lookupHash(sha.toLowerCase()) : null;
  const pem = pemFromEnv(process.env.REMORA_RECEIPT_PUBLIC_KEY);
  let keyId: string | null = null;
  try {
    keyId = pem ? keyIdOf(createPublicKey(pem)) : null;
  } catch {
    keyId = null;
  }

  return (
    <div className="min-h-screen bg-[#08090a] text-white font-mono flex flex-col">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-900 bg-black/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-8 h-14 flex items-center justify-between">
          <Link href="/remora" className="group inline-flex items-center gap-1.5 text-neutral-600 text-xs tracking-widest uppercase hover:text-white transition-colors">
            ← <Wordmark className="h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" /> <span className="ml-2">Remora</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-8 pt-36 pb-24 flex-1 w-full">
        <div className="text-xs tracking-[0.3em] text-neutral-500 uppercase mb-2">Remora · Verify</div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-3">Check a receipt</h1>
        <p className="text-neutral-500 text-sm leading-relaxed mb-8">
          Paste a <code className="text-neutral-400">.receipt.json</code>. The signature is checked against the machine&apos;s public key, and the
          hash is looked up in the shelf record. Nothing you paste leaves squaloo.com.
        </p>

        {sha ? (
          <div className={`mb-8 border px-4 py-3 ${byHash ? "border-[#63a375] text-[#63a375]" : "border-neutral-800 text-neutral-500"}`}>
            <div className="text-[10px] tracking-[0.3em] uppercase">{byHash ? "The machine remembers these bytes" : "No record of these bytes"}</div>
            <div className="text-xs text-neutral-400 mt-1 break-all">
              sha256 {sha}
              {byHash ? ` · ${byHash.provider} · ${byHash.bytes} B · shelved ${byHash.at.replace("T", " ").slice(0, 19)} UTC` : ""}
            </div>
          </div>
        ) : null}

        <VerifyForm />

        <div className="mt-10 border-t border-neutral-900 pt-6 text-xs text-neutral-600 leading-relaxed">
          <div className="text-[10px] tracking-[0.3em] uppercase text-neutral-500 mb-2">The machine&apos;s key</div>
          {pem ? (
            <>
              <div>
                Ed25519 · key id <span className="text-neutral-400">{keyId}</span> ·{" "}
                <a href="/api/remora/verify" className="text-[#5688c7] hover:text-white">
                  /api/remora/verify
                </a>{" "}
                serves it as PEM, so you can check receipts yourself with any Ed25519 library: the signed bytes are the
                receipt with <code>signature</code> set to null, serialised with two-space JSON and a trailing newline.
              </div>
              <pre className="mt-3 text-[10px] text-neutral-700 whitespace-pre-wrap break-all">{pem.trim()}</pre>
            </>
          ) : (
            <div>No public key on this deploy yet. Receipts vended here are unsigned until REMORA_RECEIPT_PUBLIC_KEY is set.</div>
          )}
        </div>
      </main>

      <AppFooter />
    </div>
  );
}

/**
 * GET  /api/remora/verify            the machine's public key (PEM) and its key id
 * POST /api/remora/verify            { receipt } → signature check + "did the machine vend these bytes?"
 *
 * Public. A receipt is proof only if anyone can check it without asking us nicely.
 */
import { NextResponse } from "next/server";
import { createPublicKey } from "node:crypto";
import { checkSignature, keyIdOf, parseReceipt, pemFromEnv, printReceipt } from "@/remora/core/receipt";
import { dbWired } from "@/remora/db/client";
import { sql } from "@/remora/db/client";

function publicKey(): { pem: string; keyId: string } | null {
  const pem = pemFromEnv(process.env.REMORA_RECEIPT_PUBLIC_KEY);
  if (!pem) return null;
  try {
    return { pem, keyId: keyIdOf(createPublicKey(pem)) };
  } catch {
    return null;
  }
}

export async function GET(req: Request): Promise<NextResponse> {
  const sha = new URL(req.url).searchParams.get("sha256");
  if (sha) {
    // A hash alone: did the machine vend these bytes? No title, no card, no URL in the answer.
    if (!/^[0-9a-f]{64}$/i.test(sha)) return NextResponse.json({ error: "not a sha256" }, { status: 400 });
    if (!dbWired()) return NextResponse.json({ error: "no queue wired on this deploy" }, { status: 503 });
    const rows = (await sql()`
      SELECT a.job_id, a.bytes, a.created_at, j.provider FROM remora_assets a JOIN remora_jobs j ON j.id = a.job_id
       WHERE a.sha256 = ${sha.toLowerCase()} AND a.kind IN ('video', 'audio', 'gif') ORDER BY a.created_at LIMIT 1`) as
      { job_id: string; bytes: string | number; created_at: string | Date; provider: string }[];
    const r = rows[0];
    return NextResponse.json(
      r ? { vended: { at: new Date(r.created_at).toISOString(), job: r.job_id, bytes: Number(r.bytes), provider: r.provider } } : { vended: null },
      { headers: { "cache-control": "public, max-age=60" } },
    );
  }
  const k = publicKey();
  if (!k) return NextResponse.json({ error: "no public key on this deploy" }, { status: 503 });
  return NextResponse.json({ alg: "ed25519", keyId: k.keyId, publicKey: k.pem }, { headers: { "cache-control": "public, max-age=3600" } });
}

export async function POST(req: Request): Promise<NextResponse> {
  const body = (await req.json().catch(() => null)) as { receipt?: unknown } | null;
  const raw = body?.receipt;
  const parsed = parseReceipt(typeof raw === "string" ? safeJson(raw) : raw);
  if (!parsed) return NextResponse.json({ ok: false, reason: "that is not a Remora receipt" }, { status: 400 });

  const k = publicKey();
  const signature = k ? checkSignature(parsed, k.pem) : ({ ok: false, reason: "no public key on this deploy" } as const);

  // Independent of the signature: does the machine's own record agree these bytes dropped?
  let vended: { at: string; job: string; bytes: number } | null = null;
  if (dbWired()) {
    const rows = (await sql()`
      SELECT a.job_id, a.bytes, a.created_at FROM remora_assets a
       WHERE a.sha256 = ${parsed.file.sha256} AND a.kind IN ('video', 'audio', 'gif') ORDER BY a.created_at LIMIT 1`) as
      { job_id: string; bytes: string | number; created_at: string | Date }[];
    if (rows[0]) vended = { at: new Date(rows[0].created_at).toISOString(), job: rows[0].job_id, bytes: Number(rows[0].bytes) };
  }

  return NextResponse.json({
    ok: signature.ok,
    signature,
    vended,
    receipt: { title: parsed.video.title, sha256: parsed.file.sha256, bytes: parsed.file.bytes, vendedAt: parsed.receipt.vendedAt, source: parsed.source.canonicalUrl, card: parsed.card, machine: parsed.tools.machine ?? null },
    paper: printReceipt(parsed),
  });
}

function safeJson(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

/**
 * The shelf: Cloudflare R2 (or any S3-compatible bucket) through node:https and
 * core/sigv4. Four requests: PUT a file, HEAD, DELETE, and a presigned GET for the flap.
 *
 * I/O edge. Env:
 *   REMORA_R2_ACCOUNT_ID         → https://<account>.r2.cloudflarestorage.com
 *   REMORA_R2_BUCKET
 *   REMORA_R2_ACCESS_KEY_ID
 *   REMORA_R2_SECRET_ACCESS_KEY
 *   REMORA_S3_ENDPOINT           optional override (any S3-compatible endpoint)
 *   REMORA_S3_REGION             optional, default "auto" (R2)
 */
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { request as httpsRequest } from "node:https";
import { request as httpRequest } from "node:http";
import { EMPTY_PAYLOAD_HASH, presignUrl, signRequest, UNSIGNED_PAYLOAD, type Credentials } from "./core/sigv4.ts";

export type Shelf = {
  endpoint: string;
  bucket: string;
  region: string;
  creds: Credentials;
};

export class StorageError extends Error {
  readonly status: number | null;
  constructor(message: string, status: number | null = null) {
    super(message);
    this.name = "StorageError";
    this.status = status;
  }
}

export function shelfWired(): boolean {
  const e = process.env;
  return Boolean((e.REMORA_S3_ENDPOINT || e.REMORA_R2_ACCOUNT_ID) && e.REMORA_R2_BUCKET && e.REMORA_R2_ACCESS_KEY_ID && e.REMORA_R2_SECRET_ACCESS_KEY);
}

export function shelf(): Shelf {
  const e = process.env;
  if (!shelfWired()) {
    throw new StorageError("the shelf is not wired: set REMORA_R2_ACCOUNT_ID, REMORA_R2_BUCKET, REMORA_R2_ACCESS_KEY_ID, REMORA_R2_SECRET_ACCESS_KEY");
  }
  return {
    endpoint: (e.REMORA_S3_ENDPOINT || `https://${e.REMORA_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`).replace(/\/$/, ""),
    bucket: e.REMORA_R2_BUCKET!,
    region: e.REMORA_S3_REGION || "auto",
    creds: { accessKeyId: e.REMORA_R2_ACCESS_KEY_ID!, secretAccessKey: e.REMORA_R2_SECRET_ACCESS_KEY! },
  };
}

/** Path-style URL for a key, each segment encoded once. */
export function objectUrl(s: Shelf, key: string): string {
  return `${s.endpoint}/${s.bucket}/${key.split("/").map(encodeURIComponent).join("/")}`;
}

/** Stream a file up. Unsigned payload (we send content-length), so nothing is buffered. */
export async function putFile(key: string, filePath: string, contentType: string, s: Shelf = shelf()): Promise<{ bytes: number }> {
  const { size } = await stat(filePath);
  const url = objectUrl(s, key);
  const headers = signRequest(s.creds, {
    method: "PUT",
    url,
    headers: { "content-type": contentType, "content-length": String(size) },
    payloadHash: UNSIGNED_PAYLOAD,
    region: s.region,
    now: new Date(),
  });
  const res = await send("PUT", url, headers, createReadStream(filePath));
  if (res.status < 200 || res.status >= 300) {
    throw new StorageError(`PUT ${key}: ${res.status} ${res.body.slice(0, 300)}`, res.status);
  }
  return { bytes: size };
}

export async function headObject(key: string, s: Shelf = shelf()): Promise<{ exists: boolean; bytes: number | null }> {
  const url = objectUrl(s, key);
  const headers = signRequest(s.creds, { method: "HEAD", url, payloadHash: EMPTY_PAYLOAD_HASH, region: s.region, now: new Date() });
  const res = await send("HEAD", url, headers);
  if (res.status === 404) return { exists: false, bytes: null };
  if (res.status < 200 || res.status >= 300) throw new StorageError(`HEAD ${key}: ${res.status}`, res.status);
  const len = res.headers["content-length"];
  return { exists: true, bytes: len ? Number(len) : null };
}

export async function deleteObject(key: string, s: Shelf = shelf()): Promise<void> {
  const url = objectUrl(s, key);
  const headers = signRequest(s.creds, { method: "DELETE", url, payloadHash: EMPTY_PAYLOAD_HASH, region: s.region, now: new Date() });
  const res = await send("DELETE", url, headers);
  // 404 is fine: the sweep is idempotent.
  if (res.status !== 404 && (res.status < 200 || res.status >= 300)) {
    throw new StorageError(`DELETE ${key}: ${res.status}`, res.status);
  }
}

/** A link anyone can GET until it expires, downloading as `fileName`. */
export function presignDownload(key: string, expiresIn: number, fileName: string, s: Shelf = shelf(), now = new Date()): string {
  const u = new URL(objectUrl(s, key));
  u.searchParams.set("response-content-disposition", `attachment; filename="${fileName.replace(/["\\]/g, "_")}"`);
  return presignUrl(s.creds, { url: u.toString(), region: s.region, expiresIn, now });
}

type Sent = { status: number; headers: Record<string, string | string[] | undefined>; body: string };

function send(method: string, url: string, headers: Record<string, string>, body?: NodeJS.ReadableStream): Promise<Sent> {
  const u = new URL(url);
  const req = (u.protocol === "http:" ? httpRequest : httpsRequest)(u, { method, headers });
  return new Promise<Sent>((resolve, reject) => {
    req.on("response", (res) => {
      const chunks: Buffer[] = [];
      res.on("data", (c: Buffer) => chunks.push(c));
      res.on("end", () => resolve({ status: res.statusCode ?? 0, headers: res.headers, body: Buffer.concat(chunks).toString("utf8") }));
      res.on("error", reject);
    });
    req.on("error", reject);
    req.setTimeout(10 * 60_000, () => req.destroy(new StorageError("request timed out")));
    if (body) {
      body.on("error", reject);
      body.pipe(req);
    } else {
      req.end();
    }
  });
}

/** Content type by extension, for the shelf and the browser's download dialog. */
export function contentTypeFor(fileName: string): string {
  const ext = fileName.toLowerCase().split(".").pop() ?? "";
  return (
    {
      mp4: "video/mp4",
      m4v: "video/mp4",
      webm: "video/webm",
      mkv: "video/x-matroska",
      mov: "video/quicktime",
      m4a: "audio/mp4",
      mp3: "audio/mpeg",
      opus: "audio/ogg",
      ogg: "audio/ogg",
      gif: "image/gif",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      json: "application/json",
    }[ext] ?? "application/octet-stream"
  );
}

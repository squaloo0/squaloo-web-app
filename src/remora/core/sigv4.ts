/**
 * AWS Signature Version 4, by hand. Enough to PUT, GET, HEAD and DELETE objects on
 * Cloudflare R2 (or any S3-compatible store) and to mint presigned GET URLs.
 *
 * Why not @aws-sdk/client-s3: the site's whole argument is that we think about what we
 * pull in, and the four requests the machine makes need ~120 lines of node:crypto.
 * Pure: time and secrets are inputs. Tested against the worked examples in AWS's docs.
 */
import { createHash, createHmac } from "node:crypto";

export type Credentials = {
  accessKeyId: string;
  secretAccessKey: string;
};

export type SignInput = {
  method: "GET" | "PUT" | "HEAD" | "DELETE";
  /** Absolute URL of the request, query included. */
  url: string;
  /** Headers to send. `host` is added if missing. Names are lower-cased for signing. */
  headers?: Record<string, string>;
  /** Hex SHA-256 of the body, or "UNSIGNED-PAYLOAD" for streamed uploads. */
  payloadHash: string;
  region: string;
  service?: string;
  /** The signing time. */
  now: Date;
};

export const UNSIGNED_PAYLOAD = "UNSIGNED-PAYLOAD";
export const EMPTY_PAYLOAD_HASH = sha256Hex("");

/** Signed headers for a request: the caller's headers plus host, x-amz-date, x-amz-content-sha256, authorization. */
export function signRequest(creds: Credentials, input: SignInput): Record<string, string> {
  const u = new URL(input.url);
  const amzDate = amzDateOf(input.now);
  const date = amzDate.slice(0, 8);
  const service = input.service ?? "s3";

  const headers: Record<string, string> = {};
  for (const [k, v] of Object.entries(input.headers ?? {})) headers[k.toLowerCase()] = v.trim();
  headers.host ??= u.host;
  headers["x-amz-date"] = amzDate;
  headers["x-amz-content-sha256"] = input.payloadHash;

  const signedHeaderNames = Object.keys(headers).sort();
  const canonical = canonicalRequest(input.method, u, headers, signedHeaderNames, input.payloadHash);
  const scope = `${date}/${input.region}/${service}/aws4_request`;
  const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${scope}\n${sha256Hex(canonical)}`;
  const signature = hmacHex(signingKey(creds.secretAccessKey, date, input.region, service), stringToSign);

  headers.authorization = `AWS4-HMAC-SHA256 Credential=${creds.accessKeyId}/${scope}, SignedHeaders=${signedHeaderNames.join(";")}, Signature=${signature}`;
  return headers;
}

export type PresignInput = {
  method?: "GET";
  url: string;
  region: string;
  service?: string;
  /** Seconds the link stays good. S3 caps this at 7 days. */
  expiresIn: number;
  now: Date;
};

/** A URL anyone can GET until it expires. Only `host` is signed, so any client works. */
export function presignUrl(creds: Credentials, input: PresignInput): string {
  const u = new URL(input.url);
  const amzDate = amzDateOf(input.now);
  const date = amzDate.slice(0, 8);
  const service = input.service ?? "s3";
  const scope = `${date}/${input.region}/${service}/aws4_request`;

  u.searchParams.set("X-Amz-Algorithm", "AWS4-HMAC-SHA256");
  u.searchParams.set("X-Amz-Credential", `${creds.accessKeyId}/${scope}`);
  u.searchParams.set("X-Amz-Date", amzDate);
  u.searchParams.set("X-Amz-Expires", String(input.expiresIn));
  u.searchParams.set("X-Amz-SignedHeaders", "host");

  const canonical = canonicalRequest(input.method ?? "GET", u, { host: u.host }, ["host"], UNSIGNED_PAYLOAD);
  const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${scope}\n${sha256Hex(canonical)}`;
  const signature = hmacHex(signingKey(creds.secretAccessKey, date, input.region, service), stringToSign);
  u.searchParams.set("X-Amz-Signature", signature);
  // URL.searchParams encodes with form rules; re-encode the way SigV4 does so the bytes a
  // client sends are the bytes we signed. Order as set, signature last, like AWS prints it.
  const query = [...u.searchParams].map(([k, v]) => `${rfc3986(k)}=${rfc3986(v)}`).join("&");
  return `${u.origin}${encodePath(u.pathname)}?${query}`;
}

export function sha256Hex(data: string | Buffer): string {
  return createHash("sha256").update(data).digest("hex");
}

// --- the spec, step by step --------------------------------------------------------

function canonicalRequest(method: string, u: URL, headers: Record<string, string>, signedNames: string[], payloadHash: string): string {
  const canonicalHeaders = signedNames.map((n) => `${n}:${headers[n].replace(/\s+/g, " ")}\n`).join("");
  return [method, encodePath(u.pathname), canonicalQuery(u), canonicalHeaders, signedNames.join(";"), payloadHash].join("\n");
}

/** Each path segment URI-encoded once, slashes kept. */
function encodePath(pathname: string): string {
  return pathname
    .split("/")
    .map((seg) => rfc3986(decodeURIComponent(seg)))
    .join("/");
}

/** Keys sorted, both sides RFC 3986 encoded, joined with & and =. */
function canonicalQuery(u: URL): string {
  const pairs: [string, string][] = [];
  for (const [k, v] of u.searchParams) pairs.push([rfc3986(k), rfc3986(v)]);
  pairs.sort(([ak, av], [bk, bv]) => (ak < bk ? -1 : ak > bk ? 1 : av < bv ? -1 : av > bv ? 1 : 0));
  return pairs.map(([k, v]) => `${k}=${v}`).join("&");
}

/** encodeURIComponent plus the characters it leaves alone that SigV4 wants encoded. */
function rfc3986(s: string): string {
  return encodeURIComponent(s).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
}

function amzDateOf(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function signingKey(secret: string, date: string, region: string, service: string): Buffer {
  const kDate = hmac(`AWS4${secret}`, date);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  return hmac(kService, "aws4_request");
}

function hmac(key: string | Buffer, data: string): Buffer {
  return createHmac("sha256", key).update(data).digest();
}

function hmacHex(key: Buffer, data: string): string {
  return createHmac("sha256", key).update(data).digest("hex");
}

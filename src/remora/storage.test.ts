/**
 * The shelf against a stand-in bucket: a node:http server in this process that checks
 * every request's SigV4 signature with the shared secret, the way R2 would, and keeps
 * the bytes. No network, no credentials, no dependency.
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createServer, type Server } from "node:http";
import { writeFile, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { signRequest, presignUrl, UNSIGNED_PAYLOAD, EMPTY_PAYLOAD_HASH } from "./core/sigv4.ts";
import { contentTypeFor, deleteObject, headObject, objectUrl, presignDownload, putFile, StorageError, type Shelf } from "./storage.ts";

const creds = { accessKeyId: "AKIAIOSFODNN7EXAMPLE", secretAccessKey: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY" };
const objects = new Map<string, { body: Buffer; type: string }>();
let server: Server;
let shelf: Shelf;
let dir: string;

/** Recompute the signature the client should have produced, from the request as received. */
function expectedAuth(method: "GET" | "PUT" | "HEAD" | "DELETE", url: string, headers: Record<string, string>): string {
  const amzDate = headers["x-amz-date"];
  const now = new Date(`${amzDate.slice(0, 4)}-${amzDate.slice(4, 6)}-${amzDate.slice(6, 8)}T${amzDate.slice(9, 11)}:${amzDate.slice(11, 13)}:${amzDate.slice(13, 15)}Z`);
  const signed = /SignedHeaders=([^,]+)/.exec(headers.authorization)![1].split(";");
  const h: Record<string, string> = {};
  for (const n of signed) if (n !== "x-amz-date" && n !== "x-amz-content-sha256") h[n] = headers[n];
  return signRequest(creds, { method, url, headers: h, payloadHash: headers["x-amz-content-sha256"], region: "auto", now }).authorization;
}

before(async () => {
  server = createServer((req, res) => {
    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => chunks.push(c));
    req.on("end", () => {
      const headers: Record<string, string> = {};
      for (const [k, v] of Object.entries(req.headers)) if (typeof v === "string") headers[k] = v;
      const url = `http://${headers.host}${req.url}`;
      const u = new URL(url);
      const key = decodeURIComponent(u.pathname.replace(/^\/remora-test\//, ""));
      const method = req.method as "GET" | "PUT" | "HEAD" | "DELETE";

      if (u.searchParams.has("X-Amz-Signature")) {
        // presigned: recompute from the query
        const want = new URL(url);
        want.searchParams.delete("X-Amz-Signature");
        const amzDate = u.searchParams.get("X-Amz-Date")!;
        const now = new Date(`${amzDate.slice(0, 4)}-${amzDate.slice(4, 6)}-${amzDate.slice(6, 8)}T${amzDate.slice(9, 11)}:${amzDate.slice(11, 13)}:${amzDate.slice(13, 15)}Z`);
        const bare = new URL(url);
        for (const k of [...bare.searchParams.keys()]) if (k.startsWith("X-Amz-")) bare.searchParams.delete(k);
        const expected = presignUrl(creds, { url: bare.toString(), region: "auto", expiresIn: Number(u.searchParams.get("X-Amz-Expires")), now });
        if (new URL(expected).searchParams.get("X-Amz-Signature") !== u.searchParams.get("X-Amz-Signature")) {
          res.writeHead(403).end("SignatureDoesNotMatch (presigned)");
          return;
        }
        const o = objects.get(key);
        if (!o) return void res.writeHead(404).end();
        res.writeHead(200, { "content-type": o.type, "content-disposition": u.searchParams.get("response-content-disposition") ?? "" }).end(o.body);
        return;
      }

      if (headers.authorization !== expectedAuth(method, url, headers)) {
        res.writeHead(403).end("SignatureDoesNotMatch");
        return;
      }
      if (method === "PUT") {
        if (headers["x-amz-content-sha256"] !== UNSIGNED_PAYLOAD) return void res.writeHead(400).end("expected unsigned payload");
        if (Number(headers["content-length"]) !== Buffer.concat(chunks).length) return void res.writeHead(400).end("length mismatch");
        objects.set(key, { body: Buffer.concat(chunks), type: headers["content-type"] });
        res.writeHead(200).end();
      } else if (method === "HEAD") {
        const o = objects.get(key);
        if (!o) return void res.writeHead(404).end();
        res.writeHead(200, { "content-length": String(o.body.length) }).end();
      } else if (method === "DELETE") {
        res.writeHead(objects.delete(key) ? 204 : 404).end();
      } else {
        res.writeHead(405).end();
      }
    });
  });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  const port = (server.address() as { port: number }).port;
  shelf = { endpoint: `http://127.0.0.1:${port}`, bucket: "remora-test", region: "auto", creds };
  dir = await mkdtemp(join(tmpdir(), "remora-shelf-"));
});

after(() => server.close());

test("put, head, delete, with a key that has spaces and brackets", async () => {
  const name = "Rick Astley [dQw4w9WgXcQ].mp4";
  const path = join(dir, name);
  const bytes = Buffer.alloc(300_000, 7);
  await writeFile(path, bytes);

  const key = `vends/j_1/${name}`;
  assert.equal(objectUrl(shelf, key), `${shelf.endpoint}/remora-test/vends/j_1/Rick%20Astley%20%5BdQw4w9WgXcQ%5D.mp4`);

  const put = await putFile(key, path, contentTypeFor(name), shelf);
  assert.equal(put.bytes, 300_000);
  assert.equal(objects.get(key)?.type, "video/mp4");
  assert.equal(createHash("sha256").update(objects.get(key)!.body).digest("hex"), createHash("sha256").update(bytes).digest("hex"));

  assert.deepEqual(await headObject(key, shelf), { exists: true, bytes: 300_000 });
  await deleteObject(key, shelf);
  assert.deepEqual(await headObject(key, shelf), { exists: false, bytes: null });
  await deleteObject(key, shelf); // idempotent
});

test("a wrong secret is refused, and the error carries the status", async () => {
  const path = join(dir, "x.json");
  await writeFile(path, "{}");
  const wrong = { ...shelf, creds: { ...creds, secretAccessKey: "nope" } };
  await assert.rejects(putFile("k", path, "application/json", wrong), (e: unknown) => e instanceof StorageError && e.status === 403);
});

test("a presigned download link works for a plain fetch and names the file", async () => {
  const path = join(dir, "r.json");
  await writeFile(path, '{"receipt":true}');
  await putFile("vends/j_2/r.json", path, "application/json", shelf);

  const link = presignDownload("vends/j_2/r.json", 3600, 'Rick "the" Roll.json', shelf);
  const res = await fetch(link);
  const body = await res.text();
  assert.equal(res.status, 200, body);
  assert.equal(res.headers.get("content-disposition"), 'attachment; filename="Rick _the_ Roll.json"');
  assert.equal(body, '{"receipt":true}');

  const tampered = link.replace(/X-Amz-Expires=3600/, "X-Amz-Expires=9999");
  assert.equal((await fetch(tampered)).status, 403);
});

test("content types", () => {
  assert.equal(contentTypeFor("a.MP4"), "video/mp4");
  assert.equal(contentTypeFor("a.webm"), "video/webm");
  assert.equal(contentTypeFor("a.m4a"), "audio/mp4");
  assert.equal(contentTypeFor("a.receipt.json"), "application/json");
  assert.equal(contentTypeFor("a.GIF"), "image/gif");
  assert.equal(contentTypeFor("a.thumbs.jpg"), "image/jpeg");
  assert.equal(contentTypeFor("a.bin"), "application/octet-stream");
  assert.equal(EMPTY_PAYLOAD_HASH.length, 64);
});

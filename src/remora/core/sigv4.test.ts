/**
 * The worked examples from "Authenticating Requests (AWS Signature Version 4)" in the
 * S3 API reference: the same example bucket, keys, and frozen clock AWS uses, so a
 * passing test means the bytes match what S3 would compute, not what we think it would.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { EMPTY_PAYLOAD_HASH, presignUrl, sha256Hex, signRequest, UNSIGNED_PAYLOAD } from "./sigv4.ts";

const CREDS = { accessKeyId: "AKIAIOSFODNN7EXAMPLE", secretAccessKey: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY" };
const NOW = new Date("2013-05-24T00:00:00.000Z");
const REGION = "us-east-1";

test("GET object: the documented signature for a ranged GET of test.txt", () => {
  const h = signRequest(CREDS, {
    method: "GET",
    url: "https://examplebucket.s3.amazonaws.com/test.txt",
    headers: { Range: "bytes=0-9" },
    payloadHash: EMPTY_PAYLOAD_HASH,
    region: REGION,
    now: NOW,
  });
  assert.equal(h["x-amz-date"], "20130524T000000Z");
  assert.equal(h["x-amz-content-sha256"], "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
  assert.equal(
    h.authorization,
    "AWS4-HMAC-SHA256 Credential=AKIAIOSFODNN7EXAMPLE/20130524/us-east-1/s3/aws4_request, SignedHeaders=host;range;x-amz-content-sha256;x-amz-date, Signature=f0e8bdb87c964420e857bd35b5d6ed310bd44f0170aba48dd91039c6036bdb41",
  );
});

test("PUT object: the documented signature for uploading 'Welcome to Amazon S3.'", () => {
  const body = "Welcome to Amazon S3.";
  const h = signRequest(CREDS, {
    method: "PUT",
    url: "https://examplebucket.s3.amazonaws.com/test$file.text",
    headers: { Date: "Fri, 24 May 2013 00:00:00 GMT", "x-amz-storage-class": "REDUCED_REDUNDANCY" },
    payloadHash: sha256Hex(body),
    region: REGION,
    now: NOW,
  });
  assert.equal(h["x-amz-content-sha256"], "44ce7dd67c959e0d3524ffac1771dfbba87d2b6b4b4e99e42034a8b803f8b072");
  assert.equal(
    h.authorization,
    "AWS4-HMAC-SHA256 Credential=AKIAIOSFODNN7EXAMPLE/20130524/us-east-1/s3/aws4_request, SignedHeaders=date;host;x-amz-content-sha256;x-amz-date;x-amz-storage-class, Signature=98ad721746da40c64f1a55b78f14c238d841ea1380cd77a1b5971af0ece108bd",
  );
});

test("GET bucket lifecycle: a query string in the canonical request", () => {
  const h = signRequest(CREDS, {
    method: "GET",
    url: "https://examplebucket.s3.amazonaws.com/?lifecycle",
    payloadHash: EMPTY_PAYLOAD_HASH,
    region: REGION,
    now: NOW,
  });
  assert.match(h.authorization, /Signature=fea454ca298b7da1c68078a5d1bdbfbbe0d65c699e0f91ac7a200a0136783543$/);
});

test("presigned GET: the documented 24-hour URL for test.txt", () => {
  const url = presignUrl(CREDS, {
    url: "https://examplebucket.s3.amazonaws.com/test.txt",
    region: REGION,
    expiresIn: 86400,
    now: NOW,
  });
  assert.equal(
    url,
    "https://examplebucket.s3.amazonaws.com/test.txt?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAIOSFODNN7EXAMPLE%2F20130524%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20130524T000000Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=aeeed9bbccd4d02ee5c0109b86d86835f995330da4c265957d157751f604d404",
  );
});

test("unsigned payload for streamed uploads, and R2-shaped URLs with spaces in keys", () => {
  const h = signRequest(CREDS, {
    method: "PUT",
    url: "https://abc123.r2.cloudflarestorage.com/remora/vends/j1/Rick%20Astley%20%5BdQw4w9WgXcQ%5D.mp4",
    headers: { "content-type": "video/mp4", "content-length": "9094158" },
    payloadHash: UNSIGNED_PAYLOAD,
    region: "auto",
    now: NOW,
  });
  assert.equal(h["x-amz-content-sha256"], "UNSIGNED-PAYLOAD");
  assert.equal(h.host, "abc123.r2.cloudflarestorage.com");
  assert.match(h.authorization, /Credential=AKIAIOSFODNN7EXAMPLE\/20130524\/auto\/s3\/aws4_request, SignedHeaders=content-length;content-type;host;x-amz-content-sha256;x-amz-date, Signature=[0-9a-f]{64}$/);
});

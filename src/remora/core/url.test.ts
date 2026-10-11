import { test } from "node:test";
import assert from "node:assert/strict";
import { parseVideoUrl } from "./url.ts";
import { URL_FIXTURES } from "./url.fixtures.ts";

test("every fixture has a unique name and input", () => {
  const names = new Set(URL_FIXTURES.map((f) => f.name));
  const inputs = new Set(URL_FIXTURES.map((f) => f.input));
  assert.equal(names.size, URL_FIXTURES.length, "duplicate fixture name");
  assert.equal(inputs.size, URL_FIXTURES.length, "duplicate fixture input");
});

for (const f of URL_FIXTURES) {
  test(`url: ${f.name}`, () => {
    assert.deepEqual(parseVideoUrl(f.input), f.expect, `input: ${JSON.stringify(f.input)}`);
  });
}

test("every known provider resolves to one canonical spelling", () => {
  // The same video pasted three ways must land on byte-identical canonical URLs,
  // because Phase 3 keys the job queue on them.
  const spellings = [
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ&si=a",
    "https://youtu.be/dQw4w9WgXcQ?t=1",
    "https://m.youtube.com/shorts/dQw4w9WgXcQ",
    "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
  ].map((u) => parseVideoUrl(u)?.canonicalUrl);
  assert.equal(new Set(spellings).size, 1);
});

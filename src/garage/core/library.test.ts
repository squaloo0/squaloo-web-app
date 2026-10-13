import { test } from "node:test";
import assert from "node:assert/strict";
import { checkMirror, extFor, idWithMirror, mirrorFileName, mirrorOf, parseSums, primaryUrl, stripMirror, sumsText } from "./library.ts";
import type { LibraryRow } from "./notion.ts";

const H = "a".repeat(64);
const G = "b".repeat(64);

test("a primary's file name carries its row number, its slug and its type", () => {
  assert.equal(mirrorFileName(3, "Gelman & Carlin (2014), Beyond Power Calculations", "application/pdf", "https://x/y.pdf"), "S3-gelman-carlin-2014-beyond-power-calculations.pdf");
  assert.equal(mirrorFileName(7, "Project Vend: Can Claude run a small shop?", "text/html; charset=utf-8", "https://www.anthropic.com/research/project-vend-1"), "S7-project-vend-can-claude-run-a-small-shop.html");
  assert.equal(extFor(null, "https://arxiv.org/pdf/2502.15840"), "pdf");
  assert.equal(extFor("application/octet-stream", "https://x/y"), "bin");
  assert.equal(mirrorFileName(1, "!!!", "text/plain", "u"), "S1-source.txt");
});

test("the ID field records the mirror after whatever the founder wrote, and can be read back", () => {
  const id = idWithMirror("arXiv:2502.15840", "S7-vending-bench.pdf", H);
  assert.equal(id, "arXiv:2502.15840 · S7-vending-bench.pdf · sha256 aaaaaaaaaaaa");
  assert.deepEqual(mirrorOf(id), { file: "S7-vending-bench.pdf", sha12: "aaaaaaaaaaaa" });
  assert.equal(stripMirror(id), "arXiv:2502.15840");
  assert.equal(idWithMirror("", "S1-x.html", G), "S1-x.html · sha256 bbbbbbbbbbbb");
  assert.equal(idWithMirror(id, "S7-vending-bench.pdf", G), "arXiv:2502.15840 · S7-vending-bench.pdf · sha256 bbbbbbbbbbbb", "re-fetching replaces the mirror tag, not the identifier");
  assert.equal(mirrorOf("doi:10.1177/1745691614551642"), null);
});

test("SHA256SUMS is the sha256sum format, sorted, and parses back", () => {
  const text = sumsText([{ file: "S2-b.pdf", sha256: G }, { file: "S1-a.pdf", sha256: H }]);
  assert.equal(text, `${H}  S1-a.pdf\n${G}  S2-b.pdf\n`);
  assert.deepEqual([...parseSums(text).entries()], [["S1-a.pdf", H], ["S2-b.pdf", G]]);
  assert.equal(sumsText([]), "");
});

test("rule 19: the rows and the disk are compared, and every kind of disagreement is named", () => {
  const row = (id: string, name: string, url: string): LibraryRow => ({ id, name, url, status: "", kind: "", added: "", addedBy: "", scrub: [], summary: "", notionUrl: "" });
  const rows = [row("1", "A", "https://a"), row("2", "B", "https://b"), row("3", "C", "https://c"), row("4", "D", "https://d"), row("5", "E", "")];
  const ids = new Map([
    ["1", `S1-a.pdf · sha256 ${H.slice(0, 12)}`],
    ["2", `S2-b.pdf · sha256 ${H.slice(0, 12)}`],
    ["3", `S3-c.pdf · sha256 ${H.slice(0, 12)}`],
  ]);
  const sums = new Map([
    ["S1-a.pdf", H],
    ["S2-b.pdf", G],
    ["S9-orphan.pdf", G],
  ]);
  const c = checkMirror(rows, sums, ids);
  assert.deepEqual(c.ok, ["A"]);
  assert.deepEqual(c.mismatch, [{ row: "B", file: "S2-b.pdf", disk: "bbbbbbbbbbbb", row12: "aaaaaaaaaaaa" }]);
  assert.deepEqual(c.missing, [{ row: "C", file: "S3-c.pdf" }]);
  assert.deepEqual(c.orphans, ["S9-orphan.pdf"]);
  assert.deepEqual(c.unmirrored, [{ row: "D", url: "https://d" }], "a row with no URL is not a hunt");
});

test("an arXiv abstract page is fetched as its PDF; anything else as written", () => {
  assert.equal(primaryUrl("https://arxiv.org/abs/2502.15840"), "https://arxiv.org/pdf/2502.15840");
  assert.equal(primaryUrl("https://arxiv.org/abs/1512.04922v3"), "https://arxiv.org/pdf/1512.04922v3");
  assert.equal(primaryUrl("https://arxiv.org/pdf/1907.07032"), "https://arxiv.org/pdf/1907.07032");
  assert.equal(primaryUrl("https://www.anthropic.com/research/project-vend-1"), "https://www.anthropic.com/research/project-vend-1");
});

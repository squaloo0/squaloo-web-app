import { test } from "node:test";
import assert from "node:assert/strict";
import { parseWhisperJson, transcriptFileName, transcriptMarkdown, wavPostprocessArgs, whisperArgs } from "./transcript.ts";
import { parseYtDlpJson } from "./meta.ts";
import { YTDLP_YOUTUBE_FIXTURE } from "./meta.fixture.ts";

const WHISPER_JSON = {
  systeminfo: "x",
  model: { type: "base", multilingual: true },
  params: { model: "/x/ggml-base.bin", language: "auto" },
  result: { language: "en" },
  transcription: [
    { timestamps: { from: "00:00:00,000", to: "00:00:04,500" }, offsets: { from: 0, to: 4500 }, text: " We're no strangers to love." },
    { timestamps: { from: "00:00:04,500", to: "00:00:08,000" }, offsets: { from: 4500, to: 8000 }, text: " You know the rules and so do I." },
    { timestamps: { from: "00:00:08,000", to: "00:00:09,000" }, offsets: { from: 8000, to: 9000 }, text: "   " },
    { timestamps: { from: "00:00:50,000", to: "00:00:55,000" }, offsets: { from: 50000, to: 55000 }, text: " A full commitment's what I'm thinking of." },
    { nope: true },
  ],
};

test("the WAV whisper wants, and whisper's own arguments", () => {
  assert.deepEqual(wavPostprocessArgs(), ["--extract-audio", "--audio-format", "wav", "--postprocessor-args", "ExtractAudio:-ar 16000 -ac 1"]);
  const a = whisperArgs({ model: "/m/ggml-base.bin", wav: "/t/in.wav", outBase: "/t/out" });
  assert.deepEqual(a, ["-m", "/m/ggml-base.bin", "-f", "/t/in.wav", "-l", "auto", "-t", "4", "-oj", "-of", "/t/out", "-np"]);
});

test("whisper's JSON narrows to seconds and text; blanks and junk are dropped", () => {
  const r = parseWhisperJson(WHISPER_JSON)!;
  assert.equal(r.language, "en");
  assert.equal(r.segments.length, 3);
  assert.deepEqual(r.segments[0], { from: 0, to: 4.5, text: "We're no strangers to love." });
  assert.equal(r.segments[2].from, 50);
  assert.equal(parseWhisperJson({ result: {} }), null);
  assert.equal(parseWhisperJson(null), null);
});

test("the document: a header, then blocks that open with a time", () => {
  const meta = parseYtDlpJson(YTDLP_YOUTUBE_FIXTURE);
  const md = transcriptMarkdown({
    meta,
    canonicalUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    clip: null,
    result: parseWhisperJson(WHISPER_JSON)!,
    model: "ggml-base.bin",
    whisperVersion: "1.9.5",
    now: new Date("2026-10-13T06:00:00.000Z"),
  });
  assert.ok(md.startsWith("# Rick Astley - Never Gonna Give You Up"));
  assert.ok(md.includes("- source: https://www.youtube.com/watch?v=dQw4w9WgXcQ"));
  assert.ok(md.includes("- by: Rick Astley"));
  assert.ok(md.includes("whisper.cpp 1.9.5 · ggml-base.bin · language en"));
  assert.ok(md.includes("- segments: 3"));
  assert.ok(md.includes("**[0:00]** We're no strangers to love. You know the rules and so do I."), md);
  assert.ok(md.includes("**[0:50]** A full commitment's what I'm thinking of."), md);
});

test("a clip's markers are offset to the original video, and silence says so", () => {
  const meta = parseYtDlpJson(YTDLP_YOUTUBE_FIXTURE);
  const base = { meta, canonicalUrl: "u", model: "m", whisperVersion: null, now: new Date("2026-10-13T06:00:00.000Z") };
  const md = transcriptMarkdown({ ...base, clip: { start: 83, end: 105 }, result: { language: "en", segments: [{ from: 1, to: 3, text: "Hi." }] } });
  assert.ok(md.includes("- clip: 1:23–1:45"));
  assert.ok(md.includes("**[1:24]** Hi."), md);
  const quiet = transcriptMarkdown({ ...base, clip: null, result: { language: null, segments: [] } });
  assert.ok(quiet.includes("whisper heard nothing"));
  assert.equal(transcriptFileName("x [id].wav"), "x [id].transcript.md");
});

/**
 * What is behind the glass: the ten-or-so fields of a yt-dlp info dump that the machine
 * actually reads, narrowed by hand. Pure. No I/O.
 *
 * yt-dlp's JSON is huge, drifts between releases, and differs per extractor. The rule is
 * permissive on unknown keys and strict on the few we depend on: a dump without a title
 * is not a video we can vend, but a dump with nine hundred extra keys is fine.
 */

export type VideoFormat = {
  formatId: string;
  ext: string;
  height: number | null;
  width: number | null;
  fps: number | null;
  /** Bytes. yt-dlp's exact size when it reports one, else its estimate, else null. */
  bytes: number | null;
  /** True when `bytes` came from `filesize_approx`. */
  bytesApprox: boolean;
  /** Codec names; null when the stream has no video (or no audio) at all. */
  vcodec: string | null;
  acodec: string | null;
  /** yt-dlp's `format_note`, e.g. "1080p", "medium". */
  note: string | null;
  /** yt-dlp's `protocol`, e.g. "https", "m3u8_native". */
  protocol: string | null;
};

export type VideoMeta = {
  id: string;
  title: string;
  uploader: string | null;
  /** Seconds. Null for live streams and anything yt-dlp could not measure. */
  duration: number | null;
  /** ISO date, YYYY-MM-DD. yt-dlp gives YYYYMMDD. */
  uploadDate: string | null;
  thumbnail: string | null;
  webpageUrl: string | null;
  /** yt-dlp's extractor name, lower case: "youtube", "vimeo", "generic", ... */
  extractor: string;
  isLive: boolean;
  formats: VideoFormat[];
};

export class MetaError extends Error {
  /** Dotted path to the field that failed, e.g. "formats[3].format_id". */
  readonly path: string;
  constructor(path: string, message: string) {
    super(`${path}: ${message}`);
    this.name = "MetaError";
    this.path = path;
  }
}

/**
 * Narrow a yt-dlp info dump (raw JSON text or an already-parsed value) to a VideoMeta.
 * Throws MetaError with the offending path when a required field is missing or mistyped.
 */
export function parseYtDlpJson(input: unknown): VideoMeta {
  let value = input;
  if (typeof input === "string") {
    try {
      value = JSON.parse(input);
    } catch {
      throw new MetaError("$", "not JSON");
    }
  }
  const o = obj(value, "$");

  const rawFormats = o.formats;
  const formats: VideoFormat[] = [];
  if (rawFormats !== undefined && rawFormats !== null) {
    if (!Array.isArray(rawFormats)) {
      throw new MetaError("formats", "expected an array");
    }
    rawFormats.forEach((f, i) => formats.push(parseFormat(f, `formats[${i}]`)));
  }

  return {
    id: str(o, "id"),
    title: str(o, "title"),
    uploader: optStr(o, "uploader") ?? optStr(o, "channel") ?? optStr(o, "uploader_id"),
    duration: optNum(o, "duration"),
    uploadDate: isoDate(optStr(o, "upload_date"), "upload_date"),
    thumbnail: optStr(o, "thumbnail"),
    webpageUrl: optStr(o, "webpage_url"),
    extractor: (optStr(o, "extractor") ?? "unknown").toLowerCase(),
    isLive: o.is_live === true || o.live_status === "is_live",
    formats,
  };
}

function parseFormat(value: unknown, path: string): VideoFormat {
  const f = obj(value, path);
  const exact = optNum(f, "filesize");
  const approx = optNum(f, "filesize_approx");
  return {
    formatId: str(f, "format_id", path),
    ext: optStr(f, "ext") ?? "",
    height: optNum(f, "height"),
    width: optNum(f, "width"),
    fps: optNum(f, "fps"),
    bytes: exact ?? approx,
    bytesApprox: exact === null && approx !== null,
    vcodec: codec(optStr(f, "vcodec")),
    acodec: codec(optStr(f, "acodec")),
    note: optStr(f, "format_note"),
    protocol: optStr(f, "protocol"),
  };
}

// --- the narrow part --------------------------------------------------------------

type Obj = Record<string, unknown>;

function obj(value: unknown, path: string): Obj {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new MetaError(path, "expected an object");
  }
  return value as Obj;
}

function str(o: Obj, key: string, parent = ""): string {
  const v = o[key];
  if (typeof v !== "string" || v.length === 0) {
    throw new MetaError(parent ? `${parent}.${key}` : key, "expected a non-empty string");
  }
  return v;
}

function optStr(o: Obj, key: string): string | null {
  const v = o[key];
  return typeof v === "string" && v.length > 0 ? v : null;
}

function optNum(o: Obj, key: string): number | null {
  const v = o[key];
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

/** yt-dlp writes "none" when a stream lacks that track. We say null. */
function codec(v: string | null): string | null {
  return v === null || v === "none" ? null : v;
}

/** "20091025" → "2009-10-25". Anything else is a validator bug, so it throws. */
function isoDate(v: string | null, path: string): string | null {
  if (v === null) {
    return null;
  }
  const m = /^(\d{4})(\d{2})(\d{2})$/.exec(v);
  if (!m) {
    throw new MetaError(path, `expected YYYYMMDD, got ${JSON.stringify(v)}`);
  }
  return `${m[1]}-${m[2]}-${m[3]}`;
}

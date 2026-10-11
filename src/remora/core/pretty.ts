/**
 * Numbers the way a receipt prints them. Pure.
 */

/** 213 → "3:33", 3725 → "1:02:05", null → "live/unknown". */
export function prettyDuration(seconds: number | null): string {
  if (seconds === null || seconds < 0) {
    return "—";
  }
  const s = Math.round(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  return `${h > 0 ? `${h}:` : ""}${mm}:${String(sec).padStart(2, "0")}`;
}

/** 122168277 → "116.5 MB". Binary units, because that is what the disk says. */
export function prettyBytes(bytes: number | null, approx = false): string {
  if (bytes === null || bytes < 0) {
    return "—";
  }
  const units = ["B", "KB", "MB", "GB", "TB"];
  let n = bytes;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  const digits = i === 0 ? 0 : 1;
  return `${approx ? "~" : ""}${n.toFixed(digits)} ${units[i]}`;
}

/** 1080 → "1080p", null → "audio". */
export function prettyHeight(height: number | null): string {
  return height === null ? "audio" : `${height}p`;
}

/** A bar for the front of the machine. Null fraction → an indeterminate crawl. */
export function progressBar(fraction: number | null, width = 24, tick = 0): string {
  if (fraction === null) {
    const pos = tick % width;
    return [...Array(width)].map((_, i) => (i === pos ? "▓" : "░")).join("");
  }
  const filled = Math.round(Math.max(0, Math.min(1, fraction)) * width);
  return "█".repeat(filled) + "░".repeat(width - filled);
}

/** 2621440 → "2.5 MB/s". */
export function prettySpeed(bytesPerSecond: number | null): string {
  return bytesPerSecond === null ? "—" : `${prettyBytes(bytesPerSecond)}/s`;
}

/** 0..1 → "  7%". Null → "  ?%". */
export function prettyPercent(fraction: number | null): string {
  return fraction === null ? "  ?%" : `${String(Math.floor(fraction * 100)).padStart(3)}%`;
}

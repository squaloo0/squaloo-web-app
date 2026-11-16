/** A file size the way a person reads it: "438 KB", "1.2 MB". Shared by /marshal-qr's deck link and /now's entry links. */
export function humanSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "";
  if (bytes < 1000 * 1000) return `${Math.max(1, Math.round(bytes / 1000))} KB`;
  return `${(bytes / (1000 * 1000)).toFixed(1)} MB`;
}

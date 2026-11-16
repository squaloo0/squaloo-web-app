/** A mailto link with the subject encoded. Shared by the Meridian front door and /now. */
export function mailto(subject: string, to = "marshal@squaloo.com"): string {
  return `mailto:${to}?subject=${encodeURIComponent(subject)}`;
}

/**
 * The two things the founder supplies after this PR is written (SQU-427).
 * Each one renders as absent, never as a broken link or an empty player.
 */

/** The deck PDF, under public/meridian/. Not rendered until the file is committed. */
export const DECK_FILE = "squaloo-meridian-2026-11-14.pdf";

/**
 * The 40-second video: an unlisted YouTube id, with a poster served from this
 * origin (VideoEmbed loads nothing from YouTube until play is pressed). null =
 * the video section isn't rendered, and the page doesn't promise one.
 */
export const VIDEO: { youtubeId: string; poster: string } | null = null;

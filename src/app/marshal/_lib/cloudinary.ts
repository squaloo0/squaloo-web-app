/**
 * Cloudinary delivery URLs for the portfolio media. The data file holds only
 * public IDs; every URL is built here, so the transformation rules live in
 * one place.
 *
 * The cloud name comes from NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and falls back
 * to the cloud the media was uploaded to, so the build works without the env
 * var set.
 */
import { MEDIA, type MediaKey, type MediaRecord } from "../_data/media";

export const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dhsxbgair";
const BASE = `https://res.cloudinary.com/${CLOUD_NAME}`;

/** The widths the pages request. Snapping to a ladder bounds the number of derived assets. */
const LADDER = [320, 480, 640, 828, 1080, 1280, 1600, 1920] as const;

export function snapWidth(width: number): number {
  return LADDER.find((w) => w >= width) ?? LADDER[LADDER.length - 1];
}

export function media(key: MediaKey): MediaRecord {
  return MEDIA[key];
}

/** A resized image: format and quality chosen by Cloudinary, never upscaled. */
export function imageUrl(id: string, width: number): string {
  return `${BASE}/image/upload/f_auto,q_auto,c_limit,w_${snapWidth(width)}/${id}`;
}

/** The loader next/image calls for each width in its srcset. */
export function cloudinaryLoader({ src, width }: { src: string; width: number }): string {
  return imageUrl(src, width);
}

/** The MP4 delivery of an uploaded video. */
export function videoUrl(id: string): string {
  return `${BASE}/video/upload/${id}.mp4`;
}

/** A video's poster: its own poster image when the manifest names one, otherwise a frame of the video itself. */
export function posterUrl(record: MediaRecord, width = 1280): string | undefined {
  if (record.kind !== "video") return undefined;
  if (record.poster) return imageUrl(record.poster, width);
  return `${BASE}/video/upload/so_auto,f_auto,q_auto,c_limit,w_${snapWidth(width)}/${record.id}.jpg`;
}

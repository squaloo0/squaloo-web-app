"use client";

/**
 * next/image with the Cloudinary loader. A loader is a function, and a
 * function cannot cross from a server component into next/image, so this thin
 * client wrapper holds it. Everything else about the image is plain props.
 */
import Image, { type ImageProps } from "next/image";
import { cloudinaryLoader } from "../_lib/cloudinary";

export default function CldImage({ alt, ...props }: Omit<ImageProps, "loader">) {
  return <Image loader={cloudinaryLoader} alt={alt} {...props} />;
}

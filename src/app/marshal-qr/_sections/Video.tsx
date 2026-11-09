import VideoEmbed from "@/components/VideoEmbed";
import { VIDEO } from "../_data/meridian";
import { WRAP, Eyebrow } from "./ui";

/** Not rendered until the founder sets VIDEO. The embed is the site's click-to-play facade. */
export default function Video() {
  if (!VIDEO) return null;
  return (
    <section id="video" className={`${WRAP} flex flex-col gap-5 pb-16`}>
      <Eyebrow>Forty seconds</Eyebrow>
      <VideoEmbed id={VIDEO.youtubeId} poster={VIDEO.poster} title="Squaloo at Meridian, in forty seconds" />
    </section>
  );
}

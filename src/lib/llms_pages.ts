/**
 * The pages listed in llms.txt, with titles and summaries read from each
 * page's own `metadata` export, so the index cannot disagree with the page.
 */
import type { Metadata } from "next";
import { metadata as home } from "@/app/page";
import { metadata as solomon } from "@/app/solomon/page";
import { metadata as measured } from "@/app/measured/page";
import { metadata as roadmap } from "@/app/roadmap/page";
import { metadata as build } from "@/app/build/page";
import { metadata as founder } from "@/app/founder/page";
import { metadata as devlog } from "@/app/devlog/page";
import type { PageRef } from "@/lib/llms";

function ref(path: string, m: Metadata): PageRef {
  const title = typeof m.title === "string" ? m.title : String(m.title ?? path);
  return { path, title, description: String(m.description ?? "") };
}

export const pages: PageRef[] = [
  ref("/", home),
  ref("/solomon", solomon),
  ref("/measured", measured),
  ref("/roadmap", roadmap),
  ref("/build", build),
  ref("/founder", founder),
  ref("/devlog", devlog),
];

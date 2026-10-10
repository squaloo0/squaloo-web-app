import { getPublishedPosts } from "@/lib/devlog";
import { llmsIndex } from "@/lib/llms";
import { pages } from "@/lib/llms_pages";

// Built once per deploy from the same data the pages render (never hand-kept).
export const dynamic = "force-static";

export function GET() {
  return new Response(llmsIndex(pages, getPublishedPosts()), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}

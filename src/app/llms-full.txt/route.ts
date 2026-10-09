import { getPublishedPosts } from "@/lib/devlog";
import { llmsFull } from "@/lib/llms";
import { pages } from "@/lib/llms_pages";

// Built once per deploy from the same data the pages render (never hand-kept).
export const dynamic = "force-static";

export function GET() {
  const sha = (process.env.VERCEL_GIT_COMMIT_SHA ?? "").slice(0, 7);
  return new Response(llmsFull(pages, getPublishedPosts(), sha), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}

import Link from "next/link";
import { notFound } from "next/navigation";
import AppFooter from "@/components/AppFooter";
import { getPublishedPosts, getPostBySlug, formatDate } from "@/lib/devlog";

type Params = { slug: string };

// Static params come from the same visibility rule as the index, so an
// unpublished post has no route in production rather than a hidden-but-reachable
// URL.
export function generateStaticParams(): Params[] {
  return getPublishedPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    return { title: "Devlog — Squaloo" };
  }
  return {
    title: `${post.title} — Squaloo Devlog`,
    description: post.summary,
  };
}

export default async function DevlogPost({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#08090a] text-white flex flex-col">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-900 bg-black/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-8 h-14 flex items-center justify-between">
          <Link href="/devlog" className="text-neutral-600 text-xs tracking-widest uppercase font-mono hover:text-white transition-colors">
            ← Devlog
          </Link>
          <Link href="/measured" className="text-neutral-500 text-xs tracking-widest uppercase font-mono hover:text-white transition-colors">
            Measured →
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-8 pt-36 pb-24 flex-1 w-full">
        <header className="mb-12">
          <div className="text-xs text-neutral-500 font-mono tracking-[0.3em] uppercase mb-6">
            {formatDate(post.date)}
            {post.status !== "published" ? (
              <span className="ml-3 text-[#d98c5f]">· draft</span>
            ) : null}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight mb-6">
            {post.title}
          </h1>
          <p className="text-neutral-400 text-lg leading-relaxed border-l-2 border-[#1400bf] pl-6">
            {post.summary}
          </p>
        </header>

        {/*
          Content is our own reviewed markdown from content/devlog/, rendered at
          build time — not user input, and never fetched from anywhere.
          prose-invert carries the dark palette; the overrides below pull link
          and code colours onto the site's accents.
        */}
        <article
          className="prose prose-invert max-w-none
                     prose-headings:tracking-tight
                     prose-h2:text-xl prose-h2:mt-12 prose-h2:mb-4
                     prose-p:text-neutral-300 prose-p:leading-relaxed
                     prose-li:text-neutral-300
                     prose-strong:text-white
                     prose-a:text-[#5688c7] prose-a:no-underline hover:prose-a:text-white
                     prose-code:text-[#63a375] prose-code:before:content-none prose-code:after:content-none
                     prose-pre:bg-black prose-pre:border prose-pre:border-neutral-800
                     prose-hr:border-neutral-800
                     prose-blockquote:border-l-[#1400bf] prose-blockquote:text-neutral-400"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />

        <div className="mt-16 pt-8 border-t border-neutral-800 flex flex-wrap gap-6 items-center justify-between">
          <Link href="/devlog" className="text-neutral-500 text-xs tracking-widest uppercase font-mono hover:text-white transition-colors">
            ← All posts
          </Link>
          <span className="text-neutral-600 text-xs font-mono">{post.author}</span>
        </div>
      </div>

      <AppFooter />
    </div>
  );
}

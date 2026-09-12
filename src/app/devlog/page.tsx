import Link from "next/link";
import AppFooter from "@/components/AppFooter";
import { getPublishedPosts, formatDate } from "@/lib/devlog";

export const metadata = {
  title: "Devlog — Squaloo",
  description:
    "Notes from building Solomon: the decisions, the measurements, and the things that went wrong first.",
};

export default function DevlogIndex() {
  const posts = getPublishedPosts();

  return (
    <div className="min-h-screen bg-[#08090a] text-white flex flex-col">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-900 bg-black/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-8 h-14 flex items-center justify-between">
          <Link href="/" className="text-neutral-600 text-xs tracking-widest uppercase font-mono hover:text-white transition-colors">
            ← Squaloo
          </Link>
          <Link href="/solomon" className="text-neutral-500 text-xs tracking-widest uppercase font-mono hover:text-white transition-colors">
            Solomon →
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-8 pt-36 pb-24 flex-1 w-full">
        <section className="mb-20">
          <div className="text-xs text-neutral-500 font-mono tracking-[0.3em] uppercase mb-6">
            Devlog
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-6 max-w-3xl">
            Notes from building the thing.
          </h1>
          <p className="text-neutral-400 text-lg leading-relaxed max-w-2xl">
            Decisions we had to make, measurements that changed our minds, and the parts that went
            wrong before they went right. Same rule as the rest of this site: if we can&apos;t show
            you the check behind a claim, we don&apos;t make it.
          </p>
        </section>

        <section className="mb-32">
          <div className="flex items-baseline gap-4 mb-10 border-b border-neutral-800 pb-4">
            <h2 className="text-xs font-mono tracking-widest uppercase text-neutral-400">Posts</h2>
            <div className="h-px flex-1 bg-neutral-800" />
          </div>

          {posts.length === 0 ? (
            <p className="text-neutral-500 text-sm font-mono">Nothing published yet.</p>
          ) : (
            <div className="space-y-0">
              {posts.map((p) => (
                <Link
                  key={p.slug}
                  href={`/devlog/${p.slug}`}
                  className="group block border-t border-neutral-800 py-8 grid grid-cols-1 md:grid-cols-[160px_1fr] gap-6 hover:border-[#1400bf] transition-colors"
                >
                  <span className="text-neutral-600 text-xs font-mono tracking-widest pt-1 group-hover:text-[#5688c7] transition-colors">
                    {formatDate(p.date)}
                  </span>
                  <div>
                    <div className="text-white text-lg tracking-wide mb-2 group-hover:text-[#5688c7] transition-colors">
                      {p.title}
                      {p.status !== "published" ? (
                        <span className="ml-3 text-[10px] font-mono uppercase tracking-widest text-[#d98c5f] align-middle">
                          draft
                        </span>
                      ) : null}
                    </div>
                    <p className="text-neutral-400 text-sm leading-relaxed max-w-2xl">{p.summary}</p>
                  </div>
                </Link>
              ))}
              <div className="border-t border-neutral-800" />
            </div>
          )}
        </section>

        <section className="border border-neutral-800 p-10">
          <div className="text-xs font-mono tracking-widest uppercase text-[#63a375] mb-4">The receipts</div>
          <p className="text-neutral-300 text-lg leading-relaxed max-w-3xl mb-8">
            These posts describe how we build. If you&apos;d rather see what it actually scores —
            including the questions Solomon still gets wrong — that lives on the Measured page.
          </p>
          <Link
            href="/measured"
            className="inline-block px-6 py-3 bg-[#1400bf] text-white text-sm font-medium tracking-wide hover:bg-[#5688c7] transition-colors"
          >
            See the measurements →
          </Link>
        </section>
      </div>

      <AppFooter />
    </div>
  );
}

export default function HeroSection() {
  return (
    <section className="py-16 border-b border-neutral-800">
      <div className="max-w-4xl mx-auto font-mono">
        <div className="text-xs tracking-[0.3em] text-neutral-500 uppercase mb-4">
          Marshal-QR / v1.0 — Archive
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-6">
          The Work That Got Me In
        </h1>
        <div className="space-y-4 text-sm text-neutral-400 leading-relaxed max-w-2xl">
          <p>
            This is where it started. Marshal-QR was my first formal portfolio piece — a custom QR code hand-encoded on a go board, built from first principles without a library. I submitted it as part of my application to the USC Iovine and Young Academy&apos;s MS in Integrated Design, Business, and Technology program.
          </p>
          <p>
            It worked. One of my professors mentioned remembering it when reviewing applications. The work was memorable enough to stand on its own, even if the design of this page tells a different story.
          </p>
          <p>
            This route lives on as an archive of v1.0 — intentionally preserved, not revised. When time permits, I plan to rebuild this entirely as an interactive lesson: a step-by-step walkthrough for building your own QR code board from scratch. Until then, browse the work below.
          </p>
        </div>
        <div className="mt-8 text-xs text-neutral-600 tracking-widest uppercase">
          — Marshal Aldoph, IYA &apos;27
        </div>
      </div>
    </section>
  );
} 
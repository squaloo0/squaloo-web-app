import { Suspense } from "react";
import SubscribeForm from "./SubscribeForm";
import { WRAP, H2, Eyebrow } from "./ui";

export default function Subscribe() {
  return (
    <section id="subscribe" className="border-y border-sq-rule bg-sq-card">
      <div className={`${WRAP} grid grid-cols-1 gap-8 py-16 md:grid-cols-2`}>
        <div className="flex flex-col gap-4">
          <Eyebrow>The newsletter</Eyebrow>
          <h2 className={H2}>Follow the build.</h2>
          <p className="m-0 text-lg leading-[1.55] text-sq-ink-muted">
            What got built and what missed, about once a month.
          </p>
        </div>
        {/* Suspense: the form reads ?src= on the client, so the rest of the page stays static. */}
        <Suspense fallback={<div className="min-h-[360px]" aria-busy="true" />}>
          <SubscribeForm />
        </Suspense>
      </div>
    </section>
  );
}

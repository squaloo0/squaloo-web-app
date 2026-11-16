import { WRAP, ACTION, Eyebrow } from "@/components/house/ui";
import { mailto } from "@/lib/mail";

export default function Talk() {
  return (
    <section id="talk" className={`${WRAP} pb-16`}>
      <div className="flex flex-col gap-5 rounded-[20px] border border-sq-rule bg-sq-card p-8 sm:p-12">
        <Eyebrow>Talk with us</Eyebrow>
        <h2 className="m-0 font-display text-[36px] font-medium leading-[1.08] sm:text-[48px]">Run or maintain a plant?</h2>
        <p className="m-0 max-w-[760px] text-lg leading-[1.55] text-sq-ink-muted sm:text-xl">
          I’d like to learn how your floor works.
        </p>
        <div>
          <a href={mailto("Plant conversation")} className={ACTION}>
            Write to Marshal
          </a>
        </div>
      </div>
    </section>
  );
}

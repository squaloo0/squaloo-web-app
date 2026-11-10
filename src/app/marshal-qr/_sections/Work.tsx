import Link from "next/link";
import { WORK } from "../_data/work";
import { WRAP, H2, Eyebrow } from "./ui";

export default function Work() {
  return (
    <section id="work" className="border-t border-sq-rule bg-sq-card">
      <div className={`${WRAP} flex flex-col gap-5 py-16`}>
        <Eyebrow>Work</Eyebrow>
        <h2 className={H2}>What I’ve built.</h2>
        <ul className="m-0 list-none divide-y divide-sq-rule border-y border-sq-rule p-0">
          {WORK.map((w) => {
            const title = <span className={`text-lg ${w.featured ? "font-extrabold" : "font-semibold"}`}>{w.title}</span>;
            return (
              <li key={w.title} className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:gap-6">
                <span className="w-14 shrink-0 font-mono text-[12px] tracking-[0.14em] text-sq-label">{w.year ?? ""}</span>
                <span className="flex flex-1 flex-col gap-1">
                  {w.href ? (
                    <Link href={w.href} className="text-sq-ink underline-offset-4 hover:text-solomon-blue hover:underline">
                      {title}
                    </Link>
                  ) : (
                    title
                  )}
                  <span className="leading-[1.5] text-sq-ink-muted">{w.line}</span>
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-sq-label">{w.role}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

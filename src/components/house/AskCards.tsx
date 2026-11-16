import { ASKS } from "@/content/asks";
import { mailto } from "@/lib/mail";
import { ACTION } from "./ui";

export default function AskCards() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {ASKS.map((a) => (
        <article key={a.n} className="flex flex-col gap-3 rounded-[20px] border border-sq-rule bg-sq-card p-6">
          <div className="font-mono text-[12px] uppercase tracking-[0.2em] text-solomon-blue">
            {a.n} · {a.label}
          </div>
          <h3 className="m-0 text-xl font-extrabold leading-snug">{a.head}</h3>
          <p className="m-0 flex-1 leading-[1.55] text-sq-ink-muted">{a.body}</p>
          <div>
            <a href={mailto(a.subject)} className={ACTION}>
              {a.action}
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}

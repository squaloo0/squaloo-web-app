import { WRAP } from "@/components/house/ui";

export default function Founder() {
  return (
    <section id="founder" className={`${WRAP} pb-16`}>
      <div className="flex flex-col gap-2 rounded-[20px] border border-sq-rule bg-sq-card p-6">
        <h2 className="m-0 text-xl font-extrabold leading-snug">Marshal Aldoph</h2>
        <p className="m-0 text-sq-ink-muted">Founder</p>
        <div className="pt-1">
          <a
            href="https://www.linkedin.com/in/marshalaldoph/"
            className="inline-flex min-h-11 items-center font-semibold text-sq-ink underline underline-offset-4 hover:text-solomon-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solomon-blue"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </section>
  );
}

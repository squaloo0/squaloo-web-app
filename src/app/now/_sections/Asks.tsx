import AskCards from "@/components/house/AskCards";
import { WRAP, H2, Eyebrow } from "@/components/house/ui";

export default function Asks() {
  return (
    <section id="asks" className={`${WRAP} flex flex-col gap-6 py-16`}>
      <Eyebrow>The asks</Eyebrow>
      <h2 className={H2}>Four ways to help.</h2>
      <AskCards />
    </section>
  );
}

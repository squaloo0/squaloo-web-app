// The one place the Squaloo wordmark is rendered.
//
// Until the founder's asset is uploaded, WORDMARK_SRC is null and this renders
// the text mark the site has always shown. The upload is two steps: drop the
// file at public/brand/wordmark.svg, then set WORDMARK_SRC below.
//
// The text stays as the image's alt, so the brand name is never lost to
// screen readers or to a failed image load.

const WORDMARK_SRC: string | null = null; // e.g. "/brand/wordmark.svg"

export default function Wordmark({ className = "" }: { className?: string }) {
  if (WORDMARK_SRC) {
    // eslint-disable-next-line @next/next/no-img-element -- static SVG, no optimisation needed
    return <img src={WORDMARK_SRC} alt="Squaloo" className={`h-5 w-auto ${className}`} />;
  }
  return (
    <span className={`text-white text-sm font-bold tracking-[0.2em] font-mono ${className}`}>
      SQUALOO
    </span>
  );
}

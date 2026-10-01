// The one place the Squaloo wordmark is rendered (SQU-285).
//
// The SVGs are generated, never hand-edited: brand/make_wordmark.py builds
// them from the design tokens of solomon-os #237 (Mulish 800, -0.03em, accent
// full stop). Text is converted to outlines, so no font loads at runtime.
//
//   dark  : white ink, for the site's #08090a surfaces
//   light : gray-900 ink, for light surfaces (the shop header)
//
// "Squaloo" stays as the alt, so the name survives screen readers and a
// failed image load.

const WORDMARK_SRC = {
  dark: "/brand/wordmark.svg",
  light: "/brand/wordmark-light.svg",
} as const;

type Props = {
  variant?: keyof typeof WORDMARK_SRC;
  // Height utility; width follows the SVG's aspect ratio.
  className?: string;
};

export default function Wordmark({ variant = "dark", className = "h-5" }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static SVG, no optimisation needed
    <img src={WORDMARK_SRC[variant]} alt="Squaloo" className={`w-auto ${className}`} />
  );
}

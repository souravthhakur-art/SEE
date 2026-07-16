import Image from "next/image";
import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/reveal";

/**
 * Editorial storytelling primitives — image-driven, magazine-style.
 *
 * These do NOT replace any existing component. They are additive layering
 * for the final UX/storytelling pass: framed photography with captions,
 * pull quotes, and a trust-signals editorial grid.
 *
 * All motion is delegated to the existing <Reveal /> primitive so timing
 * stays consistent with the rest of the site.
 */

type Aspect = "4/5" | "4/3" | "16/9" | "1/1" | "3/4";

const aspectClass: Record<Aspect, string> = {
  "4/5": "aspect-[4/5]",
  "4/3": "aspect-[4/3]",
  "16/9": "aspect-[16/9]",
  "1/1": "aspect-square",
  "3/4": "aspect-[3/4]",
};

interface EditorialImageProps {
  src: string;
  alt: string;
  caption?: string;
  credit?: string;
  aspect?: Aspect;
  priority?: boolean;
  /** Image alignment within its column on large screens. */
  sizes?: string;
  className?: string;
}

/**
 * A framed editorial photograph with optional caption + credit line.
 * Reads as a magazine plate, not a stock photo block.
 */
export function EditorialImage({
  src,
  alt,
  caption,
  credit,
  aspect = "4/3",
  priority = false,
  sizes = "(max-width: 1024px) 100vw, 50vw",
  className = "",
}: EditorialImageProps) {
  return (
    <figure className={className}>
      <div className={`relative w-full ${aspectClass[aspect]} overflow-hidden bg-ivory-dark warm-card`}>
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover transition-transform duration-[1200ms] ease-out hover:scale-[1.03]"
          sizes={sizes}
          priority={priority}
        />
      </div>
      {(caption || credit) && (
        <figcaption className="mt-3 flex items-baseline justify-between gap-4">
          {caption && (
            <p className="text-xs text-charcoal/55 leading-relaxed font-body italic">
              {caption}
            </p>
          )}
          {credit && (
            <p className="text-[10px] tracking-[0.15em] uppercase text-charcoal/35 whitespace-nowrap">
              {credit}
            </p>
          )}
        </figcaption>
      )}
    </figure>
  );
}

interface PullQuoteProps {
  /** The quote line(s). */
  children: ReactNode;
  /** Optional attribution, e.g. a field note or source. */
  attribution?: string;
  className?: string;
}

/**
 * A quiet, centered editorial pull quote — Cormorant italic, generous
 * breathing room, a small ornament above. Used between sections to give
 * the homepage a magazine-feature cadence.
 */
export function PullQuote({ children, attribution, className = "" }: PullQuoteProps) {
  return (
    <Reveal className={`text-center max-w-3xl mx-auto ${className}`}>
      {/* Using <img> for a decorative SVG ornament (no Image optimization needed). */}
      <img
        src="/decor/footer-border.svg"
        alt=""
        className="mx-auto h-4 w-24 opacity-30 mb-8"
        aria-hidden="true"
      />
      <blockquote className="font-heading text-2xl md:text-3xl lg:text-4xl text-forest italic leading-snug text-balance">
        {children}
      </blockquote>
      {attribution && (
        <p className="mt-6 text-xs tracking-[0.2em] uppercase text-charcoal/45">
          {attribution}
        </p>
      )}
    </Reveal>
  );
}

const trustItems = [
  {
    title: "Single Origin",
    line: "Every harvest is traced to one estate, one village, one batch.",
  },
  {
    title: "Small Batch",
    line: "Cooked and packed in quantities a household would recognise.",
  },
  {
    title: "Women-led SHGs",
    line: "Preserves and pickles made by self-help groups across Himachal.",
  },
  {
    title: "Naturally Grown",
    line: "No synthetic inputs on the gardens we source from.",
  },
  {
    title: "No Artificial Preservatives",
    line: "Just fruit, sugar, spice, and time — the old way.",
  },
  {
    title: "Traditional Methods",
    line: "Orthodox tea, sun-cured pickle, slow-cooked preserve.",
  },
  {
    title: "Direct from Himachal",
    line: "Sourced by hand, shipped from Palampur. No middlemen.",
  },
  {
    title: "Detailed Provenance",
    line: "Harvest date, estate, elevation and batch on every tin.",
  },
];

/**
 * Trust signals presented as an editorial index — short title + one honest
 * line each, in a quiet multi-column grid. Deliberately NOT ecommerce badges.
 */
export function TrustSignals({ className = "" }: { className?: string }) {
  return (
    <section className={`section-padding py-20 md:py-28 ${className}`}>
      <div className="max-w-6xl mx-auto">
        <Reveal className="text-center mb-12 md:mb-16">
          <p className="label mb-3">Our Standards</p>
          <h2 className="heading-md">What &ldquo;Directly Sourced&rdquo; Actually Means</h2>
        </Reveal>
        <Reveal>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-8">
            {trustItems.map((item) => (
              <li key={item.title} className="border-t border-forest/12 pt-4">
                <h3 className="font-heading text-lg text-forest mb-1.5">{item.title}</h3>
                <p className="text-xs text-charcoal/60 leading-relaxed">{item.line}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

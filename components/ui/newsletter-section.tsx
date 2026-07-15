"use client";

import { useState } from "react";
import { newsletterConfig } from "@/lib/data";
import { Creeper, LeafBullet } from "@/components/ui/ornament";

export default function NewsletterSection() {
  const [submitted, setSubmitted] = useState(false);

  if (!newsletterConfig.visible) return null;

  return (
    <section className="relative section-padding py-20 md:py-28 overflow-hidden">
      {/* Faint Guler-inspired botanical creeper behind the form.
          Mirrored on both sides so it frames the copy symmetrically.
          Kept under 7% opacity — atmospheric, never dominant. */}
      <Creeper
        className="pointer-events-none absolute -left-10 top-1/2 -translate-y-1/2 h-64 w-80 text-forest"
        style={{ opacity: 0.06, transform: "translateY(-50%) scaleX(-1)" }}
        aria-hidden="true"
      />
      <Creeper
        className="pointer-events-none absolute -right-10 top-1/2 -translate-y-1/2 h-64 w-80 text-forest"
        style={{ opacity: 0.06 }}
        aria-hidden="true"
      />

      <div className="relative max-w-xl mx-auto text-center">
        <p className="label-ornate mb-3 justify-center text-forest/55">
          <LeafBullet /> Stay Connected
        </p>
        <h2 className="font-heading text-3xl md:text-4xl text-forest mb-4 text-balance">
          {newsletterConfig.heading}
        </h2>
        <p className="text-charcoal/60 mb-8">
          {newsletterConfig.description}
        </p>
        {submitted ? (
          <p className="text-sm text-forest tracking-wide">
            Thank you — you&apos;re on the list. Watch your inbox for seasonal
            harvest updates.
          </p>
        ) : (
          <form
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
          >
            <input
              type="email"
              required
              placeholder={newsletterConfig.placeholder}
              className="flex-1 px-4 py-3 bg-ivory/70 border border-forest/20 text-sm text-forest placeholder:text-charcoal/40 focus:outline-none focus:border-forest focus:bg-ivory transition-colors"
            />
            <button type="submit" className="px-8 py-3 rounded-sm bg-forest text-ivory text-sm tracking-widest uppercase hover:bg-forest-light hover:shadow-[0_10px_24px_-12px_rgba(23,55,40,0.45)] active:translate-y-px transition-all duration-300">
              {newsletterConfig.buttonText}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

import { testimonials } from "@/lib/data";

export default function TestimonialSection() {
  // Intentionally renders nothing until real customer testimonials exist —
  // see the note beside `testimonials` in lib/data.ts. A brand with zero
  // reviews reads as more trustworthy than one with invented ones.
  if (testimonials.length === 0) return null;

  const featured = testimonials[0];

  return (
    <section className="section-padding py-24 md:py-36">
      <div className="max-w-3xl mx-auto text-center">
        <p className="label mb-8">In Their Words</p>
        <blockquote className="font-heading text-3xl md:text-4xl lg:text-5xl text-forest leading-snug text-balance mb-8">
          &ldquo;{featured.text}&rdquo;
        </blockquote>
        <p className="text-sm tracking-wide text-charcoal/50">
          {featured.name}, {featured.location} — {featured.product}
        </p>
      </div>
    </section>
  );
}

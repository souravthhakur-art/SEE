import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { subscriptionBoxes } from "@/lib/data";
import { Reveal } from "@/components/ui/reveal";

const content = {
  visible: true,
  label: "Seasonal Harvests",
  heading: "Bring Home the Taste of the Himalayas",
  subheading:
    "Limited seasonal harvests, thoughtfully curated from across Himachal Pradesh.",
  chooseLine: "Choose the harvest that suits your home.",
};

const getBox = (id: string) => subscriptionBoxes.find((b) => b.id === id);

// WhatsApp is this brand's actual order/enquiry channel (see Contact, FAQs,
// and the WhatsApp float button) — there is no payment gateway in this
// codebase, so "Become a Member" opens a pre-filled enquiry instead of
// linking nowhere.
function subscribeHref(planName: string) {
  const message = `Hi! I'd like to subscribe to the ${planName} plan.`;
  return `https://wa.me/919999999999?text=${encodeURIComponent(message)}`;
}

// The three editorial tier cards share identical structure — only the
// heading, tagline, and data differ. Extracted to avoid repeating the same
// ~40 lines of markup three times.
const tierCopy: Record<string, { heading: string; tagline: string }> = {
  essential: {
    heading: "Everyday Harvest",
    tagline: "Everyday essentials from the mountains, thoughtfully selected for your kitchen.",
  },
  family: {
    heading: "Home Harvest",
    tagline: "Created for homes that value seasonal food and mindful eating.",
  },
  seasonal: {
    heading: "Seasonal Harvest",
    tagline: "A changing collection inspired by the rhythm of Himalayan seasons.",
  },
};

export default function SubscriptionSection() {
  if (!content.visible) return null;

  const essential = getBox("essential");
  const family = getBox("family");
  const seasonal = getBox("seasonal");
  const signature = getBox("signature");

  if (!essential || !family || !seasonal || !signature) return null;

  const tiers = [essential, family, seasonal];

  return (
    <section id="pantry" className="section-padding py-16 md:py-20 bg-ivory">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Reveal className="text-center mb-10 md:mb-12">
          <p className="text-xs tracking-[0.18em] uppercase text-forest/60 mb-3">
            {content.label}
          </p>
          <h2 className="font-heading text-3xl md:text-5xl text-forest mb-4">
            {content.heading}
          </h2>
          <p className="text-charcoal/70 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-3">
            {content.subheading}
          </p>
          <p className="text-sm text-charcoal/50 tracking-wide">
            {content.chooseLine}
          </p>
        </Reveal>

        {/* Three tiers, one balanced row (Option A) */}
        <Reveal className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-forest/10 border border-forest/10 shadow-[0_16px_45px_-35px_rgba(23,55,40,0.45)]">
          <TierCard box={tiers[0]} />
          <TierCard box={tiers[1]} />
          <TierCard box={tiers[2]} />
        </Reveal>

        {/* Signature Harvest — full width, image-backed, the richest moment
            in the section. Reuses the harvest still-life that previously
            sat awkwardly mid-grid (see subscriptionsection history). */}
        <Reveal className="group relative mt-px overflow-hidden border border-forest/10">
          <div className="absolute inset-0">
            <Image
              src="/images/subscriptions/seasonal-harvests.jpg"
              alt="Curated Himalayan harvest — honey, tea, preserves, and pickles arranged on linen in morning light"
              fill
              className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-[linear-gradient(100deg,_rgba(15,38,27,0.94)_0%,_rgba(15,38,27,0.90)_45%,_rgba(15,38,27,0.72)_75%,_rgba(15,38,27,0.55)_100%)]" />
          </div>
          <div className="relative flex flex-col gap-8 p-7 md:flex-row md:items-center md:justify-between md:p-10">
            <div className="flex-1">
              <div className="flex items-baseline gap-4 mb-4">
                <h3 className="font-heading text-2xl md:text-3xl text-ivory">
                  Signature Harvest
                </h3>
                {signature.badge && (
                  <span className="text-xs tracking-[0.18em] uppercase text-ivory/50 border border-ivory/20 px-3 py-1">
                    {signature.badge}
                  </span>
                )}
              </div>
              <p className="text-ivory/70 leading-relaxed max-w-xl">
                Our most exclusive seasonal selection, featuring limited harvests, single-batch teas and first access to seasonal releases.
              </p>
            </div>
            <div className="flex items-center gap-8">
              <div>
                <span className="font-heading text-2xl text-ivory">
                  ₹{signature.price}
                </span>
                <span className="text-sm text-ivory/50 ml-1">
                  /{signature.frequency.toLowerCase()}
                </span>
              </div>
              <Link
                href={`/subscriptions/configure?plan=signature`}
                className="group/cta flex items-center gap-3 bg-ivory text-forest px-8 py-4 text-sm tracking-[0.08em] uppercase hover:bg-ivory/90 transition-colors"
              >
                Become a Member
                <ArrowRight className="w-4 h-4 transition-transform duration-300 ease-out group-hover/cta:translate-x-1.5" />
              </Link>
            </div>
          </div>
        </Reveal>

        {/* Footer note */}
        <div className="mt-7 text-center">
          <p className="text-sm text-charcoal/50">
            Packed with care in Himachal Pradesh. Delivered across India.
          </p>
        </div>
      </div>
    </section>
  );
}

function TierCard({ box }: { box: NonNullable<ReturnType<typeof getBox>> }) {
  const copy = tierCopy[box.id];

  return (
    <div className="bg-ivory p-7 md:p-8 flex flex-col hover:bg-forest/5 transition-all duration-300">
      <div className="flex-1">
        <div className="flex items-baseline justify-between mb-4">
          <h3 className="font-heading text-2xl text-forest">{copy.heading}</h3>
          <div className="flex items-center gap-3">
            {box.badge && (
              <span className="text-xs tracking-[0.18em] uppercase text-forest/50 border border-forest/20 px-3 py-1">
                {box.badge}
              </span>
            )}
            <span className="text-sm tracking-[0.12em] uppercase text-forest/50">
              {box.itemCount}
            </span>
          </div>
        </div>
        <p className="text-charcoal/70 text-sm leading-relaxed mb-6">{copy.tagline}</p>
        <ul className="space-y-2.5 mb-7">
          {box.contents.slice(0, 4).map((item) => (
            <li key={item} className="text-sm text-charcoal/80 flex items-start">
              <span className="text-forest/40 mr-3">—</span>
              {item}
            </li>
          ))}
          {box.contents.length > 4 && (
            <li className="text-sm text-charcoal/50 pl-5">
              +{box.contents.length - 4} handpicked additions
            </li>
          )}
        </ul>
      </div>
      <div className="flex items-end justify-between gap-3 border-t border-forest/10 pt-5">
        <div>
          <span className="font-heading text-xl text-forest">₹{box.price}</span>
          <span className="text-sm text-charcoal/50 ml-1">
            /{box.frequency.toLowerCase()}
          </span>
        </div>
        <Link
          href={`/subscriptions/configure?plan=${box.id}`}
          className="group flex items-center gap-2 text-sm tracking-[0.08em] uppercase text-forest hover:text-forest-light transition-colors"
        >
          Become a Member
          <ArrowRight className="w-4 h-4 transition-transform duration-300 ease-out group-hover:translate-x-1.5" />
        </Link>
      </div>
    </div>
  );
}

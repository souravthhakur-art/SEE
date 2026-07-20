import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronDown } from "lucide-react";
import TrustBar from "@/components/home/trust-bar";
import ProductCard from "@/components/product/product-card";
import SubscriptionSection from "@/components/subscription/subscription-section";
import JournalSection from "@/components/journal/journal-section";
import MakersSection from "@/components/home/makers-section";
import TestimonialSection from "@/components/home/testimonial-section";
import NewsletterSection from "@/components/ui/newsletter-section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { Divider, LeafBullet } from "@/components/ui/ornament";
import { EditorialImage, PullQuote, TrustSignals } from "@/components/ui/editorial";
import { products } from "@/lib/data";

export default function HomePage() {
  const allProducts = products.filter((p) => p.showInShop !== false);

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[90svh] md:min-h-[88vh] flex items-center overflow-hidden">
        {/* Background — Kangra Valley tea gardens, cropped toward the
            terraces (not the snow peak) and colour-graded warmer and less
            saturated so it reads as food provenance, not a travel poster. */}
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/images/hero-kangra-valley.jpg"
            alt="Misty tea gardens of Kangra Valley at dawn with the Dhauladhar range"
            fill
            className="object-cover object-[48%_60%] md:object-[52%_64%] saturate-[0.82] sepia-[0.06] contrast-[1.04] brightness-[0.96] hero-zoom"
            sizes="100vw"
            priority
          />
        </div>
        {/* A subtle local radial gradient centered behind the text to guarantee contrast, with a faint top scrim for the header, keeping the tea gardens and mountains bright and detailed */}
        <div 
          className="absolute inset-0 z-[2]" 
          style={{
            background: "radial-gradient(circle at center, rgba(12, 28, 20, 0.50) 0%, rgba(12, 28, 20, 0.28) 45%, rgba(12, 28, 20, 0.08) 75%, rgba(12, 28, 20, 0.03) 100%)"
          }}
        />
        <div 
          className="absolute inset-0 z-[2]" 
          style={{
            background: "linear-gradient(to bottom, rgba(0, 0, 0, 0.22) 0%, transparent 20%)"
          }}
        />

        {/* Fine paper-grain texture — a restrained, tactile finish in place
            of a flat colour filter. Pure CSS/SVG, no new asset. */}
        <div
          className="absolute inset-0 z-[1] opacity-[0.05] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            backgroundRepeat: "repeat",
          }}
          aria-hidden="true"
        />

        {/* Guler-inspired line landscape — a faint hand-drawn layer over the
            lower portion of the hero. Masked so the etched hills, village and
            tea gardens rise from the base of the frame without sitting behind
            the headline. Kept subtle so it reads as craft, not decoration. */}
        <div
          className="absolute inset-0 z-[1] text-ivory pointer-events-none"
          style={{
            opacity: 0.28,
            WebkitMaskImage:
              "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.55) 38%, rgba(0,0,0,0) 62%)",
            maskImage:
              "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.55) 38%, rgba(0,0,0,0) 62%)",
          }}
          aria-hidden="true"
        >
          {/* Using <img> for a decorative SVG overlay (no Image optimization needed). */}
          <img
            src="/decor/hero-landscape.svg"
            alt=""
            className="w-full h-full object-cover object-bottom"
          />
        </div>

        <div className="relative z-10 section-padding w-full py-24 md:py-36 flex items-center justify-center max-w-7xl mx-auto">
          <div className="max-w-2xl text-center flex flex-col items-center justify-center">
            <p className="text-[10px] md:text-xs uppercase tracking-[0.25em] text-stone-300/80 mb-4 font-body font-semibold">
              Bring the Himalayas to Your Home.
            </p>
            <h1 className="font-heading text-[32px] sm:text-4xl md:text-6xl lg:text-7xl text-ivory mb-6 leading-[1.15] md:leading-[1.12] tracking-tight text-balance font-medium">
              Authentic Flavours of the Himalayas.
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-stone-300/90 max-w-lg mx-auto mb-10 leading-relaxed tracking-wide font-body font-light">
              Tea, honey and pantry essentials sourced directly from trusted farmers and producers across Himachal Pradesh.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-5 w-full sm:w-auto max-w-xs sm:max-w-none mx-auto">
              <Link 
                href="/shop" 
                className="btn-primary w-full sm:w-auto min-w-[190px] px-7 py-4 md:py-3.5 text-xs tracking-[0.2em] font-body font-semibold uppercase text-center"
              >
                SHOP COLLECTION
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" strokeWidth={1.5} />
              </Link>
              <Link
                href="/subscriptions"
                className="inline-flex items-center justify-center w-full sm:w-auto min-w-[190px] px-7 py-4 md:py-3.5 bg-ivory/5 hover:bg-ivory/10 backdrop-blur-[2px] border border-stone-300/25 hover:border-ivory/40 text-stone-300/90 hover:text-ivory font-body text-xs tracking-[0.2em] font-medium uppercase transition-all duration-300 text-center shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_20px_rgba(212,168,75,0.08)] rounded-sm"
              >
                SUBSCRIBE NOW
              </Link>
            </div>
            <ul className="mt-14 flex max-w-2xl flex-wrap justify-center gap-x-6 gap-y-3 text-[10px] md:text-[11px] tracking-[0.15em] uppercase text-stone-300/60" aria-label="Palum Dhara commitments">
              <li>Direct from Himachal Pradesh</li>
              <li>Small Batch</li>
              <li>Traceable Origins</li>
              <li>Women-led SHGs</li>
            </ul>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-10">
          <ChevronDown className="w-5 h-5 text-ivory/50" strokeWidth={1} />
        </div>
      </section>

      <TrustBar />

      <section className="section-padding py-24 md:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16">
            <div>
              <p className="label-ornate mb-4"><LeafBullet /> Shop the Collection</p>
              <h2 className="heading-md">From Himachal Pradesh, for your pantry</h2>
            </div>
            <Link href="/shop" className="hidden md:inline-flex items-center gap-2 text-sm tracking-wide text-forest hover:text-forest-light transition-colors">
              View all products <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 md:gap-7">
            {allProducts.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
          <div className="mt-10 text-center md:hidden">
            <Link href="/shop" className="inline-flex items-center gap-2 text-sm tracking-wide text-forest">View all products <ArrowRight className="w-4 h-4" strokeWidth={1.5} /></Link>
          </div>
        </div>
      </section>

      {/* SUBSCRIPTION — placed immediately after the shop grid so it reads
          as the second purchase decision, ahead of any storytelling. */}
      <SubscriptionSection />

      {/* FROM THE LIVING WATERS — origin story, magazine split.
          The name Palum Dhara comes from the local words for water and
          stream. This section roots the brand in place before any product
          is shown, so the collection below reads as "collected from here". */}
      <section className="section-padding py-24 md:py-36">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <Reveal>
            <EditorialImage
              src="/images/story/mountain-stream.jpg"
              alt="A clear Himalayan mountain stream rushing over mossy stones in Kangra Valley"
              caption="A spring that feeds the tea gardens above Palampur — the living waters the valley is named for."
              aspect="4/3"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </Reveal>
          <Reveal>
            <p className="label-ornate mb-4"><LeafBullet /> Our Name</p>
            <h2 className="heading-lg mb-6">From the Living<br />Waters of the Himalayas</h2>
            <div className="space-y-4 body-lg">
              <p>
                <em>Palum</em> — the local word for water. <em>Dhara</em> — a stream, a flow.
                Together, the living waters that feed the tea gardens of Palampur, a town that
                takes its own name from them.
              </p>
              <p>
                We began with a simple observation: some of India&apos;s finest orthodox tea
                was being grown in the Kangra Valley, yet most of it never left the region.
                Palum Dhara exists to carry it — and the honey, preserves and pickles made
                beside it — out of the mountains and into your kitchen.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <PullQuote className="py-16 md:py-24">
        The mountains decide the flavour.
      </PullQuote>

      {/* WHY YOU'LL LOVE PALUM DHARA? */}
      <section className="bg-forest/[0.03] section-padding py-24 md:py-36">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-12 md:mb-16">
            <p className="label-ornate mb-3 justify-center"><LeafBullet /> Why Palum Dhara?</p>
            <h2 className="heading-md">Why You'll Love Palum Dhara</h2>
            <Divider className="ornament-divider mt-6 h-5 w-64" />
          </Reveal>
          <RevealGroup className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            <RevealItem className="text-center">
              <h3 className="font-heading text-xl text-forest mb-3">Carefully Sourced</h3>
              <p className="text-charcoal/70 leading-relaxed">
                Every product is selected from trusted growers and women-led self-help groups across Himachal Pradesh.
              </p>
            </RevealItem>
            <RevealItem className="text-center">
              <h3 className="font-heading text-xl text-forest mb-3">Authentic Flavours</h3>
              <p className="text-charcoal/70 leading-relaxed">
                Traditional recipes and regional specialties from the districts where they are best known.
              </p>
            </RevealItem>
            <RevealItem className="text-center">
              <h3 className="font-heading text-xl text-forest mb-3">Supporting Local Communities</h3>
              <p className="text-charcoal/70 leading-relaxed">
                Every purchase helps preserve local craftsmanship and supports rural livelihoods.
              </p>
            </RevealItem>
          </RevealGroup>
        </div>
      </section>

      {/* OUR REGIONS */}
      <section className="bg-forest/[0.03] border-t border-forest/5 section-padding py-24 md:py-36">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-12 md:mb-16">
            <p className="label-ornate mb-3 justify-center"><LeafBullet /> Our Regions</p>
            <h2 className="heading-md">Sourced from Across Himachal Pradesh</h2>
            <Divider className="ornament-divider mt-6 h-5 w-64" />
          </Reveal>
          <RevealGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <RevealItem className="text-center p-6 bg-ivory/60 border border-forest/8">
              <p className="text-xs tracking-[0.2em] uppercase text-forest/60 mb-2">KANGRA</p>
              <h3 className="font-heading text-lg text-forest mb-1">Orthodox Tea</h3>
            </RevealItem>
            <RevealItem className="text-center p-6 bg-ivory/60 border border-forest/8">
              <p className="text-xs tracking-[0.2em] uppercase text-forest/60 mb-2">CHAMBA</p>
              <h3 className="font-heading text-lg text-forest mb-1">Wild Forest Honey</h3>
            </RevealItem>
            <RevealItem className="text-center p-6 bg-ivory/60 border border-forest/8">
              <p className="text-xs tracking-[0.2em] uppercase text-forest/60 mb-2">MANDI</p>
              <h3 className="font-heading text-lg text-forest mb-1">Seasonal Preserves & Pickles</h3>
            </RevealItem>
            <RevealItem className="text-center p-6 bg-ivory/60 border border-forest/8">
              <p className="text-xs tracking-[0.2em] uppercase text-forest/60 mb-2">COMING SOON</p>
              <h3 className="font-heading text-lg text-forest mb-1">More Regional Products</h3>
            </RevealItem>
          </RevealGroup>
          <Reveal>
            <p className="text-center text-sm text-charcoal/60 mt-10 max-w-lg mx-auto">
              Every product comes from the district where it is traditionally made.
            </p>
          </Reveal>
        </div>
      </section>

      <PullQuote className="py-16 md:py-24">
        Collected with care.<br />Shared with purpose.
      </PullQuote>

      {/* FIELD NOTES — a magazine photo strip of the landscapes, mills and
          pantry staples behind the collection. No posed or AI-generated
          people; every image here is a real product, landscape or still-life
          asset, ready to be swapped for verified documentary photography. */}
      <section className="bg-forest/[0.03] border-t border-forest/5 section-padding py-24 md:py-36">
        <div className="max-w-7xl mx-auto">
          <Reveal className="mb-12 md:mb-16">
            <p className="label-ornate mb-3"><LeafBullet /> Field Notes</p>
            <h2 className="heading-md">From the Gardens, Forests &amp; Kitchens</h2>
          </Reveal>

          <RevealGroup className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
            {/* Tea garden — wide */}
            <RevealItem className="md:col-span-7">
              <EditorialImage
                src="/images/story/orchard-fruit.jpg"
                alt="Seasonal fruit from a Himachal orchard"
                caption="Seasonal fruit is selected at its peak, then prepared in small batches."
                aspect="4/3"
                sizes="(max-width: 768px) 100vw, 58vw"
              />
            </RevealItem>
            {/* Honey harvest — tall portrait */}
            <RevealItem className="md:col-span-5">
              <EditorialImage
                src="/images/story/mountain-stream.jpg"
                alt="A clear mountain stream in Kangra Valley"
                caption="The living waters that feed the foothills of Kangra Valley."
                aspect="3/4"
                sizes="(max-width: 768px) 100vw, 42vw"
              />
            </RevealItem>
            {/* SHG women — tall portrait */}
            <RevealItem className="md:col-span-5">
              <EditorialImage
                src="/images/pickle-galgal.jpg"
                alt="Traditional galgal pickle"
                caption="A regional pantry staple, prepared with slow, patient methods."
                aspect="3/4"
                sizes="(max-width: 768px) 100vw, 42vw"
              />
            </RevealItem>
            {/* Gharat — wide */}
            <RevealItem className="md:col-span-7">
              <EditorialImage
                src="/images/story/gharat-mill.jpg"
                alt="A traditional Himalayan gharat water mill with a wooden waterwheel beside a mountain stream"
                caption="The gharat — a water mill that has ground grain in these valleys for centuries."
                aspect="4/3"
                sizes="(max-width: 768px) 100vw, 58vw"
              />
            </RevealItem>
          </RevealGroup>
        </div>
      </section>

      {/* OUR STANDARDS — trust signals as an editorial index, not badges. */}
      <TrustSignals />

      {/* STORIES */}
      <JournalSection />

      {/* MEET OUR PRODUCERS */}
      <MakersSection />

      {/* TESTIMONIALS */}
      <TestimonialSection />

      {/* NEWSLETTER */}
      <NewsletterSection />
    </>
  );
}

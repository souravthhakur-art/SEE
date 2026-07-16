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
      <section className="relative min-h-[92svh] md:min-h-[95vh] flex items-center overflow-hidden bg-forest select-none">
        {/* Background — Natural vibrant Kangra Valley tea gardens */}
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/images/hero-kangra-valley.jpg"
            alt="Misty tea gardens of Kangra Valley at dawn with the Dhauladhar range"
            fill
            className="object-cover object-center hero-zoom"
            sizes="100vw"
            priority
          />
        </div>
        
        {/* Soft overlay to preserve image clarity while keeping text perfectly legible */}
        <div className="absolute inset-0 bg-black/30 z-[2]" />

        <div className="relative z-10 section-padding w-full pt-36 pb-20 md:pt-44 md:pb-24 flex items-center justify-center max-w-7xl mx-auto">
          <div className="max-w-2xl text-center flex flex-col items-center justify-center">
            <p className="text-[10px] md:text-xs uppercase tracking-[0.25em] text-ivory/80 mb-5 font-body font-semibold">
              Bringing the Himalayas Home.
            </p>
            <h1 className="font-heading text-3.5xl sm:text-4.5xl md:text-5xl lg:text-5.5xl text-ivory mb-5 leading-[1.12] tracking-tight text-balance">
              Authentic Himalayan Flavours,<br /> Brought to Your Home.
            </h1>
            <p className="text-xs sm:text-sm md:text-[15px] text-ivory/75 max-w-md md:max-w-lg mx-auto mb-10 leading-relaxed font-body">
              Tea, honey and pantry essentials sourced directly from farmers and producers across Himachal Pradesh.
            </p>
            <div className="flex flex-row items-center justify-center gap-4">
              <Link href="/shop" className="btn-primary">
                SHOP COLLECTION
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
              </Link>
              <Link href="/subscriptions" className="btn-outline-ivory">
                SUBSCRIBE NOW
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator with text */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 z-10 select-none cursor-pointer">
          <span className="text-[8.5px] uppercase tracking-[0.3em] text-ivory/55 font-body font-semibold">Scroll</span>
          <ChevronDown className="w-3.5 h-3.5 text-ivory/55 animate-bounce" strokeWidth={1} />
        </div>
      </section>

      {/* EDITORIAL INTRODUCTION — STORY BEFORE COMMERCE */}
      <section className="bg-ivory section-padding py-16 md:py-24 relative overflow-hidden text-center">
        <div className="max-w-3xl mx-auto space-y-6 md:space-y-8 flex flex-col items-center justify-center">
          {/* Refined editorial intro card */}
          <div className="space-y-4 md:space-y-6 flex flex-col items-center">
            <Reveal className="space-y-2.5 flex flex-col items-center">
              <p className="text-[9px] md:text-[10px] uppercase tracking-[0.25em] text-forest/60 font-body font-semibold flex items-center gap-2 justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block animate-pulse" />
                Rooted in Himachal Pradesh
              </p>
              <h2 className="font-heading text-3.5xl sm:text-4.5xl text-forest leading-tight tracking-tight text-balance max-w-2xl">
                Honouring the Small Batch, Preserving the Old Ways.
              </h2>
            </Reveal>
            <Reveal>
              <p className="font-body text-xs sm:text-sm md:text-[15px] text-charcoal/80 leading-relaxed text-balance max-w-2xl">
                Deep within the mist-layered valleys of Himachal Pradesh, Palum Dhara preserves a heritage of high-altitude farming. We source exceptional, single-origin teas, wild honeys, and seasonal pantry staples directly from local growers and women-led cooperatives. By honoring traditional craftsmanship, we bring the pure, unhurried essence of the Himalayas directly to your table—cultivating trust, batch provenance, and deep respect for the land.
              </p>
            </Reveal>
            <Reveal className="pt-1">
              <span className="font-heading italic text-lg text-forest/80 tracking-wide font-medium flex items-center gap-3 justify-center">
                Palum Dhara
                <span className="w-6 h-px bg-forest/20 inline-block" />
              </span>
            </Reveal>
          </div>
        </div>
      </section>


      <TrustBar />

      <section className="section-padding py-24 md:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between gap-6 mb-8 md:mb-10">
            <div>
              <p className="label-ornate mb-3"><LeafBullet /> Shop the Collection</p>
              <h2 className="heading-md">From Himachal Pradesh, for your pantry</h2>
            </div>
            <Link href="/shop" className="hidden md:inline-flex items-center gap-2 text-sm tracking-wide text-forest hover:text-forest-light transition-colors">
              View all products <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 md:gap-7">
            {allProducts.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
          <div className="mt-7 text-center md:hidden">
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
      <section className="section-padding py-24 md:py-36">
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
      <section className="bg-forest/5 section-padding py-24 md:py-36">
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
      <section className="section-padding py-24 md:py-36">
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

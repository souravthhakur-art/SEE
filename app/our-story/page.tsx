import type { Metadata } from "next";
import Image from "next/image";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { Divider, LeafBullet } from "@/components/ui/ornament";
import { EditorialImage, PullQuote } from "@/components/ui/editorial";

export const metadata: Metadata = {
  title: "Our Story | Palum Dhara",
  description: "From Palampur, with care — how Palum Dhara sources tea, honey, preserves and pickles directly from growers and women-led SHGs across Himachal Pradesh.",
};

export default function OurStoryPage() {
  return (
    <>
      {/* Header */}
      <section className="section-padding pt-28 pb-12">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <p className="label mb-4">Our Story</p>
            <h1 className="heading-lg mb-8">From Palampur, With Care</h1>
          </Reveal>
        </div>
      </section>

      {/* Main Narrative Split */}
      <section className="section-padding py-12 md:py-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <Reveal>
            <EditorialImage
              src="/images/story/mountain-stream.jpg"
              alt="A clear Himalayan mountain stream rushing over mossy stones in Kangra Valley"
              caption="The crystal clear stream that flows near Palampur, providing water to the ancient soils of the tea gardens."
              aspect="3/4"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </Reveal>
          <Reveal className="space-y-6">
            <p className="label-ornate mb-2">
              <LeafBullet /> Our Origin
            </p>
            <h2 className="heading-md mb-6">The Living Waters</h2>
            <div className="space-y-6 text-base text-charcoal/85 leading-relaxed font-body">
              <p>
                Palum Dhara was born from a simple observation: some of India&apos;s finest orthodox tea 
                was being grown in the Kangra Valley, yet its true character rarely crossed the boundaries of the hills. 
                Instead of celebrating its single-origin nature, much of it was blended or sold under generic labels.
              </p>
              <p>
                Our name is a tribute to this land. <strong>Palum</strong> is the local Pahari word for water, 
                from which the town of Palampur derives its name. <strong>Dhara</strong> signifies a stream, a continuous flow. 
                Together, they represent the pristine glacial melt that feeds the deep root systems of our tea gardens 
                along the foothills of the majestic Dhauladhar range.
              </p>
              <p>
                We do not seek to be a mass market brand. Palum Dhara is a curated window into the mountain lifestyle. 
                We bring you rare teas, wild raw honeys, and handcrafted stone-ground preserves made in small households, 
                preserving old ways for modern tables.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Heritage Timeline Metrics */}
      <section className="bg-forest/5 section-padding py-20">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-14">
            <p className="label-ornate justify-center mb-3">
              <LeafBullet /> Landmarks of Time
            </p>
            <h2 className="heading-md">The History We Carry</h2>
            <Divider className="ornament-divider mt-4 h-5 w-48" />
          </Reveal>

          <RevealGroup className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <RevealItem className="bg-ivory/80 border border-forest/10 p-6 rounded-sm text-center warm-card">
              <p className="font-heading text-4xl lg:text-5xl text-forest mb-2">1849</p>
              <p className="text-[10px] text-charcoal/50 uppercase tracking-widest leading-normal">First Tea Planted in Kangra</p>
            </RevealItem>
            <RevealItem className="bg-ivory/80 border border-forest/10 p-6 rounded-sm text-center warm-card">
              <p className="font-heading text-4xl lg:text-5xl text-forest mb-2">2005</p>
              <p className="text-[10px] text-charcoal/50 uppercase tracking-widest leading-normal">GI Tag Awarded to Kangra Tea</p>
            </RevealItem>
            <RevealItem className="bg-ivory/80 border border-forest/10 p-6 rounded-sm text-center warm-card">
              <p className="font-heading text-4xl lg:text-5xl text-forest mb-2">1,420m</p>
              <p className="text-[10px] text-charcoal/50 uppercase tracking-widest leading-normal">Average Elevation of Gardens</p>
            </RevealItem>
            <RevealItem className="bg-ivory/80 border border-forest/10 p-6 rounded-sm text-center warm-card">
              <p className="font-heading text-4xl lg:text-5xl text-forest mb-2">100%</p>
              <p className="text-[10px] text-charcoal/50 uppercase tracking-widest leading-normal">Pure Orthodox Whole Leaves</p>
            </RevealItem>
          </RevealGroup>
        </div>
      </section>

      {/* Pull Quote */}
      <PullQuote className="py-20 md:py-28" attribution="A Kangra Valley Saying">
        The tea garden is a quiet teacher. It grows only when the wind is cool and the soil is deep.
      </PullQuote>

      {/* Sourcing Story */}
      <section className="section-padding py-16 md:py-24 border-t border-forest/5">
        <div className="max-w-4xl mx-auto">
          <Reveal className="mb-16 text-center">
            <p className="label-ornate justify-center mb-3">
              <LeafBullet /> Our Philosophy
            </p>
            <h2 className="heading-md">How We Source</h2>
            <p className="text-sm text-charcoal/50 tracking-wide mt-2">Direct. Transparent. Traditional.</p>
          </Reveal>

          <div className="space-y-16">
            <Reveal className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              <div className="md:col-span-1 text-center md:text-left">
                <span className="font-heading text-3xl text-gold-light font-light border-b border-forest/10 pb-2 md:block">01</span>
              </div>
              <div className="md:col-span-11">
                <h3 className="font-heading text-xl text-forest mb-3">Hand-Plucked Orthodox Tea</h3>
                <p className="text-base text-charcoal/70 leading-relaxed mb-4">
                  We harvest exclusively orthodox tea from tiny family-owned plantations around Palampur, Dharamshala, and Baijnath. Orthodox tea represents the traditional way — pluck two leaves and a bud, roll them carefully to preserve essential oils, and dry them slowly under mountain air. By avoiding industrial CTC methods, we keep the leaf whole and the flavor complex.
                </p>
                <div className="border-t border-forest/5 pt-4 mt-4 flex items-center justify-between text-xs text-charcoal/50 font-body">
                  <span>Harvest Frequency: Single Origin, Spring &amp; Monsoon</span>
                  <span>Origin: Palampur District</span>
                </div>
              </div>
            </Reveal>

            <Reveal className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              <div className="md:col-span-1 text-center md:text-left">
                <span className="font-heading text-3xl text-gold-light font-light border-b border-forest/10 pb-2 md:block">02</span>
              </div>
              <div className="md:col-span-11">
                <h3 className="font-heading text-xl text-forest mb-3">Unfiltered Wild Forest Honey</h3>
                <p className="text-base text-charcoal/70 leading-relaxed mb-4">
                  Our honeys are raw, unheated, and unfiltered. Collected by tribal and traditional beekeepers who scale towering trees in Chamba and Bir, our honeys are packed with wild enzymes and mountain pollen. We do not blend honeys or add corn syrup. If the jar crystallizes, it is proof of its untamed mountain origin.
                </p>
                <div className="border-t border-forest/5 pt-4 mt-4 flex items-center justify-between text-xs text-charcoal/50 font-body">
                  <span>Purity: 100% Raw Wild Harvest</span>
                  <span>Origin: Bir &amp; Chamba Forest Ranges</span>
                </div>
              </div>
            </Reveal>

            <Reveal className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              <div className="md:col-span-1 text-center md:text-left">
                <span className="font-heading text-3xl text-gold-light font-light border-b border-forest/10 pb-2 md:block">03</span>
              </div>
              <div className="md:col-span-11">
                <h3 className="font-heading text-xl text-forest mb-3">Community-Made Preserves &amp; Pickles</h3>
                <p className="text-base text-charcoal/70 leading-relaxed mb-4">
                  All our pickles and preserves are created by small, women-led Self Help Groups (SHGs) across Mandi. They make use of seasonal fruit gathered from local valley orchards — like the sour galgal lemons or wild plums. Prepared in small brass vessels according to ancient household recipes, these items offer genuine Himalayan nourishment while directly supporting rural mountain economies.
                </p>
                <div className="border-t border-forest/5 pt-4 mt-4 flex items-center justify-between text-xs text-charcoal/50 font-body">
                  <span>Craftsmanship: Hand-milled in brass vessels</span>
                  <span>Partners: 12+ Self Help Groups</span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Water Mill Heritage Narrative with Image */}
      <section className="bg-forest/5 section-padding py-20 md:py-28">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <Reveal className="space-y-6 lg:order-2">
            <EditorialImage
              src="/images/story/gharat-mill.jpg"
              alt="A traditional Himalayan gharat water mill with a wooden waterwheel beside a mountain stream"
              caption="The Gharat water mills are silent monuments of Himalayan wisdom, operating on clean water streams."
              aspect="4/3"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </Reveal>
          <Reveal className="space-y-6 lg:order-1">
            <p className="label-ornate mb-2">
              <LeafBullet /> Traditional Wisdom
            </p>
            <h2 className="heading-md">The Gharat &amp; The Grounding</h2>
            <div className="space-y-6 text-base text-charcoal/85 leading-relaxed font-body">
              <p>
                Walk along any stream in Himachal Pradesh, and you might hear the gentle, rhythmic hum of a <strong>Gharat</strong>. 
                These traditional watermills, constructed from local timber and stone, have served mountain communities for hundreds of years. 
                Powered purely by rushing streams, they grind grains slowly without heating them, preserving every drop of nutrient and flavor.
              </p>
              <p>
                To us, the Gharat represents the ultimate standard of mountain craftsmanship. It runs on natural energy, respects the riverbed, 
                and serves the community. We strive to bring that same balance and respect into how we select, bottle, and deliver every single 
                item in our collection.
              </p>
              <p>
                When you taste Palum Dhara, you are tasting a slower way of living — one that is aligned with the rise and fall of the seasons, 
                the cold mountain winds, and the pure living waters of the valley.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

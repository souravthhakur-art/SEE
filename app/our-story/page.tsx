import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Story | Palum Dhara",
  description: "From Palampur, with care — how Palum Dhara sources tea, honey, preserves and pickles directly from growers and women-led SHGs across Himachal Pradesh.",
};

export default function OurStoryPage() {
  return (
    <>
      <section className="section-padding py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          <p className="label mb-4">Our Story</p>
          <h1 className="heading-lg mb-12">From Palampur, With Care</h1>

          <div className="space-y-8 body-lg">
            <p>
              Palum Dhara was born from a simple observation: some of India's finest tea 
              was being grown in the Kangra Valley, yet most of it never left the region.
            </p>
            <p>
              The name comes from "Palum" — the local word for water, from which Palampur 
              derives its name — and "Dhara," meaning stream or flow. Together they evoke 
              the living waters that feed the tea gardens of the Dhauladhar range.
            </p>
            <p>
              We work directly with small tea growers, beekeepers, and women-led Self Help 
              Groups across Himachal Pradesh. No intermediaries. No blending with inferior 
              leaves. Every product is traceable to its source — harvest date, estate name, 
              elevation, and batch number.
            </p>
            <p>
              Our mission is not to become the biggest tea brand in India. It is to become 
              the most trusted source for authentic Himalayan products — starting with Kangra 
              tea, and growing carefully from there.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="font-heading text-4xl text-forest mb-2">1849</p>
              <p className="text-xs text-charcoal/50 tracking-wide">Tea first planted in Kangra</p>
            </div>
            <div className="text-center">
              <p className="font-heading text-4xl text-forest mb-2">2005</p>
              <p className="text-xs text-charcoal/50 tracking-wide">GI Tag awarded to Kangra Tea</p>
            </div>
            <div className="text-center">
              <p className="font-heading text-4xl text-forest mb-2">1,420m</p>
              <p className="text-xs text-charcoal/50 tracking-wide">Average elevation of our gardens</p>
            </div>
            <div className="text-center">
              <p className="font-heading text-4xl text-forest mb-2">0</p>
              <p className="text-xs text-charcoal/50 tracking-wide">CTC tea — Orthodox only</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sourcing Story */}
      <section className="bg-forest/5 section-padding py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          <p className="label mb-4">How We Source</p>
          <h2 className="heading-md mb-12">Direct. Traceable. Fair.</h2>

          <div className="space-y-12">
            <div className="flex gap-6">
              <div className="w-12 h-12 bg-forest/10 flex items-center justify-center flex-shrink-0">
                <span className="font-heading text-xl text-forest">01</span>
              </div>
              <div>
                <h3 className="font-heading text-xl text-forest mb-2">Tea from Kangra Valley</h3>
                <p className="body-lg">
                  Sourced directly from small tea gardens across Palampur, Dharamshala, 
                  and Baijnath. Each batch is hand-plucked and orthodox processed. We pay 
                  above-market rates to ensure growers can sustain their craft.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-12 h-12 bg-forest/10 flex items-center justify-center flex-shrink-0">
                <span className="font-heading text-xl text-forest">02</span>
              </div>
              <div>
                <h3 className="font-heading text-xl text-forest mb-2">Honey from Himalayan Forests</h3>
                <p className="body-lg">
                  Collected by traditional beekeepers from wild colonies and apiaries 
                  placed in rhododendron meadows. Raw, unfiltered, and never heated.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-12 h-12 bg-forest/10 flex items-center justify-center flex-shrink-0">
                <span className="font-heading text-xl text-forest">03</span>
              </div>
              <div>
                <h3 className="font-heading text-xl text-forest mb-2">Preserves & Pickles from SHGs</h3>
                <p className="body-lg">
                  Crafted by women-led Self Help Groups using family recipes passed down 
                  through generations. Every jar supports rural livelihoods and preserves 
                  Himalayan food traditions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

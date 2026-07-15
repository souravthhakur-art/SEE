import Image from "next/image";
import { makers } from "@/lib/data";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";

export default function MakersSection() {
  return (
    <section className="bg-ivory-dark/30 section-padding py-20 md:py-32">
      <div className="max-w-7xl mx-auto">
        <Reveal className="max-w-2xl mb-14 md:mb-20">
          <p className="label mb-3">Our Makers</p>
          <h2 className="heading-md mb-6">The Hands Behind Every Harvest</h2>
          <p className="body-lg">
            Every product carries the name of the village, the collective, or the
            self-help group that made it. No intermediaries — just direct relationships
            with the people of Himachal Pradesh.
          </p>
        </Reveal>

        <RevealGroup className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
          {makers.map((maker) => (
            <RevealItem key={maker.id} className="group">
              <div className="relative aspect-[3/4] bg-ivory-dark mb-6 overflow-hidden">
                {maker.makerImage ? (
                  <Image
                    src={maker.makerImage}
                    alt={`${maker.village} — home of ${maker.name}`}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-wood-light/15 via-ivory-dark to-forest/10">
                    <span className="font-heading text-5xl text-forest/10">{maker.role.charAt(0)}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="badge bg-ivory/90 border-forest/20">{maker.role}</span>
                </div>
              </div>
              <h3 className="font-heading text-xl text-forest mb-1">{maker.name}</h3>
              <p className="label mb-3">{maker.village}</p>
              <p className="text-sm text-charcoal/60 leading-relaxed">{maker.story}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

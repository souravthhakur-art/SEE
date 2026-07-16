import { Compass, Droplet, Award, Fingerprint } from "lucide-react";

const trustItems = [
  { icon: Compass, label: "Single Origin Leaves", sublabel: "From Palampur & Baijnath gardens" },
  { icon: Droplet, label: "Raw Unfiltered Nectar", sublabel: "Harvested from Bir & Chamba ranges" },
  { icon: Award, label: "Traditional Micro-Batches", sublabel: "Prepared slowly in brass vessels" },
  { icon: Fingerprint, label: "Detailed Batch Sourcing", sublabel: "Harvest details on every jar" },
];

export default function TrustBar() {
  return (
    <div className="bg-forest/5 border-y border-forest/10 backdrop-blur-sm">
      <div className="section-padding py-6 md:py-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {trustItems.map((item) => (
            <div key={item.label} className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-3.5">
              <item.icon className="w-5 h-5 text-gold flex-shrink-0" strokeWidth={1.2} />
              <div>
                <p className="text-xs font-heading font-medium text-forest tracking-wider uppercase mb-1">{item.label}</p>
                <p className="text-[10px] text-charcoal/65 tracking-wide font-body">{item.sublabel}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

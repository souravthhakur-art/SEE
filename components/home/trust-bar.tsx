import { Truck, ShieldCheck, RefreshCcw, Leaf } from "lucide-react";

const trustItems = [
  { icon: Truck, label: "Free Shipping", sublabel: "On orders above ₹499" },
  { icon: ShieldCheck, label: "Cash on Delivery", sublabel: "Available across India" },
  { icon: RefreshCcw, label: "Easy Returns", sublabel: "7-day no questions asked" },
  { icon: Leaf, label: "Direct from Source", sublabel: "Sourced from Kangra Valley" },
];

export default function TrustBar() {
  return (
    <div className="bg-forest/5 border-y border-forest/5">
      <div className="section-padding py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4">
          {trustItems.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <item.icon className="w-5 h-5 text-forest/60 flex-shrink-0" strokeWidth={1.5} />
              <div>
                <p className="text-xs font-medium text-forest tracking-wide">{item.label}</p>
                <p className="text-[10px] text-charcoal/50">{item.sublabel}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

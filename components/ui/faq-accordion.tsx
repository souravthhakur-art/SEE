"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { FaqItem } from "@/types";

interface FaqAccordionProps {
  faqs: FaqItem[];
}

export default function FaqAccordion({ faqs }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-forest/10 border-t border-forest/10">
      {faqs.map((faq, index) => (
        <div key={faq.question} className="py-6">
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="flex items-start justify-between w-full text-left gap-4"
            aria-expanded={openIndex === index}
          >
            <span className="font-heading text-lg text-forest">{faq.question}</span>
            <ChevronDown
              className={`w-5 h-5 text-forest/40 flex-shrink-0 mt-1 transition-transform duration-300 ${
                openIndex === index ? "rotate-180" : ""
              }`}
              strokeWidth={1.5}
            />
          </button>
          {openIndex === index && (
            <p className="mt-4 text-sm text-charcoal/70 leading-relaxed pr-8">
              {faq.answer}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

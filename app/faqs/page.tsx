import type { Metadata } from "next";
import FaqAccordion from "@/components/ui/faq-accordion";
import { faqs } from "@/lib/data";

export const metadata: Metadata = {
  title: "FAQs | Palum Dhara",
  description: "Shipping, returns, storage, and sourcing — answers to common questions about Palum Dhara products.",
};

export default function FAQsPage() {
  return (
    <>
      <section className="section-padding py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          <p className="label mb-4">Support</p>
          <h1 className="heading-lg mb-12">Frequently Asked Questions</h1>

          <FaqAccordion faqs={faqs} />

          <div className="mt-16 p-8 bg-forest/5 border border-forest/10 text-center">
            <p className="font-heading text-xl text-forest mb-3">Still have questions?</p>
            <p className="text-sm text-charcoal/60 mb-6">
              We're here to help. Reach out on WhatsApp for quick responses.
            </p>
            <a
              href="https://wa.me/919999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

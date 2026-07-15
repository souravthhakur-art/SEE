import type { Metadata } from "next";
import { Suspense } from "react";
import TrustBar from "@/components/home/trust-bar";
import NewsletterSection from "@/components/ui/newsletter-section";
import ShopBrowser from "@/components/shop/shop-browser";
import { products, shopSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: shopSettings.seo.title,
  description: shopSettings.seo.description,
};

export default function ShopPage() {
  return (
    <>
      {/* Hero */}
      <section className="section-padding py-12 md:py-16">
        <div className="max-w-7xl mx-auto">
          <p className="label mb-3">{shopSettings.title}</p>
          <h1 className="heading-lg mb-4">{shopSettings.heading}</h1>
          <p className="body-lg max-w-2xl">{shopSettings.description}</p>
          <p className="text-xs text-charcoal/50 mt-4 tracking-wide">
            {products.length} carefully curated products today. More regional specialties arriving soon.
          </p>
        </div>
      </section>

      <Suspense fallback={null}>
        <ShopBrowser />
      </Suspense>

      <TrustBar />
      <NewsletterSection />
    </>
  );
}

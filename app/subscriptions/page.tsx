import type { Metadata } from "next";
import SubscriptionSection from "@/components/subscription/subscription-section";
import NewsletterSection from "@/components/ui/newsletter-section";

export const metadata: Metadata = {
  title: "Subscriptions | Palum Dhara",
  description:
    "Seasonal Himalayan harvest boxes from Palum Dhara — Kangra tea, wild honey, and traditional preserves, curated and delivered to your door.",
};

export default function SubscriptionsPage() {
  return (
    <>
      <section className="section-padding py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          <p className="label mb-3">Seasonal Harvests</p>
          <h1 className="heading-lg mb-4">The Himalayan Pantry</h1>
          <p className="body-lg max-w-xl">
            Curated harvest boxes, delivered on a rhythm that suits your
            home.
          </p>
        </div>
      </section>

      <SubscriptionSection />
      <NewsletterSection />
    </>
  );
}

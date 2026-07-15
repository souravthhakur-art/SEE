import type { Metadata } from "next";
import ArticleCard from "@/components/journal/article-card";
import NewsletterSection from "@/components/ui/newsletter-section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { journalArticles } from "@/lib/data";

export const metadata: Metadata = {
  title: "Journal | Palum Dhara",
  description:
    "Stories from the Kangra Valley — the people, places, and process behind Palum Dhara's tea, honey, and preserves.",
};

export default function JournalPage() {
  return (
    <>
      <section className="section-padding py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <p className="label mb-4">The Journal</p>
            <h1 className="heading-lg mb-6">Stories from the Valley</h1>
            <p className="body-lg max-w-xl">
              Notes on the harvests, the makers, and the mountains behind
              every jar and tin.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section-padding pb-20 md:pb-32">
        <div className="max-w-7xl mx-auto">
          <RevealGroup className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
            {journalArticles.map((article) => (
              <RevealItem key={article.id}>
                <ArticleCard article={article} />
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <NewsletterSection />
    </>
  );
}

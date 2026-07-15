import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { journalArticles } from "@/lib/data";
import ArticleCard from "@/components/journal/article-card";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";

export default function JournalSection() {
  return (
    <section className="section-padding py-20 md:py-32">
      <div className="max-w-7xl mx-auto">
        <Reveal className="flex items-end justify-between mb-14 md:mb-20">
          <div>
            <p className="label mb-3">The Journal</p>
            <h2 className="heading-md">Stories from the Valley</h2>
          </div>
          <Link
            href="/journal"
            className="hidden md:flex items-center gap-2 text-sm tracking-wide text-forest hover:text-forest-light transition-colors"
          >
            Read More <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </Link>
        </Reveal>

        <RevealGroup className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
          {journalArticles.map((article) => (
            <RevealItem key={article.id}>
              <ArticleCard article={article} />
            </RevealItem>
          ))}
        </RevealGroup>

        <div className="mt-10 md:hidden text-center">
          <Link href="/journal" className="inline-flex items-center gap-2 text-sm tracking-wide text-forest">
            Read More <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </section>
  );
}

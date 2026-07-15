import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ArticleCard from "@/components/journal/article-card";
import NewsletterSection from "@/components/ui/newsletter-section";
import { journalArticles } from "@/lib/data";

interface ArticlePageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return journalArticles.map((article) => ({
    id: article.id,
  }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { id } = await params;
  const article = journalArticles.find((a) => a.id === id);

  if (!article) {
    return { title: "Article Not Found | Palum Dhara" };
  }

  return {
    title: `${article.title} | Palum Dhara Journal`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: article.thumbnail ? [article.thumbnail] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { id } = await params;
  const article = journalArticles.find((a) => a.id === id);

  if (!article) {
    notFound();
  }

  const relatedArticles = journalArticles
    .filter((a) => a.id !== article.id)
    .slice(0, 3);

  return (
    <>
      {/* Breadcrumb */}
      <div className="section-padding py-6">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-charcoal/50 flex-wrap">
            <li>
              <Link href="/" className="hover:text-forest transition-colors">
                Home
              </Link>
            </li>
            <li>
              <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.5} />
            </li>
            <li>
              <Link href="/journal" className="hover:text-forest transition-colors">
                Journal
              </Link>
            </li>
            <li>
              <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.5} />
            </li>
            <li className="text-charcoal/80" aria-current="page">
              {article.title}
            </li>
          </ol>
        </nav>
      </div>

      {/* Article Header */}
      <section className="section-padding pb-10 md:pb-16">
        <div className="max-w-3xl mx-auto">
          <p className="label mb-4">
            {article.topic} · {article.readTime}
          </p>
          <h1 className="heading-lg mb-8">{article.title}</h1>
        </div>
      </section>

      {/* Hero image */}
      <section className="section-padding pb-16 md:pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="relative aspect-[16/9] bg-ivory-dark overflow-hidden">
            {article.thumbnail ? (
              <Image
                src={article.thumbnail}
                alt={article.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 80vw"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-forest/8 via-ivory-dark to-wood-light/10">
                <span className="font-heading text-8xl text-forest/10">
                  {article.topic.charAt(0)}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Article body — only real fields are shown; no fabricated copy */}
      <section className="section-padding pb-16 md:pb-24">
        <div className="max-w-3xl mx-auto">
          <p className="text-lg text-charcoal/80 leading-relaxed">
            {article.excerpt}
          </p>
          <p className="text-sm text-charcoal/40 mt-10 italic">
            The full story is on its way — check back soon for the complete
            piece.
          </p>
        </div>
      </section>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="bg-forest/5 section-padding py-16 md:py-24">
          <div className="max-w-7xl mx-auto">
            <p className="label mb-4">More Stories</p>
            <h2 className="heading-sm mb-12">From the Journal</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {relatedArticles.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </div>
        </section>
      )}

      <NewsletterSection />
    </>
  );
}

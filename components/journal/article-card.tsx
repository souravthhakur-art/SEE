import Image from "next/image";
import Link from "next/link";
import type { JournalArticle } from "@/types";

export default function ArticleCard({ article }: { article: JournalArticle }) {
  return (
    <Link href={`/journal/${article.id}`} className="group block">
      <div className="relative aspect-[4/3] bg-ivory-dark mb-6 overflow-hidden">
        {article.thumbnail ? (
          <Image
            src={article.thumbnail}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-forest/8 via-ivory-dark to-wood-light/10">
            <span className="font-heading text-6xl text-forest/10">{article.topic.charAt(0)}</span>
          </div>
        )}
      </div>
      <p className="label mb-3">{article.topic} · {article.readTime}</p>
      <h3 className="font-heading text-2xl text-forest mb-3 group-hover:text-forest-light transition-colors">
        {article.title}
      </h3>
      <p className="text-sm text-charcoal/60 leading-relaxed">{article.excerpt}</p>
    </Link>
  );
}

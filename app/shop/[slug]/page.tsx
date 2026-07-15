import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { PullQuote } from "@/components/ui/editorial";
import ProductCard from "@/components/product/product-card";
import NewsletterSection from "@/components/ui/newsletter-section";
import ProductGallery from "@/components/product/product-gallery";
import ProductInfo from "@/components/product/product-info";
import { products, categories } from "@/lib/data";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

// Only build pages for active, shop-visible products
const shopProducts = products.filter(
  (p) => p.showInShop && p.status === "active"
);

export async function generateStaticParams() {
  return shopProducts.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = shopProducts.find((p) => p.slug === slug);

  if (!product) {
    return { title: "Product Not Found | Palum Dhara" };
  }

  return {
    title: `${product.name} | Palum Dhara`,
    description: product.shortDescription,
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: product.image ? [product.image] : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = shopProducts.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  // Editorial related products from data model
  let relatedProducts = shopProducts.filter((p) =>
    product.relatedProducts.includes(p.slug)
  );

  // Fallback to same-category if admin hasn't set relatedProducts
  if (relatedProducts.length === 0) {
    relatedProducts = shopProducts
      .filter((p) => p.category === product.category && p.slug !== product.slug)
      .slice(0, 3);
  }

  // Build breadcrumb
  const categoryLabel =
    categories.find((c) => c.id === product.category)?.label || product.category;

  return (
    <>
      {/* Breadcrumb */}
      <Reveal className="section-padding py-6">
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
              <Link href="/shop" className="hover:text-forest transition-colors">
                Shop
              </Link>
            </li>
            <li>
              <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.5} />
            </li>
            <li>
              <Link
                href={`/shop?category=${product.category}`}
                className="hover:text-forest transition-colors"
              >
                {categoryLabel}
              </Link>
            </li>
            <li>
              <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.5} />
            </li>
            <li className="text-charcoal/80" aria-current="page">
              {product.name}
            </li>
          </ol>
        </nav>
      </Reveal>

      {/* Product Detail */}
      <section className="section-padding pb-16 md:pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            <ProductGallery product={product} />
            <ProductInfo product={product} />
          </div>
        </div>
      </section>

      {/* Why We Selected This */}
      <section className="bg-forest/5 section-padding py-16 md:py-24">
        <Reveal className="max-w-3xl mx-auto">
          <p className="label mb-4">Why We Selected This</p>
          <p className="text-base text-charcoal/80 leading-relaxed">
            {product.whyWeSelected}
          </p>
        </Reveal>
      </section>

      {/* Editorial pull quote — gives the product page a magazine cadence
          between the curator's note and the region story. */}
      <PullQuote className="py-14 md:py-20">
        Every harvest tells a story.
      </PullQuote>

      {/* Region Story — Editorial split layout */}
      <section className="section-padding py-16 md:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {product.regionImage && (
              <div className="relative aspect-[4/3] bg-ivory-dark overflow-hidden">
                <Image
                  src={product.regionImage}
                  alt={`${product.originDistrict} region`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            )}
            <div>
              <p className="label mb-4">The Region</p>
              <p className="text-base text-charcoal/80 leading-relaxed mb-8">
                {product.regionStory}
              </p>
              {product.ingredients && product.ingredients.length > 0 && (
                <div>
                  <p className="label mb-3">Ingredients</p>
                  <div className="flex flex-wrap gap-2">
                    {product.ingredients.map((ing) => (
                      <span key={ing} className="badge">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How To Enjoy */}
      <section className="bg-forest/5 section-padding py-16 md:py-24">
        <Reveal className="max-w-3xl mx-auto">
          <p className="label mb-4">How To Enjoy</p>
          <div className="flex flex-wrap gap-3">
            {product.howToEnjoy.map((item) => (
              <span
                key={item}
                className="text-xs tracking-wide text-forest/70 px-3 py-2 border border-forest/15"
              >
                {item}
              </span>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Shipping & Storage */}
      <section className="section-padding py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <p className="label mb-4">Shipping</p>
              <p className="text-sm text-charcoal/70 leading-relaxed">
                {product.shippingNote}
              </p>
            </div>
            <div>
              <p className="label mb-4">Storage</p>
              <p className="text-sm text-charcoal/70 leading-relaxed">
                {product.storage}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Traceability — Premium grid with icons */}
      <section className="bg-forest/5 section-padding py-16 md:py-24">
        <Reveal className="max-w-4xl mx-auto">
          <p className="label mb-8 text-center">Traceability</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-forest/10">
            <TraceabilityItem
              icon="🌱"
              label="Harvest"
              value={product.traceability.harvest}
            />
            <TraceabilityItem
              icon="📍"
              label="Estate"
              value={product.traceability.estate}
            />
            <TraceabilityItem
              icon="🏔"
              label="Altitude"
              value={product.traceability.elevation}
            />
            <TraceabilityItem
              icon="👨‍🌾"
              label="Craft"
              value={product.traceability.craft}
            />
            <TraceabilityItem
              icon="🏷"
              label="Batch"
              value={product.traceability.batch}
              className="col-span-2 md:col-span-1"
            />
          </div>
        </Reveal>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="section-padding py-16 md:py-24">
          <div className="max-w-7xl mx-auto">
            <p className="label mb-4">You May Also Like</p>
            <h2 className="heading-sm mb-12">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {relatedProducts.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <NewsletterSection />
    </>
  );
}

function TraceabilityItem({
  icon,
  label,
  value,
  className = "",
}: {
  icon: string;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`bg-ivory p-6 text-center ${className}`}>
      <span className="text-2xl mb-2 block">{icon}</span>
      <p className="text-[10px] uppercase tracking-[0.2em] text-charcoal/40 mb-1">
        {label}
      </p>
      <p className="font-heading text-lg text-forest">{value}</p>
    </div>
  );
}

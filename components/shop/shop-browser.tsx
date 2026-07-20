"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/product/product-card";
import { products, categories, shopSettings } from "@/lib/data";

export default function ShopBrowser() {
  // Product page breadcrumbs link to /shop?category=X — this reads that
  // as the initial filter. Category pill clicks still just update local
  // state from here on (no need to keep the URL in sync on every click).
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<string>(
    () => searchParams.get("category") || "all"
  );
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("featured");

  const filteredProducts = useMemo(() => {
    let result = products;

    // Category filter
    if (activeCategory !== "all") {
      result = result.filter((p) => p.category === activeCategory);
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.originDistrict.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sortBy) {
      case "newest":
        result = [...result].sort((a, b) => (b.displayOrder || 0) - (a.displayOrder || 0));
        break;
      case "price-asc":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      default:
        // featured — use displayOrder
        result = [...result].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    }

    return result;
  }, [activeCategory, search, sortBy]);

  return (
    <>
      {/* Search + Filters */}
      <section className="section-padding py-5 md:py-6 border-b border-forest/5 sticky top-16 md:top-[4.5rem] bg-ivory/95 backdrop-blur-md z-40">
        <div className="max-w-7xl mx-auto">
          {/* Search */}
          <div className="mb-4">
            <div className="relative max-w-md">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={shopSettings.searchPlaceholder}
                aria-label="Search products"
                className="w-full px-4 py-3 pl-10 bg-transparent border border-forest/20 text-sm text-forest placeholder:text-charcoal/40 focus:outline-none focus:border-forest transition-colors"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setActiveCategory("all")}
              aria-pressed={activeCategory === "all"}
              className={`px-4 py-2 text-xs tracking-[0.15em] uppercase whitespace-nowrap transition-all duration-300 ${
                activeCategory === "all"
                  ? "bg-forest text-ivory"
                  : "border border-forest/20 text-charcoal/60 hover:border-forest/40"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                aria-pressed={activeCategory === cat.id}
                className={`px-4 py-2 text-xs tracking-[0.15em] uppercase whitespace-nowrap transition-all duration-300 ${
                  activeCategory === cat.id
                    ? "bg-forest text-ivory"
                    : "border border-forest/20 text-charcoal/60 hover:border-forest/40"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="section-padding py-10 md:py-14">
        <div className="max-w-7xl mx-auto">
          {/* Count + Sort */}
          <div className="flex items-center justify-between mb-8">
            <p className="text-xs text-charcoal/50 tracking-wide">
              Showing {filteredProducts.length} {filteredProducts.length === 1 ? "Product" : "Products"}
            </p>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort products"
                className="appearance-none px-4 py-2 pr-8 bg-transparent border border-forest/20 text-xs tracking-wide text-forest focus:outline-none focus:border-forest cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-asc">Price ↑</option>
                <option value="price-desc">Price ↓</option>
              </select>
              <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-forest pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-charcoal/50 mb-6">{shopSettings.emptyState.message}</p>
              <p className="text-charcoal/40 mb-8">{shopSettings.emptyState.subMessage}</p>
              <button
                onClick={() => {
                  setActiveCategory("all");
                  setSearch("");
                }}
                className="px-6 py-3 bg-forest text-ivory text-xs tracking-[0.15em] uppercase hover:bg-forest-light transition-colors"
              >
                {shopSettings.emptyState.cta}
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

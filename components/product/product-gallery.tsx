"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import type { Product } from "@/lib/data";

interface ProductGalleryProps {
  product: Product;
}

export default function ProductGallery({ product }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Build gallery from product image + galleryImages + regionImage fallback
  const allImages = Array.from(
    new Set(
      [
        product.image,
        ...product.galleryImages,
        product.regionImage,
      ].filter((image): image is string => Boolean(image))
    )
  );

  return (
    <div className="space-y-4">
      {/* Main Image — crossfade between active images instead of a hard swap */}
      <div className="relative aspect-[4/5] bg-ivory-dark overflow-hidden">
        <AnimatePresence initial={false} mode="sync">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={allImages[activeIndex] || "/images/placeholder-product.jpg"}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority={activeIndex === 0}
            />
          </motion.div>
        </AnimatePresence>
        {product.badge && activeIndex === 0 && (
          <div className="absolute top-4 left-4 z-10">
            <span className="inline-block text-[10px] tracking-[0.15em] uppercase bg-forest text-ivory px-2.5 py-1">
              {product.badge}
            </span>
          </div>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-ivory/60 flex items-center justify-center z-10">
            <span className="text-sm tracking-[0.2em] uppercase text-charcoal/60">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex gap-3">
          {allImages.map((img, i) => (
            <button
              key={`${img}-${i}`}
              onClick={() => setActiveIndex(i)}
              className={`relative w-20 h-20 bg-ivory-dark overflow-hidden border-2 transition-colors duration-300 ${
                i === activeIndex
                  ? "border-forest"
                  : "border-transparent hover:border-forest/30"
              }`}
              aria-label={`View ${product.name} image ${i + 1}`}
            >
              <Image
                src={img}
                alt={`${product.name} view ${i + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

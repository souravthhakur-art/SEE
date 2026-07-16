"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Product } from "@/lib/data";
import { CornerMotif } from "@/components/ui/ornament";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group block rounded-sm transition-all duration-500 ease-out hover:-translate-y-1 hover:warm-card-hover focus-visible:outline-none"
    >
      {/* Image */}
      <div className="relative w-full aspect-[4/5] mb-4 overflow-hidden warm-card bg-ivory-dark">
        <Image
          src={product.image || "/images/placeholder-product.jpg"}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
        />

        {/* Single admin-controlled badge */}
        {product.badge && (
          <div className="absolute top-3 left-3">
            <span className="inline-block text-[10px] tracking-[0.15em] uppercase bg-forest text-ivory px-2.5 py-1">
              {product.badge}
            </span>
          </div>
        )}

        {/* Tiny Guler corner motif — top-right, fades in on hover.
            Decorative only; never competes with the product image. */}
        <CornerMotif className="absolute top-2 right-2 w-6 h-6 text-ivory/0 group-hover:text-ivory/45 transition-colors duration-500 pointer-events-none" />
      </div>

      {/* Content */}
      <div className="space-y-1">
        {/* Origin district — provenance */}
        <p className="text-[11px] uppercase tracking-[0.22em] text-forest/55">
          FROM {product.originDistrict}
        </p>

        {/* Product name */}
        <h3 className="font-heading text-xl text-forest group-hover:text-forest-light transition-colors duration-300">
          {product.name}
        </h3>

        {/* Short description — two lines max */}
        <p className="text-xs text-charcoal/55 leading-relaxed line-clamp-2 pt-1">
          {product.shortDescription}
        </p>

        {/* Weight */}
        <p className="text-xs text-charcoal/40">
          {product.weight}
        </p>

        {/* Price */}
        <p className="font-heading text-2xl text-forest pt-2">
          ₹{product.price}
        </p>

        {/* Shipping nudge */}
        <p className="text-[10px] text-charcoal/40">
          Free delivery on orders above ₹1000
        </p>
      </div>

      {/* Explore link */}
      <div className="mt-4 inline-flex items-center gap-2 border-b border-forest/25 pb-1 text-xs tracking-[0.15em] uppercase text-forest/70 group-hover:border-forest group-hover:text-forest transition-colors">
        Explore
        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 ease-out group-hover:translate-x-1.5" />
      </div>
    </Link>
  );
}

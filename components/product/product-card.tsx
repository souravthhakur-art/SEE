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
      <div className="space-y-1.5 pt-2">
        {/* Origin district & Weight — clean provenance */}
        <p className="text-[9.5px] uppercase tracking-[0.22em] text-forest/60 font-body">
          {product.originDistrict} • {product.weight}
        </p>

        {/* Product name */}
        <h3 className="font-heading text-lg md:text-xl text-forest group-hover:text-forest-light transition-colors duration-300 leading-snug">
          {product.name}
        </h3>

        {/* Price */}
        <p className="font-heading text-lg md:text-xl text-forest/90">
          ₹{product.price}
        </p>
      </div>

      {/* Explore link */}
      <div className="mt-3.5 inline-flex items-center gap-1.5 border-b border-forest/15 pb-0.5 text-[10px] tracking-[0.16em] uppercase text-forest/75 group-hover:border-forest group-hover:text-forest transition-colors font-body font-medium">
        Explore
        <ArrowRight className="w-3 h-3 transition-transform duration-300 ease-out group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { Minus, Plus, Truck, Package, Shield } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import type { Product } from "@/lib/data";

interface ProductInfoProps {
  product: Product;
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const totalPrice = product.price * quantity;

  const handleAddToCart = () => {
    if (!product.inStock) return;
    setAdding(true);
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity,
      weight: product.weight,
    });
    setTimeout(() => setAdding(false), 600);
  };

  return (
    <>
      {/* Desktop Info */}
      <div className="flex flex-col">
        {/* Provenance */}
        <p className="text-[11px] uppercase tracking-[0.22em] text-forest/55 mb-2">
          FROM {product.originDistrict}
        </p>

        {/* Name */}
        <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl text-forest mb-4">
          {product.name}
        </h1>

        {/* Curator's introduction */}
        <p className="text-sm text-charcoal/70 leading-relaxed mb-4">
          {product.description}
        </p>

        {/* Facts row */}
        <ProductFacts product={product} />

        {/* Price */}
        <div className="mb-6">
          <p className="font-heading text-3xl text-forest mb-1">
            ₹{product.price}
          </p>
          <p className="text-xs text-charcoal/40">{product.weight}</p>
        </div>

        {/* Quantity — Desktop */}
        <div className="hidden md:flex items-center gap-4 mb-6">
          <span className="text-xs text-charcoal/60 tracking-wide">
            Quantity
          </span>
          <QuantityStepper
            quantity={quantity}
            setQuantity={setQuantity}
            disabled={!product.inStock}
          />
        </div>

        {/* Actions — Desktop */}
        <div className="hidden md:flex flex-col gap-3 mb-8">
          {product.inStock ? (
            <>
              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="btn-primary w-full disabled:opacity-60"
              >
                {adding ? "Adding..." : "Add to Cart"}
              </button>
              <Link
                href={`/checkout?mode=buy-now&slug=${product.slug}&qty=${quantity}`}
                className="btn-outline w-full text-center block"
              >
                Buy Now
              </Link>
            </>
          ) : (
            <button
              disabled
              className="w-full btn-outline border-charcoal/10 text-charcoal/40 bg-charcoal/5 cursor-not-allowed py-3.5"
            >
              Out of Stock
            </button>
          )}
        </div>

        {/* Shipping note */}
        <p className="text-[10px] text-charcoal/40 mb-10">
          Free delivery on orders above ₹1000. {product.shippingNote}
        </p>

        {/* Trust strip */}
        <div className="flex flex-wrap gap-6">
          <span className="flex items-center gap-1.5 text-[10px] tracking-wide text-charcoal/50">
            <Truck className="w-3.5 h-3.5 text-forest/40" strokeWidth={1.5} />
            Free delivery above ₹1000
          </span>
          <span className="flex items-center gap-1.5 text-[10px] tracking-wide text-charcoal/50">
            <Package className="w-3.5 h-3.5 text-forest/40" strokeWidth={1.5} />
            Packed Fresh
          </span>
          <span className="flex items-center gap-1.5 text-[10px] tracking-wide text-charcoal/50">
            <Shield className="w-3.5 h-3.5 text-forest/40" strokeWidth={1.5} />
            Secure Payments
          </span>
        </div>
      </div>

      {/* Sticky Mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-ivory border-t border-forest/10 p-4 md:hidden">
        <div className="max-w-lg mx-auto space-y-3">
          {/* Quantity + Price row */}
          <div className="flex items-center justify-between">
            <QuantityStepper
              quantity={quantity}
              setQuantity={setQuantity}
              compact
              disabled={!product.inStock}
            />
            <div className="text-right">
              <p className="font-heading text-xl text-forest">
                ₹{totalPrice}
              </p>
              <p className="text-[10px] text-charcoal/40">
                incl. GST
              </p>
            </div>
          </div>

          {/* Buttons */}
          {product.inStock ? (
            <div className="flex gap-2.5">
              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="btn-outline flex-1 px-4 py-2.5 text-[11px] disabled:opacity-60"
              >
                {adding ? "Adding..." : "Add to Cart"}
              </button>
              <Link
                href={`/checkout?mode=buy-now&slug=${product.slug}&qty=${quantity}`}
                className="btn-primary flex-1 px-4 py-2.5 text-[11px] text-center"
              >
                Buy Now
              </Link>
            </div>
          ) : (
            <button
              disabled
              className="w-full btn-outline border-charcoal/10 text-charcoal/40 bg-charcoal/5 cursor-not-allowed py-2.5 text-[11px]"
            >
              Out of Stock
            </button>
          )}
        </div>
      </div>

      {/* Spacer for sticky bar on mobile */}
      <div className="h-36 md:hidden" />
    </>
  );
}

// ============================================================
// SHARED SUB-COMPONENTS
// ============================================================

function QuantityStepper({
  quantity,
  setQuantity,
  compact = false,
  disabled = false,
}: {
  quantity: number;
  setQuantity: (q: number) => void;
  compact?: boolean;
  disabled?: boolean;
}) {
  return (
    <div
      className={`flex items-center border border-forest/20 ${
        compact ? "h-9" : ""
      } ${disabled ? "opacity-50" : ""}`}
    >
      <button
        onClick={() => setQuantity(Math.max(1, quantity - 1))}
        disabled={disabled}
        className="px-3 py-2 text-forest/60 hover:text-forest transition-colors disabled:cursor-not-allowed"
        aria-label="Decrease quantity"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span
        className={`px-3 text-forest min-w-[2.5rem] text-center ${
          compact ? "text-sm py-1" : "text-sm py-2"
        }`}
      >
        {quantity}
      </span>
      <button
        onClick={() => setQuantity(quantity + 1)}
        disabled={disabled}
        className="px-3 py-2 text-forest/60 hover:text-forest transition-colors disabled:cursor-not-allowed"
        aria-label="Increase quantity"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function ProductFacts({ product }: { product: Product }) {
  const attributes = product.attributes || [];

  if (attributes.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-6">
      {attributes.map((fact, i) => (
        <span key={i} className="flex items-center gap-3">
          <span className="text-xs text-charcoal/50">{fact}</span>
          {i < attributes.length - 1 && (
            <span className="w-1 h-1 rounded-full bg-charcoal/20" />
          )}
        </span>
      ))}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";

interface CartDrawerProps {
  /** Matches Navigation's transparent-over-hero styling on the home page. */
  floating?: boolean;
}

export default function CartDrawer({ floating = false }: CartDrawerProps) {
  const [open, setOpen] = useState(false);
  // Zustand's persist middleware hydrates from localStorage on the client
  // only, so the cart contents can differ between the server render (always
  // empty) and the first client render (persisted items). Guard against that
  // with a mounted flag so the badge, item list, and subtotal always match
  // the server HTML during hydration, then update after mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const storeItems = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const getTotal = useCartStore((s) => s.getTotal);
  const getItemCount = useCartStore((s) => s.getItemCount);

  const items = mounted ? storeItems : [];
  const total = mounted ? getTotal() : 0;
  const count = mounted ? getItemCount() : 0;

  return (
    <>
      {/* Cart Toggle */}
      <button
        onClick={() => setOpen(true)}
        className={`relative p-3 md:p-2 transition-colors ${
          floating ? "text-ivory/85 hover:text-ivory" : "text-stone-900 hover:text-forest"
        }`}
        aria-label={`Cart with ${count} items`}
      >
        <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-forest text-ivory text-[9px] flex items-center justify-center rounded-full">
            {count}
          </span>
        )}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-ivory shadow-2xl transform transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-forest/10">
            <h2 className="font-heading text-xl text-forest">
              Your Cart ({count})
            </h2>
            <button
              onClick={() => setOpen(false)}
              className="p-2 text-charcoal/50 hover:text-forest transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingBag
                  className="w-12 h-12 text-charcoal/20 mb-4"
                  strokeWidth={1}
                />
                <p className="text-charcoal/60 mb-2">Your cart is empty</p>
                <button
                  onClick={() => setOpen(false)}
                  className="text-sm text-forest hover:underline"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <ul className="space-y-6">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex gap-4 pb-6 border-b border-forest/5 last:border-0"
                  >
                    {/* Image */}
                    <Link
                      href={`/shop/${item.slug}`}
                      onClick={() => setOpen(false)}
                      className="relative w-20 h-24 bg-ivory-dark flex-shrink-0 overflow-hidden"
                    >
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                        referrerPolicy="no-referrer"
                      />
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/shop/${item.slug}`}
                        onClick={() => setOpen(false)}
                        className="text-sm text-forest font-medium truncate hover:underline"
                      >
                        {item.name}
                      </Link>
                      <p className="text-xs text-charcoal/40 mb-3">
                        {item.weight}
                      </p>

                      <div className="flex items-center justify-between">
                        {/* Quantity */}
                        <div className="flex items-center border border-forest/20">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="px-2 py-1 text-forest/60 hover:text-forest"
                            aria-label="Decrease"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs text-forest min-w-[1.5rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="px-2 py-1 text-forest/60 hover:text-forest"
                            aria-label="Increase"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Price + Remove */}
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-forest font-medium">
                            ₹{item.price * item.quantity}
                          </span>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1 text-charcoal/30 hover:text-red-600 transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="px-6 py-5 border-t border-forest/10 bg-ivory">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-charcoal/60">Subtotal</span>
                <span className="font-heading text-xl text-forest">
                  ₹{total}
                </span>
              </div>
              <p className="text-[10px] text-charcoal/40 mb-4">
                Shipping calculated at checkout. Free delivery above ₹1000.
              </p>
              <Link
                href="/checkout"
                onClick={() => setOpen(false)}
                className="block w-full px-8 py-3 bg-forest text-ivory text-sm tracking-widest uppercase text-center hover:bg-forest-light transition-colors"
              >
                Checkout
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="block w-full mt-2 text-xs text-charcoal/50 hover:text-forest transition-colors text-center"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

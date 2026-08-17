"use client";

// Horizontal kit teaser cards — the highest-basket-value objects, on the
// home screen. "Add All" adds the whole kit in one badge bump.

import Link from "next/link";
import { useState } from "react";
import { kits } from "@/lib/data";
import { useCart } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { effectivePrice } from "@/lib/pricing";
import ProductImage from "./ProductImage";

export default function KitsRow() {
  const { addMany } = useCart();
  const { show: showToast } = useToast();
  const [addedId, setAddedId] = useState<number | null>(null);

  function handleAdd(e: React.MouseEvent, kitId: number) {
    e.preventDefault();
    const kit = kits.find((k) => k.id === kitId);
    if (!kit || addedId !== null) return;
    addMany(kit.items.map(({ product, quantity }) => ({ product, quantity })));
    setAddedId(kitId);
    showToast(`${kit.name} added to your toolbox`);
    setTimeout(() => setAddedId(null), 1400);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[18px] font-bold text-text1">Job-Ready Kits</h2>
        <Link href="/kits" className="spring-tap text-[13px] text-brand font-semibold">See All</Link>
      </div>
      <div className="flex overflow-x-auto snap-x scrollbar-hide -mx-4 px-4 gap-3 pb-1">
        {kits.map((kit) => {
          const total = kit.items.reduce((s, { product, quantity }) => s + effectivePrice(product) * quantity, 0);
          const count = kit.items.reduce((s, { quantity }) => s + quantity, 0);
          const isAdded = addedId === kit.id;

          return (
            <Link
              key={kit.id}
              href="/kits"
              className="snap-start flex-shrink-0 w-[220px] block bg-surface rounded-3xl border border-separator shadow-card overflow-hidden active:bg-bg transition-colors"
            >
              <div className="p-4">
                {/* Item thumbnails */}
                <div className="flex -space-x-2 mb-3">
                  {kit.items.slice(0, 4).map(({ product }) => (
                    <div key={product.id} className="ring-2 ring-surface rounded-xl">
                      <ProductImage product={product} size="sm" className="!w-10 !h-10 !rounded-xl" />
                    </div>
                  ))}
                  {kit.items.length > 4 && (
                    <div className="w-10 h-10 rounded-xl bg-bg border border-separator flex items-center justify-center ring-2 ring-surface">
                      <span className="text-[11px] font-bold text-text2">+{kit.items.length - 4}</span>
                    </div>
                  )}
                </div>

                <p className="text-[15px] font-bold text-text1 leading-tight">{kit.name}</p>
                <p className="text-[12px] text-text2 mt-0.5">{count} items · ${total.toFixed(2)}</p>

                <button
                  onClick={(e) => handleAdd(e, kit.id)}
                  className={`spring-tap mt-3 w-full py-2 rounded-xl text-[13px] font-bold text-white transition-colors duration-200 ${
                    isAdded ? "bg-success" : "bg-cta"
                  }`}
                >
                  {isAdded ? (
                    <span className="inline-flex items-center gap-1.5 animate-pop-in">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6L4.5 8.5L10 3" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Added
                    </span>
                  ) : (
                    "Add All"
                  )}
                </button>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

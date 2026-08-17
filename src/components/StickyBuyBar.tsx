"use client";

// Fixed bottom buy bar for the product detail page — price + CTA never
// scroll out of reach.

import { Product } from "@/lib/types";
import Price from "./Price";

interface Props {
  product: Product;
  isAdded: boolean;
  inCartQty?: number;
  onAdd: () => void;
}

export default function StickyBuyBar({ product, isAdded, inCartQty, onAdd }: Props) {
  return (
    // Sits directly above the bottom tab bar
    <div className="fixed bottom-[58px] left-0 right-0 z-40 glass border-t border-separator/40">
      <div className="max-w-lg mx-auto flex items-center gap-4 px-4 py-2.5">
        <div className="flex flex-col">
          <Price product={product} size="lg" />
          <span className="text-[11px] text-text2 -mt-0.5">{product.unit}</span>
        </div>
        <button
          onClick={onAdd}
          disabled={!product.inStock}
          className={`spring-tap flex-1 py-3.5 rounded-2xl text-[16px] font-semibold text-white shadow-card-lg transition-colors duration-200 ${
            !product.inStock ? "bg-separator" : isAdded ? "bg-success" : "bg-cta"
          }`}
        >
          {isAdded ? (
            <span className="flex items-center justify-center gap-2 animate-pop-in">
              <svg className="animate-check-pop" width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M2.5 7.5L6 11L12.5 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Added to Toolbox
            </span>
          ) : !product.inStock ? (
            "Out of Stock"
          ) : inCartQty ? (
            `Add Again · ${inCartQty} in Toolbox`
          ) : (
            "Add to Toolbox"
          )}
        </button>
      </div>
    </div>
  );
}

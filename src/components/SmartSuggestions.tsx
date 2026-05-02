"use client";

import { useCart } from "@/lib/store";
import { smartSuggestions } from "@/lib/data";
import { useState } from "react";
import ProductImage from "./ProductImage";

export default function SmartSuggestions() {
  const { addItem, items } = useCart();
  const [added, setAdded] = useState<Record<number, boolean>>({});

  const visible = smartSuggestions.filter(
    (p) => !items.find((i) => i.product.id === p.id)
  );

  if (visible.length === 0) return null;

  function handleAdd(productId: number) {
    const product = smartSuggestions.find((p) => p.id === productId);
    if (!product) return;
    addItem(product);
    setAdded((prev) => ({ ...prev, [productId]: true }));
    setTimeout(() => setAdded((prev) => ({ ...prev, [productId]: false })), 1100);
  }

  return (
    <div className="px-4 py-1">
      <p className="text-[11px] font-bold text-text2 uppercase tracking-widest mb-2.5">
        You may need
      </p>
      <div className="rounded-2xl overflow-hidden border border-separator shadow-card bg-surface">
        {visible.slice(0, 3).map((product, idx) => (
          <div key={product.id}>
            {idx > 0 && <div className="h-px bg-separator ml-4" />}
            <div className="flex items-center gap-3 px-4 py-3.5">
              <ProductImage product={product} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold text-text1 truncate">{product.name}</p>
                <p className="text-[12px] text-text2 mt-0.5">
                  ${product.price.toFixed(2)} · {product.unit}
                </p>
              </div>
              <button
                onClick={() => handleAdd(product.id)}
                className={`spring-tap-strong flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-bold transition-colors duration-200 ml-3 ${
                  added[product.id]
                    ? "bg-success text-white animate-pop-in"
                    : "bg-brand-light text-brand"
                }`}
              >
                {added[product.id] ? (
                  <>
                    <svg className="animate-check-pop" width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6L4.5 8.5L10 3" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Added
                  </>
                ) : (
                  <>
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <path d="M5.5 1.5V9.5M1.5 5.5H9.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                    </svg>
                    Add
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { Product } from "@/lib/types";
import { useCart } from "@/lib/store";
import { useRef, useState } from "react";

interface Props {
  product: Product;
  showCategory?: boolean;
}

const categoryStyle: Record<string, { border: string; labelColor: string }> = {
  Compound:  { border: "#F59E0B", labelColor: "#B45309" },
  Tape:      { border: "#60A5FA", labelColor: "#1D4ED8" },
  Fasteners: { border: "#94A3B8", labelColor: "#475569" },
  Beads:     { border: "#A78BFA", labelColor: "#6D28D9" },
  Finishing: { border: "#34D399", labelColor: "#065F46" },
  Tools:     { border: "#1A8FA8", labelColor: "#136F84" },
};

export default function ProductRow({ product, showCategory = false }: Props) {
  const { addItem, items } = useCart();
  const [addedKey, setAddedKey] = useState(0);
  const [isAdded, setIsAdded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inCart = items.find((i) => i.product.id === product.id);
  const style = categoryStyle[product.category] ?? categoryStyle.Tools;

  function handleAdd() {
    addItem(product);
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsAdded(true);
    setAddedKey((k) => k + 1);
    timerRef.current = setTimeout(() => setIsAdded(false), 1100);
  }

  return (
    <div className="flex items-center bg-surface relative overflow-hidden">
      {/* Category left accent bar */}
      <div
        className="w-[3px] self-stretch flex-shrink-0 rounded-r-full"
        style={{ backgroundColor: style.border }}
      />

      <div className="flex items-center flex-1 min-w-0 px-4 py-4 gap-3">
        {/* Text */}
        <div className="flex-1 min-w-0">
          {showCategory && (
            <span
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: style.labelColor }}
            >
              {product.category}
            </span>
          )}
          <p className="text-[15px] font-semibold text-text1 leading-snug truncate mt-0.5">
            {product.name}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[13px] font-bold text-text1">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-[12px] text-text2">{product.unit}</span>
          </div>
        </div>

        {/* Add button */}
        <button
          key={addedKey}
          onClick={handleAdd}
          className={`spring-tap-strong flex-shrink-0 flex items-center justify-center gap-1.5 rounded-full text-[13px] font-bold transition-colors duration-200 ${
            isAdded
              ? "bg-success text-white px-3.5 py-2 animate-pop-in"
              : inCart
              ? "bg-brand text-white px-3.5 py-2"
              : "bg-bg text-text1 w-10 h-10"
          }`}
        >
          {isAdded ? (
            <>
              <svg className="animate-check-pop" width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M2 6.5L5 9.5L11 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="animate-slide-up">Added</span>
            </>
          ) : inCart ? (
            <>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 2V10M2 6H10" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span>{inCart.quantity}</span>
            </>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2V14M2 8H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

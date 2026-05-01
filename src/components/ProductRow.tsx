"use client";

import { Product } from "@/lib/types";
import { useCart } from "@/lib/store";
import { useState } from "react";

interface Props {
  product: Product;
  showCategory?: boolean;
}

export default function ProductRow({ product, showCategory = false }: Props) {
  const { addItem, items } = useCart();
  const [added, setAdded] = useState(false);
  const inCart = items.find((i) => i.product.id === product.id);

  function handleAdd() {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 800);
  }

  return (
    <div className="flex items-center justify-between px-4 py-3.5 bg-surface active:bg-bg transition-colors">
      <div className="flex-1 min-w-0 pr-3">
        {showCategory && (
          <span className="text-[11px] font-medium text-brand uppercase tracking-wide">
            {product.category}
          </span>
        )}
        <p className="text-[15px] font-medium text-text1 truncate leading-tight">
          {product.name}
        </p>
        <p className="text-[13px] text-text2 mt-0.5">
          ${product.price.toFixed(2)} · {product.unit}
        </p>
      </div>
      <button
        onClick={handleAdd}
        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-semibold transition-all duration-150 active:scale-95 min-w-[64px] justify-center ${
          added
            ? "bg-success text-white"
            : inCart
            ? "bg-brand-light text-brand border border-brand/20"
            : "bg-bg text-text1"
        }`}
      >
        {added ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 7L5.5 10.5L12 3.5" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2V12M2 7H12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        )}
        {added ? "Added" : inCart ? `${inCart.quantity} in cart` : "Add"}
      </button>
    </div>
  );
}

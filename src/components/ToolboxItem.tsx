"use client";

import { CartItem } from "@/lib/types";
import { useCart } from "@/lib/store";
import { useState } from "react";
import { effectivePrice } from "@/lib/pricing";
import ProductImage from "./ProductImage";
import Price from "./Price";

interface Props {
  item: CartItem;
}

export default function ToolboxItem({ item }: Props) {
  const { setQuantity, removeItem } = useCart();
  const [qtyKey, setQtyKey] = useState(0);

  function decrement() {
    if (item.quantity === 1) removeItem(item.product.id);
    else { setQuantity(item.product.id, item.quantity - 1); setQtyKey((k) => k + 1); }
  }

  function increment() {
    setQuantity(item.product.id, item.quantity + 1);
    setQtyKey((k) => k + 1);
  }

  return (
    <div className="flex items-center gap-3.5 px-4 py-3.5 bg-surface">
      <ProductImage product={item.product} size="sm" />

      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-text1 leading-tight truncate">{item.product.name}</p>
        <p className="text-[12px] text-text2 mt-0.5">{item.product.brand} · {item.product.unit}</p>
        <div className="mt-1">
          <Price product={item.product} size="sm" />
        </div>
      </div>

      {/* Qty stepper */}
      <div className="flex items-center gap-0 bg-bg rounded-full border border-separator p-0.5">
        <button
          onClick={decrement}
          className="spring-tap-strong w-8 h-8 rounded-full flex items-center justify-center"
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path
              d={item.quantity === 1 ? "M2 2L9 9M9 2L2 9" : "M2 5.5H9"}
              stroke={item.quantity === 1 ? "#EF4444" : "#1D1D1F"}
              strokeWidth="1.75" strokeLinecap="round"
            />
          </svg>
        </button>
        <span key={qtyKey} className="w-7 text-center text-[14px] font-bold text-text1 tabular-nums animate-fade-up">
          {item.quantity}
        </span>
        <button
          onClick={increment}
          className="spring-tap-strong w-8 h-8 rounded-full flex items-center justify-center"
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path d="M5.5 2V9M2 5.5H9" stroke="#1D1D1F" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Line total — crossfades on qty change */}
      <p key={`total-${qtyKey}`} className="text-[13px] font-bold text-text1 w-14 text-right tabular-nums animate-value-update">
        ${(effectivePrice(item.product) * item.quantity).toFixed(2)}
      </p>
    </div>
  );
}

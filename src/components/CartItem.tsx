"use client";

import { CartItem as CartItemType } from "@/lib/types";
import { useCart } from "@/lib/store";
import { useState } from "react";

interface Props {
  item: CartItemType;
}

export default function CartItem({ item }: Props) {
  const { setQuantity, removeItem } = useCart();
  const [qtyKey, setQtyKey] = useState(0);

  function decrement() {
    if (item.quantity === 1) {
      removeItem(item.product.id);
    } else {
      setQuantity(item.product.id, item.quantity - 1);
      setQtyKey((k) => k + 1);
    }
  }

  function increment() {
    setQuantity(item.product.id, item.quantity + 1);
    setQtyKey((k) => k + 1);
  }

  return (
    <div className="flex items-center px-4 py-4 bg-surface gap-3">
      {/* Product info */}
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold text-text1 leading-tight">{item.product.name}</p>
        <p className="text-[13px] text-text2 mt-0.5">
          ${item.product.price.toFixed(2)} · {item.product.unit}
        </p>
      </div>

      {/* Quantity stepper */}
      <div className="flex items-center bg-bg rounded-full border border-separator p-0.5 gap-0.5">
        <button
          onClick={decrement}
          className="spring-tap-strong w-9 h-9 flex items-center justify-center rounded-full active:bg-separator transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d={item.quantity === 1 ? "M2 2L10 10M10 2L2 10" : "M2 6H10"}
              stroke={item.quantity === 1 ? "#C8102E" : "#1D1D1F"}
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <span
          key={qtyKey}
          className="w-8 text-center text-[15px] font-bold text-text1 tabular-nums animate-slide-up"
        >
          {item.quantity}
        </span>

        <button
          onClick={increment}
          className="spring-tap-strong w-9 h-9 flex items-center justify-center rounded-full active:bg-separator transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 2V10M2 6H10" stroke="#1D1D1F" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Line total */}
      <p className="text-[14px] font-bold text-text1 w-[58px] text-right tabular-nums">
        ${(item.product.price * item.quantity).toFixed(2)}
      </p>
    </div>
  );
}

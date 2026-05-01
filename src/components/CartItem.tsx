"use client";

import { CartItem as CartItemType } from "@/lib/types";
import { useCart } from "@/lib/store";

interface Props {
  item: CartItemType;
}

export default function CartItem({ item }: Props) {
  const { setQuantity, removeItem } = useCart();

  return (
    <div className="flex items-center px-4 py-3.5 bg-surface">
      <div className="flex-1 min-w-0 pr-3">
        <p className="text-[15px] font-medium text-text1 leading-tight">{item.product.name}</p>
        <p className="text-[13px] text-text2 mt-0.5">
          ${item.product.price.toFixed(2)} · {item.product.unit}
        </p>
      </div>
      <div className="flex items-center gap-0">
        <button
          onClick={() => {
            if (item.quantity === 1) removeItem(item.product.id);
            else setQuantity(item.product.id, item.quantity - 1);
          }}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-bg text-text1 active:bg-separator transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6H10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </button>
        <span className="w-8 text-center text-[15px] font-semibold text-text1 tabular-nums">
          {item.quantity}
        </span>
        <button
          onClick={() => setQuantity(item.product.id, item.quantity + 1)}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-bg text-text1 active:bg-separator transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 2V10M2 6H10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <p className="text-[14px] font-semibold text-text1 w-16 text-right tabular-nums">
        ${(item.product.price * item.quantity).toFixed(2)}
      </p>
    </div>
  );
}

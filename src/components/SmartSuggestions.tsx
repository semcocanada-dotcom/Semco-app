"use client";

import { useCart } from "@/lib/store";
import { smartSuggestions } from "@/lib/data";
import { useState } from "react";

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
    setTimeout(() => setAdded((prev) => ({ ...prev, [productId]: false })), 1000);
  }

  return (
    <div className="px-4 py-3">
      <p className="text-[12px] font-semibold text-text2 uppercase tracking-widest mb-2.5">
        You may need
      </p>
      <div className="space-y-0 rounded-2xl overflow-hidden border border-separator">
        {visible.slice(0, 3).map((product, idx) => (
          <div key={product.id}>
            {idx > 0 && <div className="h-px bg-separator ml-4" />}
            <div className="flex items-center justify-between px-4 py-3 bg-surface">
              <div>
                <p className="text-[14px] font-medium text-text1">{product.name}</p>
                <p className="text-[12px] text-text2">${product.price.toFixed(2)} · {product.unit}</p>
              </div>
              <button
                onClick={() => handleAdd(product.id)}
                className={`text-[13px] font-semibold px-3 py-1.5 rounded-full transition-all duration-150 active:scale-95 ${
                  added[product.id]
                    ? "bg-success text-white"
                    : "bg-bg text-brand"
                }`}
              >
                {added[product.id] ? "Added" : "+ Add"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

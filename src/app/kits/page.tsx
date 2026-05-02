"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { kits } from "@/lib/data";
import { useCart } from "@/lib/store";
import ProductImage from "@/components/ProductImage";

export default function KitsPage() {
  const { addItem } = useCart();
  const router = useRouter();
  const [addedKit, setAddedKit] = useState<number | null>(null);
  const [expandedKit, setExpandedKit] = useState<number | null>(null);

  function handleAddAll(kitId: number) {
    const kit = kits.find((k) => k.id === kitId);
    if (!kit) return;
    kit.items.forEach(({ product, quantity }) => {
      for (let i = 0; i < quantity; i++) addItem(product);
    });
    setAddedKit(kitId);
    setTimeout(() => {
      router.push("/toolbox");
    }, 600);
  }

  function kitTotal(kitId: number) {
    const kit = kits.find((k) => k.id === kitId);
    if (!kit) return 0;
    return kit.items.reduce((s, { product, quantity }) => s + product.price * quantity, 0);
  }

  function kitItemCount(kitId: number) {
    const kit = kits.find((k) => k.id === kitId);
    if (!kit) return 0;
    return kit.items.reduce((s, { quantity }) => s + quantity, 0);
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="bg-surface border-b border-separator px-4 pt-14 pb-4">
        <h1 className="text-[22px] font-bold text-text1">Kits</h1>
        <p className="text-[14px] text-text2 mt-0.5">Pre-built bundles for the job site</p>
      </div>

      <div className="px-4 py-4 space-y-4">
        {kits.map((kit) => {
          const isExpanded = expandedKit === kit.id;
          const isAdded = addedKit === kit.id;
          const total = kitTotal(kit.id);
          const count = kitItemCount(kit.id);

          return (
            <div key={kit.id} className="bg-surface rounded-2xl border border-separator shadow-card overflow-hidden">
              {/* Kit header */}
              <button
                className="spring-tap w-full text-left px-4 py-4"
                onClick={() => setExpandedKit(isExpanded ? null : kit.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-brand uppercase tracking-widest">{kit.category}</span>
                    </div>
                    <p className="text-[17px] font-bold text-text1 leading-tight">{kit.name}</p>
                    <p className="text-[13px] text-text2 mt-0.5">{kit.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[14px] font-bold text-text1">${total.toFixed(2)}</span>
                      <span className="text-[12px] text-text2">{count} items</span>
                    </div>
                  </div>

                  {/* Expand chevron */}
                  <div className={`w-8 h-8 rounded-full bg-bg flex items-center justify-center flex-shrink-0 mt-1 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M3 5L7 9L11 5" stroke="#6E6E73" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </button>

              {/* Expanded items */}
              {isExpanded && (
                <div className="border-t border-separator">
                  {kit.items.map((kitItem, idx) => (
                    <div key={kitItem.product.id}>
                      {idx > 0 && <div className="h-px bg-separator ml-4" />}
                      <div className="flex items-center gap-3 px-4 py-3">
                        <ProductImage product={kitItem.product} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-semibold text-text1 truncate">{kitItem.product.name}</p>
                          <p className="text-[12px] text-text2">{kitItem.product.brand} · ${kitItem.product.price.toFixed(2)}</p>
                        </div>
                        <span className="text-[14px] font-bold text-text1 flex-shrink-0">×{kitItem.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add All button */}
              <div className="px-4 pb-4 pt-2">
                <button
                  onClick={() => handleAddAll(kit.id)}
                  disabled={isAdded}
                  className={`spring-tap w-full py-3 rounded-xl text-[15px] font-semibold text-white transition-all duration-200 ${
                    isAdded ? "bg-success" : ""
                  }`}
                  style={isAdded ? undefined : { background: "linear-gradient(135deg, #1C3A6E, #142B52)" }}
                >
                  {isAdded ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8L6 11L13 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Added to Toolbox
                    </span>
                  ) : (
                    "Add All to Toolbox"
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

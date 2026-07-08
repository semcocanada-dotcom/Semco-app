"use client";

import { useParams, useRouter } from "next/navigation";
import { products } from "@/lib/data";
import { useCart } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { useState } from "react";
import ProductImage from "@/components/ProductImage";
import AvatarStack from "@/components/AvatarStack";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem, items } = useCart();
  const { show: showToast } = useToast();
  const [addedKey, setAddedKey] = useState(0);
  const [isAdded, setIsAdded] = useState(false);

  const product = products.find((p) => p.id === Number(params.id));

  if (!product) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-text2">Product not found</p>
      </div>
    );
  }

  const inCart = items.find((i) => i.product.id === product.id);

  function handleAdd() {
    addItem(product!);
    showToast("Added to your toolbox");
    setIsAdded(true);
    setAddedKey((k) => k + 1);
    setTimeout(() => setIsAdded(false), 1200);
  }

  return (
    <div className="min-h-screen bg-bg animate-page-in">
      {/* Back button */}
      <div className="fixed top-0 left-0 right-0 z-40 max-w-lg mx-auto px-4 pt-12 pb-2 pointer-events-none">
        <button
          onClick={() => router.back()}
          className="spring-tap-strong pointer-events-auto w-9 h-9 rounded-full bg-surface/80 border border-separator/60 flex items-center justify-center shadow-card"
          style={{ backdropFilter: "blur(12px)" }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 4L6 8L10 12" stroke="#1D1D1F" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Hero image */}
      <div className="bg-surface">
        <div className="relative mx-4 mt-24 mb-4 rounded-3xl overflow-hidden aspect-square max-h-64">
          <ProductImage product={product} size="lg" className="w-full h-full" />
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Product info */}
        <div>
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-brand uppercase tracking-widest">{product.category}</span>
              <h1 className="text-[22px] font-bold text-text1 leading-tight mt-0.5">{product.name}</h1>
              <p className="text-[14px] text-text2 mt-0.5">{product.brand} · {product.sku}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-[24px] font-bold text-text1">${product.price.toFixed(2)}</p>
              <p className="text-[12px] text-text2">{product.unit}</p>
            </div>
          </div>

          {/* Stock status */}
          <div className="flex items-center gap-2">
            {product.inStock ? (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-success" />
                <span className="text-[13px] font-semibold text-success">In Stock</span>
              </>
            ) : (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-danger" />
                <span className="text-[13px] font-semibold text-danger">Out of Stock</span>
              </>
            )}
          </div>
        </div>

        {/* Social proof */}
        <div className="bg-surface rounded-2xl border border-separator shadow-card px-4 py-3.5">
          <AvatarStack count={product.prosUsing} size="md" />
        </div>

        {/* Description */}
        <div className="bg-surface rounded-2xl border border-separator shadow-card px-4 py-4">
          <p className="text-[11px] font-bold text-text2 uppercase tracking-widest mb-2">About</p>
          <p className="text-[15px] text-text1 leading-relaxed">{product.description}</p>
          <div className="mt-3 pt-3 border-t border-separator flex items-center justify-between">
            <span className="text-[13px] text-text2">Unit</span>
            <span className="text-[13px] font-semibold text-text1">{product.unit}</span>
          </div>
        </div>

        {/* Video placeholder */}
        <div>
          <p className="text-[11px] font-bold text-text2 uppercase tracking-widest mb-2.5">Product Videos</p>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="flex-shrink-0 w-44 h-28 rounded-2xl bg-surface border border-separator shadow-card flex items-center justify-center relative overflow-hidden"
              >
                <div
                  className="absolute inset-0 opacity-20"
                  style={{ background: "linear-gradient(135deg, #1C3A6E, #142B52)" }}
                />
                <div className="relative w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-card">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M6 4.5L12 8L6 11.5V4.5Z" fill="#1C3A6E" />
                  </svg>
                </div>
                <p className="absolute bottom-2.5 left-3 text-[11px] font-semibold text-text2">
                  {i === 1 ? "Application tips" : "Product overview"}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Add to toolbox CTA */}
        <div className="pb-2">
          <button
            key={addedKey}
            onClick={handleAdd}
            disabled={!product.inStock}
            className={`spring-tap w-full py-4 rounded-2xl text-[17px] font-semibold text-white transition-all duration-200 shadow-card-lg ${
              !product.inStock ? "opacity-50" : ""
            } ${isAdded ? "bg-success animate-pop-in" : ""}`}
            style={isAdded || !product.inStock ? undefined : { background: "linear-gradient(135deg, #1C3A6E, #142B52)" }}
          >
            {isAdded ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-check-pop" width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M4 9L7.5 12.5L14 5.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Added to Toolbox
              </span>
            ) : inCart ? (
              `Add Again · ${inCart.quantity} in Toolbox`
            ) : product.inStock ? (
              "Add to Toolbox"
            ) : (
              "Out of Stock"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

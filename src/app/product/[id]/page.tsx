"use client";

import { useParams, useRouter } from "next/navigation";
import { products } from "@/lib/data";
import { useCart } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { useState } from "react";
import { savingsPct } from "@/lib/pricing";
import ProductImage from "@/components/ProductImage";
import AvatarStack from "@/components/AvatarStack";
import SmartSuggestions from "@/components/SmartSuggestions";
import StickyBuyBar from "@/components/StickyBuyBar";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem, items } = useCart();
  const { show: showToast } = useToast();
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
  const pct = savingsPct(product);

  function handleAdd() {
    if (!product!.inStock) return;
    addItem(product!);
    showToast("Added to your toolbox");
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  }

  return (
    <div className="min-h-screen bg-bg animate-page-in pb-32">
      {/* Back button */}
      <div className="fixed top-0 left-0 right-0 z-40 max-w-lg mx-auto px-4 pt-12 pb-2 pointer-events-none">
        <button
          onClick={() => router.back()}
          className="spring-tap-strong pointer-events-auto w-9 h-9 rounded-full bg-surface/85 border border-separator/60 flex items-center justify-center shadow-card"
          style={{ backdropFilter: "blur(12px)" }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 4L6 8L10 12" stroke="#1D1D1F" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Full-bleed hero image */}
      <div className="relative">
        <div className="aspect-square max-h-[380px] w-full overflow-hidden">
          <ProductImage product={product} size="lg" className="w-full h-full !rounded-none" />
        </div>
        {pct > 0 && (
          <span className="absolute top-14 right-4 bg-deal text-white text-[12px] font-bold px-3 py-1.5 rounded-full shadow-card-lg">
            SAVE {pct}%
          </span>
        )}
        {product.badge === "bestseller" && (
          <span className="absolute bottom-9 left-4 bg-text1 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-card">
            BEST SELLER
          </span>
        )}
        {product.badge === "new" && (
          <span className="absolute bottom-9 left-4 bg-brand text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-card">
            NEW
          </span>
        )}
      </div>

      {/* Content sheet overlapping the hero */}
      <div className="relative -mt-6 bg-bg rounded-t-3xl pt-6 px-4 space-y-4">
        {/* Product info */}
        <div>
          <span className="text-[10px] font-bold text-brand uppercase tracking-widest">{product.category}</span>
          <h1 className="text-[24px] font-bold text-text1 leading-tight mt-1">{product.name}</h1>
          <p className="text-[14px] text-text2 mt-1">{product.brand} · {product.sku}</p>

          <div className="flex items-center gap-2 mt-2.5">
            {product.inStock ? (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-success" />
                <span className="text-[13px] font-semibold text-success">In Stock · ready for pickup</span>
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
        <div className="bg-surface rounded-3xl border border-separator shadow-card px-4 py-3.5">
          <AvatarStack count={product.prosUsing} size="md" />
        </div>

        {/* Description */}
        <div className="bg-surface rounded-3xl border border-separator shadow-card px-4 py-4">
          <p className="text-[11px] font-bold text-text2 uppercase tracking-widest mb-2">About</p>
          <p className="text-[15px] text-text1 leading-relaxed">{product.description}</p>
          <div className="mt-3 pt-3 border-t border-separator flex items-center justify-between">
            <span className="text-[13px] text-text2">Unit</span>
            <span className="text-[13px] font-semibold text-text1">{product.unit}</span>
          </div>
        </div>

        {/* Video placeholders */}
        <div>
          <p className="text-[16px] font-bold text-text1 mb-2.5">See It In Action</p>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="flex-shrink-0 w-44 h-28 rounded-2xl bg-surface border border-separator shadow-card flex items-center justify-center relative overflow-hidden"
              >
                <div className="absolute inset-0 opacity-20 bg-cta" />
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

        {/* Cross-sell at the decision point */}
        <div className="-mx-4">
          <SmartSuggestions />
        </div>
      </div>

      {/* Sticky buy bar — price + CTA never scroll away */}
      <StickyBuyBar
        product={product}
        isAdded={isAdded}
        inCartQty={inCart?.quantity}
        onAdd={handleAdd}
      />
    </div>
  );
}

"use client";

// Bold image-led product card for grids and horizontal deal rows.
// Same add feedback stack as ProductRow: check morph + toast + badge bump.

import Link from "next/link";
import { Product } from "@/lib/types";
import { useCart } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { useRef, useState } from "react";
import { savingsPct } from "@/lib/pricing";
import ProductImage from "./ProductImage";
import AvatarStack from "./AvatarStack";
import Price from "./Price";

interface Props {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className = "" }: Props) {
  const { addItem, items } = useCart();
  const { show: showToast } = useToast();
  const [addedKey, setAddedKey] = useState(0);
  const [isAdded, setIsAdded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inCart = items.find((i) => i.product.id === product.id);
  const pct = savingsPct(product);

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    if (!product.inStock) return;
    addItem(product);
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsAdded(true);
    setAddedKey((k) => k + 1);
    showToast("Added to your toolbox");
    timerRef.current = setTimeout(() => setIsAdded(false), 1100);
  }

  return (
    <Link
      href={`/product/${product.id}`}
      className={`block bg-surface rounded-3xl border border-separator shadow-card overflow-hidden active:bg-bg transition-colors ${className}`}
    >
      {/* Image with badges + floating add */}
      <div className="relative p-3 pb-0">
        <ProductImage product={product} size="lg" className="!rounded-2xl" />

        {/* Deal / status badge */}
        {pct > 0 ? (
          <span className="absolute top-5 left-5 bg-deal text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-card">
            SAVE {pct}%
          </span>
        ) : product.badge === "new" ? (
          <span className="absolute top-5 left-5 bg-brand text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-card">
            NEW
          </span>
        ) : product.badge === "bestseller" ? (
          <span className="absolute top-5 left-5 bg-text1 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-card">
            BEST SELLER
          </span>
        ) : null}

        {/* Floating add button */}
        <button
          key={addedKey}
          onClick={handleAdd}
          className={`spring-tap-strong absolute bottom-2.5 right-5 w-9 h-9 rounded-full flex items-center justify-center shadow-card-lg transition-colors duration-150 ${
            isAdded ? "bg-success animate-pop-in" : product.inStock ? "bg-cta" : "bg-separator"
          }`}
        >
          {isAdded ? (
            <svg className="animate-check-pop" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7L5.5 10.5L12 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : inCart ? (
            <span className="text-white text-[12px] font-bold">{inCart.quantity}</span>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2V12M2 7H12" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {/* Info */}
      <div className="px-4 pt-3 pb-3.5">
        <p className="text-[13px] font-semibold text-text1 leading-snug line-clamp-2 min-h-[34px]">
          {product.name}
        </p>
        <p className="text-[11px] text-text2 mt-0.5">{product.brand} · {product.unit}</p>
        <div className="mt-1.5">
          <Price product={product} size="sm" />
        </div>
        <div className="mt-1.5">
          <AvatarStack count={product.prosUsing} size="sm" max={3} />
        </div>
      </div>
    </Link>
  );
}

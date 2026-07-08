"use client";

import Link from "next/link";
import { Product } from "@/lib/types";
import { useCart } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { useRef, useState } from "react";
import ProductImage from "./ProductImage";
import AvatarStack from "./AvatarStack";

interface Props {
  product: Product;
  showCategory?: boolean;
}

export default function ProductRow({ product, showCategory = false }: Props) {
  const { addItem, items } = useCart();
  const { show: showToast } = useToast();
  const [addedKey, setAddedKey] = useState(0);
  const [isAdded, setIsAdded] = useState(false);
  const [showProof, setShowProof] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const proofTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inCart = items.find((i) => i.product.id === product.id);

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    addItem(product);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (proofTimerRef.current) clearTimeout(proofTimerRef.current);
    setIsAdded(true);
    setAddedKey((k) => k + 1);
    showToast("Added to your toolbox");
    if (product.prosUsing > 0) {
      setShowProof(true);
      proofTimerRef.current = setTimeout(() => setShowProof(false), 1000);
    }
    timerRef.current = setTimeout(() => setIsAdded(false), 1100);
  }

  return (
    <Link href={`/product/${product.id}`} className="flex items-center gap-3.5 px-4 py-3.5 bg-surface active:bg-bg transition-colors">
      {/* Product image / placeholder */}
      <ProductImage product={product} size="md" />

      {/* Info */}
      <div className="flex-1 min-w-0">
        {showCategory && (
          <p className="text-[10px] font-bold text-brand uppercase tracking-widest mb-0.5">
            {product.category}
          </p>
        )}
        <p className="text-[14px] font-semibold text-text1 leading-snug truncate">{product.name}</p>
        <p className="text-[12px] text-text2">{product.brand}</p>

        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[14px] font-bold text-text1">${product.price.toFixed(2)}</span>
          <span className="text-[12px] text-text2">{product.unit}</span>
          {product.inStock ? (
            <span className="text-[11px] font-semibold text-success">· In Stock</span>
          ) : (
            <span className="text-[11px] font-semibold text-danger">· Out of Stock</span>
          )}
        </div>

        {/* Social proof */}
        <div className="mt-1.5">
          <AvatarStack count={product.prosUsing} size="sm" max={4} />
        </div>
      </div>

      {/* Add button with confidence flash */}
      <div className="relative flex-shrink-0">
        {showProof && (
          <div className="animate-proof-flash absolute -top-7 right-0 bg-navy text-white text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap pointer-events-none z-10">
            Used by {product.prosUsing} pros
          </div>
        )}
        <button
          key={addedKey}
          onClick={handleAdd}
          className={`spring-tap-strong w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-150 ${
            isAdded ? "bg-success animate-pop-in" : "bg-navy"
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
    </Link>
  );
}

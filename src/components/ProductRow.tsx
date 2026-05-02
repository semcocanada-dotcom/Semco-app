"use client";

import Link from "next/link";
import { Product } from "@/lib/types";
import { useCart } from "@/lib/store";
import { useRef, useState } from "react";
import ProductImage from "./ProductImage";
import AvatarStack from "./AvatarStack";

interface Props {
  product: Product;
  showCategory?: boolean;
}

export default function ProductRow({ product, showCategory = false }: Props) {
  const { addItem, items } = useCart();
  const [addedKey, setAddedKey] = useState(0);
  const [isAdded, setIsAdded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inCart = items.find((i) => i.product.id === product.id);

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    addItem(product);
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsAdded(true);
    setAddedKey((k) => k + 1);
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

      {/* Add button */}
      <button
        key={addedKey}
        onClick={handleAdd}
        className={`spring-tap-strong flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-200 ${
          isAdded
            ? "bg-success animate-pop-in"
            : inCart
            ? "bg-navy"
            : "bg-navy"
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
    </Link>
  );
}

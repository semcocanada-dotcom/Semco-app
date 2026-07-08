"use client";

// Bottom sheet for "Tools Pros Are Using" — expands proof in place so the
// user keeps their context instead of jumping to a full page.

import Link from "next/link";
import { useEffect, useState } from "react";
import { Product } from "@/lib/types";
import { useCart } from "@/lib/store";
import { useToast } from "@/lib/toast";
import ProductImage from "./ProductImage";
import AvatarStack from "./AvatarStack";
import Price from "./Price";

interface Props {
  product: Product | null;
  prosCount: number;
  onClose: () => void;
}

export default function ProofSheet({ product, prosCount, onClose }: Props) {
  const { addItem } = useCart();
  const { show: showToast } = useToast();
  const [visible, setVisible] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    if (product) {
      setIsAdded(false);
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }
    setVisible(false);
  }, [product]);

  function close() {
    setVisible(false);
    setTimeout(onClose, 220);
  }

  function handleAdd() {
    if (!product || isAdded) return;
    addItem(product);
    setIsAdded(true);
    showToast("Added to your toolbox");
    setTimeout(close, 700);
  }

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Dimmed backdrop */}
      <div
        onClick={close}
        className="absolute inset-0 bg-black"
        style={{ opacity: visible ? 0.28 : 0, transition: "opacity 0.22s ease-out" }}
      />

      {/* Sheet */}
      <div
        className="absolute bottom-0 left-0 right-0 max-w-lg mx-auto bg-surface rounded-t-3xl px-5 pt-3 pb-8 shadow-card-lg"
        style={{
          transform: visible ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.25s cubic-bezier(0.32, 0.72, 0, 1)",
        }}
      >
        {/* Grab handle */}
        <div className="w-9 h-1 bg-separator rounded-full mx-auto mb-4" />

        <div className="flex items-start gap-4">
          <ProductImage product={product} size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-[16px] font-bold text-text1 leading-snug">{product.name}</p>
            <p className="text-[13px] text-text2 mt-0.5">{product.brand} · {product.unit}</p>
            <div className="mt-1.5">
              <Price product={product} size="md" />
            </div>
          </div>
          <button
            onClick={close}
            className="spring-tap-strong w-8 h-8 rounded-full bg-bg flex items-center justify-center flex-shrink-0"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 2L10 10M10 2L2 10" stroke="#6E6E73" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Social proof */}
        <div className="mt-4 bg-bg rounded-2xl px-4 py-3.5 border border-separator">
          <AvatarStack count={prosCount} size="md" />
          <p className="text-[12px] text-text2 mt-2 leading-relaxed">
            Local crews in Edmonton keep this one in rotation — a reliable pick for daily production work.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-4 space-y-2.5">
          <button
            onClick={handleAdd}
            className={`spring-tap w-full py-3.5 rounded-2xl text-[16px] font-semibold text-white transition-colors duration-200 ${
              isAdded ? "bg-success" : "bg-cta"
            }`}
          >
            {isAdded ? (
              <span className="flex items-center justify-center gap-2 animate-pop-in">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path d="M2.5 7.5L6 11L12.5 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Added
              </span>
            ) : (
              "Add to Toolbox"
            )}
          </button>
          <Link
            href={`/product/${product.id}`}
            className="spring-tap block w-full py-3 rounded-2xl text-[14px] font-semibold text-text1 text-center bg-bg border border-separator"
          >
            View details
          </Link>
        </div>
      </div>
    </div>
  );
}

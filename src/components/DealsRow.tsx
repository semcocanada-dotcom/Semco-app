"use client";

// "Today's Deals" — horizontal snap-scroll of deal ProductCards.
// Populated automatically from any product with a salePrice.

import Link from "next/link";
import { deals } from "@/lib/data";
import ProductCard from "./ProductCard";

export default function DealsRow() {
  if (deals.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-[18px] font-bold text-text1">Today&apos;s Deals</h2>
          <span className="bg-deal-light text-deal text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
            Limited
          </span>
        </div>
        <Link href="/search" className="spring-tap text-[13px] text-brand font-semibold">See All</Link>
      </div>
      <div className="flex overflow-x-auto snap-x scrollbar-hide -mx-4 px-4 gap-3 pb-1">
        {deals.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            className="snap-start flex-shrink-0 w-[165px]"
          />
        ))}
      </div>
    </div>
  );
}

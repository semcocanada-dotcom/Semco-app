"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { products } from "@/lib/data";
import ProductRow from "@/components/ProductRow";
import { useCart } from "@/lib/store";

const categories = ["All", "Compound", "Tape", "Fasteners", "Beads", "Finishing", "Tools"];

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const inputRef = useRef<HTMLInputElement>(null);
  const { itemCount } = useCart();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filtered = products.filter((p) => {
    const matchesQuery =
      query.trim() === "" ||
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.sku.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    return matchesQuery && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-bg">
      {/* Search header */}
      <div className="bg-surface border-b border-separator sticky top-0 z-40">
        <div className="flex items-center gap-3 px-4 pt-14 pb-3">
          <div className="flex-1 flex items-center gap-2.5 bg-bg rounded-xl px-3.5 py-2.5 border border-separator">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-text2 flex-shrink-0">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              className="flex-1 bg-transparent text-[15px] text-text1 placeholder:text-text2 focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="w-5 h-5 bg-text2/20 rounded-full flex items-center justify-center flex-shrink-0"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 2L8 8M8 2L2 8" stroke="#6E6E73" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
          <button
            onClick={() => router.back()}
            className="text-[15px] font-medium text-brand flex-shrink-0"
          >
            Cancel
          </button>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all duration-150 ${
                activeCategory === cat
                  ? "bg-brand text-white"
                  : "bg-bg text-text2 border border-separator"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="py-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
            <div className="w-14 h-14 bg-bg rounded-full flex items-center justify-center mb-3 border border-separator">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="#6E6E73" strokeWidth="1.5" />
                <path d="M16.5 16.5L21 21" stroke="#6E6E73" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-[17px] font-semibold text-text1">No results</p>
            <p className="text-[14px] text-text2 mt-1">
              Try a different product name or SKU
            </p>
          </div>
        ) : (
          <div className="bg-surface rounded-2xl mx-4 overflow-hidden border border-separator shadow-card">
            {filtered.map((product, idx) => (
              <div key={product.id}>
                {idx > 0 && <div className="h-px bg-separator ml-4" />}
                <ProductRow product={product} showCategory={query.trim() === "" && activeCategory === "All"} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart shortcut */}
      {itemCount > 0 && (
        <div className="fixed bottom-20 left-0 right-0 px-4 pointer-events-none">
          <button
            onClick={() => router.push("/cart")}
            className="w-full max-w-lg mx-auto flex items-center justify-between bg-brand text-white rounded-2xl px-5 py-3.5 shadow-card-lg pointer-events-auto active:scale-[0.98] transition-transform"
          >
            <span className="text-[15px] font-semibold">View Cart</span>
            <span className="bg-white/20 text-white text-[13px] font-semibold px-2.5 py-0.5 rounded-full">
              {itemCount} items
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

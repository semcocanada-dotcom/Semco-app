"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { products } from "@/lib/data";
import ProductRow from "@/components/ProductRow";
import { useCart } from "@/lib/store";

const categories = ["All", "Compound", "Tape", "Fasteners", "Beads", "Finishing", "Tools"];

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") ?? "All";

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(
    categories.includes(initialCategory) ? initialCategory : "All"
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const { itemCount } = useCart();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filtered = products.filter((p) => {
    const matchesQuery =
      query.trim() === "" ||
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.sku.toLowerCase().includes(query.toLowerCase());
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
              className="flex-1 bg-transparent text-[15px] text-text1 placeholder:text-text2"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="spring-tap-strong w-5 h-5 bg-text2/20 rounded-full flex items-center justify-center flex-shrink-0"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 2L8 8M8 2L2 8" stroke="#6E6E73" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
          <button
            onClick={() => router.back()}
            className="spring-tap text-[15px] font-semibold text-brand flex-shrink-0"
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
              className={`spring-tap flex-shrink-0 px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-colors duration-150 ${
                activeCategory === cat
                  ? "bg-brand text-white shadow-card"
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
          <div className="flex flex-col items-center justify-center py-20 px-8 text-center animate-slide-up">
            <div className="w-14 h-14 bg-bg rounded-full flex items-center justify-center mb-3 border border-separator">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="#6E6E73" strokeWidth="1.5" />
                <path d="M16.5 16.5L21 21" stroke="#6E6E73" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-[17px] font-bold text-text1">No results</p>
            <p className="text-[14px] text-text2 mt-1">Try a different name or browse a category</p>
          </div>
        ) : (
          <div className="bg-surface rounded-2xl mx-4 overflow-hidden border border-separator shadow-card">
            {filtered.map((product, idx) => (
              <div key={product.id} className="animate-slide-up" style={{ animationDelay: `${idx * 18}ms` }}>
                {idx > 0 && <div className="h-px bg-separator" />}
                <ProductRow product={product} showCategory={query.trim() === "" && activeCategory === "All"} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View cart shortcut */}
      {itemCount > 0 && (
        <div className="fixed bottom-20 left-0 right-0 px-4 pointer-events-none z-30">
          <button
            onClick={() => router.push("/cart")}
            className="spring-tap w-full max-w-lg mx-auto flex items-center justify-between bg-brand text-white rounded-2xl px-5 py-3.5 shadow-card-lg pointer-events-auto"
            style={{ background: "linear-gradient(135deg, #1A8FA8, #136F84)" }}
          >
            <span className="text-[15px] font-bold">View Cart</span>
            <span className="bg-white/20 text-white text-[13px] font-bold px-2.5 py-1 rounded-full">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}

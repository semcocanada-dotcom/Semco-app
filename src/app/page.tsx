"use client";

import Link from "next/link";
import { recentItems, savedJobs, proTools, promos } from "@/lib/data";
import { storeConfig } from "@/lib/config";
import ReorderButton from "@/components/ReorderButton";
import { useCart } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { useState } from "react";
import { Product } from "@/lib/types";
import ProductImage from "@/components/ProductImage";
import AvatarStack from "@/components/AvatarStack";
import ProofSheet from "@/components/ProofSheet";
import PromoCarousel from "@/components/PromoCarousel";
import DealsRow from "@/components/DealsRow";
import KitsRow from "@/components/KitsRow";
import Logo from "@/components/Logo";
import Price from "@/components/Price";

/* ─── Category chips ─────────────────────────────────── */
const categories = [
  { name: "Compound", color: "#D97706", bg: "#FFF8E7" },
  { name: "Tape", color: "#2563EB", bg: "#EFF6FF" },
  { name: "Fasteners", color: "#475569", bg: "#F8FAFC" },
  { name: "Beads", color: "#7C3AED", bg: "#F5F3FF" },
  { name: "Finishing", color: "#16A34A", bg: "#F0FDF4" },
  { name: "Tools", color: "#1B84AD", bg: "#E5F3F8" },
];

const categoryIcons: Record<string, React.ReactNode> = {
  Compound: (
    <svg width="18" height="18" viewBox="0 0 26 26" fill="none">
      <path d="M5 9H21L19 22H7L5 9Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M3 9C3 7.34 4.34 6 6 6H20C21.66 6 23 7.34 23 9H3Z" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  Tape: (
    <svg width="18" height="18" viewBox="0 0 26 26" fill="none">
      <circle cx="13" cy="13" r="9" stroke="currentColor" strokeWidth="2" />
      <circle cx="13" cy="13" r="4" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  Fasteners: (
    <svg width="18" height="18" viewBox="0 0 26 26" fill="none">
      <path d="M13 3V23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 6H16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M10.5 20H15.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M11 13H15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  Beads: (
    <svg width="18" height="18" viewBox="0 0 26 26" fill="none">
      <path d="M5 5H13V21" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M5 5L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  Finishing: (
    <svg width="18" height="18" viewBox="0 0 26 26" fill="none">
      <rect x="4" y="9" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M13 9V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  Tools: (
    <svg width="18" height="18" viewBox="0 0 26 26" fill="none">
      <path d="M5 18L18 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M5 18L3 23L8 21L5 18Z" fill="currentColor" />
      <path d="M15 5H21V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

export default function HomePage() {
  const { items, addItem } = useCart();
  const [proofProduct, setProofProduct] = useState<{ product: Product; prosCount: number } | null>(null);

  return (
    <div className="min-h-screen bg-bg animate-page-in">
      {/* ── Hero header — brand-dark, editorial ───────── */}
      <div className="bg-cta px-4 pt-14 pb-16 relative overflow-hidden">
        {/* Decorative texture */}
        <div className="absolute -right-16 -top-20 w-56 h-56 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -left-10 bottom-0 w-36 h-36 rounded-full bg-white/4 pointer-events-none" />

        <div className="relative flex items-center justify-between mb-1">
          <Logo size="sm" onDark />
          <Link href="/account">
            <div className="spring-tap-strong w-9 h-9 rounded-full bg-white/15 border border-white/20 flex items-center justify-center">
              <span className="text-[14px] font-bold text-white">{storeConfig.accountName[0]}</span>
            </div>
          </Link>
        </div>

        <p className="relative text-[24px] font-bold text-white mt-4 leading-tight">
          Good morning, {storeConfig.accountName}
        </p>
        <p className="relative text-[13px] text-white/60 mt-0.5">{storeConfig.tagline}</p>

        {/* Search pill */}
        <Link href="/search" className="spring-tap block relative mt-4">
          <div className="flex items-center gap-2.5 bg-white/12 border border-white/15 rounded-2xl px-4 py-3.5" style={{ backdropFilter: "blur(8px)" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-white/70 flex-shrink-0">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="text-[15px] text-white/70">Search products…</span>
          </div>
        </Link>
      </div>

      {/* ── Reorder card overlaps the hero ─────────────── */}
      <div className="px-4 -mt-9 relative z-10">
        <ReorderButton />
      </div>

      <div className="px-4 pt-6 pb-4 space-y-7">
        {/* ── Today's Deals ───────────────────────────── */}
        <DealsRow />

        {/* ── Promos ──────────────────────────────────── */}
        <PromoCarousel promos={[...promos]} />

        {/* ── Category chips ──────────────────────────── */}
        <div>
          <h2 className="text-[18px] font-bold text-text1 mb-3">Browse</h2>
          <div className="flex overflow-x-auto scrollbar-hide -mx-4 px-4 gap-2.5 pb-1">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={`/search?category=${cat.name}`}
                className="spring-tap flex-shrink-0"
              >
                <div className="flex items-center gap-2 bg-surface rounded-full pl-2 pr-4 py-2 border border-separator shadow-card">
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: cat.bg, color: cat.color }}
                  >
                    {categoryIcons[cat.name]}
                  </span>
                  <span className="text-[13px] font-semibold text-text1">{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Kits ────────────────────────────────────── */}
        <KitsRow />

        {/* ── Tools Pros Are Using ────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[18px] font-bold text-text1">Tools Pros Are Using</h2>
            <Link href="/search" className="spring-tap text-[13px] text-brand font-semibold">See All</Link>
          </div>
          <div className="bg-surface rounded-3xl overflow-hidden border border-separator shadow-card">
            {proTools.map(({ product, prosCount }, idx) => (
              <div key={product.id}>
                {idx > 0 && <div className="h-px bg-separator" />}
                <button
                  onClick={() => setProofProduct({ product, prosCount })}
                  className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left active:bg-bg transition-colors"
                >
                  <ProductImage product={product} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-text1 truncate">{product.name}</p>
                    <div className="mt-1">
                      <AvatarStack count={prosCount} size="sm" max={3} />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <Price product={product} size="sm" />
                    <p className="text-[11px] text-text2">{product.unit}</p>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── Recent Items ────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[18px] font-bold text-text1">Buy It Again</h2>
            <Link href="/search" className="spring-tap text-[13px] text-brand font-semibold">See All</Link>
          </div>
          <div className="bg-surface rounded-3xl overflow-hidden border border-separator shadow-card">
            {recentItems.map((product, idx) => (
              <div key={product.id}>
                {idx > 0 && <div className="h-px bg-separator" />}
                <RecentRow product={product} items={items} onAdd={() => addItem(product)} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Saved Jobs ──────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[18px] font-bold text-text1">Saved Jobs</h2>
            <button className="spring-tap text-[13px] text-brand font-semibold">Edit</button>
          </div>
          <div className="bg-surface rounded-3xl overflow-hidden border border-separator shadow-card">
            {savedJobs.map((job, idx) => (
              <div key={job.id}>
                {idx > 0 && <div className="h-px bg-separator ml-4" />}
                <button className="spring-tap w-full flex items-center justify-between px-4 py-3.5 text-left">
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-semibold text-text1">{job.name}</p>
                    <p className="text-[12px] text-text2 mt-0.5 truncate">{job.address}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <span className="text-[12px] font-medium text-text2 bg-bg px-2.5 py-1 rounded-full border border-separator">
                      {job.itemCount} items
                    </span>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-separator">
                      <path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── Account credit ──────────────────────────── */}
        <Link href="/account" className="spring-tap block">
          <div className="bg-surface rounded-3xl border border-separator shadow-card px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-text2 uppercase tracking-widest">Account Credit</p>
                <p className="text-[26px] font-bold text-text1 mt-0.5 leading-none">
                  ${storeConfig.accountCredit.toLocaleString()}
                </p>
                <p className="text-[12px] text-text2 mt-1">
                  {storeConfig.accountType} · {storeConfig.accountCompany}
                </p>
              </div>
              <div className="w-12 h-12 bg-brand-light rounded-full flex items-center justify-center flex-shrink-0">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="text-brand">
                  <rect x="2" y="5" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M2 10H20" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="6.5" cy="14" r="1" fill="currentColor" />
                </svg>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Proof bottom sheet */}
      <ProofSheet
        product={proofProduct?.product ?? null}
        prosCount={proofProduct?.prosCount ?? 0}
        onClose={() => setProofProduct(null)}
      />
    </div>
  );
}

/* ── Inline recent item row ──────────────────────────── */
function RecentRow({
  product,
  items,
  onAdd,
}: {
  product: Product;
  items: ReturnType<typeof useCart>["items"];
  onAdd: () => void;
}) {
  const { show: showToast } = useToast();
  const [addedKey, setAddedKey] = useState(0);
  const [isAdded, setIsAdded] = useState(false);
  const inCart = items.find((i) => i.product.id === product.id);

  function handleAdd() {
    onAdd();
    showToast("Added to your toolbox");
    setIsAdded(true);
    setAddedKey((k) => k + 1);
    setTimeout(() => setIsAdded(false), 1000);
  }

  return (
    <button
      onClick={handleAdd}
      className="spring-tap w-full flex items-center justify-between px-4 py-3.5 text-left"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <ProductImage product={product} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold text-text1 truncate">{product.name}</p>
          <div className="mt-0.5">
            <Price product={product} size="sm" showUnit />
          </div>
        </div>
      </div>
      <div
        key={addedKey}
        className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-bold transition-colors duration-200 ml-3 ${
          isAdded
            ? "bg-success text-white animate-pop-in"
            : inCart
            ? "bg-navy text-white"
            : "bg-bg text-text1 border border-separator"
        }`}
      >
        {isAdded ? (
          <>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6L4.5 8.5L10 3" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Added
          </>
        ) : inCart ? (
          <>{inCart.quantity} in toolbox</>
        ) : (
          <>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M5.5 1.5V9.5M1.5 5.5H9.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
            Add
          </>
        )}
      </div>
    </button>
  );
}

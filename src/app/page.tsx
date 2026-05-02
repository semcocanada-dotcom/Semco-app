"use client";

import Link from "next/link";
import { recentItems, savedJobs } from "@/lib/data";
import ReorderButton from "@/components/ReorderButton";
import { useCart } from "@/lib/store";
import { useState } from "react";

/* ─── Category tile config ───────────────────────────── */
const categories = [
  {
    name: "Compound",
    bg: "#FFF8E7",
    iconColor: "#D97706",
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path d="M5 9H21L19 22H7L5 9Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
        <path d="M3 9C3 7.34315 4.34315 6 6 6H20C21.6569 6 23 7.34315 23 9H3Z" stroke="currentColor" strokeWidth="1.75" />
        <path d="M10 15H16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Tape",
    bg: "#EFF6FF",
    iconColor: "#2563EB",
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <circle cx="13" cy="13" r="9" stroke="currentColor" strokeWidth="1.75" />
        <circle cx="13" cy="13" r="4" stroke="currentColor" strokeWidth="1.75" />
        <path d="M17 9L22 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Fasteners",
    bg: "#F8FAFC",
    iconColor: "#475569",
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path d="M13 3V23" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        <path d="M10 6H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M10.5 9.5L15.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M11 13H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M11 16.5H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M10.5 20H15.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Beads",
    bg: "#F5F3FF",
    iconColor: "#7C3AED",
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path d="M5 5H13V21" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
        <path d="M5 5L13 13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        <circle cx="5" cy="5" r="1.5" fill="currentColor" />
        <circle cx="13" cy="21" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "Finishing",
    bg: "#F0FDF4",
    iconColor: "#16A34A",
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <rect x="4" y="9" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="1.75" />
        <path d="M4 13H22" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 9V7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        <path d="M13 9V6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        <path d="M18 9V7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Tools",
    bg: "#E6F5F8",
    iconColor: "#1A8FA8",
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path d="M5 18L18 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        <path d="M5 18L3 23L8 21L5 18Z" fill="currentColor" />
        <path d="M15 5H21V11" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 5L14 12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    ),
  },
];

/* ─── Promo deals ─────────────────────────────────────── */
const promos = [
  {
    label: "Deal of the Week",
    title: "FinishPro Knives",
    subtitle: "Starting at $2.99 · 5 styles",
    badge: "Save 40%",
    gradient: "linear-gradient(135deg, #1A8FA8 0%, #0D6679 100%)",
  },
  {
    label: "New Arrival",
    title: "Lightweight Compound",
    subtitle: "$19.99 · 4.5L pail",
    badge: "Just In",
    gradient: "linear-gradient(135deg, #7C3AED 0%, #4F1D96 100%)",
  },
];

export default function HomePage() {
  const { items, addItem } = useCart();
  const [promoIdx] = useState(0);
  const promo = promos[promoIdx];

  return (
    <div className="min-h-screen bg-bg">
      {/* ── Header ───────────────────────────────── */}
      <div className="bg-surface px-4 pt-14 pb-4 border-b border-separator">
        <div className="flex items-center justify-between mb-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #1A8FA8, #136F84)" }}
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M4 16L11 4L18 16H4Z" stroke="white" strokeWidth="1.75" strokeLinejoin="round" />
                <path d="M7 13H15" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="11" cy="18" r="1.5" fill="white" />
              </svg>
            </div>
            <div>
              <p className="text-[17px] font-bold text-text1 leading-tight tracking-tight">
                Bart&apos;s{" "}
                <span className="text-brand font-semibold text-[13px] uppercase tracking-wide align-middle">
                  Taping Tools
                </span>
              </p>
              <p className="text-[11px] text-text2">Edmonton, AB</p>
            </div>
          </div>

          {/* Avatar */}
          <div
            className="spring-tap-strong w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #1A8FA8, #136F84)" }}
          >
            <span className="text-[14px] font-bold text-white">M</span>
          </div>
        </div>

        {/* Search bar */}
        <Link href="/search" className="spring-tap block">
          <div className="flex items-center gap-2.5 bg-bg rounded-xl px-3.5 py-3 border border-separator">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-text2 flex-shrink-0">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="text-[15px] text-text2">Search products…</span>
          </div>
        </Link>
      </div>

      <div className="px-4 py-4 space-y-5">
        {/* ── Reorder hero ─────────────────────── */}
        <ReorderButton />

        {/* ── Promo card ───────────────────────── */}
        <Link href="/search" className="spring-tap block">
          <div
            className="relative overflow-hidden rounded-2xl px-5 py-4 shadow-card-lg"
            style={{ background: promo.gradient }}
          >
            {/* Decorative */}
            <div className="absolute -right-10 -top-10 w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
            <div className="absolute right-4 bottom-0 w-20 h-20 rounded-full bg-white/6 pointer-events-none" />

            <div className="relative">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
                  {promo.label}
                </span>
                <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full">
                  {promo.badge}
                </span>
              </div>
              <p className="text-[20px] font-bold text-white leading-tight">{promo.title}</p>
              <p className="text-[13px] text-white/75 mt-0.5">{promo.subtitle}</p>
              <div className="mt-3 flex items-center gap-1.5 text-white/90 text-[13px] font-semibold">
                <span>Shop now</span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 7H11M8 4L11 7L8 10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
        </Link>

        {/* ── Category tiles ───────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-[12px] font-bold text-text2 uppercase tracking-widest">Browse</h2>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={`/search?category=${cat.name}`}
                className="spring-tap"
              >
                <div
                  className="rounded-2xl px-2 py-3.5 flex flex-col items-center gap-2 border border-white/60 shadow-card"
                  style={{ backgroundColor: cat.bg }}
                >
                  <span style={{ color: cat.iconColor }}>{cat.icon}</span>
                  <span className="text-[12px] font-semibold text-text1 text-center leading-tight">
                    {cat.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Saved Jobs ───────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-[12px] font-bold text-text2 uppercase tracking-widest">Saved Jobs</h2>
            <button className="text-[13px] text-brand font-semibold">Edit</button>
          </div>
          <div className="bg-surface rounded-2xl overflow-hidden border border-separator shadow-card">
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

        {/* ── Recent Items ─────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-[12px] font-bold text-text2 uppercase tracking-widest">Recent Items</h2>
            <Link href="/search" className="text-[13px] text-brand font-semibold">See All</Link>
          </div>
          <div className="bg-surface rounded-2xl overflow-hidden border border-separator shadow-card">
            {recentItems.map((product, idx) => (
              <div key={product.id}>
                {idx > 0 && <div className="h-px bg-separator" />}
                <RecentRow product={product} items={items} onAdd={() => addItem(product)} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Account balance ──────────────────── */}
        <div className="bg-surface rounded-2xl border border-separator shadow-card px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-text2 uppercase tracking-widest">Account Credit</p>
              <p className="text-[26px] font-bold text-text1 mt-0.5 leading-none">$4,200</p>
              <p className="text-[12px] text-text2 mt-1">Net-30 · Mike&apos;s Drywall</p>
            </div>
            <div className="w-12 h-12 bg-brand-light rounded-full flex items-center justify-center flex-shrink-0">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <rect x="2" y="5" width="18" height="13" rx="2" stroke="#1A8FA8" strokeWidth="1.5" />
                <path d="M2 10H20" stroke="#1A8FA8" strokeWidth="1.5" />
                <circle cx="6.5" cy="14" r="1" fill="#1A8FA8" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Inline recent item row ──────────────────────────── */
function RecentRow({
  product,
  items,
  onAdd,
}: {
  product: { id: number; name: string; price: number; unit: string };
  items: ReturnType<typeof useCart>["items"];
  onAdd: () => void;
}) {
  const [addedKey, setAddedKey] = useState(0);
  const [isAdded, setIsAdded] = useState(false);
  const inCart = items.find((i) => i.product.id === product.id);

  function handleAdd() {
    onAdd();
    setIsAdded(true);
    setAddedKey((k) => k + 1);
    setTimeout(() => setIsAdded(false), 1000);
  }

  return (
    <button
      onClick={handleAdd}
      className="spring-tap w-full flex items-center justify-between px-4 py-3.5 text-left"
    >
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold text-text1">{product.name}</p>
        <p className="text-[13px] text-text2 mt-0.5">
          ${product.price.toFixed(2)} · {product.unit}
        </p>
      </div>
      <div
        key={addedKey}
        className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-bold transition-colors duration-200 ${
          isAdded
            ? "bg-success text-white animate-pop-in"
            : inCart
            ? "bg-brand text-white"
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
          <>{inCart.quantity} in cart</>
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

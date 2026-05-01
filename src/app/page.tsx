"use client";

import Link from "next/link";
import { recentItems, savedJobs } from "@/lib/data";
import ReorderButton from "@/components/ReorderButton";
import { useCart } from "@/lib/store";

export default function HomePage() {
  const { items } = useCart();

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="bg-surface px-4 pt-14 pb-4 border-b border-separator">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 2L3 5.5V12.5L9 16L15 12.5V5.5L9 2Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M9 2V16M3 5.5L15 12.5M15 5.5L3 12.5" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] text-text2 leading-none">Welcome back</p>
              <p className="text-[15px] font-semibold text-text1 leading-tight">Mike's Drywall</p>
            </div>
          </div>
          <div className="w-9 h-9 bg-brand rounded-full flex items-center justify-center">
            <span className="text-[14px] font-semibold text-white">M</span>
          </div>
        </div>

        {/* Search bar — tappable, routes to search */}
        <Link href="/search">
          <div className="flex items-center gap-2.5 bg-bg rounded-xl px-3.5 py-3 border border-separator">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-text2 flex-shrink-0">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="text-[15px] text-text2">Search products…</span>
          </div>
        </Link>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Reorder hero */}
        <ReorderButton />

        {/* Saved Jobs */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[13px] font-semibold text-text2 uppercase tracking-widest">Saved Jobs</h2>
            <button className="text-[13px] text-brand font-medium">Edit</button>
          </div>
          <div className="bg-surface rounded-2xl overflow-hidden border border-separator shadow-card">
            {savedJobs.map((job, idx) => (
              <div key={job.id}>
                {idx > 0 && <div className="h-px bg-separator ml-4" />}
                <button className="w-full flex items-center justify-between px-4 py-3.5 active:bg-bg transition-colors text-left">
                  <div>
                    <p className="text-[15px] font-medium text-text1">{job.name}</p>
                    <p className="text-[13px] text-text2 mt-0.5 truncate max-w-[220px]">{job.address}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] text-text2">{job.itemCount} items</span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-separator flex-shrink-0">
                      <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Items */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[13px] font-semibold text-text2 uppercase tracking-widest">Recent Items</h2>
            <Link href="/search" className="text-[13px] text-brand font-medium">See All</Link>
          </div>
          <div className="bg-surface rounded-2xl overflow-hidden border border-separator shadow-card">
            {recentItems.map((product, idx) => (
              <div key={product.id}>
                {idx > 0 && <div className="h-px bg-separator ml-4" />}
                <RecentItemRow product={product} />
              </div>
            ))}
          </div>
        </div>

        {/* Account balance card */}
        <div className="bg-surface rounded-2xl border border-separator shadow-card px-4 py-3.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[12px] text-text2 uppercase tracking-wide font-medium">Account Balance</p>
              <p className="text-[22px] font-bold text-text1 mt-0.5">$4,200.00</p>
              <p className="text-[12px] text-text2">Available credit</p>
            </div>
            <div className="w-10 h-10 bg-brand-light rounded-full flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="5" width="16" height="12" rx="2" stroke="#C8102E" strokeWidth="1.5" />
                <path d="M2 9H18" stroke="#C8102E" strokeWidth="1.5" />
                <circle cx="6" cy="13" r="1" fill="#C8102E" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecentItemRow({ product }: { product: { id: number; name: string; price: number; unit: string } }) {
  const { addItem, items } = useCart();
  const inCart = items.find((i) => i.product.id === product.id);

  return (
    <button
      onClick={() => addItem(product as Parameters<typeof addItem>[0])}
      className="w-full flex items-center justify-between px-4 py-3 active:bg-bg transition-colors"
    >
      <div className="text-left">
        <p className="text-[15px] font-medium text-text1">{product.name}</p>
        <p className="text-[13px] text-text2">${product.price.toFixed(2)} · {product.unit}</p>
      </div>
      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-semibold ${
        inCart ? "bg-brand-light text-brand" : "bg-bg text-text1"
      }`}>
        {inCart ? (
          <><span className="text-[12px]">✓</span> {inCart.quantity}</>
        ) : (
          <>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 2V10M2 6H10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
            Add
          </>
        )}
      </div>
    </button>
  );
}

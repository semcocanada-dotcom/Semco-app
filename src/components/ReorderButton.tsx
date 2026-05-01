"use client";

import { useCart } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { lastOrder } from "@/lib/data";

export default function ReorderButton() {
  const { reorder } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  function handleReorder() {
    if (loading || done) return;
    setLoading(true);
    setTimeout(() => {
      reorder();
      setLoading(false);
      setDone(true);
      setTimeout(() => {
        router.push("/cart");
      }, 400);
    }, 350);
  }

  const itemCount = lastOrder.reduce((s, i) => s + i.quantity, 0);
  const total = lastOrder.reduce((s, i) => s + i.product.price * i.quantity, 0);

  return (
    <button
      onClick={handleReorder}
      className={`w-full rounded-2xl py-4 px-5 text-left transition-all duration-200 active:scale-[0.98] shadow-card-lg ${
        done
          ? "bg-success"
          : "bg-brand hover:bg-brand-dark"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            {loading ? (
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                <path d="M8 2C8 2 14 2 14 8" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : done ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8L6.5 11.5L13 4.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M13 3V7H9" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13 7C12.2 4.6 9.9 3 7 3C4.2 3 2 5.2 2 8C2 10.8 4.2 13 7 13C9.3 13 11.3 11.6 12.2 9.6" stroke="white" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
            )}
            <span className="text-[17px] font-semibold text-white">
              {done ? "Loading cart…" : "Reorder Last Order"}
            </span>
          </div>
          <p className="text-[13px] text-white/75">
            {itemCount} items · ${total.toFixed(2)} CAD
          </p>
        </div>
        {!loading && !done && (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="opacity-60">
            <path d="M7 4L13 10L7 16" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
    </button>
  );
}

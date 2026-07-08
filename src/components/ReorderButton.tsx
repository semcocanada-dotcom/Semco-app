"use client";

import { useCart } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { lastOrder } from "@/lib/data";
import { storeConfig } from "@/lib/config";
import { effectivePrice } from "@/lib/pricing";

export default function ReorderButton() {
  const { reorder } = useCart();
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");

  function handleReorder() {
    if (state !== "idle") return;
    setState("loading");
    setTimeout(() => {
      reorder();
      setState("done");
      // Flag so the toolbox can highlight the freshly reordered rows
      try { sessionStorage.setItem("reordered", "1"); } catch {}
      setTimeout(() => router.push("/toolbox"), 360);
    }, 280);
  }

  const itemCount = lastOrder.reduce((s, i) => s + i.quantity, 0);
  const total = lastOrder.reduce((s, i) => s + effectivePrice(i.product) * i.quantity, 0);

  return (
    <button
      onClick={handleReorder}
      className="spring-tap w-full rounded-3xl px-5 py-4 text-left relative overflow-hidden shadow-card-lg border border-separator/50"
      style={{
        background: state === "done" ? "#34C759" : "#FFFFFF",
        transition: "background 0.25s ease-out",
      }}
    >
      {/* Shimmer sweep while loading */}
      {state === "loading" && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(100deg, transparent 25%, rgba(28,58,110,0.07) 50%, transparent 75%)",
            backgroundSize: "220% 100%",
            animation: "btn-shimmer 0.55s ease-in-out",
          }}
        />
      )}

      <div className="relative flex items-center gap-3.5">
        {/* Icon disc */}
        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${
            state === "done" ? "bg-white/20" : "bg-cta"
          }`}
        >
          {state === "done" ? (
            <svg width="18" height="18" viewBox="0 0 15 15" fill="none">
              <path
                d="M2 7.5L5.5 11L13 4"
                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className="animate-check-draw"
                style={{ strokeDasharray: 20, animationDelay: "0s", animationDuration: "0.28s" }}
              />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 15 15" fill="none">
              <path d="M12 3V6.5H8.5" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 6.5C11.3 4.3 9.2 2.5 6.5 2.5C3.7 2.5 1.5 4.7 1.5 7.5C1.5 10.3 3.7 12.5 6.5 12.5C8.9 12.5 10.9 11 11.7 8.8" stroke="white" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-[16px] font-bold leading-tight ${state === "done" ? "text-white" : "text-text1"}`}>
            {state === "done" ? "Opening Toolbox…" : "Reorder Last Order"}
          </p>
          <p className={`text-[12px] mt-0.5 font-medium truncate ${state === "done" ? "text-white/80" : "text-text2"}`}>
            {itemCount} items · ${total.toFixed(2)} · {storeConfig.reorderSubtitle}
          </p>
        </div>

        {state === "idle" && (
          <div className="w-8 h-8 rounded-full bg-bg border border-separator flex items-center justify-center flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M6 4L10 8L6 12" stroke="#1D1D1F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>
    </button>
  );
}

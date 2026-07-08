"use client";

import { useCart } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { lastOrder } from "@/lib/data";

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

  return (
    <button
      onClick={handleReorder}
      className="spring-tap w-full rounded-2xl px-5 py-4 text-left relative overflow-hidden shadow-card-lg"
      style={{
        background:
          state === "done"
            ? "#34C759"
            : "linear-gradient(135deg, #1C3A6E 0%, #142B52 100%)",
        transition: "background 0.25s ease-out",
      }}
    >
      {/* Shimmer sweep while loading */}
      {state === "loading" && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(100deg, transparent 25%, rgba(255,255,255,0.16) 50%, transparent 75%)",
            backgroundSize: "220% 100%",
            animation: "btn-shimmer 0.55s ease-in-out",
          }}
        />
      )}

      {/* Decorative circles */}
      <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute -right-1 bottom-0 w-16 h-16 rounded-full bg-white/6 pointer-events-none" />

      <div className="relative flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            {state === "done" ? (
              <svg className="flex-shrink-0" width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path
                  d="M2 7.5L5.5 11L13 4"
                  stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className="animate-check-draw"
                  style={{ strokeDasharray: 20, animationDelay: "0s", animationDuration: "0.28s" }}
                />
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="flex-shrink-0">
                <path d="M12 3V6.5H8.5" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 6.5C11.3 4.3 9.2 2.5 6.5 2.5C3.7 2.5 1.5 4.7 1.5 7.5C1.5 10.3 3.7 12.5 6.5 12.5C8.9 12.5 10.9 11 11.7 8.8" stroke="white" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
            )}
            <span className="text-[17px] font-bold text-white">
              {state === "done" ? "Opening Toolbox…" : "Reorder Last Order"}
            </span>
          </div>
          <p className="text-[13px] text-white/70 font-medium">
            Takes 30 seconds · {itemCount} items
          </p>
        </div>

        {state === "idle" && (
          <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4L10 8L6 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>
    </button>
  );
}

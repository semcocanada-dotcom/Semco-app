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
      setTimeout(() => router.push("/cart"), 380);
    }, 320);
  }

  const itemCount = lastOrder.reduce((s, i) => s + i.quantity, 0);
  const total = lastOrder.reduce((s, i) => s + i.product.price * i.quantity, 0);

  return (
    <button
      onClick={handleReorder}
      className={`spring-tap w-full rounded-2xl px-5 py-4 text-left relative overflow-hidden shadow-card-lg transition-opacity ${
        state !== "idle" ? "opacity-90" : ""
      }`}
      style={{
        background:
          state === "done"
            ? "#34C759"
            : "linear-gradient(135deg, #1A8FA8 0%, #136F84 100%)",
      }}
    >
      {/* Decorative circles */}
      <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute -right-1 bottom-0 w-16 h-16 rounded-full bg-white/6 pointer-events-none" />

      <div className="relative flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            {state === "loading" && (
              <svg className="animate-spin flex-shrink-0" width="15" height="15" viewBox="0 0 15 15" fill="none">
                <circle cx="7.5" cy="7.5" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                <path d="M7.5 1.5C7.5 1.5 13.5 1.5 13.5 7.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
            {state === "done" && (
              <svg className="animate-check-pop flex-shrink-0" width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M2 7.5L5.5 11L13 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            {state === "idle" && (
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="flex-shrink-0">
                <path d="M12 3V6.5H8.5" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 6.5C11.3 4.3 9.2 2.5 6.5 2.5C3.7 2.5 1.5 4.7 1.5 7.5C1.5 10.3 3.7 12.5 6.5 12.5C8.9 12.5 10.9 11 11.7 8.8" stroke="white" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
            )}
            <span className="text-[17px] font-bold text-white">
              {state === "done" ? "Opening cart…" : "Reorder Last Order"}
            </span>
          </div>
          <p className="text-[13px] text-white/70 font-medium">
            {itemCount} items · ${total.toFixed(2)} CAD
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

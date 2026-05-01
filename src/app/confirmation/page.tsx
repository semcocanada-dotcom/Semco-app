"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/store";

const statuses = [
  { key: "received", label: "Received", icon: "✓" },
  { key: "preparing", label: "Preparing", icon: "⚙" },
  { key: "ready", label: "Ready for Pickup", icon: "📦" },
];

export default function ConfirmationPage() {
  const { clearCart } = useCart();
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [orderNumber] = useState(() => `BTT-${Math.floor(10000 + Math.random() * 90000)}`);

  useEffect(() => {
    clearCart();
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, [clearCart]);

  function handleDone() {
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6 py-12">
      <div
        className={`flex flex-col items-center text-center transition-all duration-500 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {/* Success circle */}
        <div className="relative mb-6">
          <div
            className={`w-20 h-20 rounded-full bg-success flex items-center justify-center transition-all duration-700 ${
              visible ? "scale-100" : "scale-50"
            }`}
          >
            <svg
              width="36"
              height="36"
              viewBox="0 0 36 36"
              fill="none"
              className={`transition-all duration-500 delay-300 ${visible ? "opacity-100" : "opacity-0"}`}
            >
              <path
                d="M8 18L14.5 24.5L28 11"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          {/* Ripple */}
          <div
            className={`absolute inset-0 rounded-full bg-success/20 transition-all duration-1000 ${
              visible ? "scale-150 opacity-0" : "scale-100 opacity-100"
            }`}
          />
        </div>

        <h1 className="text-[28px] font-bold text-text1 mb-1">Order Received</h1>
        <p className="text-[15px] text-text2 mb-1">{orderNumber}</p>
        <p className="text-[14px] text-text2 mb-8">
          {new Date().toLocaleDateString("en-CA", {
            weekday: "long",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>

        {/* Status progression */}
        <div className="w-full max-w-xs bg-surface rounded-2xl border border-separator shadow-card overflow-hidden mb-6">
          {statuses.map((status, idx) => (
            <div key={status.key}>
              {idx > 0 && <div className="h-px bg-separator ml-14" />}
              <div className="flex items-center gap-4 px-4 py-3.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[14px] transition-all duration-500 ${
                    idx === 0
                      ? "bg-success text-white"
                      : "bg-bg text-text2"
                  }`}
                  style={{ transitionDelay: `${idx * 150 + 400}ms` }}
                >
                  {idx === 0 ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7L5.5 10.5L12 3.5" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : idx === 1 ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M7 4V7L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 5L7 2L12 5V10L7 13L2 10V5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={`text-[15px] font-medium ${
                      idx === 0 ? "text-text1" : "text-text2"
                    }`}
                  >
                    {status.label}
                  </p>
                  {idx === 0 && (
                    <p className="text-[12px] text-success font-medium">Just now</p>
                  )}
                  {idx === 1 && (
                    <p className="text-[12px] text-text2">In progress</p>
                  )}
                  {idx === 2 && (
                    <p className="text-[12px] text-text2">Ready by 2:00 PM</p>
                  )}
                </div>
                {idx === 0 && (
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* SMS notice */}
        <p className="text-[13px] text-text2 mb-8 px-4">
          You&apos;ll receive an SMS when your order is ready
        </p>

        {/* Actions */}
        <div className="w-full space-y-3">
          <button
            onClick={handleDone}
            className="w-full py-4 bg-brand text-white rounded-2xl text-[17px] font-semibold active:scale-[0.98] transition-transform shadow-card-lg"
          >
            Done
          </button>
          <button
            onClick={() => router.push("/")}
            className="w-full py-3.5 bg-surface text-brand rounded-2xl text-[15px] font-medium border border-separator active:bg-bg transition-colors"
          >
            New Order
          </button>
        </div>
      </div>
    </div>
  );
}

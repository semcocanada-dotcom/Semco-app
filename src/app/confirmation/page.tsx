"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/store";

const statuses = [
  { key: "received", label: "Received", sub: "Just now", active: true },
  { key: "preparing", label: "Preparing", sub: "In progress", active: false },
  { key: "ready", label: "Ready for Pickup", sub: "Ready by 2:00 PM", active: false },
];

export default function ConfirmationPage() {
  const { clearCart } = useCart();
  const router = useRouter();
  const [phase, setPhase] = useState(0);
  const [orderNumber, setOrderNumber] = useState("BTT-00000");

  // Sequence: 1 = circle + check draw, 2 = headline, 3 = status card + actions
  useEffect(() => {
    setOrderNumber(`BTT-${Math.floor(10000 + Math.random() * 90000)}`);
    clearCart();
    const t1 = setTimeout(() => setPhase(1), 60);
    const t2 = setTimeout(() => setPhase(2), 480);
    const t3 = setTimeout(() => setPhase(3), 740);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6 py-12">
      <div className="flex flex-col items-center text-center w-full max-w-xs">

        {/* Success circle — scales in, checkmark draws */}
        <div className="relative mb-6">
          <div
            className="w-20 h-20 rounded-full bg-success flex items-center justify-center"
            style={{
              opacity: phase >= 1 ? 1 : 0,
              transform: phase >= 1 ? "scale(1)" : "scale(0.6)",
              transition: "opacity 0.3s ease-out, transform 0.45s cubic-bezier(0.34, 1.4, 0.64, 1)",
            }}
          >
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path
                d="M8 18L14.5 24.5L28 11"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={phase >= 1 ? "animate-check-draw" : ""}
                style={phase >= 1 ? undefined : { strokeDasharray: 36, strokeDashoffset: 36 }}
              />
            </svg>
          </div>
          {/* Soft expanding ring */}
          <div
            className="absolute inset-0 rounded-full bg-success/15 pointer-events-none"
            style={{
              opacity: phase >= 2 ? 0 : phase >= 1 ? 1 : 0,
              transform: phase >= 2 ? "scale(1.5)" : "scale(1)",
              transition: "transform 0.8s ease-out, opacity 0.8s ease-out",
            }}
          />
        </div>

        {/* Headline block */}
        <div
          style={{
            opacity: phase >= 2 ? 1 : 0,
            transform: phase >= 2 ? "translateY(0)" : "translateY(6px)",
            transition: "opacity 0.26s ease-out, transform 0.26s ease-out",
          }}
        >
          <h1 className="text-[28px] font-bold text-text1 mb-1">Order Received</h1>
          <p className="text-[15px] text-text2 mb-0.5">{orderNumber}</p>
          <p className="text-[13px] text-text2 mb-8" suppressHydrationWarning>
            {new Date().toLocaleDateString("en-CA", {
              weekday: "long",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        {/* Status progression — card fades up, rows slide in one by one */}
        <div
          className="w-full bg-surface rounded-2xl border border-separator shadow-card overflow-hidden mb-6"
          style={{
            opacity: phase >= 3 ? 1 : 0,
            transform: phase >= 3 ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 0.26s ease-out, transform 0.26s ease-out",
          }}
        >
          {statuses.map((status, idx) => (
            <div key={status.key}>
              {idx > 0 && <div className="h-px bg-separator ml-14" />}
              <div
                className={phase >= 3 ? "flex items-center gap-4 px-4 py-3.5 animate-status-in" : "flex items-center gap-4 px-4 py-3.5 opacity-0"}
                style={phase >= 3 ? { animationDelay: `${idx * 90}ms` } : undefined}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    status.active ? "bg-success text-white" : "bg-bg text-text2"
                  }`}
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
                <div className="flex-1 text-left">
                  <p className={`text-[15px] font-medium ${status.active ? "text-text1" : "text-text2"}`}>
                    {status.label}
                  </p>
                  <p className={`text-[12px] ${status.active ? "text-success font-medium" : "text-text2"}`}>
                    {status.sub}
                  </p>
                </div>
                {status.active && (
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* SMS notice + actions */}
        <div
          className="w-full"
          style={{
            opacity: phase >= 3 ? 1 : 0,
            transition: "opacity 0.3s ease-out 0.15s",
          }}
        >
          <p className="text-[13px] text-text2 mb-8 px-4">
            You&apos;ll receive an SMS when your order is ready
          </p>

          <div className="w-full space-y-3">
            <button
              onClick={() => router.push("/")}
              className="spring-tap w-full py-4 text-white rounded-2xl text-[17px] font-semibold shadow-card-lg"
              style={{ background: "linear-gradient(135deg, #1C3A6E, #142B52)" }}
            >
              Done
            </button>
            <button
              onClick={() => router.push("/search")}
              className="spring-tap w-full py-3.5 bg-surface text-text1 rounded-2xl text-[15px] font-medium border border-separator"
            >
              New Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

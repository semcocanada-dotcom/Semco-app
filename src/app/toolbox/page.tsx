"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/store";
import { storeConfig } from "@/lib/config";
import ToolboxItem from "@/components/ToolboxItem";
import SmartSuggestions from "@/components/SmartSuggestions";

type PaymentMethod = "account" | "card";
type DeliveryMethod = "pickup" | "delivery";

export default function ToolboxPage() {
  const { items, total, savedTotal, clearCart } = useCart();
  const router = useRouter();
  const [payment, setPayment] = useState<PaymentMethod>("account");
  const [delivery, setDelivery] = useState<DeliveryMethod>("pickup");
  const [placing, setPlacing] = useState(false);
  const [totalKey, setTotalKey] = useState(0);
  const [highlightRows, setHighlightRows] = useState(false);
  const prevTotalRef = useRef(total);

  // Soft tick on every money value when the total changes
  useEffect(() => {
    if (total !== prevTotalRef.current) {
      setTotalKey((k) => k + 1);
      prevTotalRef.current = total;
    }
  }, [total]);

  // Highlight rows that arrived via "Reorder Last Order"
  useEffect(() => {
    try {
      if (sessionStorage.getItem("reordered") === "1") {
        sessionStorage.removeItem("reordered");
        setHighlightRows(true);
      }
    } catch {}
  }, []);

  const deliveryFee = delivery === "delivery" && total < storeConfig.freeDeliveryThreshold ? 25 : 0;
  const grandTotal = total * (1 + storeConfig.taxRate) + deliveryFee;

  function handlePlaceOrder() {
    if (placing || items.length === 0) return;
    setPlacing(true);
    setTimeout(() => {
      router.push("/confirmation");
    }, 550);
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-bg flex flex-col animate-page-in">
        <div className="bg-surface border-b border-separator px-4 pt-14 pb-4">
          <h1 className="text-[24px] font-bold text-text1">Toolbox</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center py-20 animate-scale-in">
          <div className="w-16 h-16 bg-bg rounded-full flex items-center justify-center mb-4 border border-separator">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="2" y="8" width="24" height="16" rx="2" stroke="#6E6E73" strokeWidth="1.75" />
              <path d="M9 8V6C9 4.895 9.895 4 11 4H17C18.105 4 19 4.895 19 6V8" stroke="#6E6E73" strokeWidth="1.75" />
              <path d="M2 14H26" stroke="#6E6E73" strokeWidth="1.75" />
              <path d="M14 14V17" stroke="#6E6E73" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-[18px] font-semibold text-text1">Your toolbox is empty</p>
          <p className="text-[14px] text-text2 mt-1 mb-6">Add items to get started</p>
          <Link
            href="/search"
            className="spring-tap bg-cta text-white text-[15px] font-semibold px-6 py-3 rounded-full shadow-card"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg animate-page-in">
      {/* Header */}
      <div className="bg-surface border-b border-separator px-4 pt-14 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-[24px] font-bold text-text1">Toolbox</h1>
          <button onClick={clearCart} className="spring-tap text-[14px] text-text2 font-medium">
            Clear
          </button>
        </div>
      </div>

      <div className="py-4 space-y-3">
        {/* Toolbox items */}
        <div className="bg-surface rounded-3xl mx-4 overflow-hidden border border-separator shadow-card">
          {items.map((item, idx) => (
            <div
              key={item.product.id}
              className={`animate-fade-up ${highlightRows ? "animate-row-highlight" : ""}`}
              style={{ animationDelay: `${idx * 28}ms` }}
            >
              {idx > 0 && <div className="h-px bg-separator ml-4" />}
              <ToolboxItem item={item} />
            </div>
          ))}
        </div>

        {/* Smart suggestions */}
        <SmartSuggestions />

        {/* Payment method */}
        <div className="mx-4">
          <p className="text-[12px] font-semibold text-text2 uppercase tracking-widest mb-2">Payment</p>
          <div className="bg-surface rounded-3xl border border-separator shadow-card overflow-hidden">
            <div className="flex gap-1.5 p-1.5 bg-bg rounded-2xl m-1">
              <button
                onClick={() => setPayment("account")}
                className={`segment-btn ${payment === "account" ? "active" : "inactive"}`}
              >
                Charge to Account
              </button>
              <button
                onClick={() => setPayment("card")}
                className={`segment-btn ${payment === "card" ? "active" : "inactive"}`}
              >
                Credit Card
              </button>
            </div>
            {payment === "account" ? (
              <div className="px-4 py-3 flex items-center justify-between animate-fade-in">
                <div>
                  <p className="text-[14px] font-medium text-text1">{storeConfig.accountCompany}</p>
                  <p className="text-[12px] text-text2">{storeConfig.accountType} account</p>
                </div>
                <div className="text-right">
                  <p className="text-[14px] font-semibold text-success">
                    ${storeConfig.accountCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[11px] text-text2">available</p>
                </div>
              </div>
            ) : (
              <div className="px-4 py-3 flex items-center justify-between animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-6 bg-[#1A1F71] rounded flex items-center justify-center">
                    <span className="text-[9px] font-bold text-white">VISA</span>
                  </div>
                  <div>
                    <p className="text-[14px] font-medium text-text1">•••• {storeConfig.creditCardLast4}</p>
                    <p className="text-[12px] text-text2">Expires {storeConfig.creditCardExpiry}</p>
                  </div>
                </div>
                <button className="text-[13px] text-brand font-medium">Change</button>
              </div>
            )}
          </div>
        </div>

        {/* Delivery method */}
        <div className="mx-4">
          <p className="text-[12px] font-semibold text-text2 uppercase tracking-widest mb-2">Delivery</p>
          <div className="bg-surface rounded-3xl border border-separator shadow-card overflow-hidden">
            <div className="flex gap-1.5 p-1.5 bg-bg rounded-2xl m-1">
              <button
                onClick={() => setDelivery("pickup")}
                className={`segment-btn ${delivery === "pickup" ? "active" : "inactive"}`}
              >
                Pickup
              </button>
              <button
                onClick={() => setDelivery("delivery")}
                className={`segment-btn ${delivery === "delivery" ? "active" : "inactive"}`}
              >
                Delivery
              </button>
            </div>
            {delivery === "pickup" ? (
              <div className="px-4 py-3 animate-fade-in">
                <p className="text-[14px] font-medium text-text1">{storeConfig.pickupLocation}</p>
                <p className="text-[12px] text-text2">{storeConfig.pickupReady}</p>
              </div>
            ) : (
              <div className="px-4 py-3 animate-fade-in">
                <p className="text-[14px] font-medium text-text1">12450 Maple Ridge Rd</p>
                <p className="text-[12px] text-text2">
                  {storeConfig.deliveryInfo} · Free over ${storeConfig.freeDeliveryThreshold}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Order summary */}
        <div className="mx-4 bg-surface rounded-3xl border border-separator shadow-card overflow-hidden">
          <div className="px-4 py-3 space-y-2">
            <div className="flex justify-between text-[14px]">
              <span className="text-text2">Subtotal</span>
              <span key={`sub-${totalKey}`} className="font-medium text-text1 tabular-nums animate-value-update">
                ${total.toFixed(2)}
              </span>
            </div>
            {savedTotal > 0 && (
              <div className="flex justify-between text-[14px]">
                <span className="text-success font-medium">You&apos;re saving</span>
                <span key={`save-${totalKey}`} className="font-bold text-success tabular-nums animate-value-update">
                  −${savedTotal.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-[14px]">
              <span className="text-text2">GST ({(storeConfig.taxRate * 100).toFixed(0)}%)</span>
              <span key={`gst-${totalKey}`} className="font-medium text-text1 tabular-nums animate-value-update">
                ${(total * storeConfig.taxRate).toFixed(2)}
              </span>
            </div>
            {deliveryFee > 0 && (
              <div className="flex justify-between text-[14px]">
                <span className="text-text2">Delivery</span>
                <span className="font-medium text-text1">${deliveryFee.toFixed(2)}</span>
              </div>
            )}
            <div className="h-px bg-separator" />
            <div className="flex justify-between">
              <span className="text-[16px] font-semibold text-text1">Total</span>
              <span key={`tot-${totalKey}`} className="text-[16px] font-bold text-text1 tabular-nums animate-value-update">
                ${grandTotal.toFixed(2)} CAD
              </span>
            </div>
          </div>
        </div>

        {/* Place Order — total on the button, one-glance checkout */}
        <div className="mx-4 pb-2">
          <button
            onClick={handlePlaceOrder}
            disabled={placing}
            className="spring-tap bg-cta w-full py-4 rounded-2xl text-[17px] font-semibold text-white shadow-card-lg relative overflow-hidden"
            style={{ opacity: placing ? 0.85 : 1 }}
          >
            {placing && (
              <span
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "linear-gradient(100deg, transparent 25%, rgba(255,255,255,0.14) 50%, transparent 75%)",
                  backgroundSize: "220% 100%",
                  animation: "btn-shimmer 0.55s ease-in-out infinite",
                }}
              />
            )}
            <span className="relative">
              {placing ? "Placing Order…" : `Place Order · $${grandTotal.toFixed(2)}`}
            </span>
          </button>
          <p className="text-[12px] text-text2 text-center mt-2">
            Order will be confirmed via SMS
          </p>
        </div>
      </div>
    </div>
  );
}

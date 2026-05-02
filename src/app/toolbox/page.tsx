"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/store";
import ToolboxItem from "@/components/ToolboxItem";
import SmartSuggestions from "@/components/SmartSuggestions";

type PaymentMethod = "account" | "card";
type DeliveryMethod = "pickup" | "delivery";

export default function ToolboxPage() {
  const { items, total, clearCart } = useCart();
  const router = useRouter();
  const [payment, setPayment] = useState<PaymentMethod>("account");
  const [delivery, setDelivery] = useState<DeliveryMethod>("pickup");
  const [placing, setPlacing] = useState(false);

  function handlePlaceOrder() {
    if (placing || items.length === 0) return;
    setPlacing(true);
    setTimeout(() => {
      router.push("/confirmation");
    }, 600);
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-bg flex flex-col">
        <div className="bg-surface border-b border-separator px-4 pt-14 pb-4">
          <h1 className="text-[22px] font-bold text-text1">Toolbox</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center py-20">
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
            className="spring-tap bg-navy text-white text-[15px] font-semibold px-6 py-3 rounded-full shadow-card"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="bg-surface border-b border-separator px-4 pt-14 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-bold text-text1">Toolbox</h1>
          <button onClick={clearCart} className="text-[14px] text-text2 font-medium">
            Clear
          </button>
        </div>
      </div>

      <div className="py-4 space-y-3">
        {/* Toolbox items */}
        <div className="bg-surface rounded-2xl mx-4 overflow-hidden border border-separator shadow-card">
          {items.map((item, idx) => (
            <div key={item.product.id}>
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
          <div className="bg-surface rounded-2xl border border-separator shadow-card overflow-hidden">
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
              <div className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-medium text-text1">Mike&apos;s Drywall</p>
                  <p className="text-[12px] text-text2">Net-30 account</p>
                </div>
                <div className="text-right">
                  <p className="text-[14px] font-semibold text-success">$4,200.00</p>
                  <p className="text-[11px] text-text2">available</p>
                </div>
              </div>
            ) : (
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-6 bg-[#1A1F71] rounded flex items-center justify-center">
                    <span className="text-[9px] font-bold text-white">VISA</span>
                  </div>
                  <div>
                    <p className="text-[14px] font-medium text-text1">•••• 4291</p>
                    <p className="text-[12px] text-text2">Expires 09/27</p>
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
          <div className="bg-surface rounded-2xl border border-separator shadow-card overflow-hidden">
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
              <div className="px-4 py-3">
                <p className="text-[14px] font-medium text-text1">6030 50th Street</p>
                <p className="text-[12px] text-text2">Edmonton, AB · Ready today after 2pm</p>
              </div>
            ) : (
              <div className="px-4 py-3">
                <p className="text-[14px] font-medium text-text1">12450 Maple Ridge Rd</p>
                <p className="text-[12px] text-text2">Next business day · Free over $500</p>
              </div>
            )}
          </div>
        </div>

        {/* Order summary */}
        <div className="mx-4 bg-surface rounded-2xl border border-separator shadow-card overflow-hidden">
          <div className="px-4 py-3 space-y-2">
            <div className="flex justify-between text-[14px]">
              <span className="text-text2">Subtotal</span>
              <span className="font-medium text-text1">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[14px]">
              <span className="text-text2">GST (5%)</span>
              <span className="font-medium text-text1">${(total * 0.05).toFixed(2)}</span>
            </div>
            {delivery === "delivery" && total < 500 && (
              <div className="flex justify-between text-[14px]">
                <span className="text-text2">Delivery</span>
                <span className="font-medium text-text1">$25.00</span>
              </div>
            )}
            <div className="h-px bg-separator" />
            <div className="flex justify-between">
              <span className="text-[16px] font-semibold text-text1">Total</span>
              <span className="text-[16px] font-bold text-text1">
                ${(total * 1.05 + (delivery === "delivery" && total < 500 ? 25 : 0)).toFixed(2)} CAD
              </span>
            </div>
          </div>
        </div>

        {/* Place Order */}
        <div className="mx-4 pb-2">
          <button
            onClick={handlePlaceOrder}
            disabled={placing}
            className={`spring-tap w-full py-4 rounded-2xl text-[17px] font-semibold text-white transition-all duration-200 shadow-card-lg ${
              placing ? "opacity-70" : ""
            }`}
            style={{ background: placing ? "#1C3A6E99" : "linear-gradient(135deg, #1C3A6E, #142B52)" }}
          >
            {placing ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin" width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="7" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                  <path d="M9 2C9 2 16 2 16 9" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Placing Order…
              </span>
            ) : (
              "Place Order"
            )}
          </button>
          <p className="text-[12px] text-text2 text-center mt-2">
            Order will be confirmed via SMS
          </p>
        </div>
      </div>
    </div>
  );
}

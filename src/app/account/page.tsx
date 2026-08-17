"use client";

import { useCart } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { lastOrder } from "@/lib/data";
import { storeConfig } from "@/lib/config";

const orderHistory = [
  { id: `${storeConfig.orderPrefix}-48291`, date: "Apr 28, 2026", total: 147.32, items: 7, status: "Delivered" },
  { id: `${storeConfig.orderPrefix}-47103`, date: "Apr 14, 2026", total: 89.5, items: 4, status: "Delivered" },
  { id: `${storeConfig.orderPrefix}-46088`, date: "Mar 31, 2026", total: 214.8, items: 11, status: "Delivered" },
];

export default function AccountPage() {
  const { reorder } = useCart();
  const { show: showToast } = useToast();

  return (
    <div className="min-h-screen bg-bg animate-page-in">
      {/* Header */}
      <div className="bg-cta px-4 pt-14 pb-6">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-full bg-white/15 border border-white/20 flex items-center justify-center flex-shrink-0">
            <span className="text-[22px] font-bold text-white">{storeConfig.accountName[0]}</span>
          </div>
          <div>
            <p className="text-[19px] font-bold text-white">{storeConfig.accountName} Kowalski</p>
            <p className="text-[13px] text-white/70">{storeConfig.accountCompany} · {storeConfig.tagline}</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Account summary */}
        <div className="bg-surface rounded-3xl border border-separator shadow-card overflow-hidden">
          <div className="px-4 py-4">
            <p className="text-[11px] font-bold text-text2 uppercase tracking-widest mb-3">Account</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[14px] text-text2">Account type</p>
                <p className="text-[14px] font-semibold text-text1">{storeConfig.accountType}</p>
              </div>
              <div className="h-px bg-separator" />
              <div className="flex items-center justify-between">
                <p className="text-[14px] text-text2">Available credit</p>
                <p className="text-[14px] font-bold text-success">
                  ${storeConfig.accountCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="h-px bg-separator" />
              <div className="flex items-center justify-between">
                <p className="text-[14px] text-text2">Member since</p>
                <p className="text-[14px] font-semibold text-text1">March 2021</p>
              </div>
            </div>
          </div>
        </div>

        {/* Last order quick reorder */}
        <div className="bg-surface rounded-3xl border border-separator shadow-card overflow-hidden">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-bold text-text2 uppercase tracking-widest">Last Order</p>
              <button
                onClick={() => { reorder(); showToast("Last order added to your toolbox"); }}
                className="spring-tap bg-cta text-[13px] font-semibold text-white px-3.5 py-1.5 rounded-full"
              >
                Reorder
              </button>
            </div>
            <div className="space-y-2">
              {lastOrder.map((item) => (
                <div key={item.product.id} className="flex items-center justify-between">
                  <p className="text-[14px] text-text1">{item.product.name}</p>
                  <p className="text-[13px] text-text2">×{item.quantity}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order history */}
        <div>
          <p className="text-[11px] font-bold text-text2 uppercase tracking-widest mb-2.5">Order History</p>
          <div className="bg-surface rounded-3xl border border-separator shadow-card overflow-hidden">
            {orderHistory.map((order, idx) => (
              <div key={order.id}>
                {idx > 0 && <div className="h-px bg-separator ml-4" />}
                <div className="flex items-center justify-between px-4 py-3.5">
                  <div>
                    <p className="text-[14px] font-semibold text-text1">{order.id}</p>
                    <p className="text-[12px] text-text2 mt-0.5">{order.date} · {order.items} items</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[14px] font-bold text-text1">${order.total.toFixed(2)}</p>
                    <p className="text-[11px] font-semibold text-success mt-0.5">{order.status}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Store info */}
        <div className="bg-surface rounded-3xl border border-separator shadow-card overflow-hidden">
          <div className="px-4 py-4">
            <p className="text-[11px] font-bold text-text2 uppercase tracking-widest mb-3">{storeConfig.nameFull}</p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 mt-0.5">
                  <path d="M8 1.5C5.515 1.5 3.5 3.515 3.5 6C3.5 9.5 8 14.5 8 14.5C8 14.5 12.5 9.5 12.5 6C12.5 3.515 10.485 1.5 8 1.5Z" stroke="#6E6E73" strokeWidth="1.25" />
                  <circle cx="8" cy="6" r="1.5" stroke="#6E6E73" strokeWidth="1.25" />
                </svg>
                <p className="text-[14px] font-medium text-text1">{storeConfig.address}</p>
              </div>
              <div className="h-px bg-separator" />
              <div className="flex items-center gap-3">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
                  <circle cx="8" cy="8" r="6" stroke="#6E6E73" strokeWidth="1.25" />
                  <path d="M8 4.5V8L10.5 10" stroke="#6E6E73" strokeWidth="1.25" strokeLinecap="round" />
                </svg>
                <p className="text-[14px] text-text1">{storeConfig.hours}</p>
              </div>
              <div className="h-px bg-separator" />
              <div className="flex items-center gap-3">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
                  <path d="M3 3.5C3 3.5 3 5.5 5 7.5C7 9.5 9 9.5 9 9.5L11 7.5L13 9.5C13 9.5 11.5 11 11 11.5C8 14.5 1.5 8 3 3.5Z" stroke="#6E6E73" strokeWidth="1.25" strokeLinejoin="round" />
                </svg>
                <p className="text-[14px] text-text1">{storeConfig.phone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sign out */}
        <button className="spring-tap w-full py-3.5 rounded-2xl text-[15px] font-semibold text-danger bg-surface border border-separator shadow-card">
          Sign Out
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/store";
import { products } from "@/lib/data";

interface MaterialResult {
  productId: number;
  name: string;
  quantity: number;
  unit: string;
  price: number;
}

function calculateMaterials(sqft: number): MaterialResult[] {
  if (sqft <= 0) return [];
  const sheets = Math.ceil(sqft / 32);
  const compound = Math.ceil(sqft / 400);
  const tape = Math.ceil(sqft / 600);
  const screws = Math.ceil(sqft / 150);
  const cornerBead = Math.ceil(sqft / 200);

  return [
    { productId: 1, name: "All-Purpose Compound", quantity: Math.max(1, compound), unit: "pails", price: products[0].price },
    { productId: 8, name: "Lightweight Compound", quantity: Math.max(1, Math.ceil(compound / 2)), unit: "pails", price: products[7].price },
    { productId: 2, name: "Paper Joint Tape", quantity: Math.max(1, tape), unit: "rolls", price: products[1].price },
    { productId: 3, name: "Drywall Screws", quantity: Math.max(1, screws), unit: "boxes", price: products[2].price },
    { productId: 4, name: "Metal Corner Bead", quantity: Math.max(2, cornerBead), unit: "pieces", price: products[3].price },
    { productId: 5, name: "Sanding Sponge", quantity: Math.max(2, Math.ceil(sqft / 500)), unit: "each", price: products[4].price },
  ];
}

export default function CalculatorPage() {
  const [sqft, setSqft] = useState("");
  const [rooms, setRooms] = useState("1");
  const { addItem } = useCart();
  const router = useRouter();
  const [added, setAdded] = useState(false);

  const totalSqft = (parseFloat(sqft) || 0) * (parseInt(rooms) || 1);
  const materials = calculateMaterials(totalSqft);
  const totalCost = materials.reduce((s, m) => s + m.price * m.quantity, 0);

  function handleAddAll() {
    materials.forEach((m) => {
      const product = products.find((p) => p.id === m.productId);
      if (product) {
        for (let i = 0; i < m.quantity; i++) {
          addItem(product);
        }
      }
    });
    setAdded(true);
    setTimeout(() => {
      router.push("/toolbox");
    }, 500);
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="bg-surface border-b border-separator px-4 pt-14 pb-4">
        <h1 className="text-[22px] font-bold text-text1">Material Calculator</h1>
        <p className="text-[14px] text-text2 mt-0.5">Estimate what you need for the job</p>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Inputs */}
        <div className="bg-surface rounded-2xl border border-separator shadow-card overflow-hidden">
          <div className="px-4 py-3.5">
            <label className="text-[12px] font-semibold text-text2 uppercase tracking-widest block mb-2">
              Room Size (sq ft)
            </label>
            <input
              type="number"
              value={sqft}
              onChange={(e) => setSqft(e.target.value)}
              placeholder="e.g. 500"
              inputMode="numeric"
              className="w-full text-[32px] font-bold text-text1 bg-transparent focus:outline-none placeholder:text-separator"
            />
          </div>
          <div className="h-px bg-separator mx-4" />
          <div className="px-4 py-3.5">
            <label className="text-[12px] font-semibold text-text2 uppercase tracking-widest block mb-2">
              Number of Rooms
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setRooms((r) => String(Math.max(1, parseInt(r) - 1)))}
                className="w-10 h-10 rounded-full bg-bg flex items-center justify-center active:bg-separator transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7H12" stroke="#1D1D1F" strokeWidth="1.75" strokeLinecap="round" />
                </svg>
              </button>
              <span className="text-[24px] font-bold text-text1 w-8 text-center tabular-nums">{rooms}</span>
              <button
                onClick={() => setRooms((r) => String(parseInt(r) + 1))}
                className="w-10 h-10 rounded-full bg-bg flex items-center justify-center active:bg-separator transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 2V12M2 7H12" stroke="#1D1D1F" strokeWidth="1.75" strokeLinecap="round" />
                </svg>
              </button>
              <p className="text-[14px] text-text2 ml-1">
                = {totalSqft > 0 ? totalSqft.toLocaleString() : "—"} sq ft total
              </p>
            </div>
          </div>
        </div>

        {/* Results */}
        {materials.length > 0 && (
          <>
            <div>
              <p className="text-[12px] font-semibold text-text2 uppercase tracking-widest mb-2">
                Estimated Materials
              </p>
              <div className="bg-surface rounded-2xl border border-separator shadow-card overflow-hidden">
                {materials.map((m, idx) => (
                  <div key={m.productId}>
                    {idx > 0 && <div className="h-px bg-separator ml-4" />}
                    <div className="flex items-center justify-between px-4 py-3.5">
                      <div>
                        <p className="text-[15px] font-medium text-text1">{m.name}</p>
                        <p className="text-[13px] text-text2">${m.price.toFixed(2)} each</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[16px] font-bold text-text1">{m.quantity}</p>
                        <p className="text-[12px] text-text2">{m.unit}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="h-px bg-separator" />
                <div className="flex items-center justify-between px-4 py-3.5 bg-bg">
                  <p className="text-[14px] font-semibold text-text1">Estimated Total</p>
                  <p className="text-[16px] font-bold text-text1">${totalCost.toFixed(2)} CAD</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleAddAll}
              disabled={added}
              className={`w-full py-4 rounded-2xl text-[17px] font-semibold text-white transition-all duration-200 active:scale-[0.98] shadow-card-lg ${
                added ? "bg-success" : "bg-brand hover:bg-brand-dark"
              }`}
            >
              {added ? (
                <span className="flex items-center justify-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M4 9L7.5 12.5L14 5.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Added to Cart
                </span>
              ) : (
                "Add All to Cart"
              )}
            </button>
          </>
        )}

        {!sqft && (
          <div className="text-center py-8 px-4">
            <div className="w-14 h-14 bg-brand-light rounded-full flex items-center justify-center mx-auto mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="2" width="16" height="20" rx="2" stroke="#1A8FA8" strokeWidth="1.5" />
                <path d="M8 7H16M8 11H16M8 15H12" stroke="#1A8FA8" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-[15px] font-medium text-text1">Enter your room size</p>
            <p className="text-[13px] text-text2 mt-1">
              We&apos;ll calculate how much compound, tape, and screws you need
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

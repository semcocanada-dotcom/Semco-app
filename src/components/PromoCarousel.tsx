"use client";

// Swipeable promo cards with dot indicators. Edit the promos in data.ts.

import Link from "next/link";
import { useRef, useState } from "react";

export interface Promo {
  label: string;
  title: string;
  subtitle: string;
  badge: string;
  gradient: string;
  href: string;
}

interface Props {
  promos: Promo[];
}

export default function PromoCarousel({ promos }: Props) {
  const [active, setActive] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    setActive(Math.round(el.scrollLeft / el.clientWidth));
  }

  return (
    <div>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4 gap-3"
      >
        {promos.map((promo) => (
          <Link
            key={promo.title}
            href={promo.href}
            className="spring-tap snap-center flex-shrink-0 w-full block"
          >
            <div
              className="relative overflow-hidden rounded-3xl px-5 py-5 shadow-card-lg"
              style={{ background: promo.gradient }}
            >
              <div className="absolute -right-10 -top-10 w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
              <div className="absolute right-4 bottom-0 w-20 h-20 rounded-full bg-white/6 pointer-events-none" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{promo.label}</span>
                  <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full">{promo.badge}</span>
                </div>
                <p className="text-[21px] font-bold text-white leading-tight">{promo.title}</p>
                <p className="text-[13px] text-white/75 mt-0.5">{promo.subtitle}</p>
                <div className="mt-3.5 inline-flex items-center gap-1.5 bg-white text-text1 text-[13px] font-bold px-3.5 py-1.5 rounded-full">
                  <span>Shop now</span>
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7H11M8 4L11 7L8 10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Dots */}
      {promos.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2.5">
          {promos.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === active ? "w-5 bg-navy" : "w-1.5 bg-separator"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

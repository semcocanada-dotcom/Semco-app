"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/store";
import { useEffect, useRef, useState } from "react";

const tabs = [
  {
    href: "/",
    label: "Home",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9 21 9 15 12 15C15 15 15 21 15 21M9 21H15"
          stroke={active ? "#1A8FA8" : "#6E6E73"}
          strokeWidth={active ? "2" : "1.5"}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/search",
    label: "Search",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="7" stroke={active ? "#1A8FA8" : "#6E6E73"} strokeWidth={active ? "2" : "1.5"} />
        <path d="M16.5 16.5L21 21" stroke={active ? "#1A8FA8" : "#6E6E73"} strokeWidth={active ? "2" : "1.5"} strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/cart",
    label: "Cart",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M6 2L3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6L18 2H6Z"
          stroke={active ? "#1A8FA8" : "#6E6E73"}
          strokeWidth={active ? "2" : "1.5"}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M3 6H21" stroke={active ? "#1A8FA8" : "#6E6E73"} strokeWidth={active ? "2" : "1.5"} strokeLinecap="round" />
        <path
          d="M16 10C16 12.2091 14.2091 14 12 14C9.79086 14 8 12.2091 8 10"
          stroke={active ? "#1A8FA8" : "#6E6E73"}
          strokeWidth={active ? "2" : "1.5"}
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href: "/calculator",
    label: "Calculate",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="2" width="16" height="20" rx="2" stroke={active ? "#1A8FA8" : "#6E6E73"} strokeWidth={active ? "2" : "1.5"} />
        <path d="M8 6H16" stroke={active ? "#1A8FA8" : "#6E6E73"} strokeWidth={active ? "2" : "1.5"} strokeLinecap="round" />
        <path d="M8 10H10M14 10H16M8 14H10M14 14H16M8 18H10M14 18H16" stroke={active ? "#1A8FA8" : "#6E6E73"} strokeWidth={active ? "2" : "1.5"} strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const prevCount = useRef(itemCount);
  const [badgeKey, setBadgeKey] = useState(0);

  useEffect(() => {
    if (itemCount !== prevCount.current) {
      setBadgeKey((k) => k + 1);
      prevCount.current = itemCount;
    }
  }, [itemCount]);

  if (pathname === "/confirmation") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-separator/40 safe-area-pb">
      <div className="flex items-center justify-around px-2 pt-1.5 pb-1 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="spring-tap flex flex-col items-center gap-0.5 min-w-[64px] py-1 px-2 relative"
            >
              {/* Active indicator pill */}
              <div
                className={`absolute top-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full bg-brand transition-all duration-300 ease-out ${
                  active ? "w-5 opacity-100" : "w-0 opacity-0"
                }`}
              />

              <div className="relative">
                {tab.icon(active)}
                {tab.href === "/cart" && itemCount > 0 && (
                  <span
                    key={badgeKey}
                    className="animate-badge absolute -top-1.5 -right-1.5 bg-brand text-white text-[10px] font-bold min-w-[17px] h-[17px] flex items-center justify-center rounded-full px-1 leading-none"
                  >
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-semibold tracking-tight transition-colors duration-200 ${
                  active ? "text-brand" : "text-text2"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

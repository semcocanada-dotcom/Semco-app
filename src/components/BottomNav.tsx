"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/store";
import { useEffect, useRef, useState } from "react";

const tabs = [
  {
    href: "/",
    label: "Home",
    match: (p: string) => p === "/",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.55 5.45 21 6 21H9M19 10L21 12M19 10V20C19 20.55 18.55 21 18 21H15M9 21V15C9 14.45 9.45 14 10 14H14C14.55 14 15 14.45 15 15V21M9 21H15"
          stroke={active ? "#1C3A6E" : "#6E6E73"} strokeWidth={active ? "2" : "1.5"}
          strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/search",
    label: "Search",
    match: (p: string) => p.startsWith("/search") || p.startsWith("/product"),
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="7" stroke={active ? "#1C3A6E" : "#6E6E73"} strokeWidth={active ? "2" : "1.5"} />
        <path d="M16.5 16.5L21 21" stroke={active ? "#1C3A6E" : "#6E6E73"} strokeWidth={active ? "2" : "1.5"} strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/kits",
    label: "Kits",
    match: (p: string) => p.startsWith("/kits"),
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="8" height="8" rx="1.5" stroke={active ? "#1C3A6E" : "#6E6E73"} strokeWidth={active ? "2" : "1.5"} />
        <rect x="13" y="3" width="8" height="8" rx="1.5" stroke={active ? "#1C3A6E" : "#6E6E73"} strokeWidth={active ? "2" : "1.5"} />
        <rect x="3" y="13" width="8" height="8" rx="1.5" stroke={active ? "#1C3A6E" : "#6E6E73"} strokeWidth={active ? "2" : "1.5"} />
        <rect x="13" y="13" width="8" height="8" rx="1.5" stroke={active ? "#1C3A6E" : "#6E6E73"} strokeWidth={active ? "2" : "1.5"} />
      </svg>
    ),
  },
  {
    href: "/toolbox",
    label: "Toolbox",
    match: (p: string) => p.startsWith("/toolbox") || p.startsWith("/confirmation"),
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="7" width="20" height="14" rx="2" stroke={active ? "#1C3A6E" : "#6E6E73"} strokeWidth={active ? "2" : "1.5"} />
        <path d="M8 7V5C8 3.895 8.895 3 10 3H14C15.105 3 16 3.895 16 5V7" stroke={active ? "#1C3A6E" : "#6E6E73"} strokeWidth={active ? "2" : "1.5"} />
        <path d="M2 12H22" stroke={active ? "#1C3A6E" : "#6E6E73"} strokeWidth={active ? "2" : "1.5"} />
        <path d="M12 12V15" stroke={active ? "#1C3A6E" : "#6E6E73"} strokeWidth={active ? "2" : "1.5"} strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/account",
    label: "Account",
    match: (p: string) => p.startsWith("/account"),
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" stroke={active ? "#1C3A6E" : "#6E6E73"} strokeWidth={active ? "2" : "1.5"} />
        <path d="M4 20C4 17 7.582 14 12 14C16.418 14 20 17 20 20" stroke={active ? "#1C3A6E" : "#6E6E73"} strokeWidth={active ? "2" : "1.5"} strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const prevCount = useRef(itemCount);
  const [badgeKey, setBadgeKey] = useState(0);
  const [iconBumpKey, setIconBumpKey] = useState(0);

  useEffect(() => {
    if (itemCount !== prevCount.current) {
      setBadgeKey((k) => k + 1);
      if (itemCount > prevCount.current) setIconBumpKey((k) => k + 1);
      prevCount.current = itemCount;
    }
  }, [itemCount]);

  if (pathname === "/confirmation") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-separator/40 safe-area-pb">
      <div className="flex items-center justify-around px-1 pt-1.5 pb-1 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const active = tab.match(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="spring-tap flex flex-col items-center gap-0.5 flex-1 py-1 px-1 relative"
            >
              {/* Active pill indicator */}
              <div className={`absolute top-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full bg-navy transition-all duration-300 ${active ? "w-5 opacity-100" : "w-0 opacity-0"}`} />

              <div className="relative">
                {tab.href === "/toolbox" ? (
                  <div key={`bump-${iconBumpKey}`} className={iconBumpKey > 0 ? "animate-nav-bump" : ""}>
                    {tab.icon(active)}
                  </div>
                ) : (
                  tab.icon(active)
                )}
                {tab.href === "/toolbox" && itemCount > 0 && (
                  <span key={`badge-${badgeKey}`} className="animate-badge absolute -top-1.5 -right-2 bg-navy text-white text-[9px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full px-1 leading-none">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-semibold transition-colors duration-200 ${active ? "text-navy" : "text-text2"}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// Drop a real image URL into product.image and this component uses it automatically.
// Without a real image it renders a category-coloured placeholder — swap nothing else.

import Image from "next/image";
import { Product } from "@/lib/types";

const categoryStyle: Record<string, { from: string; to: string; icon: React.ReactNode }> = {
  Compound: {
    from: "#FEF3C7", to: "#FDE68A",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M6 10H22L20 24H8L6 10Z" stroke="#D97706" strokeWidth="1.75" strokeLinejoin="round" />
        <path d="M4 10C4 8.343 5.343 7 7 7H21C22.657 7 24 8.343 24 10H4Z" stroke="#D97706" strokeWidth="1.75" />
        <path d="M11 17H17" stroke="#D97706" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    ),
  },
  Tape: {
    from: "#DBEAFE", to: "#BFDBFE",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="9" stroke="#2563EB" strokeWidth="1.75" />
        <circle cx="14" cy="14" r="4" stroke="#2563EB" strokeWidth="1.75" />
        <path d="M18 10L23 5" stroke="#2563EB" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    ),
  },
  Fasteners: {
    from: "#F1F5F9", to: "#E2E8F0",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 3V25" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
        <path d="M11 7H17" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M11.5 11H16.5" stroke="#475569" strokeWidth="1.75" strokeLinecap="round" />
        <path d="M12 15H16" stroke="#475569" strokeWidth="1.75" strokeLinecap="round" />
        <path d="M11.5 19H16.5" stroke="#475569" strokeWidth="1.75" strokeLinecap="round" />
        <path d="M11 23H17" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  Beads: {
    from: "#EDE9FE", to: "#DDD6FE",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M5 5H15V23" stroke="#7C3AED" strokeWidth="1.75" strokeLinejoin="round" />
        <path d="M5 5L15 15" stroke="#7C3AED" strokeWidth="1.75" strokeLinecap="round" />
        <circle cx="5" cy="5" r="2" fill="#7C3AED" />
        <circle cx="15" cy="23" r="2" fill="#7C3AED" />
      </svg>
    ),
  },
  Finishing: {
    from: "#DCFCE7", to: "#BBF7D0",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="4" y="10" width="20" height="11" rx="2" stroke="#16A34A" strokeWidth="1.75" />
        <path d="M4 15H24" stroke="#16A34A" strokeWidth="1.5" />
        <path d="M9 10V8" stroke="#16A34A" strokeWidth="1.75" strokeLinecap="round" />
        <path d="M14 10V6" stroke="#16A34A" strokeWidth="1.75" strokeLinecap="round" />
        <path d="M19 10V8" stroke="#16A34A" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    ),
  },
  Tools: {
    from: "#E0F2FE", to: "#BAE6FD",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M5 20L19 6" stroke="#0369A1" strokeWidth="1.75" strokeLinecap="round" />
        <path d="M5 20L3 25L8 23L5 20Z" fill="#0369A1" />
        <path d="M16 6H23V13" stroke="#0369A1" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M23 6L15 14" stroke="#0369A1" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    ),
  },
};

interface Props {
  product: Product;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "w-12 h-12 rounded-xl",
  md: "w-16 h-16 rounded-2xl",
  lg: "w-full aspect-square rounded-2xl",
};

export default function ProductImage({ product, size = "md", className = "" }: Props) {
  const style = categoryStyle[product.category] ?? categoryStyle.Tools;

  if (product.image) {
    return (
      <div className={`${sizes[size]} overflow-hidden flex-shrink-0 ${className}`}>
        <Image src={product.image} alt={product.name} fill className="object-cover" />
      </div>
    );
  }

  return (
    <div
      className={`${sizes[size]} flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ background: `linear-gradient(145deg, ${style.from}, ${style.to})` }}
    >
      {style.icon}
    </div>
  );
}

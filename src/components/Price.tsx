// Deal-aware price display. Set product.salePrice in data.ts and every
// Price in the app shows strikethrough + deal color automatically.

import { Product } from "@/lib/types";
import { effectivePrice } from "@/lib/pricing";

interface Props {
  product: Product;
  size?: "sm" | "md" | "lg";
  showUnit?: boolean;
}

const sizes = {
  sm: { main: "text-[14px]", was: "text-[11px]", unit: "text-[11px]" },
  md: { main: "text-[16px]", was: "text-[12px]", unit: "text-[12px]" },
  lg: { main: "text-[24px]", was: "text-[14px]", unit: "text-[13px]" },
};

export default function Price({ product, size = "md", showUnit = false }: Props) {
  const s = sizes[size];
  const onDeal = product.salePrice !== undefined;

  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className={`${s.main} font-bold ${onDeal ? "text-deal" : "text-text1"}`}>
        ${effectivePrice(product).toFixed(2)}
      </span>
      {onDeal && (
        <span className={`${s.was} text-text2 line-through`}>${product.price.toFixed(2)}</span>
      )}
      {showUnit && <span className={`${s.unit} text-text2`}>{product.unit}</span>}
    </span>
  );
}

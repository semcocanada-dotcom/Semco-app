// Bart's Taping Tools logo — recreated from the vendor's real mark:
// a brand-blue square holding a white "B" whose stem is a taping knife.
// For another vendor: replace the <Mark> SVG with their logo image and
// update the wordmark text in config.ts.

import { storeConfig } from "@/lib/config";

function Mark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" aria-hidden>
      {/* Brand square */}
      <rect x="0" y="0" width="44" height="34" rx="6" fill="var(--color-brand)" />
      {/* B letterform */}
      <path
        d="M13 7H24C27.3 7 30 9.2 30 12.2C30 14.2 28.9 15.7 27.2 16.5C29.5 17.2 31 19 31 21.5C31 24.8 28.2 27 24.7 27H13V7Z"
        fill="white"
      />
      <path
        d="M18 11.5H23.4C24.8 11.5 25.7 12.3 25.7 13.5C25.7 14.7 24.8 15.5 23.4 15.5H18V11.5Z"
        fill="var(--color-brand)"
      />
      <path
        d="M18 18.7H24C25.5 18.7 26.5 19.5 26.5 20.8C26.5 22.1 25.5 22.9 24 22.9H18V18.7Z"
        fill="var(--color-brand)"
      />
      {/* Taping knife blade dropping out of the square */}
      <path d="M13 27H21L19.4 33.4C19.3 34 18.8 34.4 18.2 34.4H15.8C15.2 34.4 14.7 34 14.6 33.4L13 27Z" fill="#C9CDD3" />
      {/* Knife handle */}
      <rect x="15.9" y="34.4" width="2.6" height="8" rx="1.3" fill="#1D1D1F" />
    </svg>
  );
}

interface Props {
  size?: "sm" | "md";
  onDark?: boolean; // wordmark colors flip for dark hero backgrounds
}

export default function Logo({ size = "md", onDark = false }: Props) {
  const mark = size === "md" ? 42 : 34;
  return (
    <div className="flex items-center gap-2.5">
      <Mark size={mark} />
      <div className="leading-none">
        <p
          className={`font-bold tracking-tight ${size === "md" ? "text-[20px]" : "text-[17px]"} ${
            onDark ? "text-white" : "text-text1"
          }`}
        >
          {storeConfig.name}
        </p>
        <p
          className={`font-bold uppercase ${size === "md" ? "text-[10px] tracking-[0.18em]" : "text-[9px] tracking-[0.16em]"} ${
            onDark ? "text-white/75" : "text-brand"
          } mt-1`}
        >
          {storeConfig.nameFull.replace(`${storeConfig.name} `, "")}
        </p>
      </div>
    </div>
  );
}

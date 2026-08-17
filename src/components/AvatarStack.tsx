// Social proof avatar stack — "Used by X local pros"
// Replace avatar SVGs with real <Image> components when you have user photos.

interface Props {
  count: number;
  max?: number;
  size?: "sm" | "md";
  showLabel?: boolean;
}

const avatarColors = [
  "#1C3A6E", "#1A8FA8", "#2563EB", "#0891B2",
  "#1D4ED8", "#0369A1", "#7C3AED", "#0F766E",
];

const sizeMap = {
  sm: { circle: 20, overlap: -6, font: 8 },
  md: { circle: 26, overlap: -8, font: 10 },
};

export default function AvatarStack({ count, max = 4, size = "sm", showLabel = true }: Props) {
  const shown = Math.min(max, 5);
  const { circle, overlap, font } = sizeMap[size];

  return (
    <div className="flex items-center gap-1.5">
      {/* Overlapping avatar circles */}
      <div className="flex" style={{ gap: overlap }}>
        {Array.from({ length: shown }).map((_, i) => (
          <svg
            key={i}
            width={circle}
            height={circle}
            viewBox={`0 0 ${circle} ${circle}`}
            style={{ zIndex: shown - i, position: "relative" }}
          >
            <circle
              cx={circle / 2}
              cy={circle / 2}
              r={circle / 2 - 1}
              fill={avatarColors[i % avatarColors.length]}
              stroke="white"
              strokeWidth="1.5"
            />
            {/* Generic person silhouette */}
            <circle cx={circle / 2} cy={circle * 0.38} r={circle * 0.16} fill="white" fillOpacity="0.8" />
            <path
              d={`M${circle * 0.28} ${circle * 0.72} Q${circle / 2} ${circle * 0.56} ${circle * 0.72} ${circle * 0.72}`}
              fill="white"
              fillOpacity="0.8"
            />
          </svg>
        ))}
      </div>

      {/* Label */}
      {showLabel && (
        <span className="text-text2" style={{ fontSize: font + 2 }}>
          Used by <span className="font-semibold text-text1">{count}</span> local pros
        </span>
      )}
    </div>
  );
}

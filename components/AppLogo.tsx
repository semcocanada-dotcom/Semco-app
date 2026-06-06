import React from 'react';
import Svg, { Path, G } from 'react-native-svg';

interface AppLogoProps {
  size?: number;
  // 'light' renders the A in white for use on coloured/gradient backgrounds.
  variant?: 'dark' | 'light';
}

const NAVY = '#1C2E5E';

// Rainbow is a slice of a large circle centred low at (CX,CY): it sweeps up
// from the lower-left and tucks behind the right leg of the A — matching the
// brand mark. Red is the outer band, violet the inner.
const CX = 47;
const CY = 84;
const R_OUTER = 36;
const A1 = -167; // left foot angle (degrees, screen y-down)
const A2 = -73;  // right end angle, high up against the right leg
const GAP = 2.9;
const BANDS = ['#EF4444', '#F97316', '#FACC15', '#22C55E', '#22D3EE', '#3B82F6', '#8B5CF6'];

function bandArc(r: number): string {
  const p1x = CX + r * Math.cos((A1 * Math.PI) / 180);
  const p1y = CY + r * Math.sin((A1 * Math.PI) / 180);
  const p2x = CX + r * Math.cos((A2 * Math.PI) / 180);
  const p2y = CY + r * Math.sin((A2 * Math.PI) / 180);
  return `M ${p1x.toFixed(2)},${p1y.toFixed(2)} A ${r},${r} 0 0,1 ${p2x.toFixed(2)},${p2y.toFixed(2)}`;
}

export function AppLogo({ size = 40, variant = 'dark' }: AppLogoProps) {
  const aColor = variant === 'light' ? '#FFFFFF' : NAVY;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* Left leg (behind the rainbow) */}
      <Path d="M50 15 L18 88" stroke={aColor} strokeWidth="12.5" strokeLinecap="round" fill="none" />

      {/* Rainbow arch sweeping up from the lower-left */}
      <G>
        {BANDS.map((c, i) => (
          <Path
            key={c}
            d={bandArc(R_OUTER - i * GAP)}
            stroke={c}
            strokeWidth={2.8}
            strokeLinecap="round"
            fill="none"
          />
        ))}
      </G>

      {/* Right leg (on top — the rainbow tucks behind it) */}
      <Path d="M50 15 L82 88" stroke={aColor} strokeWidth="12.5" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

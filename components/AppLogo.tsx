import React from 'react';
import Svg, { Path, Line } from 'react-native-svg';

interface AppLogoProps {
  size?: number;
  variant?: 'light' | 'dark';
}

const NAVY = '#1B2D5B';

// 6-band rainbow, centre at (50, 86), bands spaced 6px, strokeWidth 5.5
// Outermost arc: M10,86 A40,40 0 0,1 90,86 — peaks at (50, 46), above crossbar
const RAINBOW = [
  { r: 40, color: '#EF4444' }, // red    — outermost
  { r: 34, color: '#F97316' }, // orange
  { r: 28, color: '#EAB308' }, // yellow
  { r: 22, color: '#22C55E' }, // green
  { r: 16, color: '#3B82F6' }, // blue
  { r: 10, color: '#7C3AED' }, // violet — innermost
];

const ARC_CY = 86;

function arc(r: number) {
  return `M ${50 - r},${ARC_CY} A ${r},${r} 0 0,1 ${50 + r},${ARC_CY}`;
}

export function AppLogo({ size = 40 }: AppLogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* Bold navy A — wide legs, prominent crossbar */}
      <Line x1="50" y1="5"  x2="5"  y2="94" stroke={NAVY} strokeWidth="20" strokeLinecap="round" />
      <Line x1="50" y1="5"  x2="95" y2="94" stroke={NAVY} strokeWidth="20" strokeLinecap="round" />
      <Line x1="24" y1="60" x2="76" y2="60" stroke={NAVY} strokeWidth="15" strokeLinecap="round" />

      {/* 6-band rainbow arching through the lower half of the A */}
      {RAINBOW.map(b => (
        <Path
          key={b.r}
          d={arc(b.r)}
          stroke={b.color}
          strokeWidth={5.5}
          strokeLinecap="butt"
          fill="none"
        />
      ))}
    </Svg>
  );
}

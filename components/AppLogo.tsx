import React from 'react';
import Svg, { Path, Line } from 'react-native-svg';

interface AppLogoProps {
  size?: number;
  variant?: 'light' | 'dark';
}

// Navy "A" lettermark geometry (viewBox 0 0 100 100)
const NAVY = '#1B2D5B';

// Rainbow arc: centre at (50, 90), outer radius 42, 6 bands spaced 5px
const RAINBOW = [
  { r: 42, color: '#EF4444' }, // red    — outermost
  { r: 37, color: '#F97316' }, // orange
  { r: 32, color: '#EAB308' }, // yellow
  { r: 27, color: '#22C55E' }, // green
  { r: 22, color: '#3B82F6' }, // blue
  { r: 17, color: '#7C3AED' }, // violet — innermost
];

const CY = 90; // arc baseline (matches bottom of A legs)

function arc(r: number) {
  return `M ${50 - r},${CY} A ${r},${r} 0 0,1 ${50 + r},${CY}`;
}

export function AppLogo({ size = 40 }: AppLogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* Navy A — left leg, right leg, crossbar */}
      <Line x1="50" y1="6"  x2="10" y2="90" stroke={NAVY} strokeWidth="16" strokeLinecap="round" />
      <Line x1="50" y1="6"  x2="90" y2="90" stroke={NAVY} strokeWidth="16" strokeLinecap="round" />
      <Line x1="26" y1="57" x2="74" y2="57" stroke={NAVY} strokeWidth="12" strokeLinecap="round" />

      {/* Rainbow arc overlaid on lower half of A */}
      {RAINBOW.map(b => (
        <Path
          key={b.r}
          d={arc(b.r)}
          stroke={b.color}
          strokeWidth={4.5}
          strokeLinecap="butt"
          fill="none"
        />
      ))}
    </Svg>
  );
}

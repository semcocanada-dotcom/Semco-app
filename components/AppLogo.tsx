import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface AppLogoProps {
  size?: number;
  // 'light' renders the A in white for use on coloured/gradient backgrounds.
  variant?: 'dark' | 'light';
}

const NAVY = '#1C2E5E';

// Rainbow arch forms the crossbar of the A: peaks upward, spans between the legs.
// Outermost (largest radius) band is red, sitting on top of the arch.
const ARC_CX = 50;
const ARC_CY = 67;   // baseline the arch springs from
const RAINBOW = [
  { r: 22.0, color: '#EF4444' }, // red    — outermost / top
  { r: 18.4, color: '#F97316' }, // orange
  { r: 14.8, color: '#FACC15' }, // yellow
  { r: 11.2, color: '#22C55E' }, // green
  { r:  7.6, color: '#3B82F6' }, // blue   — innermost
];

function arc(r: number) {
  return `M ${ARC_CX - r},${ARC_CY} A ${r},${r} 0 0,1 ${ARC_CX + r},${ARC_CY}`;
}

export function AppLogo({ size = 40, variant = 'dark' }: AppLogoProps) {
  const aColor = variant === 'light' ? '#FFFFFF' : NAVY;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* A — two legs meeting at a sharp apex, rounded feet, no straight bar */}
      <Path d="M50 14 L16 90" stroke={aColor} strokeWidth="13" strokeLinecap="round" fill="none" />
      <Path d="M50 14 L84 90" stroke={aColor} strokeWidth="13" strokeLinecap="round" fill="none" />

      {/* Rainbow arch across the lower half of the A */}
      {RAINBOW.map(b => (
        <Path
          key={b.r}
          d={arc(b.r)}
          stroke={b.color}
          strokeWidth={3.4}
          strokeLinecap="round"
          fill="none"
        />
      ))}
    </Svg>
  );
}

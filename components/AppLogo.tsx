import React from 'react';
import Svg, { Path, Circle, G, ClipPath, Defs, Rect } from 'react-native-svg';

interface AppLogoProps {
  size?: number;
  /** Retained for call-site compatibility; the puzzle-heart palette is fixed. */
  variant?: 'light' | 'dark';
}

// Classic heart outline (viewBox 0 0 100 100). Top notch at (50,34),
// bottom point at (50,90), lobes near y≈22.
const HEART =
  'M50 90 C 10 60, 6 34, 26 22 C 39 14, 50 22, 50 34 ' +
  'C 50 22, 61 14, 74 22 C 94 34, 90 60, 50 90 Z';

const PIECES = {
  topLeft:     '#2563EB', // blue
  topRight:    '#EF4444', // red
  bottomLeft:  '#F59E0B', // yellow
  bottomRight: '#22C55E', // green
};

const SEAM_X = 50;
const SEAM_Y = 56;

export function AppLogo({ size = 40 }: AppLogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <ClipPath id="heartClip">
          <Path d={HEART} />
        </ClipPath>
      </Defs>

      <G clipPath="url(#heartClip)">
        {/* 4 colour quadrants */}
        <Rect x="0"  y="0"        width="50" height={SEAM_Y}        fill={PIECES.topLeft} />
        <Rect x="50" y="0"        width="50" height={SEAM_Y}        fill={PIECES.topRight} />
        <Rect x="0"  y={SEAM_Y}   width="50" height={100 - SEAM_Y}  fill={PIECES.bottomLeft} />
        <Rect x="50" y={SEAM_Y}   width="50" height={100 - SEAM_Y}  fill={PIECES.bottomRight} />

        {/* White seams between pieces */}
        <Path
          d={`M ${SEAM_X} 16 L ${SEAM_X} 92`}
          stroke="#FFFFFF"
          strokeWidth={3}
          strokeLinecap="round"
        />
        <Path
          d={`M 8 ${SEAM_Y} L 92 ${SEAM_Y}`}
          stroke="#FFFFFF"
          strokeWidth={3}
          strokeLinecap="round"
        />

        {/* Interlocking jigsaw knobs straddling the seams */}
        <Circle cx={SEAM_X} cy={44} r={7.5} fill={PIECES.topLeft}     stroke="#FFFFFF" strokeWidth={2.5} />
        <Circle cx={SEAM_X} cy={72} r={7.5} fill={PIECES.bottomRight} stroke="#FFFFFF" strokeWidth={2.5} />
        <Circle cx={31} cy={SEAM_Y} r={7.5} fill={PIECES.bottomLeft}  stroke="#FFFFFF" strokeWidth={2.5} />
        <Circle cx={69} cy={SEAM_Y} r={7.5} fill={PIECES.topRight}    stroke="#FFFFFF" strokeWidth={2.5} />
      </G>

      {/* Crisp outer heart edge */}
      <Path d={HEART} fill="none" stroke="#FFFFFF" strokeWidth={2} />
    </Svg>
  );
}

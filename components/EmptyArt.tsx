import React from 'react';
import Svg, { Rect, Circle, Path, Line, Ellipse, Text as SvgText } from 'react-native-svg';

// Flat pastel empty-state illustrations, sharing the visual language of the
// Providers clinic and Mileage car heroes: soft tinted backdrops, white cards
// with #C7D2E8 strokes, brand-colour accents, confetti dots.

const dots = (
  <>
    <Circle cx="14" cy="18" r="3.5" fill="#7C5CFC" opacity={0.7} />
    <Circle cx="108" cy="14" r="3" fill="#22C55E" opacity={0.7} />
    <Circle cx="114" cy="66" r="3.5" fill="#3B82F6" opacity={0.7} />
    <Circle cx="10" cy="70" r="3" fill="#F59E0B" opacity={0.7} />
  </>
);

// Receipt with a coin — expenses.
export function ReceiptArt({ size = 110 }: { size?: number }) {
  return (
    <Svg width={size} height={size * 0.82} viewBox="0 0 124 102">
      <Circle cx="62" cy="52" r="44" fill="#F3F0FF" />
      {/* receipt with zigzag bottom */}
      <Path
        d="M40 18 h44 v62 l-5.5 -5 -5.5 5 -5.5 -5 -5.5 5 -5.5 -5 -5.5 5 -5.5 -5 -5.5 5 Z"
        fill="#FFFFFF" stroke="#C7D2E8" strokeWidth="1.5"
      />
      <Rect x="47" y="26" width="30" height="5" rx="2.5" fill="#7C5CFC" />
      <Rect x="47" y="37" width="22" height="3.5" rx="1.75" fill="#DCE4F5" />
      <Rect x="47" y="45" width="26" height="3.5" rx="1.75" fill="#DCE4F5" />
      <Rect x="47" y="53" width="18" height="3.5" rx="1.75" fill="#DCE4F5" />
      <Rect x="47" y="63" width="30" height="4" rx="2" fill="#BBF7D0" />
      {/* coin */}
      <Circle cx="88" cy="70" r="14" fill="#FBBF24" />
      <Circle cx="88" cy="70" r="10" fill="#FDE68A" />
      <SvgText x="88" y="76" fontSize="15" fontWeight="800" fill="#B45309" textAnchor="middle">$</SvgText>
      {dots}
    </Svg>
  );
}

// Calendar page with a heart date — appointments / funding year.
export function CalendarArt({ size = 110 }: { size?: number }) {
  return (
    <Svg width={size} height={size * 0.82} viewBox="0 0 124 102">
      <Circle cx="62" cy="52" r="44" fill="#E8EEFF" />
      <Rect x="34" y="24" width="56" height="54" rx="8" fill="#FFFFFF" stroke="#C7D2E8" strokeWidth="1.5" />
      <Path d="M34 32 a8 8 0 0 1 8 -8 h40 a8 8 0 0 1 8 8 v8 h-56 Z" fill="#7C5CFC" />
      {/* binder rings */}
      <Rect x="45" y="18" width="4" height="12" rx="2" fill="#4C3AA3" />
      <Rect x="75" y="18" width="4" height="12" rx="2" fill="#4C3AA3" />
      {/* date grid */}
      <Circle cx="46" cy="50" r="3" fill="#DCE4F5" />
      <Circle cx="58" cy="50" r="3" fill="#DCE4F5" />
      <Circle cx="70" cy="50" r="3" fill="#DCE4F5" />
      <Circle cx="82" cy="50" r="3" fill="#DCE4F5" />
      <Circle cx="46" cy="62" r="3" fill="#DCE4F5" />
      <Circle cx="82" cy="62" r="3" fill="#DCE4F5" />
      <Circle cx="46" cy="72" r="3" fill="#DCE4F5" />
      <Circle cx="58" cy="72" r="3" fill="#DCE4F5" />
      {/* heart on the special day */}
      <Path
        d="M64 60 c1.6 -3.4 6.4 -3.4 8 0 c1.6 3.4 -2.4 7 -8 10.4 c-5.6 -3.4 -9.6 -7 -8 -10.4 c1.6 -3.4 6.4 -3.4 8 0 Z"
        fill="#EC4899" transform="translate(3 2)"
      />
      {dots}
    </Svg>
  );
}

// Page with rainbow bars — reports.
export function ChartArt({ size = 110 }: { size?: number }) {
  return (
    <Svg width={size} height={size * 0.82} viewBox="0 0 124 102">
      <Circle cx="62" cy="52" r="44" fill="#F3F0FF" />
      <Rect x="36" y="20" width="52" height="62" rx="8" fill="#FFFFFF" stroke="#C7D2E8" strokeWidth="1.5" />
      <Rect x="44" y="28" width="24" height="4.5" rx="2.25" fill="#DCE4F5" />
      {/* bars */}
      <Rect x="45" y="58" width="9" height="16" rx="3" fill="#22C55E" />
      <Rect x="58" y="48" width="9" height="26" rx="3" fill="#3B82F6" />
      <Rect x="71" y="40" width="9" height="34" rx="3" fill="#7C5CFC" />
      {/* rising sparkle */}
      <Path d="M46 44 L58 36 L66 39 L79 28" stroke="#F59E0B" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="79" cy="28" r="3" fill="#F59E0B" />
      {dots}
    </Svg>
  );
}

// Magnifier over a card — provider search with no results.
export function SearchArt({ size = 110 }: { size?: number }) {
  return (
    <Svg width={size} height={size * 0.82} viewBox="0 0 124 102">
      <Circle cx="62" cy="52" r="44" fill="#E8EEFF" />
      {/* card being searched */}
      <Rect x="30" y="30" width="46" height="40" rx="7" fill="#FFFFFF" stroke="#C7D2E8" strokeWidth="1.5" />
      <Circle cx="41" cy="42" r="5" fill="#DBEAFE" />
      <Rect x="50" y="38" width="20" height="3.5" rx="1.75" fill="#DCE4F5" />
      <Rect x="50" y="45" width="14" height="3.5" rx="1.75" fill="#DCE4F5" />
      <Rect x="36" y="56" width="34" height="3.5" rx="1.75" fill="#DCE4F5" />
      {/* magnifier */}
      <Circle cx="80" cy="52" r="15" fill="#DBEAFE" opacity={0.75} stroke="#3B82F6" strokeWidth="4" />
      <Line x1="91" y1="63" x2="101" y2="73" stroke="#3B82F6" strokeWidth="6" strokeLinecap="round" />
      {dots}
    </Svg>
  );
}

// Child with a floating heart — first-child onboarding.
export function ChildArt({ size = 110 }: { size?: number }) {
  return (
    <Svg width={size} height={size * 0.82} viewBox="0 0 124 102">
      <Circle cx="62" cy="52" r="44" fill="#F3F0FF" />
      {/* body */}
      <Path d="M42 86 a20 20 0 0 1 40 0 Z" fill="#7C5CFC" />
      {/* collar */}
      <Path d="M54 68 a8 6 0 0 0 16 0" fill="#9B6DFF" />
      {/* head */}
      <Circle cx="62" cy="50" r="15" fill="#FCD9BD" />
      {/* hair */}
      <Path d="M47 48 a15 15 0 0 1 30 0 c-3 -6 -8 -9 -15 -9 s-12 3 -15 9 Z" fill="#8B5A2B" />
      {/* smile + cheeks */}
      <Path d="M56 55 a7 5 0 0 0 12 0" stroke="#B4763B" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <Circle cx="53" cy="52" r="2.2" fill="#F9A8D4" opacity={0.7} />
      <Circle cx="71" cy="52" r="2.2" fill="#F9A8D4" opacity={0.7} />
      {/* floating heart */}
      <Path
        d="M88 30 c1.8 -3.8 7.2 -3.8 9 0 c1.8 3.8 -2.7 7.9 -9 11.7 c-6.3 -3.8 -10.8 -7.9 -9 -11.7 c1.8 -3.8 7.2 -3.8 9 0 Z"
        fill="#EC4899"
      />
      {dots}
    </Svg>
  );
}

// Winding road with a pin — mileage with no trips.
export function TripArt({ size = 110 }: { size?: number }) {
  return (
    <Svg width={size} height={size * 0.82} viewBox="0 0 124 102">
      <Circle cx="62" cy="52" r="44" fill="#E6F7F1" />
      {/* hills */}
      <Ellipse cx="34" cy="80" rx="26" ry="14" fill="#34D399" opacity={0.8} />
      <Ellipse cx="92" cy="82" rx="24" ry="13" fill="#34D399" opacity={0.8} />
      {/* road */}
      <Path d="M34 92 C 48 66, 76 66, 88 36 L100 40 C 90 70, 62 74, 50 96 Z" fill="#94A3B8" />
      <Path d="M56 84 L66 66 M72 58 L80 44" stroke="#FFFFFF" strokeWidth="2.5" strokeDasharray="5 5" strokeLinecap="round" />
      {/* destination pin */}
      <Path d="M94 16 a10 10 0 0 1 10 10 c0 7 -10 16 -10 16 s-10 -9 -10 -16 a10 10 0 0 1 10 -10 Z" fill="#EF4444" />
      <Circle cx="94" cy="26" r="4" fill="#FFFFFF" />
      {dots}
    </Svg>
  );
}

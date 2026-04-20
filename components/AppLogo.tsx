import React from 'react';
import Svg, { Path, G, Defs, LinearGradient as SvgLinearGradient, Stop, Mask, Rect } from 'react-native-svg';

interface AppLogoProps {
  size?: number;
  /**
   * 'light' — white A for use on dark/gradient backgrounds (login screen)
   * 'dark'  — deep indigo A for use on light backgrounds
   */
  variant?: 'light' | 'dark';
}

export function AppLogo({ size = 80, variant = 'dark' }: AppLogoProps) {
  const aColor = variant === 'light' ? '#FFFFFF' : '#1E1B4B';

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        {/* Fade the rainbow from solid (left) to transparent (right side of A) */}
        <SvgLinearGradient id="rfade" x1="0" y1="0" x2="100" y2="0" gradientUnits="userSpaceOnUse">
          <Stop offset="0.3"  stopColor="white" stopOpacity="1" />
          <Stop offset="0.78" stopColor="white" stopOpacity="1" />
          <Stop offset="1"    stopColor="white" stopOpacity="0" />
        </SvgLinearGradient>
        <Mask id="rmask">
          <Rect x="0" y="0" width="100" height="100" fill="url(#rfade)" />
        </Mask>
      </Defs>

      {/* Letter A — left leg */}
      <Path d="M50 8 L10 88" stroke={aColor} strokeWidth="7" strokeLinecap="round" fill="none" />
      {/* Letter A — right leg */}
      <Path d="M50 8 L90 88" stroke={aColor} strokeWidth="7" strokeLinecap="round" fill="none" />

      {/*
        Rainbow crossbar — replaces the traditional A crossbar.
        Arches from the left leg (~x=27, y=54) to just past the right leg (~x=82),
        curving upward to form a rainbow arch. Six bands, red (outermost) to violet
        (innermost). Fades out on the right side via mask.
      */}
      <G mask="url(#rmask)">
        {/* Red — outermost / highest arch */}
        <Path d="M24 57 Q52 30 83 57" stroke="#FF3B30" strokeWidth="3.2" fill="none" strokeLinecap="round" />
        {/* Orange */}
        <Path d="M25 54.5 Q52 33 81 54.5" stroke="#FF9500" strokeWidth="3.2" fill="none" strokeLinecap="round" />
        {/* Yellow */}
        <Path d="M26 52 Q52 36 79 52" stroke="#FFCC00" strokeWidth="3.2" fill="none" strokeLinecap="round" />
        {/* Green */}
        <Path d="M27 49.5 Q52 39 77 49.5" stroke="#34C759" strokeWidth="3.2" fill="none" strokeLinecap="round" />
        {/* Blue */}
        <Path d="M27 47 Q52 42 75 47" stroke="#007AFF" strokeWidth="3.2" fill="none" strokeLinecap="round" />
        {/* Violet — innermost */}
        <Path d="M27 44.5 Q52 45 73 44.5" stroke="#AF52DE" strokeWidth="3.2" fill="none" strokeLinecap="round" />
      </G>
    </Svg>
  );
}

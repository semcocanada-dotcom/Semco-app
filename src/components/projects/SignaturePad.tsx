import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GestureResponderEvent, PanResponder, StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Radius, Spacing, Typography } from '@/constants/theme';

type SignaturePoint = { x: number; y: number; break?: boolean };
type SignatureRecord = {
  version: 2;
  width: number;
  height: number;
  points: SignaturePoint[];
};

type SignatureBounds = {
  minX: number;
  minY: number;
  width: number;
  height: number;
};

type SignaturePadProps = {
  value?: string | null;
  onChange: (value: string | null) => void;
  height?: number;
  hint?: string;
  showHeader?: boolean;
  style?: StyleProp<ViewStyle>;
};

type SignatureDrawPoint = {
  x: number;
  y: number;
};

type SignatureStroke = {
  points: SignatureDrawPoint[];
};

export type SignaturePath = {
  d: string;
  width: number;
  height: number;
  strokeWidth: number;
};

export function parseSignatureRecord(value?: string | null): SignatureRecord {
  const empty = { version: 2 as const, width: 1, height: 1, points: [] };
  if (!value) return empty;
  try {
    const parsed = JSON.parse(value) as SignaturePoint[] | Partial<SignatureRecord>;
    if (Array.isArray(parsed)) {
      return { ...empty, width: 360, height: 190, points: cleanPoints(parsed) };
    }
    if (parsed && Array.isArray(parsed.points)) {
      return {
        version: 2,
        width: Number.isFinite(parsed.width) && parsed.width ? Number(parsed.width) : 360,
        height: Number.isFinite(parsed.height) && parsed.height ? Number(parsed.height) : 190,
        points: cleanPoints(parsed.points),
      };
    }
    return empty;
  } catch {
    return empty;
  }
}

function cleanPoints(points: SignaturePoint[]) {
  return points
    .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y))
    .map((point) => ({ x: point.x, y: point.y, break: Boolean(point.break) || undefined }));
}

export function getSignatureBounds(signature: SignatureRecord): SignatureBounds {
  if (!signature.points.length) {
    return { minX: 0, minY: 0, width: signature.width || 1, height: signature.height || 1 };
  }

  const xs = signature.points.map((point) => point.x);
  const ys = signature.points.map((point) => point.y);
  const minX = Math.max(0, Math.min(...xs));
  const maxX = Math.min(signature.width, Math.max(...xs));
  const minY = Math.max(0, Math.min(...ys));
  const maxY = Math.min(signature.height, Math.max(...ys));

  return {
    minX,
    minY,
    width: Math.max(maxX - minX, 1),
    height: Math.max(maxY - minY, 1),
  };
}

function scalePoints(points: SignaturePoint[], from: { width: number; height: number }, to: { width: number; height: number }) {
  const xScale = to.width / Math.max(from.width, 1);
  const yScale = to.height / Math.max(from.height, 1);
  return points.map((point) => ({
    ...point,
    x: point.x * xScale,
    y: point.y * yScale,
  }));
}

function getSignatureBreakDistance(points: SignaturePoint[], signature: SignatureRecord) {
  const distances = points.slice(1).flatMap((point, index) => {
    const previous = points[index];
    if (point.break || previous.break) return [];
    const distance = Math.hypot(point.x - previous.x, point.y - previous.y);
    return Number.isFinite(distance) && distance > 0 ? [distance] : [];
  });
  if (!distances.length) return Math.max(signature.width, signature.height) * 0.12;

  const sorted = [...distances].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)] || 1;
  const maxNaturalJump = Math.max(signature.width, signature.height) * 0.16;
  return Math.max(20, Math.min(maxNaturalJump, median * 5));
}

function shouldSkipSegment(previous: SignaturePoint, point: SignaturePoint, signature: SignatureRecord, breakDistance: number, inferBreaks: boolean) {
  if (point.break || previous.break) return true;
  const distance = Math.hypot(point.x - previous.x, point.y - previous.y);
  if (inferBreaks) return distance > breakDistance;
  return distance > Math.max(signature.width, signature.height) * 0.55;
}

function simplifyPoints(points: SignaturePoint[], minDistance: number) {
  const simplified: SignaturePoint[] = [];
  for (const point of points) {
    const previous = simplified[simplified.length - 1];
    if (!previous || point.break || previous.break || Math.hypot(point.x - previous.x, point.y - previous.y) >= minDistance) {
      simplified.push(point);
    }
  }
  return simplified;
}

function signaturePreviewPoint(
  point: SignaturePoint,
  bounds: SignatureBounds,
  targetWidth: number,
  targetHeight: number,
) {
  const drawWidth = targetWidth * 0.9;
  const drawHeight = targetHeight * 0.62;
  const offsetX = (targetWidth - drawWidth) / 2;
  const offsetY = (targetHeight - drawHeight) / 2;

  return {
    x: (((point.x - bounds.minX) / bounds.width) * drawWidth) + offsetX,
    y: (((point.y - bounds.minY) / bounds.height) * drawHeight) + offsetY,
  };
}

function getRawSignatureStrokes(signature: SignatureRecord): SignatureStroke[] {
  if (signature.points.length < 2) return [];
  const points = simplifyPoints(signature.points, Math.max(signature.width, signature.height) * 0.0025);
  const breakDistance = getSignatureBreakDistance(points, signature);
  const inferBreaks = !points.some((point) => point.break);
  const strokes: SignatureStroke[] = [];
  let current: SignatureDrawPoint[] = [];

  points.forEach((point, index) => {
    const previous = points[index - 1];
    if (index > 0 && shouldSkipSegment(previous, point, signature, breakDistance, inferBreaks)) {
      if (current.length > 1) strokes.push({ points: current });
      current = [];
    }
    current.push({ x: point.x, y: point.y });
  });
  if (current.length > 1) strokes.push({ points: current });
  return strokes;
}

function getSignatureStrokes(signature: SignatureRecord, targetWidth: number, targetHeight: number): SignatureStroke[] {
  const bounds = getSignatureBounds(signature);
  return getRawSignatureStrokes(signature).map((stroke) => ({
    points: stroke.points.map((point) => signaturePreviewPoint(point, bounds, targetWidth, targetHeight)),
  }));
}

function strokeToPath(points: SignatureDrawPoint[]) {
  if (points.length < 2) return '';
  const [first, ...rest] = points;
  if (points.length === 2) {
    const second = rest[0];
    return `M ${first.x.toFixed(2)} ${first.y.toFixed(2)} L ${second.x.toFixed(2)} ${second.y.toFixed(2)}`;
  }

  const commands = [`M ${first.x.toFixed(2)} ${first.y.toFixed(2)}`];
  for (let index = 1; index < points.length - 1; index += 1) {
    const point = points[index];
    const next = points[index + 1];
    const midX = (point.x + next.x) / 2;
    const midY = (point.y + next.y) / 2;
    commands.push(`Q ${point.x.toFixed(2)} ${point.y.toFixed(2)} ${midX.toFixed(2)} ${midY.toFixed(2)}`);
  }
  const last = points[points.length - 1];
  commands.push(`L ${last.x.toFixed(2)} ${last.y.toFixed(2)}`);
  return commands.join(' ');
}

function strokesToPath(strokes: SignatureStroke[]) {
  return strokes.map((stroke) => strokeToPath(stroke.points)).filter(Boolean).join(' ');
}

export function getSignaturePath(signature: SignatureRecord, width = 240, height = 52): SignaturePath | null {
  const strokes = getSignatureStrokes(signature, width, height);
  const d = strokesToPath(strokes);
  if (!d) return null;

  return {
    d,
    width,
    height,
    strokeWidth: Math.max(1.4, Math.min(2.8, height * 0.07)),
  };
}

export function getCroppedSignaturePath(signature: SignatureRecord, padding = 12): SignaturePath | null {
  const strokes = getRawSignatureStrokes(signature);
  if (!strokes.length) return null;

  const allPoints = strokes.flatMap((stroke) => stroke.points);
  const minX = Math.min(...allPoints.map((point) => point.x));
  const maxX = Math.max(...allPoints.map((point) => point.x));
  const minY = Math.min(...allPoints.map((point) => point.y));
  const maxY = Math.max(...allPoints.map((point) => point.y));
  const cropX = minX - padding;
  const cropY = minY - padding;
  const cropRight = maxX + padding;
  const cropBottom = maxY + padding;
  const width = Math.max(cropRight - cropX, 1);
  const height = Math.max(cropBottom - cropY, 1);
  const croppedStrokes = strokes.map((stroke) => ({
    points: stroke.points.map((point) => ({
      x: point.x - cropX,
      y: point.y - cropY,
    })),
  }));
  const d = strokesToPath(croppedStrokes);
  if (!d) return null;

  return {
    d,
    width,
    height,
    strokeWidth: Math.max(2.4, Math.min(4.2, Math.min(signature.width, signature.height) * 0.011)),
  };
}

export function SignaturePreview({ value, boxAspectRatio = 5 }: { value?: string | null; boxAspectRatio?: number }) {
  const signature = parseSignatureRecord(value);
  const width = Math.max(160, Math.round(boxAspectRatio * 48));
  const path = getCroppedSignaturePath(signature, 10) ?? getSignaturePath(signature, width, 48);

  if (!path) return null;

  return (
    <View style={styles.previewCanvas} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox={`0 0 ${path.width} ${path.height}`} preserveAspectRatio="xMidYMid meet">
        <Path d={path.d} fill="none" stroke={Colors.navy} strokeWidth={path.strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </View>
  );
}

export function SignaturePad({ value, onChange, height = 190, hint, showHeader = true, style }: SignaturePadProps) {
  const parsed = useMemo(() => parseSignatureRecord(value), [value]);
  const [points, setPoints] = useState<SignaturePoint[]>(() => parsed.points);
  const [surfaceSize, setSurfaceSize] = useState({ width: parsed.width || 360, height: parsed.height || height });
  const liveSignature = useMemo(
    () => ({ version: 2 as const, width: surfaceSize.width, height: surfaceSize.height, points }),
    [points, surfaceSize.height, surfaceSize.width],
  );
  const livePath = useMemo(
    () => {
      const strokes = getRawSignatureStrokes(liveSignature);
      const d = strokesToPath(strokes);
      const strokeWidth = Math.max(3, Math.min(4.8, Math.min(surfaceSize.width, surfaceSize.height) * 0.012));
      const padding = Math.max(6, strokeWidth * 1.4);
      return d
        ? {
            d,
            width: surfaceSize.width,
            height: surfaceSize.height,
            padding,
            strokeWidth,
          }
        : null;
    },
    [liveSignature, surfaceSize.height, surfaceSize.width],
  );
  const pointsRef = useRef(points);
  const surfaceSizeRef = useRef(surfaceSize);

  useEffect(() => {
    pointsRef.current = parsed.points;
    setPoints(parsed.points);
  }, [parsed.points]);

  useEffect(() => {
    surfaceSizeRef.current = surfaceSize;
  }, [surfaceSize]);

  const syncPoints = useCallback((next: SignaturePoint[]) => {
    const size = surfaceSizeRef.current;
    pointsRef.current = next;
    setPoints(next);
    onChange(next.length > 1 ? JSON.stringify({ version: 2, width: size.width, height: size.height, points: next }) : null);
  }, [onChange]);

  const getEventPoint = useCallback((event: GestureResponderEvent) => {
    const { locationX, locationY } = event.nativeEvent;
    const size = surfaceSizeRef.current;
    return {
      x: Math.max(0, Math.min(size.width, locationX)),
      y: Math.max(0, Math.min(size.height, locationY)),
    };
  }, []);

  const panResponder = useMemo(
    () => PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (event) => {
        const { x, y } = getEventPoint(event);
        const current = pointsRef.current;
        syncPoints([...current, { x, y, break: current.length > 0 || undefined }]);
      },
      onPanResponderMove: (event) => {
        const { x, y } = getEventPoint(event);
        const current = pointsRef.current;
        const last = current[current.length - 1];
        if (last && Math.hypot(x - last.x, y - last.y) < 2) return;
        syncPoints([...current, { x, y }]);
      },
    }),
    [getEventPoint, syncPoints],
  );

  const clear = () => syncPoints([]);

  return (
    <View style={[styles.wrap, style]}>
      {showHeader ? (
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="create-outline" size={18} color={Colors.darkTeal} />
            <Text style={styles.label}>Customer signature</Text>
          </View>
          <TouchableOpacity onPress={clear} style={styles.clearButton} accessibilityRole="button">
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      <View
        style={[styles.surface, { height }]}
        onLayout={(event) => {
          const { width, height: nextHeight } = event.nativeEvent.layout;
          const nextSize = { width: Math.max(width, 1), height: Math.max(nextHeight, 1) };
          const previousSize = surfaceSizeRef.current;
          surfaceSizeRef.current = nextSize;
          setSurfaceSize(nextSize);
          if (
            pointsRef.current.length &&
            (Math.abs(previousSize.width - nextSize.width) > 2 || Math.abs(previousSize.height - nextSize.height) > 2)
          ) {
            const resized = scalePoints(pointsRef.current, previousSize, nextSize);
            pointsRef.current = resized;
            setPoints(resized);
            onChange(JSON.stringify({ version: 2, width: nextSize.width, height: nextSize.height, points: resized }));
          }
        }}
        {...panResponder.panHandlers}
      >
        {points.length < 2 ? (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Sign here</Text>
          </View>
        ) : null}
        {livePath ? (
          <Svg
            width="100%"
            height="100%"
            viewBox={`${-livePath.padding} ${-livePath.padding} ${livePath.width + (livePath.padding * 2)} ${livePath.height + (livePath.padding * 2)}`}
            style={styles.surfaceInk}
            pointerEvents="none"
          >
            <Path
              d={livePath.d}
              fill="none"
              stroke={Colors.navy}
              strokeWidth={livePath.strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        ) : null}
      </View>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.sm },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  label: {
    color: Colors.textSecondary,
    fontFamily: Fonts.semibold,
    fontSize: Typography.size.sm,
    textTransform: 'uppercase',
  },
  clearButton: {
    minHeight: 34,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accentMuted,
  },
  clearText: { color: Colors.semcoOrange, fontFamily: Fonts.bold, fontSize: Typography.size.xs },
  surface: {
    height: 190,
    borderRadius: Radius.lg,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: Colors.textDisabled,
    fontFamily: Fonts.medium,
    fontSize: Typography.size.lg,
  },
  surfaceInk: { ...StyleSheet.absoluteFillObject },
  previewCanvas: {
    ...StyleSheet.absoluteFillObject,
    left: 4,
    right: 4,
    top: 2,
    bottom: 2,
  },
  previewImage: { width: '100%', height: '100%' },
  previewFallback: {
    color: Colors.navy,
    fontFamily: Fonts.bold,
    fontSize: Typography.size.sm,
    letterSpacing: 0,
  },
  hint: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: Typography.size.xs,
    lineHeight: Typography.size.xs * 1.45,
  },
});

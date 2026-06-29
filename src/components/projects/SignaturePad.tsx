import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
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

function getSignatureStrokes(signature: SignatureRecord, targetWidth: number, targetHeight: number): SignatureStroke[] {
  if (signature.points.length < 2) return [];
  const bounds = getSignatureBounds(signature);
  const points = simplifyPoints(signature.points, Math.max(signature.width, signature.height) * 0.004);
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
    current.push(signaturePreviewPoint(point, bounds, targetWidth, targetHeight));
  });
  if (current.length > 1) strokes.push({ points: current });
  return strokes;
}

function getSignatureSurfaceStrokes(signature: SignatureRecord, targetWidth: number, targetHeight: number): SignatureStroke[] {
  if (signature.points.length < 2) return [];
  const points = simplifyPoints(signature.points, Math.max(signature.width, signature.height) * 0.003);
  const breakDistance = getSignatureBreakDistance(points, signature);
  const inferBreaks = !points.some((point) => point.break);
  const xScale = targetWidth / Math.max(signature.width, 1);
  const yScale = targetHeight / Math.max(signature.height, 1);
  const strokes: SignatureStroke[] = [];
  let current: SignatureDrawPoint[] = [];

  points.forEach((point, index) => {
    const previous = points[index - 1];
    if (index > 0 && shouldSkipSegment(previous, point, signature, breakDistance, inferBreaks)) {
      if (current.length > 1) strokes.push({ points: current });
      current = [];
    }
    current.push({ x: point.x * xScale, y: point.y * yScale });
  });
  if (current.length > 1) strokes.push({ points: current });
  return strokes;
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

export function getSignaturePath(signature: SignatureRecord, width = 240, height = 52): SignaturePath | null {
  const strokes = getSignatureStrokes(signature, width, height);
  const d = strokes.map((stroke) => strokeToPath(stroke.points)).filter(Boolean).join(' ');
  if (!d) return null;

  return {
    d,
    width,
    height,
    strokeWidth: Math.max(1.4, Math.min(2.8, height * 0.07)),
  };
}

function getSignatureSurfacePath(signature: SignatureRecord, width: number, height: number): SignaturePath | null {
  const strokes = getSignatureSurfaceStrokes(signature, width, height);
  const d = strokes.map((stroke) => strokeToPath(stroke.points)).filter(Boolean).join(' ');
  if (!d) return null;

  return {
    d,
    width,
    height,
    strokeWidth: Math.max(3, Math.min(4.6, Math.min(width, height) * 0.012)),
  };
}

function getSignatureSvgUri(path: SignaturePath) {
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${path.width} ${path.height}">`,
    `<path d="${path.d}" fill="none" stroke="${Colors.navy}" stroke-width="${path.strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>`,
    '</svg>',
  ].join('');
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function SignaturePreview({ value, boxAspectRatio = 5 }: { value?: string | null; boxAspectRatio?: number }) {
  const signature = parseSignatureRecord(value);
  const width = Math.max(160, Math.round(boxAspectRatio * 48));
  const path = getSignaturePath(signature, width, 48);
  const uri = path ? getSignatureSvgUri(path) : null;
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [uri]);

  if (!path) return null;

  return (
    <View style={styles.previewCanvas} pointerEvents="none">
      {imageFailed || !uri ? (
        <Text style={styles.previewFallback}>Signed</Text>
      ) : (
        <ExpoImage source={{ uri }} style={styles.previewImage} contentFit="fill" onError={() => setImageFailed(true)} />
      )}
    </View>
  );
}

export function SignaturePad({ value, onChange, height = 190, hint }: SignaturePadProps) {
  const parsed = useMemo(() => parseSignatureRecord(value), [value]);
  const [points, setPoints] = useState<SignaturePoint[]>(() => parsed.points);
  const [surfaceSize, setSurfaceSize] = useState({ width: parsed.width || 360, height: parsed.height || height });
  const liveSignature = useMemo(
    () => ({ version: 2 as const, width: surfaceSize.width, height: surfaceSize.height, points }),
    [points, surfaceSize.height, surfaceSize.width],
  );
  const livePath = useMemo(
    () => getSignatureSurfacePath(liveSignature, surfaceSize.width, surfaceSize.height),
    [liveSignature, surfaceSize.height, surfaceSize.width],
  );
  const liveUri = useMemo(() => (livePath ? getSignatureSvgUri(livePath) : null), [livePath]);
  const pointsRef = useRef(points);
  const surfaceSizeRef = useRef(surfaceSize);

  useEffect(() => {
    pointsRef.current = parsed.points;
    setPoints(parsed.points);
  }, [parsed.points]);

  useEffect(() => {
    surfaceSizeRef.current = surfaceSize;
  }, [surfaceSize]);

  const syncPoints = (next: SignaturePoint[]) => {
    const size = surfaceSizeRef.current;
    pointsRef.current = next;
    setPoints(next);
    onChange(next.length > 1 ? JSON.stringify({ version: 2, width: size.width, height: size.height, points: next }) : null);
  };

  const panResponder = useMemo(
    () => PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event) => {
        const { locationX, locationY } = event.nativeEvent;
        const current = pointsRef.current;
        syncPoints([...current, { x: locationX, y: locationY, break: current.length > 0 || undefined }]);
      },
      onPanResponderMove: (event) => {
        const { locationX, locationY } = event.nativeEvent;
        const current = pointsRef.current;
        const last = current[current.length - 1];
        if (last && Math.hypot(locationX - last.x, locationY - last.y) < 2) return;
        syncPoints([...current, { x: locationX, y: locationY }]);
      },
    }),
    [],
  );

  const clear = () => syncPoints([]);

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="create-outline" size={18} color={Colors.darkTeal} />
          <Text style={styles.label}>Customer signature</Text>
        </View>
        <TouchableOpacity onPress={clear} style={styles.clearButton} accessibilityRole="button">
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>
      <View
        style={[styles.surface, { height }]}
        onLayout={(event) => {
          const { width, height: nextHeight } = event.nativeEvent.layout;
          const nextSize = { width: Math.max(width, 1), height: Math.max(nextHeight, 1) };
          surfaceSizeRef.current = nextSize;
          setSurfaceSize(nextSize);
        }}
        {...panResponder.panHandlers}
      >
        {points.length < 2 ? (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Sign here</Text>
          </View>
        ) : null}
        {liveUri ? (
          <ExpoImage source={{ uri: liveUri }} style={styles.surfaceInk} contentFit="fill" pointerEvents="none" />
        ) : null}
      </View>
      <Text style={styles.hint}>{hint ?? 'Hand the phone or iPad to the customer and have them sign in the box.'}</Text>
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

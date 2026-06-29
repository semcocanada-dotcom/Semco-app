import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

export type SignatureSegment = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
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

function shouldSkipSegment(previous: SignaturePoint, point: SignaturePoint, signature: SignatureRecord, breakDistance: number) {
  if (point.break || previous.break) return true;
  return Math.hypot(point.x - previous.x, point.y - previous.y) > breakDistance;
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
  boxAspectRatio: number,
) {
  const signatureAspectRatio = bounds.width / Math.max(bounds.height, 1);
  const safeBoxAspectRatio = Math.max(boxAspectRatio, 0.1);
  const maxWidth = 0.9;
  const maxHeight = 0.62;
  let drawWidth = maxWidth;
  let drawHeight = maxHeight;

  if (signatureAspectRatio < safeBoxAspectRatio) {
    drawWidth = Math.max(0.18, (signatureAspectRatio / safeBoxAspectRatio) * maxHeight);
  } else {
    drawHeight = Math.max(0.18, (safeBoxAspectRatio / signatureAspectRatio) * maxWidth);
  }

  const offsetX = (1 - drawWidth) / 2;
  const offsetY = (1 - drawHeight) / 2;

  return {
    x: (((point.x - bounds.minX) / bounds.width) * drawWidth) + offsetX,
    y: (((point.y - bounds.minY) / bounds.height) * drawHeight) + offsetY,
  };
}

export function getSignaturePreviewSegments(signature: SignatureRecord, boxAspectRatio: number): SignatureSegment[] {
  if (signature.points.length < 2) return [];
  const bounds = getSignatureBounds(signature);
  const points = simplifyPoints(signature.points, Math.max(signature.width, signature.height) * 0.006);
  const breakDistance = getSignatureBreakDistance(points, signature);

  return points.slice(1).flatMap((point, index) => {
    const previous = points[index];
    if (shouldSkipSegment(previous, point, signature, breakDistance)) return [];
    const start = signaturePreviewPoint(previous, bounds, boxAspectRatio);
    const end = signaturePreviewPoint(point, bounds, boxAspectRatio);
    return [{ x1: start.x, y1: start.y, x2: end.x, y2: end.y }];
  });
}

export function SignaturePreview({ value, boxAspectRatio = 5 }: { value?: string | null; boxAspectRatio?: number }) {
  const signature = parseSignatureRecord(value);
  const segments = getSignaturePreviewSegments(signature, boxAspectRatio);
  if (!segments.length) return null;

  return (
    <View style={styles.previewCanvas} pointerEvents="none">
      {segments.map((segment, index) => {
        const { x1, y1, x2, y2 } = segment;
        const length = Math.hypot(x2 - x1, y2 - y1) * 100;
        const angle = Math.atan2(y2 - y1, x2 - x1);
        return (
          <View
            key={`${index}-${x1}-${y1}-${x2}-${y2}`}
            style={[
              styles.previewStroke,
              {
                left: `${(((x1 + x2) / 2) * 100) - (length / 2)}%`,
                top: `${((y1 + y2) / 2) * 100}%`,
                width: `${length}%`,
                transform: [{ rotateZ: `${angle}rad` }],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

export function SignaturePad({ value, onChange, height = 190, hint }: SignaturePadProps) {
  const parsed = useMemo(() => parseSignatureRecord(value), [value]);
  const [points, setPoints] = useState<SignaturePoint[]>(() => parsed.points);
  const [surfaceSize, setSurfaceSize] = useState({ width: parsed.width || 360, height: parsed.height || height });
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
        if (last && Math.hypot(locationX - last.x, locationY - last.y) < 3) return;
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
        {points.slice(1).map((point, index) => {
          const previous = points[index];
          if (point.break) return null;
          const length = Math.hypot(point.x - previous.x, point.y - previous.y);
          const angle = Math.atan2(point.y - previous.y, point.x - previous.x);
          return (
            <View
              key={`${index}-${point.x}-${point.y}`}
              style={[
                styles.stroke,
                {
                  left: ((previous.x + point.x) / 2) - (length / 2),
                  top: ((previous.y + point.y) / 2) - 1.5,
                  width: length,
                  transform: [{ rotateZ: `${angle}rad` }],
                },
              ]}
            />
          );
        })}
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
  stroke: {
    position: 'absolute',
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.navy,
  },
  previewCanvas: {
    ...StyleSheet.absoluteFillObject,
    left: 4,
    right: 4,
    top: 2,
    bottom: 2,
  },
  previewStroke: {
    position: 'absolute',
    height: 0.85,
    borderRadius: 1,
    backgroundColor: Colors.navy,
  },
  hint: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: Typography.size.xs,
    lineHeight: Typography.size.xs * 1.45,
  },
});

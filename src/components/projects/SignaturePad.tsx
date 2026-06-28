import React, { useMemo, useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Radius, Spacing, Typography } from '@/constants/theme';

type SignaturePoint = { x: number; y: number };
type SignatureRecord = {
  version: 2;
  width: number;
  height: number;
  points: SignaturePoint[];
};

type SignaturePadProps = {
  value?: string | null;
  onChange: (value: string | null) => void;
  height?: number;
  hint?: string;
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
  return points.filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
}

export function SignaturePreview({ value }: { value?: string | null }) {
  const signature = parseSignatureRecord(value);
  if (signature.points.length < 2) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {signature.points.slice(1).map((point, index) => {
        const previous = signature.points[index];
        const x1 = previous.x / signature.width;
        const y1 = previous.y / signature.height;
        const x2 = point.x / signature.width;
        const y2 = point.y / signature.height;
        const length = Math.hypot(x2 - x1, y2 - y1) * 100;
        const angle = Math.atan2(y2 - y1, x2 - x1);
        return (
          <View
            key={`${index}-${point.x}-${point.y}`}
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

  const syncPoints = (next: SignaturePoint[]) => {
    pointsRef.current = next;
    setPoints(next);
    onChange(next.length > 1 ? JSON.stringify({ version: 2, width: surfaceSize.width, height: surfaceSize.height, points: next }) : null);
  };

  const panResponder = useMemo(
    () => PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event) => {
        const { locationX, locationY } = event.nativeEvent;
        syncPoints([...pointsRef.current, { x: locationX, y: locationY }]);
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
          setSurfaceSize({ width: Math.max(width, 1), height: Math.max(nextHeight, 1) });
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
  previewStroke: {
    position: 'absolute',
    height: 2,
    borderRadius: 2,
    backgroundColor: Colors.navy,
  },
  hint: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: Typography.size.xs,
    lineHeight: Typography.size.xs * 1.45,
  },
});

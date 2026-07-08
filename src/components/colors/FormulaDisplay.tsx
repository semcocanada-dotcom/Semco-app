import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import type { PigmentRatio } from '@/database/schema/colors';
import { getFormulaForBatch, BATCH_SIZES, type BatchSize } from '@/services/color-scaler';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

interface FormulaDisplayProps {
  pigments: unknown;
  colorName: string;
}

export function FormulaDisplay({ pigments, colorName }: FormulaDisplayProps) {
  const [batchSize, setBatchSize] = useState<BatchSize>('quart');
  const formula = getFormulaForBatch(parsePigments(pigments), batchSize);

  return (
    <Card>
      <Text style={styles.heading}>{colorName}</Text>
      <Text style={styles.subheading}>XBond tint formula</Text>

      <Text style={styles.selectorLabel}>Batch size</Text>
      <View style={styles.batchSelector}>
        {BATCH_SIZES.map((b) => (
          <TouchableOpacity
            key={b.key}
            style={[styles.batchBtn, batchSize === b.key && styles.batchBtnActive]}
            onPress={() => setBatchSize(b.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.batchBtnLabel, batchSize === b.key && styles.batchBtnLabelActive]}>
              {b.label}
            </Text>
            <Text style={[styles.batchBtnVolume, batchSize === b.key && styles.batchBtnVolumeActive]}>
              {b.volumeLabel}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.divider} />

      {formula.pigments.length === 0 ? (
        <Text style={styles.noPigment}>No pigment addition required</Text>
      ) : (
        formula.pigments.map((p, i) => (
          <View key={i} style={styles.row}>
            <View style={styles.pigmentInfo}>
              <Text style={styles.pigmentName}>{p.pigmentName}</Text>
              <Text style={styles.pigmentCode}>{p.pigmentCode}</Text>
            </View>
            <View style={styles.amountWrap}>
              <Text style={styles.amount}>{p.dispenserAmount ?? p.displayAmount}</Text>
              {p.dispenserAmount ? <Text style={styles.amountSecondary}>{p.displayAmount}</Text> : null}
            </View>
          </View>
        ))
      )}

      <View style={styles.divider} />
      <Text style={styles.notes}>{formula.mixingNotes}</Text>
    </Card>
  );
}

function parsePigments(pigments: unknown): PigmentRatio[] {
  let value = pigments;

  for (let i = 0; i < 3 && typeof value === 'string'; i += 1) {
    try {
      value = JSON.parse(value);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(value)) return [];

  return value
    .map((item): PigmentRatio | null => {
      if (!item || typeof item !== 'object') return null;
      const raw = item as Partial<PigmentRatio>;
      return {
        pigmentCode: String(raw.pigmentCode ?? ''),
        pigmentName: String(raw.pigmentName ?? raw.pigmentCode ?? 'Tint'),
        mlPerQuart: Number(raw.mlPerQuart ?? 0),
        mlPerGallon: Number(raw.mlPerGallon ?? 0),
        mlPerFiveGallon: Number(raw.mlPerFiveGallon ?? 0),
        oz48PerQuart: raw.oz48PerQuart != null ? Number(raw.oz48PerQuart) : undefined,
        oz48PerGallon: raw.oz48PerGallon != null ? Number(raw.oz48PerGallon) : undefined,
        oz48PerFiveGallon: raw.oz48PerFiveGallon != null ? Number(raw.oz48PerFiveGallon) : undefined,
      };
    })
    .filter((item): item is PigmentRatio => {
      if (!item) return false;
      return [item.mlPerQuart, item.mlPerGallon, item.mlPerFiveGallon].every(Number.isFinite);
    });
}

const styles = StyleSheet.create({
  heading: {
    color: Colors.textPrimary,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
  },
  subheading: { color: Colors.textSecondary, fontSize: Typography.size.sm, marginTop: 2 },
  selectorLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
    textTransform: 'uppercase',
    marginTop: Spacing.md,
  },
  batchSelector: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  batchBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  batchBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceElevated,
  },
  batchBtnLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
  },
  batchBtnLabelActive: { color: Colors.primary },
  batchBtnVolume: {
    color: Colors.textDisabled,
    fontSize: Typography.size.xs,
    marginTop: 2,
  },
  batchBtnVolumeActive: { color: Colors.primaryMuted },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.md },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pigmentInfo: { flex: 1 },
  pigmentName: { color: Colors.textPrimary, fontSize: Typography.size.base },
  pigmentCode: { color: Colors.textDisabled, fontSize: Typography.size.xs, marginTop: 1 },
  amountWrap: { alignItems: 'flex-end' },
  amount: { color: Colors.primary, fontSize: Typography.size.md, fontWeight: Typography.weight.bold },
  amountSecondary: { color: Colors.textDisabled, fontSize: Typography.size.xs, marginTop: 1 },
  noPigment: { color: Colors.textSecondary, fontSize: Typography.size.base, fontStyle: 'italic' },
  notes: { color: Colors.textSecondary, fontSize: Typography.size.sm, lineHeight: Typography.size.sm * 1.6 },
});

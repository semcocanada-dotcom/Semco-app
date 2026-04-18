import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import type { ScaledColorFormula } from '@/services/color-scaler';
import { Colors, Typography, Spacing } from '@/constants/theme';

interface FormulaDisplayProps {
  formula: ScaledColorFormula;
  colorName: string;
}

export function FormulaDisplay({ formula, colorName }: FormulaDisplayProps) {
  return (
    <Card>
      <Text style={styles.heading}>{colorName}</Text>
      <Text style={styles.subheading}>Mix: {formula.totalMixKg} kg batch</Text>

      <View style={styles.divider} />

      {formula.pigments.length === 0 || formula.pigments.every((p) => p.totalGrams === 0) ? (
        <Text style={styles.noPigment}>No pigment addition required</Text>
      ) : (
        formula.pigments.map((p, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.pigmentName}>{p.pigmentName}</Text>
            <Text style={styles.amount}>{p.displayAmount}</Text>
          </View>
        ))
      )}

      <View style={styles.divider} />
      <Text style={styles.notes}>{formula.mixingNotes}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  heading: {
    color: Colors.textPrimary,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
  },
  subheading: { color: Colors.textSecondary, fontSize: Typography.size.sm, marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.md },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pigmentName: { color: Colors.textPrimary, fontSize: Typography.size.base, flex: 1 },
  amount: { color: Colors.primary, fontSize: Typography.size.md, fontWeight: Typography.weight.bold },
  noPigment: { color: Colors.textSecondary, fontSize: Typography.size.base, fontStyle: 'italic' },
  notes: { color: Colors.textSecondary, fontSize: Typography.size.sm, lineHeight: Typography.size.sm * 1.6 },
});

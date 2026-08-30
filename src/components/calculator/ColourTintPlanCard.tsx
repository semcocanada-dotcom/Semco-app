import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import type { ColourTintPlan, TintBatchPlanLine } from '@/database/schema/calculations';
import { Colors, Fonts, Radius, Spacing, Typography } from '@/constants/theme';

export function ColourTintPlanCard({ plan }: { plan: ColourTintPlan }) {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.icon}>
          <Ionicons name="color-fill-outline" size={21} color={Colors.darkTeal} />
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Colour tint preparation</Text>
          <Text style={styles.subtitle}>
            {formatGallons(plan.exactLiquidGallons)} gal required · {formatGallons(plan.preparedLiquidGallons)} gal prepared in quart, gallon, and 5-gallon batches
          </Text>
        </View>
      </View>

      {plan.allocations.map((allocation) => (
        <View key={allocation.colourId} style={styles.allocation}>
          <View style={styles.allocationHeader}>
            <View style={styles.allocationCopy}>
              <Text style={styles.colourName}>{allocation.colourName}</Text>
              <Text style={styles.colourMeta}>
                {allocation.colourCode}
                {allocation.formulaCode !== allocation.colourCode ? ` · source formula ${allocation.formulaCode}` : ''}
                {` · ${formatArea(allocation.areaSqft)} sq ft`}
              </Text>
            </View>
            <Text style={styles.charge}>
              {allocation.totalChargeCad != null ? formatCad(allocation.totalChargeCad) : 'Review'}
            </Text>
          </View>

          <Text style={styles.batchText}>{formatBatchPlan(allocation.batches)}</Text>
          <Text style={styles.liquidText}>
            {formatGallons(allocation.exactLiquidGallons)} gal exact · {formatGallons(allocation.preparedLiquidGallons)} gal prepared
          </Text>
          {allocation.preparationNote ? (
            <View style={styles.note}>
              <Ionicons name="information-circle-outline" size={16} color={Colors.darkTeal} />
              <Text style={styles.noteText}>{allocation.preparationNote}</Text>
            </View>
          ) : null}
          {allocation.batches.some((batch) => batch.pigments?.length) ? (
            <View style={styles.formulaBox}>
              <Text style={styles.formulaTitle}>Tint-machine formulas by batch</Text>
              {allocation.batches.map((batch) => batch.pigments?.length ? (
                <View key={`${allocation.colourId}-${batch.batchSize}`} style={styles.batchFormula}>
                  <Text style={styles.batchFormulaTitle}>
                    Per {batch.batchLabel} batch{batch.quantity > 1 ? ` · repeat ${batch.quantity} times` : ''}
                  </Text>
                  {batch.pigments.map((pigment) => (
                    <Text key={`${allocation.colourId}-${batch.batchSize}-${pigment.pigmentCode}`} style={styles.formulaLine}>
                      {pigment.pigmentCode} · {pigment.pigmentName}: {pigment.dispenserAmount}
                    </Text>
                  ))}
                </View>
              ) : null)}
            </View>
          ) : null}
          {allocation.reviewReason ? <Text style={styles.review}>{allocation.reviewReason}</Text> : null}
        </View>
      ))}

      <View style={styles.totalRow}>
        <View>
          <Text style={styles.totalLabel}>Tint charge</Text>
          <Text style={styles.totalNote}>SEMCO machine ounces at {formatCad(plan.ratePerTintOunceCad)}/oz</Text>
        </View>
        <Text style={styles.totalValue}>{plan.totalChargeCad != null ? formatCad(plan.totalChargeCad) : 'Dealer review'}</Text>
      </View>
      <Text style={styles.disclaimer}>
        Tint charge only. X-Bond Liquid, labour, freight, tax, and other material charges are separate.
      </Text>
    </Card>
  );
}

export function formatBatchPlan(batches: TintBatchPlanLine[]): string {
  return batches
    .map((batch) => `${batch.quantity} × ${batch.batchLabel} tint batch${batch.quantity === 1 ? '' : 'es'}`)
    .join(' + ');
}

function formatGallons(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

function formatArea(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

function formatCad(value: number): string {
  return `$${value.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const styles = StyleSheet.create({
  card: { gap: Spacing.md, borderColor: Colors.lightTeal },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  icon: { width: 42, height: 42, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primaryMuted },
  headerCopy: { flex: 1, gap: 2 },
  title: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: Typography.size.lg },
  subtitle: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: Typography.size.xs, lineHeight: Typography.size.xs * 1.4 },
  allocation: { gap: 5, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.sm },
  allocationHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.sm },
  allocationCopy: { flex: 1, gap: 2 },
  colourName: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: Typography.size.base },
  colourMeta: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: Typography.size.xs },
  charge: { color: Colors.semcoOrange, fontFamily: Fonts.bold, fontSize: Typography.size.base },
  batchText: { color: Colors.navy, fontFamily: Fonts.semibold, fontSize: Typography.size.sm },
  liquidText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: Typography.size.xs },
  note: { flexDirection: 'row', alignItems: 'flex-start', gap: 5, borderRadius: Radius.sm, backgroundColor: Colors.primaryMuted, padding: Spacing.sm },
  noteText: { flex: 1, color: Colors.darkTeal, fontFamily: Fonts.medium, fontSize: Typography.size.xs, lineHeight: Typography.size.xs * 1.35 },
  formulaBox: { gap: 2, borderRadius: Radius.sm, backgroundColor: Colors.surfaceElevated, padding: Spacing.sm },
  formulaTitle: { color: Colors.textSecondary, fontFamily: Fonts.semibold, fontSize: Typography.size.xs, textTransform: 'uppercase' },
  batchFormula: { gap: 2, paddingTop: 4 },
  batchFormulaTitle: { color: Colors.darkTeal, fontFamily: Fonts.bold, fontSize: Typography.size.xs },
  formulaLine: { color: Colors.navy, fontFamily: Fonts.medium, fontSize: Typography.size.xs, lineHeight: Typography.size.xs * 1.35 },
  review: { color: Colors.danger, fontFamily: Fonts.semibold, fontSize: Typography.size.xs },
  totalRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.sm },
  totalLabel: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: Typography.size.base },
  totalNote: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: Typography.size.xs },
  totalValue: { color: Colors.semcoOrange, fontFamily: Fonts.bold, fontSize: Typography.size.xl },
  disclaimer: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: Typography.size.xs, lineHeight: Typography.size.xs * 1.35 },
});

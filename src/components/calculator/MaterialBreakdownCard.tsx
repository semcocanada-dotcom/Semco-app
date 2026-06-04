import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { MaterialLayer, CalculationResult } from '@/database/schema/calculations';
import { Colors, Fonts, Typography, Spacing } from '@/constants/theme';

const CATEGORY_LABELS: Record<string, string> = {
  primer: 'Primer',
  base_coat: 'Base Coat',
  finish_coat: 'Finish Coat',
  microcement: 'X-Bond',
  waterproofing: 'Membrane',
  sealer: 'Sealer',
  pigment: 'Pigment',
};

interface MaterialBreakdownCardProps {
  result: CalculationResult;
}

export function MaterialBreakdownCard({ result }: MaterialBreakdownCardProps) {
  const usesDocUnits = result.layers.some((layer) => Boolean(layer.quantityLabel));

  return (
    <Card>
      <Text style={styles.heading}>Material Breakdown</Text>
      <Text style={styles.subheading}>
        {result.areaSqm} m2 - {result.wastePct}% waste included
      </Text>
      {result.sourceSummary ? <Text style={styles.sourceSummary}>{result.sourceSummary}</Text> : null}

      <View style={styles.divider} />

      {result.layers.map((layer, i) => (
        <LayerRow key={i} layer={layer} />
      ))}

      <View style={styles.divider} />
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>{usesDocUnits ? 'Estimate Lines' : 'Total Material'}</Text>
        <Text style={styles.totalValue}>
          {usesDocUnits ? `${result.layers.length} products` : `${result.totalKg.toFixed(1)} kg`}
        </Text>
      </View>
    </Card>
  );
}

function LayerRow({ layer }: { layer: MaterialLayer }) {
  const badgeVariant =
    layer.category === 'primer' || layer.category === 'waterproofing' ? 'warning' :
    layer.category === 'sealer' ? 'primary' :
    layer.category === 'microcement' ? 'accent' :
    'neutral';
  const detail = layer.coverageLabel ?? `${layer.coats} coat${layer.coats > 1 ? 's' : ''} - ${layer.coverageRateSqmPerKg.toFixed(1)} m2/kg avg`;
  const sourceLabel = layer.sourceDocument
    ? `Source: ${layer.sourceDocument}${layer.sourcePage ? ` p${layer.sourcePage}` : ''}`
    : undefined;

  return (
    <View style={styles.layerRow}>
      <View style={styles.layerLeft}>
        <Badge label={CATEGORY_LABELS[layer.category] ?? layer.category} variant={badgeVariant} />
        <Text style={styles.layerName}>{layer.productName}</Text>
        <Text style={styles.layerDetail}>{detail}</Text>
        {layer.sourceNote ? <Text style={styles.layerNote}>{layer.sourceNote}</Text> : null}
        {sourceLabel ? <Text style={styles.sourceLabel}>{sourceLabel}</Text> : null}
      </View>
      <View style={styles.layerRight}>
        <Text style={styles.qty}>{layer.quantityLabel ?? `${layer.quantityKg.toFixed(1)} kg`}</Text>
        <Text style={styles.packs}>
          {layer.purchaseLabel ?? `${layer.quantityPacks} x ${layer.packSizeKg} kg`}
        </Text>
        {layer.packLabel ? <Text style={styles.packLabel}>{layer.packLabel}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    color: Colors.navy,
    fontSize: Typography.size.lg,
    fontFamily: Fonts.bold,
    fontWeight: Typography.weight.bold,
    marginBottom: Spacing.xs,
  },
  subheading: { color: Colors.textSecondary, fontSize: Typography.size.sm, fontFamily: Fonts.regular },
  sourceSummary: {
    color: Colors.textSecondary,
    fontSize: Typography.size.xs,
    fontFamily: Fonts.regular,
    lineHeight: Typography.size.xs * 1.45,
    marginTop: Spacing.xs,
  },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.md },
  layerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  layerLeft: { flex: 1, gap: Spacing.xs },
  layerName: { color: Colors.navy, fontSize: Typography.size.base, fontFamily: Fonts.semibold, fontWeight: Typography.weight.medium },
  layerDetail: { color: Colors.textSecondary, fontSize: Typography.size.sm, fontFamily: Fonts.regular },
  layerNote: {
    color: Colors.textSecondary,
    fontSize: Typography.size.xs,
    fontFamily: Fonts.regular,
    lineHeight: Typography.size.xs * 1.35,
  },
  sourceLabel: {
    color: Colors.semcoOrange,
    fontSize: Typography.size.xs,
    fontFamily: Fonts.semibold,
    fontWeight: Typography.weight.semibold,
  },
  layerRight: { alignItems: 'flex-end', gap: 2, maxWidth: 142 },
  qty: { color: Colors.semcoOrange, fontSize: Typography.size.lg, fontFamily: Fonts.bold, fontWeight: Typography.weight.bold },
  packs: { color: Colors.textSecondary, fontSize: Typography.size.sm, fontFamily: Fonts.regular, textAlign: 'right' },
  packLabel: {
    color: Colors.textDisabled,
    fontSize: Typography.size.xs,
    fontFamily: Fonts.regular,
    textAlign: 'right',
    lineHeight: Typography.size.xs * 1.3,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { color: Colors.textSecondary, fontSize: Typography.size.base, fontFamily: Fonts.medium, fontWeight: Typography.weight.medium },
  totalValue: { color: Colors.navy, fontSize: Typography.size.xl, fontFamily: Fonts.bold, fontWeight: Typography.weight.bold },
});

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
  sealer: 'Sealer',
  pigment: 'Pigment',
};

interface MaterialBreakdownCardProps {
  result: CalculationResult;
}

export function MaterialBreakdownCard({ result }: MaterialBreakdownCardProps) {
  return (
    <Card>
      <Text style={styles.heading}>Material Breakdown</Text>
      <Text style={styles.subheading}>
        {result.areaSqm} m2 - {result.wastePct}% waste included
      </Text>

      <View style={styles.divider} />

      {result.layers.map((layer, i) => (
        <LayerRow key={i} layer={layer} />
      ))}

      <View style={styles.divider} />
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total Material</Text>
        <Text style={styles.totalValue}>{result.totalKg.toFixed(1)} kg</Text>
      </View>
    </Card>
  );
}

function LayerRow({ layer }: { layer: MaterialLayer }) {
  const badgeVariant =
    layer.category === 'primer' ? 'warning' :
    layer.category === 'sealer' ? 'primary' :
    'neutral';

  return (
    <View style={styles.layerRow}>
      <View style={styles.layerLeft}>
        <Badge label={CATEGORY_LABELS[layer.category] ?? layer.category} variant={badgeVariant} />
        <Text style={styles.layerName}>{layer.productName}</Text>
        <Text style={styles.layerDetail}>
          {layer.coats} coat{layer.coats > 1 ? 's' : ''} - {layer.coverageRateSqmPerKg.toFixed(1)} m2/kg avg
        </Text>
      </View>
      <View style={styles.layerRight}>
        <Text style={styles.qty}>{layer.quantityKg.toFixed(1)} kg</Text>
        <Text style={styles.packs}>
          {layer.quantityPacks} x {layer.packSizeKg} kg
        </Text>
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
  layerRight: { alignItems: 'flex-end', gap: 2 },
  qty: { color: Colors.semcoOrange, fontSize: Typography.size.lg, fontFamily: Fonts.bold, fontWeight: Typography.weight.bold },
  packs: { color: Colors.textSecondary, fontSize: Typography.size.sm, fontFamily: Fonts.regular },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { color: Colors.textSecondary, fontSize: Typography.size.base, fontFamily: Fonts.medium, fontWeight: Typography.weight.medium },
  totalValue: { color: Colors.navy, fontSize: Typography.size.xl, fontFamily: Fonts.bold, fontWeight: Typography.weight.bold },
});

import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/ui/Card';
import type { CalculationResult } from '@/database/schema/calculations';
import {
  MATERIAL_PRICE_SOURCE,
  getMaterialPriceTotal,
  priceMaterialLayers,
} from '@/knowledge/material-pricing';
import { Colors, Fonts, Radius, Spacing, Typography } from '@/constants/theme';

type MaterialRetailEstimateCardProps = {
  result: CalculationResult;
};

export function MaterialRetailEstimateCard({ result }: MaterialRetailEstimateCardProps) {
  const lines = useMemo(() => priceMaterialLayers(result.layers), [result.layers]);
  const pricedLines = lines.filter((line) => line.quantity > 0);
  const missingPriceLines = pricedLines.filter((line) => !line.price);
  const totalCad = getMaterialPriceTotal(lines);

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>Retail estimate</Text>
          <Text style={styles.source}>{MATERIAL_PRICE_SOURCE}</Text>
        </View>
        <Text style={styles.total}>{formatCad(totalCad)}</Text>
      </View>

      {pricedLines.map((line) => (
        <View key={`${line.layer.productSku}-${line.priceSku}`} style={styles.line}>
          <View style={styles.lineCopy}>
            <Text style={styles.lineName}>{line.price?.product ?? line.layer.productName}</Text>
            <Text style={styles.lineMeta}>
              {line.quantity} x {line.price?.size ?? line.priceSku}
            </Text>
          </View>
          <Text style={styles.lineValue}>
            {line.lineTotalCad != null ? formatCad(line.lineTotalCad) : 'No retail price'}
          </Text>
        </View>
      ))}

      {missingPriceLines.length > 0 ? (
        <Text style={styles.warning}>
          {missingPriceLines.length} item{missingPriceLines.length === 1 ? '' : 's'} need retail pricing before final review.
        </Text>
      ) : null}
    </Card>
  );
}

function formatCad(value: number): string {
  return `$${value.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const styles = StyleSheet.create({
  card: { gap: Spacing.md, borderColor: Colors.primaryMuted },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  titleWrap: { flex: 1, gap: 2 },
  title: {
    color: Colors.navy,
    fontFamily: Fonts.bold,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
  },
  source: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: Typography.size.xs,
  },
  total: {
    color: Colors.semcoOrange,
    fontFamily: Fonts.bold,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
  },
  line: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  lineCopy: { flex: 1, gap: 2 },
  lineName: {
    color: Colors.navy,
    fontFamily: Fonts.semibold,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
  },
  lineMeta: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: Typography.size.xs,
  },
  lineValue: {
    minWidth: 92,
    color: Colors.navy,
    fontFamily: Fonts.bold,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.bold,
    textAlign: 'right',
  },
  warning: {
    borderRadius: Radius.md,
    backgroundColor: Colors.accentMuted,
    color: Colors.semcoOrange,
    fontFamily: Fonts.semibold,
    fontSize: Typography.size.xs,
    lineHeight: Typography.size.xs * 1.35,
    padding: Spacing.sm,
  },
});

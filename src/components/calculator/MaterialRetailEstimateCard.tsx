import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/ui/Card';
import type { CalculationResult, ColourTintSampleLine } from '@/database/schema/calculations';
import {
  getMaterialPriceTotal,
  priceMaterialLayers,
} from '@/knowledge/material-pricing';
import { Colors, Fonts, Radius, Spacing, Typography } from '@/constants/theme';
import { UNASSIGNED_DEALER_CONTEXT, type DealerContext } from '@/constants/dealers';
import { formatBatchPlan } from '@/components/calculator/ColourTintPlanCard';
import { hasLegacyQuartTintBatch, hasLegacySamplePricing } from '@/services/tint-planning';

type MaterialRetailEstimateCardProps = {
  result: CalculationResult;
  dealerContext?: DealerContext;
};

export function MaterialRetailEstimateCard({ result, dealerContext = UNASSIGNED_DEALER_CONTEXT }: MaterialRetailEstimateCardProps) {
  const lines = useMemo(() => priceMaterialLayers(result.layers), [result.layers]);
  const pricedLines = lines.filter((line) => line.quantity > 0);
  const missingPriceLines = pricedLines.filter((line) => !line.price);
  const tintPlan = result.colourTintPlan;
  const needsBatchRecalculation = hasLegacyQuartTintBatch(tintPlan);
  const needsSamplePricingRecalculation = hasLegacySamplePricing(tintPlan);
  const needsTintRecalculation = needsBatchRecalculation || needsSamplePricingRecalculation;
  const totalCad = getMaterialPriceTotal(lines) + (needsTintRecalculation ? 0 : tintPlan?.totalChargeCad ?? 0);
  const showPrices = dealerContext.pricingAvailable;
  const hasPendingTintPrice = Boolean(tintPlan && (tintPlan.totalChargeCad == null || needsTintRecalculation));
  const hasTintReview = Boolean(tintPlan && (!tintPlan.isFullyPriced || needsTintRecalculation));
  const hasProjectFormulaReview = Boolean(tintPlan?.allocations.some((allocation) => allocation.pricingStatus === 'dealer_review'));
  const hasSampleFormulaReview = Boolean(tintPlan?.samplePlan?.samples.some((sample) => sample.pricingStatus === 'dealer_review'));

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>{showPrices ? `${dealerContext.dealerName} estimate` : 'Dealer estimate'}</Text>
          <Text style={styles.source}>{dealerContext.pricingSourceLabel}</Text>
        </View>
        <Text style={styles.total}>
          {showPrices && missingPriceLines.length === 0 && !hasPendingTintPrice ? formatCad(totalCad) : 'Pending'}
        </Text>
      </View>

      {pricedLines.map((line) => (
        <View key={`${line.layer.productSku}-${line.priceSku}`} style={styles.line}>
          <View style={styles.lineCopy}>
            <Text style={styles.lineName}>{line.price?.product ?? line.layer.productName}</Text>
            <Text style={styles.lineMeta}>
              {line.quantity} x {line.price?.size ?? line.packageLabel ?? line.priceSku}
              {showPrices && line.price ? ` @ ${formatCad(line.price.retailPriceCad)}` : ''}
            </Text>
            {line.layer.category === 'prep' && line.price?.coverageRate ? (
              <Text style={styles.lineCoverage}>{line.price.coverageRate}</Text>
            ) : null}
          </View>
          <Text style={styles.lineValue}>
            {showPrices && line.lineTotalCad != null ? formatCad(line.lineTotalCad) : 'Dealer price pending'}
          </Text>
        </View>
      ))}

      {tintPlan?.allocations.map((allocation) => (
        <View key={`tint-${allocation.colourId}`} style={styles.line}>
          <View style={styles.lineCopy}>
            <Text style={styles.lineName}>{allocation.colourName} pigment tint</Text>
            <Text style={styles.lineMeta}>
              {allocation.colourCode}{allocation.formulaCode !== allocation.colourCode ? ` · formula ${allocation.formulaCode}` : ''}
            </Text>
            <Text style={styles.lineCoverage}>{formatBatchPlan(allocation.batches)}</Text>
          </View>
          <Text style={styles.lineValue}>
            {needsBatchRecalculation
              ? 'Recalculate'
              : allocation.totalChargeCad != null ? formatCad(allocation.totalChargeCad) : 'Dealer formula review'}
          </Text>
        </View>
      ))}

      {tintPlan?.samplePlan?.samples.map((sample) => (
        <View key={`tint-sample-${sample.colourId}`} style={styles.line}>
          <View style={styles.lineCopy}>
            <Text style={styles.lineName}>{sample.colourName} prepared colour sample</Text>
            <Text style={styles.lineMeta}>{sample.colourCode} · Prepared 1 quart / 946 mL X-Bond Liquid included</Text>
            <Text style={sample.isSampleComplimentary && !needsSamplePricingRecalculation ? styles.freeLineMeta : styles.lineCoverage}>
              {needsSamplePricingRecalculation
                ? 'Saved sample policy — recalculate before ordering'
                : formatSamplePriceBreakdown(sample)}
            </Text>
            {!needsSamplePricingRecalculation && sample.pricingStatus === 'dealer_review' ? (
              <Text style={styles.reviewLineMeta}>Tint formula requires dealer review before mixing.</Text>
            ) : null}
          </View>
          <Text style={sample.isSampleComplimentary && !needsSamplePricingRecalculation ? styles.freeLineValue : styles.lineValue}>
            {needsSamplePricingRecalculation
              ? 'Recalculate'
              : sample.isSampleComplimentary
              ? 'FREE'
              : sample.totalChargeCad != null ? formatCad(sample.totalChargeCad) : 'Dealer formula review'}
          </Text>
        </View>
      ))}

      <Text style={showPrices ? styles.routeNote : styles.warning}>
        {dealerContext.orderRoutingLabel}
      </Text>

      {missingPriceLines.length > 0 ? (
        <Text style={styles.warning}>
          {missingPriceLines.length} item{missingPriceLines.length === 1 ? '' : 's'} need retail pricing before final review.
        </Text>
      ) : null}
      {hasTintReview ? (
        <Text style={styles.warning}>
          {needsBatchRecalculation
            ? 'Recalculate this saved tint plan before ordering so it uses only 1- and 5-gallon project batches.'
            : needsSamplePricingRecalculation
            ? 'Recalculate this saved sample plan for the $40 flat rate with X-Bond Liquid and pigment included.'
            : hasProjectFormulaReview && hasSampleFormulaReview
            ? 'Project and sample colour formulas need dealer review before pricing and mixing can be finalized.'
            : hasSampleFormulaReview
            ? 'One or more sample formulas need dealer review before the sample can be mixed.'
            : 'One or more project colour formulas need dealer review before the tint charge can be finalized.'}
        </Text>
      ) : null}
      {tintPlan?.samplePlan && !needsSamplePricingRecalculation ? (
        <Text style={styles.sampleLiquidNote}>
          The $40 flat rate includes a prepared quart of X-Bond Liquid and pigment from dealer sample stock. No extra project pail is added.
        </Text>
      ) : null}
    </Card>
  );
}

function formatCad(value: number): string {
  return `$${value.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatCadCompact(value: number): string {
  return Number.isInteger(value) ? `$${value.toLocaleString('en-CA')}` : formatCad(value);
}

function formatSamplePriceBreakdown(sample: ColourTintSampleLine): string {
  const flatRate = sample.flatRateCad != null
    ? formatCadCompact(sample.flatRateCad)
    : 'Flat-rate review required';
  return `${flatRate} flat rate · X-Bond Liquid + pigment included${sample.isSampleComplimentary ? ' · waived' : ''}`;
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
  lineCoverage: {
    color: Colors.textDisabled,
    fontFamily: Fonts.regular,
    fontSize: Typography.size.xs,
    lineHeight: Typography.size.xs * 1.3,
  },
  freeLineMeta: {
    color: Colors.success,
    fontFamily: Fonts.semibold,
    fontSize: Typography.size.xs,
    lineHeight: Typography.size.xs * 1.3,
  },
  reviewLineMeta: {
    color: Colors.semcoOrange,
    fontFamily: Fonts.semibold,
    fontSize: Typography.size.xs,
    lineHeight: Typography.size.xs * 1.3,
  },
  lineValue: {
    minWidth: 92,
    color: Colors.navy,
    fontFamily: Fonts.bold,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.bold,
    textAlign: 'right',
  },
  freeLineValue: {
    minWidth: 92,
    color: Colors.success,
    fontFamily: Fonts.bold,
    fontSize: Typography.size.sm,
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
  routeNote: {
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryMuted,
    color: Colors.primary,
    fontFamily: Fonts.semibold,
    fontSize: Typography.size.xs,
    lineHeight: Typography.size.xs * 1.35,
    padding: Spacing.sm,
  },
  sampleLiquidNote: {
    color: Colors.darkTeal,
    fontFamily: Fonts.medium,
    fontSize: Typography.size.xs,
    lineHeight: Typography.size.xs * 1.35,
  },
});

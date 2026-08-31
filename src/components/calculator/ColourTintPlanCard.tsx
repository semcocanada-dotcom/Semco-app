import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import type {
  ColourTintPlan,
  ColourTintSampleLine,
  ColourTintSamplePlan,
  TintBatchPlanLine,
} from '@/database/schema/calculations';
import { getColourChargeRecord } from '@/knowledge/colour-charges';
import { hasLegacyQuartTintBatch, hasLegacySamplePricing } from '@/services/tint-planning';
import { Colors, Fonts, Radius, Spacing, Typography } from '@/constants/theme';

export function ColourTintPlanCard({ plan }: { plan: ColourTintPlan }) {
  const [showDetails, setShowDetails] = useState(false);
  const needsBatchRecalculation = hasLegacyQuartTintBatch(plan);
  const needsSamplePricingRecalculation = hasLegacySamplePricing(plan);
  const needsRecalculation = needsBatchRecalculation || needsSamplePricingRecalculation;
  const usesCurrentSamplePricing = Boolean(plan.samplePlan) && !needsSamplePricingRecalculation;

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.icon}>
          <Ionicons name="color-fill-outline" size={21} color={Colors.darkTeal} />
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Colour & tint summary</Text>
          <Text style={styles.subtitle}>
            {needsRecalculation
              ? 'Saved tint plan needs recalculation'
              : `${formatGallons(plan.exactLiquidGallons)} gal required · ${formatGallons(plan.preparedLiquidGallons)} gal prepared`}
          </Text>
        </View>
      </View>

      {needsRecalculation ? (
        <View style={styles.recalculationWarning}>
          <Ionicons name="warning-outline" size={17} color={Colors.semcoOrange} />
          <Text style={styles.recalculationWarningText}>
            {needsBatchRecalculation
              ? 'This saved plan used a quart job batch. Recalculate before ordering so it uses 1- and 5-gallon project batches.'
              : 'This saved sample used an older policy. Recalculate for the $40 flat rate with X-Bond Liquid and pigment included.'}
          </Text>
        </View>
      ) : null}

      {plan.allocations.map((allocation) => (
        <View key={allocation.colourId} style={styles.allocation}>
          <View style={styles.allocationHeader}>
            <View style={styles.colourIdentity}>
              <ColourSwatch hex={allocation.swatchHex ?? getColourChargeRecord(allocation.colourId)?.swatchHex ?? undefined} />
              <View style={styles.allocationCopy}>
                <Text style={styles.colourName}>{allocation.colourName}</Text>
                <Text style={styles.colourMeta}>{allocation.colourCode} · {formatArea(allocation.areaSqft)} sq ft</Text>
              </View>
            </View>
            <Text style={styles.charge}>
              {needsBatchRecalculation
                ? 'Recalculate'
                : allocation.totalChargeCad != null ? formatCad(allocation.totalChargeCad) : 'Review'}
            </Text>
          </View>

          <Text style={styles.batchText}>{formatBatchPlan(allocation.batches)}</Text>
          {allocation.preparationNote ? (
            <View style={styles.noteFlag}>
              <Ionicons name="information-circle-outline" size={15} color={Colors.darkTeal} />
              <Text style={styles.noteFlagText}>Important preparation note in details</Text>
            </View>
          ) : null}
          {allocation.reviewReason ? <Text style={styles.review}>{allocation.reviewReason}</Text> : null}
        </View>
      ))}

      {plan.samplePlan ? (
        <View style={styles.sampleSection}>
          <View style={styles.sampleHeader}>
            <View style={styles.sampleHeaderCopy}>
              <Text style={styles.sampleTitle}>Prepared colour samples</Text>
              <Text style={styles.sampleSubtitle}>
                {plan.samplePlan.samples.length} × {plan.samplePlan.sampleLabel}
              </Text>
            </View>
            <Text style={plan.samplePlan.isSampleComplimentary && !needsSamplePricingRecalculation ? styles.sampleFree : styles.sampleTotal}>
              {needsSamplePricingRecalculation
                ? 'Recalculate'
                : plan.samplePlan.isSampleComplimentary
                ? 'FREE'
                : plan.samplePlan.totalChargeCad != null ? formatCad(plan.samplePlan.totalChargeCad) : 'Review'}
            </Text>
          </View>
          {plan.samplePlan.samples.map((sample) => {
            const usesCurrentPricing = !needsSamplePricingRecalculation && hasCurrentSampleLinePricing(sample);
            return (
              <View key={`sample-${sample.colourId}`} style={styles.sampleLine}>
                <View style={styles.colourIdentity}>
                  <ColourSwatch hex={sample.swatchHex ?? getColourChargeRecord(sample.colourId)?.swatchHex ?? undefined} />
                  <View style={styles.allocationCopy}>
                    <Text style={styles.sampleColourName}>{sample.colourName}</Text>
                    <Text style={styles.colourMeta}>{sample.colourCode} · 1 quart / 946 mL X-Bond Liquid</Text>
                    {usesCurrentPricing ? (
                      <Text style={sample.isSampleComplimentary ? styles.sampleWaivedMeta : styles.samplePricingMeta}>
                        {formatSamplePriceBreakdown(sample)}
                      </Text>
                    ) : null}
                    {!needsSamplePricingRecalculation && sample.pricingStatus === 'dealer_review' ? (
                      <Text style={styles.review}>Tint formula requires dealer review before mixing.</Text>
                    ) : null}
                  </View>
                </View>
                <Text style={sample.isSampleComplimentary && !needsSamplePricingRecalculation ? styles.sampleFree : sample.totalChargeCad != null ? styles.sampleLinePrice : styles.review}>
                  {needsSamplePricingRecalculation
                    ? 'Recalculate'
                    : sample.isSampleComplimentary
                    ? 'FREE'
                    : sample.totalChargeCad != null ? formatCad(sample.totalChargeCad) : 'Dealer review'}
                </Text>
              </View>
            );
          })}
        </View>
      ) : null}

      {!needsRecalculation ? (
        <TouchableOpacity
          onPress={() => setShowDetails((visible) => !visible)}
          activeOpacity={0.72}
          style={styles.detailsToggle}
          accessibilityRole="button"
          accessibilityState={{ expanded: showDetails }}
          accessibilityLabel={`${showDetails ? 'Hide' : 'Show'} tint-machine details`}
        >
          <View style={styles.detailsToggleCopy}>
            <Ionicons name="options-outline" size={18} color={Colors.darkTeal} />
            <Text style={styles.detailsToggleText}>{showDetails ? 'Hide tinting details' : 'Show tinting details'}</Text>
          </View>
          <Ionicons name={showDetails ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
      ) : null}

      {showDetails && !needsRecalculation ? (
        <View style={styles.detailsPanel}>
          <Text style={styles.batchPolicy}>
            Project orders use 1-gallon and 5-gallon tint batches. The $40 sample flat rate includes a prepared quart of X-Bond Liquid and pigment from dealer sample stock, so no extra project pail is added.
          </Text>
          {plan.allocations.map((allocation) => (
            <View key={`details-${allocation.colourId}`} style={styles.detailAllocation}>
              <Text style={styles.detailColourTitle}>
                {allocation.colourName} · {allocation.colourCode}
                {allocation.formulaCode !== allocation.colourCode ? ` · formula ${allocation.formulaCode}` : ''}
              </Text>
              <Text style={styles.liquidText}>
                {formatGallons(allocation.exactLiquidGallons)} gal needed · {formatGallons(allocation.preparedLiquidGallons)} gal prepared
              </Text>
              {allocation.preparationNote ? (
                <View style={styles.note}>
                  <Ionicons name="information-circle-outline" size={16} color={Colors.darkTeal} />
                  <Text style={styles.noteText}>{allocation.preparationNote}</Text>
                </View>
              ) : null}
              {allocation.batches.some((batch) => batch.pigments?.length) ? (
                <View style={styles.formulaBox}>
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
            </View>
          ))}
          {plan.samplePlan ? (
            <View style={styles.sampleDetailSection}>
              <Text style={styles.detailColourTitle}>Prepared one-quart sample formulas</Text>
              {plan.samplePlan.samples.map((sample) => (
                <View key={`sample-detail-${sample.colourId}`} style={styles.detailAllocation}>
                  <Text style={styles.batchFormulaTitle}>{sample.colourName} · {sample.colourCode}</Text>
                  {sample.batch?.pigments?.length ? (
                    <View style={styles.formulaBox}>
                      {sample.batch.pigments.map((pigment) => (
                        <Text key={`${sample.colourId}-${pigment.pigmentCode}`} style={styles.formulaLine}>
                          {pigment.pigmentCode} · {pigment.pigmentName}: {pigment.dispenserAmount}
                        </Text>
                      ))}
                    </View>
                  ) : sample.pricingStatus === 'priced' ? (
                    <Text style={styles.liquidText}>No pigment addition required for this sample.</Text>
                  ) : (
                    <Text style={styles.review}>{sample.reviewReason ?? 'Dealer review is required for this sample formula.'}</Text>
                  )}
                </View>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}

      <View style={styles.totalRow}>
        <View>
          <Text style={styles.totalLabel}>{usesCurrentSamplePricing ? 'Colour & sample charges' : 'Tint charge'}</Text>
          <Text style={styles.totalNote}>
            {needsSamplePricingRecalculation
              ? 'Saved sample pricing needs an update'
              : usesCurrentSamplePricing
              ? plan.samplePlan?.isSampleComplimentary
                ? `Samples free at ${formatSampleThreshold(plan.samplePlan)}`
                : 'Samples · $40 flat rate each'
              : `${plan.samplePlan ? 'Project and sample tint' : 'SEMCO machine ounces'} at ${formatCad(plan.ratePerTintOunceCad)}/oz`}
          </Text>
        </View>
        <Text style={styles.totalValue}>
          {needsRecalculation ? 'Recalculate' : plan.totalChargeCad != null ? formatCad(plan.totalChargeCad) : 'Dealer review'}
        </Text>
      </View>
      <Text style={styles.disclaimer}>
        {usesCurrentSamplePricing
          ? 'The $40 flat rate includes a prepared quart of X-Bond Liquid and pigment from dealer sample stock. No extra project pail is added. Production pigment charging is unchanged.'
          : 'Tint charge only. X-Bond Liquid, labour, freight, tax, and other material charges are separate.'}
      </Text>
    </Card>
  );
}

function hasCurrentSampleLinePricing(sample: ColourTintSampleLine): boolean {
  return sample.flatRateCad != null
    || sample.subtotalChargeCad != null
    || sample.discountCad != null
    || sample.isSampleComplimentary != null;
}

function formatSamplePriceBreakdown(sample: ColourTintSampleLine): string {
  const flatRate = sample.flatRateCad != null
    ? formatCadCompact(sample.flatRateCad)
    : 'Flat-rate review required';
  return `${flatRate} flat rate · X-Bond Liquid + pigment included${sample.isSampleComplimentary ? ' · waived' : ''}`;
}

function formatSampleThreshold(plan: ColourTintSamplePlan): string {
  return plan.sampleComplimentaryThresholdSqft != null
    ? `${formatArea(plan.sampleComplimentaryThresholdSqft)}+ sq ft`
    : 'qualifying project size';
}

function ColourSwatch({ hex }: { hex?: string }) {
  return (
    <View accessible={false} style={[styles.colourSwatch, hex ? { backgroundColor: hex } : styles.colourSwatchUnavailable]}>
      {!hex ? <Ionicons name="remove-outline" size={14} color={Colors.textDisabled} /> : null}
    </View>
  );
}

export function formatBatchPlan(batches: TintBatchPlanLine[]): string {
  if (batches.some((batch) => batch.batchSize === 'quart')) {
    return 'Recalculate for 1- and 5-gallon project batches';
  }
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

function formatCadCompact(value: number): string {
  return Number.isInteger(value) ? `$${value.toLocaleString('en-CA')}` : formatCad(value);
}

const styles = StyleSheet.create({
  card: { gap: Spacing.md, borderColor: Colors.lightTeal },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  icon: { width: 42, height: 42, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primaryMuted },
  headerCopy: { flex: 1, gap: 2 },
  title: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: Typography.size.lg },
  subtitle: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: Typography.size.xs, lineHeight: Typography.size.xs * 1.4 },
  recalculationWarning: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, borderRadius: Radius.md, backgroundColor: Colors.accentMuted, padding: Spacing.sm },
  recalculationWarningText: { flex: 1, color: Colors.semcoOrange, fontFamily: Fonts.semibold, fontSize: Typography.size.xs, lineHeight: Typography.size.xs * 1.4 },
  allocation: { gap: 5, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.sm },
  allocationHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.sm },
  colourIdentity: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  colourSwatch: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(8, 46, 55, 0.18)', alignItems: 'center', justifyContent: 'center' },
  colourSwatchUnavailable: { backgroundColor: Colors.white, borderStyle: 'dashed' },
  allocationCopy: { flex: 1, gap: 2 },
  colourName: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: Typography.size.base },
  colourMeta: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: Typography.size.xs },
  charge: { color: Colors.semcoOrange, fontFamily: Fonts.bold, fontSize: Typography.size.base },
  batchText: { color: Colors.navy, fontFamily: Fonts.semibold, fontSize: Typography.size.sm },
  liquidText: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: Typography.size.xs },
  noteFlag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  noteFlagText: { color: Colors.darkTeal, fontFamily: Fonts.medium, fontSize: Typography.size.xs },
  detailsToggle: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.sm },
  detailsToggleCopy: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  detailsToggleText: { color: Colors.darkTeal, fontFamily: Fonts.semibold, fontSize: Typography.size.sm },
  detailsPanel: { gap: Spacing.sm, borderRadius: Radius.md, backgroundColor: Colors.surfaceElevated, padding: Spacing.sm },
  batchPolicy: { color: Colors.darkTeal, fontFamily: Fonts.semibold, fontSize: Typography.size.xs, lineHeight: Typography.size.xs * 1.4 },
  detailAllocation: { gap: Spacing.sm },
  detailColourTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: Typography.size.sm },
  note: { flexDirection: 'row', alignItems: 'flex-start', gap: 5, borderRadius: Radius.sm, backgroundColor: Colors.primaryMuted, padding: Spacing.sm },
  noteText: { flex: 1, color: Colors.darkTeal, fontFamily: Fonts.medium, fontSize: Typography.size.xs, lineHeight: Typography.size.xs * 1.35 },
  formulaBox: { gap: 2, borderRadius: Radius.sm, backgroundColor: Colors.white, padding: Spacing.sm },
  batchFormula: { gap: 2, paddingTop: 4 },
  batchFormulaTitle: { color: Colors.darkTeal, fontFamily: Fonts.bold, fontSize: Typography.size.xs },
  formulaLine: { color: Colors.navy, fontFamily: Fonts.medium, fontSize: Typography.size.xs, lineHeight: Typography.size.xs * 1.35 },
  review: { color: Colors.danger, fontFamily: Fonts.semibold, fontSize: Typography.size.xs },
  sampleSection: { gap: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.sm },
  sampleHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.sm },
  sampleHeaderCopy: { flex: 1, gap: 2 },
  sampleTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: Typography.size.base },
  sampleSubtitle: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: Typography.size.xs },
  sampleTotal: { color: Colors.semcoOrange, fontFamily: Fonts.bold, fontSize: Typography.size.base },
  sampleLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
  sampleColourName: { color: Colors.navy, fontFamily: Fonts.semibold, fontSize: Typography.size.sm },
  sampleLinePrice: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: Typography.size.sm },
  sampleFree: { color: Colors.success, fontFamily: Fonts.bold, fontSize: Typography.size.base },
  samplePricingMeta: { color: Colors.darkTeal, fontFamily: Fonts.medium, fontSize: Typography.size.xs, lineHeight: Typography.size.xs * 1.3 },
  sampleWaivedMeta: { color: Colors.success, fontFamily: Fonts.semibold, fontSize: Typography.size.xs, lineHeight: Typography.size.xs * 1.3 },
  sampleDetailSection: { gap: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.sm },
  totalRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.sm },
  totalLabel: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: Typography.size.base },
  totalNote: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: Typography.size.xs },
  totalValue: { color: Colors.semcoOrange, fontFamily: Fonts.bold, fontSize: Typography.size.xl },
  disclaimer: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: Typography.size.xs, lineHeight: Typography.size.xs * 1.35 },
});

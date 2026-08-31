import type {
  CalculationResult,
  ColourTintPlan,
  ColourTintSampleLine,
  ColourTintSamplePlan,
} from '@/database/schema/calculations';
import { hasLegacyQuartTintBatch, hasLegacySamplePricing } from '@/services/tint-planning';

export function hasColourTintPlan(result?: CalculationResult): boolean {
  return Boolean(result?.colourTintPlan?.allocations.length);
}

export function canSaveMaterialRequest(result: CalculationResult | undefined, customItemNotes: string): boolean {
  if (result) return hasColourTintPlan(result) && !requiresWholeGallonTintRecalculation(result);
  return Boolean(customItemNotes.trim());
}

export function requiresWholeGallonTintRecalculation(result?: CalculationResult): boolean {
  return hasLegacyQuartTintBatch(result?.colourTintPlan)
    || hasLegacySamplePricing(result?.colourTintPlan);
}

export function buildTintRequestSummaryLines(plan?: ColourTintPlan): string[] {
  if (!plan?.allocations.length) return [];
  if (hasLegacyQuartTintBatch(plan)) {
    return [
      'Colour tint preparation:',
      'RECALCULATION REQUIRED: this saved plan used a quart job batch. Recalculate it for 1- and 5-gallon project batches before ordering.',
    ];
  }
  if (hasLegacySamplePricing(plan)) {
    return [
      'Colour tint preparation:',
      'RECALCULATION REQUIRED: this saved plan used an older sample policy. Recalculate it for the $40 flat sample rate with X-Bond Liquid and pigment included before ordering.',
    ];
  }

  const lines = [
    'Colour tint preparation:',
    'Project orders use 1-gallon and 5-gallon tint batches.',
  ];
  if (plan.samplePlan) {
    lines.push('Each sample is a $40 flat rate including a prepared quart of X-Bond Liquid and pigment from dealer sample stock, so no extra project pail is added. All sample fees are waived at 500+ sq ft.');
  }
  for (const allocation of plan.allocations) {
    lines.push(
      `- ${allocation.colourName} (${allocation.colourCode})${allocation.formulaCode !== allocation.colourCode ? `; source formula ${allocation.formulaCode}` : ''}: ${formatNumber(allocation.areaSqft)} sq ft; ${formatNumber(allocation.exactLiquidGallons)} gal exact; ${formatNumber(allocation.preparedLiquidGallons)} gal prepared; ${formatBatches(allocation.batches)}; ${allocation.totalChargeCad != null ? `${formatCad(allocation.totalChargeCad)} tint charge` : 'DEALER FORMULA REVIEW REQUIRED'}.`,
    );
    if (allocation.preparationNote) lines.push(`  Preparation note: ${allocation.preparationNote}`);
    if (allocation.batches.some((batch) => batch.pigments?.length)) {
      lines.push('  Tint-machine formulas by batch (dispense each batch separately):');
      allocation.batches.forEach((batch) => {
        if (!batch.pigments?.length) return;
        lines.push(`  ${batch.quantity} x ${batch.batchLabel} batch${batch.quantity === 1 ? '' : 'es'}; formula below is per batch:`);
        batch.pigments.forEach((pigment) => {
          lines.push(`  • ${pigment.pigmentCode} ${pigment.pigmentName}: ${pigment.dispenserAmount} (${formatNumber(pigment.tintOunces)} machine oz)`);
        });
      });
    }
    if (allocation.reviewReason) lines.push(`  Review: ${allocation.reviewReason}`);
  }

  if (plan.samplePlan?.samples.length) {
    lines.push('', `Colour samples — ${plan.samplePlan.sampleLabel} each:`);
    for (const sample of plan.samplePlan.samples) {
      lines.push(
        `- ${sample.colourName} (${sample.colourCode}): ${sample.sampleLabel}; ${formatSamplePriceSummary(sample)}.`,
      );
      if (sample.batch?.pigments?.length) {
        lines.push('  Quart sample tint-machine formula:');
        sample.batch.pigments.forEach((pigment) => {
          lines.push(`  • ${pigment.pigmentCode} ${pigment.pigmentName}: ${pigment.dispenserAmount} (${formatNumber(pigment.tintOunces)} machine oz)`);
        });
      } else if (sample.pricingStatus === 'priced') {
        lines.push('  No pigment addition required for this sample.');
      }
      if (sample.reviewReason) lines.push(`  Review: ${sample.reviewReason}`);
    }
    lines.push(formatSamplePlanPriceSummary(plan.samplePlan));
  }

  lines.push(
    plan.samplePlan
      ? `Total colour charges: ${plan.totalChargeCad != null ? formatCad(plan.totalChargeCad) : 'Dealer review required'} (project pigment tint + sample charges).`
      : `Total tint charge: ${plan.totalChargeCad != null ? formatCad(plan.totalChargeCad) : 'Dealer review required'}.`,
    `X-Bond Liquid: ${formatNumber(plan.exactLiquidGallons)} gal exact for the project; ${formatNumber(plan.preparedLiquidGallons)} gal prepared for project batches; ${formatNumber(plan.baseLiquidPurchaseGallons)} gal staged for purchase.${plan.samplePlan ? ' Sample quarts come from dealer sample stock; no additional X-Bond Liquid or pail is added to the project order.' : ''}`,
    plan.samplePlan
      ? 'The $40 per-sample flat rate includes one prepared quart of X-Bond Liquid and its pigment. Production pigment charging is unchanged. Installation labour, freight, tax, and other charges are separate.'
      : 'Tint charge only; X-Bond Liquid, labour, freight, tax, and other material charges are separate.',
  );
  return lines;
}

function formatSamplePriceSummary(sample: ColourTintSampleLine): string {
  const flatRate = sample.flatRateCad != null
    ? `${formatCadCompact(sample.flatRateCad)} flat rate (prepared X-Bond Liquid + pigment included)`
    : 'FLAT-RATE REVIEW REQUIRED';
  if (sample.isSampleComplimentary) {
    const waived = sample.discountCad != null ? `${formatCad(sample.discountCad)} sample fee waived` : 'sample fee waived';
    return `${flatRate}; FREE — ${waived}; sample total ${sample.totalChargeCad != null ? formatCad(sample.totalChargeCad) : '$0.00'}`;
  }
  return `${flatRate}; sample total ${sample.totalChargeCad != null ? formatCad(sample.totalChargeCad) : 'PENDING DEALER REVIEW'}`;
}

function formatSamplePlanPriceSummary(plan: ColourTintSamplePlan): string {
  const flatRate = plan.totalFlatRateCad != null
    ? formatCad(plan.totalFlatRateCad)
    : 'review required';
  if (plan.isSampleComplimentary) {
    const threshold = plan.sampleComplimentaryThresholdSqft != null
      ? `${formatNumber(plan.sampleComplimentaryThresholdSqft)} sq ft or more`
      : 'the qualifying project size';
    const waived = plan.totalDiscountCad != null ? `${formatCad(plan.totalDiscountCad)} sample fees waived` : 'sample fees waived';
    return `Sample pricing: Flat rates ${flatRate}; prepared X-Bond Liquid + pigment included; ${waived}; FREE at ${threshold}; sample total ${plan.totalChargeCad != null ? formatCad(plan.totalChargeCad) : '$0.00'}.`;
  }
  return `Sample pricing: Flat rates ${flatRate}; prepared X-Bond Liquid + pigment included; sample total ${plan.totalChargeCad != null ? formatCad(plan.totalChargeCad) : 'pending dealer review'}.`;
}

function formatBatches(batches: ColourTintPlan['allocations'][number]['batches']): string {
  return batches
    .map((batch) => `${batch.quantity} x ${batch.batchLabel} tint batch${batch.quantity === 1 ? '' : 'es'}`)
    .join(' + ');
}

function formatNumber(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

function formatCad(value: number): string {
  return `$${value.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatCadCompact(value: number): string {
  return Number.isInteger(value) ? `$${value.toLocaleString('en-CA')}` : formatCad(value);
}

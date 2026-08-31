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
      'RECALCULATION REQUIRED: this saved plan used an older sample policy. Recalculate it to apply the $30 prepared-quart fee without adding extra X-Bond Liquid before ordering.',
    ];
  }

  const lines = [
    'Colour tint preparation:',
    'Project orders use 1-gallon and 5-gallon tint batches. Sample quarts are drawn from the job\'s ordered X-Bond Liquid and do not add extra liquid purchase quantity.',
  ];
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
    `X-Bond Liquid: ${formatNumber(plan.exactLiquidGallons)} gal exact for the project; ${formatNumber(plan.preparedLiquidGallons)} gal prepared for project batches; ${formatNumber(plan.baseLiquidPurchaseGallons)} gal staged for purchase.${plan.samplePlan ? ' Sample quarts are drawn from that staged job quantity; no additional X-Bond Liquid is purchased for samples.' : ''}`,
    plan.samplePlan
      ? 'The prepared-sample fee includes making the quart from the customer\'s ordered X-Bond Liquid; pigment is charged separately. Labour, freight, tax, and other material charges are separate.'
      : 'Tint charge only; X-Bond Liquid, labour, freight, tax, and other material charges are separate.',
  );
  return lines;
}

function formatSamplePriceSummary(sample: ColourTintSampleLine): string {
  const pigment = sample.pigmentChargeCad != null
    ? formatCad(sample.pigmentChargeCad)
    : 'DEALER FORMULA REVIEW REQUIRED';
  const preparation = sample.preparationFeeCad != null
    ? `${formatCadCompact(sample.preparationFeeCad)} prepared-quart fee (from ordered X-Bond Liquid)`
    : 'PREPARED-QUART FEE REVIEW REQUIRED';
  if (sample.isComplimentary) {
    const waived = sample.discountCad != null ? `${formatCad(sample.discountCad)} waived` : 'both charges waived';
    return `${preparation}; pigment tint ${pigment}; FREE — ${waived}`;
  }
  return `${preparation}; pigment tint ${pigment}; sample total ${sample.totalChargeCad != null ? formatCad(sample.totalChargeCad) : 'PENDING DEALER REVIEW'}`;
}

function formatSamplePlanPriceSummary(plan: ColourTintSamplePlan): string {
  const pigment = plan.totalPigmentChargeCad != null
    ? formatCad(plan.totalPigmentChargeCad)
    : 'dealer formula review required';
  const preparation = plan.totalPreparationFeeCad != null
    ? formatCad(plan.totalPreparationFeeCad)
    : 'review required';
  if (plan.isComplimentary) {
    const threshold = plan.complimentaryThresholdSqft != null
      ? `${formatNumber(plan.complimentaryThresholdSqft)} sq ft or more`
      : 'the complimentary project threshold';
    const waived = plan.totalDiscountCad != null ? `${formatCad(plan.totalDiscountCad)} waived; ` : '';
    return `Sample pricing: Prepared-quart fees ${preparation}; pigment tint ${pigment}; ${waived}FREE at ${threshold} — both charges waived.`;
  }
  return `Sample pricing: Prepared-quart fees ${preparation}; pigment tint ${pigment}; sample total ${plan.totalChargeCad != null ? formatCad(plan.totalChargeCad) : 'pending dealer review'}.`;
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

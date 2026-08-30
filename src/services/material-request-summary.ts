import type { CalculationResult, ColourTintPlan } from '@/database/schema/calculations';
import { hasLegacyQuartTintBatch } from '@/services/tint-planning';

export function hasColourTintPlan(result?: CalculationResult): boolean {
  return Boolean(result?.colourTintPlan?.allocations.length);
}

export function canSaveMaterialRequest(result: CalculationResult | undefined, customItemNotes: string): boolean {
  if (result) return hasColourTintPlan(result) && !requiresWholeGallonTintRecalculation(result);
  return Boolean(customItemNotes.trim());
}

export function requiresWholeGallonTintRecalculation(result?: CalculationResult): boolean {
  return hasLegacyQuartTintBatch(result?.colourTintPlan);
}

export function buildTintRequestSummaryLines(plan?: ColourTintPlan): string[] {
  if (!plan?.allocations.length) return [];
  if (hasLegacyQuartTintBatch(plan)) {
    return [
      'Colour tint preparation:',
      'RECALCULATION REQUIRED: this saved plan used a quart job batch. Recalculate it for 1- and 5-gallon project batches before ordering.',
    ];
  }

  const lines = [
    'Colour tint preparation:',
    'Project orders use 1-gallon and 5-gallon tint batches; quart formulas are reserved for samples.',
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
        `- ${sample.colourName} (${sample.colourCode}): ${sample.sampleLabel}; ${sample.totalChargeCad != null ? `${formatCad(sample.totalChargeCad)} tint charge` : 'DEALER SAMPLE FORMULA REVIEW REQUIRED'}.`,
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
  }

  lines.push(
    `Total tint charge: ${plan.totalChargeCad != null ? formatCad(plan.totalChargeCad) : 'Dealer review required'}.`,
    `X-Bond Liquid: ${formatNumber(plan.exactLiquidGallons)} gal exact for the project; ${formatNumber(plan.preparedLiquidGallons)} gal prepared for project batches${plan.samplePlan ? `; ${formatNumber(plan.samplePlan.totalLiquidGallons)} gal for colour samples` : ''}; ${formatNumber(plan.baseLiquidPurchaseGallons)} gal staged for purchase.`,
    'Tint charge only; X-Bond Liquid, labour, freight, tax, and other material charges are separate.',
  );
  return lines;
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

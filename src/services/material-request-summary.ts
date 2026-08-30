import type { CalculationResult, ColourTintPlan } from '@/database/schema/calculations';

export function hasColourTintPlan(result?: CalculationResult): boolean {
  return Boolean(result?.colourTintPlan?.allocations.length);
}

export function canSaveMaterialRequest(result: CalculationResult | undefined, customItemNotes: string): boolean {
  if (result) return hasColourTintPlan(result);
  return Boolean(customItemNotes.trim());
}

export function buildTintRequestSummaryLines(plan?: ColourTintPlan): string[] {
  if (!plan?.allocations.length) return [];

  const lines = ['Colour tint preparation:'];
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

  lines.push(
    `Total tint charge: ${plan.totalChargeCad != null ? formatCad(plan.totalChargeCad) : 'Dealer review required'}.`,
    `X-Bond Liquid: ${formatNumber(plan.exactLiquidGallons)} gal exact; ${formatNumber(plan.preparedLiquidGallons)} gal prepared; ${formatNumber(plan.baseLiquidPurchaseGallons)} gal staged for purchase.`,
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

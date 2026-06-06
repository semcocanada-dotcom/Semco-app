import { SQFT_PER_SQM } from '@/constants/product-coverage';

export function sqftToSqm(sqft: number): number {
  return sqft / SQFT_PER_SQM;
}

export function sqmToSqft(sqm: number): number {
  return sqm * SQFT_PER_SQM;
}

export function formatSqftFromSqm(sqm?: number | null): string {
  if (!sqm || sqm <= 0) return '-';
  const sqft = sqmToSqft(sqm);
  return `${formatAreaNumber(sqft)} sq ft`;
}

export function formatAreaNumber(value: number): string {
  if (Number.isInteger(value)) return String(value);
  if (value >= 100) return String(Math.round(value));
  return value.toFixed(1);
}

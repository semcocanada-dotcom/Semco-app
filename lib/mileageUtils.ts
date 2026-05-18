import { extractReceiptData, type OcrResult } from '@lib/ocr';
import { calculateMileage, type MileageCalculation } from '@lib/geocoding';
import { matchProviders, type ProviderMatch } from '@lib/providerMatcher';
import { SOUTHERN_RATE_PER_KM, NORTHERN_RATE_PER_KM } from '@constants/mileage';
import type { Provider } from '@lib/types';

// ─── Exported rate constants (update here when government changes rates) ──────

export { SOUTHERN_RATE_PER_KM, NORTHERN_RATE_PER_KM };
export const PARALLEL_54 = 54.0;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReceiptAnalysis {
  ocrResult:       OcrResult;
  topMatch:        ProviderMatch | null;   // highest-confidence provider match
  allMatches:      ProviderMatch[];        // up to 3 ranked matches
}

export interface MileageProposal {
  distanceKm:  number;
  ratePerKm:   number;
  amount:      number;
  isNorthern:  boolean;
  providerName: string;
  destination: string;
}

// ─── Step 1 — Analyse a receipt image ────────────────────────────────────────

/**
 * Runs OCR on the image URI, then fuzzy-matches the extracted business name
 * against the providers table. Only works for image URIs (not PDFs).
 */
export async function analyseReceipt(imageUri: string): Promise<ReceiptAnalysis> {
  const ocrResult = await extractReceiptData(imageUri);

  let topMatch: ProviderMatch | null = null;
  let allMatches: ProviderMatch[]    = [];

  if (ocrResult.businessName) {
    allMatches = await matchProviders(ocrResult.businessName);
    topMatch   = allMatches[0] ?? null;
  }

  return { ocrResult, topMatch, allMatches };
}

// ─── Step 2 — Calculate mileage for a matched provider ───────────────────────

/**
 * Geocodes the user's home address and the provider's location, checks whether
 * the provider is north or south of the 54th parallel, and returns a full
 * MileageProposal ready to display and save.
 *
 * Returns null if either geocode fails or OSRM cannot find a route.
 */
export async function buildMileageProposal(
  homeAddress: string,
  provider:    Provider,
  ocrAddress?: string | null,
): Promise<MileageProposal | null> {
  // Priority: OCR-extracted receipt address > DB provider address > city fallback
  const destination = ocrAddress
    ? ocrAddress
    : provider.address
      ? `${provider.address}, ${provider.city}, SK`
      : `${provider.city}, SK, Canada`;

  const calc: MileageCalculation | null = await calculateMileage(homeAddress, destination);
  if (!calc) return null;

  return {
    distanceKm:   calc.distanceKm,
    ratePerKm:    calc.ratePerKm,
    amount:       calc.amount,
    isNorthern:   calc.isNorthern,
    providerName: provider.name,
    destination,
  };
}

// ─── Confidence threshold for auto-selecting a provider ──────────────────────

/** Score >= this value → auto-select and auto-calculate mileage without asking */
export const AUTO_SELECT_THRESHOLD = 0.45;

/** Score >= this value but below AUTO_SELECT_THRESHOLD → show as suggestion */
export const SUGGEST_THRESHOLD = 0.25;

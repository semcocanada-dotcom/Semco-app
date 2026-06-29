import { extractReceiptData, extractBusinessNameCandidates, type OcrResult } from '@lib/ocr';
import { calculateMileage, type MileageCalculation } from '@lib/geocoding';
import { matchProviders, type ProviderMatch } from '@lib/providerMatcher';
import { SOUTHERN_RATE_PER_KM, NORTHERN_RATE_PER_KM } from '@constants/mileage';
import type { Provider } from '@lib/types';

// ─── Exported rate constants (update here when government changes rates) ──────

export { SOUTHERN_RATE_PER_KM, NORTHERN_RATE_PER_KM };

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
 * Runs OCR on the file URI (image or PDF), then fuzzy-matches the extracted
 * business name against the providers table.
 */
export async function analyseReceipt(fileUri: string, mimeType = 'image/jpeg'): Promise<ReceiptAnalysis> {
  const ocrResult = await extractReceiptData(fileUri, mimeType);

  let topMatch: ProviderMatch | null = null;
  let allMatches: ProviderMatch[]    = [];

  const candidates = extractBusinessNameCandidates(ocrResult.rawText);
  if (candidates.length) {
    allMatches = await matchProviders(candidates);
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

/**
 * Builds a mileage proposal from a destination address alone — used when the
 * receipt's provider name can't be matched (e.g. low-quality OCR) but an
 * address is present. What matters for mileage is where the trip went, not
 * which staff member was seen.
 */
export async function buildMileageProposalFromAddress(
  homeAddress:        string,
  destinationAddress: string,
  label:              string,
): Promise<MileageProposal | null> {
  const calc: MileageCalculation | null = await calculateMileage(homeAddress, destinationAddress);
  if (!calc) return null;

  return {
    distanceKm:   calc.distanceKm,
    ratePerKm:    calc.ratePerKm,
    amount:       calc.amount,
    isNorthern:   calc.isNorthern,
    providerName: label,
    destination:  destinationAddress,
  };
}

// ─── Confidence threshold for auto-selecting a provider ──────────────────────

/** Score >= this value → auto-select and auto-calculate mileage without asking */
export const AUTO_SELECT_THRESHOLD = 0.45;

/** Score >= this value but below AUTO_SELECT_THRESHOLD → show as suggestion */
export const SUGGEST_THRESHOLD = 0.25;

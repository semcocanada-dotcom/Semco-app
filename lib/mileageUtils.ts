import {
  extractReceiptData,
  extractBusinessNameCandidates,
  type OcrResult,
  type ReceiptOcrInvoker,
} from '@lib/ocr';
import { matchProviders, type ProviderMatch } from '@lib/providerMatcher';
import { SOUTHERN_RATE_PER_KM, NORTHERN_RATE_PER_KM } from '@constants/mileage';

export { SOUTHERN_RATE_PER_KM, NORTHERN_RATE_PER_KM };

export interface ReceiptAnalysis {
  ocrResult: OcrResult;
  topMatch: ProviderMatch | null;
  allMatches: ProviderMatch[];
}

/**
 * Runs optional receipt recognition and matches extracted business names only
 * against provider records created by the signed-in user. Mileage distance is
 * entered manually; this module never sends an address to a mapping service.
 */
export async function analyseReceipt(
  fileUri: string,
  mimeType: string,
  invokeReceiptOcr: ReceiptOcrInvoker,
): Promise<ReceiptAnalysis> {
  const ocrResult = await extractReceiptData(fileUri, mimeType, invokeReceiptOcr);
  const candidates = extractBusinessNameCandidates(ocrResult.rawText);
  const allMatches = candidates.length ? await matchProviders(candidates) : [];

  return {
    ocrResult,
    topMatch: allMatches[0] ?? null,
    allMatches,
  };
}

/** Confidence needed to preselect a matching private provider. */
export const AUTO_SELECT_THRESHOLD = 0.45;

/** Lower confidence at which the app can show a private-provider suggestion. */
export const SUGGEST_THRESHOLD = 0.25;

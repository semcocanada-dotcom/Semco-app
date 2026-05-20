import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';

export interface OcrResult {
  businessName: string | null;
  address:      string | null;
  amount:       number | null;
  rawText:      string;
}

/**
 * Reads a local file URI (image or PDF) as base64 and sends it to Google Cloud
 * Vision API for DOCUMENT_TEXT_DETECTION. Returns structured receipt data.
 *
 * Images → images:annotate endpoint (synchronous)
 * PDFs   → files:annotate endpoint (synchronous, first page only)
 *
 * Requires app.json extra.googleVisionApiKey to be set.
 * Fails gracefully (returns empty result) when no key is configured.
 */
export async function extractReceiptData(fileUri: string, mimeType = 'image/jpeg'): Promise<OcrResult> {
  const apiKey: string | undefined =
    (Constants.expoConfig?.extra as any)?.googleVisionApiKey;

  const empty: OcrResult = { businessName: null, address: null, amount: null, rawText: '' };
  if (!apiKey) return empty;

  try {
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const isPdf = mimeType === 'application/pdf';
    let rawText = '';

    if (isPdf) {
      // files:annotate supports base64 PDFs — reads first page only
      const response = await fetch(
        `https://vision.googleapis.com/v1/files:annotate?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requests: [{
              inputConfig: { content: base64, mimeType: 'application/pdf' },
              features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
              pages: [1],
            }],
          }),
        },
      );
      if (!response.ok) return empty;
      const data = await response.json();
      // files:annotate has a nested responses structure: responses[0].responses[0]
      rawText = data.responses?.[0]?.responses?.[0]?.fullTextAnnotation?.text ?? '';
    } else {
      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requests: [{
              image: { content: base64 },
              features: [{ type: 'DOCUMENT_TEXT_DETECTION', maxResults: 1 }],
            }],
          }),
        },
      );
      if (!response.ok) return empty;
      const data = await response.json();
      rawText = data.responses?.[0]?.fullTextAnnotation?.text ?? '';
    }

    return { ...parseReceiptText(rawText), rawText };
  } catch {
    return empty;
  }
}

// ─── Parsing helpers ──────────────────────────────────────────────────────────

function parseReceiptText(text: string): Omit<OcrResult, 'rawText'> {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  return {
    businessName: extractBusinessName(lines),
    address:      extractAddress(lines),
    amount:       extractAmount(lines),
  };
}

const SKIP_WORDS = new Set([
  'receipt', 'invoice', 'thank you', 'thanks', 'total', 'subtotal',
  'tax', 'hst', 'gst', 'pst', 'balance', 'paid', 'change', 'date',
  'time', 'cashier', 'order', 'sale', 'amount', 'due',
]);

function extractBusinessName(lines: string[]): string | null {
  for (const line of lines.slice(0, 7)) {
    const c = line.trim();
    if (!c || c.length < 3 || c.length > 70) continue;
    if (/^\d/.test(c)) continue;
    if (/\d{3}[-.\s]\d{3}[-.\s]\d{4}/.test(c)) continue;
    if (/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(c)) continue;
    if (/^\$/.test(c)) continue;
    if (/^[A-Z]\d[A-Z]\s?\d[A-Z]\d/.test(c)) continue;
    if (SKIP_WORDS.has(c.toLowerCase())) continue;
    return c;
  }
  return null;
}

/**
 * Returns all plausible business-name candidate strings from the full OCR text.
 * Scans every line so clinic names at the bottom of receipts (e.g. Jane App
 * style) are included alongside provider names in the body of the text.
 */
export function extractBusinessNameCandidates(rawText: string): string[] {
  if (!rawText) return [];
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const results: string[] = [];
  for (const line of lines) {
    const c = line.trim();
    if (!c || c.length < 3 || c.length > 60) continue;
    if (/^\d/.test(c)) continue;
    if (/\d{3}[-.\s]\d{3}[-.\s]\d{4}/.test(c)) continue;
    if (/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(c)) continue;
    if (/^\$/.test(c)) continue;
    if (/^[A-Z]\d[A-Z]\s?\d[A-Z]\d/.test(c)) continue;
    if (/^www\./i.test(c) || /https?:/i.test(c)) continue;
    if (/thank/i.test(c) && /payment/i.test(c)) continue;
    if (SKIP_WORDS.has(c.toLowerCase())) continue;
    results.push(c);
  }
  return results.slice(0, 25);
}

function extractAddress(lines: string[]): string | null {
  for (const line of lines) {
    const c = line.trim();
    // Saskatchewan postal code pattern: S + alphanumeric
    if (/[Ss]\d[A-Za-z]\s?\d[A-Za-z]\d/.test(c)) return c;
    // Generic Canadian postal code
    if (/[A-Z]\d[A-Z]\s?\d[A-Z]\d/.test(c) && c.length < 60) return c;
    // Street address: digits followed by street name
    if (/^\d{1,5}\s+[A-Za-z]/.test(c) && c.length < 80) return c;
  }
  return null;
}

function extractAmount(lines: string[]): number | null {
  const candidates: number[] = [];
  // Search in reverse — totals are usually near the bottom
  for (const line of [...lines].reverse()) {
    const lower = line.toLowerCase();
    const isTotalLine =
      lower.includes('total') || lower.includes('amount due') ||
      lower.includes('balance due') || lower.includes('charge');

    const match = line.match(/\$?\s*(\d{1,4}(?:[.,]\d{2}))/);
    if (match) {
      const val = parseFloat(match[1].replace(',', '.'));
      if (isTotalLine) return val;
      candidates.push(val);
    }
  }
  return candidates.length ? Math.max(...candidates) : null;
}

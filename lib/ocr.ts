import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';
import type { ProviderCategory } from '@lib/types';

export interface OcrResult {
  businessName: string | null;
  address:      string | null;
  amount:       number | null;
  date:         string | null;   // YYYY-MM-DD parsed from the receipt, if found
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

  const empty: OcrResult = { businessName: null, address: null, amount: null, date: null, rawText: '' };
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

// ─── Date extraction (for back-dating receipts to the correct month) ─────────

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

/** Builds a YYYY-MM-DD string, rejecting impossible or implausible dates. */
function toIso(y: number, m: number, d: number): string | null {
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
  // Receipts are in the past: drop anything in the future or older than 3 years.
  const t = dt.getTime();
  const now = Date.now();
  if (t > now + 86_400_000) return null;
  if (t < now - 3 * 365 * 86_400_000) return null;
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/**
 * Finds the transaction date on a receipt. Handles ISO (2024-03-15), month
 * names (March 15, 2024 / 15 Mar 2024), and numeric slashes. For ambiguous
 * all-numeric dates it assumes month-first (the common printed-receipt format);
 * the user can still correct the date field before saving.
 */
export function extractReceiptDate(text: string): string | null {
  const flat = text.replace(/\n/g, ' ');

  // 1) ISO-ish: 2024-03-15 / 2024/03/15
  let m = flat.match(/\b(20\d{2})[-/.](\d{1,2})[-/.](\d{1,2})\b/);
  if (m) { const iso = toIso(+m[1], +m[2], +m[3]); if (iso) return iso; }

  // 2) Month name first: "March 15, 2024" / "Mar 15 2024"
  m = flat.match(/\b([A-Za-z]{3,9})\.?\s+(\d{1,2}),?\s+(20\d{2})\b/);
  if (m) {
    const mon = MONTHS[m[1].slice(0, 3).toLowerCase()];
    if (mon) { const iso = toIso(+m[3], mon, +m[2]); if (iso) return iso; }
  }

  // 3) Day then month name: "15 March 2024"
  m = flat.match(/\b(\d{1,2})\s+([A-Za-z]{3,9})\.?\s+(20\d{2})\b/);
  if (m) {
    const mon = MONTHS[m[2].slice(0, 3).toLowerCase()];
    if (mon) { const iso = toIso(+m[3], mon, +m[1]); if (iso) return iso; }
  }

  // 4) Numeric slashes: dd/mm/yyyy or mm/dd/yyyy (or 2-digit year)
  m = flat.match(/\b(\d{1,2})[-/.](\d{1,2})[-/.](20\d{2}|\d{2})\b/);
  if (m) {
    const a = +m[1], b = +m[2];
    let y = +m[3]; if (y < 100) y += 2000;
    let day: number, mon: number;
    if (a > 12 && b <= 12)      { day = a; mon = b; }  // unambiguous dd/mm
    else if (b > 12 && a <= 12) { mon = a; day = b; }  // unambiguous mm/dd
    else                        { mon = a; day = b; }  // ambiguous → month-first
    const iso = toIso(y, mon, day);
    if (iso) return iso;
  }

  return null;
}

// ─── Category inference (read the service off the receipt) ───────────────────

// Ordered most- to least-specific. The receipt text itself is a more reliable
// signal of the service than a fuzzy provider-name match, so this drives the
// category when a keyword is found.
const CATEGORY_KEYWORDS: { category: ProviderCategory; patterns: RegExp[] }[] = [
  { category: 'aba_ibi',              patterns: [/\baba\b/i, /\bibi\b/i, /applied behaviou?r/i, /behaviou?r (analyst|therap|interven|consult)/i, /\bbcba\b/i] },
  { category: 'speech_language',      patterns: [/speech/i, /language path/i, /\bslp\b/i, /\bs-?lp\b/i] },
  { category: 'occupational_therapy', patterns: [/occupational/i, /\boccupational therap/i, /\bot\b/i, /\bo\.?t\.?\b/i] },
  { category: 'physical_therapy',     patterns: [/physiotherap/i, /physical therap/i, /\bphysio\b/i, /\bpt\b/i] },
  { category: 'psychology',           patterns: [/psycholog/i, /\bpsych\b/i, /counsell?ing/i, /mental health/i] },
  { category: 'music_therapy',        patterns: [/music therap/i] },
  { category: 'art_therapy',          patterns: [/art therap/i] },
  { category: 'social_skills',        patterns: [/social skill/i] },
  { category: 'swimming',             patterns: [/swim/i, /aquatic/i] },
  { category: 'respite',              patterns: [/respite/i] },
  { category: 'assistive_technology', patterns: [/assistive tech/i, /\baac\b/i, /communication device/i] },
];

/**
 * Guesses the funding category from the words on the receipt (e.g. "Speech
 * Therapy", "Reg. SLP" → speech_language). Returns null when nothing matches so
 * callers can fall back to a provider's category or the user's manual choice.
 */
export function inferCategoryFromText(text: string): ProviderCategory | null {
  if (!text) return null;
  for (const { category, patterns } of CATEGORY_KEYWORDS) {
    if (patterns.some(p => p.test(text))) return category;
  }
  return null;
}

// ─── Parsing helpers ──────────────────────────────────────────────────────────

function parseReceiptText(text: string): Omit<OcrResult, 'rawText'> {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  return {
    businessName: extractBusinessName(lines),
    address:      extractAddress(lines),
    amount:       extractAmount(lines),
    date:         extractReceiptDate(text),
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

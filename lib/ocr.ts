import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';

export interface OcrResult {
  businessName: string | null;
  address:      string | null;
  amount:       number | null;
  date:         string | null;  // ISO yyyy-MM-dd
  rawText:      string;
}

/**
 * Reads a local image URI as base64 and sends it to Google Cloud Vision API
 * for DOCUMENT_TEXT_DETECTION. Returns structured receipt data.
 *
 * Requires app.json extra.googleVisionApiKey to be set.
 * Fails gracefully (returns empty result) when no key is configured.
 */
export async function extractReceiptData(imageUri: string): Promise<OcrResult> {
  const apiKey: string | undefined =
    (Constants.expoConfig?.extra as any)?.googleVisionApiKey;

  const empty: OcrResult = { businessName: null, address: null, amount: null, date: null, rawText: '' };
  if (!apiKey) return empty;

  try {
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

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
    const rawText: string =
      data.responses?.[0]?.fullTextAnnotation?.text ?? '';

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
    date:         extractDate(lines),
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
    if (/^\d/.test(c)) continue;                                      // starts with number
    if (/\d{3}[-.\s]\d{3}[-.\s]\d{4}/.test(c)) continue;             // phone number
    if (/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(c)) continue;      // date
    if (/^\$/.test(c)) continue;                                       // dollar amount
    if (/^[A-Z]\d[A-Z]\s?\d[A-Z]\d/.test(c)) continue;               // postal code
    if (SKIP_WORDS.has(c.toLowerCase())) continue;
    return c;
  }
  return null;
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

// Month name → number map for parsing "January 5, 2024" style dates
const MONTH_MAP: Record<string, string> = {
  january: '01', february: '02', march: '03', april: '04',
  may: '05', june: '06', july: '07', august: '08',
  september: '09', october: '10', november: '11', december: '12',
  jan: '01', feb: '02', mar: '03', apr: '04', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
};

function extractDate(lines: string[]): string | null {
  for (const line of lines) {
    // yyyy-MM-dd or yyyy/MM/dd
    let m = line.match(/\b(20\d{2})[-\/](0?[1-9]|1[0-2])[-\/](0?[1-9]|[12]\d|3[01])\b/);
    if (m) {
      return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
    }
    // MM/DD/YYYY or MM-DD-YYYY (North American style)
    m = line.match(/\b(0?[1-9]|1[0-2])[-\/](0?[1-9]|[12]\d|3[01])[-\/](20\d{2})\b/);
    if (m) {
      return `${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`;
    }
    // DD/MM/YYYY (European) — only when day > 12 to disambiguate
    m = line.match(/\b(1[3-9]|2\d|3[01])[-\/](0?[1-9]|1[0-2])[-\/](20\d{2})\b/);
    if (m) {
      return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
    }
    // "January 5, 2024" or "Jan 5 2024"
    m = line.match(/\b([A-Za-z]+)\s+(\d{1,2})[,\s]+\s*(20\d{2})\b/);
    if (m) {
      const mon = MONTH_MAP[m[1].toLowerCase()];
      if (mon) return `${m[3]}-${mon}-${m[2].padStart(2, '0')}`;
    }
    // "5 January 2024"
    m = line.match(/\b(\d{1,2})\s+([A-Za-z]+)[,\s]+\s*(20\d{2})\b/);
    if (m) {
      const mon = MONTH_MAP[m[2].toLowerCase()];
      if (mon) return `${m[3]}-${mon}-${m[1].padStart(2, '0')}`;
    }
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
      if (isTotalLine) return val;   // take first "total" line found (from bottom)
      candidates.push(val);
    }
  }
  // Fall back to largest amount found
  return candidates.length ? Math.max(...candidates) : null;
}

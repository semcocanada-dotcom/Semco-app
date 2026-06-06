import { sqlite } from '@/database/client';

export interface OfflineSearchResult {
  productId: string;
  sku: string;
  name: string;
  category: string;
  relevantExcerpt: string;
  rank: number;
}

const MAX_RESULTS = 3;
const EXCERPT_LENGTH = 180;

/**
 * FTS5 full-text search over locally seeded product TDS content.
 * Used when the device is offline. Returns structured result cards.
 */
export async function searchProductsOffline(query: string): Promise<OfflineSearchResult[]> {
  const sanitized = query
    .trim()
    .replace(/['"*]/g, '') // strip FTS special chars
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => `"${w}"`)
    .join(' OR ');

  if (!sanitized) return [];

  try {
    const rows = await sqlite.getAllAsync<{
      id: string;
      sku: string;
      name: string;
      category: string;
      tds_content: string;
      rank: number;
    }>(
      `SELECT p.id, p.sku, p.name, p.category, p.tds_content, fts.rank
       FROM products_fts fts
       JOIN products p ON p.rowid = fts.rowid
       WHERE products_fts MATCH ?
       ORDER BY fts.rank
       LIMIT ?`,
      [sanitized, MAX_RESULTS],
    );

    return rows.map((row) => ({
      productId: row.id,
      sku: row.sku,
      name: row.name,
      category: row.category,
      relevantExcerpt: extractExcerpt(row.tds_content, query),
      rank: row.rank,
    }));
  } catch (err) {
    console.error('[offline-search] FTS5 error:', err);
    return [];
  }
}

function extractExcerpt(text: string, query: string): string {
  const words = query.toLowerCase().split(/\s+/);
  const lowerText = text.toLowerCase();

  for (const word of words) {
    const idx = lowerText.indexOf(word);
    if (idx !== -1) {
      const start = Math.max(0, idx - 80);
      const end = Math.min(text.length, idx + EXCERPT_LENGTH);
      const excerpt = text.slice(start, end).replace(/\s+/g, ' ').trim();
      return (start > 0 ? '...' : '') + excerpt + (end < text.length ? '...' : '');
    }
  }

  const excerpt = text.slice(0, EXCERPT_LENGTH).replace(/\s+/g, ' ').trim();
  return excerpt + (text.length > EXCERPT_LENGTH ? '...' : '');
}

export function formatOfflineResponse(results: OfflineSearchResult[]): string {
  if (results.length === 0) {
    return 'No matching product information found in the local database for that query.';
  }

  return [
    'Offline product match:',
    '',
    ...results.map((r) => `- ${r.name} (${r.sku}): ${r.relevantExcerpt}`),
  ].join('\n');
}

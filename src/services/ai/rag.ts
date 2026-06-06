import { supabase } from '@/services/supabase';

const EMBED_FUNCTION = 'embed-and-search';

export interface RagChunk {
  id: string;
  productId: string;
  chunkText: string;
  metadata: Record<string, unknown>;
  similarity: number;
}

/**
 * Calls the Supabase Edge Function to embed the query and retrieve
 * the most semantically relevant TDS chunks via pgvector.
 */
export async function retrieveRelevantChunks(
  query: string,
  matchCount = 6,
): Promise<RagChunk[]> {
  const { data, error } = await supabase.functions.invoke<{ chunks: RagChunk[] }>(
    EMBED_FUNCTION,
    { body: { query, match_count: matchCount } },
  );

  if (error) {
    console.error('[rag] edge function error:', error);
    return [];
  }

  return data?.chunks ?? [];
}

export function buildContextBlock(chunks: RagChunk[]): string {
  if (chunks.length === 0) return '';

  return chunks
    .map((c, i) => {
      const sourceLabel = c.metadata?.sourceDocument ? `${c.metadata.sourceDocument}` : `Source ${i + 1}`;
      const pageLabel = c.metadata?.pageNumber ? `p. ${c.metadata.pageNumber}` : null;
      const sectionLabel = c.metadata?.section ? c.metadata.section : null;
      const headerParts = [sourceLabel, pageLabel, sectionLabel].filter(Boolean).join(' - ');
      return `[${headerParts}]\n${c.chunkText}`;
    })
    .join('\n\n---\n\n');
}

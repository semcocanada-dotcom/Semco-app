import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import type { TextChunk } from './text-chunker.js';

const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_BATCH_SIZE = 100; // OpenAI allows up to 2048, but 100 is safe

let openaiClient: OpenAI | null = null;
let supabaseClient: ReturnType<typeof createClient> | null = null;

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OPENAI_API_KEY is not set in environment');
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

function getSupabase() {
  if (!supabaseClient) {
    const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error(
        'EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment.\n' +
        'Note: ingestion uses the service role key (not the anon key) to bypass RLS.',
      );
    }
    supabaseClient = createClient(url, key);
  }
  return supabaseClient;
}

async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const openai = getOpenAI();
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts,
  });
  return response.data.map((d) => d.embedding);
}

/**
 * Removes all existing chunks for a product (by SKU) before inserting new ones.
 * Prevents duplicates when re-ingesting an updated PDF.
 */
export async function clearExistingChunks(
  productId: string,
  sourceDocument: string,
): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('product_embeddings')
    .delete()
    .eq('product_id', productId)
    .eq('source_document', sourceDocument);

  if (error) throw new Error(`Failed to clear existing chunks: ${error.message}`);
}

/**
 * Upserts a product row in Supabase and returns the UUID.
 */
export async function upsertProduct(product: {
  sku: string;
  name: string;
  category: string;
  tdsContent?: string;
}): Promise<string> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('products')
    .upsert(
      {
        sku: product.sku,
        name: product.name,
        category: product.category,
        tds_content: product.tdsContent ?? '',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'sku' },
    )
    .select('id')
    .single();

  if (error || !data) throw new Error(`Failed to upsert product: ${error?.message}`);
  return data.id as string;
}

/**
 * Embeds all chunks in batches and upserts to product_embeddings.
 * Returns the total number of chunks stored.
 */
export async function embedAndStore(
  chunks: TextChunk[],
  productId: string,
): Promise<number> {
  if (chunks.length === 0) return 0;

  const supabase = getSupabase();
  let stored = 0;

  for (let i = 0; i < chunks.length; i += EMBEDDING_BATCH_SIZE) {
    const batch = chunks.slice(i, i + EMBEDDING_BATCH_SIZE);
    const texts = batch.map((c) => c.text);

    process.stdout.write(
      `\r  Embedding batch ${Math.floor(i / EMBEDDING_BATCH_SIZE) + 1}/${Math.ceil(chunks.length / EMBEDDING_BATCH_SIZE)} (${i + batch.length}/${chunks.length} chunks)`,
    );

    const embeddings = await generateEmbeddings(texts);

    const rows = batch.map((chunk, j) => ({
      product_id: productId,
      chunk_text: chunk.text,
      embedding: JSON.stringify(embeddings[j]),
      metadata: {
        section: chunk.metadata.section,
        productSku: chunk.metadata.productSku,
        productName: chunk.metadata.productName,
      },
      source_document: chunk.metadata.sourceDocument,
      page_number: chunk.metadata.pageNumber,
    }));

    const { error } = await supabase.from('product_embeddings').insert(rows);
    if (error) throw new Error(`Failed to insert embeddings: ${error.message}`);

    stored += batch.length;
  }

  console.log('');
  return stored;
}

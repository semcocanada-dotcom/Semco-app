#!/usr/bin/env tsx
/**
 * Semco PDF Ingestion — TDS & Application Manual
 *
 * Processes a PDF (Technical Data Sheet or manual), sends each page
 * through Claude Vision to extract text + diagram descriptions, chunks
 * the content, embeds it with OpenAI, and upserts to Supabase.
 *
 * Usage:
 *   npx tsx scripts/ingest-pdf.ts \
 *     --file "./pdfs/Semco_2K_Primer_TDS.pdf" \
 *     --sku "PRIMER-2K" \
 *     --name "Semco 2K Primer" \
 *     --category "primer"
 *
 * Categories: primer | base_coat | finish_coat | sealer | pigment | manual
 */

import 'dotenv/config';
import { Command } from 'commander';
import * as path from 'path';
import * as fs from 'fs';
import { renderPdfPages } from './lib/pdf-renderer.js';
import { extractAllPages } from './lib/claude-extractor.js';
import { chunkPageContent } from './lib/text-chunker.js';
import { upsertProduct, clearExistingChunks, embedAndStore } from './lib/embedder.js';

const VALID_CATEGORIES = ['primer', 'base_coat', 'finish_coat', 'sealer', 'pigment', 'manual'];

const program = new Command();

program
  .name('ingest-pdf')
  .description('Ingest a Semco TDS or manual PDF into the AI knowledge base')
  .requiredOption('--file <path>', 'Path to the PDF file')
  .requiredOption('--sku <sku>', 'Product SKU (e.g. PRIMER-2K). Use MANUAL for the full guide.')
  .requiredOption('--name <name>', 'Full product name (e.g. "Semco 2K Primer")')
  .requiredOption('--category <category>', `Product category: ${VALID_CATEGORIES.join(' | ')}`)
  .option('--clear', 'Clear existing chunks for this SKU + file before ingesting', false)
  .parse(process.argv);

const opts = program.opts<{
  file: string;
  sku: string;
  name: string;
  category: string;
  clear: boolean;
}>();

async function main() {
  // Validate
  const filePath = path.resolve(opts.file);
  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`);
    process.exit(1);
  }
  if (!VALID_CATEGORIES.includes(opts.category)) {
    console.error(`Error: Invalid category "${opts.category}". Must be one of: ${VALID_CATEGORIES.join(', ')}`);
    process.exit(1);
  }

  const sourceDocument = path.basename(filePath);

  console.log('\n┌─────────────────────────────────────────┐');
  console.log('│       Semco PDF Ingestion Pipeline       │');
  console.log('└─────────────────────────────────────────┘');
  console.log(`  File:     ${sourceDocument}`);
  console.log(`  SKU:      ${opts.sku}`);
  console.log(`  Product:  ${opts.name}`);
  console.log(`  Category: ${opts.category}`);
  console.log('');

  // Step 1: Upsert product in Supabase
  console.log('▶ Step 1/5  Upserting product in Supabase…');
  const productId = await upsertProduct({
    sku: opts.sku,
    name: opts.name,
    category: opts.category,
  });
  console.log(`  ✓ Product ID: ${productId}`);

  // Step 2: Optionally clear existing chunks
  if (opts.clear) {
    console.log('▶ Step 2/5  Clearing existing chunks for this document…');
    await clearExistingChunks(productId, sourceDocument);
    console.log('  ✓ Cleared');
  } else {
    console.log('▶ Step 2/5  (Skipping clear — use --clear to remove existing chunks first)');
  }

  // Step 3: Render PDF pages to images
  console.log('▶ Step 3/5  Rendering PDF pages…');
  const pages = await renderPdfPages(filePath);
  console.log(`  ✓ ${pages.length} page${pages.length > 1 ? 's' : ''} rendered`);

  // Step 4: Extract content with Claude Vision
  console.log('▶ Step 4/5  Extracting content via Claude Vision…');
  let pagesProcessed = 0;
  let pagesSkipped = 0;

  const extracts = await extractAllPages(pages, 'tds', (current, total) => {
    process.stdout.write(`\r  Page ${current}/${total} — Claude Vision`);
  });
  console.log('');

  extracts.forEach(({ content }) => {
    if (content) pagesProcessed++;
    else pagesSkipped++;
  });

  console.log(`  ✓ ${pagesProcessed} pages extracted, ${pagesSkipped} skipped (covers/blanks)`);

  // Step 5: Chunk, embed, and store
  console.log('▶ Step 5/5  Chunking, embedding, and storing…');
  const chunks = chunkPageContent(extracts, opts.sku, opts.name, sourceDocument);
  console.log(`  ${chunks.length} chunks created`);

  const stored = await embedAndStore(chunks, productId);

  console.log('\n✅ Done!');
  console.log(`   ${stored} chunks stored in product_embeddings`);
  console.log(`   The AI assistant will use this content immediately for online queries.\n`);
}

main().catch((err) => {
  console.error('\n❌ Ingestion failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});

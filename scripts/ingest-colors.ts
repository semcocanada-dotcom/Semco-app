#!/usr/bin/env tsx
/**
 * Semco PDF Ingestion — Colour Charts
 *
 * Processes a colour chart PDF, sends each page through Claude Vision
 * to extract colour names, codes, and pigment formulas, then upserts
 * all colours to the Supabase `colors` table.
 *
 * Usage:
 *   npx tsx scripts/ingest-colors.ts \
 *     --file "./pdfs/Semco_Colour_Chart_2026.pdf"
 *
 * Options:
 *   --clear   Remove all existing standard colours before ingesting
 */

import 'dotenv/config';
import { Command } from 'commander';
import * as path from 'path';
import * as fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import { renderPdfPages } from './lib/pdf-renderer.js';
import { extractAllPages } from './lib/claude-extractor.js';

interface ExtractedColor {
  name: string;
  code: string | null;
  pigments: Array<{
    pigmentName: string;
    pigmentSku: string;
    ratioGPerKg: number;
  }>;
  appearance: string;
}

function getSupabase() {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      'EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.\n' +
      'Note: ingestion uses the service role key to bypass RLS.',
    );
  }
  return createClient(url, key);
}

function parseColorsFromExtract(raw: string): ExtractedColor[] {
  try {
    // Claude returns a JSON array — strip any accidental markdown fences
    const cleaned = raw
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) return [];
    return parsed as ExtractedColor[];
  } catch {
    console.warn('  ⚠ Could not parse JSON from page — skipping');
    return [];
  }
}

const program = new Command();

program
  .name('ingest-colors')
  .description('Ingest a Semco colour chart PDF into the colour database')
  .requiredOption('--file <path>', 'Path to the colour chart PDF')
  .option('--clear', 'Remove all existing standard colours before ingesting', false)
  .parse(process.argv);

const opts = program.opts<{ file: string; clear: boolean }>();

async function main() {
  const filePath = path.resolve(opts.file);
  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`);
    process.exit(1);
  }

  const supabase = getSupabase();

  console.log('\n┌─────────────────────────────────────────┐');
  console.log('│     Semco Colour Chart Ingestion         │');
  console.log('└─────────────────────────────────────────┘');
  console.log(`  File: ${path.basename(filePath)}`);
  console.log('');

  // Step 1: Optionally clear existing standard colours
  if (opts.clear) {
    console.log('▶ Step 1/4  Clearing existing standard colours…');
    const { error } = await supabase
      .from('colors')
      .delete()
      .eq('is_standard', true);
    if (error) throw new Error(`Failed to clear colours: ${error.message}`);
    console.log('  ✓ Cleared');
  } else {
    console.log('▶ Step 1/4  (Skipping clear — use --clear to replace all standard colours)');
  }

  // Step 2: Render PDF pages
  console.log('▶ Step 2/4  Rendering PDF pages…');
  const pages = await renderPdfPages(filePath);
  console.log(`  ✓ ${pages.length} page${pages.length > 1 ? 's' : ''} rendered`);

  // Step 3: Extract colour data via Claude Vision
  console.log('▶ Step 3/4  Extracting colours via Claude Vision…');
  const extracts = await extractAllPages(pages, 'colors', (current, total) => {
    process.stdout.write(`\r  Page ${current}/${total} — Claude Vision`);
  });
  console.log('');

  // Step 4: Parse + upsert all colours
  console.log('▶ Step 4/4  Parsing and storing colours…');

  const allColors: ExtractedColor[] = [];
  for (const { pageNumber, content } of extracts) {
    if (!content) continue;
    const pageColors = parseColorsFromExtract(content);
    console.log(`  Page ${pageNumber}: ${pageColors.length} colour${pageColors.length !== 1 ? 's' : ''} found`);
    allColors.push(...pageColors);
  }

  if (allColors.length === 0) {
    console.log('\n⚠ No colours extracted. Check that the PDF is a colour chart and try again.\n');
    return;
  }

  // Deduplicate by name (keep last occurrence)
  const uniqueColors = Object.values(
    Object.fromEntries(allColors.map((c) => [c.name.toLowerCase(), c])),
  );

  console.log(`  ${uniqueColors.length} unique colours to store…`);

  const now = new Date().toISOString();
  const rows = uniqueColors.map((c) => ({
    name: c.name,
    code: c.code ?? null,
    is_standard: true,
    installer_id: null,
    pigments: JSON.stringify(
      c.pigments.map((p) => ({
        pigmentSku: p.pigmentSku,
        pigmentName: p.pigmentName,
        ratioGPerKg: p.ratioGPerKg,
      })),
    ),
    photo_url: null,
    notes: c.appearance || null,
    created_at: now,
    updated_at: now,
  }));

  // Upsert in batches of 50
  const BATCH = 50;
  let upserted = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase
      .from('colors')
      .upsert(batch, { onConflict: 'name' });
    if (error) throw new Error(`Failed to upsert colours: ${error.message}`);
    upserted += batch.length;
    process.stdout.write(`\r  Stored ${upserted}/${rows.length} colours`);
  }

  console.log('\n\n✅ Done!');
  console.log(`   ${upserted} colours stored in the colours table.`);
  console.log(`   PowerSync will push them to all installer devices automatically.\n`);
}

main().catch((err) => {
  console.error('\n❌ Colour ingestion failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});

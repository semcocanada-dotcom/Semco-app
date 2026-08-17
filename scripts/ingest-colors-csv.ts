#!/usr/bin/env tsx
/**
 * Semco Colour Formula CSV Import
 *
 * Reads the "SEMCO XBond Colour Search" spreadsheet exported as CSV
 * (from the "Database" tab) and upserts all colours to Supabase.
 * PowerSync will then sync the updated colours to every installer device.
 *
 * Expected CSV columns (export the "Database" tab, not the Search tab):
 *   Colour Name | Colour Number | Pigment | Quart ml | Gallon ml | 5 Gallon ml | Pigment Display
 *
 * Usage:
 *   npx tsx scripts/ingest-colors-csv.ts --file "./Semco_XBond_Colours.csv"
 *
 * Options:
 *   --clear   Remove all existing standard colours before importing
 *   --dry-run Parse and preview without writing to Supabase
 */

import 'dotenv/config';
import { Command } from 'commander';
import * as path from 'path';
import * as fs from 'fs';
import { createClient } from '@supabase/supabase-js';

interface PigmentRatio {
  pigmentCode: string;
  pigmentName: string;
  mlPerQuart: number;
  mlPerGallon: number;
  mlPerFiveGallon: number;
}

interface ParsedColor {
  name: string;
  code: string;
  pigments: PigmentRatio[];
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

function parseCsv(content: string): string[][] {
  const rows: string[][] = [];
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    if (!line.trim()) continue;

    // Simple CSV parser — handles quoted fields with embedded commas/newlines
    const cells: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        cells.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    cells.push(current.trim());
    rows.push(cells);
  }

  return rows;
}

function parseColorRows(rows: string[][]): ParsedColor[] {
  if (rows.length === 0) return [];

  // Find the header row — look for a row that contains "Colour Name"
  let headerIdx = -1;
  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    if (rows[i].some((cell) => cell.toLowerCase().includes('colour name'))) {
      headerIdx = i;
      break;
    }
  }
  if (headerIdx === -1) {
    throw new Error(
      'Could not find header row. Make sure you exported the "Database" tab and the ' +
      'first row contains: Colour Name, Colour Number, Pigment, Quart ml, Gallon ml, 5 Gallon ml, Pigment Display',
    );
  }

  const headers = rows[headerIdx].map((h) => h.toLowerCase().trim());

  const colIdx = {
    name: headers.findIndex((h) => h.includes('colour name')),
    number: headers.findIndex((h) => h.includes('colour number')),
    pigmentCode: headers.findIndex((h) => h === 'pigment'),
    quart: headers.findIndex((h) => h.includes('quart')),
    gallon: headers.findIndex((h) => h.includes('gallon') && !h.includes('5')),
    fiveGallon: headers.findIndex((h) => h.includes('5 gallon') || h.includes('5gallon')),
    pigmentDisplay: headers.findIndex((h) => h.includes('pigment display')),
  };

  const missing = Object.entries(colIdx)
    .filter(([, idx]) => idx === -1)
    .map(([col]) => col);
  if (missing.length > 0) {
    throw new Error(`Missing columns: ${missing.join(', ')}. Found headers: ${headers.join(', ')}`);
  }

  // Group rows by colour name
  const colorMap = new Map<string, ParsedColor>();

  for (let i = headerIdx + 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 4) continue;

    const rawName = row[colIdx.name]?.trim();
    const rawCode = row[colIdx.number]?.trim();
    const pigCode = row[colIdx.pigmentCode]?.trim();
    const quartMl = parseFloat(row[colIdx.quart]) || 0;
    const gallonMl = parseFloat(row[colIdx.gallon]) || 0;
    const fiveGallonMl = parseFloat(row[colIdx.fiveGallon]) || 0;
    const pigDisplay = row[colIdx.pigmentDisplay]?.trim();

    if (!rawName || !pigCode || !pigDisplay) continue;
    // Skip rows where all ml values are 0 (blank/separator rows)
    if (quartMl === 0 && gallonMl === 0 && fiveGallonMl === 0) continue;

    const key = rawName.toLowerCase();
    if (!colorMap.has(key)) {
      colorMap.set(key, { name: rawName, code: rawCode ?? '', pigments: [] });
    }

    colorMap.get(key)!.pigments.push({
      pigmentCode: pigCode,
      pigmentName: pigDisplay,
      mlPerQuart: quartMl,
      mlPerGallon: gallonMl,
      mlPerFiveGallon: fiveGallonMl,
    });
  }

  return Array.from(colorMap.values());
}

const program = new Command();

program
  .name('ingest-colors-csv')
  .description('Import Semco XBond colour formulas from the Database tab CSV export')
  .requiredOption('--file <path>', 'Path to the CSV file (Database tab export)')
  .option('--clear', 'Remove all existing standard colours before importing', false)
  .option('--dry-run', 'Parse and show preview without writing to Supabase', false)
  .parse(process.argv);

const opts = program.opts<{ file: string; clear: boolean; dryRun: boolean }>();

async function main() {
  const filePath = path.resolve(opts.file);
  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`);
    process.exit(1);
  }

  console.log('\n┌─────────────────────────────────────────┐');
  console.log('│    Semco XBond Colour Formula Import     │');
  console.log('└─────────────────────────────────────────┘');
  console.log(`  File: ${path.basename(filePath)}`);
  if (opts.dryRun) console.log('  Mode: DRY RUN — no data will be written');
  console.log('');

  // Step 1: Parse CSV
  console.log('▶ Step 1/3  Parsing CSV…');
  const content = fs.readFileSync(filePath, 'utf-8');
  const rows = parseCsv(content);
  const colors = parseColorRows(rows);

  if (colors.length === 0) {
    console.error('  ✗ No colours found. Check that you exported the "Database" tab.');
    process.exit(1);
  }

  const totalPigmentRows = colors.reduce((n, c) => n + c.pigments.length, 0);
  console.log(`  ✓ ${colors.length} colours parsed (${totalPigmentRows} pigment rows)`);

  // Preview first 5 colours
  console.log('\n  Preview:');
  for (const c of colors.slice(0, 5)) {
    console.log(`    ${c.name} (${c.code}) — ${c.pigments.length} tint${c.pigments.length !== 1 ? 's' : ''}`);
    for (const p of c.pigments) {
      console.log(`      ${p.pigmentCode} ${p.pigmentName}: ${p.mlPerQuart}ml / ${p.mlPerGallon}ml / ${p.mlPerFiveGallon}ml`);
    }
  }
  if (colors.length > 5) console.log(`    … and ${colors.length - 5} more`);
  console.log('');

  if (opts.dryRun) {
    console.log('✅ Dry run complete. No data written.\n');
    return;
  }

  const supabase = getSupabase();

  // Step 2: Optionally clear existing standard colours
  if (opts.clear) {
    console.log('▶ Step 2/3  Clearing existing standard colours…');
    const { error } = await supabase.from('colors').delete().eq('is_standard', true);
    if (error) throw new Error(`Failed to clear colours: ${error.message}`);
    console.log('  ✓ Cleared');
  } else {
    console.log('▶ Step 2/3  (Skipping clear — use --clear to replace all standard colours first)');
  }

  // Step 3: Upsert colours in batches of 50
  console.log('▶ Step 3/3  Uploading to Supabase…');
  const now = new Date().toISOString();

  const rows_to_upsert = colors.map((c) => ({
    name: c.name,
    code: c.code || null,
    is_standard: true,
    installer_id: null,
    pigments: JSON.stringify(c.pigments),
    photo_url: null,
    notes: null,
    created_at: now,
    updated_at: now,
  }));

  const BATCH = 50;
  let upserted = 0;

  for (let i = 0; i < rows_to_upsert.length; i += BATCH) {
    const batch = rows_to_upsert.slice(i, i + BATCH);
    const { error } = await supabase
      .from('colors')
      .upsert(batch, { onConflict: 'name' });
    if (error) throw new Error(`Failed to upsert colours: ${error.message}`);
    upserted += batch.length;
    process.stdout.write(`\r  Uploaded ${upserted}/${rows_to_upsert.length} colours`);
  }

  console.log('\n\n✅ Done!');
  console.log(`   ${upserted} colours uploaded to Supabase.`);
  console.log(`   PowerSync will push them to all installer devices automatically.\n`);
}

main().catch((err) => {
  console.error('\n❌ Import failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});

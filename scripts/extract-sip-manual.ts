#!/usr/bin/env tsx
import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { Command } from 'commander';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

interface ManualPage {
  pageNumber: number;
  text: string;
  sourceDocument: string;
  wordCount: number;
}

const program = new Command();

program
  .name('extract-sip-manual')
  .description('Extract the SIP manual into a bundled TypeScript knowledge file')
  .requiredOption('--file <path>', 'Path to the SIP manual PDF')
  .option('--out <path>', 'Output TypeScript file', 'src/knowledge/sip-manual.ts')
  .parse(process.argv);

const opts = program.opts<{ file: string; out: string }>();

function normalizePageText(raw: string): string {
  return raw
    .replace(/\r/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\u0000/g, '')
    .trim();
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

async function main() {
  const pdfPath = path.resolve(opts.file);
  const outPath = path.resolve(opts.out);

  if (!fs.existsSync(pdfPath)) {
    throw new Error(`PDF not found: ${pdfPath}`);
  }

  const sourceDocument = path.basename(pdfPath);
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const loadingTask = (pdfjs as unknown as typeof import('pdfjs-dist')).getDocument({
    data,
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
  });

  const doc = await loadingTask.promise;
  const pages: ManualPage[] = [];

  console.log(`Extracting ${doc.numPages} pages from ${sourceDocument}...`);

  for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
    const page = await doc.getPage(pageNumber);
    const textContent = await page.getTextContent();

    const raw = textContent.items
      .map((item: any) => {
        const str = typeof item.str === 'string' ? item.str : '';
        const eol = item.hasEOL ? '\n' : ' ';
        return `${str}${eol}`;
      })
      .join('');

    const text = normalizePageText(raw);

    pages.push({
      pageNumber,
      text,
      sourceDocument,
      wordCount: countWords(text),
    });

    process.stdout.write(`\r  Page ${pageNumber}/${doc.numPages}`);
  }

  const fileContent = `export interface SipManualPage {\n  pageNumber: number;\n  text: string;\n  sourceDocument: string;\n  wordCount: number;\n}\n\nexport const SIP_MANUAL_PAGES: SipManualPage[] = ${JSON.stringify(pages, null, 2)};\n`;

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, fileContent, 'utf8');

  console.log(`\nWrote ${pages.length} pages to ${outPath}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});

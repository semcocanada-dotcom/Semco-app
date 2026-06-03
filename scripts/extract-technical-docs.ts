#!/usr/bin/env tsx
import * as fs from 'fs';
import * as path from 'path';
import { Command } from 'commander';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

interface TechnicalDoc {
  id: string;
  title: string;
  sourceDocument: string;
  category: string;
  pageCount: number;
}

interface TechnicalDocPage {
  id: string;
  docId: string;
  pageNumber: number;
  text: string;
  sourceDocument: string;
  title: string;
  category: string;
  wordCount: number;
}

const DEFAULT_EXCLUDED = ['Semco_Master_Distribution_Agreement'];

const program = new Command();

program
  .name('extract-technical-docs')
  .description('Extract Semco technical PDF docs into a bundled TypeScript knowledge file')
  .requiredOption('--dir <path>', 'Folder containing PDF documents')
  .option('--out <path>', 'Output TypeScript file', 'src/knowledge/technical-docs.ts')
  .option('--include-legal', 'Include legal/commercial documents', false)
  .parse(process.argv);

const opts = program.opts<{ dir: string; out: string; includeLegal: boolean }>();

function normalizePageText(raw: string): string {
  return raw
    .replace(/\r/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\u0000/g, '')
    .replace(/[^\S\n]+/g, ' ')
    .trim();
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function slug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function titleFromFile(fileName: string): string {
  return path.basename(fileName, '.pdf')
    .replace(/\+/g, ' ')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\bV\d+\b/gi, '')
    .replace(/\b\d{4}\b/g, '')
    .trim();
}

function categoryFromFile(fileName: string): string {
  const normalized = fileName.toLowerCase();
  if (normalized.includes('x-bond')) return 'X-Bond';
  if (normalized.includes('satin')) return 'Satin Stone';
  if (normalized.includes('lm') || normalized.includes('liquid')) return 'Liquid Membrane';
  if (normalized.includes('prestain')) return 'PreStain';
  if (normalized.includes('shower')) return 'Shower detail';
  if (normalized.includes('sip manual')) return 'SIP manual';
  if (normalized.includes('brochure')) return 'Brochure';
  return 'Technical doc';
}

function shouldInclude(fileName: string): boolean {
  if (opts.includeLegal) return true;
  return !DEFAULT_EXCLUDED.some((name) => fileName.includes(name));
}

async function extractPdf(pdfPath: string): Promise<{ doc: TechnicalDoc; pages: TechnicalDocPage[] }> {
  const sourceDocument = path.basename(pdfPath);
  const docId = `doc-${slug(path.basename(sourceDocument, '.pdf'))}`;
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const loadingTask = (pdfjs as unknown as typeof import('pdfjs-dist')).getDocument({
    data,
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
  });

  const pdf = await loadingTask.promise;
  const title = titleFromFile(sourceDocument);
  const category = categoryFromFile(sourceDocument);
  const pages: TechnicalDocPage[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const raw = textContent.items
      .map((item: any) => `${typeof item.str === 'string' ? item.str : ''}${item.hasEOL ? '\n' : ' '}`)
      .join('');
    const text = normalizePageText(raw);

    if (countWords(text) === 0) continue;

    pages.push({
      id: `${docId}-p${pageNumber}`,
      docId,
      pageNumber,
      text,
      sourceDocument,
      title,
      category,
      wordCount: countWords(text),
    });
  }

  return {
    doc: {
      id: docId,
      title,
      sourceDocument,
      category,
      pageCount: pdf.numPages,
    },
    pages,
  };
}

async function main() {
  const dirPath = path.resolve(opts.dir);
  const outPath = path.resolve(opts.out);

  if (!fs.existsSync(dirPath)) {
    throw new Error(`Folder not found: ${dirPath}`);
  }

  const files = fs.readdirSync(dirPath)
    .filter((file) => file.toLowerCase().endsWith('.pdf'))
    .filter(shouldInclude)
    .sort((a, b) => a.localeCompare(b));

  const docs: TechnicalDoc[] = [];
  const pages: TechnicalDocPage[] = [];

  for (const file of files) {
    const pdfPath = path.join(dirPath, file);
    process.stdout.write(`Extracting ${file}... `);
    const extracted = await extractPdf(pdfPath);
    docs.push(extracted.doc);
    pages.push(...extracted.pages);
    console.log(`${extracted.pages.length} searchable pages`);
  }

  const fileContent = `export interface TechnicalDoc {\n  id: string;\n  title: string;\n  sourceDocument: string;\n  category: string;\n  pageCount: number;\n}\n\nexport interface TechnicalDocPage {\n  id: string;\n  docId: string;\n  pageNumber: number;\n  text: string;\n  sourceDocument: string;\n  title: string;\n  category: string;\n  wordCount: number;\n}\n\nexport const TECHNICAL_DOCS: TechnicalDoc[] = ${JSON.stringify(docs, null, 2)};\n\nexport const TECHNICAL_DOC_PAGES: TechnicalDocPage[] = ${JSON.stringify(pages, null, 2)};\n`;

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, fileContent, 'utf8');
  console.log(`Wrote ${docs.length} docs and ${pages.length} pages to ${outPath}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});

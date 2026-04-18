import * as fs from 'fs';
import { createCanvas } from 'canvas';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

export interface RenderedPage {
  pageNumber: number;
  base64Jpeg: string;
  width: number;
  height: number;
}

// Scale factor: 2.0 gives ~200 DPI on A4 — good quality, reasonable file size
const RENDER_SCALE = 2.0;
const JPEG_QUALITY = 0.88;

class NodeCanvasFactory {
  create(width: number, height: number) {
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');
    return { canvas, context };
  }

  reset(canvasAndContext: { canvas: ReturnType<typeof createCanvas>; context: unknown }, width: number, height: number) {
    canvasAndContext.canvas.width = width;
    canvasAndContext.canvas.height = height;
  }

  destroy(canvasAndContext: { canvas: ReturnType<typeof createCanvas>; context: unknown }) {
    canvasAndContext.canvas.width = 0;
    canvasAndContext.canvas.height = 0;
  }
}

/**
 * Renders every page of a PDF to a base64 JPEG string.
 * Uses pdfjs-dist + canvas — no system dependencies required.
 */
export async function renderPdfPages(pdfPath: string): Promise<RenderedPage[]> {
  const data = new Uint8Array(fs.readFileSync(pdfPath));

  const loadingTask = (pdfjs as unknown as typeof import('pdfjs-dist')).getDocument({
    data,
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
  });

  const doc = await loadingTask.promise;
  const numPages = doc.numPages;
  const results: RenderedPage[] = [];
  const canvasFactory = new NodeCanvasFactory();

  console.log(`  Rendering ${numPages} page${numPages > 1 ? 's' : ''}…`);

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const viewport = page.getViewport({ scale: RENDER_SCALE });

    const { canvas, context } = canvasFactory.create(viewport.width, viewport.height);

    await page.render({
      canvasContext: context as unknown as CanvasRenderingContext2D,
      viewport,
      canvasFactory,
    }).promise;

    const buffer = (canvas as unknown as { toBuffer: (type: string, opts?: { quality: number }) => Buffer })
      .toBuffer('image/jpeg', { quality: JPEG_QUALITY });

    results.push({
      pageNumber: pageNum,
      base64Jpeg: buffer.toString('base64'),
      width: viewport.width,
      height: viewport.height,
    });

    page.cleanup();
    process.stdout.write(`\r  Page ${pageNum}/${numPages} rendered`);
  }

  console.log('');
  return results;
}

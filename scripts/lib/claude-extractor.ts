import Anthropic from '@anthropic-ai/sdk';
import type { RenderedPage } from './pdf-renderer.js';

const MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS = 2048;

// 1 request per second to stay well within rate limits
const RATE_LIMIT_MS = 1100;

const TDS_SYSTEM_PROMPT = `You are a precise technical content extractor for Semco microcement product documentation.

Your job is to extract ALL technical information from a PDF page. The page may be from a Technical Data Sheet (TDS), an application manual, or a product guide.

Instructions:
- Extract all text content verbatim where possible.
- For any diagram, chart, photo, illustration, or table on the page: describe it in technical detail. Include measurements, angles, layer names, application techniques, coverage patterns, colour appearances, or any other visual technical information shown.
- Preserve the structure: use the same headings and sections as the original page.
- If a page has no technical content (cover page, blank page, copyright notice, table of contents, page footer/header only): respond with exactly the single word SKIP and nothing else.
- Do not add commentary or opinions. Extract and describe only.`;

const COLOR_SYSTEM_PROMPT = `You are a precise colour data extractor for Semco microcement colour charts.

Your job is to extract every colour swatch and formula shown on a PDF page.

For each colour found, return a JSON object with these fields:
- "name": the colour name exactly as printed (string)
- "code": the colour code or reference number if shown (string or null)
- "pigments": array of pigment entries if a formula is shown, each with:
  - "pigmentName": pigment name as printed (string)
  - "pigmentSku": your best guess at a short SKU slug e.g. "PIG-YELLOW-OCHRE" (string)
  - "ratioGPerKg": grams per kilogram of powder (number, 0 if not shown)
- "appearance": one sentence describing the colour's visual appearance (string)

Return a JSON array of colour objects. If the page has no colour swatches, return an empty array [].
Do not include markdown formatting — return only the raw JSON array.`;

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set in environment');
    client = new Anthropic({ apiKey });
  }
  return client;
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

/**
 * Sends one PDF page image to Claude Vision and returns extracted text.
 * Returns null if the page should be skipped.
 */
export async function extractPageContent(
  page: RenderedPage,
  mode: 'tds' | 'colors' = 'tds',
): Promise<string | null> {
  const anthropic = getClient();

  const systemPrompt = mode === 'colors' ? COLOR_SYSTEM_PROMPT : TDS_SYSTEM_PROMPT;

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/jpeg',
              data: page.base64Jpeg,
            },
          },
          {
            type: 'text',
            text: `Extract all technical content from this page (page ${page.pageNumber}).`,
          },
        ],
      },
    ],
  });

  const text =
    response.content[0]?.type === 'text' ? response.content[0].text.trim() : '';

  if (!text || text === 'SKIP') return null;
  return text;
}

/**
 * Processes all pages sequentially with rate limiting.
 * Returns extracted text per page (null = skip).
 */
export async function extractAllPages(
  pages: RenderedPage[],
  mode: 'tds' | 'colors' = 'tds',
  onProgress?: (current: number, total: number) => void,
): Promise<Array<{ pageNumber: number; content: string | null }>> {
  const results: Array<{ pageNumber: number; content: string | null }> = [];

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    onProgress?.(i + 1, pages.length);

    const content = await extractPageContent(page, mode);
    results.push({ pageNumber: page.pageNumber, content });

    // Rate limit — don't hammer the API
    if (i < pages.length - 1) await sleep(RATE_LIMIT_MS);
  }

  return results;
}

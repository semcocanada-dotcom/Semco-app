export interface TextChunk {
  text: string;
  metadata: {
    pageNumber: number;
    section: string;
    productSku: string;
    productName: string;
    sourceDocument: string;
  };
}

const MIN_CHUNK_WORDS = 80;
const MAX_CHUNK_WORDS = 600;

// Patterns that indicate a new section heading
const HEADING_PATTERNS = [
  /^[A-Z][A-Z\s/&()]{4,}$/, // ALL CAPS line (min 5 chars)
  /^\d+[\.\)]\s+\w/, // Numbered heading: "1. ..." or "1) ..."
  /^#+\s+/, // Markdown heading
  /^[A-Z].{2,50}:$/, // Line ending with colon: "Application:"
];

function isHeading(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  return HEADING_PATTERNS.some((p) => p.test(trimmed));
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function splitIntoSections(
  pageText: string,
): Array<{ heading: string; body: string }> {
  const lines = pageText.split('\n');
  const sections: Array<{ heading: string; body: string }> = [];
  let currentHeading = '';
  let currentLines: string[] = [];

  const flush = () => {
    if (currentLines.some((l) => l.trim())) {
      sections.push({ heading: currentHeading, body: currentLines.join('\n').trim() });
    }
    currentLines = [];
  };

  for (const line of lines) {
    if (isHeading(line)) {
      flush();
      currentHeading = line.trim();
    } else {
      currentLines.push(line);
    }
  }
  flush();

  return sections;
}

function splitByWords(text: string, maxWords: number): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let current: string[] = [];

  for (const word of words) {
    current.push(word);
    if (current.length >= maxWords) {
      chunks.push(current.join(' '));
      current = [];
    }
  }
  if (current.length >= MIN_CHUNK_WORDS) chunks.push(current.join(' '));
  else if (chunks.length > 0) chunks[chunks.length - 1] += ' ' + current.join(' ');
  else if (current.length > 0) chunks.push(current.join(' '));

  return chunks;
}

/**
 * Converts per-page Claude output into semantically sized chunks
 * ready for embedding. Each chunk includes enough context to be
 * useful when retrieved in isolation.
 */
export function chunkPageContent(
  pageExtracts: Array<{ pageNumber: number; content: string | null }>,
  productSku: string,
  productName: string,
  sourceDocument: string,
): TextChunk[] {
  const chunks: TextChunk[] = [];

  for (const { pageNumber, content } of pageExtracts) {
    if (!content) continue;

    const sections = splitIntoSections(content);

    for (const { heading, body } of sections) {
      if (!body.trim()) continue;

      const prefix = `[${productName} | Page ${pageNumber}${heading ? ` | ${heading}` : ''}]\n\n`;

      if (wordCount(body) <= MAX_CHUNK_WORDS) {
        const text = (prefix + body).trim();
        if (wordCount(text) >= MIN_CHUNK_WORDS) {
          chunks.push({
            text,
            metadata: {
              pageNumber,
              section: heading || 'General',
              productSku,
              productName,
              sourceDocument,
            },
          });
        }
      } else {
        // Split oversized sections at paragraph boundaries first
        const paragraphs = body.split(/\n\n+/);
        let accumulated = '';

        for (const para of paragraphs) {
          const candidate = accumulated ? `${accumulated}\n\n${para}` : para;
          if (wordCount(candidate) > MAX_CHUNK_WORDS && accumulated) {
            chunks.push({
              text: (prefix + accumulated).trim(),
              metadata: { pageNumber, section: heading || 'General', productSku, productName, sourceDocument },
            });
            accumulated = para;
          } else {
            accumulated = candidate;
          }
        }

        // Anything remaining
        if (accumulated.trim()) {
          const parts = splitByWords(accumulated, MAX_CHUNK_WORDS);
          for (const part of parts) {
            chunks.push({
              text: (prefix + part).trim(),
              metadata: { pageNumber, section: heading || 'General', productSku, productName, sourceDocument },
            });
          }
        }
      }
    }
  }

  return chunks;
}

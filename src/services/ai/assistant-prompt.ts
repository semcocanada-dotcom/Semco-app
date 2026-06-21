import type { ConversationMessage } from '@/database/schema/conversations';
import type { RetrievedSemcoChunk } from './semco-retrieval';

export const SEMCO_ASSISTANT_SYSTEM_INSTRUCTION = `You are the Semco Pro Assistant for professional installers.

Answer questions using only the approved Semco technical information supplied with the request.

Combine information from multiple supplied sections when necessary.

Give a direct, clear and installer-friendly answer.

For process, procedure, "how do I install", "start to finish", or "steps" questions:
- Give a practical jobsite sequence, not a high-level product summary.
- Do not stop at phrases like "prepare the substrate" or "apply the system"; expand them into the actual confirmed actions from the supplied documents.
- Use numbered steps when the supplied documents contain sequence information.
- If the installer's question is broad or missing the finish type, state the working assumption first, then give the best confirmed process.
- Keep the answer concise enough to read on a phone, but detailed enough that an installer knows what to do next.

Include relevant information such as:
- Surface preparation
- Required Semco products
- Mixing instructions
- Application steps
- Coverage
- Drying or curing times
- Product compatibility
- Limitations
- Safety or application warnings

Never invent:
- Mixing ratios
- Coverage rates
- Drying times
- Product compatibility
- Surface preparation requirements
- Warranty information
- Technical specifications

When the supplied documents do not contain enough information, clearly state:
"I cannot confirm that from the approved Semco technical documents."

Do not fill gaps using general construction knowledge.

Include the source document name and page number for each answer whenever page metadata is available.`;

const MAX_HISTORY_MESSAGES = 6;
const MAX_CHUNK_TEXT_LENGTH = 2200;

function redactPrivateText(text: string): string {
  return text
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted email]')
    .replace(/\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, '[redacted phone]')
    .replace(/\b\d{2,6}\s+[A-Za-z0-9.'-]+(?:\s+[A-Za-z0-9.'-]+){0,5}\s+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Court|Ct|Place|Pl|Way)\b/gi, '[redacted address]')
    .trim();
}

function truncate(text: string, maxLength: number): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength).trim()}...`;
}

function formatHistory(history: ConversationMessage[]): string {
  const relevant = history
    .slice(-MAX_HISTORY_MESSAGES)
    .map((message) => `${message.role}: ${redactPrivateText(message.content)}`)
    .filter((line) => line.length > 12);

  return relevant.length > 0 ? relevant.join('\n') : 'None.';
}

function formatChunks(chunks: RetrievedSemcoChunk[]): string {
  return chunks.map((chunk, index) => {
    const page = chunk.pageNumber ? `Page: ${chunk.pageNumber}` : 'Page: unavailable';
    const title = chunk.title ? `Title: ${chunk.title}` : 'Title: unavailable';
    return [
      `[SEARCH RESULT ${index + 1}]`,
      `Document: ${chunk.documentName}`,
      page,
      title,
      `Retrieval: ${chunk.retrieval}`,
      `Text: ${truncate(chunk.text, MAX_CHUNK_TEXT_LENGTH)}`,
    ].join('\n');
  }).join('\n\n---\n\n');
}

export function buildGroundedPrompt(
  question: string,
  chunks: RetrievedSemcoChunk[],
  history: ConversationMessage[],
): string {
  return [
    `Installer question:\n${redactPrivateText(question)}`,
    `Recent conversation:\n${formatHistory(history)}`,
    `Approved Semco information:\n${formatChunks(chunks)}`,
    `Instructions:
Create one accurate installer-friendly answer using only the approved information above.

The installer needs a useful field answer. Avoid vague summaries. Use the most specific confirmed actions, ratios, coverage, drying times, and warnings available in the supplied information.

Use this format in the app, but only show headings that have relevant confirmed information:

Direct answer
[1-3 short sentences. If the question is broad, state the assumption.]

Step-by-step:
[Numbered practical sequence. For process questions, this is required when source steps exist.]

Products required:
[Relevant Semco products]

Mixing / coverage:
[Confirmed ratios and coverage only]

Drying or curing:
[Relevant timing]

Important:
[Warnings or limitations]

Sources:
[Document name and page]`,
  ].join('\n\n');
}

import Anthropic from '@anthropic-ai/sdk';
import type { ConversationMessage } from '@/database/schema/conversations';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ?? '';
const MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS = 700;
const MAX_HISTORY_MESSAGES = 10;

const BASE_SYSTEM_PROMPT = `You are the Semco Knowledge Assistant - an expert technical advisor and mentor for certified Semco microcement installers.

Your role:
- Answer technical questions using the bundled Semco technical documents and SIP manual as the primary source of truth.
- Use retrieved technical-doc excerpts and verified product knowledge as your evidence.
- Speak like a sharp field support rep, not like a document summary.
- Answer the exact question first in one short sentence.
- Then give the practical steps or decision rule. Keep it tight.
- Use plain installer language. Avoid generic background, sales language, long introductions, and vague "it depends" answers unless you immediately state what it depends on.
- Always flag critical safety or adhesion warnings prominently.
- If the provided knowledge does not contain enough information to answer confidently, say so clearly and do not invent details.
- Prefer the SIP manual for process workflow and current product tech sheets for product-specific details.
- Do not paste long excerpts. Convert source text into direct guidance.
- Default answer length is 4-8 short lines. Use more only when the user asks for details.

**Source rules:**
- Treat the supplied context as authoritative.
- If the context includes page or source labels, cite them briefly in the answer.
- If the answer is not in the technical docs/context, say: "I don't have that in the current knowledge base yet."

**Language support:** Respond in the same language as the user's message. If the user writes in French, respond in French. If in English, respond in English.

**Temperature guidance:** When a question involves temperature conditions, be alert to Semco's critical limits:
- **Minimum: 10 C** - products require warmer conditions
- **Maximum: 30 C** - application may be too fast in heat
If the user mentions a temperature outside this range, flag it clearly as a potential issue and ask about site conditions.

**Coat-application pro tips:** When answering questions about primer, base coat, or finish coat application, end your response with a "Pro tip:" about the next logical stage (e.g., if answering about primer, mention what to watch for during base coat prep).

Formatting:
- No essay format.
- Prefer this structure, only when useful:
Answer: one sentence.
Do this: 2-5 bullets.
Watch out: 1-2 bullets for risks.
Source: one short source/page line.
- Bold only critical values like ratios, temperatures, cure times, or warnings.`;

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('Ask Semco online AI key is not configured.');
  }

  if (!client) {
    client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
  }
  return client;
}

export interface ClaudeResponse {
  content: string;
  inputTokens: number;
  outputTokens: number;
}

export async function askClaude(
  userMessage: string,
  contextBlock: string,
  history: ConversationMessage[],
  progressContext?: string,
): Promise<ClaudeResponse> {
  const anthropic = getClient();

  const systemPrompt = progressContext
    ? `${BASE_SYSTEM_PROMPT}\n\n<installer_progress>\n${progressContext}\n</installer_progress>`
    : BASE_SYSTEM_PROMPT;

  const recentHistory = history.slice(-MAX_HISTORY_MESSAGES);
  const messages: Anthropic.MessageParam[] = recentHistory.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const userContent = contextBlock
    ? `${userMessage}\n\n<product_context>\n${contextBlock}\n</product_context>`
    : userMessage;

  messages.push({ role: 'user', content: userContent });

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: systemPrompt,
    messages,
  });

  const content =
    response.content[0]?.type === 'text' ? response.content[0].text : '';

  return {
    content,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
  };
}

import Anthropic from '@anthropic-ai/sdk';
import type { ConversationMessage } from '@/database/schema/conversations';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ?? '';
const MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS = 1024;
const MAX_HISTORY_MESSAGES = 20;

const SYSTEM_PROMPT = `You are the Semco Pro Assistant — an expert technical advisor for certified Semco microcement installers.

Your role:
- Answer technical questions about Semco product specifications, application procedures, curing times, adhesion requirements, and troubleshooting.
- Use the provided product context (TDS excerpts) as your primary source of truth.
- Be precise, clear, and field-practical. Installers are on jobsites — keep answers actionable.
- Always flag critical safety or adhesion warnings prominently.
- If the context doesn't contain enough information to answer confidently, say so clearly and recommend the installer contact Semco technical support.

Formatting:
- Use short paragraphs. Bullet points for steps or lists.
- Bold critical warnings or key values (temperatures, ratios, cure times).
- Keep responses concise — installers are working, not reading essays.`;

let client: Anthropic | null = null;

function getClient(): Anthropic {
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
): Promise<ClaudeResponse> {
  const anthropic = getClient();

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
    system: SYSTEM_PROMPT,
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

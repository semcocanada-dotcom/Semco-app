import Anthropic from '@anthropic-ai/sdk';
import type { ConversationMessage } from '@/database/schema/conversations';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ?? '';
const MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS = 1024;
const MAX_HISTORY_MESSAGES = 20;

const BASE_SYSTEM_PROMPT = `You are the Semco Pro Assistant — an expert technical advisor and mentor for certified Semco microcement installers.

Your role:
- Answer technical questions about Semco product specifications, application procedures, curing times, adhesion requirements, and troubleshooting.
- Use the provided product context (TDS excerpts) as your primary source of truth.
- Be precise, clear, and field-practical. Installers are on jobsites — keep answers actionable.
- Always flag critical safety or adhesion warnings prominently.
- If the context doesn't contain enough information to answer confidently, say so clearly and recommend the installer contact Semco technical support.
- You remember this installer's learning journey. If they've asked about a topic before, acknowledge it naturally and focus on what they still need to reinforce. If it's a weak area, give extra detail and a memorable key point. If they've mastered a topic, be concise and skip the basics.

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

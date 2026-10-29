import { searchProductsOffline, formatOfflineResponse } from './offline-search';
import {
  citationsFromChunks,
  formatLocalGroundedAnswer,
  retrieveSemcoChunks,
} from './semco-retrieval';
import {
  buildReasoningProfile,
  shouldAskForRequiredInputs,
  shouldUseLocalFieldAnswer,
} from './reasoning';
import {
  buildClarifyingQuestion,
  buildSuggestedFollowUps,
  extractJobContext,
  resolveContextualQuestion,
  getActiveJobHistory,
} from './job-context';
import { buildMathAnswer } from './assistant-math';
import { buildInstructorAnswer } from './instructor';
import { buildGuideBusinessAnswer } from './guide-business';
import { continueGuideLesson, startGuideLesson } from './guide-lesson';
import { buildGuideEducationAnswer } from './guide-education';
import { findGuideVideos, GUIDE_VIDEOS, GUIDE_VIDEO_NOTICE } from '@/knowledge/guide-videos';
import type { AssistantCitation, AssistantVideo, ConversationMessage, GuideLesson, MessageSource } from '@/database/schema/conversations';

export interface AssistantResponse {
  content: string;
  source: MessageSource;
  isOffline: boolean;
  citations?: AssistantCitation[];
  provider?: string;
  quickReplies?: string[];
  suggestedFollowUps?: string[];
  guideLesson?: GuideLesson;
  videos?: AssistantVideo[];
  guideEducation?: { productId: string };
}

/**
 * Semco Guide is an entirely local knowledge tool. It uses deterministic
 * calculators, installed Semco reference text, and coded field rules. The
 * network arguments remain in the public signature for backwards-compatible
 * callers, but no question or conversation content leaves the device.
 */
export async function sendMessage(
  userMessage: string,
  history: ConversationMessage[],
  _isOnline = false,
  _installerId?: string,
): Promise<AssistantResponse> {
  const turns = [...getActiveJobHistory(history, userMessage)];
  if (turns.at(-1)?.role === 'user' && turns.at(-1)?.content === userMessage) turns.pop();
  const previous = turns.at(-1)?.role === 'assistant' ? turns.at(-1) : undefined;
  const reportedFailure = /\b(?:my|our|the|it|bond|membrane|sealer)\s+(?:is |has |keeps |was |are |went |looks? |seems? )?(?:peeling|bubbling|crack(?:ed|ing)|cloudy|sticky|soft|blistering|leaking)|\b(?:wont|won't|will not) dry\b/i.test(userMessage);
  const videoRequest = !reportedFailure && /\b(?:video|youtube|watch|tutorial link)\b/i.test(userMessage);
  if (videoRequest) {
    const explicit = findGuideVideos(userMessage);
    // Only an explicitly referential request may inherit a video topic. An
    // unknown named topic ("video about epoxy") must not borrow the last one.
    const contextual = /\b(?:for|about|of|on) (?:this|that|it)\b|\b(?:show|see|watch) (?:me )?(?:a |the )?video[.!?]*$/i.test(userMessage);
    const priorLinks = previous?.videos?.flatMap((saved) => {
      const video = GUIDE_VIDEOS.find((item) => item.id === saved.id && item.url === saved.url);
      return video ? [video] : [];
    });
    const priorQuestion = [...turns].reverse().find((turn) => turn.role === 'user')?.content ?? '';
    const videos = explicit.length ? explicit : contextual ? (priorLinks ?? findGuideVideos(priorQuestion)) : [];
    return {
      content: videos.length
        ? `These SEMCO videos may help you see the process. Their titles and publisher have been checked; the video instructions have not been fully reviewed.\n\n${GUIDE_VIDEO_NOTICE}`
        : 'I do not have a verified video link for that exact topic yet. Tell me the product or process and I can still explain it from the installed references.',
      source: 'local_guide', isOffline: true, provider: 'local-video-reference',
      videos: videos.map(({ id, title, url, publisher, legacy }) => ({ id, title, url, publisher, legacy })),
      guideLesson: previous?.guideLesson,
    };
  }
  const response = await buildResponse(userMessage, history);
  // Keep diagnosis and quantity answers focused. Videos supplement teaching,
  // not safety decisions, and no connection is made until the installer taps.
  if (response.videos === undefined && ['local-education', 'local-lesson', 'local-field-rules'].includes(response.provider ?? '')) {
    const query = response.guideLesson?.steps[response.guideLesson.cursor] ?? userMessage;
    response.videos = findGuideVideos(query, 1).map(({ id, title, url, publisher, legacy }) => ({ id, title, url, publisher, legacy }));
  }
  return response;
}

async function buildResponse(userMessage: string, history: ConversationMessage[]): Promise<AssistantResponse> {
  const lessonContinuation = continueGuideLesson(userMessage, history);
  if (lessonContinuation) {
    return { ...lessonContinuation, source: 'local_guide', isOffline: true, provider: 'local-lesson' };
  }
  const jobContext = extractJobContext(history, userMessage);

  const educationAnswer = await buildGuideEducationAnswer(userMessage, history, jobContext);
  if (educationAnswer) {
    return { ...educationAnswer, source: 'local_guide', isOffline: true, provider: 'local-education' };
  }

  const instructorAnswer = buildInstructorAnswer(userMessage, history, jobContext);
  if (instructorAnswer) {
    return { ...instructorAnswer, source: 'local_guide', isOffline: true, provider: 'local-instructor' };
  }

  const businessAnswer = buildGuideBusinessAnswer(userMessage);
  if (businessAnswer) {
    return { ...businessAnswer, source: 'local_guide', isOffline: true, provider: 'local-installed-policy' };
  }

  const mathAnswer = buildMathAnswer(jobContext, userMessage, history);
  if (mathAnswer) {
    return {
      content: normalizeAssistantContent(mathAnswer.content),
      source: 'local_guide',
      isOffline: true,
      citations: [],
      provider: 'local-calculator',
      quickReplies: mathAnswer.quickReplies,
      suggestedFollowUps: mathAnswer.followUps,
    };
  }

  const retrievalQuestion = resolveContextualQuestion(userMessage, history, jobContext);
  const retrieval = await retrieveSemcoChunks(retrievalQuestion);
  const citations = citationsFromChunks(retrieval.chunks);
  const reasoningProfile = buildReasoningProfile(retrievalQuestion);
  const suggestedFollowUps = buildSuggestedFollowUps(reasoningProfile.intent, jobContext);

  if (shouldAskForRequiredInputs(reasoningProfile)) {
    const clarifying = buildClarifyingQuestion(jobContext, userMessage);
    return {
      content: normalizeAssistantContent(
        clarifying?.content
          ?? reasoningProfile.localAnswer
          ?? 'I need the substrate and surface condition before I can answer that correctly.',
      ),
      source: 'local_guide',
      isOffline: true,
      citations: [],
      provider: 'local-clarification',
      quickReplies: clarifying?.quickReplies
        ?? defaultSubstrateQuickReplies(reasoningProfile.missingInputs),
    };
  }

  if (shouldUseLocalFieldAnswer(reasoningProfile)) {
    const fieldAnswer = normalizeAssistantContent(reasoningProfile.localAnswer ?? '');
    const lesson = startGuideLesson(fieldAnswer, userMessage);
    if (lesson) {
      return { ...lesson, source: 'local_guide', isOffline: true, provider: 'local-lesson', citations };
    }
    return {
      content: fieldAnswer,
      source: 'local_guide',
      isOffline: true,
      citations,
      provider: 'local-field-rules',
      suggestedFollowUps,
    };
  }

  if (retrieval.chunks.length === 0) {
    const products = await searchProductsOffline(userMessage);
    if (products.length > 0) {
      return {
        content: normalizeAssistantContent(formatOfflineResponse(products)),
        source: 'offline_fts',
        isOffline: true,
        citations: [],
        provider: 'local-product-library',
      };
    }
  }

  const content = formatLocalGroundedAnswer(
    retrieval.chunks,
    retrieval.confidence === 'none'
      ? 'I cannot confirm that from the installed Semco technical references.'
      : 'I found related information in the installed SEMCO references.',
    reasoningProfile.localAnswer,
    { includeClosestSource: reasoningProfile.intent !== 'document_gap' },
  );

  return {
    content: normalizeAssistantContent(content),
    source: 'local_guide',
    isOffline: true,
    citations,
    provider: 'local-documents',
    suggestedFollowUps,
  };
}

function defaultSubstrateQuickReplies(missingInputs: string[]): string[] | undefined {
  if (!missingInputs.includes('substrate')) return undefined;
  return ['Concrete', 'Existing tile', 'Plywood / OSB', 'GlasRoc or similar board'];
}

function normalizeAssistantContent(content: string): string {
  const original = content.trim();
  let next = original.replace(/\r\n/g, '\n').trim();

  next = next
    .replace(/^\s*Direct answer\s*\n+/i, '')
    .replace(/^\s*Answer:\s*/i, '')
    .replace(/\n\s*Direct answer\s*\n/gi, '\n')
    .replace(/\n\s*Sources:\s*[\s\S]*$/i, '')
    .replace(/\n\s*Closest confirmed source:\s*[\s\S]*$/i, '')
    .replace(/\n\s*Source:\s*[^\n]+$/i, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return next || original;
}

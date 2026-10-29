import type { AssistantCitation, ConversationMessage, GuideLesson } from '@/database/schema/conversations';

export interface GuideLessonAnswer {
  content: string;
  guideLesson: GuideLesson;
  quickReplies: string[];
  citations?: AssistantCitation[];
}

const ALL_STEPS = /^(?:please\s+)?(?:show\s+(?:me\s+)?)?(?:all (?:the )?steps|full guide|full instructions)[.!?]?$/i;
const NEXT_STEP = /^(?:next(?: step)?|continue|done|ready|what(?:'s| is)? next|what do i do next|walk me through the next step)[.!?]?$/i;
const PREVIOUS_STEP = /^(?:previous(?: step)?|back(?: a step)?|repeat(?: that| this step)?)[.!?]?$/i;

function renderLesson(lesson: GuideLesson): GuideLessonAnswer {
  const atEnd = lesson.cursor === lesson.steps.length - 1;
  return {
    content: [
      lesson.cursor === 0 ? "Let's take it one step at a time." : 'Here is the next part to review.',
      lesson.cursor === 0 ? lesson.intro : '',
      `Part ${lesson.cursor + 1} of ${lesson.steps.length}`,
      lesson.steps[lesson.cursor],
      lesson.safetyNote,
      atEnd
        ? "That's the last step in this guide. This is guidance, not confirmation that the work has passed inspection. Tell me if anything on site does not match."
        : 'Only move on when this step and its checks are complete. If something looks wrong, tell me what happened.',
    ].filter(Boolean).join('\n\n'),
    guideLesson: lesson,
    quickReplies: [
      ...(atEnd ? [] : ['Next step']),
      ...(lesson.cursor > 0 ? ['Previous step'] : []),
      'Show all steps',
    ],
  };
}

/** Do not shorten specifications: reveal whole steps and repeat the safety note. */
export function startGuideLesson(answer: string, question: string): GuideLessonAnswer | null {
  if (/\b(?:all steps|full guide|full instructions|all at once)\b/i.test(question)) return null;
  const matches = [...answer.matchAll(/^\*\*Step\s+\d+[^\n]*/gm)];
  if (matches.length < 4) return null;
  const intro = answer.slice(0, matches[0].index).trim();
  const steps = matches.map((match, index) => answer.slice(match.index, matches[index + 1]?.index ?? answer.length).trim());
  // Shared field checks are outside the numbered procedure and apply to all steps.
  const last = steps[steps.length - 1];
  const safetyStart = last.search(/\n\s*(?:Field check|Important|Safety check):/i);
  const safetyNote = safetyStart >= 0 ? last.slice(safetyStart).trim() : '';
  if (safetyStart >= 0) steps[steps.length - 1] = last.slice(0, safetyStart).trim();
  return renderLesson({ intro, steps, cursor: 0, safetyNote });
}

/** Only the immediately preceding assistant can own a continuation command. */
export function continueGuideLesson(question: string, history: ConversationMessage[]): GuideLessonAnswer | null {
  const turns = [...history];
  // Support callers that already appended the current question, but never skip
  // an unanswered earlier user turn (it may have changed the job entirely).
  if (turns.at(-1)?.role === 'user' && turns.at(-1)?.content === question) turns.pop();
  const previous = turns.at(-1);
  if (previous?.role !== 'assistant') return null;
  const lesson = previous?.guideLesson;
  if (!lesson || !Array.isArray(lesson.steps) || lesson.steps.length === 0
    || !lesson.steps.every((step) => typeof step === 'string')
    || !Number.isInteger(lesson.cursor) || lesson.cursor < 0 || lesson.cursor >= lesson.steps.length) return null;
  const text = question.trim();
  if (ALL_STEPS.test(text)) {
    return {
      content: [lesson.intro, ...lesson.steps, lesson.safetyNote].filter(Boolean).join('\n\n'),
      guideLesson: lesson,
      quickReplies: renderLesson(lesson).quickReplies.filter((reply) => reply !== 'Show all steps'),
      citations: previous.citations,
    };
  }
  if (!NEXT_STEP.test(text) && !PREVIOUS_STEP.test(text)) return null;
  const change = PREVIOUS_STEP.test(text) ? (/^repeat/i.test(text) ? 0 : -1) : 1;
  const cursor = Math.min(lesson.steps.length - 1, Math.max(0, lesson.cursor + change));
  return { ...renderLesson({ ...lesson, cursor }), citations: previous.citations };
}

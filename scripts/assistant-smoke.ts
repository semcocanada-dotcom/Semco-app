/**
 * Repeatable smoke test for the Ask Semco intelligence layer.
 *
 * Runs the handoff prompt set (including multi-turn follow-up sequences)
 * through the same offline decision path the app uses: job-context
 * extraction, contextual question resolution, retrieval, reasoning, and
 * fallback formatting. No Firebase/AsyncStorage/SQLite required.
 *
 * Run from the repo root:
 *   npx tsx --tsconfig tsconfig.json scripts/assistant-smoke.ts
 */
import type { ConversationMessage } from '@/database/schema/conversations';
import { buildMathAnswer } from '@/services/ai/assistant-math';
import {
  buildClarifyingQuestion,
  extractJobContext,
  resolveContextualQuestion,
} from '@/services/ai/job-context';
import {
  buildReasoningProfile,
  shouldAskForRequiredInputs,
  shouldUseLocalFieldAnswer,
} from '@/services/ai/reasoning';
import { formatLocalGroundedAnswer, retrieveSemcoChunks } from '@/services/ai/semco-retrieval';

interface SimulatedTurn {
  content: string;
  provider: string;
  quickReplies?: string[];
}

let messageCounter = 0;

function makeMessage(role: 'user' | 'assistant', content: string): ConversationMessage {
  messageCounter += 1;
  return {
    id: `smoke-${messageCounter}`,
    role,
    content,
    source: 'ai_fallback',
    timestamp: new Date().toISOString(),
  };
}

/** Mirrors the offline branch of handleKnowledgeAssistant. */
async function simulateTurn(history: ConversationMessage[], userMessage: string): Promise<SimulatedTurn> {
  const jobContext = extractJobContext(history, userMessage);

  const mathAnswer = buildMathAnswer(jobContext, userMessage, history);
  if (mathAnswer) {
    return {
      content: mathAnswer.content,
      provider: 'local-calculator',
      quickReplies: mathAnswer.quickReplies,
    };
  }

  const retrievalQuestion = resolveContextualQuestion(userMessage, history, jobContext);
  const retrieval = await retrieveSemcoChunks(retrievalQuestion, false);
  const profile = buildReasoningProfile(retrievalQuestion);

  if (shouldAskForRequiredInputs(profile)) {
    const clarifying = buildClarifyingQuestion(jobContext, userMessage);
    return {
      content: clarifying?.content ?? profile.localAnswer ?? 'I need the substrate first.',
      provider: 'local-clarification',
      quickReplies: clarifying?.quickReplies,
    };
  }

  if (shouldUseLocalFieldAnswer(profile)) {
    return { content: profile.localAnswer ?? '', provider: 'local-field-rules' };
  }

  return {
    content: formatLocalGroundedAnswer(
      retrieval.chunks,
      'Gemini is unavailable right now.',
      profile.localAnswer,
      { includeClosestSource: profile.intent !== 'document_gap' },
    ),
    provider: 'local-documents',
  };
}

type Check = (turns: SimulatedTurn[]) => string | null;

interface Scenario {
  name: string;
  prompts: string[];
  checks: Check[];
}

const OCR_MARKERS = ['Previous page context:', 'Matched page:', 'Next page context:'];

function noOcr(turns: SimulatedTurn[]): string | null {
  for (const turn of turns) {
    const marker = OCR_MARKERS.find((entry) => turn.content.includes(entry));
    if (marker) return `raw OCR marker leaked: ${marker}`;
  }
  return null;
}

function noAnswerPrefix(turns: SimulatedTurn[]): string | null {
  for (const turn of turns) {
    if (/^\s*(Answer:|Direct answer)/m.test(turn.content)) return 'literal Answer:/Direct answer prefix leaked';
  }
  return null;
}

function lastIncludes(...needles: string[]): Check {
  return (turns) => {
    const content = turns[turns.length - 1].content.toLowerCase();
    const missing = needles.filter((needle) => !content.includes(needle.toLowerCase()));
    return missing.length ? `final answer missing: ${missing.join(', ')}` : null;
  };
}

function lastExcludes(...needles: string[]): Check {
  return (turns) => {
    const content = turns[turns.length - 1].content.toLowerCase();
    const present = needles.filter((needle) => content.includes(needle.toLowerCase()));
    return present.length ? `final answer should not mention: ${present.join(', ')}` : null;
  };
}

function turnAsksClarification(index: number): Check {
  return (turns) => {
    const turn = turns[index];
    if (!turn.content.includes('?')) return `turn ${index + 1} should ask a question`;
    if (!turn.quickReplies?.length) return `turn ${index + 1} should offer tap choices`;
    return null;
  };
}

const SCENARIOS: Scenario[] = [
  {
    name: 'Shower procedure asks substrate first, GlasRoc follow-up answers',
    prompts: ['What procedure for a shower?', 'GlasRoc'],
    checks: [turnAsksClarification(0), lastIncludes('glasroc', 'liquid membrane', 'satin stone')],
  },
  {
    name: 'Shower substrate question lists approved boards',
    prompts: ['What substrate should be used in a shower?'],
    checks: [lastIncludes('glasroc')],
  },
  {
    name: 'Shower sealer rule is Satin Stone 2 coats',
    prompts: ['What sealer for a shower?'],
    checks: [lastIncludes('satin stone', '2 coats')],
  },
  {
    name: 'Exterior plywood deck X-Bond, then finish coats keep the same job',
    prompts: ['How do I do X-Bond over exterior plywood deck?', 'Then what do I do for the finish coats?'],
    checks: [lastExcludes('cannot confirm that from the approved semco technical documents')],
  },
  {
    name: 'Brown Coat purpose',
    prompts: ['What is Brown Coat for?'],
    checks: [],
  },
  {
    name: 'Concrete start to finish',
    prompts: ['How do I go over concrete from start to finish?'],
    checks: [lastIncludes('concrete')],
  },
  {
    name: 'Concrete prep',
    prompts: ['How do I prep concrete?'],
    checks: [lastIncludes('concrete')],
  },
  {
    name: 'Concrete pool process, pond/membrane correction, underwater coat count',
    prompts: [
      "What's the process for doing a concrete pool?",
      'I said pond not floor and the finish is Liquid Membrane not X-Bond.',
      'How many coats for it being underwater?',
    ],
    checks: [lastIncludes('3 coats')],
  },
  {
    name: 'Underwater coats without prior context still answers 3 coats',
    prompts: ['How many coats for it being underwater?'],
    checks: [lastIncludes('3 coats', 'liquid membrane')],
  },
  {
    name: 'Painted drywall question',
    prompts: ['Can I go over painted drywall?'],
    checks: [],
  },
  {
    name: 'X-Bond over existing tile',
    prompts: ['Can X-Bond go over existing tile?'],
    checks: [lastIncludes('tile')],
  },
  {
    name: 'Tile prep',
    prompts: ['How do I prep tile?'],
    checks: [lastIncludes('tile')],
  },
  {
    name: 'Warranty photo list',
    prompts: ['What photos are needed for warranty?'],
    checks: [lastIncludes('photo')],
  },
  {
    name: 'Bag coverage answers the verified 75 sq ft figure',
    prompts: ['How much area does one bag cover?'],
    checks: [lastIncludes('75 sq ft', 'complete', 'not per coat')],
  },
  {
    name: 'Liquid Membrane quantity asks for the area',
    prompts: ['How much Liquid Membrane do I need?'],
    checks: [lastIncludes('area')],
  },
  {
    name: 'Material count for 600 sq ft over concrete shows worked math',
    prompts: ['How much X-Bond do I need for 600 sq ft over concrete?'],
    checks: [lastIncludes('x-bond stone', '660', 'calculator', 'waste')],
  },
  {
    name: 'Room dimensions parse into the material count',
    prompts: ['The floor is concrete', 'My room is 20 by 30, how many bags of X-Bond do I need?'],
    checks: [lastIncludes('600 sq ft', 'x-bond stone')],
  },
  {
    name: 'Quantity flow asks area, then substrate chips, then computes',
    prompts: ['How many bags of X-Bond do I need?', '450 sq ft', 'Concrete'],
    checks: [
      (turns) => (turns[0].content.includes('area') ? null : 'turn 1 should ask for the area'),
      (turns) => (turns[1].quickReplies?.length ? null : 'turn 2 should offer substrate tap choices'),
      lastIncludes('450 sq ft', 'x-bond stone', 'calculator'),
    ],
  },
  {
    name: 'Liquid per bag mixing math',
    prompts: ['How much liquid do I mix with one bag of X-Bond?'],
    checks: [lastIncludes('2 gallons', '50 lb bag')],
  },
  {
    name: 'Liquid scales linearly for three bags',
    prompts: ['How much liquid do I need to mix 3 bags of X-Bond?'],
    checks: [lastIncludes('6 gallons')],
  },
  {
    name: 'Finish coat mix ratio',
    prompts: ["What's the mix ratio for the finish coat?"],
    checks: [lastIncludes('2 1/2 parts', '180-200 rpm')],
  },
  {
    name: 'Tint formula for Sunny Lemon per gallon',
    prompts: ["What's the tint formula for Sunny Lemon?"],
    checks: [lastIncludes('titanium white', '262 ml', 'cured sample')],
  },
  {
    name: 'Tint formula scales to the official 5-gallon batch',
    prompts: ['Tint formula for 2001P for 5 gallons'],
    checks: [lastIncludes('sunny lemon', '1.31 l')],
  },
  {
    name: 'Glossary explains efflorescence in plain words',
    prompts: ['What does efflorescence mean?'],
    checks: [lastIncludes('white', 'clean')],
  },
  {
    name: 'Glossary explains substrate for learners',
    prompts: ['What is a substrate?'],
    checks: [lastIncludes('surface')],
  },
];

async function main() {
  const failures: string[] = [];

  for (const scenario of SCENARIOS) {
    const history: ConversationMessage[] = [];
    const turns: SimulatedTurn[] = [];

    for (const prompt of scenario.prompts) {
      const turn = await simulateTurn(history, prompt);
      turns.push(turn);
      history.push(makeMessage('user', prompt));
      history.push(makeMessage('assistant', turn.content));
    }

    const checks = [...scenario.checks, noOcr, noAnswerPrefix];
    const errors = checks.map((check) => check(turns)).filter((value): value is string => Boolean(value));

    const status = errors.length ? 'FAIL' : 'ok';
    console.log(`\n[${status}] ${scenario.name}`);
    turns.forEach((turn, index) => {
      console.log(`  Q${index + 1}: ${scenario.prompts[index]}`);
      console.log(`  A${index + 1} (${turn.provider}${turn.quickReplies?.length ? `, ${turn.quickReplies.length} tap choices` : ''}): ${turn.content.replace(/\n+/g, ' | ').slice(0, 240)}`);
    });
    errors.forEach((error) => {
      console.log(`  !! ${error}`);
      failures.push(`${scenario.name}: ${error}`);
    });
  }

  console.log(`\n${SCENARIOS.length - new Set(failures.map((f) => f.split(':')[0])).size}/${SCENARIOS.length} scenarios passed`);
  if (failures.length) {
    console.error(`\n${failures.length} check(s) failed`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

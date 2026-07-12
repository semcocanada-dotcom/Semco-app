import type { ConversationMessage } from '@/database/schema/conversations';

/**
 * Deterministic job-context tracking for Ask Semco.
 *
 * The assistant must understand follow-up questions from the active chat:
 * substrate, application, exposure, system, and finish are extracted from the
 * installer's recent messages and merged newest-wins, so "Then what do I do
 * for finish coats?" keeps pointing at the same job. Everything here is
 * keyword-driven and works offline — no AI call required.
 */

export type JobSubstrate =
  | 'concrete'
  | 'tile'
  | 'plywood_osb'
  | 'glasroc_board'
  | 'drywall'
  | 'metal'
  | 'icf'
  | 'pool_shell'
  | 'unknown';

export type JobApplication =
  | 'floor'
  | 'wall'
  | 'shower'
  | 'pool'
  | 'pond'
  | 'deck'
  | 'exterior'
  | 'interior'
  | 'countertop'
  | 'unknown';

export type JobExposure = 'dry' | 'wet' | 'submerged' | 'exterior' | 'steam' | 'unknown';
export type JobSystem = 'x_bond' | 'liquid_membrane' | 'microbond' | 'sealer_only' | 'unknown';
export type JobFinish = 'satin_stone' | 'natural_shield' | 'titan_gloss' | 'matte' | 'unknown';

export interface AssistantJobContext {
  substrate: JobSubstrate;
  application: JobApplication;
  exposure: JobExposure;
  system: JobSystem;
  finish: JobFinish;
  missingInputs: string[];
}

export interface ClarifyingPrompt {
  content: string;
  quickReplies: string[];
}

const MAX_CONTEXT_USER_MESSAGES = 6;

// Longer phrases first so "concrete board" resolves to board, not concrete.
const SUBSTRATE_TERMS: { value: Exclude<JobSubstrate, 'unknown'>; terms: string[] }[] = [
  { value: 'glasroc_board', terms: ['glasroc', 'glassroc', 'glaseroc', 'glass roc', 'cement board', 'backer board', 'concrete board', 'concrete panel', 'wet-area board', 'wet area board', 'densshield'] },
  { value: 'plywood_osb', terms: ['plywood', 'osb', 'wood deck', 'wood subfloor', 'wooden'] },
  { value: 'tile', terms: ['existing tile', 'tile', 'ceramic', 'porcelain', 'grouted'] },
  { value: 'drywall', terms: ['painted drywall', 'drywall', 'gypsum', 'wallboard', 'gyp board'] },
  { value: 'metal', terms: ['metal', 'steel', 'aluminum', 'aluminium'] },
  { value: 'icf', terms: ['icf', 'insulated concrete form'] },
  { value: 'pool_shell', terms: ['pool shell', 'gunite', 'shotcrete', 'concrete pool', 'concrete pond'] },
  { value: 'concrete', terms: ['concrete', 'slab', 'cement'] },
];

const APPLICATION_TERMS: { value: Exclude<JobApplication, 'unknown'>; terms: string[] }[] = [
  { value: 'shower', terms: ['steam shower', 'shower', 'wet room', 'wetroom'] },
  { value: 'pool', terms: ['pool', 'jacuzzi', 'hot tub'] },
  { value: 'pond', terms: ['pond', 'fountain', 'water feature'] },
  { value: 'deck', terms: ['deck'] },
  { value: 'countertop', terms: ['countertop', 'counter top', 'vanity top', 'counters'] },
  { value: 'wall', terms: ['wall'] },
  { value: 'floor', terms: ['floor', 'flooring'] },
  { value: 'exterior', terms: ['exterior', 'outside', 'outdoor'] },
  { value: 'interior', terms: ['interior', 'indoor', 'inside'] },
];

const EXPOSURE_TERMS: { value: Exclude<JobExposure, 'unknown'>; terms: string[] }[] = [
  { value: 'submerged', terms: ['submerged', 'underwater', 'under water', 'holding water', 'holds water', 'water containment', 'pool', 'pond', 'fountain', 'jacuzzi'] },
  { value: 'steam', terms: ['steam shower', 'steam room'] },
  { value: 'wet', terms: ['shower', 'wet room', 'wetroom', 'wet area', 'waterproof', 'bathroom'] },
  { value: 'exterior', terms: ['exterior', 'outside', 'outdoor'] },
];

const SYSTEM_TERMS: { value: Exclude<JobSystem, 'unknown'>; terms: string[] }[] = [
  { value: 'x_bond', terms: ['x-bond', 'xbond', 'x bond', 'seamless stone'] },
  { value: 'microbond', terms: ['microbond', 'micro bond', 'micro-bond'] },
  { value: 'liquid_membrane', terms: ['liquid membrane', 'membrane finish'] },
  { value: 'sealer_only', terms: ['sealer only', 'just seal', 'only sealing', 'reseal only'] },
];

const FINISH_TERMS: { value: Exclude<JobFinish, 'unknown'>; terms: string[] }[] = [
  { value: 'satin_stone', terms: ['satin stone'] },
  { value: 'natural_shield', terms: ['natural shield'] },
  { value: 'titan_gloss', terms: ['titan gloss', 'titan shield', 'high gloss'] },
  { value: 'matte', terms: ['matte'] },
];

const SUBSTRATE_LABELS: Record<Exclude<JobSubstrate, 'unknown'>, string> = {
  concrete: 'concrete',
  tile: 'existing tile',
  plywood_osb: 'plywood/OSB',
  glasroc_board: 'GlasRoc or similar wet-area board',
  drywall: 'drywall',
  metal: 'metal',
  icf: 'ICF',
  pool_shell: 'concrete pool shell',
};

const SYSTEM_LABELS: Record<Exclude<JobSystem, 'unknown'>, string> = {
  x_bond: 'X-Bond Seamless Stone',
  liquid_membrane: 'SEMCO Liquid Membrane',
  microbond: 'MicroBond smooth finish',
  sealer_only: 'sealer only',
};

const FINISH_LABELS: Record<Exclude<JobFinish, 'unknown'>, string> = {
  satin_stone: 'Satin Stone',
  natural_shield: 'Natural Shield',
  titan_gloss: 'Titan Gloss',
  matte: 'Matte',
};

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9/-\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Remove corrected values before matching so "pond not floor" and
 * "the finish is Liquid Membrane not X-Bond" keep only what the
 * installer actually confirmed.
 */
function stripNegatedTerms(normalized: string): string {
  return normalized
    .replace(/\b(?:not|isn t|isnt|no longer|instead of|rather than)\s+(?:a\s|an\s|the\s)?[\w/-]+(?:\s[\w/-]+)?/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function matchTerm<T extends string>(normalized: string, table: { value: T; terms: string[] }[]): T | undefined {
  for (const entry of table) {
    if (entry.terms.some((term) => normalized.includes(term))) return entry.value;
  }
  return undefined;
}

export function extractJobContext(history: ConversationMessage[], currentMessage: string): AssistantJobContext {
  // Only installer turns carry job facts. Assistant answers enumerate
  // options ("concrete, GlasRoc, plywood/OSB, or tile?"), which would
  // pollute every dimension if matched.
  const userTexts = history
    .filter((message) => message.role === 'user')
    .slice(-MAX_CONTEXT_USER_MESSAGES)
    .map((message) => message.content);
  userTexts.push(currentMessage);

  const context: AssistantJobContext = {
    substrate: 'unknown',
    application: 'unknown',
    exposure: 'unknown',
    system: 'unknown',
    finish: 'unknown',
    missingInputs: [],
  };

  // Oldest to newest so the most recent statement (including corrections)
  // wins each dimension.
  for (const text of userTexts) {
    const normalized = stripNegatedTerms(normalize(text));
    if (!normalized) continue;

    const substrate = matchTerm(normalized, SUBSTRATE_TERMS);
    const application = matchTerm(normalized, APPLICATION_TERMS);
    const exposure = matchTerm(normalized, EXPOSURE_TERMS);
    const system = matchTerm(normalized, SYSTEM_TERMS);
    const finish = matchTerm(normalized, FINISH_TERMS);

    if (substrate) context.substrate = substrate;
    if (application) context.application = application;
    if (exposure) context.exposure = exposure;
    if (system) context.system = system;
    if (finish) context.finish = finish;
  }

  // Cheap derivations that do not invent facts.
  if (context.exposure === 'unknown') {
    if (context.application === 'pool' || context.application === 'pond') context.exposure = 'submerged';
    else if (context.application === 'shower') context.exposure = 'wet';
    else if (context.application === 'exterior') context.exposure = 'exterior';
  }
  if (context.substrate === 'unknown' && (context.application === 'pool' || context.application === 'pond')) {
    // Most pool/pond questions are about concrete shells, but we only note
    // it as missing rather than assuming.
  }

  context.missingInputs = findMissingContextInputs(context);
  return context;
}

function findMissingContextInputs(context: AssistantJobContext): string[] {
  const missing: string[] = [];
  if (context.substrate === 'unknown') missing.push('substrate');
  if (context.exposure === 'unknown' && ['shower', 'pool', 'pond', 'deck', 'exterior'].includes(context.application)) {
    missing.push('exposure');
  }
  return missing;
}

export function hasJobFacts(context: AssistantJobContext): boolean {
  return context.substrate !== 'unknown'
    || context.application !== 'unknown'
    || context.exposure !== 'unknown'
    || context.system !== 'unknown'
    || context.finish !== 'unknown';
}

/**
 * Compact fact line understood by both the retrieval layer and the
 * keyword-based reasoning rules, so follow-up questions inherit the job.
 */
export function formatJobContextLine(context: AssistantJobContext): string {
  const parts: string[] = [];
  if (context.substrate !== 'unknown') parts.push(`substrate is ${SUBSTRATE_LABELS[context.substrate]}`);
  if (context.application !== 'unknown') parts.push(`application is ${context.application}`);
  if (context.exposure !== 'unknown') {
    parts.push(context.exposure === 'submerged' ? 'exposure is submerged/underwater' : `exposure is ${context.exposure}`);
  }
  if (context.system !== 'unknown') parts.push(`system is ${SYSTEM_LABELS[context.system]}`);
  if (context.finish !== 'unknown') parts.push(`finish is ${FINISH_LABELS[context.finish]}`);
  return parts.length ? `Known job context: ${parts.join('; ')}.` : '';
}

const PROCEDURE_WORDS = [
  'procedure',
  'process',
  'steps',
  'step by step',
  'start to finish',
  'how do i',
  'how do we',
  'how to',
  'install',
  'installation',
  'apply',
  'application',
  'go over',
  'build up',
  'build-up',
  'walk me through',
];

const GENERIC_SYSTEM_WORDS = ['the finish', 'the coating', 'the material', 'the system', 'do this', 'this product', 'semco stuff', 'which product', 'what product', 'what system', 'which system'];

function isProcedureAsk(normalized: string): boolean {
  return PROCEDURE_WORDS.some((word) => normalized.includes(word));
}

/**
 * One short practical question with tap choices, per the field rules:
 * substrate first, then exposure, then system. Returns null when the
 * conversation already carries the needed facts.
 */
export function buildClarifyingQuestion(
  context: AssistantJobContext,
  currentMessage: string,
): ClarifyingPrompt | null {
  const normalized = normalize(currentMessage);
  const procedure = isProcedureAsk(normalized);

  if (procedure && context.substrate === 'unknown') {
    if (context.application === 'shower') {
      return {
        content: 'Before I give the steps, what is the shower substrate?\n\nConcrete/board, GlasRoc or similar wet-area board, plywood/OSB, or existing tile?',
        quickReplies: ['Concrete or concrete board', 'GlasRoc or similar wet-area board', 'Plywood / OSB', 'Existing tile'],
      };
    }
    if (context.application === 'deck') {
      return {
        content: 'Before I give the steps, what is the deck substrate?\n\nPlywood/OSB, concrete, or an existing coated surface?',
        quickReplies: ['Plywood / OSB', 'Concrete', 'Existing coating or tile'],
      };
    }
    return {
      content: 'Before I give the steps, what substrate is this going over?\n\nConcrete, existing tile, plywood/OSB, or GlasRoc/similar board?',
      quickReplies: ['Concrete', 'Existing tile', 'Plywood / OSB', 'GlasRoc or similar board'],
    };
  }

  if (
    context.substrate !== 'unknown'
    && context.exposure === 'unknown'
    && (procedure || normalized.includes('waterproof'))
    && ['pool', 'pond', 'deck', 'exterior', 'unknown'].includes(context.application)
    && /\b(waterproof|wet|water|exterior|outside|outdoor)\b/.test(normalized)
  ) {
    return {
      content: 'One thing first: what is the water exposure for this area?\n\nInterior dry, shower/wet area, submerged/holds water, or exterior?',
      quickReplies: ['Interior dry area', 'Shower / wet area', 'Submerged / holds water', 'Exterior / outdoors'],
    };
  }

  if (
    context.system === 'unknown'
    && context.finish === 'unknown'
    && GENERIC_SYSTEM_WORDS.some((word) => normalized.includes(word))
  ) {
    return {
      content: 'Which Semco system is this question about?\n\nX-Bond Seamless Stone, Liquid Membrane, MicroBond smooth finish, or sealer only?',
      quickReplies: ['X-Bond Seamless Stone', 'Liquid Membrane', 'MicroBond smooth finish', 'Sealer only'],
    };
  }

  return null;
}

/**
 * Small set of tappable next questions after a real answer. These are sent
 * as normal messages, so they must read like installer questions.
 */
export function buildSuggestedFollowUps(intent: string, context: AssistantJobContext): string[] {
  const followUps: string[] = [];

  if (['install_build_up', 'prep_decision', 'shower_substrate', 'x_bond_finish', 'liquid_membrane_application'].includes(intent)) {
    if (context.finish === 'unknown' && intent !== 'liquid_membrane_application') {
      followUps.push('What sealer do I use for this?');
    }
    followUps.push('What materials do I need for this job?');
    followUps.push('What photos are needed for warranty?');
  } else if (intent === 'sealer_application') {
    followUps.push('How many coats do I apply?');
    followUps.push('What photos are needed for warranty?');
  } else if (['material_estimate', 'membrane_quantity'].includes(intent)) {
    followUps.push('Show me the prep steps first');
    followUps.push('What photos are needed for warranty?');
  } else if (intent === 'warranty_photos') {
    followUps.push('What photos block warranty if missing?');
  } else {
    followUps.push('Show me the full field sequence');
    followUps.push('What photos are needed for warranty?');
  }

  return followUps.slice(0, 3);
}

/**
 * Builds the retrieval/reasoning question for the current turn. Follow-up
 * turns inherit a compact job-context line plus the recent exchange so the
 * downstream keyword rules and retrieval see the whole job, not just the
 * fragment the installer typed.
 */
export function resolveContextualQuestion(
  userMessage: string,
  history: ConversationMessage[],
  context: AssistantJobContext,
): string {
  const clean = userMessage.replace(/\s+/g, ' ').trim();
  if (!clean) return clean;

  const contextMessages = getRecentConversationContext(history);
  if (contextMessages.length === 0) return clean;

  const contextText = contextMessages.join('\n');
  if (!shouldUseConversationContext(clean, contextText)) return clean;

  const jobContextLine = formatJobContextLine(context);

  return [
    'Conversation context for this installer question:',
    jobContextLine,
    contextMessages.join('\n'),
    `Follow-up question: ${redactPrivateText(clean)}`,
  ].filter(Boolean).join('\n');
}

function getRecentConversationContext(history: ConversationMessage[]): string[] {
  return history
    .slice(-6)
    .map((message) => {
      const role = message.role === 'assistant' ? 'Semco answer' : 'Installer';
      const content = truncate(redactPrivateText(message.content), message.role === 'assistant' ? 320 : 220);
      return content ? `${role}: ${content}` : '';
    })
    .filter(Boolean);
}

function shouldUseConversationContext(message: string, contextText: string): boolean {
  const normalized = message.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ').trim();
  const words = normalized.split(' ').filter(Boolean);
  if (words.length === 0) return false;

  const hasOwnSubstrate = /\b(concrete|tile|plywood|osb|wood|metal|drywall|gypsum|pool|pond|fountain|water containment|underwater|submerged|shower|icf|block|cmu|x-bond|xbond)\b/.test(normalized);
  const explicitContinuation = /^(what about|and then|then|after that|afterwards|next|what next|also|from there|once that)\b/.test(normalized);
  if (explicitContinuation) return true;

  const referencesPriorContext = /\b(it|that|this|those|there|same|previous|above|before|after|next|continue|finish|coats?|step|steps|stage|system|process|sequence|build-up|build up|detail|details)\b/.test(normalized);
  const asksForContinuation = /\b(what now|what do i do|what would i do|where do i go|how do i continue|how to continue|what is next|next step|next steps|more detail|more detailed|need more detail|explain more|walk me through|break it down|expand on)\b/.test(normalized);
  const productOnlyQuestion = /\b(xbond|x-bond|x bond|microbond|micro bond|liquid membrane|brown coat|sealer|finish coat|finish coats|top coat|primer)\b/.test(normalized)
    && !hasOwnSubstrate;
  const contextHasJobFacts = /\b(concrete|tile|plywood|osb|wood|deck|metal|drywall|gypsum|pool|pond|fountain|water containment|underwater|shower|icf|block|cmu|exterior|outside|submerged|wet|x-bond|xbond|liquid membrane)\b/i.test(contextText);

  if (hasOwnSubstrate && !referencesPriorContext && !asksForContinuation) return false;

  return contextHasJobFacts && (
    referencesPriorContext
    || asksForContinuation
    || productOnlyQuestion
    || words.length <= 8
  );
}

export function redactPrivateText(text: string): string {
  return text
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted email]')
    .replace(/\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, '[redacted phone]')
    .replace(/\b\d{2,6}\s+[A-Za-z0-9.'-]+(?:\s+[A-Za-z0-9.'-]+){0,5}\s+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Court|Ct|Place|Pl|Way)\b/gi, '[redacted address]')
    .trim();
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
}

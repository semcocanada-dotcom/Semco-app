import type { ManualKnowledgeHit } from './manual-knowledge';

export interface FieldAnswer {
  content: string;
  confidence: 'high' | 'medium';
}

type FieldRule = {
  matches: string[];
  content: string;
  confidence: FieldAnswer['confidence'];
};

const FIELD_RULES: FieldRule[] = [
  {
    matches: ['does every system use liquid membrane', 'all systems use liquid membrane', 'use membrane', 'need liquid membrane'],
    confidence: 'high',
    content: [
      'Answer: For the app calculator, treat Liquid Membrane as included by default in the X-Bond system.',
      '',
      'Do this:',
      '- Keep Liquid Membrane in the estimate for X-Bond assemblies.',
      '- Use the standard field rate for normal work.',
      '- Switch to the wet-area/pool rate only for pool, submerged, or continuous-water exposure.',
      '',
      'Watch out:',
      '- Cleaner prep is not always an order quantity; it depends on the substrate condition.',
      '',
      'Source: X-Bond, shower, tile, wood, cove, drain, and pool detail sheets in the Semco docs.',
    ].join('\n'),
  },
  {
    matches: ['membrane coverage', 'how much membrane', 'how much liquid membrane', 'liquid membrane coverage', 'lm coverage'],
    confidence: 'high',
    content: [
      'Answer: Standard Liquid Membrane uses the field rate of **over 1000 sq ft per 5 gal pail**.',
      '',
      'Do this:',
      '- For normal non-submerged work, estimate **200-250 sq ft/gal**.',
      '- If the calculated need is under 5 gal, stage **1 x 5 gal pail**.',
      '- Pool/submerged work is different: use the heavier wet-area rate in the calculator.',
      '',
      'Watch out:',
      '- Do not use the submerged rate for ordinary dry/non-submerged X-Bond work.',
      '',
      'Source: Semco installer field rate; pool exception from Pool Resurfacing Detail.',
    ].join('\n'),
  },
  {
    matches: ['cleaner', 'cleaners', 'prep', 'prepare substrate', 'surface prep', 'stone soap', 'power cleaner', 'nu-lift', 'nu lift'],
    confidence: 'high',
    content: [
      'Answer: Prep cleaner depends on what is on the surface, not just the area size.',
      '',
      'Do this:',
      '- Concrete or drywall: Stone Soap standard wash; add Power Cleaner only for grease, oil, wax, glue, paint, or coating residue.',
      '- Tile or pool: Nu-Lift when mineral, calcium, efflorescence, or pool residue is present; finish with Stone Soap wash.',
      '- Metal: Power Cleaner if there is oil, grease, or shop residue; confirm adhesion.',
      '- Wood / plywood / OSB: secure the surface, then Liquid Membrane and fabric before X-Bond.',
      '',
      'Source: SIP surface prep Type A, B, C, D, and E.',
    ].join('\n'),
  },
  {
    matches: ['x-bond coverage', 'xbond coverage', 'x bond coverage', 'x-bond stone', 'xbond stone', 'bags'],
    confidence: 'high',
    content: [
      'Answer: Use **75 sq ft finished per 50 lb bag** for X-Bond Stone.',
      '',
      'Do this:',
      '- Estimate bags from finished square footage, then round up.',
      '- X-Bond Liquid is tied to the stone mix at **2 gal liquid per 50 lb bag**.',
      '- That equals about **37.5 sq ft/gal** of X-Bond Liquid for the X-Bond Stone mix.',
      '',
      'Source: Semco installer field rate and X-Bond data sheet mix basis.',
    ].join('\n'),
  },
  {
    matches: ['microbond', 'micro bond', 'smooth finish'],
    confidence: 'high',
    content: [
      'Answer: MicroBond smooth finish is optional and uses about **1 pail per 1000 sq ft**.',
      '',
      'Do this:',
      '- Use MicroBond only when the installer wants the smoother finish option.',
      '- For one 5 gal / 30 lb MicroBond pail, stage about **2.5 gal X-Bond Liquid**.',
      '- The mix basis is **1 part X-Bond Liquid to 2 parts MicroBond Stone**.',
      '',
      'Source: SIP MicroBond mix ratio plus Semco installer field pail rate.',
    ].join('\n'),
  },
  {
    matches: ['takeoff', 'take off', 'blueprint', 'blueprints', 'plans'],
    confidence: 'high',
    content: [
      'Answer: This app should not call it Takeoff unless it reads plans or blueprints.',
      '',
      'Do this:',
      '- Use Calculator for manual square-foot material estimates.',
      '- Use project photos/docs for field records.',
      '- Add blueprint takeoff later only if the app can read plan files and measure scope.',
      '',
      'Source: App behavior rule from the Semco installer workflow.',
    ].join('\n'),
  },
];

export function buildFieldAnswer(message: string, manualHits: ManualKnowledgeHit[] = []): FieldAnswer | null {
  const normalized = normalize(message);
  if (!normalized) return null;

  const matchedRule = FIELD_RULES.find((rule) =>
    rule.matches.some((phrase) => normalized.includes(normalize(phrase))),
  );

  if (!matchedRule) return null;

  const sourceLine = buildSourceLine(manualHits);
  return {
    content: sourceLine ? `${matchedRule.content}\n${sourceLine}` : matchedRule.content,
    confidence: matchedRule.confidence,
  };
}

export function buildContextFieldNotes(message: string, manualHits: ManualKnowledgeHit[] = []): string {
  return buildFieldAnswer(message, manualHits)?.content ?? '';
}

function buildSourceLine(hits: ManualKnowledgeHit[]): string {
  if (hits.length === 0) return '';

  const top = hits[0];
  return `\nClosest doc match: ${top.title}, p. ${top.pageNumber} (${top.sourceDocument}).`;
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

import type { SubstrateId } from '@/constants/substrates';
import { SUBSTRATE_MAP } from '@/constants/substrates';
import { STOCKED_SEALER_POLICY_TEXT } from '@/constants/stocked-sealers';
import type { ManualKnowledgeHit } from './manual-knowledge';

type ReasoningIntent =
  | 'material_estimate'
  | 'membrane_quantity'
  | 'prep_decision'
  | 'install_build_up'
  | 'warranty_photos'
  | 'takeoff_scope'
  | 'technical_question';

interface ExtractedJobFacts {
  areaSqft?: number;
  substrateType?: SubstrateId;
  sealerSku?: string;
  wantsMicroBond: boolean;
  isSubmerged: boolean;
}

export interface ReasoningProfile {
  intent: ReasoningIntent;
  facts: ExtractedJobFacts;
  assumptions: string[];
  missingInputs: string[];
  localAnswer?: string;
  contextNotes: string;
}

const SUBSTRATE_ALIASES: { id: SubstrateId; terms: string[] }[] = [
  { id: 'concrete', terms: ['concrete', 'slab', 'cement'] },
  { id: 'plywood', terms: ['plywood', 'osb', 'wood'] },
  { id: 'icf', terms: ['icf', 'insulated concrete form'] },
  { id: 'metal', terms: ['metal', 'steel', 'aluminum', 'aluminium'] },
  { id: 'existing_tile', terms: ['tile', 'ceramic', 'porcelain', 'grout'] },
  { id: 'gypsum_board', terms: ['drywall', 'gypsum', 'wallboard'] },
  { id: 'pool', terms: ['pool', 'jacuzzi', 'submerged', 'under water', 'underwater'] },
  { id: 'concrete_block', terms: ['block', 'cmu'] },
  { id: 'cement_board', terms: ['cement board', 'backer board'] },
  { id: 'existing_paint', terms: ['paint', 'coating', 'epoxy'] },
  { id: 'heated_floor', terms: ['heated floor', 'radiant floor'] },
];

export function buildReasoningProfile(message: string, manualHits: ManualKnowledgeHit[] = []): ReasoningProfile {
  const normalized = normalize(message);
  const intent = detectIntent(normalized);
  const facts = extractFacts(normalized);
  const assumptions = buildAssumptions(intent, facts);
  const missingInputs = findMissingInputs(intent, facts);
  const localAnswer = buildLocalAnswer(intent, facts, assumptions, missingInputs);
  const contextNotes = buildContextNotes(intent, facts, assumptions, missingInputs, manualHits, localAnswer);

  return {
    intent,
    facts,
    assumptions,
    missingInputs,
    localAnswer,
    contextNotes,
  };
}

export function formatReasoningContext(profile: ReasoningProfile): string {
  return profile.contextNotes
    ? `<semco_reasoning>\n${profile.contextNotes}\n</semco_reasoning>`
    : '';
}

function detectIntent(normalized: string): ReasoningIntent {
  if (
    hasAny(normalized, ['warranty photo', 'warranty photos', 'photos for warranty', 'qualify for warranty']) ||
    (normalized.includes('warranty') && hasAny(normalized, ['photo', 'photos', 'picture', 'pictures']))
  ) {
    return 'warranty_photos';
  }
  if (hasAny(normalized, ['takeoff', 'take off', 'blueprint', 'blueprints', 'plans'])) {
    return 'takeoff_scope';
  }
  if (hasAny(normalized, ['cleaner', 'cleaners', 'surface prep', 'prepare substrate', 'prep ', 'stone soap', 'power cleaner', 'nu lift', 'nu-lift'])) {
    return 'prep_decision';
  }
  if (
    hasAny(normalized, ['install over', 'go over', 'apply over', 'over tile', 'over plywood', 'over concrete', 'system build', 'build up', 'layers', 'assembly']) ||
    (hasAny(normalized, ['can i', 'can we', 'should i', 'should we', 'how do i', 'how to']) && extractSubstrate(normalized))
  ) {
    return 'install_build_up';
  }
  if (hasAny(normalized, ['liquid membrane', 'membrane coverage', 'how much membrane', 'lm coverage'])) {
    return 'membrane_quantity';
  }
  if (hasAny(normalized, ['how much', 'calculate', 'calculator', 'estimate', 'coverage', 'bags', 'gallons', 'material', 'materials', 'order', 'quantity'])) {
    return 'material_estimate';
  }
  return 'technical_question';
}

function extractFacts(normalized: string): ExtractedJobFacts {
  return {
    areaSqft: extractAreaSqft(normalized),
    substrateType: extractSubstrate(normalized),
    sealerSku: extractSealerSku(normalized),
    wantsMicroBond: hasAny(normalized, ['microbond', 'micro bond', 'smooth finish']),
    isSubmerged: hasAny(normalized, ['pool', 'submerged', 'under water', 'underwater', 'jacuzzi']),
  };
}

function extractAreaSqft(normalized: string): number | undefined {
  const direct = normalized.match(/(\d+(?:\.\d+)?)\s*(?:sq\s*ft|sqft|square\s*feet|ft2|sf)\b/);
  if (direct?.[1]) return Number(direct[1]);

  const compact = normalized.match(/(\d+(?:\.\d+)?)\s*(?:square\s*foot|square\s*feet)/);
  if (compact?.[1]) return Number(compact[1]);

  return undefined;
}

function extractSubstrate(normalized: string): SubstrateId | undefined {
  return SUBSTRATE_ALIASES.find((entry) => entry.terms.some((term) => normalized.includes(term)))?.id;
}

function extractSealerSku(normalized: string): string | undefined {
  if (hasAny(normalized, ['natural shield', 'natural sealer'])) return 'NATURAL-SHIELD';
  if (hasAny(normalized, ['titan shield', 'gloss sealer', 'high gloss'])) return 'TITAN-SHIELD';
  if (hasAny(normalized, ['satin stone', 'satin sealer'])) return 'SATIN-STONE';
  if (hasAny(normalized, ['matte sealer', 'matte finish', 'matte'])) return 'MATTE-SEALER';
  return undefined;
}

function buildAssumptions(intent: ReasoningIntent, facts: ExtractedJobFacts): string[] {
  const assumptions: string[] = [];

  if (intent === 'material_estimate') {
    assumptions.push('Material quantities are calculated by the built-in Calculator, not by Ask Semco.');
  }

  if (facts.isSubmerged) {
    assumptions.push('Pool/submerged conditions use Natural Shield as the current stocked penetrating sealer and should be selected in the Calculator.');
  }

  if (facts.wantsMicroBond) {
    assumptions.push('MicroBond/smooth finish should be selected in the Calculator when quantities are needed.');
  }

  return assumptions;
}

function findMissingInputs(intent: ReasoningIntent, facts: ExtractedJobFacts): string[] {
  const missing: string[] = [];

  if (intent === 'material_estimate') {
    if (!facts.areaSqft) missing.push('area in sq ft');
    if (!facts.substrateType) missing.push('substrate');
  }

  if (intent === 'prep_decision' && !facts.substrateType) {
    missing.push('substrate');
    missing.push('surface condition: grease/oil, mineral residue, paint/coating, or clean');
  }

  if (intent === 'install_build_up' && !facts.substrateType) {
    missing.push('substrate');
  }

  return missing;
}

function buildLocalAnswer(
  intent: ReasoningIntent,
  facts: ExtractedJobFacts,
  assumptions: string[],
  missingInputs: string[],
): string | undefined {
  if (intent === 'warranty_photos') return warrantyPhotoAnswer();
  if (intent === 'takeoff_scope') return takeoffAnswer();
  if (intent === 'prep_decision') return prepAnswer(facts, missingInputs);
  if (intent === 'install_build_up') return installBuildUpAnswer(facts, missingInputs);
  if (intent === 'membrane_quantity') return membraneAnswer(facts);
  if (intent === 'material_estimate') return materialEstimateAnswer(facts, assumptions, missingInputs);
  return undefined;
}

function materialEstimateAnswer(
  facts: ExtractedJobFacts,
  assumptions: string[],
  missingInputs: string[],
): string {
  return [
    'Answer: Use the Calculator for material quantities. Ask Semco should help with install decisions, prep, troubleshooting, warranty photos, and product-use questions.',
    '',
    'Why:',
    '- Material counts must come from the built-in formulas so every installer gets the same result.',
    '- The AI should not guess quantities or override the Calculator.',
    '',
    'For the Calculator, enter:',
    '- area in sq ft',
    '- substrate',
    '- sealer',
    '- standard X-Bond or MicroBond smooth finish',
    '- pool/submerged if applicable',
    missingInputs.length ? '' : '',
    missingInputs.length ? 'Still needed:' : '',
    ...missingInputs.map((item) => `- ${item}`),
    assumptions.length ? '' : '',
    assumptions.length ? 'Rule:' : '',
    ...assumptions.map((item) => `- ${item}`),
  ].filter((line) => line !== '').join('\n');
}

function membraneAnswer(facts: ExtractedJobFacts): string {
  const areaLine = facts.areaSqft
    ? `For ${formatNumber(facts.areaSqft)} sq ft, enter the area in the Calculator and let the formula choose the purchase quantity.`
    : 'Enter the area in sq ft in the Calculator to get the purchase quantity.';

  if (!facts.areaSqft) {
    return [
      'Answer: Use the Calculator for Liquid Membrane quantity.',
      '',
      'Install rule:',
      '- Normal work and pool/submerged work use different membrane assumptions.',
      '- Pool/submerged work must be selected as the substrate/condition.',
      '- The app formula handles the quantity and purchase rounding.',
      '',
      'Need:',
      '- area in sq ft',
      '- whether it is normal work or pool/submerged',
    ].join('\n');
  }

  return [
    'Answer: Use the Calculator for Liquid Membrane quantity.',
    '',
    areaLine,
    '',
    'Install rule:',
    '- Normal work and pool/submerged work use different membrane assumptions.',
    '- Pool/submerged work must be selected as the substrate/condition.',
    '- Ask Semco can explain where membrane is needed, but quantities come from the Calculator.',
  ].join('\n');
}

function prepAnswer(facts: ExtractedJobFacts, missingInputs: string[]): string {
  if (missingInputs.length > 0 || !facts.substrateType) {
    return [
      'Answer: Prep depends on substrate and contamination, not just square footage.',
      '',
      'Decision rule:',
      '- Clean concrete/drywall: Stone Soap standard wash.',
      '- Grease, oil, wax, glue, paint, or coating residue: add Power Cleaner.',
      '- Tile, pool residue, calcium, mineral, alkali, or efflorescence: Nu-Lift, then Stone Soap final wash.',
      '- Wood / plywood / OSB: secure the surface, then Liquid Membrane and fabric before X-Bond.',
      '',
      'Need:',
      '- substrate',
      '- visible contamination or residue',
    ].join('\n');
  }

  const recommendations: Record<SubstrateId, string[]> = {
    concrete: ['Stone Soap standard wash.', 'Add Power Cleaner only if grease, oil, wax, glue, paint, or coating residue is present.'],
    plywood: ['Secure the wood first.', 'Use Liquid Membrane and fabric before X-Bond; cleaner quantity is not the main prep item.'],
    icf: ['Stone Soap standard wash.', 'Add Nu-Lift only if mineral/efflorescence contamination is visible.'],
    metal: ['Power Cleaner if oil, grease, or shop residue is present.', 'Confirm profile and adhesion before coating.'],
    existing_tile: ['Use Nu-Lift if mineral residue, calcium, alkali, or efflorescence is present.', 'Finish with Stone Soap final wash.', 'Fill grout lines flush before coating.'],
    gypsum_board: ['Stone Soap standard wash if needed.', 'Drywall is walls only; do not use it as a floor substrate.'],
    pool: ['Use Nu-Lift when calcium, mineral, efflorescence, or pool residue is present.', 'Finish with Stone Soap final wash.', 'Use wet-area Liquid Membrane rate.', 'Use Natural Shield as the current stocked penetrating sealer for submerged/pool work.'],
    concrete_block: ['Stone Soap standard wash.', 'Use Nu-Lift for mineral/efflorescence contamination.'],
    cement_board: ['Stone Soap standard wash.', 'Treat joints and wet-area risk before coating.'],
    existing_paint: ['Power Cleaner if coating residue is questionable.', 'Confirm adhesion before coating.'],
    heated_floor: ['Stone Soap standard wash.', 'Confirm heat is off and substrate is stable before coating.'],
  };

  const substrateLabel = SUBSTRATE_MAP[facts.substrateType]?.label ?? facts.substrateType;
  return [
    `Answer: For ${substrateLabel}, use this prep path.`,
    '',
    'Do this:',
    ...recommendations[facts.substrateType].map((item) => `- ${item}`),
    '',
    'Reason:',
    '- Cleaner choice follows the contamination risk.',
    '- Warranty and adhesion risk are higher when prep photos or residue checks are missing.',
  ].join('\n');
}

function warrantyPhotoAnswer(): string {
  return [
    'Answer: Warranty review needs photos from every required stage.',
    '',
    'Required photos:',
    '- Substrate / Prep',
    '- Liquid Membrane / Primer',
    '- Scratch / Base Coat',
    '- Finish Coat',
    '- Sealer Applied',
    '- Final / Handover',
    '',
    'Logic:',
    '- One clear photo per stage proves the installation sequence.',
    '- Missing stages mean the project is not photo-qualified for warranty yet.',
  ].join('\n');
}

function installBuildUpAnswer(facts: ExtractedJobFacts, missingInputs: string[]): string {
  if (missingInputs.length > 0 || !facts.substrateType) {
    return [
      'Answer: I need the substrate before I can give the Semco build-up.',
      '',
      'Tell me one of these:',
      '- concrete',
      '- plywood / OSB',
      '- tile',
      '- drywall',
      '- pool / submerged',
      '- metal',
      '',
      'Rule: Ask Semco should not approve an assembly without knowing what it is going over.',
    ].join('\n');
  }

  const substrateLabel = SUBSTRATE_MAP[facts.substrateType]?.label ?? facts.substrateType;
  const buildUps: Record<SubstrateId, string[]> = {
    concrete: [
      'Confirm the concrete is sound, clean, profiled, and dry enough for coating.',
      'Apply X-Bond scratch coat.',
      'Use Liquid Membrane with fabric at joints, cracks, drains, corners, and movement-risk areas.',
      'Apply the second scratch/base coat, optional brown coat if needed, then the selected X-Bond finish.',
      'Finish with the specified Semco sealer.',
    ],
    plywood: [
      'Confirm the plywood / OSB is structural, fastened, stable, and not flexing.',
      'Treat joints first.',
      'Apply Liquid Membrane, embed fabric reinforcement over joints, then apply the second Liquid Membrane coat.',
      'Continue with the X-Bond scratch/base coat and finish system.',
      'Do not treat loose or moving wood like concrete.',
    ],
    icf: [
      'Confirm the ICF surface is clean, stable, and suitable for coating.',
      'Use the X-Bond wall build-up selected for the project.',
      'Use Liquid Membrane where the detail, exposure, joints, or water risk calls for it.',
      'Finish with the specified X-Bond texture and Semco sealer.',
    ],
    metal: [
      'Do not approve metal by assumption.',
      'Remove oil, grease, mill residue, and loose coating first.',
      'Confirm surface profile and adhesion before coating.',
      'Use Semco review if the metal is structural, exterior, wet, or high movement.',
    ],
    existing_tile: [
      'Only go over tile that is bonded solid and not hollow, cracked, loose, or moving.',
      'Clean mineral/calcium residue with Nu-Lift when present, then Stone Soap final wash.',
      'Fill grout lines flush.',
      'Apply X-Bond scratch coat, Liquid Membrane with fabric reinforcement, second scratch/base coat, optional brown coat, selected X-Bond finish, then sealer.',
    ],
    gypsum_board: [
      'Drywall is for walls only; do not use it as a floor substrate.',
      'Confirm the board is stable, dry, and properly fastened.',
      'Use the wall build-up specified for the project and protect wet areas with the correct membrane detail.',
    ],
    pool: [
      'Treat this as submerged/wet-area work, not a normal floor.',
      'Confirm the shell is sound and all calcium/mineral residue is handled before coating.',
      'Use the pool/wet-area Liquid Membrane build-up and select Pool in the Calculator for any quantities.',
      'Use Natural Shield as the current stocked penetrating sealer for pool/submerged work.',
      'Capture stage photos because warranty risk is higher in submerged work.',
    ],
    concrete_block: [
      'Confirm block/CMU is sound, clean, and free of mineral or efflorescence contamination.',
      'Use Nu-Lift where mineral residue is present, then Stone Soap final wash.',
      'Use the specified wall build-up and Liquid Membrane where water or movement risk requires it.',
    ],
    cement_board: [
      'Confirm the board is properly fastened and joints are treated.',
      'Use Liquid Membrane and fabric at joints/corners in wet or movement-risk areas.',
      'Continue with the specified X-Bond build-up and sealer.',
    ],
    existing_paint: [
      'Do not coat over paint unless adhesion is confirmed.',
      'Remove loose coating and clean bond-breaking residue.',
      'Use Semco review when the existing coating type is unknown.',
    ],
    heated_floor: [
      'Confirm the heated floor is stable and the heat is off during application and cure.',
      'Treat movement joints carefully.',
      'Use the specified X-Bond build-up and Liquid Membrane where movement risk requires it.',
    ],
  };

  return [
    `Answer: For ${substrateLabel}, follow the Semco build-up and do not skip prep or photo documentation.`,
    '',
    'Do this:',
    ...buildUps[facts.substrateType].map((item) => `- ${item}`),
    '',
    'Watch out:',
    '- If the substrate is loose, moving, contaminated, or wet beyond the system limit, stop and get Semco review.',
    '- For warranty, capture photos at prep, membrane/primer, base, finish, sealer, and final handover.',
  ].join('\n');
}

function takeoffAnswer(): string {
  return [
    'Answer: Takeoff should mean blueprint/plan reading, not manual material estimating.',
    '',
    'Use this instead:',
    '- Calculator: manual sq ft material estimate.',
    '- Projects: photos, batches, warranty records.',
    '- Future Takeoff: only add it when the app can read drawings and measure scope.',
  ].join('\n');
}

function buildContextNotes(
  intent: ReasoningIntent,
  facts: ExtractedJobFacts,
  assumptions: string[],
  missingInputs: string[],
  manualHits: ManualKnowledgeHit[],
  localAnswer?: string,
): string {
  const source = manualHits[0]
    ? `${manualHits[0].title}, p. ${manualHits[0].pageNumber} (${manualHits[0].sourceDocument})`
    : 'No direct technical-doc match.';

  return [
    `Intent: ${intent}`,
    `Known facts: ${formatFacts(facts)}`,
    `Missing inputs: ${missingInputs.length ? missingInputs.join(', ') : 'none'}`,
    `Assumptions: ${assumptions.length ? assumptions.join(' | ') : 'none'}`,
    `Closest source: ${source}`,
    `Current stocked sealer rule:\n${STOCKED_SEALER_POLICY_TEXT}`,
    localAnswer ? `Local reasoned answer:\n${localAnswer}` : '',
    'Instruction: answer like a field support conversation. Use the facts and logic above; do not paste source excerpts unless needed. Do not calculate material quantities unless a verified Calculator result is explicitly provided.',
  ]
    .filter(Boolean)
    .join('\n');
}

function formatFacts(facts: ExtractedJobFacts): string {
  const parts = [
    facts.areaSqft ? `area=${formatNumber(facts.areaSqft)} sq ft` : null,
    facts.substrateType ? `substrate=${facts.substrateType}` : null,
    facts.sealerSku ? `sealer=${facts.sealerSku}` : null,
    facts.wantsMicroBond ? 'finish=MicroBond smooth' : null,
    facts.isSubmerged ? 'condition=submerged/pool' : null,
  ].filter(Boolean);

  return parts.length ? parts.join(', ') : 'none';
}

function hasAny(value: string, terms: string[]): boolean {
  return terms.some((term) => value.includes(term));
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s.-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatNumber(value: number): string {
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(1);
}

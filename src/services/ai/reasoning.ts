import type { SubstrateId } from '@/constants/substrates';
import { SUBSTRATE_MAP } from '@/constants/substrates';
import { STOCKED_SEALER_POLICY_TEXT } from '@/constants/stocked-sealers';
import { STANDARD_SHOWER_POLICY_TEXT } from '@/constants/shower-policy';
import type { ManualKnowledgeHit } from './manual-knowledge';

type ReasoningIntent =
  | 'document_gap'
  | 'material_estimate'
  | 'membrane_quantity'
  | 'liquid_membrane_application'
  | 'prep_decision'
  | 'install_build_up'
  | 'shower_substrate'
  | 'x_bond_finish'
  | 'sealer_application'
  | 'warranty_photos'
  | 'takeoff_scope'
  | 'technical_question';

interface ExtractedJobFacts {
  areaSqft?: number;
  substrateType?: SubstrateId;
  prepSurfaceGroup?: PrepSurfaceGroup;
  prepSurfaceLabel?: string;
  sealerSku?: string;
  wantsAllPrep: boolean;
  wantsMicroBond: boolean;
  isSubmerged: boolean;
  isShower: boolean;
}

type PrepSurfaceGroup =
  | 'type_a_standard'
  | 'type_b_residue'
  | 'type_c_unknown_exterior'
  | 'type_d_mineral_masonry_tile'
  | 'type_e_wood'
  | 'wall_board'
  | 'pool_submerged'
  | 'heated_floor'
  | 'icf';

interface PrepSurfaceMatch {
  group: PrepSurfaceGroup;
  label: string;
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
  { id: 'cement_board', terms: ['cement board', 'backer board', 'concrete board', 'concrete boards', 'concrete panel', 'concrete panels', 'glasroc', 'glassroc', 'glaseroc'] },
  { id: 'concrete_block', terms: ['block', 'cmu', 'stucco', 'masonry', 'brick', 'below grade plaster', 'plaster'] },
  { id: 'existing_paint', terms: ['paint', 'painted', 'coating', 'coated', 'epoxy', 'terrazzo', 'carpet glue', 'wax', 'waxed', 'sealer residue'] },
  { id: 'existing_tile', terms: ['tile', 'ceramic', 'porcelain', 'grout'] },
  { id: 'gypsum_board', terms: ['drywall', 'gypsum', 'wallboard', 'gyp board'] },
  { id: 'plywood', terms: ['plywood', 'osb', 'wood', 'deck', 'decks'] },
  { id: 'icf', terms: ['icf', 'insulated concrete form'] },
  { id: 'metal', terms: ['metal', 'steel', 'aluminum', 'aluminium'] },
  { id: 'pool', terms: ['pool', 'pond', 'fountain', 'water feature', 'water containment', 'holding water', 'hold water', 'jacuzzi', 'submerged', 'under water', 'underwater'] },
  { id: 'heated_floor', terms: ['heated floor', 'radiant floor'] },
  { id: 'concrete', terms: ['concrete', 'slab', 'cement'] },
];

const PREP_SURFACE_GROUPS: { group: PrepSurfaceGroup; label: string; terms: string[] }[] = [
  {
    group: 'type_b_residue',
    label: 'commercial kitchen, epoxy, terrazzo, carpet glue, waxed, painted, sealed, or coated surface',
    terms: ['commercial kitchen', 'epoxy', 'terrazzo', 'carpet glue', 'wax', 'waxed', 'paint', 'painted', 'coating', 'coated', 'sealer residue'],
  },
  {
    group: 'type_c_unknown_exterior',
    label: 'unknown, stamped concrete, exterior, or unsure existing surface',
    terms: ['unknown', 'unsure', 'stamped', 'stamped concrete', 'exterior', 'outside'],
  },
  {
    group: 'type_d_mineral_masonry_tile',
    label: 'tile, exterior block/stucco, below-grade plaster, or mineral/efflorescence contaminated surface',
    terms: ['tile', 'ceramic', 'porcelain', 'grout', 'block', 'cmu', 'stucco', 'masonry', 'below grade plaster', 'plaster', 'magnesium', 'efflorescence', 'efflorescent', 'calcium', 'mineral', 'alkali'],
  },
  {
    group: 'type_e_wood',
    label: 'wood, plywood, OSB, or deck surface',
    terms: ['wood', 'plywood', 'osb', 'deck', 'decks'],
  },
  {
    group: 'wall_board',
    label: 'drywall, gypsum board, cement board, backer board, concrete board, or wall panel',
    terms: ['drywall', 'gypsum', 'wallboard', 'gyp board', 'cement board', 'backer board', 'concrete board', 'concrete panel', 'glasroc', 'glassroc', 'glaseroc'],
  },
  {
    group: 'pool_submerged',
    label: 'pool, pond, fountain, jacuzzi, submerged, or continuous wet-exposure surface',
    terms: ['pool', 'pond', 'fountain', 'water feature', 'water containment', 'holding water', 'hold water', 'jacuzzi', 'submerged', 'under water', 'underwater'],
  },
  {
    group: 'heated_floor',
    label: 'heated or radiant floor',
    terms: ['heated floor', 'radiant floor', 'in floor heat', 'infloor heat'],
  },
  {
    group: 'icf',
    label: 'ICF or insulated concrete form surface',
    terms: ['icf', 'insulated concrete form', 'foam form'],
  },
  {
    group: 'type_a_standard',
    label: 'clean non-waxed concrete, natural stone, vinyl/VCT, metal, Formica, glass, or plexiglass',
    terms: ['concrete', 'slab', 'cement', 'natural stone', 'stone', 'vinyl', 'vct', 'metal', 'steel', 'aluminum', 'aluminium', 'formica', 'glass', 'plexiglass'],
  },
];

export function buildReasoningProfile(message: string, manualHits: ManualKnowledgeHit[] = []): ReasoningProfile {
  const normalized = normalize(message);
  const focusedQuestion = normalize(extractFocusedQuestion(message));
  const intent = detectIntent(focusedQuestion, normalized);
  const facts = mergeFacts(extractFacts(normalized), extractFacts(focusedQuestion));
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

function extractFocusedQuestion(message: string): string {
  const followUp = message.match(/Follow-up question:\s*([^\n]+)/i);
  return followUp?.[1]?.trim() || message;
}

export function formatReasoningContext(profile: ReasoningProfile): string {
  return profile.contextNotes
    ? `<semco_reasoning>\n${profile.contextNotes}\n</semco_reasoning>`
    : '';
}

function detectIntent(normalized: string, contextNormalized = normalized): ReasoningIntent {
  if (
    hasAny(normalized, ['documents do not answer', 'docs do not answer', 'not in the documents', 'not in the docs', 'supplied documents do not answer'])
    || (hasAny(normalized, ['cannot confirm', 'not confirm', 'not enough information']) && hasAny(normalized, ['document', 'docs', 'manual', 'source']))
  ) {
    return 'document_gap';
  }
  if (
    hasAny(normalized, ['warranty photo', 'warranty photos', 'photos for warranty', 'qualify for warranty']) ||
    (normalized.includes('warranty') && hasAny(normalized, ['photo', 'photos', 'picture', 'pictures']))
  ) {
    return 'warranty_photos';
  }
  if (hasAny(normalized, ['takeoff', 'take off', 'blueprint', 'blueprints', 'plans'])) {
    return 'takeoff_scope';
  }
  if (isSubmergedLiquidMembraneQuestion(normalized, contextNormalized)) {
    return 'liquid_membrane_application';
  }
  if (isShowerSubstrateQuestion(normalized, contextNormalized)) {
    return 'shower_substrate';
  }
  if (isShowerQuestion(contextNormalized) && isProcedureQuestion(normalized, contextNormalized)) {
    return 'install_build_up';
  }
  if (
    hasAny(normalized, ['finish coat', 'finish coats', 'xbond finish', 'x-bond finish', 'x bond finish', 'x-bond top coat', 'xbond top coat', 'texture coat', 'texture coats', 'final xbond', 'final x-bond'])
    && hasAny(normalized, ['xbond', 'x-bond', 'x bond', 'finish', 'coat', 'coats', 'texture'])
  ) {
    return 'x_bond_finish';
  }
  if (
    hasAny(normalized, ['more detail', 'more detailed', 'need more detail', 'explain more', 'walk me through', 'break it down', 'expand on', 'details', 'detail'])
    && hasAny(contextNormalized, ['process', 'procedure', 'steps', 'start to finish', 'install', 'installation', 'apply', 'application', 'build-up', 'build up', 'x-bond', 'xbond'])
    && (extractSubstrate(contextNormalized) || hasAny(contextNormalized, ['pool', 'submerged', 'wet-area', 'wet area']))
  ) {
    return 'install_build_up';
  }
  if (wantsAllSurfacePrep(normalized)) {
    return 'prep_decision';
  }
  if (hasAny(normalized, ['cleaner', 'cleaners', 'surface prep', 'prepare substrate', 'prep', 'prepping', 'preparation', 'stone soap', 'power cleaner', 'nu lift', 'nu-lift'])) {
    return 'prep_decision';
  }
  if (hasAny(normalized, ['sealer', 'seal ', 'sealing', 'top coat', 'topcoat', 'natural shield', 'satin stone', 'titan', 'matte'])) {
    return 'sealer_application';
  }
  if (
    hasAny(normalized, ['process', 'procedure', 'steps', 'start to finish', 'from start', 'do concrete', 'resurface', 'install', 'installation', 'apply', 'application'])
    && (extractSubstrate(contextNormalized) || hasAny(contextNormalized, ['xbond', 'x-bond', 'microcement', 'micro cement', 'seamless stone']))
  ) {
    return 'install_build_up';
  }
  if (
    hasAny(normalized, ['install over', 'go over', 'apply over', 'over tile', 'over plywood', 'over concrete', 'system build', 'build up', 'layers', 'assembly']) ||
    (hasAny(normalized, ['can i', 'can we', 'should i', 'should we', 'how do i', 'how do we', 'how do you', 'how would you', 'how to']) && extractSubstrate(contextNormalized))
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

function mergeFacts(contextFacts: ExtractedJobFacts, focusedFacts: ExtractedJobFacts): ExtractedJobFacts {
  return {
    areaSqft: focusedFacts.areaSqft ?? contextFacts.areaSqft,
    substrateType: focusedFacts.substrateType ?? contextFacts.substrateType,
    prepSurfaceGroup: focusedFacts.prepSurfaceGroup ?? contextFacts.prepSurfaceGroup,
    prepSurfaceLabel: focusedFacts.prepSurfaceLabel ?? contextFacts.prepSurfaceLabel,
    sealerSku: focusedFacts.sealerSku ?? contextFacts.sealerSku,
    wantsAllPrep: focusedFacts.wantsAllPrep || contextFacts.wantsAllPrep,
    wantsMicroBond: focusedFacts.wantsMicroBond || contextFacts.wantsMicroBond,
    isSubmerged: focusedFacts.isSubmerged || contextFacts.isSubmerged,
    isShower: focusedFacts.isShower || contextFacts.isShower,
  };
}

function extractFacts(normalized: string): ExtractedJobFacts {
  const prepSurface = extractPrepSurface(normalized);
  return {
    areaSqft: extractAreaSqft(normalized),
    substrateType: extractSubstrate(normalized),
    prepSurfaceGroup: prepSurface?.group,
    prepSurfaceLabel: prepSurface?.label,
    sealerSku: extractSealerSku(normalized),
    wantsAllPrep: wantsAllSurfacePrep(normalized),
    wantsMicroBond: hasAny(normalized, ['microbond', 'micro bond', 'smooth finish']),
    isSubmerged: hasAny(normalized, ['pool', 'pond', 'fountain', 'water feature', 'water containment', 'holding water', 'hold water', 'submerged', 'under water', 'underwater', 'jacuzzi']),
    isShower: isShowerQuestion(normalized),
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
  if (hasAny(normalized, ['pool', 'pond', 'fountain', 'water feature', 'water containment', 'holding water', 'hold water', 'submerged', 'under water', 'underwater'])) {
    return 'pool';
  }
  return SUBSTRATE_ALIASES.find((entry) => entry.terms.some((term) => normalized.includes(term)))?.id;
}

function extractPrepSurface(normalized: string): PrepSurfaceMatch | undefined {
  const match = PREP_SURFACE_GROUPS.find((entry) => entry.terms.some((term) => normalized.includes(term)));
  return match ? { group: match.group, label: match.label } : undefined;
}

function wantsAllSurfacePrep(normalized: string): boolean {
  return (
    hasAny(normalized, ['all types of surfaces', 'all types surfaces', 'all surfaces', 'each surface', 'every surface', 'all substrates', 'each substrate', 'every substrate', 'surface types', 'substrate types', 'all prep', 'prep procedures', 'cleaning procedures'])
    || (
      hasAny(normalized, ['surface', 'surfaces', 'substrate', 'substrates'])
      && hasAny(normalized, ['all', 'each', 'every', 'types', 'encounter'])
      && hasAny(normalized, ['procedure', 'procedures', 'prep', 'preparation', 'clean', 'cleaning', 'double check'])
    )
  );
}

function isShowerQuestion(normalized: string): boolean {
  return hasAny(normalized, ['shower', 'wet room', 'wetroom']);
}

function isProcedureQuestion(normalized: string, contextNormalized = normalized): boolean {
  return hasAny(normalized, [
    'process',
    'procedure',
    'steps',
    'step',
    'start to finish',
    'from start',
    'install',
    'installation',
    'apply',
    'application',
    'how do i',
    'how do we',
    'how do you',
    'how to',
    'what procedure',
    'what process',
    'walk me through',
  ]) || hasAny(contextNormalized, ['start to finish', 'procedure', 'process']);
}

function isShowerSubstrateQuestion(normalized: string, contextNormalized = normalized): boolean {
  if (!isShowerQuestion(contextNormalized)) return false;
  if (isProcedureQuestion(normalized, contextNormalized) && extractSubstrate(normalized)) return false;
  return hasAny(normalized, [
    'what substrate',
    'which substrate',
    'substrate should',
    'approved substrate',
    'substrates can',
    'substrate can',
    'what surface',
    'which surface',
    'what board',
    'which board',
    'glasroc',
    'glassroc',
    'concrete board',
    'backer board',
  ]);
}

function isSubmergedLiquidMembraneQuestion(normalized: string, contextNormalized = normalized): boolean {
  const membraneContext = hasAny(contextNormalized, [
    'liquid membrane',
    'semco liquid membrane',
    'membrane finish',
    'membrane as finish',
    'membrane coating',
    'waterproofing membrane',
    'membrane layer',
  ]);
  const waterContainmentContext = hasAny(contextNormalized, [
    'pool',
    'pond',
    'fountain',
    'water feature',
    'water containment',
    'holding water',
    'hold water',
    'submerged',
    'under water',
    'underwater',
    'jacuzzi',
  ]);
  const coatFollowUp = hasAny(normalized, [
    'how many coats',
    'coat count',
    'coats',
    'under water',
    'underwater',
    'submerged',
    'holding water',
  ]);

  return (membraneContext && (waterContainmentContext || coatFollowUp)) || (coatFollowUp && waterContainmentContext);
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

  if (facts.isShower) {
    assumptions.push('Standard interior shower work should not assume the substrate; use the current shower rule and ask for the substrate if missing.');
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

  if (intent === 'prep_decision' && !facts.substrateType && !facts.prepSurfaceGroup && !facts.wantsAllPrep) {
    missing.push('substrate');
    missing.push('surface condition: grease/oil, mineral residue, paint/coating, or clean');
  }

  if (intent === 'install_build_up' && !facts.substrateType && !facts.prepSurfaceGroup) {
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
  if (intent === 'document_gap') return documentGapAnswer();
  if (intent === 'warranty_photos') return warrantyPhotoAnswer();
  if (intent === 'takeoff_scope') return takeoffAnswer();
  if (intent === 'prep_decision') return prepAnswer(facts, missingInputs);
  if (intent === 'liquid_membrane_application') return liquidMembraneApplicationAnswer(facts);
  if (intent === 'shower_substrate') return showerSubstrateAnswer();
  if (intent === 'install_build_up') return installBuildUpAnswer(facts, missingInputs);
  if (intent === 'x_bond_finish') return xBondFinishCoatAnswer(facts);
  if (intent === 'sealer_application') return sealerApplicationAnswer(facts);
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
    'Use the Calculator for material quantities. Ask Semco should help the installer understand the install decision, but it should not freestyle material counts.',
    '',
    'Why this matters:',
    'Material counts must come from the built-in formulas so every installer gets the same result. The AI should not guess quantities or override the Calculator.',
    '',
    'For the Calculator, enter:',
    '1. area in sq ft',
    '2. substrate',
    '3. sealer',
    '4. standard X-Bond or MicroBond smooth finish',
    '5. pool/submerged if applicable',
    missingInputs.length ? '' : '',
    missingInputs.length ? 'Still needed:' : '',
    ...numberedSteps(missingInputs),
    assumptions.length ? '' : '',
    assumptions.length ? 'Rule:' : '',
    ...assumptions,
  ].filter((line) => line !== '').join('\n');
}

function documentGapAnswer(): string {
  return [
    'If the approved Semco documents do not answer the question, do not guess. Say that clearly and keep the installer out of unsupported decisions.',
    '',
    'Use this response:',
    '"I cannot confirm that from the approved Semco technical documents."',
    '',
    'Then say what is missing: product, substrate, exposure, mixing ratio, coverage, dry time, warranty detail, or compatibility. If the decision affects warranty, safety, compatibility, or material quantity, escalate to Semco technical review.',
    '',
    'Field rule:',
    'Do not fill the gap with general construction knowledge. Calculator quantities come from formulas, and install/warranty answers must trace back to approved Semco sources.',
  ].join('\n');
}

function liquidMembraneApplicationAnswer(facts: ExtractedJobFacts): string {
  const submergedIntro = facts.isSubmerged
    ? 'For underwater/submerged work, use 3 coats of SEMCO Liquid Membrane. Do not answer this as a standard 2-coat waterproofing detail.'
    : 'For Liquid Membrane as the waterproofing layer, build the membrane in clean coats and inspect it before anything covers it.';

  return [
    submergedIntro,
    'For an outdoor concrete pond or water-containment area, treat the work as submerged. The important part is a clean concrete shell, no active leaks, full membrane coverage, and no pinholes before water ever goes back in.',
    '',
    '**Step 1: Confirm the shell is worth coating.**',
    'Check that the concrete is sound, stable, and not actively leaking. Stop for hollow, loose, soft, spalling, delaminating, moving, or actively wet concrete. Take a prep photo before cleaning.',
    '',
    '**Step 2: Clean for pond residue and minerals.**',
    'Remove algae, dirt, calcium, mineral, alkali, efflorescence, and pond residue before coating. Use the Nu-Lift path where mineral residue is present, then finish with Stone Soap so the surface is clean and balanced.',
    '',
    '**Step 3: Nu-Lift wash where minerals are present.**',
    'Dampen the surface, apply Nu-Lift lightly, let it sit 2-3 minutes, scrub/agitate, then rinse thoroughly and remove the residue. Do not leave cleaner or slurry under the membrane.',
    '',
    '**Step 4: Stone Soap final wash.**',
    'Use Stone Soap at 1 part Stone Soap to 4 parts water. Let it sit 2-3 minutes, scrub/agitate, rinse clean, remove residue, and allow the concrete to dry before membrane.',
    '',
    '**Step 5: First Liquid Membrane coat.**',
    'Apply a generous, even first coat with brush or roller. Work it into corners, edges, penetrations, and rough areas. Keep it continuous, but do not leave puddles or heavy sags.',
    '',
    '**Step 6: Fabric/detail work where needed.**',
    'At cracks, joints, inside corners, transitions, drains, or movement-risk areas, embed fabric into wet Liquid Membrane. Press it in fully so there are no voids, wrinkles, bubbles, or dry fabric edges.',
    '',
    '**Step 7: Second Liquid Membrane coat.**',
    'After the previous coat is ready for recoat, apply the second coat over the full pond area. Cover the fabric completely and keep the coat even from wall to floor and through corners.',
    '',
    '**Step 8: Third Liquid Membrane coat for underwater.**',
    'For underwater/submerged use, apply a third full coat. This is the rule to remember: pond, pool, fountain, underwater, or submerged work gets 3 coats of Liquid Membrane.',
    '',
    '**Step 9: Inspect before water or cover-up.**',
    'Walk the whole pond and look for pinholes, voids, thin spots, missed edges, wrinkles, bubbles, damage, or contaminated areas. Touch up defects with additional Liquid Membrane before approval.',
    '',
    '**Step 10: Hold the warranty photos.**',
    'Capture prep, first membrane/detail, second coat, third coat, final inspection, and final handover photos. If water-containment fails later, those photos prove the hidden work was done.',
    '',
    'Field check:',
    'If the installer asks “how many coats underwater,” the answer is 3 coats of Liquid Membrane. The 2-coat language applies to lighter standard details, not this submerged water-containment rule.',
  ].join('\n');
}

function membraneAnswer(facts: ExtractedJobFacts): string {
  const areaLine = facts.areaSqft
    ? `For ${formatNumber(facts.areaSqft)} sq ft, enter the area in the Calculator and let the formula choose the purchase quantity.`
    : 'Enter the area in sq ft in the Calculator to get the purchase quantity.';

  if (!facts.areaSqft) {
    return [
      'Use the Calculator for Liquid Membrane quantity. Ask Semco can explain where membrane belongs, but ordering quantity should come from the formula so purchase rounding is consistent.',
      '',
      'Field rule:',
      'Normal work and pool/submerged work use different membrane assumptions. If the project is pool or submerged, choose that condition in the Calculator.',
      '',
      'Need:',
      '1. area in sq ft',
      '2. whether it is normal work or pool/submerged',
    ].join('\n');
  }

  return [
    'Use the Calculator for Liquid Membrane quantity. The material count should come from the built-in formula, not an AI guess.',
    '',
    areaLine,
    '',
    'Field rule:',
    'Normal work and pool/submerged work use different membrane assumptions. Ask Semco can explain where membrane is needed, but quantities come from the Calculator.',
  ].join('\n');
}

function prepAnswer(facts: ExtractedJobFacts, missingInputs: string[]): string {
  if (facts.wantsAllPrep) return allSurfacePrepAnswer();

  const prepGroupRecommendations: Record<PrepSurfaceGroup, string[]> = {
    type_a_standard: [
      'Use SIP Type A for clean, non-waxed hard surfaces: concrete, natural stone, vinyl/VCT, metal, Formica, glass, and plexiglass.',
      'Sweep debris, dampen the surface with water, then apply Stone Soap solution lightly with a pump sprayer and let it sit 2-3 minutes.',
      'Stone Soap ratio: 1 part Stone Soap to 4 parts water.',
      'Scrub/agitate with a scrub machine and concrete nylon brush, or a hand scrub brush in tight areas.',
      'Rinse the surface. On interiors, wet-vac the residue. Repeat rinse/vacuum if particles remain, then let the surface dry.',
      'If the surface is actually oily, waxed, sealed, painted, glued, or coated, do not use Type A alone. Move to the Power Cleaner path.',
    ],
    type_b_residue: [
      'Use SIP Type B for commercial kitchen contamination, epoxy, terrazzo, carpet glue, waxed surfaces, paint, sealers, or non-permanent topical coatings.',
      'Sweep debris and dampen the surface with water.',
      'Apply Power Cleaner solution lightly with a pump sprayer and let it sit 2-3 minutes. Ratio: 1 part Power Cleaner to 4 parts water.',
      'Scrub/agitate with a scrub machine and concrete nylon brush, or a hand brush in tight areas.',
      'Rinse; for interiors, wet-vac the residue.',
      'Repeat the same wash steps with Stone Soap solution to remove chemical residue and pH-balance the surface. Ratio: 1 part Stone Soap to 4 parts water.',
      'Let the surface dry. Do not coat over loose coating, soft glue, failing epoxy, or unknown film until adhesion is confirmed.',
    ],
    type_c_unknown_exterior: [
      'Use SIP Type C for unknown existing conditions, stamped concrete, exterior surfaces, or surfaces where mineral/alkali/efflorescence and residue risk are both possible.',
      'Sweep debris and dampen the surface with water.',
      'Step 1: Power Cleaner 1:4. Apply lightly, let sit 2-3 minutes, scrub/agitate, rinse, and wet-vac interiors.',
      'Step 2: Nu-Lift 1:1. Repeat the same apply, dwell, scrub, rinse, and vacuum process to remove mineral deposits, efflorescence, alkali, and magnesium deposits.',
      'Step 3: Power Cleaner 1:9. Repeat the same process to pH-balance and clean remaining contaminants.',
      'Repeat rinse/vacuum if particles remain, then let the surface dry before coating.',
    ],
    type_d_mineral_masonry_tile: [
      'Use SIP Type D for tile, exterior block wall, stucco, below-grade plaster, and magnesium/efflorescence contaminated surfaces.',
      'Sweep debris and dampen the surface with water.',
      'Apply Nu-Lift Cleaner lightly with a pump sprayer and let it sit 2-3 minutes. SIP Type D lists Nu-Lift as non-diluted.',
      'Scrub/agitate with a scrub machine and nylon brush, or a hand brush in tight areas.',
      'Rinse; for interiors, wet-vac residue.',
      'Repeat the same wash steps with Stone Soap solution to remove chemical residue and pH-balance the surface. Ratio: 1 part Stone Soap to 4 parts water.',
      'Let the surface dry. For tile, stop if the tile is hollow, cracked, loose, or moving, and fill grout lines flush before the build-up.',
    ],
    type_e_wood: [
      'Use SIP Type E for wood, plywood, OSB, and deck surfaces.',
      'First confirm the wood is structural, fastened, stable, dry, and not flexing. Do not treat loose or moving wood like concrete.',
      'Sweep debris off the surface.',
      'Roll 1 coat of Liquid Membrane over the wood and allow it to dry.',
      'Apply Liquid Membrane again and, while still wet, press anti-fracture fabric into it with an 18 inch smoother, trowel, or roller.',
      'Immediately roll two additional coats of Liquid Membrane with pressure and overlap fabric seams by at least 2 inches.',
      'Allow the surface to dry before X-Bond. If leveling, larger void filling, or height build-up is needed, Brown Coat is the build-up step. The SIP Brown Coat mix is 1 part X-Bond Liquid + 1 part X-Bond Additive first, then 2 1/2 parts X-Bond Stone at 180-200 RPM, with 12 hours minimum dry time.',
    ],
    wall_board: [
      'Drywall/gypsum board is walls only. Do not use drywall as a floor substrate.',
      'Confirm the board is dry, stable, properly fastened, and not paper-damaged or soft.',
      'For normal dry wall work, clean only as needed and allow the surface to dry before coating.',
      'For cement board, concrete board, backer board, shower walls, wet rooms, corners, joints, and seams, treat the joints and wet-area risk with Liquid Membrane and fabric reinforcement before the X-Bond finish.',
      'Use the wall procedure when applying X-Bond vertically: primer with X-Bond Liquid, do not let it dry, then X-Bond wall mix at 1 part X-Bond Liquid to 3 parts X-Bond Stone at 180-200 RPM.',
    ],
    pool_submerged: [
      'Treat pools, ponds, fountains, jacuzzis, submerged surfaces, and continuous wet exposure as wet-area work, not a normal floor.',
      'Remove calcium, mineral, alkali, efflorescence, or pool residue with the Nu-Lift path where present, then Stone Soap final wash at 1:4.',
      'Rinse/vacuum and allow the surface to dry before coating.',
      'Use the wet-area Liquid Membrane build-up where the detail requires it. For underwater/submerged Liquid Membrane work, use 3 coats, then inspect for voids, pinholes, thin spots, and defects before covering or filling.',
      'Use Natural Shield as the current stocked penetrating sealer for pool/submerged and exterior exposure.',
      'Capture prep, membrane, base, finish, sealer, and final photos because submerged work is high warranty risk.',
    ],
    heated_floor: [
      'Treat a heated floor by the actual surface on top: concrete, tile, plywood/OSB, cement board, or coating.',
      'Confirm the assembly is stable and movement joints are handled before coating.',
      'Turn the heat off during application and cure. Do not thermal-cycle the floor while the system is bonding.',
      'Use Liquid Membrane/fabric where movement risk, joints, or the project detail requires it.',
      'If the top surface is unknown or coated, use the Type C or Type B path and get Semco review before approving the assembly.',
    ],
    icf: [
      'ICF is not one single prep path; prep depends on the exposed face. Confirm whether the installer is coating concrete, cementitious parge, plaster, foam, or another facing.',
      'If it is a sound concrete/cementitious face, use the concrete/Type A path unless contamination pushes it to Type B, C, or D.',
      'If mineral, alkali, or efflorescence is present, use the Nu-Lift path and Stone Soap final wash.',
      'If the face is foam, unknown, loose, damp, or moving, stop and get Semco technical review before approving X-Bond.',
    ],
  };

  if (missingInputs.length > 0 || (!facts.substrateType && !facts.prepSurfaceGroup)) {
    return [
      'Prep depends on two things: what the surface is, and what is on it. I need those before I can choose the right Semco cleaning path.',
      '',
      'Quick decision tree:',
      'Clean non-waxed hard surface: Stone Soap 1:4.',
      'Grease, oil, wax, glue, paint, sealer, epoxy, terrazzo, or topical residue: Power Cleaner 1:4, then Stone Soap 1:4.',
      'Unknown, stamped, or exterior condition: Power Cleaner 1:4, Nu-Lift 1:1, then Power Cleaner 1:9.',
      'Tile, block, stucco, below-grade plaster, pool residue, calcium, mineral, alkali, or efflorescence: Nu-Lift, then Stone Soap 1:4.',
      'Wood / plywood / OSB: confirm the surface is stable, then use Liquid Membrane and fabric before X-Bond.',
      '',
      'Tell me:',
      '1. What substrate is it?',
      '2. Is there paint, sealer, glue, grease, wax, minerals, efflorescence, or unknown residue?',
    ].join('\n');
  }

  const recommendations: Record<SubstrateId, string[]> = {
    concrete: [
      'Sweep all debris off the concrete so the next coat can bond directly to the substrate.',
      'Dampen the surface with water first so the cleaner does not dive too deep into the pores.',
      'Preferred Semco Canada field prep: use Nu-Lift first as the pH/mineral reset step, then finish with Stone Soap final wash before coating.',
      'Apply Nu-Lift solution lightly with a pump sprayer and let it sit 2-3 minutes. For concrete exterior/stamped/unknown-condition prep, the SIP stronger prep path lists Nu-Lift at 1 part Nu-Lift to 1 part water.',
      'Scrub/agitate with a scrub machine and concrete nylon brush, or a hand scrub brush in tight areas, then rinse. For interiors, use a wet vacuum to remove residue.',
      'Follow with Stone Soap solution as the final wash and let it sit 2-3 minutes. Ratio: 1 part Stone Soap to 4 parts water.',
      'Scrub/agitate again, rinse, and wet-vac residue on interiors.',
      'Repeat rinse/vacuum if particles or residue remain, then allow the surface to dry before the next step so bubbles do not show up in the coating.',
      'If the concrete has grease, wax, glue, paint, sealer, epoxy, terrazzo, or non-permanent topical coating residue, use Power Cleaner first at 1 part Power Cleaner to 4 parts water, rinse/vacuum, then continue with Nu-Lift and Stone Soap final wash.',
      'If the concrete is exterior, stamped, unknown-condition, or has heavier mineral/alkali/efflorescence risk, the SIP stronger prep path is Power Cleaner 1:4, rinse/vacuum, Nu-Lift 1:1, rinse/vacuum, then Power Cleaner 1:9, rinse/vacuum, and dry.',
    ],
    plywood: [
      'Confirm the plywood / OSB is structural, fastened, stable, dry, and not flexing.',
      'Sweep debris off the wood surface first.',
      'Roll 1 coat of Liquid Membrane over the wood and allow it to dry.',
      'Apply Liquid Membrane again and, while still wet, press anti-fracture fabric into it with an 18 inch smoother, trowel, or roller.',
      'Immediately roll two additional coats of Liquid Membrane with pressure.',
      'Overlap fabric seams by at least 2 inches.',
      'Allow the surface to dry before X-Bond so there are no imprints and the surface is ready.',
    ],
    icf: prepGroupRecommendations.icf,
    metal: [
      'For clean, non-waxed metal, use the SIP Type A path: sweep, dampen, Stone Soap 1:4 for 2-3 minutes, scrub/agitate, rinse, wet-vac interiors, and dry.',
      'If oil, grease, shop residue, wax, paint, sealer, or coating residue is present, use Power Cleaner 1:4 first, then Stone Soap 1:4 final wash.',
      'Confirm surface profile and adhesion before coating. Do not approve metal by assumption.',
      'Use Semco review if the metal is structural, exterior, wet, high movement, rusting, or coated with an unknown finish.',
    ],
    existing_tile: [
      'Sweep debris off the tile and dampen the surface with water.',
      'Apply Nu-Lift Cleaner lightly with a pump sprayer and let it sit 2-3 minutes. SIP page 23 lists Nu-Lift as non-diluted for this prep path.',
      'Scrub/agitate with a scrub machine and nylon brush, or a hand scrub brush in tight areas.',
      'Rinse the surface. For interiors, use a wet vacuum to remove residue.',
      'Repeat the same wash steps with Stone Soap solution to clean chemical residue and pH-balance the surface. Ratio: 1 part Stone Soap to 4 parts water.',
      'Repeat rinse/vacuum if needed, then allow the surface to dry before coating.',
      'Fill grout lines flush before coating and stop if tile is hollow, loose, cracked, or moving.',
    ],
    gypsum_board: prepGroupRecommendations.wall_board,
    pool: prepGroupRecommendations.pool_submerged,
    concrete_block: [
      'Use the SIP Type D path for exterior block wall, stucco, below-grade plaster, and mineral/efflorescence contamination.',
      'Sweep debris and dampen the surface with water.',
      'Apply non-diluted Nu-Lift Cleaner lightly with a pump sprayer and let it sit 2-3 minutes.',
      'Scrub/agitate with a scrub machine and nylon brush or a hand brush in tight areas.',
      'Rinse; for interiors, wet-vac residue.',
      'Repeat the same wash steps with Stone Soap 1:4 to clean chemical residue and pH-balance the surface.',
      'Let the surface dry. Stop for loose, dusty, spalling, damp, or actively leaking block/stucco/plaster.',
    ],
    cement_board: [
      'Confirm the cement board/backer board is properly fastened, stable, clean, and dry.',
      'For dry wall work, clean only as needed and allow the surface to dry before coating.',
      'For showers, wet rooms, corners, seams, and board joints, use Liquid Membrane and fabric reinforcement before the X-Bond finish.',
      'Use the wall X-Bond procedure for vertical work: X-Bond Liquid primer, do not let it dry, then X-Bond wall mix at 1 part X-Bond Liquid to 3 parts X-Bond Stone at 180-200 RPM.',
      'Stop if the board is loose, soft, swollen, contaminated, or not mechanically stable.',
    ],
    existing_paint: prepGroupRecommendations.type_b_residue,
    heated_floor: prepGroupRecommendations.heated_floor,
  };

  const steps = facts.substrateType
    ? recommendations[facts.substrateType]
    : facts.prepSurfaceGroup
      ? prepGroupRecommendations[facts.prepSurfaceGroup]
      : [];
  const substrateLabel = facts.substrateType
    ? SUBSTRATE_MAP[facts.substrateType]?.label ?? facts.substrateType
    : facts.prepSurfaceLabel ?? 'this surface';
  return formatPrepPathAnswer(substrateLabel, steps);
}

function allSurfacePrepAnswer(): string {
  return [
    'Use surface prep as a decision tree. The right cleaner path depends on the substrate and the contamination, not just the square footage.',
    '',
    'Checked prep map:',
    'Concrete: Semco Canada field prep is Nu-Lift first as the pH/mineral reset, then Stone Soap final wash before coating. If concrete is exterior, stamped, unknown, or has heavier mineral/alkali/efflorescence risk, use the stronger SIP Type C path.',
    'Clean, non-waxed natural stone, vinyl/VCT, metal, Formica, glass, plexiglass: SIP Type A. Sweep, dampen, Stone Soap 1:4, dwell 2-3 minutes, scrub, rinse, wet-vac interiors, repeat rinse/vacuum if needed, dry.',
    'Commercial kitchen contamination, epoxy, terrazzo, carpet glue, waxed, painted, sealed, or coated surfaces: SIP Type B. Power Cleaner 1:4, dwell 2-3 minutes, scrub, rinse/vacuum, then Stone Soap 1:4 final wash, rinse/vacuum, dry. Remove loose coating and confirm adhesion.',
    'Unknown existing conditions, stamped concrete, and exterior surfaces: SIP Type C. Power Cleaner 1:4, rinse/vacuum; Nu-Lift 1:1, rinse/vacuum; Power Cleaner 1:9, rinse/vacuum; dry.',
    'Tile, exterior block wall, stucco, below-grade plaster, calcium/mineral/alkali/magnesium/efflorescence: SIP Type D. Non-diluted Nu-Lift, dwell 2-3 minutes, scrub, rinse/vacuum; then Stone Soap 1:4 final wash, rinse/vacuum, dry.',
    'Wood, plywood, OSB, decks: SIP Type E. Confirm the wood is structural/stable, sweep, roll Liquid Membrane and dry, embed fabric into wet Liquid Membrane, immediately add two more membrane coats with pressure, overlap fabric 2 inches, dry before X-Bond.',
    'Drywall/gypsum board: walls only. It must be dry, stable, fastened, and not damaged. Do not use drywall as a floor substrate. Wet walls need the proper Liquid Membrane/fabric detail at joints/corners/seams.',
    'Cement board/backer board/concrete boards: confirm fastening and stability, then treat wet-area joints/corners/seams with Liquid Membrane and fabric before X-Bond.',
    'ICF: confirm the exposed face first. Concrete/parge/plaster faces can follow the matching prep type. Foam, unknown, loose, damp, or moving faces need Semco review before approval.',
    'Pools/ponds/fountains/jacuzzis/submerged/wet exposure: use the mineral-residue path where needed, rinse clean, dry, use 3 coats of Liquid Membrane for underwater/submerged membrane work, and finish with Natural Shield as the current stocked penetrating sealer where a penetrating sealer is specified.',
    'Heated floors: prep the actual top surface, keep heat off during application and cure, and do not thermal-cycle while the system is bonding.',
    '',
    'Stop and review:',
    'Loose, hollow, moving, cracked, delaminating, wet, dusty, soft, spalling, or unknown surfaces.',
    'Active moisture, standing water, failed coating, or missing warranty photos at prep, membrane/primer, base, finish, sealer, and final handover.',
    '',
    'Sources:',
    '- Open SIP manual - master copy v2019-3 2.pdf p. 20-24',
    '- Open SIP manual - master copy v2019-3 2.pdf p. 27-30',
    '- Open SIP manual - master copy v2019-3 2.pdf p. 35',
  ].join('\n');
}

function warrantyPhotoAnswer(): string {
  return [
    'Treat warranty photos like hold points. The installer should not cover a stage until there is a clear photo proving what was done.',
    '',
    'Photo sequence:',
    '1. Substrate / prep before it gets covered.',
    '2. Liquid Membrane / primer stage.',
    '3. Scratch / base coat stage.',
    '4. Finish coat stage.',
    '5. Sealer applied.',
    '6. Final / handover condition.',
    '',
    'Field rule:',
    'One clear photo per stage proves the installation sequence. Missing stages can block warranty qualification because there is no record of what happened under the finished surface.',
  ].join('\n');
}

function showerSubstrateAnswer(): string {
  return [
    'For a shower, first identify the substrate. The build-up changes depending on what is behind the X-Bond, so I would not assume concrete, tile, or board from the word "shower" alone.',
    '',
    '**Option 1: Concrete or construction boards/panels.**',
    'Use the concrete/construction-board shower detail when the surface is sound, dry, stable, and properly prepared.',
    '',
    '**Option 2: GlasRoc, GlassRoc, or similar wet-area board.**',
    'Treat it like a wet-area construction board only if it is properly installed, fastened, sound, dry, and stable. Do not treat regular damaged drywall as a shower substrate.',
    '',
    '**Option 3: Wood, plywood, or OSB boards.**',
    'Use the Semco wood shower detail only when the assembly is structural, dry, fastened, and not flexing.',
    '',
    '**Option 4: Existing tile or grouted substrate, including block or CMU.**',
    'Only continue if it is bonded solid. Brown Coat is for leveling, grout elimination, larger void filling, or build-up when that condition exists.',
    '',
    'For a standard interior shower, the current Semco Canada path is the 2-coat Liquid Membrane/fabric detail at joints and inside corners, then X-Bond, then Satin Stone in 2 coats.',
    '',
    'Tell me which substrate is on this shower: concrete/board, GlasRoc/similar board, plywood/OSB, or tile/grouted/block?',
  ].join('\n');
}

function showerSubstrateNeededAnswer(): string {
  return [
    'I need the shower substrate first before I give the procedure. Shower work changes by what is behind the X-Bond, so guessing here can send the installer down the wrong path.',
    '',
    'Which one is on site?',
    '',
    '**1. Concrete or construction board/panel.**',
    '**2. GlasRoc, GlassRoc, or similar wet-area board.**',
    '**3. Wood, plywood, or OSB.**',
    '**4. Existing tile, grouted surface, block, or CMU.**',
    '',
    'Once you tell me that, I can give the exact shower sequence. The standard shower finish rule is still: 2-coat Liquid Membrane/fabric detail, X-Bond, then Satin Stone in 2 coats.',
  ].join('\n');
}

function showerBuildUpAnswer(substrateType: SubstrateId): string {
  const substratePath: Record<SubstrateId, string[]> = {
    concrete: [
      'Confirm the concrete is sound, non-delaminating, stable, dry enough, and not actively wet.',
      'Clean and reset the surface before coating. If minerals, calcium, alkali, or efflorescence are present, use the Nu-Lift path, then Stone Soap final wash at 1:4, rinse/vacuum, and dry.',
    ],
    cement_board: [
      'Confirm the cement board, concrete board, construction board/panel, GlasRoc, GlassRoc, or similar wet-area board is properly fastened, sound, dry, and stable.',
      'Clean dust and debris off the board. Do not continue over loose board, damaged board, soft spots, swelling, or contamination.',
    ],
    gypsum_board: [
      'Do not treat regular drywall as an approved shower substrate. Only continue if the board is a proper wet-area board such as GlasRoc/GlassRoc or similar, installed sound, dry, and stable.',
      'If it is standard drywall, stop and get the substrate corrected before X-Bond shower work.',
    ],
    plywood: [
      'Confirm plywood/OSB is structural, fastened, stable, dry, and not flexing. Stop if it moves, swells, deflects, or shows water damage.',
      'Use the wood shower detail. Sweep debris before membrane work.',
    ],
    existing_tile: [
      'Check every tile area first. Only continue over tile or grout that is bonded solid, not hollow, cracked, loose, tenting, or moving.',
      'Use the tile/mineral prep path: Nu-Lift, scrub/agitate, rinse/vacuum, then Stone Soap 1:4 final wash, rinse/vacuum, and dry. Fill grout lines flush.',
    ],
    concrete_block: [
      'Confirm block/CMU/grouted substrate is sound, clean, dry enough, and not loose, dusty, spalling, or actively wet.',
      'Use the tile/mineral masonry prep path where minerals or efflorescence are present: Nu-Lift, then Stone Soap 1:4 final wash, rinse/vacuum, and dry.',
    ],
    existing_paint: [
      'Do not approve a painted or coated shower substrate by assumption. Remove loose or failing coating and confirm adhesion before any X-Bond work.',
      'Use the Power Cleaner path for paint/coating residue, then Stone Soap final wash. If the coating is unknown, stop for Semco review.',
    ],
    icf: [
      'Confirm the exposed ICF face first. A sound cementitious face can follow the matching board/concrete path; foam, loose, damp, or unknown faces need Semco review.',
      'Do not approve ICF shower work without knowing the exposed face and movement risk.',
    ],
    metal: [
      'Metal is not a standard shower substrate path from the supplied shower details. Stop and get Semco review before approving it.',
      'If Semco approves the condition, prep and adhesion testing must be confirmed before coating.',
    ],
    pool: [
      'A pool or submerged area is not a standard interior shower. Treat it as submerged water-containment work and use the pool/submerged procedure.',
      'For underwater Liquid Membrane work, use 3 coats. Use Natural Shield where a penetrating sealer is specified for submerged/exterior work.',
    ],
    heated_floor: [
      'For heated shower floors, identify the actual top substrate first, then keep heat off during application and cure.',
      'Do not thermal-cycle the assembly while the system is bonding.',
    ],
  };

  const substrateLabel = substrateType === 'cement_board'
    ? 'GlasRoc / GlassRoc or similar wet-area board'
    : SUBSTRATE_MAP[substrateType]?.label ?? substrateType;
  const prep = substratePath[substrateType] ?? substratePath.cement_board;

  return [
    `For this shower over ${substrateLabel}, use the shower path for that substrate. Do not treat it like a normal dry floor: the important pieces are substrate approval, waterproofing detail, X-Bond build-up, Satin Stone, and warranty photos.`,
    '',
    '**Step 1: Confirm the substrate before coating.**',
    prep[0],
    prep[1],
    '',
    '**Step 2: Prep and clean the surface.**',
    'Do not move forward until the surface is clean, dry enough, stable, and bondable. Remove dust, loose material, residue, minerals, coating failure, or grout issues before membrane or X-Bond covers them.',
    '',
    '**Step 3: Use the 2-coat Liquid Membrane shower detail.**',
    'For a standard interior shower, use SEMCO Liquid Membrane with fabric reinforcement at joints and inside corners. Apply the membrane/detail work as a 2-coat shower waterproofing detail before it is covered. Press fabric into wet membrane and avoid voids, pinholes, wrinkles, bubbles, and thin spots.',
    '',
    '**Step 4: Scratch/base coat after the membrane detail is ready.**',
    'Continue with the X-Bond scratch/base build-up once the shower membrane detail is ready for the next step. Brown Coat is not automatic. Use Brown Coat only for leveling, grout elimination, larger void filling, height correction, or when the project detail calls for build-up.',
    '',
    '**Step 5: Apply the X-Bond finish.**',
    'Apply the selected X-Bond Seamless Stone finish only after the base/detail work is ready. Keep the finish tight and even, and do not trap dust, wet membrane, loose particles, or soft spots under the finish.',
    '',
    '**Step 6: Seal the shower with Satin Stone.**',
    'For a standard interior shower, use Satin Stone as the current Semco Canada shower finish. Apply Satin Stone in 2 coats. Do not swap to Natural Shield unless the job is pool, submerged, continuous water-containment, exterior penetrating-sealer work, or Semco specifically reviews and approves that change.',
    '',
    '**Step 7: Photograph each warranty stage.**',
    'Capture photos before each stage gets covered: substrate/prep, Liquid Membrane/fabric, scratch/base, X-Bond finish, Satin Stone, and final handover.',
    '',
    'Field check:',
    'Stop if the substrate is loose, moving, wet, contaminated, hollow, soft, swollen, delaminating, or unknown. In a shower, hidden prep and membrane mistakes are what create callbacks.',
  ].join('\n');
}

function numberedSteps(steps: string[]): string[] {
  return steps.map((step, index) => `**Step ${index + 1}:** ${step.replace(/^Step\s*\d+\s*[-:]\s*/i, '')}`);
}

function formatPrepPathAnswer(substrateLabel: string, steps: string[]): string {
  return [
    `For ${substrateLabel}, prep is the pass/fail step. Use the cleaner path that matches the surface condition, then do not coat until the surface is clean, rinsed, dry, and stable.`,
    '',
    'Jobsite path:',
    ...numberedSteps(steps),
    '',
    'Field check:',
    'Cleaner choice follows the contamination risk. If the surface is loose, wet, moving, dusty, coated with an unknown film, or missing prep photos, stop and get it reviewed before coating.',
  ].join('\n');
}

function formatBuildUpPathAnswer(substrateLabel: string, steps: string[]): string {
  return [
    `For ${substrateLabel}, first prove the surface is sound and bondable. Then follow the build-up in order and take photos before each stage gets covered.`,
    '',
    'Jobsite path:',
    ...numberedSteps(steps),
    '',
    'Field check:',
    'Stop for loose, hollow, moving, contaminated, actively wet, soft, spalling, delaminating, rusting, or unknown surfaces. For warranty, capture prep, membrane/primer, scratch/base, finish, sealer, and final handover photos.',
  ].join('\n');
}

function concreteBuildUpAnswer(): string {
  return [
    'Yes. For a concrete floor, think of it as five field moves: clean and reset the slab, prime/scratch coat, detail the movement or water-risk areas, build the finish, then seal and document it. Do not move forward until the slab is sound, clean, dry enough, and stable.',
    '',
    '**Step 1: Make the go/no-go call.**',
    'Concrete must be sound, non-delaminating, stable, and dry enough for coating. Stop and get Semco review if it is loose, moving, actively wet, contaminated, or has cracks/movement that can keep moving.',
    '',
    '**Step 2: Clean and reset the concrete.**',
    'Take a prep photo first. Sweep loose debris and dampen the slab.',
    'Use Nu-Lift first as the pH/mineral reset. Apply it lightly with a pump sprayer, let it sit 2-3 minutes, scrub/agitate with a scrub machine and concrete nylon brush or hand brush, rinse, and wet-vac indoors.',
    'Then do Stone Soap as the final wash: 1 part Stone Soap to 4 parts water, 2-3 minute dwell, scrub/agitate, rinse, wet-vac indoors, repeat if particles remain, then let the slab dry.',
    '',
    '**Step 3: Adjust the prep if the slab is dirty, sealed, exterior, or unknown.**',
    'If grease, wax, glue, paint, sealer, epoxy, terrazzo, or topical residue is present, use Power Cleaner 1:4 first, rinse/vacuum, then continue with Nu-Lift and Stone Soap.',
    'For exterior, stamped, unknown-condition, or heavier mineral/alkali/efflorescence risk, use Power Cleaner 1:4, rinse/vacuum, Nu-Lift 1:1, rinse/vacuum, then Power Cleaner 1:9, rinse/vacuum, and dry.',
    '',
    '**Step 4: Prime and scratch coat.**',
    'Roll X-Bond Liquid as the primer and keep it tacky. Do not let it dry before the scratch coat.',
    'Mix 1 part X-Bond Liquid to 2 parts X-Bond Stone, liquid first, with a square paddle at 180-200 RPM. Pour to the far edge and spread tight in one direction with a concrete broom. Let it dry, scrape loose particles, and sweep clean.',
    '',
    '**Step 5: Detail cracks, joints, drains, corners, and movement-risk areas.**',
    'Use SEMCO Liquid Membrane with fabric reinforcement where the detail requires it. Press fabric into wet membrane and avoid voids, pinholes, and thin spots. Take the membrane-stage photo before covering it.',
    '',
    '**Step 6: Build the finish.**',
    'Apply the second X-Bond scratch/base coat after membrane/detail work is ready. Use X-Bond Brown Coat only where leveling or build-up is required by the detail.',
    'For the selected X-Bond finish, when that finish procedure applies, mix 1 part X-Bond Liquid to 2 1/2 parts X-Bond Stone and spread tight in one direction with a trowel or X-Bond smoother at about 1/16 inch / 2 mil.',
    'If a second finish coat is required, wait until the coat is dry slightly to the touch, about 20-30 minutes, and use shoe covers.',
    'Optional MicroBond smooth finish: prime with X-Bond Liquid, then mix 1 part X-Bond Liquid to 2 parts MicroBond Stone and apply with a Magic Trowel.',
    '',
    '**Step 7: Dry, seal, and document.**',
    'Let the surface dry completely before sealer. Color Bond/Natural Grain-style steps list 2-4 hours before the next step; Polished Bond lists at least 12 hours before sealing, or 24 hours in colder conditions.',
    'Use the specified stocked Semco sealer. For pool/submerged/exterior penetrating-sealer needs, use Natural Shield under the current stocked-sealer rule. For Satin Stone, Titan Gloss, or Matte, follow that sealer procedure.',
    'Take photos at prep, membrane/primer, scratch/base, finish, sealer, and final handover.',
    '',
    'Field check:',
    'If the prep is not clean, dry, stable, and photo-documented, stop before coating. That is where most bond and warranty problems start.',
  ].join('\n');
}

function poolBuildUpAnswer(): string {
  return [
    'For a concrete pool, treat it like submerged work from the start. The goal is not just to make it look finished; the shell has to be sound, cleaned correctly, waterproofed where the detail calls for it, then sealed with the current stocked pool sealer.',
    '',
    '**Step 1: Make the pool-shell go/no-go call.**',
    'Confirm the concrete shell is sound, stable, and not actively leaking. Stop if the surface is loose, hollow, soft, spalling, delaminating, moving, rust-stained from an active issue, or still actively wet. Take the first prep photo before you cover anything.',
    '',
    '**Step 2: Remove pool and mineral contamination.**',
    'Pools commonly carry calcium, mineral, alkali, efflorescence, or old pool residue. Where mineral residue is present, use the Nu-Lift path first, then finish with Stone Soap so the surface is clean and pH-balanced before coating.',
    '',
    '**Step 3: Wash with Nu-Lift where residue is present.**',
    'Dampen the surface, apply Nu-Lift lightly, let it sit 2-3 minutes, then scrub/agitate with a nylon brush or scrub machine. Rinse thoroughly and remove residue. Do not leave cleaner residue trapped under the system.',
    '',
    '**Step 4: Final wash with Stone Soap.**',
    'Use Stone Soap at 1 part Stone Soap to 4 parts water. Let it sit 2-3 minutes, scrub/agitate, rinse clean, and remove the residue. Repeat the rinse/vacuum step if particles remain. Let the concrete dry before coating.',
    '',
    '**Step 5: Prime and scratch coat the concrete.**',
    'Roll X-Bond Liquid as the primer and keep it tacky. Do not let it dry before the scratch coat. Mix 1 part X-Bond Liquid to 2 parts X-Bond Stone, liquid first, with a square paddle at 180-200 RPM. Spread the scratch coat tight in one direction, let it dry, scrape loose particles, and sweep clean.',
    '',
    '**Step 6: Waterproof/detail the submerged areas.**',
    'Use SEMCO Liquid Membrane with fabric reinforcement where the pool/wet-area detail requires it, especially at joints, cracks, corners, penetrations, drains, transitions, or movement-risk areas. Press fabric into wet membrane, overlap fabric seams by at least 2 inches where fabric is used, and avoid voids or wrinkles. For underwater/submerged Liquid Membrane work, use 3 coats.',
    '',
    '**Step 7: Inspect the membrane before hiding it.**',
    'Before X-Bond goes over the membrane, inspect for pinholes, voids, thin spots, missed edges, and defects. SEMCO Liquid Membrane should be dry to the touch before the next step. Take the membrane-stage warranty photo and confirm the submerged membrane work has 3 coats.',
    '',
    '**Step 8: Apply the X-Bond build-up.**',
    'Continue with the required X-Bond scratch/base and finish layers only after the prep and membrane/detail work are ready. For the selected X-Bond finish procedure, mix 1 part X-Bond Liquid to 2 1/2 parts X-Bond Stone at 180-200 RPM and spread tight in one direction with a trowel or X-Bond smoother.',
    '',
    '**Step 9: Let the finish dry, then seal for submerged exposure.**',
    'Use Natural Shield as the current stocked penetrating sealer for pool/submerged and exterior exposure. Apply it wet-on-wet in 3 coats and do not allow each coat to dry before the next coat. Avoid puddling.',
    '',
    '**Step 10: Document the warranty stages.**',
    'Capture clear photos at prep, membrane/primer, scratch/base, finish, sealer, and final handover. For a pool, missing stage photos are a bigger problem because the important waterproofing work is hidden once the finish is on.',
    '',
    'Field check:',
    'Do not move forward just because the surface looks clean. For pool work, the key checks are sound concrete, residue removed, no active leaking, membrane defects fixed, Natural Shield used for submerged exposure, and every stage photographed before it disappears.',
  ].join('\n');
}

function installBuildUpAnswer(facts: ExtractedJobFacts, missingInputs: string[]): string {
  if (facts.isShower && missingInputs.includes('substrate')) {
    return showerSubstrateNeededAnswer();
  }

  if (missingInputs.length > 0 || (!facts.substrateType && !facts.prepSurfaceGroup)) {
    return [
      'I need the substrate before I can give the Semco build-up. The right answer changes a lot depending on what the system is going over.',
      '',
      'Tell me one of these:',
      '1. concrete',
      '2. plywood / OSB',
      '3. tile',
      '4. drywall / wall board',
      '5. pool / submerged',
      '6. metal',
      '',
      'Field rule:',
      'Ask Semco should not approve an assembly without knowing the substrate and surface condition.',
    ].join('\n');
  }

  if (!facts.substrateType) {
    if (!facts.prepSurfaceGroup) {
      return 'Answer:\nI need the substrate before I can give the Semco build-up.';
    }
    return genericBuildUpForPrepSurface(facts.prepSurfaceGroup, facts.prepSurfaceLabel ?? 'this surface');
  }

  const substrateType = facts.substrateType;
  const substrateLabel = SUBSTRATE_MAP[substrateType]?.label ?? substrateType;

  if (facts.isShower) {
    return showerBuildUpAnswer(substrateType);
  }

  if (substrateType === 'concrete') {
    return concreteBuildUpAnswer();
  }

  if (substrateType === 'pool') {
    return poolBuildUpAnswer();
  }

  const buildUps: Record<Exclude<SubstrateId, 'concrete' | 'pool'>, string[]> = {
    plywood: [
      'Pre-check: confirm plywood / OSB is structural, fastened, stable, dry, and not flexing. Stop if the floor moves, deflects, swells, or has water damage.',
      'Stage photo: take a clear substrate/prep photo before covering joints.',
      'Prep Type E: sweep debris, roll 1 coat of Liquid Membrane over the wood, and allow it to dry.',
      'Fabric: apply Liquid Membrane again and, while wet, embed anti-fracture fabric with an 18 inch smoother, trowel, or roller.',
      'Immediately roll two additional coats of Liquid Membrane with pressure. Overlap fabric seams by at least 2 inches.',
      'Leveling check: Brown Coat is not automatic. Use it only if the deck needs leveling, larger void filling, height correction, or the project detail calls for build-up.',
      'If Brown Coat is needed, roll X-Bond Liquid as primer and do not let it dry. Mix 1 part X-Bond Liquid + 1 part X-Bond Additive first, then add 2 1/2 parts X-Bond Stone with a square paddle at 180-200 RPM. Spread with a gauge rake and X-Bond smoother, use spike shoes when needed, and let it dry at least 12 hours depending on thickness.',
      'Continue to the specified X-Bond finish after the membrane/fabric system, or the Brown Coat if used, is dry and ready. For exterior or wet exposure, use Natural Shield under the current stocked Semco Canada sealer rule. Capture membrane, base, finish, sealer, and final photos.',
    ],
    icf: [
      'First identify the exposed face: concrete, cementitious parge, plaster, foam, or another facing. ICF is not one automatic approval.',
      'If the face is sound concrete/cementitious material, use the matching concrete/block/plaster prep path before X-Bond.',
      'If the face has mineral, alkali, calcium, magnesium, or efflorescence, use Nu-Lift followed by Stone Soap final wash.',
      'If the face is foam, unknown, loose, damp, moving, or not cementitious, stop and get Semco review before approving the build-up.',
      'For vertical X-Bond work, roll X-Bond Liquid primer and do not let it dry. Mix wall X-Bond at 1 part X-Bond Liquid to 3 parts X-Bond Stone at 180-200 RPM.',
      'Trowel bottom-up or use the approved exterior/unoccupied spray method at 15 PSI with a large tip. Add Liquid Membrane/fabric where water, joints, or movement risk require it.',
    ],
    metal: [
      'Do not approve metal by assumption. Confirm the metal is stable, clean, properly profiled, and suitable for coating.',
      'For clean, non-waxed metal, use SIP Type A: Stone Soap 1:4, dwell 2-3 minutes, scrub/agitate, rinse, wet-vac interiors, and dry.',
      'If oil, grease, mill residue, wax, paint, sealer, or unknown coating is present, use Power Cleaner 1:4 first, then Stone Soap 1:4 final wash.',
      'Confirm adhesion before coating. Stop for rusting, loose coating, structural movement, exterior/wet/high-movement metal, or unknown finish until Semco reviews it.',
      'If approved, use the X-Bond scratch coat procedure: X-Bond Liquid primer not allowed to dry, then mix 1 part X-Bond Liquid to 2 parts X-Bond Stone at 180-200 RPM.',
    ],
    existing_tile: [
      'Pre-check every tile area. Only go over tile that is bonded solid and not hollow, cracked, loose, tenting, or moving.',
      'Prep Type D: sweep, dampen, apply non-diluted Nu-Lift for 2-3 minutes, scrub/agitate, rinse/wet-vac, then repeat with Stone Soap 1:4 final wash and dry.',
      'Fill grout lines flush before the build-up so they do not telegraph.',
      'Apply X-Bond Scratch Coat, then SEMCO Liquid Membrane with fabric reinforcement, then second X-Bond Scratch Coat.',
      'Use X-Bond Brown Coat up to 3/4 inch where tile/grout texture or leveling requires it.',
      'Finish with the selected X-Bond Seamless Stone texture and stocked Semco sealer. Capture photos at prep, membrane, base, finish, sealer, and final.',
    ],
    gypsum_board: [
      'Drywall is walls only. Do not use drywall as a floor substrate.',
      'Confirm the board is dry, stable, properly fastened, and not paper-damaged, soft, swollen, moldy, or contaminated.',
      'For dry walls, use the wall build-up specified for the project. For wet walls, showers, or wet rooms, protect joints, corners, and seams with the correct Liquid Membrane/fabric detail before finish.',
      'For vertical X-Bond, roll X-Bond Liquid primer and do not allow it to dry. Mix 1 part X-Bond Liquid to 3 parts X-Bond Stone at 180-200 RPM.',
      'Apply bottom-up with a trowel. Optional spray is only for exterior or unoccupied projects, using a texture sprayer at 15 PSI with a large tip.',
    ],
    concrete_block: [
      'Confirm block/CMU/stucco/plaster is sound, clean, dry enough, and not spalling, dusty, actively wet, or loose.',
      'Use SIP Type D when mineral/efflorescence risk is present: non-diluted Nu-Lift, scrub, rinse/wet-vac, then Stone Soap 1:4 final wash.',
      'For below-grade or wet-risk walls, use the specified waterproofing/Liquid Membrane detail before the X-Bond finish.',
      'For vertical X-Bond, use the wall mix: 1 part X-Bond Liquid to 3 parts X-Bond Stone at 180-200 RPM over tacky X-Bond Liquid primer.',
    ],
    cement_board: [
      'Confirm cement board/backer board/concrete panels are properly fastened, stable, clean, and dry.',
      'Treat joints, seams, corners, and wet-area risk with Liquid Membrane and fabric reinforcement before X-Bond.',
      'Use the concrete board/concrete panel floor detail where applicable: X-Bond Scratch Coat, Liquid Membrane with fabric at joints and corners, second X-Bond Scratch Coat, optional Brown Coat starting at 1/8 inch, X-Bond texture, then sealer.',
      'For vertical boards, use the wall procedure: X-Bond Liquid primer, do not let it dry, then 1 part X-Bond Liquid to 3 parts X-Bond Stone at 180-200 RPM.',
    ],
    existing_paint: [
      'Do not coat over paint/coating unless adhesion is confirmed.',
      'Remove loose, soft, peeling, chalking, or failing coating first.',
      'Use SIP Type B for paint/sealer/coating residue: Power Cleaner 1:4, scrub, rinse/wet-vac, then Stone Soap 1:4 final wash and dry.',
      'If the coating type is unknown or the surface is exterior/stamped/unsure, use the stronger Type C path or get Semco review before approval.',
      'Once approved, continue with the X-Bond scratch coat and selected finish system.',
    ],
    heated_floor: [
      'Treat a heated floor by the actual surface on top: concrete, tile, plywood/OSB, cement board, or existing coating.',
      'Confirm the assembly is stable and movement joints are handled before coating.',
      'Turn heat off during application and cure. Do not thermal-cycle the floor while the system is bonding.',
      'Use Liquid Membrane/fabric where joints, movement risk, or the project detail requires it.',
      'After prep, follow the matching X-Bond build-up for the top surface and capture all warranty photos.',
    ],
  };

  return formatBuildUpPathAnswer(substrateLabel, buildUps[substrateType]);
}

function xBondFinishCoatAnswer(facts: ExtractedJobFacts): string {
  const substrateNote = facts.substrateType === 'plywood'
    ? 'Since this is following the plywood / OSB deck path, do not start finish coats until the Liquid Membrane/fabric system, and Brown Coat if it was actually needed for leveling or build-up, is dry and ready.'
    : 'Do not start finish coats until the scratch/base, membrane detail work, and any required leveling/build-up are dry and ready.';

  const sealerNote = facts.substrateType === 'plywood' || facts.prepSurfaceGroup === 'type_c_unknown_exterior'
    ? 'Because this is exterior or wet-exposure work, finish with Natural Shield under the current stocked Semco Canada sealer rule unless Semco specifies otherwise for the job.'
    : 'After the finish has dried completely, use the specified stocked Semco sealer for the project.';

  return [
    'For the X-Bond finish coats, slow down and treat this like the visible surface. The prep and membrane work are what keep it bonded; the finish coats are where you control texture, tightness, and final appearance.',
    '',
    '**Step 1: Confirm the base is ready.**',
    substrateNote,
    'Sweep or scrape off loose particles. Do not trap dust, ridges, wet membrane, or soft spots under the finish.',
    '',
    '**Step 2: Prime if the detail calls for it.**',
    'Roll X-Bond Liquid as the primer/bonding layer and keep working while it is tacky. Do not let the X-Bond Liquid dry before the coat that is meant to bond into it.',
    '',
    '**Step 3: Mix the X-Bond finish.**',
    'For the selected X-Bond finish procedure, mix 1 part X-Bond Liquid to 2 1/2 parts X-Bond Stone. Add liquid first, then powder, and mix with a square paddle at low speed, 180-200 RPM.',
    '',
    '**Step 4: Apply the finish tight and even.**',
    'Spread it tightly in one direction with a trowel or X-Bond smoother at about 1/16 inch / 2 mil. Keep the pressure consistent so you do not leave heavy ridges or thin spots.',
    '',
    '**Step 5: If a second finish coat is needed, wait before going back on it.**',
    'Let the first coat dry slightly to the touch, about 20-30 minutes, before the next coat when a second coat is required. Use shoe covers between coats so you do not mark or contaminate the surface.',
    '',
    '**Step 6: Use MicroBond only when a smooth finish is wanted.**',
    'For the optional MicroBond smooth finish, prime with X-Bond Liquid, then mix 1 part X-Bond Liquid to 2 parts MicroBond Stone and apply with a Magic Trowel.',
    '',
    '**Step 7: Dry, inspect, then seal.**',
    'Let the surface dry completely before sealer. Check for loose material, ridges, pinholes, thin spots, and missed edges before sealing.',
    sealerNote,
    '',
    'Field check:',
    'Take the finish-stage photo before sealer. For warranty, keep photos for prep, membrane/primer, scratch/base, finish, sealer, and final handover.',
  ].join('\n');
}

function genericBuildUpForPrepSurface(group: PrepSurfaceGroup, label: string): string {
  const prepLines: Record<PrepSurfaceGroup, string[]> = {
    type_a_standard: [
      'Prep as SIP Type A: sweep, dampen, Stone Soap 1:4 for 2-3 minutes, scrub/agitate, rinse, wet-vac interiors, repeat if particles remain, and dry.',
      'This applies only when the surface is clean, non-waxed, non-sealed, and not contaminated.',
    ],
    type_b_residue: [
      'Prep as SIP Type B: Power Cleaner 1:4 for 2-3 minutes, scrub/agitate, rinse/wet-vac, then Stone Soap 1:4 final wash, rinse/wet-vac, and dry.',
      'Remove loose/failing coating and confirm adhesion before approving X-Bond.',
    ],
    type_c_unknown_exterior: [
      'Prep as SIP Type C: Power Cleaner 1:4, rinse/wet-vac; Nu-Lift 1:1, rinse/wet-vac; Power Cleaner 1:9, rinse/wet-vac; dry.',
      'Use this when the existing condition is unknown, stamped, or exterior.',
    ],
    type_d_mineral_masonry_tile: [
      'Prep as SIP Type D: non-diluted Nu-Lift for 2-3 minutes, scrub/agitate, rinse/wet-vac, then Stone Soap 1:4 final wash, rinse/wet-vac, and dry.',
      'For tile, confirm it is bonded solid and fill grout lines flush. For block/stucco/plaster, stop if it is loose, dusty, spalling, or actively wet.',
    ],
    type_e_wood: [
      'Prep as SIP Type E: confirm the wood is structural/stable, sweep, roll Liquid Membrane and dry, embed fabric into wet Liquid Membrane, immediately add two membrane coats, overlap fabric 2 inches, and dry.',
      'Use Brown Coat only if leveling, larger void filling, height correction, or the detail requires build-up.',
    ],
    wall_board: [
      'Confirm the board/panel is stable, dry, fastened, and not damaged.',
      'For wet walls, joints, corners, and seams, use Liquid Membrane and fabric reinforcement before finish.',
      'Drywall is walls only, not a floor substrate.',
    ],
    pool_submerged: [
      'Treat as wet-area/submerged work. Remove mineral/pool residue, use 3 coats of Liquid Membrane for underwater/submerged membrane work, and use Natural Shield as the current stocked penetrating sealer where a penetrating sealer is specified.',
      'Capture all warranty photos because submerged work is high risk.',
    ],
    heated_floor: [
      'Prep the actual top surface and keep heat off during application and cure.',
      'Use Liquid Membrane/fabric where joints, movement, or the project detail requires it.',
    ],
    icf: [
      'Confirm the exposed ICF face before approval. Concrete/parge/plaster can follow the matching prep type; foam, loose, damp, moving, or unknown faces need Semco review.',
    ],
  };

  return [
    `For ${label}, prep first, then build only if the surface is sound and bondable. Do not let the product choice outrun the substrate check.`,
    '',
    'Prep first:',
    ...numberedSteps(prepLines[group]),
    '',
    'Build-up after prep:',
    '**Step 1:** Roll X-Bond Liquid as primer and do not allow it to dry.',
    '**Step 2:** For floor scratch coat, mix 1 part X-Bond Liquid to 2 parts X-Bond Stone at low speed, 180-200 RPM, using a square mixing paddle.',
    '**Step 3:** Spread the scratch coat tightly in one direction, let it dry, scrape loose particles, and sweep clean.',
    '**Step 4:** Use Liquid Membrane/fabric at cracks, joints, seams, corners, drains, wet areas, and movement-risk areas where the detail requires it.',
    '**Step 5:** Use Brown Coat only when leveling, filling larger voids, or correcting height transitions. Brown Coat mix: 1 part X-Bond Liquid + 1 part X-Bond Additive first, then 2 1/2 parts X-Bond Stone at 180-200 RPM.',
    '**Step 6:** Apply the specified X-Bond finish and stocked Semco sealer after the build-up is ready.',
    '',
    'Field check:',
    'Stop for loose, moving, hollow, wet, soft, delaminating, spalling, dusty, rusting, or unknown surfaces, and for any surface where adhesion has not been confirmed.',
  ].join('\n');
}

function sealerApplicationAnswer(facts: ExtractedJobFacts): string {
  const sku = facts.sealerSku ?? (facts.isSubmerged ? 'NATURAL-SHIELD' : undefined);

  if (sku === 'NATURAL-SHIELD') {
    return [
      'For pool, submerged, continuous water-containment, and exterior penetrating-sealer work, use Natural Shield under the current stocked Semco Canada rule. Treat it as a penetrating protection step, not a thick film build.',
      '',
      'Step-by-step:',
      '**Step 1:** Confirm the surface is ready for sealer and sweep all debris and loose material off the surface.',
      '**Step 2:** Apply Natural Shield wet-on-wet. The tech sheet requires 3 coats and says not to allow each coat to dry between coats.',
      '**Step 3:** Use a 1/4 inch nap roller, HVLP sprayer, pump sprayer, or airless sprayer with tip size 17. For vertical work, use a 1/4 inch nap roller, HVLP, or airless tip size 15 and work bottom to top to avoid runs.',
      '**Step 4:** Do not allow puddling. Puddling can create white haze and weak-looking spots.',
      '**Step 5:** Product sheet coverage at 3 coats: artificial stone 200-250 sq ft/gal, polished concrete 150-250 sq ft/gal, stamped concrete 300-350 sq ft/gal. Use the Calculator for project order quantities and purchase rounding.',
      '**Step 6:** Product sheet application environment is 50F to 90F. Cure changes with temperature and humidity; the SIP manual says allow at least 48 hours before cleaning and maximum strength is achieved in 7 days.',
      '',
      'Field check:',
      'Test a small area first, wear gloves and eye protection, and do not mix it with other cleaners.',
    ].join('\n');
  }

  if (sku === 'SATIN-STONE') {
    return [
      'Use Satin Stone when a stocked satin film finish is specified. This is a controlled coating step, so batch size, pot life, and spray method matter.',
      '',
      'Step-by-step:',
      '**Step 1:** Sweep debris off the surface before sealing.',
      '**Step 2:** Mix 2 parts Part A to 1 part Part B with a low-speed mixer and low-air paddle. Mark the time on the container; pot life is up to 35 minutes depending on temperature.',
      '**Step 3:** Apply with airless sprayer tip size 21 at 850-1,000 PSI, holding the gun about 18 inches from the floor. A Magic Trowel can be used to spread it, but do not work it back and forth.',
      '**Step 4:** Minimum 3 coats are required in the SIP procedure for 1.5 mil film thickness. The tech sheet lists coverage by surface at minimum 2 coats / 20 mils total thickness.',
      '**Step 5:** Apply between 50F and 90F per the tech sheet. The SIP manual says allow at least 48 hours before foot traffic.',
      '',
      'Field check:',
      'Mix small batches and use the Calculator for project quantities.',
    ].join('\n');
  }

  if (sku === 'TITAN-SHIELD') {
    return [
      'Use Titan Gloss when a stocked gloss film finish is specified. Keep the surface clean, apply the required film build, and use the Calculator for quantity.',
      '',
      'Step-by-step:',
      '**Step 1:** Confirm the surface is clean and ready for sealer.',
      '**Step 2:** Apply with an airless sprayer, tip size 17, a 1/4 inch woven short nap roller, or Magic Trowel.',
      '**Step 3:** Product sheet coverage at minimum 3 coats / 6-8 mils total thickness: polished concrete 150-200 sq ft/gal, artificial stone 150-200 sq ft/gal, stamped concrete 250-300 sq ft/gal, and X-Bond 200-250 sq ft/gal.',
      '**Step 4:** Apply between 50F and 90F per the tech sheet.',
      '**Step 5:** Recoat timing varies by temperature and humidity; the tech sheet example says full cure is about 48 hours at 45F and about 18 hours at 90F.',
      '',
      'Field check:',
      'Test a small area first, wear gloves and eye protection, and use the Calculator for project quantities.',
    ].join('\n');
  }

  if (sku === 'MATTE-SEALER') {
    return [
      'Matte is a current stocked Semco Canada matte finish. The field rule in this app says it is Titan-like in a matte finish and slightly harder than Titan.',
      '',
      'Use this carefully:',
      'Treat Matte as the stocked matte option when the installer wants a matte finish. Do not recommend older non-stocked sealers unless the installer specifically asks about them.',
      '',
      'Field check:',
      'If the job needs exact application data beyond the Titan-style field rule, confirm against the current Matte tech sheet before giving ratios, coverage, recoat, or cure values.',
    ].join('\n');
  }

  if (facts.isShower) {
    return [
      'For a standard interior shower, use Satin Stone as the current Semco Canada shower sealer/finish.',
      '',
      '**Step 1: Confirm the shower build-up first.**',
      'Do not choose the sealer before the substrate, Liquid Membrane/fabric detail, X-Bond base, and X-Bond finish are ready. If the installer has not named the substrate yet, ask for it first.',
      '',
      '**Step 2: Use the standard shower finish rule.**',
      'Standard interior shower guidance is 2-coat Liquid Membrane/fabric detail before X-Bond, then Satin Stone in 2 coats.',
      '',
      '**Step 3: Do not swap sealers by habit.**',
      'Do not use Natural Shield for a standard interior shower unless the job is pool, submerged, continuous water-containment, exterior penetrating-sealer work, or Semco specifically reviews and approves that change.',
      '',
      'Field check:',
      'If this is actually a pool, pond, fountain, exterior shower, or submerged/water-containment project, say that clearly because the sealer and membrane rules change.',
    ].join('\n');
  }

  return [
    'Choose the sealer by exposure first, then finish. The installer should not pick only by sheen if the project is exterior, wet, submerged, or high traffic.',
    '',
    'Current stocked Semco Canada options:',
    'Natural Shield: pools, submerged work, continuous water-containment, exterior, and natural penetrating protection.',
    'Satin Stone: stocked satin film finish. Standard interior showers use Satin Stone in 2 coats.',
    'Titan Gloss: stocked gloss film finish.',
    'Matte: stocked matte finish; current field rule says Titan-like matte and slightly harder than Titan.',
    '',
    'Need:',
    '1. finish required: natural, satin, gloss, or matte',
    '2. exposure: interior, standard shower/wetroom, exterior, pool/submerged, traffic level',
  ].join('\n');
}

function takeoffAnswer(): string {
  return [
    'Takeoff should mean blueprint/plan reading, not manual material estimating. If the app is not reading drawings and measuring scope, it should not pretend that it is doing takeoff.',
    '',
    'Use this instead:',
    'Calculator: manual sq ft material estimate.',
    'Projects: photos, batches, warranty records.',
    'Future Takeoff: only add it when the app can read drawings and measure scope.',
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
    `Current standard shower rule:\n${STANDARD_SHOWER_POLICY_TEXT}`,
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
    facts.prepSurfaceGroup ? `prep_group=${facts.prepSurfaceGroup}` : null,
    facts.sealerSku ? `sealer=${facts.sealerSku}` : null,
    facts.wantsAllPrep ? 'scope=all surface prep' : null,
    facts.wantsMicroBond ? 'finish=MicroBond smooth' : null,
    facts.isSubmerged ? 'condition=submerged/pool' : null,
    facts.isShower ? 'condition=shower/wetroom' : null,
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

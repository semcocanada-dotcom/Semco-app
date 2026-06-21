import type { SubstrateId } from '@/constants/substrates';
import { SUBSTRATE_MAP } from '@/constants/substrates';
import { STOCKED_SEALER_POLICY_TEXT } from '@/constants/stocked-sealers';
import type { ManualKnowledgeHit } from './manual-knowledge';

type ReasoningIntent =
  | 'document_gap'
  | 'material_estimate'
  | 'membrane_quantity'
  | 'prep_decision'
  | 'install_build_up'
  | 'sealer_application'
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
  if (hasAny(normalized, ['cleaner', 'cleaners', 'surface prep', 'prepare substrate', 'prep', 'prepping', 'preparation', 'stone soap', 'power cleaner', 'nu lift', 'nu-lift'])) {
    return 'prep_decision';
  }
  if (hasAny(normalized, ['sealer', 'seal ', 'sealing', 'top coat', 'topcoat', 'natural shield', 'satin stone', 'titan', 'matte'])) {
    return 'sealer_application';
  }
  if (
    hasAny(normalized, ['process', 'procedure', 'steps', 'start to finish', 'from start', 'do concrete', 'resurface', 'install', 'installation', 'apply', 'application'])
    && (extractSubstrate(normalized) || hasAny(normalized, ['xbond', 'x-bond', 'microcement', 'micro cement', 'seamless stone']))
  ) {
    return 'install_build_up';
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
  if (intent === 'document_gap') return documentGapAnswer();
  if (intent === 'warranty_photos') return warrantyPhotoAnswer();
  if (intent === 'takeoff_scope') return takeoffAnswer();
  if (intent === 'prep_decision') return prepAnswer(facts, missingInputs);
  if (intent === 'install_build_up') return installBuildUpAnswer(facts, missingInputs);
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

function documentGapAnswer(): string {
  return [
    'Answer: If the approved Semco documents do not answer the question, do not guess.',
    '',
    'Do this:',
    '- Tell the installer: "I cannot confirm that from the approved Semco technical documents."',
    '- Say what is missing, such as product, substrate, exposure, mixing ratio, coverage, dry time, or warranty detail.',
    '- Ask for the exact product/system or escalate to Semco technical review if the decision affects warranty, compatibility, safety, or material quantities.',
    '- Do not fill the gap with general construction knowledge.',
    '',
    'Rule:',
    '- Calculator quantities come from the built-in formulas.',
    '- Install and warranty answers must be traceable to approved Semco sources.',
  ].join('\n');
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
      '- Concrete: preferred field prep is Nu-Lift first, then Stone Soap final wash.',
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
      'Sweep debris off the wood surface first.',
      'Roll 1 coat of Liquid Membrane over the wood and allow it to dry.',
      'Apply Liquid Membrane again and, while still wet, press anti-fracture fabric into it with an 18 inch smoother, trowel, or roller.',
      'Immediately roll two additional coats of Liquid Membrane with pressure.',
      'Overlap fabric seams by at least 2 inches.',
      'Allow the surface to dry before X-Bond so there are no imprints and the surface is ready.',
    ],
    icf: ['Stone Soap standard wash.', 'Add Nu-Lift only if mineral/efflorescence contamination is visible.'],
    metal: ['Power Cleaner if oil, grease, or shop residue is present.', 'Confirm profile and adhesion before coating.'],
    existing_tile: [
      'Sweep debris off the tile and dampen the surface with water.',
      'Apply Nu-Lift Cleaner lightly with a pump sprayer and let it sit 2-3 minutes. SIP page 23 lists Nu-Lift as non-diluted for this prep path.',
      'Scrub/agitate with a scrub machine and nylon brush, or a hand scrub brush in tight areas.',
      'Rinse the surface. For interiors, use a wet vacuum to remove residue.',
      'Repeat the same wash steps with Stone Soap solution to clean chemical residue and pH-balance the surface. Ratio: 1 part Stone Soap to 4 parts water.',
      'Repeat rinse/vacuum if needed, then allow the surface to dry before coating.',
      'Fill grout lines flush before coating and stop if tile is hollow, loose, cracked, or moving.',
    ],
    gypsum_board: [
      'Drywall is walls only; do not use it as a floor substrate.',
      'Confirm the board is dry, stable, properly fastened, and not damaged.',
      'Use Stone Soap only if cleaning is needed, then allow the surface to dry before coating.',
    ],
    pool: [
      'Treat pool/submerged prep like wet-area work, not a normal floor.',
      'Remove calcium, mineral, alkali, efflorescence, or pool residue with the Nu-Lift prep path where present.',
      'After Nu-Lift, repeat the wash with Stone Soap solution to clean chemical residue and pH-balance the surface. Ratio: 1 part Stone Soap to 4 parts water.',
      'Rinse/vacuum and allow the surface to dry before coating.',
      'Use the wet-area Liquid Membrane build-up and Natural Shield as the current stocked penetrating sealer for pool/submerged work.',
    ],
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
      'Confirm the concrete is sound, non-delaminating, clean, and ready to receive coating. Do not treat loose, moving, contaminated, or wet concrete like a normal slab.',
      'Prep concrete with the preferred Semco Canada field path: Nu-Lift first as the pH/mineral reset step, then Stone Soap final wash before coating. Add Power Cleaner first when grease, wax, glue, paint, sealer, epoxy, or other topical residue is present. Final wash/rinse must leave no bond-breaking residue.',
      'Roll X-Bond Liquid as the primer coat and do not allow it to dry before the scratch coat.',
      'Mix the scratch coat in this order: 1 part X-Bond Liquid to 2 parts X-Bond Stone. Use a square mixing paddle at low speed, 180-200 RPM.',
      'While the X-Bond Liquid is still tacky, pour the mix to the far edge and spread tightly in one direction with a concrete broom. Let it dry, then scrape loose particles and sweep clean.',
      'For the X-Bond finish/skim coats, mix 1 part X-Bond Liquid to 2 1/2 parts X-Bond Stone when that finish procedure applies. Spread tightly in one direction with a trowel or X-Bond smoother at about 1/16 inch / 2 mil.',
      'Allow each finish coat to dry slightly to the touch, about 20-30 minutes, before the next coat when the procedure calls for a second coat. Use shoe covers between coats.',
      'If a smoother MicroBond finish is required, prime first with X-Bond Liquid, then mix 1 part X-Bond Liquid to 2 parts MicroBond Stone and apply with a Magic Trowel.',
      'Let the surface dry completely before sealing. For Color Bond/Natural Grain-style steps, the manual calls for 2-4 hours before the next step; Polished Bond calls for at least 12 hours before sealing, or 24 hours in colder conditions.',
      'Seal with the specified stocked Semco sealer for the application. Use Natural Shield for pool/submerged/exterior penetrating-sealer needs under the current stocked sealer rule.',
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

function sealerApplicationAnswer(facts: ExtractedJobFacts): string {
  const sku = facts.sealerSku ?? (facts.isSubmerged ? 'NATURAL-SHIELD' : undefined);

  if (sku === 'NATURAL-SHIELD') {
    return [
      'Answer: For pool, submerged, wet-exposure, and exterior penetrating-sealer work, use Natural Shield under the current stocked Semco Canada rule.',
      '',
      'Step-by-step:',
      '- Confirm the surface is ready for sealer and sweep all debris and loose material off the surface.',
      '- Apply Natural Shield wet-on-wet. The tech sheet requires 3 coats and says not to allow each coat to dry between coats.',
      '- Use a 1/4 inch nap roller, HVLP sprayer, pump sprayer, or airless sprayer with tip size 17. For vertical work, use a 1/4 inch nap roller, HVLP, or airless tip size 15 and work bottom to top to avoid runs.',
      '- Do not allow puddling. Puddling can create white haze and weak-looking spots.',
      '- Product sheet coverage at 3 coats: artificial stone 200-250 sq ft/gal, polished concrete 150-250 sq ft/gal, stamped concrete 300-350 sq ft/gal. Use the Calculator for project order quantities and purchase rounding.',
      '- Product sheet application environment is 50F to 90F. Cure changes with temperature and humidity; the SIP manual says allow at least 48 hours before cleaning and maximum strength is achieved in 7 days.',
      '',
      'Do not miss:',
      '- Test a small area first.',
      '- Wear gloves and eye protection.',
      '- Do not mix with other cleaners.',
    ].join('\n');
  }

  if (sku === 'SATIN-STONE') {
    return [
      'Answer: Use Satin Stone when a stocked satin film finish is specified.',
      '',
      'Step-by-step:',
      '- Sweep debris off the surface before sealing.',
      '- Mix 2 parts Part A to 1 part Part B with a low-speed mixer and low-air paddle. Mark the time on the container; pot life is up to 35 minutes depending on temperature.',
      '- Apply with airless sprayer tip size 21 at 850-1,000 PSI, holding the gun about 18 inches from the floor. A Magic Trowel can be used to spread it, but do not work it back and forth.',
      '- Minimum 3 coats are required in the SIP procedure for 1.5 mil film thickness. The tech sheet lists coverage by surface at minimum 2 coats / 20 mils total thickness.',
      '- Apply between 50F and 90F per the tech sheet. The SIP manual says allow at least 48 hours before foot traffic.',
      '',
      'Do not miss:',
      '- Mix small batches.',
      '- Use the Calculator for project quantities.',
    ].join('\n');
  }

  if (sku === 'TITAN-SHIELD') {
    return [
      'Answer: Use Titan Gloss when a stocked gloss film finish is specified.',
      '',
      'Step-by-step:',
      '- Confirm the surface is clean and ready for sealer.',
      '- Apply with an airless sprayer, tip size 17, a 1/4 inch woven short nap roller, or Magic Trowel.',
      '- Product sheet coverage at minimum 3 coats / 6-8 mils total thickness: polished concrete 150-200 sq ft/gal, artificial stone 150-200 sq ft/gal, stamped concrete 250-300 sq ft/gal, and X-Bond 200-250 sq ft/gal.',
      '- Apply between 50F and 90F per the tech sheet.',
      '- Recoat timing varies by temperature and humidity; the tech sheet example says full cure is about 48 hours at 45F and about 18 hours at 90F.',
      '',
      'Do not miss:',
      '- Use the Calculator for project quantities.',
      '- Test a small area first and wear gloves and eye protection.',
    ].join('\n');
  }

  if (sku === 'MATTE-SEALER') {
    return [
      'Answer: Matte is a current stocked Semco Canada matte finish. The field rule in this app says it is Titan-like in a matte finish and slightly harder than Titan.',
      '',
      'Use this carefully:',
      '- Treat Matte as the stocked matte option when the installer wants a matte finish.',
      '- Do not recommend older non-stocked sealers unless the installer specifically asks about them.',
      '- If the job needs exact application data beyond the Titan-style field rule, confirm against the current Matte tech sheet before giving ratios, coverage, recoat, or cure values.',
    ].join('\n');
  }

  return [
    'Answer: Choose the sealer by the exposure and finish required.',
    '',
    'Current stocked Semco Canada options:',
    '- Natural Shield: pools, submerged work, wet exposure, exterior, and natural penetrating protection.',
    '- Satin Stone: stocked satin film finish.',
    '- Titan Gloss: stocked gloss film finish.',
    '- Matte: stocked matte finish; current field rule says Titan-like matte and slightly harder than Titan.',
    '',
    'Need:',
    '- finish required: natural, satin, gloss, or matte',
    '- exposure: interior, exterior, shower/wetroom, pool/submerged, traffic level',
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

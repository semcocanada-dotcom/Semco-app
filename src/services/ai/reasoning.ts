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
  prepSurfaceGroup?: PrepSurfaceGroup;
  prepSurfaceLabel?: string;
  sealerSku?: string;
  wantsAllPrep: boolean;
  wantsMicroBond: boolean;
  isSubmerged: boolean;
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
  { id: 'cement_board', terms: ['cement board', 'backer board', 'concrete board', 'concrete boards', 'concrete panel', 'concrete panels'] },
  { id: 'concrete_block', terms: ['block', 'cmu', 'stucco', 'masonry', 'brick', 'below grade plaster', 'plaster'] },
  { id: 'existing_paint', terms: ['paint', 'painted', 'coating', 'coated', 'epoxy', 'terrazzo', 'carpet glue', 'wax', 'waxed', 'sealer residue'] },
  { id: 'existing_tile', terms: ['tile', 'ceramic', 'porcelain', 'grout'] },
  { id: 'gypsum_board', terms: ['drywall', 'gypsum', 'wallboard', 'gyp board'] },
  { id: 'plywood', terms: ['plywood', 'osb', 'wood', 'deck', 'decks'] },
  { id: 'icf', terms: ['icf', 'insulated concrete form'] },
  { id: 'metal', terms: ['metal', 'steel', 'aluminum', 'aluminium'] },
  { id: 'pool', terms: ['pool', 'jacuzzi', 'submerged', 'under water', 'underwater'] },
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
    terms: ['drywall', 'gypsum', 'wallboard', 'gyp board', 'cement board', 'backer board', 'concrete board', 'concrete panel'],
  },
  {
    group: 'pool_submerged',
    label: 'pool, jacuzzi, submerged, or continuous wet-exposure surface',
    terms: ['pool', 'jacuzzi', 'submerged', 'under water', 'underwater'],
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
  const prepSurface = extractPrepSurface(normalized);
  return {
    areaSqft: extractAreaSqft(normalized),
    substrateType: extractSubstrate(normalized),
    prepSurfaceGroup: prepSurface?.group,
    prepSurfaceLabel: prepSurface?.label,
    sealerSku: extractSealerSku(normalized),
    wantsAllPrep: wantsAllSurfacePrep(normalized),
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
      'Allow the surface to dry before X-Bond. For build-up over wood, the SIP Brown Coat mix is 1 part X-Bond Liquid + 1 part X-Bond Additive first, then 2 1/2 parts X-Bond Stone at 180-200 RPM, with 12 hours minimum dry time.',
    ],
    wall_board: [
      'Drywall/gypsum board is walls only. Do not use drywall as a floor substrate.',
      'Confirm the board is dry, stable, properly fastened, and not paper-damaged or soft.',
      'For normal dry wall work, clean only as needed and allow the surface to dry before coating.',
      'For cement board, concrete board, backer board, shower walls, wet rooms, corners, joints, and seams, treat the joints and wet-area risk with Liquid Membrane and fabric reinforcement before the X-Bond finish.',
      'Use the wall procedure when applying X-Bond vertically: primer with X-Bond Liquid, do not let it dry, then X-Bond wall mix at 1 part X-Bond Liquid to 3 parts X-Bond Stone at 180-200 RPM.',
    ],
    pool_submerged: [
      'Treat pools, jacuzzis, submerged surfaces, and continuous wet exposure as wet-area work, not a normal floor.',
      'Remove calcium, mineral, alkali, efflorescence, or pool residue with the Nu-Lift path where present, then Stone Soap final wash at 1:4.',
      'Rinse/vacuum and allow the surface to dry before coating.',
      'Use the wet-area Liquid Membrane build-up where the detail requires it. Inspect for voids, pinholes, thin spots, and defects before covering it.',
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
      'Answer: Prep depends on substrate and contamination, not just square footage.',
      '',
      'Decision rule:',
      '- Clean non-waxed concrete, natural stone, vinyl/VCT, metal, Formica, or glass: Stone Soap 1:4.',
      '- Grease, oil, wax, glue, paint, sealer, epoxy, terrazzo, or topical coating residue: Power Cleaner 1:4, then Stone Soap 1:4.',
      '- Unknown, stamped, or exterior conditions: Power Cleaner 1:4, Nu-Lift 1:1, then Power Cleaner 1:9.',
      '- Tile, block, stucco, below-grade plaster, pool residue, calcium, mineral, alkali, or efflorescence: Nu-Lift, then Stone Soap 1:4.',
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
  return [
    `Answer: For ${substrateLabel}, use this prep path.`,
    '',
    'Do this:',
    ...steps.map((item) => `- ${item}`),
    '',
    'Reason:',
    '- Cleaner choice follows the contamination risk.',
    '- Warranty and adhesion risk are higher when prep photos or residue checks are missing.',
  ].join('\n');
}

function allSurfacePrepAnswer(): string {
  return [
    'Answer: Yes. The app should treat surface prep as a decision tree, not one generic cleaning step.',
    '',
    'Use this checked map:',
    '- Concrete: Semco Canada field prep is Nu-Lift first as the pH/mineral reset, then Stone Soap final wash before coating. If concrete is exterior, stamped, unknown, or has heavier mineral/alkali/efflorescence risk, use the stronger SIP Type C path below.',
    '- Clean, non-waxed natural stone, vinyl/VCT, metal, Formica, glass, plexiglass: SIP Type A. Sweep, dampen, Stone Soap 1:4, dwell 2-3 minutes, scrub, rinse, wet-vac interiors, repeat rinse/vacuum if needed, dry.',
    '- Commercial kitchen contamination, epoxy, terrazzo, carpet glue, waxed, painted, sealed, or coated surfaces: SIP Type B. Power Cleaner 1:4, dwell 2-3 minutes, scrub, rinse/vacuum, then Stone Soap 1:4 final wash, rinse/vacuum, dry. Remove loose coating and confirm adhesion.',
    '- Unknown existing conditions, stamped concrete, and exterior surfaces: SIP Type C. Power Cleaner 1:4, rinse/vacuum; Nu-Lift 1:1, rinse/vacuum; Power Cleaner 1:9, rinse/vacuum; dry.',
    '- Tile, exterior block wall, stucco, below-grade plaster, calcium/mineral/alkali/magnesium/efflorescence: SIP Type D. Non-diluted Nu-Lift, dwell 2-3 minutes, scrub, rinse/vacuum; then Stone Soap 1:4 final wash, rinse/vacuum, dry.',
    '- Wood, plywood, OSB, decks: SIP Type E. Confirm the wood is structural/stable, sweep, roll Liquid Membrane and dry, embed fabric into wet Liquid Membrane, immediately add two more membrane coats with pressure, overlap fabric 2 inches, dry before X-Bond.',
    '- Drywall/gypsum board: walls only. It must be dry, stable, fastened, and not damaged. Do not use drywall as a floor substrate. Wet walls need the proper Liquid Membrane/fabric detail at joints/corners/seams.',
    '- Cement board/backer board/concrete boards: confirm fastening and stability, then treat wet-area joints/corners/seams with Liquid Membrane and fabric before X-Bond.',
    '- ICF: confirm the exposed face first. Concrete/parge/plaster faces can follow the matching prep type. Foam, unknown, loose, damp, or moving faces need Semco review before approval.',
    '- Pools/jacuzzis/submerged/wet exposure: use the mineral-residue path where needed, rinse clean, dry, use the wet-area Liquid Membrane build-up, and finish with Natural Shield as the current stocked penetrating sealer.',
    '- Heated floors: prep the actual top surface, keep heat off during application and cure, and do not thermal-cycle while the system is bonding.',
    '',
    'Stop and review:',
    '- loose, hollow, moving, cracked, delaminating, wet, dusty, soft, spalling, or unknown surfaces',
    '- active moisture, standing water, or failed coating',
    '- missing warranty photos at prep, membrane/primer, base, finish, sealer, and final handover',
    '',
    'Sources:',
    '- Open SIP manual - master copy v2019-3 2.pdf p. 20-24',
    '- Open SIP manual - master copy v2019-3 2.pdf p. 27-30',
    '- Open SIP manual - master copy v2019-3 2.pdf p. 35',
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
  if (missingInputs.length > 0 || (!facts.substrateType && !facts.prepSurfaceGroup)) {
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

  if (!facts.substrateType) {
    if (!facts.prepSurfaceGroup) {
      return 'Answer: I need the substrate before I can give the Semco build-up.';
    }
    return genericBuildUpForPrepSurface(facts.prepSurfaceGroup, facts.prepSurfaceLabel ?? 'this surface');
  }

  const substrateType = facts.substrateType;
  const substrateLabel = SUBSTRATE_MAP[substrateType]?.label ?? substrateType;
  const buildUps: Record<SubstrateId, string[]> = {
    concrete: [
      'Pre-check the slab: concrete must be sound, non-delaminating, stable, and dry enough for coating. Stop if the slab is loose, moving, contaminated, actively wet, or has cracks/movement that need Semco review.',
      'Stage photo: take a clear substrate/prep photo before cleaning and another after prep is complete.',
      'Prep: sweep debris, dampen the slab with water, then use the preferred Semco Canada field path: Nu-Lift first as the pH/mineral reset step, then Stone Soap final wash before coating.',
      'Nu-Lift wash: apply Nu-Lift lightly with a pump sprayer, let it sit 2-3 minutes, scrub/agitate with a scrub machine and concrete nylon brush or hand brush, then rinse. For interiors, wet-vac residue.',
      'Stone Soap final wash: apply Stone Soap solution and let it sit 2-3 minutes. Ratio: 1 part Stone Soap to 4 parts water. Scrub/agitate, rinse, wet-vac residue on interiors, repeat if particles remain, then let the concrete dry.',
      'If grease, wax, glue, paint, sealer, epoxy, terrazzo, or topical residue is present, use Power Cleaner first at 1 part Power Cleaner to 4 parts water, rinse/vacuum, then continue with Nu-Lift and Stone Soap final wash.',
      'If the concrete is exterior, stamped, unknown-condition, or has heavier mineral/alkali/efflorescence risk, use the stronger SIP path: Power Cleaner 1:4, rinse/vacuum, Nu-Lift 1:1, rinse/vacuum, then Power Cleaner 1:9, rinse/vacuum, and dry.',
      'Scratch coat primer: roll X-Bond Liquid as the primer coat and do not allow it to dry before the scratch coat.',
      'Scratch coat mix: mix 1 part X-Bond Liquid to 2 parts X-Bond Stone, in that order, with a square mixing paddle at low speed, 180-200 RPM.',
      'Scratch coat application: while the X-Bond Liquid is still tacky, pour the mix to the far edge and spread tightly in one direction with a concrete broom. Let it dry, scrape loose particles, and sweep clean.',
      'Cracks, joints, drains, corners, and movement-risk areas: use SEMCO Liquid Membrane with fabric reinforcement where the detail requires it. Press fabric into wet membrane, avoid voids/pinholes/thin spots, and take a membrane-stage photo.',
      'Second scratch/base coat: apply the second X-Bond scratch/base coat after the membrane/detail work is ready. If build-up is needed, use X-Bond Brown Coat only where the project detail requires it.',
      'Finish coats: for the selected X-Bond finish, mix 1 part X-Bond Liquid to 2 1/2 parts X-Bond Stone when that finish procedure applies. Spread tightly in one direction with a trowel or X-Bond smoother at about 1/16 inch / 2 mil.',
      'Between finish coats: allow the coat to dry slightly to the touch, about 20-30 minutes, before the next coat when a second coat is required. Use shoe covers between coats.',
      'Optional MicroBond smooth finish: prime with X-Bond Liquid, then mix 1 part X-Bond Liquid to 2 parts MicroBond Stone and apply with a Magic Trowel.',
      'Before sealer: let the surface dry completely. Color Bond/Natural Grain-style steps list 2-4 hours before the next step; Polished Bond lists at least 12 hours before sealing, or 24 hours in colder conditions.',
      'Sealer: use the specified stocked Semco sealer. For pool/submerged/exterior penetrating-sealer needs, use Natural Shield under the current stocked-sealer rule. For Satin Stone, Titan Gloss, or Matte, follow that sealer procedure.',
      'Final warranty record: capture photos at prep, membrane/primer, scratch/base, finish, sealer, and final handover. Missing stage photos can block warranty qualification.',
    ],
    plywood: [
      'Pre-check: confirm plywood / OSB is structural, fastened, stable, dry, and not flexing. Stop if the floor moves, deflects, swells, or has water damage.',
      'Stage photo: take a clear substrate/prep photo before covering joints.',
      'Prep Type E: sweep debris, roll 1 coat of Liquid Membrane over the wood, and allow it to dry.',
      'Fabric: apply Liquid Membrane again and, while wet, embed anti-fracture fabric with an 18 inch smoother, trowel, or roller.',
      'Immediately roll two additional coats of Liquid Membrane with pressure. Overlap fabric seams by at least 2 inches.',
      'Brown Coat over wood/anti-fracture membrane: roll X-Bond Liquid as primer and do not let it dry. Mix 1 part X-Bond Liquid + 1 part X-Bond Additive first, then add 2 1/2 parts X-Bond Stone. Mix with a square paddle at 180-200 RPM.',
      'Spread Brown Coat with a gauge rake and X-Bond smoother. Spike shoes are recommended. Let Brown Coat dry at least 12 hours depending on thickness.',
      'Continue with the specified X-Bond finish and stocked Semco sealer. Capture membrane, base, finish, sealer, and final photos.',
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
    pool: [
      'Treat pool/submerged work as wet-area/submerged work, not a normal floor.',
      'Confirm the shell is sound, stable, and not actively leaking. Remove calcium/mineral/alkali/efflorescence/pool residue before coating.',
      'Prep with Nu-Lift where mineral residue is present, then Stone Soap 1:4 final wash, rinse/vacuum, and dry.',
      'Use the wet-area Liquid Membrane build-up where the detail requires it. Inspect for pinholes, voids, thin spots, and defects before covering.',
      'Apply the specified X-Bond build-up and select Pool in the Calculator for quantities.',
      'Use Natural Shield as the current stocked penetrating sealer for pool/submerged and exterior exposure.',
      'Capture stage photos because warranty risk is higher in submerged work.',
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

  return [
    `Answer: For ${substrateLabel}, follow the Semco build-up and do not skip prep or photo documentation.`,
    '',
    'Do this:',
    ...buildUps[substrateType].map((item) => `- ${item}`),
    '',
    'Watch out:',
    '- If the substrate is loose, moving, contaminated, or wet beyond the system limit, stop and get Semco review.',
    '- For warranty, capture photos at prep, membrane/primer, base, finish, sealer, and final handover.',
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
      'Use Brown Coat over wood/anti-fracture membrane where the detail requires build-up.',
    ],
    wall_board: [
      'Confirm the board/panel is stable, dry, fastened, and not damaged.',
      'For wet walls, joints, corners, and seams, use Liquid Membrane and fabric reinforcement before finish.',
      'Drywall is walls only, not a floor substrate.',
    ],
    pool_submerged: [
      'Treat as wet-area/submerged work. Remove mineral/pool residue, use the wet-area Liquid Membrane build-up, and use Natural Shield as the current stocked penetrating sealer.',
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
    `Answer: For ${label}, first use the documented prep path, then only proceed if the surface is sound and bondable.`,
    '',
    'Prep:',
    ...prepLines[group].map((item) => `- ${item}`),
    '',
    'Build-up after prep:',
    '- Roll X-Bond Liquid as primer and do not allow it to dry.',
    '- For floor scratch coat, mix 1 part X-Bond Liquid to 2 parts X-Bond Stone at low speed, 180-200 RPM, using a square mixing paddle.',
    '- Spread the scratch coat tightly in one direction, let it dry, scrape loose particles, and sweep clean.',
    '- Use Liquid Membrane/fabric at cracks, joints, seams, corners, drains, wet areas, and movement-risk areas where the detail requires it.',
    '- Use Brown Coat only when leveling, filling voids over 1/8 inch, building over anti-fracture membrane, or correcting height transitions. Brown Coat mix: 1 part X-Bond Liquid + 1 part X-Bond Additive first, then 2 1/2 parts X-Bond Stone at 180-200 RPM.',
    '- Apply the specified X-Bond finish and stocked Semco sealer after the build-up is ready.',
    '',
    'Stop and review:',
    '- loose, moving, hollow, wet, soft, delaminating, spalling, dusty, rusting, or unknown surfaces',
    '- any surface where adhesion has not been confirmed',
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
    facts.prepSurfaceGroup ? `prep_group=${facts.prepSurfaceGroup}` : null,
    facts.sealerSku ? `sealer=${facts.sealerSku}` : null,
    facts.wantsAllPrep ? 'scope=all surface prep' : null,
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

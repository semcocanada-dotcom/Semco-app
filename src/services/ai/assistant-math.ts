import type { SubstrateId } from '@/constants/substrates';
import { SQFT_PER_SQM } from '@/constants/product-coverage';
import { calculate } from '@/services/calculator';
import { getFormulaForBatch, type BatchSize } from '@/services/color-scaler';
import type { PigmentRatio } from '@/database/schema/colors';
import colorsData from '@/database/seed/colors.json';
import type { AssistantJobContext } from './job-context';

/**
 * Deterministic in-chat math for Semco Guide.
 *
 * Every number here comes from the same sources the rest of the app uses:
 * the Calculator engine (calculate/product-coverage), the verified mixing
 * ratios already encoded in the field rules, and the imported X-Bond tint
 * formulas in colors.json. Nothing is remotely generated or estimated, and
 * anything this module cannot parse falls through to the normal
 * retrieval/answer path.
 */

export interface MathAnswer {
  content: string;
  kind: 'quantity' | 'quantity_input' | 'mix_ratio' | 'coverage_fact' | 'tint_formula' | 'glossary';
  quickReplies?: string[];
  followUps?: string[];
}

interface HistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Markers kept stable so a bare reply ("450 sq ft", "Concrete") can be
// recognised as the answer to our own question on the next turn.
const AREA_QUESTION_MARKER = 'What area are we covering?';
const SUBSTRATE_QUESTION_MARKER = 'before the material count';

const DEFAULT_WASTE_PCT = 10;

export function buildMathAnswer(
  context: AssistantJobContext,
  userMessage: string,
  history: HistoryMessage[] = [],
): MathAnswer | null {
  const normalized = normalize(userMessage);
  if (!normalized) return null;

  return (
    glossaryAnswer(normalized)
    ?? tintFormulaAnswer(normalized)
    ?? mixRatioAnswer(normalized)
    ?? coverageFactAnswer(normalized)
    ?? quantityAnswer(context, normalized, history)
  );
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9/.%x-\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

/* ------------------------------------------------------------------ */
/* Glossary — plain-language definitions for people learning the trade */
/* ------------------------------------------------------------------ */

const GLOSSARY: { term: string; aliases: string[]; definition: string; example: string }[] = [
  { term: 'Substrate', aliases: ['substrate'], definition: 'The surface you are coating over — like the concrete slab, plywood, tile, or wall board that is already there.', example: 'On a bathroom job, the shower wall board is the substrate; the X-Bond goes on top of it.' },
  { term: 'Scratch coat', aliases: ['scratch coat', 'base coat'], definition: 'The first thin coat of X-Bond. It grabs the substrate and gives the next coats something solid to bond to.', example: 'Mix the scratch coat 1 part X-Bond Liquid to 2 parts Stone and pull it tight over the whole floor.' },
  { term: 'Finish coat', aliases: ['finish coat', 'texture coat'], definition: 'The visible top layer of X-Bond. This is where you control the final texture and look.', example: 'After the scratch coat dries, the finish coat is what the customer will actually see.' },
  { term: 'Pot life', aliases: ['pot life'], definition: 'How long mixed material stays workable in the bucket before it starts setting and must be thrown out.', example: 'If the sealer has a 1-hour pot life, only mix what you can apply in that hour.' },
  { term: 'Cure vs dry', aliases: ['cure', 'curing', 'cure time'], definition: 'Dry means it feels dry to the touch. Cured means it has reached full hardness and chemical resistance, which takes longer.', example: 'A floor can be dry enough to recoat in hours but still need days to fully cure before heavy traffic.' },
  { term: 'Efflorescence', aliases: ['efflorescence', 'efflorescent'], definition: 'The white, powdery mineral residue that moisture pushes out of concrete or masonry. It blocks bonding and must be cleaned off first.', example: 'White chalky streaks on a basement wall are efflorescence — clean and neutralize before coating.' },
  { term: 'Mil', aliases: ['mil', 'mils'], definition: 'A thickness unit: one mil is one thousandth of an inch. Coating thickness is measured in mils.', example: 'Four 15-mil coats of Liquid Membrane build roughly a 60-mil waterproofing layer.' },
  { term: 'Fabric detail', aliases: ['fabric detail', 'fabric', 'reinforcing fabric'], definition: 'Reinforcing fabric embedded into wet Liquid Membrane at joints, corners, and cracks so movement does not tear the waterproofing.', example: 'Push the fabric into wet membrane at every inside corner of the shower, then coat over it.' },
  { term: 'Dwell time', aliases: ['dwell time', 'dwell'], definition: 'How long a cleaner needs to sit on the surface and work before you scrub and rinse it off.', example: 'Let the Stone Soap mix dwell for a few minutes before scrubbing so it can break down the grime.' },
  { term: 'Skim coat', aliases: ['skim coat', 'skim'], definition: 'A very thin leveling pass used to smooth small imperfections rather than build thickness.', example: 'A quick skim coat can knock down trowel lines before the finish coat.' },
  { term: 'Waste factor', aliases: ['waste factor', 'waste percentage', 'waste percent'], definition: 'Extra material added to an order (usually about 10%) to cover spillage, edges, texture, and mistakes.', example: 'For 600 sq ft, a 10% waste factor means ordering material for 660 sq ft.' },
  { term: 'Submerged', aliases: ['submerged'], definition: 'Constantly under water or holding water — like a pool, pond, or fountain. Submerged work uses different coat counts and sealers than a shower.', example: 'A pond shell is submerged work, so Liquid Membrane needs 3 coats, not the standard 2.' },
  { term: 'Bond / adhesion', aliases: ['adhesion', 'bond', 'bonding'], definition: 'How strongly the coating grips the surface underneath. Bad prep means bad adhesion, and the coating can peel or delaminate.', example: 'X-Bond over dusty concrete will have poor adhesion — vacuum and clean first.' },
  { term: 'Delamination', aliases: ['delamination', 'delaminate', 'delaminating'], definition: 'When a layer lets go and separates from the surface under it, usually from poor prep, moisture, or movement.', example: 'Hollow-sounding tile is delaminating — do not coat over it until it is removed or repaired.' },
];

function glossaryAnswer(normalized: string): MathAnswer | null {
  const asked = normalized.match(/what does ([a-z\s/-]+?) mean/)?.[1]
    ?? normalized.match(/what is (?:a |an |the )?([a-z\s/-]+?)(?: exactly)?$/)?.[1]
    ?? normalized.match(/meaning of ([a-z\s/-]+)$/)?.[1];
  if (!asked) return null;

  const term = asked.trim();
  const entry = GLOSSARY.find((item) => item.aliases.some((alias) => alias === term || term === `${alias}s`));
  if (!entry) return null;

  return {
    kind: 'glossary',
    content: [
      `**${entry.term}** — ${entry.definition}`,
      '',
      `In the field: ${entry.example}`,
    ].join('\n'),
    followUps: ['Show me the full field sequence', 'What photos are needed for warranty?'],
  };
}

/* ------------------------------------------------------- */
/* Mixing ratios — verified Semco field rules, scaled linearly */
/* ------------------------------------------------------- */

interface MixRule {
  name: string;
  match: string[];
  /** Requires one of these words to also be present ('mix', 'ratio'...). */
  needsMixWord?: boolean;
  lines: string[];
  /** Gallons of X-Bond Liquid per 50 lb bag, when bag scaling applies. */
  liquidGalPerBag?: number;
}

const MIX_WORDS = ['mix', 'mixing', 'ratio', 'parts', 'dilute', 'dilution', 'how much liquid', 'how much water'];

const MIX_RULES: MixRule[] = [
  {
    name: 'X-Bond Stone full-bag mix',
    match: ['bag'],
    needsMixWord: true,
    liquidGalPerBag: 2,
    lines: [
      'The standard X-Bond Stone mix is **2 gallons of X-Bond Liquid per 50 lb bag of X-Bond Stone**. One bag covers about 75 sq ft of finished system at 1/8 inch — that is the complete build-up with all coats together, not per coat.',
      '',
      'Pour the liquid in first, then add the stone while mixing with a square paddle at low speed (180-200 RPM). Mix until smooth with no dry pockets.',
    ],
  },
  {
    name: 'Scratch / base coat',
    match: ['scratch coat', 'base coat', 'first coat'],
    lines: [
      'Scratch (base) coat mix: **1 part X-Bond Liquid to 2 parts X-Bond Stone**, by volume.',
      '',
      'Liquid goes in the bucket first, then the stone. Square paddle, low speed 180-200 RPM. The scratch coat is what grabs the substrate, so keep it tight and full-coverage.',
    ],
  },
  {
    name: 'Finish coat',
    match: ['finish coat', 'final coat', 'texture coat'],
    lines: [
      'Finish coat mix: **1 part X-Bond Liquid to 2 1/2 parts X-Bond Stone**, by volume.',
      '',
      'Slightly more stone than the scratch coat, which tightens the mix for the visible surface. Square paddle at 180-200 RPM. This is the coat you control texture with, so mix consistently between batches.',
    ],
  },
  {
    name: 'Wall mix',
    match: ['wall mix', 'mix for wall', 'mix for the wall', 'walls'],
    needsMixWord: true,
    lines: [
      'Wall mix: **1 part X-Bond Liquid to 3 parts X-Bond Stone**, by volume.',
      '',
      'The extra stone stiffens the mix so it hangs on vertical surfaces without sagging. Square paddle at 180-200 RPM.',
    ],
  },
  {
    name: 'Brown Coat build-up',
    match: ['brown coat'],
    needsMixWord: true,
    lines: [
      'Brown Coat mix: **1 part X-Bond Liquid + 1 part X-Bond Additive first, then 2 1/2 parts X-Bond Stone**.',
      '',
      'Mix at 180-200 RPM with a square paddle and allow at least 12 hours of dry time. Remember: Brown Coat is only for leveling, filling larger voids, or height correction — it is not an automatic layer.',
    ],
  },
  {
    name: 'MicroBond smooth finish',
    match: ['microbond', 'micro bond'],
    needsMixWord: true,
    lines: [
      'MicroBond mix: **1 part X-Bond Liquid to 2 parts MicroBond Stone**, by volume — that works out to about **2 1/2 gallons of X-Bond Liquid per 5 gal / 30 lb MicroBond pail**.',
      '',
      'Apply with a Magic Trowel in 2 coats. One pail finishes about 1000 sq ft.',
    ],
  },
  {
    name: 'Stone Soap dilution',
    match: ['stone soap'],
    lines: [
      'Stone Soap dilution: **1 part Stone Soap to 4 parts clean water**.',
      '',
      'Let it dwell (sit and work) on the surface for a few minutes, scrub, then rinse fully. Residue left behind hurts adhesion.',
    ],
  },
  {
    name: 'Power Cleaner dilution',
    match: ['power cleaner'],
    lines: [
      'Power Cleaner dilution: **1 part Power Cleaner to 4 parts clean water**.',
      '',
      'Use it for grease/oil contamination. Dwell, scrub, and rinse until the water sheets clean.',
    ],
  },
  {
    name: 'Nu-Lift dilution',
    match: ['nu-lift', 'nu lift', 'nulift'],
    lines: [
      'Nu-Lift dilution: **1 part Nu-Lift to 1 part clean water** for stronger concrete prep.',
      '',
      'Rinse thoroughly afterwards — cleaner residue is a bond breaker.',
    ],
  },
];

const NUMBER_WORDS: Record<string, number> = {
  half: 0.5, one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
};

function parseCount(normalized: string, unitPattern: string): number | null {
  const numeric = normalized.match(new RegExp(`(\\d+(?:\\.\\d+)?)\\s*(?:x\\s*)?${unitPattern}`));
  if (numeric?.[1]) return Number(numeric[1]);

  const word = normalized.match(new RegExp(`\\b(half|one|two|three|four|five|six|seven|eight|nine|ten)\\b[a-z\\s]{0,12}${unitPattern}`));
  if (word?.[1]) return NUMBER_WORDS[word[1]] ?? null;

  if (new RegExp(`\\ba ${unitPattern}`).test(normalized)) return 1;
  if (new RegExp(`half a ${unitPattern}`).test(normalized)) return 0.5;
  return null;
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : String(Math.round(value * 100) / 100);
}

function mixRatioAnswer(normalized: string): MathAnswer | null {
  const hasMixWord = MIX_WORDS.some((word) => normalized.includes(word));

  const rule = MIX_RULES.find((entry) =>
    entry.match.some((term) => normalized.includes(term)) && (!entry.needsMixWord || hasMixWord));

  if (!rule) {
    // Generic "what's the mix ratio" with no specific coat named: give the
    // X-Bond overview so a learner sees how the ratios relate.
    if (hasMixWord && /x-?bond|x bond/.test(normalized) && !/liquid membrane|sealer|satin|shield|titan|matte/.test(normalized)) {
      return {
        kind: 'mix_ratio',
        content: [
          'X-Bond mixes change slightly by coat. All of them: liquid in the bucket first, then stone, square paddle at low speed (180-200 RPM), mix until smooth.',
          '',
          '**Full bag mix:** 2 gal X-Bond Liquid per 50 lb bag. One bag covers about 75 sq ft of finished system at 1/8 inch — the complete build-up, not per coat.',
          '',
          '**Scratch / base coat:** 1 part Liquid to 2 parts Stone. This coat grabs the substrate.',
          '',
          '**Finish coat:** 1 part Liquid to 2 1/2 parts Stone. Slightly tighter for the visible surface.',
          '',
          '**Wall mix:** 1 part Liquid to 3 parts Stone, stiffer so it hangs on vertical surfaces.',
          '',
          'Tell me which coat you are mixing and how many bags, and I can work out the liquid for you.',
        ].join('\n'),
        followUps: ['How much liquid do I mix with one bag of X-Bond?', 'How much X-Bond do I need for my area?'],
      };
    }
    return null;
  }

  const lines = [...rule.lines];

  if (rule.liquidGalPerBag) {
    const bags = parseCount(normalized, 'bags?');
    if (bags && bags !== 1) {
      const liquid = bags * rule.liquidGalPerBag;
      lines.push(
        '',
        `For ${formatNumber(bags)} bag${bags === 1 ? '' : 's'}: ${formatNumber(bags)} x 2 gal = **${formatNumber(liquid)} gallons of X-Bond Liquid**.`,
      );
    }
  }

  lines.push('', 'These are the current verified Semco mix rules — do not eyeball the ratio, measure it.');

  return {
    kind: 'mix_ratio',
    content: lines.join('\n'),
    followUps: ['How much X-Bond do I need for my area?', 'What does pot life mean?'],
  };
}

/* --------------------------------------------------- */
/* Coverage facts — "how much does one bag cover" style  */
/* --------------------------------------------------- */

const COVERAGE_FACTS: { match: string[]; unitWords: string[]; lines: string[] }[] = [
  {
    match: ['x-bond', 'xbond', 'x bond', 'bag'],
    unitWords: ['bag'],
    lines: [
      'One 50 lb bag of X-Bond Stone covers about **75 sq ft of finished system at 1/8 inch**, mixed with 2 gallons of X-Bond Liquid.',
      '',
      'That 75 sq ft is for the complete build-up — all the X-Bond coats together — not per coat.',
      '',
      'Rougher substrates, thicker builds, and heavy texture eat into that number, which is why orders carry a waste factor.',
    ],
  },
  {
    match: ['liquid membrane', 'membrane'],
    unitWords: ['gal', 'gallon', 'pail', 'cover', 'coverage', 'go'],
    lines: [
      'SEMCO Liquid Membrane coverage per gallon:',
      '',
      '**Normal (above-grade) work:** about 200-250 sq ft per gallon, applied in 2 coats.',
      '',
      '**Submerged work (pool, pond, holding water):** about 50-75 sq ft per gallon because it is built much thicker — 3+ coats.',
      '',
      'Tell me the area and whether it is submerged, and I can work out the gallons.',
    ],
  },
  {
    match: ['microbond', 'micro bond'],
    unitWords: ['pail', 'cover', 'coverage'],
    lines: [
      'One 5 gal / 30 lb MicroBond pail finishes about **1000 sq ft in 2 coats**, mixed with about 2 1/2 gallons of X-Bond Liquid.',
    ],
  },
];

function coverageFactAnswer(normalized: string): MathAnswer | null {
  if (!/cover|coverage|how far|go per|get out of/.test(normalized)) return null;

  const fact = COVERAGE_FACTS.find((entry) =>
    entry.match.some((term) => normalized.includes(term))
    && entry.unitWords.some((word) => normalized.includes(word)));
  if (!fact) return null;

  return {
    kind: 'coverage_fact',
    content: [...fact.lines, '', 'These are the same coverage numbers the app Calculator uses.'].join('\n'),
    followUps: ['How much X-Bond do I need for my area?', 'What does waste factor mean?'],
  };
}

/* ------------------------------------------------ */
/* Tint formulas — from the imported X-Bond fan deck */
/* ------------------------------------------------ */

interface BundledColor {
  id: string;
  name: string;
  code: string | null;
  pigments: PigmentRatio[];
  swatchHex: string | null;
}

const STANDARD_COLORS = colorsData as unknown as BundledColor[];

const TINT_WORDS = ['tint', 'pigment', 'formula', 'colorant', 'colourant'];

function findColors(normalized: string): BundledColor[] {
  const matches: BundledColor[] = [];

  const codeMatch = normalized.match(/\b(\d{3,4})\s?([a-z])\b/);
  if (codeMatch) {
    const code = `${codeMatch[1]}${codeMatch[2]}`.toUpperCase();
    const byCode = STANDARD_COLORS.filter((color) => color.code?.toUpperCase() === code);
    if (byCode.length) return byCode;
  }

  for (const color of STANDARD_COLORS) {
    const name = color.name?.toLowerCase();
    if (name && name.length >= 4 && normalized.includes(name)) {
      matches.push(color);
    }
  }

  // Prefer the longest name so "Sunny Lemon Dream" beats "Sunny Lemon".
  return matches.sort((a, b) => (b.name?.length ?? 0) - (a.name?.length ?? 0)).slice(0, 4);
}

function batchLabel(batch: BatchSize): string {
  if (batch === 'quart') return '1 quart (946 ml) of X-Bond Liquid';
  if (batch === 'gallon') return '1 gallon (3.8 L) of X-Bond Liquid';
  return '5 gallons (18.9 L) of X-Bond Liquid';
}

function tintFormulaAnswer(normalized: string): MathAnswer | null {
  if (!TINT_WORDS.some((word) => normalized.includes(word))) return null;

  const colors = findColors(normalized);
  if (colors.length === 0) {
    if (/tint|pigment|colorant|colourant/.test(normalized)) {
      return {
        kind: 'tint_formula',
        content: [
          'I can pull the exact tint formula for any standard Semco X-Bond fan deck colour.',
          '',
          'Give me the colour name or code — for example "tint formula for Sunny Lemon" or "formula for 2001P".',
          '',
          'Custom colours you created live on your Colours screen with their saved formulas.',
        ].join('\n'),
        followUps: ['What is the mix ratio for the scratch coat?'],
      };
    }
    return null;
  }

  if (colors.length > 1) {
    return {
      kind: 'tint_formula',
      content: 'I found a few colours that could match. Which one do you mean?',
      quickReplies: colors.map((color) => `Tint formula for ${color.name}${color.code ? ` (${color.code})` : ''}`),
    };
  }

  const color = colors[0];
  const pigments = Array.isArray(color.pigments) ? color.pigments : [];
  if (pigments.length === 0) {
    return {
      kind: 'tint_formula',
      content: `${color.name}${color.code ? ` (${color.code})` : ''} has no pigment addition — it is the natural cement tone.`,
    };
  }

  // Requested batch: explicit 5-gallon, quart, or N-gallon multiples.
  const gallonsAsk = normalized.match(/(\d+(?:\.\d+)?)\s*gal/);
  const wantsQuart = /quart/.test(normalized);

  let batch: BatchSize = 'gallon';
  let multiplier = 1;
  let scalingNote = '';

  if (wantsQuart) {
    batch = 'quart';
  } else if (gallonsAsk) {
    const gallons = Number(gallonsAsk[1]);
    if (gallons === 5) {
      batch = 'five_gallon';
    } else if (gallons > 0 && Number.isInteger(gallons) && gallons % 5 === 0) {
      batch = 'five_gallon';
      multiplier = gallons / 5;
    } else if (gallons > 0 && Number.isInteger(gallons)) {
      batch = 'gallon';
      multiplier = gallons;
    } else if (gallons > 0) {
      batch = 'gallon';
      scalingNote = `The verified batches are quart, 1 gallon, and 5 gallon. For ${formatNumber(gallons)} gallons, mix whole 1-gallon batches — partial-batch scaling is not part of the verified formula data.`;
    }
  }

  const formula = getFormulaForBatch(pigments, batch);
  const sizeName = batch === 'quart' ? 'quart' : batch === 'gallon' ? '1-gallon' : '5-gallon';

  const lines: string[] = [
    `Tint formula for **${color.name}${color.code ? ` (${color.code})` : ''}** — per ${batchLabel(batch)}:`,
    '',
    ...formula.pigments.map((line) => `- ${formatTintLabel(line.pigmentCode, line.pigmentName)}: **${line.displayAmount}**`),
  ];

  if (multiplier > 1) {
    lines.push(
      '',
      `For your batch, mix the ${sizeName} formula ${multiplier} times (${multiplier} separate ${sizeName} batches). Totals across all batches:`,
      ...formula.pigments.map((line) => `- ${formatTintLabel(line.pigmentCode, line.pigmentName)}: ${formatNumber(line.mlAmount)} ml x ${multiplier} = **${formatNumber(line.mlAmount * multiplier)} ml**`),
    );
  }

  if (scalingNote) lines.push('', scalingNote);

  lines.push(
    '',
    formula.mixingNotes,
    '',
    'Use the ml amounts shown here for installer mixing. Always confirm with a cured sample because screens and lighting shift the colour.',
  );

  return {
    kind: 'tint_formula',
    content: lines.join('\n'),
    followUps: ['What is the mix ratio for the scratch coat?', 'What sealer do I use for this?'],
  };
}

/* ------------------------------------------------------- */
/* Material quantities — runs the real Calculator formulas   */
/* ------------------------------------------------------- */

function formatTintLabel(code: string, name: string): string {
  const cleanCode = code.trim();
  const cleanName = name.trim();
  if (cleanCode === 'I') {
    return 'Brown Oxide';
  }
  if ((cleanCode === 'I' || cleanCode === 'AXN AXX') && (!cleanName || cleanName === cleanCode)) {
    return `Tint code ${cleanCode}`;
  }
  if (cleanCode === 'D + F + B' && (!cleanName || cleanName === cleanCode)) {
    return `Composite tint ${cleanCode}`;
  }
  return cleanName || `Tint code ${cleanCode || 'unknown'}`;
}

const QUANTITY_ASK_WORDS = ['how much', 'how many', 'do i need', 'materials for', 'material for', 'order for', 'quantities for'];
const QUANTITY_PRODUCT_WORDS = ['x-bond', 'xbond', 'x bond', 'bag', 'bags', 'liquid membrane', 'membrane', 'microbond', 'sealer', 'satin stone', 'natural shield', 'titan', 'matte', 'material', 'materials', 'product', 'stone'];

const SUBSTRATE_FROM_CONTEXT: Record<string, SubstrateId> = {
  concrete: 'concrete',
  tile: 'existing_tile',
  plywood_osb: 'plywood',
  glasroc_board: 'cement_board',
  drywall: 'gypsum_board',
  metal: 'metal',
  icf: 'icf',
  pool_shell: 'pool',
};

const SEALER_FROM_CONTEXT: Record<string, string> = {
  satin_stone: 'SATIN-STONE',
  natural_shield: 'NATURAL-SHIELD',
  titan_gloss: 'TITAN-SHIELD',
  matte: 'MATTE-SEALER',
};

function parseAreaSqft(normalized: string): number | null {
  const sqft = normalized.match(/(\d+(?:\.\d+)?)\s*(?:sq\s?ft|sqft|square\s?feet|square\s?foot|ft2|sf)\b/);
  if (sqft?.[1]) return Number(sqft[1]);

  const sqm = normalized.match(/(\d+(?:\.\d+)?)\s*(?:sq\s?m|sqm|square\s?met(?:er|re)s?|m2)\b/);
  if (sqm?.[1]) return Number(sqm[1]) * SQFT_PER_SQM;

  // Room dimensions like "20 by 30", "20x30", "20 x 30 ft" — summed.
  const dims = [...normalized.matchAll(/(\d+(?:\.\d+)?)\s*(?:x|by)\s*(\d+(?:\.\d+)?)/g)];
  if (dims.length > 0) {
    const metric = /met(?:er|re)|\bm\b/.test(normalized) && !/feet|ft\b/.test(normalized);
    const total = dims.reduce((sum, match) => sum + Number(match[1]) * Number(match[2]), 0);
    return metric ? total * SQFT_PER_SQM : total;
  }

  return null;
}

function parseWastePct(normalized: string): number | null {
  const waste = normalized.match(/(\d+(?:\.\d+)?)\s*%?\s*(?:waste|extra)/);
  return waste?.[1] ? Number(waste[1]) : null;
}

function isQuantityAsk(normalized: string): boolean {
  if (/how many coats|coat count|how many photos/.test(normalized)) return false;
  const asks = QUANTITY_ASK_WORDS.some((word) => normalized.includes(word));
  const productish = QUANTITY_PRODUCT_WORDS.some((word) => normalized.includes(word));
  return asks && productish;
}

function quantityAnswer(
  context: AssistantJobContext,
  normalized: string,
  history: HistoryMessage[],
): MathAnswer | null {
  const lastAssistant = [...history].reverse().find((message) => message.role === 'assistant');
  const answeringOurAreaQuestion = Boolean(lastAssistant?.content.includes(AREA_QUESTION_MARKER));
  const answeringOurSubstrateQuestion = Boolean(lastAssistant?.content.includes(SUBSTRATE_QUESTION_MARKER));

  if (!isQuantityAsk(normalized) && !answeringOurAreaQuestion && !answeringOurSubstrateQuestion) return null;

  // Pull the area from this message, or from the installer's recent
  // messages so "600 sq ft" said two turns ago still counts.
  let areaSqft = parseAreaSqft(normalized);
  if (areaSqft == null) {
    const recentUser = history.filter((message) => message.role === 'user').slice(-4).reverse();
    for (const message of recentUser) {
      areaSqft = parseAreaSqft(normalize(message.content));
      if (areaSqft != null) break;
    }
  }
  if (areaSqft == null && answeringOurAreaQuestion) {
    const bare = normalized.match(/^(\d+(?:\.\d+)?)$/);
    if (bare?.[1]) areaSqft = Number(bare[1]);
  }

  const substrate = SUBSTRATE_FROM_CONTEXT[context.substrate];

  if (areaSqft == null) {
    return {
      kind: 'quantity_input',
      content: [
        'I can work that out with the same formulas as the app Calculator.',
        '',
        `${AREA_QUESTION_MARKER} Give me the square feet, or room sizes like "20 by 30".`,
      ].join('\n'),
    };
  }

  if (!substrate) {
    return {
      kind: 'quantity_input',
      content: [
        `Got it — about ${formatNumber(Math.round(areaSqft))} sq ft. One more thing before the material count: what substrate is this going over?`,
        '',
        'The substrate changes the prep products and, for pools, the membrane and sealer.',
      ].join('\n'),
      quickReplies: ['Concrete', 'Existing tile', 'Plywood / OSB', 'GlasRoc or similar board'],
    };
  }

  const wastePct = parseWastePct(normalized) ?? DEFAULT_WASTE_PCT;
  const submerged = context.exposure === 'submerged' || substrate === 'pool';

  let result;
  try {
    result = calculate({
      areaSqft,
      substrateType: substrate,
      wastePct,
      sealerSku: SEALER_FROM_CONTEXT[context.finish],
      waterproofingMode: submerged ? 'submerged' : 'above_grade',
      finishSku: context.system === 'microbond' ? 'MICROBOND-SMOOTH' : 'XBOND-STANDARD',
    });
  } catch (error) {
    console.warn('[assistant-math] calculate failed:', error);
    return null;
  }

  const adjustedSqft = Math.round(areaSqft * (1 + wastePct / 100));
  const quantified = result.layers.filter((layer) => layer.category !== 'prep');
  const prep = result.layers.filter((layer) => layer.category === 'prep');

  const lines: string[] = [
    `Here is the material count for **${formatNumber(Math.round(areaSqft))} sq ft** over ${substrateLabelFor(substrate)}${submerged ? ' (submerged work)' : ''}, using the same formulas as the app Calculator.`,
    '',
    `With the ${wastePct}% waste factor (extra for edges, texture, and spillage), we plan for ${formatNumber(adjustedSqft)} sq ft.`,
  ];

  for (const layer of quantified) {
    const exact = layer.exactQuantity ?? layer.quantityPacks;
    const perUnit = exact > 0 ? adjustedSqft / exact : 0;
    const mathLine = exact > 0 && perUnit > 0
      ? `${formatNumber(adjustedSqft)} sq ft ÷ ~${formatNumber(Math.round(perUnit))} sq ft per ${layer.packLabel ?? 'unit'} = ${formatNumber(Math.round(exact * 10) / 10)}`
      : '';

    const coatsNote = layer.productSku === 'XBOND'
      ? 'Covers the complete system build-up, not per coat.'
      : layer.coats > 1
        ? `Applied in ${layer.coats} coats — the coverage number already includes all coats.`
        : '';
    lines.push(
      '',
      `**${layer.productName}** — ${layer.purchaseLabel ?? layer.quantityLabel}`,
      [mathLine, coatsNote].filter(Boolean).join(' → rounded up to the package size. '),
    );
  }

  if (prep.length > 0) {
    lines.push(
      '',
      `Also stage as needed for prep: ${prep.map((layer) => layer.productName).join(', ')}.`,
    );
  }

  lines.push(
    '',
    'Double-check this in the Calculator screen with your real measurements — that saves the estimate to the project and feeds the material request.',
  );

  return {
    kind: 'quantity',
    content: lines.join('\n'),
    followUps: ['What is the mix ratio for the scratch coat?', 'What photos are needed for warranty?'],
  };
}

function substrateLabelFor(substrate: SubstrateId): string {
  const labels: Partial<Record<SubstrateId, string>> = {
    concrete: 'concrete',
    existing_tile: 'existing tile',
    plywood: 'plywood/OSB',
    cement_board: 'GlasRoc or similar board',
    gypsum_board: 'drywall',
    metal: 'metal',
    icf: 'ICF',
    pool: 'a concrete pool shell',
  };
  return labels[substrate] ?? substrate;
}

import type { AssistantCitation } from '@/database/schema/conversations';
import { TECHNICAL_DOC_PAGES } from './technical-docs';

/** Reviewed teaching notes, not user-generated facts or new specifications. */
export const GUIDE_KNOWLEDGE_VERSION = '2026-09-11.1';
export interface GuideProductKnowledge {
  id: string;
  name: string;
  aliases: string[];
  role: string;
  useFor: string;
  notFor: string;
  firstSteps: string[];
  sourcePages: number[];
  policy?: 'stocked-sealers';
}

export const GUIDE_PRODUCTS: readonly GuideProductKnowledge[] = [
  {
    id: 'x-bond', name: 'X-Bond Stone', aliases: ['x bond stone', 'x bond', 'xbond', 'seamless stone'],
    role: 'The powder that combines with X-Bond Liquid to make the trowelled surface.',
    useFor: 'The main X-Bond base and decorative finish layers on a properly prepared surface.',
    notFor: 'It is not mixed with plain water and is not a substitute for the waterproofing detail.',
    firstSteps: ['Choose the wall, scratch-coat, or finish-coat procedure first: they use different mix ratios.', 'Add X-Bond Liquid first, then the measured powder. Use a square paddle at low speed (180–200 RPM) to avoid whipping in air.', 'Apply to the correctly prepared surface. Where X-Bond Liquid is the primer, the next coat goes on while that primer is still tacky, not after it has dried.'],
    sourcePages: [14, 27, 33, 35],
  },
  {
    id: 'x-bond-liquid', name: 'X-Bond Liquid', aliases: ['x bond liquid', 'xbond liquid', 'xb liquid'],
    role: 'The liquid component used with X-Bond Stone or MicroBond, and the primer in the specified X-Bond procedures.',
    useFor: 'Binding the powder into the mix; it also carries the tint when the colour formula is added to the liquid.',
    notFor: 'It is not Liquid Membrane. Using it as a primer does not replace waterproofing.',
    firstSteps: ['Measure it for the specific coat you are making; do not use one mix ratio for every coat.', 'For a tinted mix, combine the specified tint with the X-Bond Liquid before adding the stone powder.', 'When using it as the specified primer, only prime an area you can coat while the liquid remains tacky.'],
    sourcePages: [14, 27, 33, 35],
  },
  {
    id: 'microbond', name: 'MicroBond', aliases: ['microbond', 'micro bond', 'x bond micro'],
    role: 'The finer material used to create a smoother finish over the prepared X-Bond surface.',
    useFor: 'Reducing the visible texture when the selected finish calls for a smooth or ultra-smooth surface.',
    notFor: 'It is not a shortcut for leveling, repairing a weak base, or waterproofing.',
    firstSteps: ['Make sure the underlying X-Bond layers are ready, clean, and free of loose material.', 'For the SIP smooth-finish procedure, prime with X-Bond Liquid and mix 1 part X-Bond Liquid to 2 parts MicroBond Stone.', 'Spread evenly using a Magic Trowel. The vertical ultra-smooth detail uses two coats.', 'Let the selected finish procedure complete before sealing. Check the result against the approved sample.'],
    sourcePages: [33, 35],
  },
  {
    id: 'liquid-membrane', name: 'Liquid Membrane', aliases: ['liquid membrane', 'waterproofing membrane'],
    role: 'The flexible waterproofing and crack-control layer underneath the finish.',
    useFor: 'The specified wet-area, joint, corner, seam and crack details. Fabric reinforces the places called for by that detail.',
    notFor: 'It is not X-Bond Liquid, a finish sealer, or a fix for a moving structure or active leak.',
    firstSteps: ['Start with a clean, sound surface. Complete the joint, corner and fabric details required for the assembly.', 'Press required fabric into wet membrane without wrinkles or air pockets; overlap fabric seams by at least 2 inches.', 'Apply the coat count and thickness for the actual exposure. A standard Canadian interior shower and a submerged pool do not use the same detail.', 'When dry to the touch, inspect for tiny holes, gaps and thin spots. Close these defects with additional Liquid Membrane before hiding the waterproofing.'],
    sourcePages: [28, 29],
  },
  {
    id: 'fabric', name: 'Reinforcement fabric', aliases: ['reinforcement fabric', 'anti fracture fabric', 'fabric', 'mesh'],
    role: 'The reinforcement embedded in Liquid Membrane where the assembly requires it.',
    useFor: 'Required seams, joints, corners, transitions and crack-control details.',
    notFor: 'Dry fabric on its own is not waterproofing and cannot stabilize a moving structure.',
    firstSteps: ['Use the fabric layout specified for the assembly; the calculator roll count does not approve the layout.', 'Embed it into wet Liquid Membrane. Keep it flat and fully worked into the membrane.', 'Overlap fabric seams by at least 2 inches, cover it with the required membrane coats, and inspect before covering the work.'],
    sourcePages: [28, 29],
  },
  {
    id: 'brown-coat', name: 'Brown Coat', aliases: ['brown coat'],
    role: 'An X-Bond build-up/leveling mix, not the final decorative colour coat.',
    useFor: 'Leveling and filling where the selected detail requires extra build-up.',
    notFor: 'It is not automatically needed on every job; do not choose a thick pour from a generic chat answer.',
    firstSteps: ['Identify the depth and area to be leveled and use the approved detail for that substrate.', 'The SIP Brown Coat mix combines 1 part X-Bond Liquid and 1 part X-Bond Additive first, then 2½ parts X-Bond Stone, mixed at 180–200 RPM.', 'Apply over the specified tacky X-Bond Liquid primer and spread evenly with a gauge rake and smoother. Drying depends on the actual build-up; do not cover soft material.'],
    sourcePages: [30],
  },
  {
    id: 'x-bond-additive', name: 'X-Bond Additive', aliases: ['x bond additive', 'xbond additive'],
    role: 'A separate ingredient used with X-Bond Liquid and Stone in the Brown Coat build-up mix.',
    useFor: 'The specified Brown Coat recipe when the job needs leveling or extra build-up.',
    notFor: 'It is not the finished Brown Coat, not a replacement for X-Bond Liquid, and not automatically added to every finish mix.',
    firstSteps: ['Use it only when the selected build-up calls for Brown Coat.', 'The SIP recipe mixes 1 part X-Bond Liquid with 1 part X-Bond Additive first, then adds 2½ parts X-Bond Stone at low speed (180–200 RPM).', 'Choose the build-up thickness and drying requirement from the matching job detail before placing the mix.'],
    sourcePages: [30],
  },
  {
    id: 'stone-soap', name: 'Stone Soap', aliases: ['stone soap'],
    role: 'The neutral cleaner for general cleaning and the specified SIP cleaning passes.',
    useFor: 'Routine cleaning and the general-cleaner part of a preparation sequence.',
    notFor: 'It is not the same as the degreaser or mineral-deposit cleaner. Prep dilution is not automatically the same as maintenance dilution.',
    firstSteps: ['Choose preparation or maintenance first, then the surface condition.', 'Use that SIP sequence and dilution. Scrub, rinse thoroughly and remove residue between separate cleaner passes.', 'Never combine different cleaners in one container. Follow each product label and safety sheet for protection and handling.'],
    sourcePages: [11, 12, 14, 15],
  },
  {
    id: 'power-cleaner', name: 'Power Cleaner', aliases: ['power cleaner'],
    role: 'The degreaser for oil and petroleum-based contamination.',
    useFor: 'The oil/grease cleaning pass in the matching SIP preparation sequence.',
    notFor: 'It is not interchangeable with Nu-Lift for mineral deposits, or a general repair for a failing finish.',
    firstSteps: ['Identify the existing surface and contamination before choosing the SIP sequence.', 'Use the specified dilution, scrub/agitate, then rinse and remove residue before the next cleaner pass.', 'Keep different cleaners separate. Follow the label and safety sheet, including eye/skin protection.'],
    sourcePages: [14, 15],
  },
  {
    id: 'nu-lift', name: 'Nu-Lift Cleaner', aliases: ['nu lift', 'nulift', 'nu lift cleaner'],
    role: 'The cleaner aimed at hard-water and mineral deposits.',
    useFor: 'Mineral residue such as calcium or efflorescence in the matching SIP preparation sequence.',
    notFor: 'It is not the oil degreaser. Dilution varies by SIP prep type, so there is no universal dilution for every job.',
    firstSteps: ['Identify the substrate and type of residue first.', 'Follow the correct SIP sequence and dilution; do not substitute the pool recipe for every surface.', 'Scrub, rinse thoroughly and remove residue between separate passes. Do not mix cleaners together. Follow label/SDS precautions.'],
    sourcePages: [14, 15],
  },
  {
    id: 'natural-shield', name: 'Natural Shield', aliases: ['natural shield'],
    role: 'A penetrating sealer: it goes into the pores and leaves a natural, flat appearance.',
    useFor: 'The current Canadian choice for pools, submerged work and exterior penetrating protection.',
    notFor: 'It is not the standard Canadian interior shower finish, and is not a substitute for the membrane underneath.',
    firstSteps: ['Clear loose material and check the finish is ready for sealing.', 'On X-Bond, apply the specified three coats wet-on-wet: do not let one coat dry before the next.', 'Keep it even and avoid puddles, which can leave white haze. Work bottom-up on vertical surfaces to reduce runs.', 'Protect the work through cure. Dry to touch does not mean ready to fill a pool. Use the project’s return-to-water requirement.'],
    sourcePages: [14, 40], policy: 'stocked-sealers',
  },
  {
    id: 'satin-stone', name: 'Satin Stone', aliases: ['satin stone', 'satin sealer', 'satin'],
    role: 'A two-part protective sealer with a satin finish: a softer sheen than gloss.',
    useFor: 'Specified satin protection, including the current Canadian standard interior shower finish.',
    notFor: 'It is not the same as the flat penetrating Natural Shield, and the Canadian standard shower should not inherit an old generic coat count.',
    firstSteps: ['Clear loose material and check the underlying finish is ready.', 'Mix 2 parts A to 1 part B using a low-speed mixer and the specified low-air paddle. Mix a small batch and write its start time on the container.', 'Useful batch life is up to 35 minutes, depending on temperature. Material still being liquid does not prove it is still usable.', 'Use the method and film build for the approved detail. Standard Canadian interior showers use two coats; other applications must use their matching current specification.'],
    sourcePages: [45], policy: 'stocked-sealers',
  },
  {
    id: 'titan-gloss', name: 'Titan Gloss', aliases: ['titan gloss', 'titan shield', 'titan'],
    role: 'The stocked gloss sealer: a protective surface film with a shinier appearance.',
    useFor: 'Jobs where the approved specification calls for the Titan gloss finish.',
    notFor: 'A glossy appearance alone does not make it the right sealer for a shower or submerged pool.',
    firstSteps: ['Check the job’s exposure and confirm Titan Gloss is specified.', 'Make a small approved sample and prepare a clean surface before sealing.', 'Use the current Titan label/technical sheet for application, film thickness and recoat timing. Do not borrow Satin Stone’s two-part mixing ratio.'],
    sourcePages: [], policy: 'stocked-sealers',
  },
  {
    id: 'matte', name: 'Matte sealer', aliases: ['matte sealer', 'semco matte', 'matte'],
    role: 'The stocked matte protective surface film: low sheen without choosing the penetrating Natural Shield.',
    useFor: 'Jobs specified for the current SEMCO Canada matte finish.',
    notFor: 'Matte and Natural Shield can both look low-sheen but do different jobs. Do not copy another sealer’s cure time or mixing instructions.',
    firstSteps: ['Confirm the area’s exposure and that Matte is the specified finish.', 'Check a small approved sample and remove loose material before sealing.', 'The installed Canadian policy confirms its role, but does not provide a verified full Matte application sheet. Check the current pail label/sheet for exact mixing, recoating and cure instructions.'],
    sourcePages: [], policy: 'stocked-sealers',
  },
];

export function guideProductCitations(products: readonly GuideProductKnowledge[]): AssistantCitation[] {
  const pages = new Set(products.flatMap((product) => product.sourcePages));
  const citations: AssistantCitation[] = TECHNICAL_DOC_PAGES
    .filter((page) => page.docId === 'doc-open-sip-manual-master-copy-v2019-3-2' && pages.has(page.pageNumber))
    .map((page) => ({ id: page.id, docId: page.docId, documentName: page.sourceDocument, title: 'SEMCO SIP manual', pageNumber: page.pageNumber, retrieval: 'local' }));
  if (products.some((product) => product.policy)) citations.push({ id: 'guide-stocked-policy', documentName: 'Semco Canada stocked sealer policy', pageNumber: 1, retrieval: 'local' });
  if (products.some((product) => product.id === 'titan-gloss')) {
    const page = TECHNICAL_DOC_PAGES.find((item) => item.docId === 'doc-tech-sheet-titanshield-v8' && item.pageNumber === 1);
    if (page) citations.push({ id: page.id, docId: page.docId, documentName: page.sourceDocument, pageNumber: 1, retrieval: 'local' });
  }
  return citations;
}

export const GUIDE_TERMS = [
  { term: 'substrate', meaning: 'The surface you are putting SEMCO over, such as concrete, tile or drywall. Its condition decides the prep.' },
  { term: 'scratch coat', meaning: 'The first tight, rough bonding coat in the specified build-up. Its job is to grip the prepared base, not create the finished appearance.' },
  { term: 'primer', meaning: 'The bonding layer put down before the next material. In the X-Bond primer procedure, coat it while the X-Bond Liquid is still tacky.' },
  { term: 'tacky', meaning: 'Still sticky, not dried into a hard film. For X-Bond primer, that is the window for applying the next coat.' },
  { term: 'wet on wet', meaning: 'Put the next coat on before the previous coat dries. Natural Shield calls for this; it is not a rule for every SEMCO product.' },
  { term: 'pot life', meaning: 'How long a mixed batch stays usable. Start the clock when the parts are mixed. A batch can look liquid after its usable time has passed.' },
  { term: 'cure', meaning: 'The time the material needs to develop its strength and resistance. Looking dry or feeling dry does not prove it is ready for traffic or water.' },
  { term: 'pinholes', meaning: 'Tiny open holes in the coating, rather than raised bubbles. In dried Liquid Membrane, inspect and close these defects before covering it.' },
  { term: 'sound', meaning: 'Firm and stable: not loose, dusty, hollow, soft or moving. A new coat cannot make a weak layer underneath strong.' },
  { term: 'wet film', meaning: 'The thickness of a coating while it is still wet. Use a wet-film gauge and the product’s specified thickness; coat count alone does not measure thickness.' },
  { term: 'mil', meaning: 'One thousandth of an inch, not a millimetre. It is a thickness measurement, not a mixing ratio.' },
  { term: 'penetrating', meaning: 'Going into the pores of the surface instead of just forming a visible layer on top. That is how Natural Shield differs from the stocked film-forming sealers.' },
] as const;

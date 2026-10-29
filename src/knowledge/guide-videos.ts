/**
 * Curated, offline-searchable video links, audited 2026-09-11.
 *
 * Provenance: SEMCO embeds videos by this channel on semcosurfaces.com. The
 * channel's public Videos catalogue was enumerated to the end (four pages).
 * Titles, IDs and publisher were checked from public catalogue/oEmbed metadata.
 * Watch-page access was rate-limited: these are NOT reviewed transcripts or a
 * source of new mix ratios, coverage, cure times, repairs or warranty promises.
 * Current installed SEMCO Canada instructions always take precedence.
 */
export interface GuideVideo {
  id: string;
  title: string;
  url: string;
  topics: string[];
  publisher: string;
  provenance: 'official-channel' | 'manufacturer-linked';
  channelUrl: string;
  verifiedSourceUrl: string;
  verifiedAt: string;
  reviewLevel: 'catalogue-metadata';
  summary: string;
  /** Older process names/details must be checked against the current job detail. */
  legacy?: boolean;
}

export const GUIDE_VIDEO_CHANNEL_URL = 'https://www.youtube.com/@semcomfg';
export const GUIDE_VIDEO_NOTICE = 'Optional SEMCO video reference. Follow the current in-app instructions for your job; older videos may use different products or details. Internet is needed to watch.';

function official(
  id: string,
  title: string,
  topics: string[],
  summary: string,
  legacy = false,
): GuideVideo {
  return {
    id,
    title,
    url: `https://www.youtube.com/watch?v=${id}`,
    topics,
    publisher: 'SEMCO Modern Seamless Surface',
    provenance: 'official-channel',
    channelUrl: GUIDE_VIDEO_CHANNEL_URL,
    verifiedSourceUrl: `${GUIDE_VIDEO_CHANNEL_URL}/videos`,
    verifiedAt: '2026-09-11',
    reviewLevel: 'catalogue-metadata',
    summary,
    ...(legacy ? { legacy: true } : {}),
  };
}

export const GUIDE_VIDEOS: GuideVideo[] = [
  official('_Bi9KJeB_Js', 'SEMCO X BOND Microcement Application 2025',
    ['x_bond', 'application'], 'SEMCO’s 2025 X-Bond application video.'),
  official('W06jti_-JCo', 'SEMCO Scratch Coat Application',
    ['x_bond', 'scratch_coat', 'application'], 'A manufacturer video focused on the scratch-coat stage.'),
  official('SXtjSHoXV6s', 'SEMCO Liquid Membrane Application',
    ['liquid_membrane', 'application'], 'A manufacturer video focused on applying Liquid Membrane.'),
  official('q8VjSMfZtu0', 'SEMCO X-Bond Procedure - Microbond Over X-Bond, Vertical Surfaces',
    ['microbond', 'wall', 'application'], 'A video specifically about MicroBond over X-Bond on vertical surfaces.'),
  official('meufPYjz_2k', 'SEMCO Seamless Surface - Natural Shield',
    ['natural_shield', 'sealer', 'overview'], 'The Natural Shield video also embedded on SEMCO’s product page.'),
  official('awH6aMC4FTw', 'SEMCO Surfaces - Titan Shield Application',
    ['titan_gloss', 'sealer', 'application'], 'A manufacturer video on Titan Shield application.'),
  official('p_7Ig98m8P8', 'SEMCO Satin Stone Roller Application',
    ['satin_stone', 'sealer', 'roller', 'application'], 'A video focused on the roller application of Satin Stone.'),
  official('gwT_09zzlKs', 'SEMCO Satin Stone - features, benefits and application options',
    ['satin_stone', 'sealer', 'overview'], 'A manufacturer overview of Satin Stone and its application options.'),
  official('pCKblm5nc4I', 'SEMCO Liquid Membrane - Liquid Waterproofing Membrane',
    ['liquid_membrane', 'overview'], 'The Liquid Membrane overview embedded on SEMCO’s product page.'),
  official('EXUF-Xt2ZiM', 'Liquid Membrane Crack Repair',
    ['liquid_membrane', 'crack', 'application'], 'A manufacturer video about Liquid Membrane and crack repair; not a structural diagnosis.'),
  official('EFAe-yYAdhg', 'SEMCO Liquid Membrane - Crack Bridging',
    ['liquid_membrane', 'crack', 'overview'], 'A demonstration titled Crack Bridging; it does not establish the repair needed on your job.'),
  official('KoBdCV8nw3c', 'SEMCO Surface Preparation Procedure - Cleaning',
    ['prep', 'cleaning', 'application'], 'An older manufacturer surface-cleaning procedure video. Use the current SIP cleaning choice.', true),
  official('ndMjzzeA-2A', 'SEMCO Surface Preparation Procedure - Cracks and Control Joints',
    ['prep', 'crack', 'control_joint', 'application'], 'An older preparation video on cracks and control joints. Keep current movement-joint requirements.', true),
  official('40v-ATaHhP4', 'SEMCO - Wall Application Tutorial',
    ['x_bond', 'wall', 'application'], 'An older manufacturer wall-application tutorial; check the current wall and wet-area detail.', true),
  official('nwoHCLT1Cq0', 'SEMCO - Pool and Pooldeck Application',
    ['x_bond', 'pool', 'deck', 'application'], 'An older pool and pool-deck tutorial. Current Canada submerged-system instructions take precedence.', true),
  official('bKNC4YqpGIg', 'SEMCO - Cove Base Application Tutorial',
    ['x_bond', 'cove', 'application'], 'An older manufacturer tutorial on forming a cove base.', true),
  official('hns8GljVzok', 'SEMCO X-Bond Procedure - Brown Coat',
    ['x_bond', 'brown_coat', 'application'], 'An older video on the X-Bond brown-coat stage.', true),
  official('10YcUQTFEiU', 'SEMCO - Polished Bond Application Tutorial',
    ['x_bond', 'polished_finish', 'application'], 'An older Polished Bond finish tutorial; match current product names and detail.', true),
  official('MTagkEh4H9w', 'SEMCO - Natural Grain Application Tutorial',
    ['x_bond', 'natural_grain', 'application'], 'An older Natural Grain finish tutorial. Natural Grain is not Natural Shield sealer.', true),
  official('ByvXC5AfR20', 'SEMCO X-Bond Seamless Stone How X-Bond Works',
    ['x_bond', 'overview'], 'The manufacturer’s overview titled How X-Bond Works.', true),
  official('XNHh_7eFJhI', 'PreStain Color - lasting natural color for concrete surfaces',
    ['prestain', 'overview'], 'A manufacturer video about PreStain colour for concrete surfaces.'),
];

function normalise(query: string): string {
  return query.toLowerCase().replace(/[-_’']/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Topic routing only, not instruction retrieval. It intentionally returns no
 * result rather than attach an unrelated or obsolete product video.
 */
export function findGuideVideos(query: string, limit = 2): GuideVideo[] {
  const q = normalise(query);
  if (!q || !Number.isFinite(limit) || limit <= 0) return [];
  const products: string[] = [];
  if (/\bmicro\s?bond\b/.test(q)) products.push('microbond');
  if (/\bx\s?bond\b/.test(q)) products.push('x_bond');
  if (/\bliquid membrane\b|\bmembrane\b|\bwaterproofing\b/.test(q)) products.push('liquid_membrane');
  if (/\bnatural shield\b/.test(q)) products.push('natural_shield');
  if (/\btitan(?: shield)?(?: gloss)?\b/.test(q)) products.push('titan_gloss');
  if (/\bsatin(?: stone)?\b/.test(q)) products.push('satin_stone');
  if (/\bpre\s?stain\b/.test(q)) products.push('prestain');

  // Do not mistake archived Matte/Gloss systems for the currently stocked Matte.
  const unsupportedProduct = /\bmatte\b|\bpower cleaner\b|\bnu\s?lift\b|\bstone soap\b/.test(q);
  if (unsupportedProduct && !products.length) return [];
  const process: string[] = [];
  if (/\bscratch(?: coat)?\b/.test(q)) process.push('scratch_coat');
  if (/\bbrown coat\b/.test(q)) process.push('brown_coat');
  if (/\bcov(?:e|ing)\b|\bcove base\b/.test(q)) process.push('cove');
  if (/\bpolish(?:ed|ing)?\b/.test(q)) process.push('polished_finish');
  if (/\bnatural grain\b/.test(q)) process.push('natural_grain');
  if (/\bcrack(?:s|ing)?\b/.test(q)) process.push('crack');
  if (/\b(?:control|movement|expansion) joints?\b/.test(q)) process.push('control_joint');
  if (/\bclean(?:ing)?\b|\bprep(?:aration)?\b/.test(q)) process.push('cleaning');
  if (/\broll(?:er|ing)?\b/.test(q)) process.push('roller');
  const area: string[] = [];
  if (/\bwall(?:s)?\b|\bvertical\b|\bdrywall\b/.test(q)) area.push('wall');
  if (/\bpool(?:s)?\b/.test(q)) area.push('pool');
  if (/\bdeck(?:s)?\b/.test(q)) area.push('deck');
  const overview = /\bdifference\b|\bcompare\b|\bversus\b|\bvs\b|\bwhat (?:is|are|does)\b|\bused for\b|\bbenefits\b/.test(q);
  const application = /\bappl(?:y|ication|ying)\b|\binstall(?:ing|ation)?\b|\bhow (?:do|to|can)\b|\bprocess\b|\bstep\b/.test(q);
  if (!products.length && !process.length && !area.length) return [];

  // A specific MicroBond question may also say 'over X-Bond'. Prioritise the
  // finish being applied rather than use that base layer to suggest an X-Bond video.
  const productCandidates = products.includes('microbond') && products.includes('x_bond')
    && !/\bdifference\b|\bcompare\b|\bversus\b|\bvs\b/.test(q)
    ? products.filter(product => product !== 'x_bond') : products;
  return GUIDE_VIDEOS
    .map((video, index) => {
      const productMatch = productCandidates.some(topic => video.topics.includes(topic));
      const processMatch = process.filter(topic => video.topics.includes(topic)).length;
      const areaMatch = area.filter(topic => video.topics.includes(topic)).length;
      // Explicit products do not fall back to other products' videos.
      if (productCandidates.length && !productMatch) return { video, index, score: 0 };
      if (!productCandidates.length && !processMatch && !areaMatch) return { video, index, score: 0 };
      let score = (productMatch ? 10 : 0) + processMatch * 12 + areaMatch * 7;
      if (overview && video.topics.includes('overview')) score += 5;
      if (application && video.topics.includes('application')) score += 4;
      if (video.legacy) score -= 1;
      return { video, index, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, Math.min(3, Math.floor(limit)))
    .map(item => item.video);
}

import type { ConversationMessage } from '@/database/schema/conversations';
import { GUIDE_PRODUCTS, GUIDE_TERMS, guideProductCitations, type GuideProductKnowledge } from '@/knowledge/guide-products';
import { getActiveJobHistory, type AssistantJobContext } from './job-context';
import { loadGuideProducts } from './guide-knowledge-store';
import { getPrepSystem } from '@/constants/prep-systems';

const normalize = (text: string) => text.toLowerCase().replace(/[’']/g, '').replace(/[-–]/g, ' ').replace(/\s+/g, ' ').trim();
const mentions = (text: string, term: string) => new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(text);

export function namedGuideProducts(text: string, products: readonly GuideProductKnowledge[] = GUIDE_PRODUCTS): GuideProductKnowledge[] {
  let query = normalize(text);
  const selected: GuideProductKnowledge[] = [];
  // Match longer product names before their parent name (X-Bond Liquid != Stone).
  const aliases = products.flatMap((product) => product.aliases.map((alias) => ({ product, alias })))
    .sort((a, b) => b.alias.length - a.alias.length);
  for (const { product, alias } of aliases) {
    if (!mentions(query, alias)) continue;
    if (!selected.some((item) => item.id === product.id)) selected.push(product);
    query = query.replace(new RegExp(`\\b${alias}\\b`, 'g'), ' ');
  }
  return selected;
}

function exposureNote(context: AssistantJobContext): string {
  if (context.exposure === 'submerged' || ['pool', 'pond'].includes(context.application)) {
    return 'For your submerged job, the current Canadian sealer is Natural Shield. Keep the pool membrane detail separate from the finish sealer.';
  }
  if (context.application === 'shower' || context.exposure === 'steam') {
    return 'For a standard Canadian interior shower, the current finish is Satin Stone in two coats. This is not the pool/Natural Shield route; a steam room needs its own approved assembly.';
  }
  return 'Choose the sealer for the water exposure and use of the area first, then choose the sheen. Natural Shield and Matte are not interchangeable just because both look low-sheen.';
}

/** Education is direct; a product explanation does not need a substrate quiz. */
export async function buildGuideEducationAnswer(question: string, history: ConversationMessage[], context: AssistantJobContext) {
  let query = normalize(question);
  const previous = [...getActiveJobHistory(history, question)].reverse().find((message) => message.role === 'assistant');
  const failureWords = /\b(?:peel(?:ing|ed)?|lifting|flaking|bubbl(?:ing|es)|blisters?|crack(?:ing|ed|s)?|cloudy|hazy|milky|sticky|not drying|wont dry|leaking|too (?:thick|thin|runny))\b/;
  const reportedFailure = failureWords.test(query) && /\b(?:my|our|looks?|is|are|has|keeps?|why|happened|started|went|after)\b/.test(query);
  if (reportedFailure && !/^what (?:does|do) .+ mean[?.!]*$/.test(query)) return null;
  const continuation = previous?.guideEducation;
  if (continuation && query.split(' ').length <= 16
    && !/\b(?:difference|compare|price|cost|calculate|how much|sample|promotion|video|peeling|bubbles?|sticky|crack|new job|new project)\b/.test(query)) {
    const product = GUIDE_PRODUCTS.find((item) => item.id === continuation.productId);
    if (product && !namedGuideProducts(query).length && !/[?]/.test(query)
      && !/\b(?:explain|simpler|easier|understand|mean)\b/.test(query)) {
      query = `how do i apply ${normalize(product.name)} ${query}`;
    }
  }
  const simple = /\b(?:plain english|simpler|more simply|easier|dont understand|what do you mean)\b/.test(query);
  const definition = /\b(?:what (?:is|are|does)|meaning|mean|explain|define)\b/.test(query);
  const termSource = simple && namedGuideProducts(query).length === 0 ? normalize(previous?.content ?? '') : query;
  const terms = GUIDE_TERMS.filter((entry) => mentions(termSource, entry.term));
  if ((simple || definition) && terms.length && namedGuideProducts(query).length === 0
    && !/\b(?:difference|compare|vs|versus|products?|sealers?)\b/.test(query)) {
    return {
      content: ['In plain language:', ...terms.slice(0, simple ? 3 : 1).map((entry) => `**${entry.term}:** ${entry.meaning}`),
        simple ? 'The original product checks still apply. Tell me which part you want me to walk through.' : ''].filter(Boolean).join('\n\n'),
      citations: previous?.citations,
      guideLesson: previous?.guideLesson,
      suggestedFollowUps: simple ? ['Walk me through the next step'] : undefined,
    };
  }
  const comparing = /\b(?:difference|different|compare|comparison|vs|versus|rather than|instead of)\b/.test(query);
  const purpose = /\b(?:what (?:is|are)|what(?:s)? .* (?:for|used)|used for|use each|which (?:one|ones|product|products|sealer)|explain|tell me about|when (?:do|would|should) i use)\b/.test(query);
  const apply = /\b(?:how (?:do i|do we|to|should i)|walk me through|show me how)\b/.test(query)
    && /\b(?:apply|applying|use|mix|install)\b/.test(query);
  if (!comparing && !purpose && !apply) return null;
  // Real failures belong to the troubleshooting route, not a generic product card.
  if (/\b(?:is peeling|are peeling|is bubbling|has cracked|wont dry|still sticky|active leak|went wrong)\b/.test(query)) return null;
  const products = await loadGuideProducts();
  let chosen = namedGuideProducts(query, products);
  const genericSealers = /\bsealers?\b/.test(query) && chosen.length === 0;
  const genericCleaners = /\bcleaners?\b/.test(query) && chosen.length === 0;
  if (genericSealers) chosen = products.filter((product) => ['natural-shield', 'satin-stone', 'titan-gloss', 'matte'].includes(product.id));
  if (genericCleaners) chosen = products.filter((product) => ['stone-soap', 'power-cleaner', 'nu-lift'].includes(product.id));
  if (!chosen.length && /\bproducts?\b/.test(query) && !apply) {
    return {
      content: [
        'Think of the system as a few different jobs:',
        '**Clean:** Stone Soap handles general cleaning, Power Cleaner handles oil/grease, and Nu-Lift handles mineral deposits. The surface condition sets the cleaning order.',
        '**Build the finish:** X-Bond Stone + X-Bond Liquid make the main surface. MicroBond is the finer option for a smoother finish.',
        '**Protect underneath:** Liquid Membrane and the required fabric details handle waterproofing and crack control. X-Bond Liquid is not the membrane.',
        '**Protect the finished surface:** Natural Shield, Satin Stone, Titan Gloss and Matte are different sealer options, chosen for the job—not just the look.',
        'Which two products would you like me to compare?',
      ].join('\n\n'),
      citations: guideProductCitations(products),
      quickReplies: ['X-Bond vs MicroBond', 'X-Bond Liquid vs Liquid Membrane', 'Compare the sealers'],
    };
  }
  if (!chosen.length) return null;
  if (apply && !comparing) {
    // Full X-Bond assemblies still use the existing substrate-specific procedures.
    if (chosen.length !== 1 || chosen[0].id === 'x-bond' || chosen[0].id === 'liquid-membrane') return null;
    const product = chosen[0];
    const sealer = Boolean(product.policy);
    const cleaners = ['stone-soap', 'power-cleaner', 'nu-lift'].includes(product.id);
    const note = sealer ? exposureNote(context) : '';
    const submerged = context.exposure === 'submerged' || ['pool', 'pond'].includes(context.application);
    const shower = context.application === 'shower';
    if (sealer && ((submerged && product.id !== 'natural-shield')
      || (shower && !submerged && product.id !== 'satin-stone') || context.exposure === 'steam')) {
      return {
        content: `${note}\n\nDo not start the ${product.name} application on this job from a generic product recipe. The area and specified system need to agree first. I can explain the correct finish and its next checks.`,
        citations: guideProductCitations(chosen), videos: [],
        suggestedFollowUps: [submerged ? 'How do I apply Natural Shield?' : 'How do I apply Satin Stone?'],
      };
    }
    if (cleaners) {
      const knownSurface = context.substrate !== 'unknown';
      const suitableWetPrep = ['concrete', 'tile', 'pool_shell', 'metal'].includes(context.substrate);
      if (knownSurface && !suitableWetPrep) {
        return {
          content: `${product.name}: ${product.role}\n\nYou have already identified the surface. Do not soak board or wood using a generic concrete-cleaning procedure. Start with the correct dry surface-readiness/assembly detail and identify any contamination that needs separate treatment.`,
          citations: guideProductCitations(chosen), videos: [],
          suggestedFollowUps: ['Show me the prep steps for this surface'],
        };
      }
      if (knownSurface && context.prepCondition) {
        const prep = getPrepSystem(context.prepCondition);
        return {
          content: [
            `${product.name}: ${product.role}`,
            `From the surface condition you described, the cleaning sequence is SIP Type ${prep.sipType}. Use the complete sequence rather than substitute one cleaner for another.`,
            ...prep.cleanerSteps.map((step) => `${step.order}. ${step.productName} — ${step.dilutionLabel}. ${step.purpose}`),
            'Each pass is separate: scrub/agitate, rinse thoroughly and remove residue before the next pass. Never mix different cleaners in one container. Wear the protection required by the label/SDS, and let the prepared surface dry before coating.',
            'If contamination remains after cleaning, stop before coating and tell me what is still visible.',
          ].join('\n\n'),
          citations: guideProductCitations(chosen),
          suggestedFollowUps: ['Explain that more simply'],
        };
      }
      return {
        content: `${product.name}: ${product.role}\n\n${product.notFor}\n\n${knownSurface ? 'What residue is on the surface: oil/grease, mineral deposits, an old coating, or none?' : 'What surface are you cleaning?'}`,
        guideEducation: { productId: product.id },
        citations: guideProductCitations(chosen),
      };
    }
    return {
      content: [
        `${product.name}: ${product.role}`,
        ...product.firstSteps.map((step, index) => `${index + 1}. ${step}`),
        note,
        sealer && context.exposure === 'unknown' ? 'Where is this being used: a dry interior area, a shower, outside, or submerged?' : '',
        product.id === 'microbond' ? 'These are the smooth-finish steps over prepared X-Bond, not approval to apply directly to any substrate.' : '',
      ].filter(Boolean).join('\n\n'),
      citations: guideProductCitations(chosen),
      guideEducation: sealer && context.exposure === 'unknown' ? { productId: product.id } : undefined,
      suggestedFollowUps: ['Explain that more simply', `Show me a video about ${product.name}`],
    };
  }
  const sealerComparison = chosen.some((product) => product.policy);
  return {
    content: [
      chosen.length > 1 ? 'They do different jobs. Here is the practical difference:' : `${chosen[0].name}, in plain language:`,
      ...chosen.map((product) => `**${product.name}** — ${product.role}\n\nUse it for: ${product.useFor}\n\nKeep in mind: ${product.notFor}`),
      sealerComparison ? exposureNote(context) : '',
    ].filter(Boolean).join('\n\n'),
    citations: guideProductCitations(chosen),
    suggestedFollowUps: chosen.slice(0, 2).map((product) => `How do I apply ${product.name}?`),
  };
}

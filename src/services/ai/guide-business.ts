import { XBOND_TOOL_PROMOTION } from '@/knowledge/pro-installer-promotion';
import { COLOUR_SAMPLE_FLAT_RATE_CAD, COLOUR_SAMPLE_COMPLIMENTARY_THRESHOLD_SQFT } from '@/knowledge/sample-pricing';
import { TINT_RATE_PER_MACHINE_OUNCE_CAD } from '@/knowledge/colour-charges';

export function buildGuideBusinessAnswer(message: string): { content: string; suggestedFollowUps?: string[] } | null {
  const text = message.toLowerCase().trim();
  if (/\b(promotion|promo|free tools|tool kit|come kit|co\.me kit)\b/.test(text)) {
    return {
      content: [
        `The offer installed in this app is a ${XBOND_TOOL_PROMOTION.title.toLowerCase()}, ${XBOND_TOOL_PROMOTION.value.toLowerCase()}.`,
        XBOND_TOOL_PROMOTION.qualifyingTerm,
        XBOND_TOOL_PROMOTION.terms.join(' '),
        'Ask your dealer to confirm the offer is still available and that your complete order qualifies. I work offline, so I cannot check live availability or approve the promotion.',
      ].join('\n\n'),
      suggestedFollowUps: ['How do colour samples work?', 'How is job tint priced?'],
    };
  }
  const samplePolicyQuestion = /\b(price|cost|charge|free|included|size)\b/.test(text)
    || /\bhow much (?:is|are|does|do)\b/.test(text)
    || /\bhow (?:do|does) (?:(?:the|your|colour|color|prepared)\s+)*samples? work\b/.test(text);
  if (/\bsamples?\b/.test(text) && samplePolicyQuestion) {
    return {
      content: `A prepared colour sample is one quart of X-Bond Liquid with its pigment already mixed in. The installed policy is a flat $${COLOUR_SAMPLE_FLAT_RATE_CAD} CAD, including the pigment—not $${COLOUR_SAMPLE_FLAT_RATE_CAD} plus tint.\n\nThe sample charge is waived with a qualifying order of ${COLOUR_SAMPLE_COMPLIMENTARY_THRESHOLD_SQFT} sq ft or more. Tell your dealer which colours you need and have them confirm the order details. A liquid sample is not the finished X-Bond mix; it does not include the Stone component.`,
      suggestedFollowUps: ['How is job tint priced?'],
    };
  }
  if (/\b(tint|pigment)\b/.test(text) && /\b(price|priced|cost|charge|ounce|oz|dispens|machine)\b/.test(text)) {
    return {
      content: `Job tint is priced at $${TINT_RATE_PER_MACHINE_OUNCE_CAD} CAD per machine ounce of pigment dispensed. The amount depends on the chosen colour and batch size; it is not a flat price per colour.\n\nUse the calculator's colour plan for the exact pigment charge. Job batches use 1-gallon and 5-gallon X-Bond Liquid formulas. Quart batches are for samples. The dealer dispenses the job tint separately for the installer to add to the matching liquid batch.`,
      suggestedFollowUps: ['How do colour samples work?'],
    };
  }
  if (/^(?:hi|hello|hey|help|help me|get started|what can you do)[.!?]*$/.test(text)) {
    return {
      content: "Tell me what you're working on, or what isn't going as expected. I'll help you check it one step at a time, using the SEMCO information installed in this app.\n\nWhat product are you using, and what surface is underneath it? I work offline and don't send this conversation to an AI service.",
      suggestedFollowUps: ['The coating is peeling', 'There are cracks in the finish', 'My sealer is still sticky'],
    };
  }
  if (/\b(?:can you|could you|please)\b/.test(text) && /\b(?:look at|check|analyse|analyze|see)\b/.test(text) && /\b(?:photo|picture|image)\b/.test(text)) {
    return {
      content: "This chat reads text only, so I can't inspect a photo here. Describe what you can see, which product is affected, and when it started. Save the photos with the project for your dealer or SEMCO technical support to review.",
    };
  }
  return null;
}

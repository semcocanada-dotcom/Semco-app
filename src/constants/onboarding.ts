export interface OnboardingStep {
  icon: string;
  title: string;
  body: string;
  tab: string;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    icon: 'chatbubble-ellipses',
    title: 'AI Assistant',
    body: 'Ask any technical question about Semco products. Get instant answers using the full product TDS library — works offline too.',
    tab: 'assistant',
  },
  {
    icon: 'calculator',
    title: 'Coverage Calculator',
    body: 'Enter your area and substrate type. The app calculates exact quantities for every layer — primer through sealer — with waste factored in.',
    tab: 'calculator',
  },
  {
    icon: 'color-palette',
    title: 'Colour Formulas',
    body: 'Browse all standard XBond colours with pigment ratios scaled to your batch size — quart, gallon, or 5-gallon. Save your own custom mixes.',
    tab: 'colors',
  },
  {
    icon: 'folder',
    title: 'Project Manager',
    body: 'Track every job with client details, photo documentation by stage, and a full batch log for warranty traceability.',
    tab: 'projects',
  },
  {
    icon: 'library',
    title: 'Product Library',
    body: 'Full technical data sheets for every Semco SKU — always available offline. No internet required on-site.',
    tab: 'products',
  },
];

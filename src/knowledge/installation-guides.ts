export type InstallationGuideLayer = {
  label: string;
  detail: string;
  color: string;
  textColor?: string;
};

export type InstallationGuide = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  summary: string;
  sourceDocument: string;
  sourcePage?: string;
  layers: InstallationGuideLayer[];
  steps: string[];
  materials: string[];
  askPrompt: string;
};

export const INSTALLATION_GUIDES: InstallationGuide[] = [
  {
    id: 'x-bond-floor-system',
    title: 'X-Bond Floor System',
    subtitle: 'Standard seamless stone floor build-up',
    category: 'X-Bond',
    summary: 'A field view of the normal X-Bond layer stack from substrate prep through sealer.',
    sourceDocument: 'Open SIP manual - master copy v2019-3 2.pdf',
    sourcePage: 'X-Bond Seamless Stone section',
    materials: ['X-Bond Liquid', 'X-Bond Stone', 'MicroBond optional', 'Sealer'],
    askPrompt: 'Explain the X-Bond floor system layer by layer for an installer.',
    layers: [
      { label: 'Existing substrate', detail: 'Concrete, tile, plywood, or prepared surface', color: '#DDE7EA', textColor: '#00232D' },
      { label: 'Primer coat', detail: 'X-Bond Liquid rolled into the surface', color: '#9FE5E9', textColor: '#00232D' },
      { label: 'Scratch / brown coat', detail: 'X-Bond mixture builds bond and texture', color: '#7C8A7B', textColor: '#FFFFFF' },
      { label: 'Finish texture', detail: 'X-Bond Seamless Stone coats', color: '#C9C6B8', textColor: '#00232D' },
      { label: 'Top protection', detail: 'Selected Semco sealer system', color: '#CF451F', textColor: '#FFFFFF' },
    ],
    steps: [
      'Prepare and clean the substrate for bond.',
      'Prime with X-Bond Liquid.',
      'Apply scratch or brown coat as required by the surface.',
      'Apply X-Bond finish coats to the target texture.',
      'Seal after the surface is ready for finishing.',
    ],
  },
  {
    id: 'liquid-membrane-waterproofing',
    title: 'Liquid Membrane Waterproofing',
    subtitle: 'Waterproofing with fabric reinforcement',
    category: 'Waterproofing',
    summary: 'Shows how Liquid Membrane and fabric sit inside the waterproof layer stack.',
    sourceDocument: 'SEMCO Liquid Membrane technical documents',
    sourcePage: 'Coverage and procedure sections',
    materials: ['Liquid Membrane', 'Fabric reinforcement', 'X-Bond Liquid', 'X-Bond Stone'],
    askPrompt: 'Explain how to install Semco Liquid Membrane with fabric reinforcement.',
    layers: [
      { label: 'Prepared substrate', detail: 'Clean, stable, detailed surface', color: '#DDE7EA', textColor: '#00232D' },
      { label: 'Liquid Membrane', detail: 'First membrane coats', color: '#F9A07F', textColor: '#00232D' },
      { label: 'Fabric reinforcement', detail: 'Embedded at cracks, seams, drains, or full field as specified', color: '#FFFFFF', textColor: '#00232D' },
      { label: 'Encapsulation coats', detail: 'Additional Liquid Membrane over fabric', color: '#CF451F', textColor: '#FFFFFF' },
      { label: 'X-Bond surface', detail: 'Proceed to X-Bond after membrane readiness', color: '#7C8A7B', textColor: '#FFFFFF' },
    ],
    steps: [
      'Sweep and clean the surface.',
      'Detail cracks, seams, drains, and transitions first.',
      'Roll or spray Liquid Membrane at the required thickness.',
      'Embed fabric where specified while membrane is wet.',
      'Encapsulate fabric and inspect for pinholes or thin spots.',
    ],
  },
  {
    id: 'basement-waterproofing',
    title: 'Basement Waterproofing',
    subtitle: 'Below-grade concrete protection',
    category: 'Waterproofing',
    summary: 'Layer stack for moisture control before the X-Bond finished surface.',
    sourceDocument: 'Basement Waterproofing system detail',
    sourcePage: '2022.V01 drawing',
    materials: ['Natural Shield', 'Liquid Membrane', 'Fabric reinforcement', 'X-Bond Seamless Stone'],
    askPrompt: 'Explain the Semco basement waterproofing layer sequence.',
    layers: [
      { label: 'Concrete substrate', detail: 'Existing basement concrete', color: '#C6CDD1', textColor: '#00232D' },
      { label: 'Natural Shield', detail: 'Two coat vapor-control layer', color: '#92D6D9', textColor: '#00232D' },
      { label: 'Scratch coat', detail: 'Bond layer before waterproofing', color: '#849589', textColor: '#FFFFFF' },
      { label: 'Liquid Membrane + fabric', detail: 'Membrane coats with reinforcement', color: '#CF451F', textColor: '#FFFFFF' },
      { label: 'X-Bond finish', detail: 'Seamless Stone finished surface', color: '#D8D1BD', textColor: '#00232D' },
    ],
    steps: [
      'Confirm substrate condition and moisture risk.',
      'Apply Natural Shield where specified.',
      'Install scratch coat.',
      'Apply Liquid Membrane coats and fabric reinforcement.',
      'Finish with X-Bond Seamless Stone after waterproof layer is ready.',
    ],
  },
  {
    id: 'crack-repair',
    title: 'Crack Repair Detail',
    subtitle: 'Fractures, cracks, and openings',
    category: 'Details',
    summary: 'Quick visual for when to fill, membrane, and reinforce cracks before the main system.',
    sourceDocument: 'SEMCO Liquid Membrane procedure',
    sourcePage: 'Crack repair procedure',
    materials: ['X-Bond Liquid', 'X-Bond Stone', 'Liquid Membrane', 'Fabric reinforcement'],
    askPrompt: 'Explain the crack repair procedure before X-Bond installation.',
    layers: [
      { label: 'Opened crack', detail: 'Clean and prepared defect', color: '#DDE7EA', textColor: '#00232D' },
      { label: 'X-Bond Liquid', detail: 'Primer into crack', color: '#9FE5E9', textColor: '#00232D' },
      { label: 'X-Bond mix fill', detail: 'Stone mixture fills void', color: '#7C8A7B', textColor: '#FFFFFF' },
      { label: 'Liquid Membrane', detail: 'Membrane over repaired area', color: '#CF451F', textColor: '#FFFFFF' },
      { label: 'Fabric if required', detail: 'Reinforce larger cracks/openings', color: '#FFFFFF', textColor: '#00232D' },
    ],
    steps: [
      'Open and clean the crack as required.',
      'Prime with X-Bond Liquid.',
      'Fill with X-Bond mixture.',
      'Allow repair to dry where specified.',
      'Apply Liquid Membrane and fabric reinforcement when crack size requires it.',
    ],
  },
  {
    id: 'microbond-smooth-finish',
    title: 'MicroBond Smooth Finish',
    subtitle: 'Optional smoother finish over X-Bond',
    category: 'MicroBond',
    summary: 'Shows MicroBond as a finish refinement over the prepared X-Bond surface.',
    sourceDocument: 'Open SIP manual - master copy v2019-3 2.pdf',
    sourcePage: 'X-Bond Seamless Stone section',
    materials: ['MicroBond Stone', 'X-Bond Liquid', 'Sealer'],
    askPrompt: 'Explain when and how MicroBond is used as a smoother finish over X-Bond.',
    layers: [
      { label: 'X-Bond surface', detail: 'Dry prepared X-Bond base', color: '#7C8A7B', textColor: '#FFFFFF' },
      { label: 'MicroBond mix', detail: 'MicroBond Stone with X-Bond Liquid', color: '#E8E0D0', textColor: '#00232D' },
      { label: 'Refined finish', detail: 'Smooth finish passes', color: '#F2F4F7', textColor: '#00232D' },
      { label: 'Sealer', detail: 'Final protection system', color: '#CF451F', textColor: '#FFFFFF' },
    ],
    steps: [
      'Prepare the X-Bond surface for smoother finishing.',
      'Mix MicroBond Stone with X-Bond Liquid at the verified ratio.',
      'Apply thin smooth passes.',
      'Allow the finish to dry as required.',
      'Seal with the selected Semco sealer.',
    ],
  },
];

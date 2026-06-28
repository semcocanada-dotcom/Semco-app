import type { ProjectSignoffType } from '@/database/schema/signoffs';
import type { ImageSourcePropType } from 'react-native';

export type SignoffField = {
  id: string;
  label: string;
  placeholder: string;
  multiline?: boolean;
  prefill?: 'projectName' | 'projectLocation' | 'surfaceArea';
};

export type PdfFormField = {
  id: string;
  label: string;
  type?: 'text' | 'multiline' | 'signature' | 'date';
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
};

export type SignoffTemplate = {
  type: ProjectSignoffType;
  title: string;
  shortTitle: string;
  sourceDocument: string;
  description: string;
  acknowledgement: string;
  fields: SignoffField[];
  pdfPage: ImageSourcePropType;
  pdfFields: PdfFormField[];
};

const PROJECT_FIELDS: SignoffField[] = [
  { id: 'projectName', label: 'Project Name', placeholder: 'Project name', prefill: 'projectName' },
  { id: 'projectLocation', label: 'Project Location', placeholder: 'Project address or location', prefill: 'projectLocation' },
  { id: 'surfaceArea', label: 'Surface Area', placeholder: 'Square feet or project area', prefill: 'surfaceArea' },
];

const ACCEPTANCE_FIELDS: SignoffField[] = [
  { id: 'acceptedByTitle', label: 'Accepted By Title', placeholder: 'Owner, contractor, designer, site supervisor, etc.' },
];

const HEADER_PDF_FIELDS: PdfFormField[] = [
  { id: 'projectName', label: 'Project Name', x: 29.5, y: 19.1, width: 64.5, height: 2.5 },
  { id: 'projectLocation', label: 'Project Location', x: 29.5, y: 22.4, width: 64.5, height: 2.5 },
  { id: 'surfaceArea', label: 'Surface Area', x: 29.5, y: 25.6, width: 64.5, height: 2.5 },
];

const ACCEPTANCE_PDF_FIELDS = (signatureY: number): PdfFormField[] => [
  { id: 'signature', label: 'Signature', type: 'signature', x: 22.5, y: signatureY, width: 31.5, height: 4.3 },
  { id: 'signedDate', label: 'Date', type: 'date', x: 59.5, y: signatureY, width: 34.5, height: 2.8 },
  { id: 'customerName', label: 'Print Name', x: 22.5, y: signatureY + 8.4, width: 31.5, height: 2.8 },
  { id: 'acceptedByTitle', label: 'Title', x: 59.5, y: signatureY + 8.4, width: 34.5, height: 2.8 },
];

export const PROJECT_SIGNOFF_TEMPLATES: SignoffTemplate[] = [
  {
    type: 'mockup_color_acceptance',
    title: 'Mockup Approval / Color Acceptance',
    shortTitle: 'Mockup',
    sourceDocument: '03_Mockup_Approval_Color_Acceptance_Form.pdf',
    description: 'Customer approves the physical sample, colour, finish coat, and sealer before the install proceeds.',
    acknowledgement:
      'Customer accepts the colour as shown on the SEMCO sample. Colours may vary depending on lighting, substrate, texture, troweling, thickness, humidity, climate, and aftercare.',
    pdfPage: require('../../assets/form-pages/Mockup-Approval-Color-Acceptance.jpg'),
    pdfFields: [
      ...HEADER_PDF_FIELDS,
      { id: 'color', label: 'Color', x: 29.5, y: 43.6, width: 64.5, height: 2.5 },
      { id: 'finishCoatSealer', label: 'Finish Coat / Sealer', x: 29.5, y: 46.8, width: 64.5, height: 2.5 },
      ...ACCEPTANCE_PDF_FIELDS(56.2),
    ],
    fields: [
      ...PROJECT_FIELDS,
      { id: 'color', label: 'Color', placeholder: 'Approved colour or sample' },
      { id: 'finishCoatSealer', label: 'Finish Coat / Sealer', placeholder: 'Finish coat and sealer selected' },
      { id: 'mockupNotes', label: 'Mockup Notes', placeholder: 'Sample location, approval notes, exclusions, or customer comments', multiline: true },
      ...ACCEPTANCE_FIELDS,
    ],
  },
  {
    type: 'project_change_order',
    title: 'Project Change Order',
    shortTitle: 'Change',
    sourceDocument: '04_Project_Change_Order.pdf',
    description: 'Customer approves additional work, cost impact, and change-order scope.',
    acknowledgement:
      'Customer agrees the description accurately states the additional work requested and agrees to pay all costs associated with the change order.',
    pdfPage: require('../../assets/form-pages/Project-Change-Order.jpg'),
    pdfFields: [
      ...HEADER_PDF_FIELDS,
      { id: 'changeOrder', label: 'Change Order', x: 34.2, y: 28.8, width: 59.5, height: 2.5 },
      { id: 'costOfChangeOrder', label: 'Cost of Change Order', x: 34.2, y: 32, width: 59.5, height: 2.5 },
      { id: 'phaseDescription', label: 'Description', type: 'multiline', x: 10.5, y: 38.8, width: 83.5, height: 14.4, fontSize: 9 },
      ...ACCEPTANCE_PDF_FIELDS(67.4),
    ],
    fields: [
      ...PROJECT_FIELDS,
      { id: 'changeOrder', label: 'Change Order', placeholder: 'Change order number or title' },
      { id: 'costOfChangeOrder', label: 'Cost of Change Order', placeholder: 'Cost, credit, or no-cost change' },
      { id: 'phaseDescription', label: 'Description of the Phase', placeholder: 'Describe the additional work requested', multiline: true },
      ...ACCEPTANCE_FIELDS,
    ],
  },
  {
    type: 'project_phase_acceptance',
    title: 'Project Phase Acceptance',
    shortTitle: 'Phase',
    sourceDocument: '05_Project_Phase_Acceptance.pdf',
    description: 'Customer signs off that a project phase was completed acceptably before the next phase begins.',
    acknowledgement:
      'Customer approves that the phase work has been completed in an acceptable fashion and completed as agreed upon in the contract or proposal.',
    pdfPage: require('../../assets/form-pages/Project-Phase-Acceptance.jpg'),
    pdfFields: [
      ...HEADER_PDF_FIELDS,
      { id: 'phaseName', label: 'Phase Approved', x: 35, y: 32, width: 59, height: 2.5 },
      { id: 'phaseDescription', label: 'Description', type: 'multiline', x: 10.5, y: 36.2, width: 83.5, height: 13.4, fontSize: 9 },
      ...ACCEPTANCE_PDF_FIELDS(61.5),
    ],
    fields: [
      ...PROJECT_FIELDS,
      { id: 'phaseName', label: 'Phase', placeholder: 'Prep, membrane, base coat, finish, sealer, or handover' },
      { id: 'phaseDescription', label: 'Description of the Phase', placeholder: 'Describe the phase being accepted', multiline: true },
      ...ACCEPTANCE_FIELDS,
    ],
  },
  {
    type: 'final_project_acceptance',
    title: 'Final Project Acceptance',
    shortTitle: 'Final',
    sourceDocument: '06_Final_Project_Acceptance.pdf',
    description: 'Customer accepts the final colour, finish, workmanship, and completed scope of work.',
    acknowledgement:
      'Customer approves the colour, finish, and workmanship as seen on the project, and approves that all work has been completed to the agreed scope of work.',
    pdfPage: require('../../assets/form-pages/Final-Project-Acceptance.jpg'),
    pdfFields: [
      ...HEADER_PDF_FIELDS,
      ...ACCEPTANCE_PDF_FIELDS(44.5),
    ],
    fields: [
      ...PROJECT_FIELDS,
      { id: 'finalScope', label: 'Final Scope Accepted', placeholder: 'Describe the completed project scope', multiline: true },
      { id: 'finalNotes', label: 'Final Notes', placeholder: 'Customer comments, final care notes, or open items', multiline: true },
      ...ACCEPTANCE_FIELDS,
    ],
  },
  {
    type: 'surface_protection',
    title: 'Surface Protection Sign Off',
    shortTitle: 'Protection',
    sourceDocument: '07_Surface_Protection_Sign_Off.pdf',
    description: 'Customer acknowledges how to protect completed SEMCO surfaces while other construction continues.',
    acknowledgement:
      'Customer understands SEMCO surfaces must be protected with kraft paper and plastic, with no duct tape or masking tape on the surface, and accepts responsibility for damage after final project acceptance.',
    pdfPage: require('../../assets/form-pages/Surface-Protection-Sign-Off.jpg'),
    pdfFields: [
      ...HEADER_PDF_FIELDS,
      ...ACCEPTANCE_PDF_FIELDS(64.5),
    ],
    fields: [
      ...PROJECT_FIELDS,
      { id: 'protectionPlan', label: 'Protection Plan', placeholder: 'Who will protect the surface and when', multiline: true },
      { id: 'constructionNotes', label: 'Additional Construction Notes', placeholder: 'Trades, traffic, risks, or schedule notes', multiline: true },
      ...ACCEPTANCE_FIELDS,
    ],
  },
];

export function getSignoffTemplate(type: ProjectSignoffType): SignoffTemplate {
  return PROJECT_SIGNOFF_TEMPLATES.find((template) => template.type === type) ?? PROJECT_SIGNOFF_TEMPLATES[0];
}

import type { TechnicalDoc } from '@/knowledge/technical-docs';
import { TECHNICAL_DOCS } from '@/knowledge/technical-docs';

export type DocGroupId =
  | 'all'
  | 'x-bond'
  | 'waterproofing'
  | 'sealers'
  | 'cleaners'
  | 'details'
  | 'sds'
  | 'manuals';

export interface DocGroup {
  id: DocGroupId;
  label: string;
  description: string;
}

export const DOC_GROUPS: DocGroup[] = [
  { id: 'all', label: 'All', description: 'Every loaded Semco reference.' },
  { id: 'x-bond', label: 'X-Bond', description: 'Microcement, systems, and X-Bond references.' },
  { id: 'waterproofing', label: 'Waterproofing', description: 'Liquid Membrane, showers, pools, and below-grade details.' },
  { id: 'sealers', label: 'Sealers', description: 'Current stocked sealers plus supporting older reference sheets.' },
  { id: 'cleaners', label: 'Cleaners', description: 'Stone Soap, Power Cleaner, Nu-Lift, and prep products.' },
  { id: 'details', label: 'Details', description: 'System steps, drains, cracks, cove base, and job details.' },
  { id: 'sds', label: 'SDS', description: 'Safety data sheets.' },
  { id: 'manuals', label: 'Manuals', description: 'SIP manual and brochures.' },
];

export const BROWSABLE_DOC_GROUPS = DOC_GROUPS.filter((group) => group.id !== 'all');

export const PRODUCT_DOCS = TECHNICAL_DOCS;

export function getDocGroupIds(doc: TechnicalDoc): DocGroupId[] {
  const text = searchableText(doc);
  const groups = new Set<DocGroupId>();

  if (/sds|safety data|safety/i.test(text)) groups.add('sds');
  if (/sip manual|manual|brochure/i.test(text)) groups.add('manuals');
  if (/x-?bond|microcement|color bond|polished bond|natural grain|ada mma|broadcast/i.test(text)) groups.add('x-bond');
  if (/liquid membrane|waterproof|shower|pool|below grade|drain|cove|crack|joint/i.test(text)) groups.add('waterproofing');
  if (/sealer|natural shield|satin stone|titan|pre-?stain|crystal coat|colour coat|color gloss|gloss/i.test(text)) groups.add('sealers');
  if (/cleaner|stone soap|nu-?lift|power cleaner/i.test(text)) groups.add('cleaners');
  if (/detail|steps|system|cove|drain|crack|joint|shower|pool|ceiling|wall|floor/i.test(text)) groups.add('details');

  if (groups.size === 0) groups.add('details');
  return Array.from(groups);
}

export function getPrimaryDocGroup(doc: TechnicalDoc): DocGroupId {
  const ids = getDocGroupIds(doc);
  return ids.find((id) => id !== 'details') ?? ids[0] ?? 'details';
}

export function getDocsForGroup(groupId: DocGroupId, docs: TechnicalDoc[] = PRODUCT_DOCS): TechnicalDoc[] {
  if (groupId === 'all') return docs;
  return docs.filter((doc) => getDocGroupIds(doc).includes(groupId));
}

export function countDocsForGroup(groupId: DocGroupId, docs: TechnicalDoc[] = PRODUCT_DOCS): number {
  return getDocsForGroup(groupId, docs).length;
}

export function filterDocs(docs: TechnicalDoc[], groupId: DocGroupId, query: string): TechnicalDoc[] {
  const grouped = getDocsForGroup(groupId, docs);
  const normalized = query.trim().toLowerCase();

  if (!normalized) return sortDocs(grouped);

  return sortDocs(
    grouped.filter((doc) => searchableText(doc).includes(normalized)),
  );
}

export function getDocBadgeVariant(category: string): 'warning' | 'neutral' | 'primary' | 'success' | 'accent' {
  if (/sds|safety/i.test(category)) return 'warning';
  if (/x-?bond/i.test(category)) return 'accent';
  if (/liquid membrane/i.test(category)) return 'primary';
  if (/satin|natural shield|titan|sealer|prestain/i.test(category)) return 'success';
  if (/manual|brochure/i.test(category)) return 'neutral';
  return 'neutral';
}

export function sortDocs(docs: TechnicalDoc[]): TechnicalDoc[] {
  return [...docs].sort((a, b) => {
    const groupDelta = groupSortValue(getPrimaryDocGroup(a)) - groupSortValue(getPrimaryDocGroup(b));
    if (groupDelta !== 0) return groupDelta;
    return a.title.localeCompare(b.title);
  });
}

function groupSortValue(groupId: DocGroupId): number {
  const index = DOC_GROUPS.findIndex((group) => group.id === groupId);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

function searchableText(doc: TechnicalDoc): string {
  return `${doc.title} ${doc.sourceDocument} ${doc.category}`.toLowerCase();
}

import { createLocalId } from '@/utils/id';

/**
 * Phase 0 local stub for tender alternate review.
 *
 * Postgres authorization lives in the unapplied migration
 * `20261029181900_tender_alternate_review_phase0.sql`:
 * `private.is_semco_owner()` reads `admin_profiles.role = 'semco_owner'`.
 * This module does not call the cloud database and does not read editable
 * account metadata. The in-memory owner set starts empty, so every signed-in profile is treated
 * as a non-owner until a later reviewed seed adds the owner row.
 */

export const SEMCO_OWNER_ROLE = 'semco_owner' as const;

export const DECISION_ACTIONS = ['approve', 'deny', 'suggest'] as const;
export type DecisionAction = (typeof DECISION_ACTIONS)[number];

export const BOARD_PROFILE_KINDS = ['installer', 'general_contractor', 'other'] as const;
export type BoardProfileKind = (typeof BOARD_PROFILE_KINDS)[number];

export const BOARD_CARD_STATUSES = ['draft', 'shared', 'archived'] as const;
export type BoardCardStatus = (typeof BOARD_CARD_STATUSES)[number];

export const REVIEW_SUBJECT_TYPES = ['alternate_pack', 'scout_queue_item'] as const;
export type ReviewSubjectType = (typeof REVIEW_SUBJECT_TYPES)[number];

export const REVIEW_SUBJECT_STATUSES = ['pending', 'suggested', 'approved', 'denied'] as const;
export type ReviewSubjectStatus = (typeof REVIEW_SUBJECT_STATUSES)[number];

export const PROFILE_KIND_LABELS: Record<BoardProfileKind, string> = {
  installer: 'Installer',
  general_contractor: 'General contractor',
  other: 'Other',
};

export const DECISION_ACTION_LABELS: Record<DecisionAction, string> = {
  approve: 'Approve',
  deny: 'Deny',
  suggest: 'Suggest',
};

export const BOARD_STATUS_LABELS: Record<BoardCardStatus, string> = {
  draft: 'Draft',
  shared: 'Shared',
  archived: 'Archived',
};

const NOTE_MAX_LENGTH = 2000;

export const TENDER_STUB_IDS = {
  installerUserId: '00000000-0000-4000-8000-000000000101',
  generalContractorUserId: '00000000-0000-4000-8000-000000000102',
  sharedCardId: '00000000-0000-4000-8000-000000000201',
  draftCardId: '00000000-0000-4000-8000-000000000202',
  sharedGrantId: '00000000-0000-4000-8000-000000000211',
  packId: '00000000-0000-4000-8000-000000000301',
  scoutId: '00000000-0000-4000-8000-000000000302',
  seedActorId: '00000000-0000-4000-8000-0000000000aa',
  sharedProjectId: '00000000-0000-4000-8000-000000000401',
  draftProjectId: '00000000-0000-4000-8000-000000000402',
} as const;

export const TENDER_STUB_COPY = {
  sharedCardTitle: 'Lakeside terrace alternate',
  draftCardTitle: 'Warehouse slab scout',
  packTitle: 'X-Bond satin alternate',
  scoutTitle: 'Adjacent lobby slab',
} as const;

export type ShareProfile = {
  userId: string;
  displayName: string;
  profileKind: BoardProfileKind;
};

export type BoardCard = {
  id: string;
  projectId: string;
  projectLabel: string;
  title: string;
  summary: string;
  status: BoardCardStatus;
};

export type BoardGrant = {
  id: string;
  boardCardId: string;
  granteeUserId: string;
  profileKind: BoardProfileKind;
  grantedBy: string;
  createdAt: string;
};

export type AlternatePack = {
  id: string;
  projectId: string;
  boardCardId: string | null;
  title: string;
  summary: string;
  status: ReviewSubjectStatus;
};

export type ScoutQueueItem = {
  id: string;
  projectId: string | null;
  title: string;
  summary: string;
  status: ReviewSubjectStatus;
};

export type TenderDecision = {
  id: string;
  subjectType: ReviewSubjectType;
  subjectId: string;
  action: DecisionAction;
  note: string | null;
  actorId: string;
  createdAt: string;
};

export type InboxItem = {
  subjectType: ReviewSubjectType;
  subjectId: string;
  title: string;
  summary: string;
  status: ReviewSubjectStatus;
};

export type RecordDecisionInput = {
  subjectType: ReviewSubjectType;
  subjectId: string;
  action: DecisionAction;
  note?: string | null;
};

export class TenderReviewAccessError extends Error {
  constructor(message = 'Decision inbox is private to the Semco owner.') {
    super(message);
    this.name = 'TenderReviewAccessError';
  }
}

export function decisionInboxHref(isOwner: boolean): '/board/inbox' | null {
  return isOwner ? '/board/inbox' : null;
}

export function nextSubjectStatus(action: DecisionAction): ReviewSubjectStatus {
  if (action === 'approve') return 'approved';
  if (action === 'deny') return 'denied';
  return 'suggested';
}

export function isDecisionAction(value: string): value is DecisionAction {
  return (DECISION_ACTIONS as readonly string[]).includes(value);
}

const SHARE_PROFILES: ShareProfile[] = [
  {
    userId: TENDER_STUB_IDS.installerUserId,
    displayName: 'Northline Installers',
    profileKind: 'installer',
  },
  {
    userId: TENDER_STUB_IDS.generalContractorUserId,
    displayName: 'Harbor General Contracting',
    profileKind: 'general_contractor',
  },
];

const SEED_CARDS: BoardCard[] = [
  {
    id: TENDER_STUB_IDS.sharedCardId,
    projectId: TENDER_STUB_IDS.sharedProjectId,
    projectLabel: 'Lakeside terrace',
    title: TENDER_STUB_COPY.sharedCardTitle,
    summary: 'Finish board for the terrace. Shared profiles can see this card only.',
    status: 'shared',
  },
  {
    id: TENDER_STUB_IDS.draftCardId,
    projectId: TENDER_STUB_IDS.draftProjectId,
    projectLabel: 'Warehouse slab',
    title: TENDER_STUB_COPY.draftCardTitle,
    summary: 'Scout notes for the warehouse slab. Not shared.',
    status: 'draft',
  },
];

const SEED_GRANTS: BoardGrant[] = [
  {
    id: TENDER_STUB_IDS.sharedGrantId,
    boardCardId: TENDER_STUB_IDS.sharedCardId,
    granteeUserId: TENDER_STUB_IDS.installerUserId,
    profileKind: 'installer',
    grantedBy: TENDER_STUB_IDS.seedActorId,
    createdAt: '2026-10-29T18:00:00.000Z',
  },
];

const SEED_PACKS: AlternatePack[] = [
  {
    id: TENDER_STUB_IDS.packId,
    projectId: TENDER_STUB_IDS.sharedProjectId,
    boardCardId: TENDER_STUB_IDS.sharedCardId,
    title: TENDER_STUB_COPY.packTitle,
    summary: 'Owner review: satin finish alternate for the terrace entry.',
    status: 'pending',
  },
];

const SEED_SCOUT: ScoutQueueItem[] = [
  {
    id: TENDER_STUB_IDS.scoutId,
    projectId: TENDER_STUB_IDS.draftProjectId,
    title: TENDER_STUB_COPY.scoutTitle,
    summary: 'Scout queue: check the adjacent lobby slab before committing the alternate.',
    status: 'pending',
  },
];

type StoreState = {
  cards: BoardCard[];
  grants: BoardGrant[];
  packs: AlternatePack[];
  scoutItems: ScoutQueueItem[];
  decisions: TenderDecision[];
  ownerUserIds: Set<string>;
};

type Listener = () => void;

function cloneState(owners?: readonly string[]): StoreState {
  return {
    cards: SEED_CARDS.map((card) => ({ ...card })),
    grants: SEED_GRANTS.map((grant) => ({ ...grant })),
    packs: SEED_PACKS.map((pack) => ({ ...pack })),
    scoutItems: SEED_SCOUT.map((item) => ({ ...item })),
    decisions: [],
    ownerUserIds: new Set(owners ?? []),
  };
}

function isOpenStatus(status: ReviewSubjectStatus): boolean {
  return status === 'pending' || status === 'suggested';
}

export type TenderReviewStore = {
  subscribe: (listener: Listener) => () => void;
  getVersion: () => number;
  isOwner: (userId: string | null | undefined) => boolean;
  grantOwnerForTests: (userId: string) => void;
  resetForTests: (owners?: readonly string[]) => void;
  listVisibleCards: (userId: string | null | undefined) => BoardCard[];
  getVisibleCard: (userId: string | null | undefined, cardId: string) => BoardCard | null;
  listShareProfiles: (userId: string | null | undefined) => ShareProfile[];
  listGrantsForCard: (userId: string | null | undefined, cardId: string) => BoardGrant[];
  setCardGrants: (actorUserId: string | null | undefined, cardId: string, granteeUserIds: string[]) => BoardGrant[];
  listInbox: (userId: string | null | undefined) => InboxItem[];
  listDecisions: (userId: string | null | undefined) => TenderDecision[];
  recordDecision: (actorUserId: string | null | undefined, input: RecordDecisionInput) => TenderDecision;
};

export function createTenderReviewStore(options?: {
  now?: () => string;
  createId?: () => string;
  owners?: readonly string[];
}): TenderReviewStore {
  const now = options?.now ?? (() => new Date().toISOString());
  const createId = options?.createId ?? (() => createLocalId('tender'));
  let version = 0;
  let state = cloneState(options?.owners);
  const listeners = new Set<Listener>();

  const emit = () => {
    version += 1;
    listeners.forEach((listener) => listener());
  };

  function isOwner(userId: string | null | undefined): boolean {
    return Boolean(userId && state.ownerUserIds.has(userId));
  }

  function assertOwner(userId: string | null | undefined): asserts userId is string {
    if (!isOwner(userId)) throw new TenderReviewAccessError();
  }

  const visibleCards = (userId: string | null | undefined): BoardCard[] => {
    if (isOwner(userId)) return state.cards.map((card) => ({ ...card }));
    const granted = new Set(
      state.grants.filter((grant) => grant.granteeUserId === userId).map((grant) => grant.boardCardId),
    );
    return state.cards
      .filter((card) => card.status === 'shared' && granted.has(card.id))
      .map((card) => ({ ...card }));
  };

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getVersion: () => version,
    isOwner,
    grantOwnerForTests(userId) {
      state.ownerUserIds.add(userId);
      emit();
    },
    resetForTests(owners) {
      state = cloneState(owners);
      emit();
    },
    listVisibleCards: visibleCards,
    getVisibleCard(userId, cardId) {
      return visibleCards(userId).find((card) => card.id === cardId) ?? null;
    },
    listShareProfiles(userId) {
      if (!isOwner(userId)) return [];
      return SHARE_PROFILES.map((profile) => ({ ...profile }));
    },
    listGrantsForCard(userId, cardId) {
      if (!isOwner(userId)) return [];
      return state.grants.filter((grant) => grant.boardCardId === cardId).map((grant) => ({ ...grant }));
    },
    setCardGrants(actorUserId, cardId, granteeUserIds) {
      assertOwner(actorUserId);
      const card = state.cards.find((item) => item.id === cardId);
      if (!card) throw new Error('Board card was not found.');
      if (card.status === 'archived') throw new Error('Archived boards cannot be shared.');

      const uniqueIds = [...new Set(granteeUserIds)];
      const selected = uniqueIds.map((userId) => {
        const profile = SHARE_PROFILES.find((item) => item.userId === userId);
        if (!profile) throw new Error('Unknown profile.');
        return profile;
      });
      const createdAt = now();
      const nextGrants = selected.map((profile) => ({
        id: createId(),
        boardCardId: cardId,
        granteeUserId: profile.userId,
        profileKind: profile.profileKind,
        grantedBy: actorUserId,
        createdAt,
      }));

      state = {
        ...state,
        cards: state.cards.map((item) =>
          item.id === cardId
            ? { ...item, status: nextGrants.length > 0 ? 'shared' : 'draft' }
            : item,
        ),
        grants: [...state.grants.filter((grant) => grant.boardCardId !== cardId), ...nextGrants],
      };
      emit();
      return nextGrants.map((grant) => ({ ...grant }));
    },
    listInbox(userId) {
      assertOwner(userId);
      const packs: InboxItem[] = state.packs.filter((pack) => isOpenStatus(pack.status)).map((pack) => ({
        subjectType: 'alternate_pack',
        subjectId: pack.id,
        title: pack.title,
        summary: pack.summary,
        status: pack.status,
      }));
      const scout: InboxItem[] = state.scoutItems.filter((item) => isOpenStatus(item.status)).map((item) => ({
        subjectType: 'scout_queue_item',
        subjectId: item.id,
        title: item.title,
        summary: item.summary,
        status: item.status,
      }));
      return [...packs, ...scout];
    },
    listDecisions(userId) {
      assertOwner(userId);
      return state.decisions.map((decision) => ({ ...decision }));
    },
    recordDecision(actorUserId, input) {
      assertOwner(actorUserId);
      if (!isDecisionAction(input.action)) throw new Error('Unsupported decision action.');
      const trimmedNote = input.note?.trim() ?? '';
      if (trimmedNote.length > NOTE_MAX_LENGTH) throw new Error('Note is too long.');
      const note = trimmedNote.length > 0 ? trimmedNote : null;
      const status = nextSubjectStatus(input.action);
      const pack = state.packs.find((item) => item.id === input.subjectId);
      const scout = state.scoutItems.find((item) => item.id === input.subjectId);
      const subjectMatches =
        (input.subjectType === 'alternate_pack' && pack) ||
        (input.subjectType === 'scout_queue_item' && scout);
      if (!subjectMatches) throw new Error('Review item was not found.');

      const decision: TenderDecision = {
        id: createId(),
        subjectType: input.subjectType,
        subjectId: input.subjectId,
        action: input.action,
        note,
        actorId: actorUserId,
        createdAt: now(),
      };

      state = {
        ...state,
        packs: state.packs.map((item) => (item.id === input.subjectId && input.subjectType === 'alternate_pack' ? { ...item, status } : item)),
        scoutItems: state.scoutItems.map((item) =>
          item.id === input.subjectId && input.subjectType === 'scout_queue_item' ? { ...item, status } : item,
        ),
        decisions: [decision, ...state.decisions],
      };
      emit();
      return { ...decision };
    },
  };
}

export const tenderReviewStub = createTenderReviewStore();

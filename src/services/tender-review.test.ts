import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  TENDER_STUB_COPY,
  TENDER_STUB_IDS,
  TenderReviewAccessError,
  createTenderReviewStore,
  decisionInboxHref,
} from '@/services/tender-review';

const OWNER_ID = '00000000-0000-4000-8000-000000000901';
const STRANGER_ID = '00000000-0000-4000-8000-000000000199';
const RECORDED_AT = '2026-10-29T18:05:00.000Z';

function store(owners: readonly string[] = []) {
  let sequence = 0;
  return createTenderReviewStore({
    owners,
    now: () => RECORDED_AT,
    createId: () => `00000000-0000-4000-8000-${String(++sequence).padStart(12, '0')}`,
  });
}

describe('tender review phase 0 stub', () => {
  it('shows a shared board only to the granted profile', () => {
    const review = store();

    expect(review.listVisibleCards(STRANGER_ID)).toEqual([]);
    expect(review.listVisibleCards(TENDER_STUB_IDS.installerUserId).map((card) => card.id)).toEqual([
      TENDER_STUB_IDS.sharedCardId,
    ]);
    expect(review.getVisibleCard(TENDER_STUB_IDS.installerUserId, TENDER_STUB_IDS.draftCardId)).toBeNull();
    expect(review.listShareProfiles(TENDER_STUB_IDS.installerUserId)).toEqual([]);
  });

  it('lets the owner see drafts and replace the selected profiles', () => {
    const review = store([OWNER_ID]);

    expect(review.listVisibleCards(OWNER_ID).map((card) => card.title)).toEqual([
      TENDER_STUB_COPY.sharedCardTitle,
      TENDER_STUB_COPY.draftCardTitle,
    ]);

    review.setCardGrants(OWNER_ID, TENDER_STUB_IDS.draftCardId, [TENDER_STUB_IDS.generalContractorUserId]);

    expect(review.getVisibleCard(TENDER_STUB_IDS.generalContractorUserId, TENDER_STUB_IDS.draftCardId)?.status).toBe('shared');
    expect(review.getVisibleCard(TENDER_STUB_IDS.installerUserId, TENDER_STUB_IDS.draftCardId)).toBeNull();
    expect(review.listGrantsForCard(OWNER_ID, TENDER_STUB_IDS.draftCardId)).toEqual([
      expect.objectContaining({
        granteeUserId: TENDER_STUB_IDS.generalContractorUserId,
        profileKind: 'general_contractor',
        grantedBy: OWNER_ID,
        createdAt: RECORDED_AT,
      }),
    ]);
  });

  it('refuses inbox access and grant edits from a non-owner', () => {
    const review = store();

    expect(decisionInboxHref(false)).toBeNull();
    expect(() => review.listInbox(TENDER_STUB_IDS.installerUserId)).toThrow(TenderReviewAccessError);
    expect(() => review.listDecisions(STRANGER_ID)).toThrow(TenderReviewAccessError);
    expect(() =>
      review.recordDecision(TENDER_STUB_IDS.installerUserId, {
        subjectType: 'alternate_pack',
        subjectId: TENDER_STUB_IDS.packId,
        action: 'approve',
      }),
    ).toThrow(TenderReviewAccessError);
    expect(() => review.setCardGrants(TENDER_STUB_IDS.installerUserId, TENDER_STUB_IDS.sharedCardId, [])).toThrow(
      TenderReviewAccessError,
    );
  });

  it('records approve, deny, and suggest with actor, note, and timestamp', () => {
    const review = store([OWNER_ID]);

    const approved = review.recordDecision(OWNER_ID, {
      subjectType: 'alternate_pack',
      subjectId: TENDER_STUB_IDS.packId,
      action: 'approve',
      note: '  Use satin at the entry.  ',
    });
    const suggested = review.recordDecision(OWNER_ID, {
      subjectType: 'scout_queue_item',
      subjectId: TENDER_STUB_IDS.scoutId,
      action: 'suggest',
      note: '   ',
    });

    expect(approved).toMatchObject({
      action: 'approve',
      note: 'Use satin at the entry.',
      actorId: OWNER_ID,
      createdAt: RECORDED_AT,
      subjectType: 'alternate_pack',
    });
    expect(suggested.note).toBeNull();
    expect(review.listInbox(OWNER_ID).map((item) => item.subjectId)).toEqual([TENDER_STUB_IDS.scoutId]);
    expect(review.listInbox(OWNER_ID)[0]?.status).toBe('suggested');

    review.recordDecision(OWNER_ID, {
      subjectType: 'scout_queue_item',
      subjectId: TENDER_STUB_IDS.scoutId,
      action: 'deny',
    });

    expect(review.listInbox(OWNER_ID)).toEqual([]);
    expect(review.listDecisions(OWNER_ID).map((decision) => decision.action)).toEqual(['deny', 'suggest', 'approve']);
    expect(decisionInboxHref(true)).toBe('/board/inbox');
  });
});

describe('tender review phase 0 schema sketch', () => {
  const migration = readFileSync(
    resolve(process.cwd(), 'supabase/migrations/20261029181900_tender_alternate_review_phase0.sql'),
    'utf8',
  );
  const service = readFileSync(resolve(process.cwd(), 'src/services/tender-review.ts'), 'utf8');
  const more = readFileSync(resolve(process.cwd(), 'app/(app)/more/index.tsx'), 'utf8');
  const inbox = readFileSync(resolve(process.cwd(), 'app/(app)/board/inbox.tsx'), 'utf8');
  const detail = readFileSync(resolve(process.cwd(), 'app/(app)/board/[id].tsx'), 'utf8');

  it('keeps the decision tables owner-only and does not trust user metadata', () => {
    for (const table of [
      'public.project_board_cards',
      'public.project_board_grants',
      'public.alternate_packs',
      'public.scout_queue_items',
      'public.tender_decisions',
    ]) {
      expect(migration).toContain(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`);
    }

    expect(migration).toContain("role = 'semco_owner'");
    expect(migration).toContain('private.is_semco_owner()');
    expect(migration).toContain("action IN ('approve', 'deny', 'suggest')");
    expect(migration).toContain('private.apply_tender_decision');
    expect(migration).not.toContain('user_metadata');
    expect(migration).not.toMatch(/eas update|expo-notifications|webhook/i);
    expect(migration).toContain('REVOKE ALL ON TABLE public.tender_decisions FROM PUBLIC, anon, authenticated');
    expect(migration).toContain('CREATE POLICY tender_decisions_owner_select');
    expect(migration).not.toContain("INSERT INTO public.admin_profiles");
  });

  it('keeps the client stub local and hides the inbox route unless the owner gate passes', () => {
    expect(service).not.toContain('supabase');
    expect(service).not.toContain('user_metadata');
    expect(service).not.toMatch(/webhook/i);
    expect(more).toContain('decisionInboxHref(isOwner)');
    expect(more).not.toContain("'/board/inbox'");
    expect(inbox).toContain("router.replace('/board'");
    expect(inbox).toContain('Approve');
    expect(inbox).toContain('Deny');
    expect(inbox).toContain('Suggest');
    expect(detail).toContain('Select profiles');
  });
});

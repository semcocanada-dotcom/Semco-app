-- Phase 0 sketch for Semco Pro tender alternate review.
-- DO NOT APPLY to production project hriocefqjedalnaebeiw as part of this change.
-- No push notification, OTA publish, store submit, or live Ops callback is created here.
--
-- Two layers:
-- 1. project_board_cards + project_board_grants
--    The Semco owner shares a project board with selected profiles
--    (installer, general contractor, or other). Everyone else sees nothing.
-- 2. alternate_packs, scout_queue_items, tender_decisions
--    Owner-only decision inbox. Approve, deny, or suggest. A note is optional.
--    semco_admin, dealer_admin, and granted board profiles have no policies here.
--
-- The owner gate is admin_profiles.role = 'semco_owner' via private.is_semco_owner().
-- Do not authorize this from editable account metadata. This file does not insert an owner row;
-- seed that auth user out of band after review.

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.is_semco_owner()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_profiles
    WHERE user_id = (SELECT auth.uid())
      AND role = 'semco_owner'
  );
$$;

REVOKE ALL ON FUNCTION private.is_semco_owner() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_semco_owner() TO authenticated, service_role;

DO $$
DECLARE
  constraint_name text;
BEGIN
  FOR constraint_name IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
    WHERE nsp.nspname = 'public'
      AND rel.relname = 'admin_profiles'
      AND con.contype = 'c'
      AND pg_get_constraintdef(con.oid) ILIKE '%role%'
  LOOP
    EXECUTE format('ALTER TABLE public.admin_profiles DROP CONSTRAINT %I', constraint_name);
  END LOOP;
END;
$$;

ALTER TABLE public.admin_profiles
  ADD CONSTRAINT admin_profiles_role_check
  CHECK (role IN ('semco_owner', 'semco_admin', 'dealer_admin'));

ALTER TABLE public.admin_profiles
  ADD CONSTRAINT admin_profiles_role_dealer_check
  CHECK (
    (role IN ('semco_owner', 'semco_admin') AND dealer_id IS NULL)
    OR (role = 'dealer_admin' AND dealer_id IS NOT NULL)
  );

CREATE TABLE public.project_board_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  summary text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'shared', 'archived')),
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX project_board_cards_project_idx ON public.project_board_cards (project_id);
CREATE INDEX project_board_cards_status_idx ON public.project_board_cards (status);

CREATE TRIGGER project_board_cards_updated_at
  BEFORE UPDATE ON public.project_board_cards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.project_board_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_card_id uuid NOT NULL REFERENCES public.project_board_cards(id) ON DELETE CASCADE,
  grantee_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_kind text NOT NULL CHECK (profile_kind IN ('installer', 'general_contractor', 'other')),
  granted_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (board_card_id, grantee_user_id)
);

CREATE INDEX project_board_grants_grantee_idx ON public.project_board_grants (grantee_user_id);
CREATE INDEX project_board_grants_card_idx ON public.project_board_grants (board_card_id);

CREATE TABLE public.alternate_packs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  board_card_id uuid REFERENCES public.project_board_cards(id) ON DELETE SET NULL,
  title text NOT NULL,
  summary text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'suggested', 'approved', 'denied')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX alternate_packs_project_idx ON public.alternate_packs (project_id);
CREATE INDEX alternate_packs_status_idx ON public.alternate_packs (status);

CREATE TRIGGER alternate_packs_updated_at
  BEFORE UPDATE ON public.alternate_packs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.scout_queue_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  title text NOT NULL,
  summary text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'suggested', 'approved', 'denied')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX scout_queue_items_status_idx ON public.scout_queue_items (status);

CREATE TRIGGER scout_queue_items_updated_at
  BEFORE UPDATE ON public.scout_queue_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.tender_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_type text NOT NULL CHECK (subject_type IN ('alternate_pack', 'scout_queue_item')),
  subject_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('approve', 'deny', 'suggest')),
  note text,
  actor_id uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT tender_decisions_note_length CHECK (note IS NULL OR char_length(note) <= 2000)
);

CREATE INDEX tender_decisions_subject_idx ON public.tender_decisions (subject_type, subject_id);
CREATE INDEX tender_decisions_actor_idx ON public.tender_decisions (actor_id, created_at DESC);

CREATE OR REPLACE FUNCTION private.can_view_board_card(target_card_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.project_board_cards card
    WHERE card.id = target_card_id
      AND (
        private.is_semco_owner()
        OR (
          card.status = 'shared'
          AND EXISTS (
            SELECT 1
            FROM public.project_board_grants grant_row
            WHERE grant_row.board_card_id = card.id
              AND grant_row.grantee_user_id = (SELECT auth.uid())
          )
        )
      )
  );
$$;

REVOKE ALL ON FUNCTION private.can_view_board_card(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.can_view_board_card(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.validate_tender_decision_subject()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.subject_type = 'alternate_pack' AND EXISTS (
    SELECT 1 FROM public.alternate_packs WHERE id = NEW.subject_id
  ) THEN
    RETURN NEW;
  END IF;

  IF NEW.subject_type = 'scout_queue_item' AND EXISTS (
    SELECT 1 FROM public.scout_queue_items WHERE id = NEW.subject_id
  ) THEN
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Review item was not found';
END;
$$;

REVOKE ALL ON FUNCTION private.validate_tender_decision_subject() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER tender_decisions_validate_subject
  BEFORE INSERT ON public.tender_decisions
  FOR EACH ROW EXECUTE FUNCTION private.validate_tender_decision_subject();

CREATE OR REPLACE FUNCTION private.apply_tender_decision(
  target_subject_type text,
  target_subject_id uuid,
  target_action text,
  target_note text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  decision_id uuid := pg_catalog.gen_random_uuid();
  actor uuid := (SELECT auth.uid());
  next_status text;
  updated_count integer;
BEGIN
  IF actor IS NULL OR NOT private.is_semco_owner() THEN
    RAISE EXCEPTION 'Decision inbox is private to the Semco owner'
      USING ERRCODE = '42501';
  END IF;

  IF target_action NOT IN ('approve', 'deny', 'suggest') THEN
    RAISE EXCEPTION 'Unsupported decision action';
  END IF;

  next_status := CASE target_action
    WHEN 'approve' THEN 'approved'
    WHEN 'deny' THEN 'denied'
    ELSE 'suggested'
  END;

  IF target_subject_type = 'alternate_pack' THEN
    UPDATE public.alternate_packs
    SET status = next_status
    WHERE id = target_subject_id;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
  ELSIF target_subject_type = 'scout_queue_item' THEN
    UPDATE public.scout_queue_items
    SET status = next_status
    WHERE id = target_subject_id;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
  ELSE
    RAISE EXCEPTION 'Unsupported decision subject';
  END IF;

  IF updated_count = 0 THEN
    RAISE EXCEPTION 'Review item was not found';
  END IF;

  INSERT INTO public.tender_decisions (
    id, subject_type, subject_id, action, note, actor_id
  ) VALUES (
    decision_id,
    target_subject_type,
    target_subject_id,
    target_action,
    NULLIF(btrim(COALESCE(target_note, '')), ''),
    actor
  );

  RETURN decision_id;
END;
$$;

REVOKE ALL ON FUNCTION private.apply_tender_decision(text, uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.apply_tender_decision(text, uuid, text, text) TO authenticated, service_role;

ALTER TABLE public.project_board_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_board_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alternate_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scout_queue_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tender_decisions ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.project_board_cards FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.project_board_grants FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.alternate_packs FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.scout_queue_items FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.tender_decisions FROM PUBLIC, anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.project_board_cards TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.project_board_grants TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.alternate_packs TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.scout_queue_items TO authenticated, service_role;
GRANT SELECT, INSERT ON TABLE public.tender_decisions TO authenticated, service_role;

CREATE POLICY project_board_cards_select ON public.project_board_cards
  FOR SELECT TO authenticated
  USING ((SELECT private.can_view_board_card(id)));

CREATE POLICY project_board_cards_owner_insert ON public.project_board_cards
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT private.is_semco_owner()) AND created_by = (SELECT auth.uid()));

CREATE POLICY project_board_cards_owner_update ON public.project_board_cards
  FOR UPDATE TO authenticated
  USING ((SELECT private.is_semco_owner()))
  WITH CHECK ((SELECT private.is_semco_owner()));

CREATE POLICY project_board_cards_owner_delete ON public.project_board_cards
  FOR DELETE TO authenticated
  USING ((SELECT private.is_semco_owner()));

CREATE POLICY project_board_grants_select ON public.project_board_grants
  FOR SELECT TO authenticated
  USING (
    (SELECT private.is_semco_owner())
    OR grantee_user_id = (SELECT auth.uid())
  );

CREATE POLICY project_board_grants_owner_insert ON public.project_board_grants
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT private.is_semco_owner()) AND granted_by = (SELECT auth.uid()));

CREATE POLICY project_board_grants_owner_update ON public.project_board_grants
  FOR UPDATE TO authenticated
  USING ((SELECT private.is_semco_owner()))
  WITH CHECK ((SELECT private.is_semco_owner()) AND granted_by = (SELECT auth.uid()));

CREATE POLICY project_board_grants_owner_delete ON public.project_board_grants
  FOR DELETE TO authenticated
  USING ((SELECT private.is_semco_owner()));

CREATE POLICY alternate_packs_owner_select ON public.alternate_packs
  FOR SELECT TO authenticated
  USING ((SELECT private.is_semco_owner()));

CREATE POLICY alternate_packs_owner_insert ON public.alternate_packs
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT private.is_semco_owner()));

CREATE POLICY alternate_packs_owner_update ON public.alternate_packs
  FOR UPDATE TO authenticated
  USING ((SELECT private.is_semco_owner()))
  WITH CHECK ((SELECT private.is_semco_owner()));

CREATE POLICY alternate_packs_owner_delete ON public.alternate_packs
  FOR DELETE TO authenticated
  USING ((SELECT private.is_semco_owner()));

CREATE POLICY scout_queue_items_owner_select ON public.scout_queue_items
  FOR SELECT TO authenticated
  USING ((SELECT private.is_semco_owner()));

CREATE POLICY scout_queue_items_owner_insert ON public.scout_queue_items
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT private.is_semco_owner()));

CREATE POLICY scout_queue_items_owner_update ON public.scout_queue_items
  FOR UPDATE TO authenticated
  USING ((SELECT private.is_semco_owner()))
  WITH CHECK ((SELECT private.is_semco_owner()));

CREATE POLICY scout_queue_items_owner_delete ON public.scout_queue_items
  FOR DELETE TO authenticated
  USING ((SELECT private.is_semco_owner()));

CREATE POLICY tender_decisions_owner_select ON public.tender_decisions
  FOR SELECT TO authenticated
  USING ((SELECT private.is_semco_owner()));

CREATE POLICY tender_decisions_owner_insert ON public.tender_decisions
  FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT private.is_semco_owner())
    AND actor_id = (SELECT auth.uid())
  );

COMMENT ON TABLE public.project_board_cards IS
  'Phase 0 project board cards. Visible to the Semco owner and to profiles granted on project_board_grants.';

COMMENT ON TABLE public.project_board_grants IS
  'Profiles the Semco owner selected to see a board card. Not an inbox grant.';

COMMENT ON TABLE public.alternate_packs IS
  'Owner-only alternate packs waiting for approve, deny, or suggest.';

COMMENT ON TABLE public.scout_queue_items IS
  'Owner-only scouting queue. Never visible to granted board profiles.';

COMMENT ON TABLE public.tender_decisions IS
  'Append-only owner decisions. The client Phase 0 stub does not call private.apply_tender_decision yet.';

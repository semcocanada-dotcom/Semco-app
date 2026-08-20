-- Dealer Dashboard and CRM foundation.
--
-- This migration keeps SEMCO administrators national, scopes dealer staff to
-- their assigned dealer in Postgres, snapshots each project's dealer for
-- historical access, and adds an auditable lead / bid-opportunity workflow.

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.is_semco_admin()
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
      AND role = 'semco_admin'
  );
$$;

CREATE OR REPLACE FUNCTION private.current_dealer_id()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT dealer_id
  FROM public.admin_profiles
  WHERE user_id = (SELECT auth.uid())
    AND role = 'dealer_admin'
    AND dealer_id IS NOT NULL
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION private.can_manage_dealer(target_dealer_id text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT COALESCE(
    private.is_semco_admin()
    OR target_dealer_id = private.current_dealer_id(),
    false
  );
$$;

CREATE OR REPLACE FUNCTION private.installer_belongs_to_dealer(
  target_installer_id uuid,
  target_dealer_id text,
  allow_suspended boolean DEFAULT false
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.installer_profiles profile
    WHERE profile.installer_id = target_installer_id
      AND profile.assigned_dealer_id = target_dealer_id
      AND (allow_suspended OR profile.certification_status <> 'suspended')
  );
$$;

REVOKE ALL ON FUNCTION private.is_semco_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.current_dealer_id() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.can_manage_dealer(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.installer_belongs_to_dealer(uuid, text, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_semco_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.current_dealer_id() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.can_manage_dealer(text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.installer_belongs_to_dealer(uuid, text, boolean) TO authenticated, service_role;

-- A dealer administrator must belong to one real dealer. SEMCO administrators
-- retain the national view and therefore have no dealer_id.
CREATE INDEX IF NOT EXISTS admin_profiles_dealer_id_idx
  ON public.admin_profiles (dealer_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'admin_profiles_dealer_id_fkey'
      AND conrelid = 'public.admin_profiles'::regclass
  ) THEN
    ALTER TABLE public.admin_profiles
      ADD CONSTRAINT admin_profiles_dealer_id_fkey
      FOREIGN KEY (dealer_id) REFERENCES public.dealer_accounts(id)
      NOT VALID;
  END IF;
END;
$$;

ALTER TABLE public.admin_profiles
  VALIDATE CONSTRAINT admin_profiles_dealer_id_fkey;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'admin_profiles_role_dealer_check'
      AND conrelid = 'public.admin_profiles'::regclass
  ) THEN
    ALTER TABLE public.admin_profiles
      ADD CONSTRAINT admin_profiles_role_dealer_check
      CHECK (
        (role = 'semco_admin' AND dealer_id IS NULL)
        OR (role = 'dealer_admin' AND dealer_id IS NOT NULL)
      ) NOT VALID;
  END IF;
END;
$$;

ALTER TABLE public.admin_profiles
  VALIDATE CONSTRAINT admin_profiles_role_dealer_check;

-- Freeze the dealer relationship at project creation. A later address or
-- profile edit must not move historical project access between dealers.
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS dealer_id text REFERENCES public.dealer_accounts(id);

-- Preserve the original project recency while filling the immutable snapshot.
-- The existing trigger would otherwise stamp every historical row as updated
-- at migration time.
ALTER TABLE public.projects DISABLE TRIGGER projects_updated_at;

UPDATE public.projects project
SET dealer_id = profile.assigned_dealer_id
FROM public.installer_profiles profile
WHERE profile.installer_id = project.installer_id
  AND project.dealer_id IS NULL
  AND profile.assigned_dealer_id IS NOT NULL;

ALTER TABLE public.projects ENABLE TRIGGER projects_updated_at;

ALTER TABLE public.projects
  ALTER COLUMN dealer_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS projects_dealer_id_updated_at_idx
  ON public.projects (dealer_id, updated_at DESC);

CREATE OR REPLACE FUNCTION private.set_project_dealer_snapshot()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  resolved_dealer_id text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT assigned_dealer_id
    INTO resolved_dealer_id
    FROM public.installer_profiles
    WHERE installer_id = NEW.installer_id;

    IF resolved_dealer_id IS NULL THEN
      RAISE EXCEPTION 'Installer must be assigned to a dealer before creating a project';
    END IF;

    NEW.dealer_id := resolved_dealer_id;
  ELSIF NEW.dealer_id IS DISTINCT FROM OLD.dealer_id
     OR NEW.installer_id IS DISTINCT FROM OLD.installer_id THEN
    RAISE EXCEPTION 'Project installer and dealer snapshot are immutable';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.set_project_dealer_snapshot() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION private.set_project_dealer_snapshot() TO service_role;

DROP TRIGGER IF EXISTS projects_set_dealer_snapshot ON public.projects;
CREATE TRIGGER projects_set_dealer_snapshot
  BEFORE INSERT OR UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION private.set_project_dealer_snapshot();

-- New accounts are routed from their original location. Existing users cannot
-- move their own authorization boundary by editing address text later.
CREATE OR REPLACE FUNCTION public.protect_installer_profile_admin_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  resolved_dealer text;
BEGIN
  IF auth.uid() IS NULL OR public.is_semco_admin() THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    resolved_dealer := public.resolve_canadian_dealer_id(
      NEW.postal_code,
      NEW.province,
      NEW.company_address
    );
    IF resolved_dealer IS NULL THEN
      RAISE EXCEPTION 'A supported Canadian province or postal code is required';
    END IF;
    NEW.certification_status := 'pending';
    NEW.assigned_dealer_id := resolved_dealer;
  ELSE
    NEW.certification_status := OLD.certification_status;
    NEW.assigned_dealer_id := OLD.assigned_dealer_id;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.protect_installer_profile_admin_fields() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.protect_installer_profile_admin_fields() TO service_role;

-- Dealer reads use the immutable project snapshot. Installer owner and SEMCO
-- administrator policies continue to coexist with these read-only policies.
DROP POLICY IF EXISTS "dealer_projects_assigned_select" ON public.projects;
CREATE POLICY "dealer_projects_assigned_select" ON public.projects
  FOR SELECT TO authenticated
  USING (dealer_id = (SELECT private.current_dealer_id()));

DROP POLICY IF EXISTS "dealer_project_photos_assigned_select" ON public.project_photos;
CREATE POLICY "dealer_project_photos_assigned_select" ON public.project_photos
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.projects project
      WHERE project.id = project_photos.project_id
        AND project.dealer_id = (SELECT private.current_dealer_id())
    )
  );

DROP POLICY IF EXISTS "dealer_signoffs_assigned_select" ON public.project_signoffs;
CREATE POLICY "dealer_signoffs_assigned_select" ON public.project_signoffs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.projects project
      WHERE project.id::text = project_signoffs.project_id
        AND project.dealer_id = (SELECT private.current_dealer_id())
    )
  );

DROP POLICY IF EXISTS "dealer_warranty_reviews_assigned_select" ON public.warranty_reviews;
CREATE POLICY "dealer_warranty_reviews_assigned_select" ON public.warranty_reviews
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.projects project
      WHERE project.id = warranty_reviews.project_id
        AND project.dealer_id = (SELECT private.current_dealer_id())
    )
  );

-- Material requests inherit the frozen project dealer. Neither an installer
-- nor dealer staff can relabel a request to expose it across dealer borders.
ALTER TABLE public.order_requests DISABLE TRIGGER order_requests_updated_at;

UPDATE public.order_requests AS request
SET dealer_id = project.dealer_id
FROM public.projects AS project
WHERE project.id = request.project_id
  AND request.dealer_id IS DISTINCT FROM project.dealer_id;

ALTER TABLE public.order_requests ENABLE TRIGGER order_requests_updated_at;

CREATE INDEX IF NOT EXISTS order_requests_dealer_updated_at_idx
  ON public.order_requests (dealer_id, updated_at DESC);

CREATE OR REPLACE FUNCTION private.set_order_request_dealer_snapshot()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  resolved_dealer_id text;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.project_id IS DISTINCT FROM OLD.project_id THEN
    RAISE EXCEPTION 'Order request project snapshot is immutable';
  END IF;

  SELECT project.dealer_id
  INTO resolved_dealer_id
  FROM public.projects AS project
  WHERE project.id = NEW.project_id;

  IF resolved_dealer_id IS NULL THEN
    RAISE EXCEPTION 'Order request requires a project with a dealer snapshot';
  END IF;

  NEW.dealer_id := resolved_dealer_id;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.set_order_request_dealer_snapshot() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION private.set_order_request_dealer_snapshot() TO service_role;

DROP TRIGGER IF EXISTS order_requests_set_dealer_snapshot ON public.order_requests;
CREATE TRIGGER order_requests_set_dealer_snapshot
  BEFORE INSERT OR UPDATE ON public.order_requests
  FOR EACH ROW EXECUTE FUNCTION private.set_order_request_dealer_snapshot();

DROP POLICY IF EXISTS "dealer_orders_assigned_select" ON public.order_requests;
CREATE POLICY "dealer_orders_assigned_select" ON public.order_requests
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.projects AS project
      WHERE project.id = order_requests.project_id
        AND project.dealer_id = (SELECT private.current_dealer_id())
    )
  );

DROP POLICY IF EXISTS "dealer_orders_assigned_update" ON public.order_requests;
CREATE POLICY "dealer_orders_assigned_update" ON public.order_requests
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.projects AS project
      WHERE project.id = order_requests.project_id
        AND project.dealer_id = (SELECT private.current_dealer_id())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.projects AS project
      WHERE project.id = order_requests.project_id
        AND project.dealer_id = (SELECT private.current_dealer_id())
    )
  );

-- Dealers only need warranty project photos. Owners and SEMCO administrators
-- retain their existing access to all relevant private buckets.
DROP POLICY IF EXISTS "installer_private_files_select" ON storage.objects;
CREATE POLICY "installer_private_files_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id IN ('project-photos','project-signoffs','purchase-receipts','color-samples','warranty-documents')
    AND (
      (storage.foldername(name))[1] = (SELECT auth.uid())::text
      OR private.is_semco_admin()
      OR (
        bucket_id = 'project-photos'
        AND EXISTS (
          SELECT 1
          FROM public.projects project
          WHERE project.installer_id::text = (storage.foldername(name))[1]
            AND project.id::text = (storage.foldername(name))[2]
            AND project.dealer_id = private.current_dealer_id()
        )
      )
    )
  );

CREATE TABLE IF NOT EXISTS public.crm_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id text NOT NULL REFERENCES public.dealer_accounts(id),
  -- Actor UUIDs are immutable audit snapshots rather than deletion-blocking
  -- foreign keys into auth.users.
  created_by uuid NOT NULL,
  updated_by uuid,
  assigned_installer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  source text NOT NULL DEFAULT 'other'
    CHECK (source IN ('website','email','phone','referral','dealer','other')),
  pipeline_status text NOT NULL DEFAULT 'new'
    CHECK (pipeline_status IN ('new','contacted','qualified','site_visit','quoted','bidding','won','lost')),
  priority text NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('low','normal','high','urgent')),
  contact_name text NOT NULL CHECK (length(btrim(contact_name)) > 0),
  company_name text,
  contact_email text,
  contact_phone text,
  project_type text,
  project_summary text,
  site_address text,
  city text,
  province text,
  postal_code text,
  estimated_area_sqft numeric(12,2) CHECK (estimated_area_sqft IS NULL OR estimated_area_sqft >= 0),
  estimated_value_cad numeric(12,2) CHECK (estimated_value_cad IS NULL OR estimated_value_cad >= 0),
  desired_start_date date,
  next_follow_up_at timestamptz,
  consent_basis text NOT NULL DEFAULT 'direct_inquiry'
    CHECK (consent_basis IN ('direct_inquiry','referral','business_relationship','other')),
  notes text,
  lost_reason text,
  converted_project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bid_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id text NOT NULL REFERENCES public.dealer_accounts(id),
  lead_id uuid REFERENCES public.crm_leads(id) ON DELETE SET NULL,
  created_by uuid NOT NULL,
  updated_by uuid,
  title text NOT NULL CHECK (length(btrim(title)) > 0),
  project_type text,
  scope_summary text,
  city text,
  province text,
  postal_prefix text,
  estimated_area_sqft numeric(12,2) CHECK (estimated_area_sqft IS NULL OR estimated_area_sqft >= 0),
  desired_start_date date,
  response_due_at timestamptz,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','open','reviewing','awarded','closed_no_award','cancelled')),
  awarded_installer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  published_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bid_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id text NOT NULL REFERENCES public.dealer_accounts(id),
  opportunity_id uuid NOT NULL REFERENCES public.bid_opportunities(id) ON DELETE CASCADE,
  installer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_by uuid NOT NULL,
  updated_by uuid,
  status text NOT NULL DEFAULT 'invited'
    CHECK (status IN ('invited','viewed','interested','declined','withdrawn','awarded','not_selected')),
  delivery_status text NOT NULL DEFAULT 'not_configured'
    CHECK (delivery_status IN ('not_configured','pending','sent','failed')),
  delivery_attempted_at timestamptz,
  viewed_at timestamptz,
  responded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (opportunity_id, installer_id)
);

CREATE TABLE IF NOT EXISTS public.bid_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id text NOT NULL REFERENCES public.dealer_accounts(id),
  invitation_id uuid NOT NULL UNIQUE REFERENCES public.bid_invitations(id) ON DELETE CASCADE,
  installer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_cad numeric(12,2) CHECK (amount_cad IS NULL OR amount_cad >= 0),
  estimated_start_date date,
  estimated_duration_days integer CHECK (estimated_duration_days IS NULL OR estimated_duration_days > 0),
  message text,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','submitted','withdrawn')),
  submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.crm_activity_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id text NOT NULL REFERENCES public.dealer_accounts(id),
  entity_type text NOT NULL
    CHECK (entity_type IN ('lead','opportunity','invitation','response')),
  entity_id uuid NOT NULL,
  event_type text NOT NULL,
  actor_user_id uuid,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS crm_leads_dealer_status_updated_idx
  ON public.crm_leads (dealer_id, pipeline_status, updated_at DESC);
CREATE INDEX IF NOT EXISTS crm_leads_assigned_installer_idx
  ON public.crm_leads (assigned_installer_id);
CREATE INDEX IF NOT EXISTS crm_leads_converted_project_idx
  ON public.crm_leads (converted_project_id);
CREATE INDEX IF NOT EXISTS crm_leads_created_by_idx
  ON public.crm_leads (created_by);
CREATE INDEX IF NOT EXISTS crm_leads_updated_by_idx
  ON public.crm_leads (updated_by)
  WHERE updated_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS crm_leads_next_follow_up_idx
  ON public.crm_leads (dealer_id, next_follow_up_at)
  WHERE archived_at IS NULL;
CREATE INDEX IF NOT EXISTS bid_opportunities_dealer_status_updated_idx
  ON public.bid_opportunities (dealer_id, status, updated_at DESC);
CREATE INDEX IF NOT EXISTS bid_opportunities_lead_id_idx
  ON public.bid_opportunities (lead_id);
CREATE INDEX IF NOT EXISTS bid_opportunities_awarded_installer_idx
  ON public.bid_opportunities (awarded_installer_id);
CREATE INDEX IF NOT EXISTS bid_opportunities_created_by_idx
  ON public.bid_opportunities (created_by);
CREATE INDEX IF NOT EXISTS bid_opportunities_updated_by_idx
  ON public.bid_opportunities (updated_by)
  WHERE updated_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS bid_invitations_dealer_installer_idx
  ON public.bid_invitations (dealer_id, installer_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS bid_invitations_installer_status_idx
  ON public.bid_invitations (installer_id, status, updated_at DESC);
CREATE INDEX IF NOT EXISTS bid_invitations_created_by_idx
  ON public.bid_invitations (created_by);
CREATE INDEX IF NOT EXISTS bid_invitations_updated_by_idx
  ON public.bid_invitations (updated_by)
  WHERE updated_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS bid_responses_dealer_status_idx
  ON public.bid_responses (dealer_id, status, updated_at DESC);
CREATE INDEX IF NOT EXISTS bid_responses_installer_idx
  ON public.bid_responses (installer_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS crm_activity_dealer_created_idx
  ON public.crm_activity_events (dealer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS crm_activity_entity_idx
  ON public.crm_activity_events (entity_type, entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS crm_activity_actor_idx
  ON public.crm_activity_events (actor_user_id)
  WHERE actor_user_id IS NOT NULL;

CREATE OR REPLACE FUNCTION private.stamp_dealer_crm_row()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF (SELECT auth.uid()) IS NOT NULL THEN
      NEW.created_by := (SELECT auth.uid());
      NEW.updated_by := (SELECT auth.uid());
    END IF;
    NEW.created_at := pg_catalog.now();
  ELSE
    NEW.id := OLD.id;
    NEW.dealer_id := OLD.dealer_id;
    NEW.created_by := OLD.created_by;
    NEW.created_at := OLD.created_at;
    IF (SELECT auth.uid()) IS NOT NULL THEN
      NEW.updated_by := (SELECT auth.uid());
    ELSE
      NEW.updated_by := OLD.updated_by;
    END IF;
  END IF;
  NEW.updated_at := pg_catalog.now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION private.validate_crm_lead_scope()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.assigned_installer_id IS NOT NULL
       AND NOT private.installer_belongs_to_dealer(NEW.assigned_installer_id, NEW.dealer_id, false) THEN
      RAISE EXCEPTION 'Assigned installer must belong to the same dealer and cannot be suspended';
    END IF;

    IF NEW.converted_project_id IS NOT NULL
       AND NOT EXISTS (
         SELECT 1 FROM public.projects AS project
         WHERE project.id = NEW.converted_project_id
           AND project.dealer_id = NEW.dealer_id
       ) THEN
      RAISE EXCEPTION 'Converted project must belong to the same dealer';
    END IF;
  ELSE
    IF (NEW.dealer_id IS DISTINCT FROM OLD.dealer_id
        OR NEW.assigned_installer_id IS DISTINCT FROM OLD.assigned_installer_id)
       AND NEW.assigned_installer_id IS NOT NULL
       AND NOT private.installer_belongs_to_dealer(NEW.assigned_installer_id, NEW.dealer_id, false) THEN
      RAISE EXCEPTION 'Assigned installer must belong to the same dealer and cannot be suspended';
    END IF;

    IF (NEW.dealer_id IS DISTINCT FROM OLD.dealer_id
        OR NEW.converted_project_id IS DISTINCT FROM OLD.converted_project_id)
       AND NEW.converted_project_id IS NOT NULL
       AND NOT EXISTS (
         SELECT 1 FROM public.projects AS project
         WHERE project.id = NEW.converted_project_id
           AND project.dealer_id = NEW.dealer_id
       ) THEN
      RAISE EXCEPTION 'Converted project must belong to the same dealer';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION private.validate_bid_opportunity_scope()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.lead_id IS NOT NULL
       AND NOT EXISTS (
         SELECT 1 FROM public.crm_leads AS lead
         WHERE lead.id = NEW.lead_id
           AND lead.dealer_id = NEW.dealer_id
           AND lead.pipeline_status NOT IN ('won', 'lost')
       ) THEN
      RAISE EXCEPTION 'Lead must belong to the same dealer and remain active';
    END IF;

    IF NEW.status NOT IN ('draft', 'open') THEN
      RAISE EXCEPTION 'A new opportunity must be draft or open';
    END IF;

    IF NEW.awarded_installer_id IS NOT NULL THEN
      RAISE EXCEPTION 'A new opportunity cannot already be awarded';
    END IF;

    NEW.closed_at := NULL;
    IF NEW.status = 'draft' THEN
      NEW.published_at := NULL;
    ELSE
      NEW.published_at := pg_catalog.now();
      IF NEW.response_due_at IS NOT NULL
         AND NEW.response_due_at <= NEW.published_at THEN
        RAISE EXCEPTION 'Response deadline must be after publication';
      END IF;
    END IF;
  ELSE
    IF (NEW.dealer_id IS DISTINCT FROM OLD.dealer_id
        OR NEW.lead_id IS DISTINCT FROM OLD.lead_id)
       AND NEW.lead_id IS NOT NULL
       AND NOT EXISTS (
         SELECT 1 FROM public.crm_leads AS lead
         WHERE lead.id = NEW.lead_id
           AND lead.dealer_id = NEW.dealer_id
           AND lead.pipeline_status NOT IN ('won', 'lost')
       ) THEN
      RAISE EXCEPTION 'Lead must belong to the same dealer and remain active';
    END IF;

    IF NEW.status IS DISTINCT FROM OLD.status AND NOT (
      (OLD.status = 'draft' AND NEW.status IN ('open', 'cancelled'))
      OR (OLD.status = 'open' AND NEW.status IN ('reviewing', 'awarded', 'closed_no_award', 'cancelled'))
      OR (OLD.status = 'reviewing' AND NEW.status IN ('open', 'awarded', 'closed_no_award', 'cancelled'))
    ) THEN
      RAISE EXCEPTION 'Invalid opportunity status transition from % to %', OLD.status, NEW.status;
    END IF;

    IF OLD.status = 'awarded'
       AND NEW.awarded_installer_id IS DISTINCT FROM OLD.awarded_installer_id
       AND NOT (
         (SELECT auth.uid()) IS NULL
         AND OLD.awarded_installer_id IS NOT NULL
         AND NEW.awarded_installer_id IS NULL
       ) THEN
      RAISE EXCEPTION 'An awarded opportunity winner is immutable';
    END IF;

    IF NEW.status = 'draft' THEN
      NEW.published_at := NULL;
      NEW.closed_at := NULL;
      NEW.awarded_installer_id := NULL;
    ELSIF NEW.status IN ('open', 'reviewing') THEN
      NEW.published_at := COALESCE(OLD.published_at, pg_catalog.now());
      NEW.closed_at := NULL;
      NEW.awarded_installer_id := NULL;

      IF NEW.response_due_at IS NOT NULL
         AND NEW.response_due_at < NEW.published_at THEN
        RAISE EXCEPTION 'Response deadline cannot precede publication';
      END IF;

      IF NEW.status = 'open'
         AND (OLD.status IS DISTINCT FROM 'open'
              OR NEW.response_due_at IS DISTINCT FROM OLD.response_due_at)
         AND NEW.response_due_at IS NOT NULL
         AND NEW.response_due_at <= pg_catalog.now() THEN
        RAISE EXCEPTION 'Response deadline must be in the future when opening';
      END IF;
    ELSE
      NEW.published_at := OLD.published_at;
      NEW.closed_at := COALESCE(OLD.closed_at, pg_catalog.now());

      IF NEW.status = 'awarded' THEN
        IF NEW.awarded_installer_id IS NULL THEN
          -- auth-user deletion uses ON DELETE SET NULL. Preserve the historical
          -- awarded state without allowing an authenticated staff edit to
          -- remove the winner.
          IF NOT (
            (SELECT auth.uid()) IS NULL
            AND OLD.status = 'awarded'
            AND OLD.awarded_installer_id IS NOT NULL
          ) THEN
            RAISE EXCEPTION 'Awarded installer is required';
          END IF;
        ELSIF OLD.status IS DISTINCT FROM 'awarded'
              OR NEW.awarded_installer_id IS DISTINCT FROM OLD.awarded_installer_id THEN
          IF NOT private.installer_belongs_to_dealer(
            NEW.awarded_installer_id,
            NEW.dealer_id,
            false
          ) THEN
            RAISE EXCEPTION 'Awarded installer must belong to the same dealer and cannot be suspended';
          END IF;

          IF NOT EXISTS (
            SELECT 1
            FROM public.bid_invitations AS invitation
            JOIN public.bid_responses AS response
              ON response.invitation_id = invitation.id
             AND response.installer_id = invitation.installer_id
            WHERE invitation.opportunity_id = NEW.id
              AND invitation.installer_id = NEW.awarded_installer_id
              AND invitation.dealer_id = NEW.dealer_id
              AND invitation.status IN ('invited', 'viewed', 'interested')
              AND response.status = 'submitted'
          ) THEN
            RAISE EXCEPTION 'Award requires an invited installer with a submitted bid';
          END IF;
        END IF;
      ELSE
        NEW.awarded_installer_id := NULL;
      END IF;
    END IF;
  END IF;

  IF NEW.response_due_at IS NOT NULL
     AND NEW.published_at IS NOT NULL
     AND NEW.response_due_at < NEW.published_at THEN
    RAISE EXCEPTION 'Response deadline cannot precede publication';
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION private.sync_bid_award_invitations()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.status = 'awarded'
     AND NEW.awarded_installer_id IS NOT NULL
     AND (
       OLD.status IS DISTINCT FROM NEW.status
       OR OLD.awarded_installer_id IS DISTINCT FROM NEW.awarded_installer_id
     ) THEN
    UPDATE public.bid_invitations AS invitation
    SET status = CASE
          WHEN invitation.installer_id = NEW.awarded_installer_id THEN 'awarded'
          ELSE 'not_selected'
        END,
        updated_by = (SELECT auth.uid())
    WHERE invitation.opportunity_id = NEW.id
      AND invitation.status IS DISTINCT FROM CASE
        WHEN invitation.installer_id = NEW.awarded_installer_id THEN 'awarded'
        ELSE 'not_selected'
      END;
  ELSIF NEW.status IN ('closed_no_award', 'cancelled')
        AND OLD.status IS DISTINCT FROM NEW.status THEN
    UPDATE public.bid_invitations AS invitation
    SET status = 'not_selected',
        updated_by = (SELECT auth.uid())
    WHERE invitation.opportunity_id = NEW.id
      AND invitation.status IN ('invited', 'viewed', 'interested');
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION private.protect_bid_invitation_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  actor_id uuid := (SELECT auth.uid());
  actor_is_staff boolean := false;
  parent_status text;
  parent_awarded_installer_id uuid;
  parent_response_due_at timestamptz;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF actor_id IS NOT NULL THEN
      NEW.created_by := actor_id;
      NEW.updated_by := actor_id;
      NEW.status := 'invited';
      NEW.delivery_status := 'not_configured';
      NEW.delivery_attempted_at := NULL;
      NEW.viewed_at := NULL;
      NEW.responded_at := NULL;
    END IF;
    NEW.created_at := pg_catalog.now();
    NEW.updated_at := pg_catalog.now();
    RETURN NEW;
  END IF;

  NEW.id := OLD.id;
  NEW.dealer_id := OLD.dealer_id;
  NEW.opportunity_id := OLD.opportunity_id;
  NEW.installer_id := OLD.installer_id;
  NEW.created_by := OLD.created_by;
  NEW.created_at := OLD.created_at;

  SELECT
    opportunity.status,
    opportunity.awarded_installer_id,
    opportunity.response_due_at
  INTO
    parent_status,
    parent_awarded_installer_id,
    parent_response_due_at
  FROM public.bid_opportunities AS opportunity
  WHERE opportunity.id = OLD.opportunity_id
    AND opportunity.dealer_id = OLD.dealer_id;

  IF parent_status IS NULL THEN
    RAISE EXCEPTION 'Invitation parent opportunity is unavailable';
  END IF;

  IF actor_id IS NOT NULL THEN
    actor_is_staff := private.can_manage_dealer(OLD.dealer_id);

    -- A dealer staff account may also own an installer profile. While the
    -- opportunity is open, owner updates are treated as installer actions;
    -- parent-finalization updates are treated as staff actions.
    IF actor_id = OLD.installer_id AND parent_status = 'open' THEN
      IF NOT private.installer_belongs_to_dealer(
        OLD.installer_id,
        OLD.dealer_id,
        false
      ) THEN
        RAISE EXCEPTION 'Installer is no longer eligible for this dealer invitation';
      END IF;

      IF NEW.delivery_status IS DISTINCT FROM OLD.delivery_status
         OR NEW.delivery_attempted_at IS DISTINCT FROM OLD.delivery_attempted_at THEN
        RAISE EXCEPTION 'Installers cannot change invitation delivery fields';
      END IF;

      NEW.delivery_status := OLD.delivery_status;
      NEW.delivery_attempted_at := OLD.delivery_attempted_at;

      IF NEW.status IS DISTINCT FROM OLD.status AND NOT (
        (OLD.status = 'invited' AND NEW.status IN ('viewed', 'interested', 'declined'))
        OR (OLD.status = 'viewed' AND NEW.status IN ('interested', 'declined'))
        OR (OLD.status = 'interested' AND NEW.status IN ('declined', 'withdrawn'))
        OR (OLD.status IN ('declined', 'withdrawn') AND NEW.status = 'interested')
      ) THEN
        RAISE EXCEPTION 'Invalid installer invitation transition from % to %', OLD.status, NEW.status;
      END IF;

      IF NEW.status IN ('declined', 'withdrawn')
         AND NEW.status IS DISTINCT FROM OLD.status
         AND EXISTS (
           SELECT 1
           FROM public.bid_responses AS response
           WHERE response.invitation_id = OLD.id
             AND response.status = 'submitted'
         ) THEN
        RAISE EXCEPTION 'Withdraw the submitted bid response before declining the invitation';
      END IF;

      IF NEW.status IS DISTINCT FROM OLD.status
         AND (
           parent_status IS DISTINCT FROM 'open'
           OR (
             parent_response_due_at IS NOT NULL
             AND parent_response_due_at < pg_catalog.now()
           )
         ) THEN
        RAISE EXCEPTION 'Bid invitation is no longer open for responses';
      END IF;

      NEW.viewed_at := COALESCE(OLD.viewed_at, pg_catalog.now());
      IF NEW.status IN ('interested', 'declined', 'withdrawn') THEN
        IF NEW.status IS DISTINCT FROM OLD.status THEN
          NEW.responded_at := pg_catalog.now();
        ELSE
          NEW.responded_at := COALESCE(OLD.responded_at, pg_catalog.now());
        END IF;
      ELSE
        NEW.responded_at := OLD.responded_at;
      END IF;
    ELSIF actor_is_staff THEN
      NEW.viewed_at := OLD.viewed_at;
      NEW.responded_at := OLD.responded_at;

      IF OLD.status = 'awarded' AND NEW.status IS DISTINCT FROM OLD.status THEN
        RAISE EXCEPTION 'An awarded invitation is final';
      END IF;

      IF NEW.status IS DISTINCT FROM OLD.status THEN
        IF parent_status = 'awarded' THEN
          IF (
            OLD.installer_id = parent_awarded_installer_id
            AND NEW.status IS DISTINCT FROM 'awarded'
          ) OR (
            OLD.installer_id IS DISTINCT FROM parent_awarded_installer_id
            AND NEW.status IS DISTINCT FROM 'not_selected'
          ) THEN
            RAISE EXCEPTION 'Invitation status must match the awarded opportunity';
          END IF;
        ELSIF parent_status IN ('closed_no_award', 'cancelled') THEN
          IF NEW.status IS DISTINCT FROM 'not_selected' THEN
            RAISE EXCEPTION 'Closed opportunity invitations cannot be reopened';
          END IF;
        ELSE
          RAISE EXCEPTION 'Staff cannot change installer response status before finalizing the opportunity';
        END IF;
      END IF;
    ELSE
      RAISE EXCEPTION 'Invitation update access denied';
    END IF;

    NEW.updated_by := actor_id;
  ELSE
    NEW.updated_by := OLD.updated_by;
  END IF;

  NEW.updated_at := pg_catalog.now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION private.validate_bid_invitation_scope()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.bid_opportunities AS opportunity
      WHERE opportunity.id = NEW.opportunity_id
        AND opportunity.dealer_id = NEW.dealer_id
        AND opportunity.status = 'open'
        AND (
          opportunity.response_due_at IS NULL
          OR opportunity.response_due_at >= pg_catalog.now()
        )
    ) THEN
      RAISE EXCEPTION 'Invitation requires an open, unexpired opportunity for the same dealer';
    END IF;

    IF NOT private.installer_belongs_to_dealer(NEW.installer_id, NEW.dealer_id, false) THEN
      RAISE EXCEPTION 'Invited installer must belong to the same dealer and cannot be suspended';
    END IF;
  ELSE
    IF (NEW.dealer_id IS DISTINCT FROM OLD.dealer_id
        OR NEW.opportunity_id IS DISTINCT FROM OLD.opportunity_id)
       AND NOT EXISTS (
         SELECT 1 FROM public.bid_opportunities AS opportunity
         WHERE opportunity.id = NEW.opportunity_id
           AND opportunity.dealer_id = NEW.dealer_id
       ) THEN
      RAISE EXCEPTION 'Opportunity must belong to the same dealer';
    END IF;

    IF (NEW.dealer_id IS DISTINCT FROM OLD.dealer_id
        OR NEW.installer_id IS DISTINCT FROM OLD.installer_id)
       AND NOT private.installer_belongs_to_dealer(NEW.installer_id, NEW.dealer_id, false) THEN
      RAISE EXCEPTION 'Invited installer must belong to the same dealer and cannot be suspended';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION private.validate_bid_response_scope()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  actor_id uuid := (SELECT auth.uid());
  invitation_dealer_id text;
  invitation_installer_id uuid;
  invitation_status text;
  opportunity_status text;
  response_due_at timestamptz;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT
      invitation.dealer_id,
      invitation.installer_id,
      invitation.status,
      opportunity.status,
      opportunity.response_due_at
    INTO
      invitation_dealer_id,
      invitation_installer_id,
      invitation_status,
      opportunity_status,
      response_due_at
    FROM public.bid_invitations AS invitation
    JOIN public.bid_opportunities AS opportunity
      ON opportunity.id = invitation.opportunity_id
    WHERE invitation.id = NEW.invitation_id;

    IF invitation_dealer_id IS NULL THEN
      RAISE EXCEPTION 'Bid invitation does not exist';
    END IF;

    NEW.dealer_id := invitation_dealer_id;
    NEW.installer_id := invitation_installer_id;

    IF actor_id IS NOT NULL THEN
      IF actor_id IS DISTINCT FROM invitation_installer_id THEN
        RAISE EXCEPTION 'Only the invited installer can create a bid response';
      END IF;

      IF NOT private.installer_belongs_to_dealer(
        invitation_installer_id,
        invitation_dealer_id,
        false
      ) THEN
        RAISE EXCEPTION 'Installer is no longer eligible to respond for this dealer';
      END IF;
    END IF;

    IF NEW.status NOT IN ('draft', 'submitted') THEN
      RAISE EXCEPTION 'A new bid response must be draft or submitted';
    END IF;

    NEW.created_at := pg_catalog.now();
  ELSE
    NEW.dealer_id := OLD.dealer_id;
    NEW.invitation_id := OLD.invitation_id;
    NEW.installer_id := OLD.installer_id;
    NEW.created_at := OLD.created_at;

    SELECT
      invitation.status,
      opportunity.status,
      opportunity.response_due_at
    INTO
      invitation_status,
      opportunity_status,
      response_due_at
    FROM public.bid_invitations AS invitation
    JOIN public.bid_opportunities AS opportunity
      ON opportunity.id = invitation.opportunity_id
    WHERE invitation.id = OLD.invitation_id
      AND invitation.dealer_id = OLD.dealer_id
      AND invitation.installer_id = OLD.installer_id;

    IF actor_id IS NOT NULL THEN
      IF actor_id IS DISTINCT FROM OLD.installer_id THEN
        RAISE EXCEPTION 'Only the invited installer can update a bid response';
      END IF;

      IF NOT private.installer_belongs_to_dealer(
        OLD.installer_id,
        OLD.dealer_id,
        false
      ) THEN
        RAISE EXCEPTION 'Installer is no longer eligible to respond for this dealer';
      END IF;
    END IF;

    IF NEW.status IS DISTINCT FROM OLD.status AND NOT (
      (OLD.status = 'draft' AND NEW.status = 'submitted')
      OR (OLD.status = 'submitted' AND NEW.status = 'withdrawn')
      OR (OLD.status = 'withdrawn' AND NEW.status = 'submitted')
    ) THEN
      RAISE EXCEPTION 'Invalid bid response transition from % to %', OLD.status, NEW.status;
    END IF;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF invitation_status IS NULL
       OR invitation_status NOT IN ('invited', 'viewed', 'interested') THEN
      RAISE EXCEPTION 'Bid invitation is unavailable or closed';
    END IF;
  ELSE
    IF invitation_status IS NULL
       OR (
         invitation_status NOT IN ('invited', 'viewed', 'interested')
         AND NOT (
           OLD.status = 'withdrawn'
           AND NEW.status = 'submitted'
           AND invitation_status = 'withdrawn'
         )
       ) THEN
      RAISE EXCEPTION 'Bid invitation is unavailable or closed';
    END IF;
  END IF;

  IF opportunity_status IS DISTINCT FROM 'open'
     OR (response_due_at IS NOT NULL AND response_due_at < pg_catalog.now()) THEN
    RAISE EXCEPTION 'Bid invitation is unavailable or closed';
  END IF;

  NEW.updated_at := pg_catalog.now();
  IF TG_OP = 'INSERT' THEN
    IF NEW.status = 'submitted' THEN
      NEW.submitted_at := pg_catalog.now();
    ELSE
      NEW.submitted_at := NULL;
    END IF;
  ELSE
    IF NEW.status = 'submitted' AND OLD.status IS DISTINCT FROM 'submitted' THEN
      NEW.submitted_at := pg_catalog.now();
    ELSIF OLD.status = 'submitted' THEN
      NEW.submitted_at := OLD.submitted_at;
    ELSE
      NEW.submitted_at := NULL;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION private.sync_bid_response_invitation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  invitation_status text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status = 'submitted' THEN
      invitation_status := 'interested';
    END IF;
  ELSE
    IF NEW.status = 'submitted' AND OLD.status IS DISTINCT FROM 'submitted' THEN
      invitation_status := 'interested';
    ELSIF NEW.status = 'withdrawn' AND OLD.status IS DISTINCT FROM 'withdrawn' THEN
      invitation_status := 'withdrawn';
    END IF;
  END IF;

  IF invitation_status IS NOT NULL THEN
    UPDATE public.bid_invitations AS invitation
    SET status = invitation_status,
        viewed_at = COALESCE(invitation.viewed_at, pg_catalog.now()),
        responded_at = pg_catalog.now(),
        updated_by = (SELECT auth.uid())
    WHERE invitation.id = NEW.invitation_id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION private.record_crm_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  activity_dealer_id text;
  activity_entity_type text;
  activity_entity_id uuid;
  activity_event_type text;
  activity_details jsonb := '{}'::jsonb;
BEGIN
  activity_dealer_id := NEW.dealer_id;
  activity_entity_id := NEW.id;

  IF TG_TABLE_NAME = 'crm_leads' THEN
    activity_entity_type := 'lead';
    IF TG_OP = 'INSERT' THEN
      activity_event_type := 'lead_created';
      activity_details := pg_catalog.jsonb_build_object('status', NEW.pipeline_status);
    ELSIF NEW.pipeline_status IS DISTINCT FROM OLD.pipeline_status THEN
      activity_event_type := 'lead_status_changed';
      activity_details := pg_catalog.jsonb_build_object('from', OLD.pipeline_status, 'to', NEW.pipeline_status);
    ELSIF NEW.assigned_installer_id IS DISTINCT FROM OLD.assigned_installer_id THEN
      activity_event_type := 'lead_assignment_changed';
      activity_details := pg_catalog.jsonb_build_object('installer_id', NEW.assigned_installer_id);
    ELSE
      RETURN NEW;
    END IF;
  ELSIF TG_TABLE_NAME = 'bid_opportunities' THEN
    activity_entity_type := 'opportunity';
    IF TG_OP = 'INSERT' THEN
      activity_event_type := 'opportunity_created';
      activity_details := pg_catalog.jsonb_build_object('status', NEW.status);
    ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
      activity_event_type := 'opportunity_status_changed';
      activity_details := pg_catalog.jsonb_build_object('from', OLD.status, 'to', NEW.status);
    ELSE
      RETURN NEW;
    END IF;
  ELSIF TG_TABLE_NAME = 'bid_invitations' THEN
    activity_entity_type := 'invitation';
    IF TG_OP = 'INSERT' THEN
      activity_event_type := 'installer_invited';
      activity_details := pg_catalog.jsonb_build_object('installer_id', NEW.installer_id, 'opportunity_id', NEW.opportunity_id);
    ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
      activity_event_type := 'invitation_status_changed';
      activity_details := pg_catalog.jsonb_build_object('from', OLD.status, 'to', NEW.status, 'installer_id', NEW.installer_id);
    ELSE
      RETURN NEW;
    END IF;
  ELSIF TG_TABLE_NAME = 'bid_responses' THEN
    activity_entity_type := 'response';
    IF TG_OP = 'INSERT' THEN
      activity_event_type := 'bid_response_created';
      activity_details := pg_catalog.jsonb_build_object('status', NEW.status, 'invitation_id', NEW.invitation_id);
    ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
      activity_event_type := 'bid_response_status_changed';
      activity_details := pg_catalog.jsonb_build_object('from', OLD.status, 'to', NEW.status);
    ELSE
      RETURN NEW;
    END IF;
  ELSE
    RETURN NEW;
  END IF;

  INSERT INTO public.crm_activity_events (
    dealer_id, entity_type, entity_id, event_type, actor_user_id, details
  ) VALUES (
    activity_dealer_id,
    activity_entity_type,
    activity_entity_id,
    activity_event_type,
    (SELECT auth.uid()),
    activity_details
  );

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.stamp_dealer_crm_row() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.validate_crm_lead_scope() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.validate_bid_opportunity_scope() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.sync_bid_award_invitations() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.protect_bid_invitation_fields() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.validate_bid_invitation_scope() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.validate_bid_response_scope() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.sync_bid_response_invitation() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.record_crm_activity() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION private.stamp_dealer_crm_row() TO service_role;
GRANT EXECUTE ON FUNCTION private.validate_crm_lead_scope() TO service_role;
GRANT EXECUTE ON FUNCTION private.validate_bid_opportunity_scope() TO service_role;
GRANT EXECUTE ON FUNCTION private.sync_bid_award_invitations() TO service_role;
GRANT EXECUTE ON FUNCTION private.protect_bid_invitation_fields() TO service_role;
GRANT EXECUTE ON FUNCTION private.validate_bid_invitation_scope() TO service_role;
GRANT EXECUTE ON FUNCTION private.validate_bid_response_scope() TO service_role;
GRANT EXECUTE ON FUNCTION private.sync_bid_response_invitation() TO service_role;
GRANT EXECUTE ON FUNCTION private.record_crm_activity() TO service_role;

DROP TRIGGER IF EXISTS crm_leads_stamp_actor ON public.crm_leads;
CREATE TRIGGER crm_leads_stamp_actor
  BEFORE INSERT OR UPDATE ON public.crm_leads
  FOR EACH ROW EXECUTE FUNCTION private.stamp_dealer_crm_row();
DROP TRIGGER IF EXISTS crm_leads_validate_scope ON public.crm_leads;
CREATE TRIGGER crm_leads_validate_scope
  BEFORE INSERT OR UPDATE ON public.crm_leads
  FOR EACH ROW EXECUTE FUNCTION private.validate_crm_lead_scope();
DROP TRIGGER IF EXISTS crm_leads_record_activity ON public.crm_leads;
CREATE TRIGGER crm_leads_record_activity
  AFTER INSERT OR UPDATE ON public.crm_leads
  FOR EACH ROW EXECUTE FUNCTION private.record_crm_activity();

DROP TRIGGER IF EXISTS bid_opportunities_stamp_actor ON public.bid_opportunities;
CREATE TRIGGER bid_opportunities_stamp_actor
  BEFORE INSERT OR UPDATE ON public.bid_opportunities
  FOR EACH ROW EXECUTE FUNCTION private.stamp_dealer_crm_row();
DROP TRIGGER IF EXISTS bid_opportunities_validate_scope ON public.bid_opportunities;
CREATE TRIGGER bid_opportunities_validate_scope
  BEFORE INSERT OR UPDATE ON public.bid_opportunities
  FOR EACH ROW EXECUTE FUNCTION private.validate_bid_opportunity_scope();
DROP TRIGGER IF EXISTS bid_opportunities_record_activity ON public.bid_opportunities;
CREATE TRIGGER bid_opportunities_record_activity
  AFTER INSERT OR UPDATE ON public.bid_opportunities
  FOR EACH ROW EXECUTE FUNCTION private.record_crm_activity();
DROP TRIGGER IF EXISTS bid_opportunities_sync_award ON public.bid_opportunities;
CREATE TRIGGER bid_opportunities_sync_award
  AFTER UPDATE ON public.bid_opportunities
  FOR EACH ROW EXECUTE FUNCTION private.sync_bid_award_invitations();

DROP TRIGGER IF EXISTS bid_invitations_stamp_actor ON public.bid_invitations;
DROP TRIGGER IF EXISTS bid_invitations_protect_fields ON public.bid_invitations;
CREATE TRIGGER bid_invitations_protect_fields
  BEFORE INSERT OR UPDATE ON public.bid_invitations
  FOR EACH ROW EXECUTE FUNCTION private.protect_bid_invitation_fields();
DROP TRIGGER IF EXISTS bid_invitations_validate_scope ON public.bid_invitations;
CREATE TRIGGER bid_invitations_validate_scope
  BEFORE INSERT OR UPDATE ON public.bid_invitations
  FOR EACH ROW EXECUTE FUNCTION private.validate_bid_invitation_scope();
DROP TRIGGER IF EXISTS bid_invitations_record_activity ON public.bid_invitations;
CREATE TRIGGER bid_invitations_record_activity
  AFTER INSERT OR UPDATE ON public.bid_invitations
  FOR EACH ROW EXECUTE FUNCTION private.record_crm_activity();

DROP TRIGGER IF EXISTS bid_responses_validate_scope ON public.bid_responses;
CREATE TRIGGER bid_responses_validate_scope
  BEFORE INSERT OR UPDATE ON public.bid_responses
  FOR EACH ROW EXECUTE FUNCTION private.validate_bid_response_scope();
DROP TRIGGER IF EXISTS bid_responses_record_activity ON public.bid_responses;
CREATE TRIGGER bid_responses_record_activity
  AFTER INSERT OR UPDATE ON public.bid_responses
  FOR EACH ROW EXECUTE FUNCTION private.record_crm_activity();
DROP TRIGGER IF EXISTS bid_responses_sync_invitation ON public.bid_responses;
CREATE TRIGGER bid_responses_sync_invitation
  AFTER INSERT OR UPDATE ON public.bid_responses
  FOR EACH ROW EXECUTE FUNCTION private.sync_bid_response_invitation();

ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bid_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bid_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bid_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_activity_events ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.crm_leads FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.bid_opportunities FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.bid_invitations FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.bid_responses FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.crm_activity_events FROM PUBLIC, anon, authenticated;

GRANT SELECT, INSERT ON TABLE public.crm_leads TO authenticated;
GRANT UPDATE (
  assigned_installer_id, source, pipeline_status, priority, contact_name,
  company_name, contact_email, contact_phone, project_type, project_summary,
  site_address, city, province, postal_code, estimated_area_sqft,
  estimated_value_cad, desired_start_date, next_follow_up_at, consent_basis,
  notes, lost_reason, converted_project_id, archived_at
) ON TABLE public.crm_leads TO authenticated;
GRANT SELECT, INSERT ON TABLE public.bid_opportunities TO authenticated;
GRANT UPDATE (
  lead_id, title, project_type, scope_summary, city, province, postal_prefix,
  estimated_area_sqft, desired_start_date, response_due_at, status,
  awarded_installer_id
) ON TABLE public.bid_opportunities TO authenticated;
GRANT SELECT, INSERT ON TABLE public.bid_invitations TO authenticated;
GRANT UPDATE (status, delivery_status, delivery_attempted_at)
  ON TABLE public.bid_invitations TO authenticated;
GRANT SELECT, INSERT ON TABLE public.bid_responses TO authenticated;
GRANT UPDATE (
  amount_cad, estimated_start_date, estimated_duration_days, message, status
) ON TABLE public.bid_responses TO authenticated;
GRANT SELECT ON TABLE public.crm_activity_events TO authenticated;
GRANT ALL ON TABLE public.crm_leads, public.bid_opportunities, public.bid_invitations,
  public.bid_responses, public.crm_activity_events TO service_role;

CREATE POLICY "crm_leads_staff_select" ON public.crm_leads
  FOR SELECT TO authenticated
  USING (private.can_manage_dealer(dealer_id));
CREATE POLICY "crm_leads_staff_insert" ON public.crm_leads
  FOR INSERT TO authenticated
  WITH CHECK (private.can_manage_dealer(dealer_id));
CREATE POLICY "crm_leads_staff_update" ON public.crm_leads
  FOR UPDATE TO authenticated
  USING (private.can_manage_dealer(dealer_id))
  WITH CHECK (private.can_manage_dealer(dealer_id));

CREATE POLICY "bid_opportunities_staff_select" ON public.bid_opportunities
  FOR SELECT TO authenticated
  USING (private.can_manage_dealer(dealer_id));
CREATE POLICY "bid_opportunities_invited_installer_select" ON public.bid_opportunities
  FOR SELECT TO authenticated
  USING (
    status <> 'draft'
    AND EXISTS (
      SELECT 1
      FROM public.bid_invitations invitation
      WHERE invitation.opportunity_id = bid_opportunities.id
        AND invitation.installer_id = (SELECT auth.uid())
    )
  );
CREATE POLICY "bid_opportunities_staff_insert" ON public.bid_opportunities
  FOR INSERT TO authenticated
  WITH CHECK (private.can_manage_dealer(dealer_id));
CREATE POLICY "bid_opportunities_staff_update" ON public.bid_opportunities
  FOR UPDATE TO authenticated
  USING (private.can_manage_dealer(dealer_id))
  WITH CHECK (private.can_manage_dealer(dealer_id));

CREATE POLICY "bid_invitations_staff_select" ON public.bid_invitations
  FOR SELECT TO authenticated
  USING (private.can_manage_dealer(dealer_id));
CREATE POLICY "bid_invitations_installer_select" ON public.bid_invitations
  FOR SELECT TO authenticated
  USING (installer_id = (SELECT auth.uid()));
CREATE POLICY "bid_invitations_staff_insert" ON public.bid_invitations
  FOR INSERT TO authenticated
  WITH CHECK (private.can_manage_dealer(dealer_id));
CREATE POLICY "bid_invitations_staff_update" ON public.bid_invitations
  FOR UPDATE TO authenticated
  USING (private.can_manage_dealer(dealer_id))
  WITH CHECK (private.can_manage_dealer(dealer_id));
CREATE POLICY "bid_invitations_installer_update" ON public.bid_invitations
  FOR UPDATE TO authenticated
  USING (installer_id = (SELECT auth.uid()))
  WITH CHECK (installer_id = (SELECT auth.uid()));

CREATE POLICY "bid_responses_staff_select" ON public.bid_responses
  FOR SELECT TO authenticated
  USING (private.can_manage_dealer(dealer_id));
CREATE POLICY "bid_responses_installer_select" ON public.bid_responses
  FOR SELECT TO authenticated
  USING (installer_id = (SELECT auth.uid()));
CREATE POLICY "bid_responses_installer_insert" ON public.bid_responses
  FOR INSERT TO authenticated
  WITH CHECK (installer_id = (SELECT auth.uid()));
CREATE POLICY "bid_responses_installer_update" ON public.bid_responses
  FOR UPDATE TO authenticated
  USING (installer_id = (SELECT auth.uid()))
  WITH CHECK (installer_id = (SELECT auth.uid()));

CREATE POLICY "crm_activity_staff_select" ON public.crm_activity_events
  FOR SELECT TO authenticated
  USING (private.can_manage_dealer(dealer_id));

CREATE OR REPLACE FUNCTION public.create_bid_opportunity(
  p_dealer_id text,
  p_lead_id uuid,
  p_title text,
  p_project_type text,
  p_scope_summary text,
  p_city text,
  p_province text,
  p_postal_prefix text,
  p_estimated_area_sqft numeric,
  p_desired_start_date date,
  p_response_due_at timestamptz,
  p_installer_ids uuid[]
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  opportunity_id uuid;
  unique_installer_count integer;
  eligible_installer_count integer;
  invitation_count integer := 0;
BEGIN
  IF (SELECT auth.uid()) IS NULL
     OR private.can_manage_dealer(p_dealer_id) IS NOT TRUE THEN
    RAISE EXCEPTION 'Dealer access required';
  END IF;

  IF p_title IS NULL OR pg_catalog.length(pg_catalog.btrim(p_title)) = 0 THEN
    RAISE EXCEPTION 'Opportunity title is required';
  END IF;

  IF p_response_due_at IS NOT NULL
     AND p_response_due_at <= pg_catalog.now() THEN
    RAISE EXCEPTION 'Response deadline must be in the future';
  END IF;

  IF p_lead_id IS NOT NULL
     AND NOT EXISTS (
       SELECT 1
       FROM public.crm_leads AS lead
       WHERE lead.id = p_lead_id
         AND lead.dealer_id = p_dealer_id
         AND lead.pipeline_status NOT IN ('won', 'lost')
     ) THEN
    RAISE EXCEPTION 'Lead must belong to this dealer and remain active';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_catalog.unnest(COALESCE(p_installer_ids, ARRAY[]::uuid[])) AS requested(installer_id)
    WHERE requested.installer_id IS NULL
  ) THEN
    RAISE EXCEPTION 'Installer invitation list cannot contain null values';
  END IF;

  SELECT pg_catalog.count(DISTINCT requested.installer_id)
  INTO unique_installer_count
  FROM pg_catalog.unnest(COALESCE(p_installer_ids, ARRAY[]::uuid[])) AS requested(installer_id);

  SELECT pg_catalog.count(*)
  INTO eligible_installer_count
  FROM (
    SELECT DISTINCT requested.installer_id
    FROM pg_catalog.unnest(COALESCE(p_installer_ids, ARRAY[]::uuid[])) AS requested(installer_id)
    WHERE private.installer_belongs_to_dealer(requested.installer_id, p_dealer_id, false)
  ) eligible;

  IF unique_installer_count <> eligible_installer_count THEN
    RAISE EXCEPTION 'Every invited installer must belong to this dealer and cannot be suspended';
  END IF;

  INSERT INTO public.bid_opportunities (
    dealer_id, lead_id, created_by, updated_by, title, project_type,
    scope_summary, city, province, postal_prefix, estimated_area_sqft,
    desired_start_date, response_due_at, status, published_at
  ) VALUES (
    p_dealer_id,
    p_lead_id,
    (SELECT auth.uid()),
    (SELECT auth.uid()),
    pg_catalog.btrim(p_title),
    NULLIF(pg_catalog.btrim(p_project_type), ''),
    NULLIF(pg_catalog.btrim(p_scope_summary), ''),
    NULLIF(pg_catalog.btrim(p_city), ''),
    NULLIF(pg_catalog.btrim(p_province), ''),
    NULLIF(pg_catalog.btrim(p_postal_prefix), ''),
    p_estimated_area_sqft,
    p_desired_start_date,
    p_response_due_at,
    CASE WHEN unique_installer_count > 0 THEN 'open' ELSE 'draft' END,
    NULL
  )
  RETURNING id INTO opportunity_id;

  INSERT INTO public.bid_invitations (
    dealer_id, opportunity_id, installer_id, created_by, updated_by
  )
  SELECT
    p_dealer_id,
    opportunity_id,
    installer_id,
    (SELECT auth.uid()),
    (SELECT auth.uid())
  FROM (
    SELECT DISTINCT installer_id
    FROM pg_catalog.unnest(COALESCE(p_installer_ids, ARRAY[]::uuid[])) AS requested(installer_id)
  ) invitees;

  GET DIAGNOSTICS invitation_count = ROW_COUNT;

  IF p_lead_id IS NOT NULL AND invitation_count > 0 THEN
    UPDATE public.crm_leads
    SET pipeline_status = 'bidding'
    WHERE id = p_lead_id
      AND dealer_id = p_dealer_id
      AND pipeline_status NOT IN ('won','lost');
  END IF;

  RETURN opportunity_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_bid_opportunity(
  text, uuid, text, text, text, text, text, text, numeric, date, timestamptz, uuid[]
) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_bid_opportunity(
  text, uuid, text, text, text, text, text, text, numeric, date, timestamptz, uuid[]
) TO authenticated;

-- Awarding is one transaction: the opportunity trigger validates the submitted
-- response and the AFTER trigger marks the winner and non-selected invitees.
CREATE OR REPLACE FUNCTION public.award_bid_opportunity(
  p_opportunity_id uuid,
  p_installer_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  awarded_opportunity_id uuid;
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'Dealer access required';
  END IF;

  IF p_opportunity_id IS NULL OR p_installer_id IS NULL THEN
    RAISE EXCEPTION 'Opportunity and installer are required';
  END IF;

  UPDATE public.bid_opportunities AS opportunity
  SET status = 'awarded',
      awarded_installer_id = p_installer_id
  WHERE opportunity.id = p_opportunity_id
    AND opportunity.status IN ('open', 'reviewing')
    AND private.can_manage_dealer(opportunity.dealer_id)
  RETURNING opportunity.id INTO awarded_opportunity_id;

  IF awarded_opportunity_id IS NULL THEN
    RAISE EXCEPTION 'Open dealer opportunity not found';
  END IF;

  RETURN awarded_opportunity_id;
END;
$$;

REVOKE ALL ON FUNCTION public.award_bid_opportunity(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.award_bid_opportunity(uuid, uuid) TO authenticated;

-- Mike's existing confirmed auth account becomes the Modern Arc dealer admin.
-- The lookup is stable and does not hard-code a generated auth UUID.
INSERT INTO public.admin_profiles (user_id, role, dealer_id, display_name)
SELECT id, 'dealer_admin', 'modern-arc', 'Mike Bzowski'
FROM auth.users
WHERE lower(email) = lower('mike@modernarc.ca')
  AND deleted_at IS NULL
  AND email_confirmed_at IS NOT NULL
ON CONFLICT (user_id) DO UPDATE
SET role = EXCLUDED.role,
    dealer_id = EXCLUDED.dealer_id,
    display_name = EXCLUDED.display_name
WHERE public.admin_profiles.role = 'dealer_admin';

-- Contractor release: secure cloud persistence for installer projects, photos,
-- forms, material requests, receipts, rewards, and account-deletion requests.

-- Apply the previously prepared hardening changes idempotently. The production
-- database was created before migration history was tracked, so this release
-- migration must not assume 009 already ran.
UPDATE storage.buckets SET public = false WHERE id = 'project-signoffs';

CREATE OR REPLACE FUNCTION public.is_semco_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_profiles
    WHERE user_id = auth.uid()
      AND role = 'semco_admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_semco_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_semco_admin() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.dealer_can_access_installer(installer_id_text text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_profiles admin
    JOIN public.installer_profiles installer
      ON installer.assigned_dealer_id = admin.dealer_id
    WHERE admin.user_id = auth.uid()
      AND admin.role = 'dealer_admin'
      AND installer.installer_id::text = installer_id_text
  );
$$;

REVOKE ALL ON FUNCTION public.dealer_can_access_installer(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.dealer_can_access_installer(text) TO authenticated, service_role;

-- Preserve the app's local references while retaining UUID foreign keys for
-- canonical products and colours. The local seed library uses stable codes and
-- SKUs rather than cloud UUIDs.
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS selected_color_ref text;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS sealer_product_ref text;
ALTER TABLE public.batch_logs ADD COLUMN IF NOT EXISTS product_ref text;
ALTER TABLE public.batch_logs ALTER COLUMN product_id DROP NOT NULL;
ALTER TABLE public.colors ADD COLUMN IF NOT EXISTS photo_storage_path text;

-- Private installer storage. Paths always start with the authenticated user id.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('project-photos', 'project-photos', false, 15728640, ARRAY['image/jpeg','image/png','image/heic','image/heif']),
  ('project-signoffs', 'project-signoffs', false, 15728640, ARRAY['application/pdf']),
  ('purchase-receipts', 'purchase-receipts', false, 10485760, ARRAY['image/jpeg','image/png','image/heic','image/heif','application/pdf']),
  ('color-samples', 'color-samples', false, 10485760, ARRAY['image/jpeg','image/png','image/heic','image/heif']),
  ('warranty-documents', 'warranty-documents', false, 15728640, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "project_signoffs_storage_owner_select" ON storage.objects;
DROP POLICY IF EXISTS "project_signoffs_storage_owner_insert" ON storage.objects;
DROP POLICY IF EXISTS "project_signoffs_storage_owner_update" ON storage.objects;
DROP POLICY IF EXISTS "project_signoffs_storage_admin_all" ON storage.objects;
DROP POLICY IF EXISTS "installer_private_files_select" ON storage.objects;
DROP POLICY IF EXISTS "installer_private_files_insert" ON storage.objects;
DROP POLICY IF EXISTS "installer_private_files_update" ON storage.objects;
DROP POLICY IF EXISTS "installer_private_files_delete" ON storage.objects;

CREATE POLICY "installer_private_files_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id IN ('project-photos','project-signoffs','purchase-receipts','color-samples','warranty-documents')
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.is_semco_admin()
      OR public.dealer_can_access_installer((storage.foldername(name))[1])
    )
  );

CREATE POLICY "installer_private_files_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id IN ('project-photos','project-signoffs','purchase-receipts','color-samples','warranty-documents')
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.is_semco_admin()
    )
  );

CREATE POLICY "installer_private_files_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id IN ('project-photos','project-signoffs','purchase-receipts','color-samples','warranty-documents')
    AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_semco_admin())
  )
  WITH CHECK (
    bucket_id IN ('project-photos','project-signoffs','purchase-receipts','color-samples','warranty-documents')
    AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_semco_admin())
  );

CREATE POLICY "installer_private_files_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id IN ('project-photos','project-signoffs','purchase-receipts','color-samples','warranty-documents')
    AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_semco_admin())
  );

-- Admin-owned fields cannot be self-certified or forged by an installer.
CREATE OR REPLACE FUNCTION public.protect_installer_profile_admin_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR public.is_semco_admin() THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.certification_status := 'pending';
    NEW.assigned_dealer_id := 'modern-arc';
  ELSE
    NEW.certification_status := OLD.certification_status;
    -- Modern Arc is the active default dealer until a western dealer is enabled.
    NEW.assigned_dealer_id := COALESCE(OLD.assigned_dealer_id, 'modern-arc');
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.protect_installer_profile_admin_fields() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.protect_installer_profile_admin_fields() TO authenticated, service_role;

DROP TRIGGER IF EXISTS installer_profiles_protect_admin_fields ON public.installer_profiles;
CREATE TRIGGER installer_profiles_protect_admin_fields
  BEFORE INSERT OR UPDATE ON public.installer_profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_installer_profile_admin_fields();

CREATE OR REPLACE FUNCTION public.protect_project_admin_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR public.is_semco_admin() THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.warranty_issued := false;
  ELSE
    NEW.warranty_issued := OLD.warranty_issued;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.protect_project_admin_fields() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.protect_project_admin_fields() TO authenticated, service_role;

DROP TRIGGER IF EXISTS projects_protect_admin_fields ON public.projects;
CREATE TRIGGER projects_protect_admin_fields
  BEFORE INSERT OR UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.protect_project_admin_fields();

CREATE OR REPLACE FUNCTION public.protect_installer_review_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR public.is_semco_admin() THEN
    RETURN NEW;
  END IF;

  IF TG_TABLE_NAME = 'order_requests' THEN
    IF TG_OP = 'INSERT' THEN
      NEW.dealer_submitted_at := NULL;
      NEW.dealer_reference := NULL;
    ELSE
      NEW.dealer_submitted_at := OLD.dealer_submitted_at;
      NEW.dealer_reference := OLD.dealer_reference;
    END IF;
  ELSIF TG_TABLE_NAME = 'warranty_reviews' THEN
    IF TG_OP = 'INSERT' THEN
      NEW.reviewer_name := NULL;
      NEW.reviewer_signature_url := NULL;
      NEW.warranty_document_url := NULL;
      NEW.reviewed_at := NULL;
    ELSE
      NEW.reviewer_name := OLD.reviewer_name;
      NEW.reviewer_signature_url := OLD.reviewer_signature_url;
      NEW.warranty_document_url := OLD.warranty_document_url;
      NEW.reviewed_at := OLD.reviewed_at;
    END IF;
  ELSIF TG_TABLE_NAME = 'purchase_receipts' THEN
    IF TG_OP = 'INSERT' THEN
      NEW.reviewed_at := NULL;
    ELSE
      NEW.reviewed_at := OLD.reviewed_at;
    END IF;
  ELSIF TG_TABLE_NAME = 'reward_credits' THEN
    IF TG_OP = 'INSERT' THEN
      NEW.verified_at := NULL;
    ELSE
      NEW.verified_at := OLD.verified_at;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.protect_installer_review_fields() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.protect_installer_review_fields() TO authenticated, service_role;

DROP TRIGGER IF EXISTS order_requests_protect_review_fields ON public.order_requests;
CREATE TRIGGER order_requests_protect_review_fields
  BEFORE INSERT OR UPDATE ON public.order_requests
  FOR EACH ROW EXECUTE FUNCTION public.protect_installer_review_fields();
DROP TRIGGER IF EXISTS warranty_reviews_protect_review_fields ON public.warranty_reviews;
CREATE TRIGGER warranty_reviews_protect_review_fields
  BEFORE INSERT OR UPDATE ON public.warranty_reviews
  FOR EACH ROW EXECUTE FUNCTION public.protect_installer_review_fields();
DROP TRIGGER IF EXISTS purchase_receipts_protect_review_fields ON public.purchase_receipts;
CREATE TRIGGER purchase_receipts_protect_review_fields
  BEFORE INSERT OR UPDATE ON public.purchase_receipts
  FOR EACH ROW EXECUTE FUNCTION public.protect_installer_review_fields();
DROP TRIGGER IF EXISTS reward_credits_protect_review_fields ON public.reward_credits;
CREATE TRIGGER reward_credits_protect_review_fields
  BEFORE INSERT OR UPDATE ON public.reward_credits
  FOR EACH ROW EXECUTE FUNCTION public.protect_installer_review_fields();

-- Account deletion can be initiated in-app. Semco administrators complete the
-- deletion after checking legal retention requirements for signed contracts.
CREATE TABLE IF NOT EXISTS public.account_deletion_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  installer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','cancelled')),
  reason text,
  requested_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON public.account_deletion_requests TO authenticated;
GRANT ALL ON public.account_deletion_requests TO service_role;
DROP POLICY IF EXISTS "account_deletion_owner_select" ON public.account_deletion_requests;
DROP POLICY IF EXISTS "account_deletion_owner_insert" ON public.account_deletion_requests;
DROP POLICY IF EXISTS "account_deletion_admin_all" ON public.account_deletion_requests;
CREATE POLICY "account_deletion_owner_select" ON public.account_deletion_requests
  FOR SELECT TO authenticated USING (installer_id = auth.uid());
CREATE POLICY "account_deletion_owner_insert" ON public.account_deletion_requests
  FOR INSERT TO authenticated WITH CHECK (
    installer_id = auth.uid() AND status = 'pending' AND completed_at IS NULL
  );
CREATE POLICY "account_deletion_admin_all" ON public.account_deletion_requests
  TO authenticated USING (public.is_semco_admin()) WITH CHECK (public.is_semco_admin());

-- Recreate installer write policies with explicit authenticated roles and
-- review-state constraints. Admin/dealer read policies from earlier migrations
-- remain in place.
DROP POLICY IF EXISTS "installers_own_projects" ON public.projects;
CREATE POLICY "installers_own_projects" ON public.projects
  TO authenticated
  USING (installer_id = auth.uid())
  WITH CHECK (installer_id = auth.uid());

DROP POLICY IF EXISTS "installers_own_project_photos" ON public.project_photos;
CREATE POLICY "installers_own_project_photos" ON public.project_photos
  TO authenticated
  USING (
    installer_id = auth.uid()
    AND project_id IN (SELECT id FROM public.projects WHERE installer_id = auth.uid())
  )
  WITH CHECK (
    installer_id = auth.uid()
    AND project_id IN (SELECT id FROM public.projects WHERE installer_id = auth.uid())
  );

DROP POLICY IF EXISTS "installers_own_batch_logs" ON public.batch_logs;
CREATE POLICY "installers_own_batch_logs" ON public.batch_logs
  TO authenticated
  USING (project_id IN (SELECT id FROM public.projects WHERE installer_id = auth.uid()))
  WITH CHECK (project_id IN (SELECT id FROM public.projects WHERE installer_id = auth.uid()));

DROP POLICY IF EXISTS "installers_own_calculations" ON public.calculations;
CREATE POLICY "installers_own_calculations" ON public.calculations
  TO authenticated
  USING (
    installer_id = auth.uid()
    AND (project_id IS NULL OR project_id IN (SELECT id FROM public.projects WHERE installer_id = auth.uid()))
  )
  WITH CHECK (
    installer_id = auth.uid()
    AND (project_id IS NULL OR project_id IN (SELECT id FROM public.projects WHERE installer_id = auth.uid()))
  );

DROP POLICY IF EXISTS "installers_own_conversations" ON public.conversations;
CREATE POLICY "installers_own_conversations" ON public.conversations
  TO authenticated
  USING (installer_id = auth.uid())
  WITH CHECK (installer_id = auth.uid());

-- Replace legacy auth.role() checks with explicit policy roles. Anonymous
-- sessions must not receive the authenticated technical library or dealer list.
DROP POLICY IF EXISTS "products_readable_by_authenticated" ON public.products;
CREATE POLICY "products_readable_by_authenticated" ON public.products
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "embeddings_readable_by_authenticated" ON public.product_embeddings;
CREATE POLICY "embeddings_readable_by_authenticated" ON public.product_embeddings
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_dealers_read" ON public.dealer_accounts;
CREATE POLICY "authenticated_dealers_read" ON public.dealer_accounts
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "installer_profiles_owner_select" ON public.installer_profiles;
DROP POLICY IF EXISTS "installer_profiles_owner_insert" ON public.installer_profiles;
DROP POLICY IF EXISTS "installer_profiles_owner_update" ON public.installer_profiles;
CREATE POLICY "installer_profiles_owner_select" ON public.installer_profiles
  FOR SELECT TO authenticated USING (installer_id = auth.uid() OR public.is_semco_admin());
CREATE POLICY "installer_profiles_owner_insert" ON public.installer_profiles
  FOR INSERT TO authenticated WITH CHECK (installer_id = auth.uid() OR public.is_semco_admin());
CREATE POLICY "installer_profiles_owner_update" ON public.installer_profiles
  FOR UPDATE TO authenticated USING (installer_id = auth.uid() OR public.is_semco_admin())
  WITH CHECK (installer_id = auth.uid() OR public.is_semco_admin());

DROP POLICY IF EXISTS "order_requests_owner_insert" ON public.order_requests;
DROP POLICY IF EXISTS "order_requests_owner_update" ON public.order_requests;
CREATE POLICY "order_requests_owner_insert" ON public.order_requests
  FOR INSERT TO authenticated WITH CHECK (
    public.is_semco_admin()
    OR (
      project_id IN (SELECT id FROM public.projects WHERE installer_id = auth.uid())
      AND status IN ('draft','in_review')
      AND dealer_submitted_at IS NULL
      AND dealer_reference IS NULL
    )
  );
CREATE POLICY "order_requests_owner_update" ON public.order_requests
  FOR UPDATE TO authenticated
  USING (project_id IN (SELECT id FROM public.projects WHERE installer_id = auth.uid()) AND status IN ('draft','in_review'))
  WITH CHECK (project_id IN (SELECT id FROM public.projects WHERE installer_id = auth.uid()) AND status IN ('draft','in_review'));

DROP POLICY IF EXISTS "warranty_reviews_owner_insert" ON public.warranty_reviews;
DROP POLICY IF EXISTS "warranty_reviews_owner_update" ON public.warranty_reviews;
CREATE POLICY "warranty_reviews_owner_insert" ON public.warranty_reviews
  FOR INSERT TO authenticated WITH CHECK (
    public.is_semco_admin()
    OR (
      installer_id = auth.uid()
      AND project_id IN (SELECT id FROM public.projects WHERE installer_id = auth.uid())
      AND status IN ('not_submitted','in_review')
      AND reviewed_at IS NULL
    )
  );
CREATE POLICY "warranty_reviews_owner_update" ON public.warranty_reviews
  FOR UPDATE TO authenticated
  USING (
    installer_id = auth.uid()
    AND project_id IN (SELECT id FROM public.projects WHERE installer_id = auth.uid())
    AND status IN ('not_submitted','in_review')
  )
  WITH CHECK (
    installer_id = auth.uid()
    AND project_id IN (SELECT id FROM public.projects WHERE installer_id = auth.uid())
    AND status IN ('not_submitted','in_review')
  );

DROP POLICY IF EXISTS "purchase_receipts_owner_insert" ON public.purchase_receipts;
DROP POLICY IF EXISTS "purchase_receipts_owner_update" ON public.purchase_receipts;
CREATE POLICY "purchase_receipts_owner_insert" ON public.purchase_receipts
  FOR INSERT TO authenticated WITH CHECK (
    public.is_semco_admin()
    OR (
      installer_id = auth.uid()
      AND (project_id IS NULL OR project_id IN (SELECT id FROM public.projects WHERE installer_id = auth.uid()))
      AND status = 'pending'
      AND reviewed_at IS NULL
    )
  );
CREATE POLICY "purchase_receipts_owner_update" ON public.purchase_receipts
  FOR UPDATE TO authenticated
  USING (
    installer_id = auth.uid()
    AND (project_id IS NULL OR project_id IN (SELECT id FROM public.projects WHERE installer_id = auth.uid()))
    AND status = 'pending'
  )
  WITH CHECK (
    installer_id = auth.uid()
    AND (project_id IS NULL OR project_id IN (SELECT id FROM public.projects WHERE installer_id = auth.uid()))
    AND status = 'pending'
  );

DROP POLICY IF EXISTS "reward_credits_owner_insert" ON public.reward_credits;
DROP POLICY IF EXISTS "reward_credits_owner_update" ON public.reward_credits;
CREATE POLICY "reward_credits_owner_insert" ON public.reward_credits
  FOR INSERT TO authenticated WITH CHECK (
    public.is_semco_admin()
    OR (
      installer_id = auth.uid()
      AND (project_id IS NULL OR project_id IN (SELECT id FROM public.projects WHERE installer_id = auth.uid()))
      AND status = 'pending'
      AND verified_at IS NULL
    )
  );
CREATE POLICY "reward_credits_owner_update" ON public.reward_credits
  FOR UPDATE TO authenticated
  USING (
    installer_id = auth.uid()
    AND (project_id IS NULL OR project_id IN (SELECT id FROM public.projects WHERE installer_id = auth.uid()))
    AND status = 'pending'
  )
  WITH CHECK (
    installer_id = auth.uid()
    AND (project_id IS NULL OR project_id IN (SELECT id FROM public.projects WHERE installer_id = auth.uid()))
    AND status = 'pending'
  );

DROP POLICY IF EXISTS "project_signoffs_owner_select" ON public.project_signoffs;
DROP POLICY IF EXISTS "project_signoffs_owner_insert" ON public.project_signoffs;
DROP POLICY IF EXISTS "project_signoffs_owner_update" ON public.project_signoffs;
CREATE POLICY "project_signoffs_owner_select" ON public.project_signoffs
  FOR SELECT TO authenticated USING (
    public.is_semco_admin()
    OR (
      installer_id = auth.uid()
      AND project_id IN (SELECT id::text FROM public.projects WHERE installer_id = auth.uid())
    )
  );
CREATE POLICY "project_signoffs_owner_insert" ON public.project_signoffs
  FOR INSERT TO authenticated WITH CHECK (
    public.is_semco_admin()
    OR (
      installer_id = auth.uid()
      AND project_id IN (SELECT id::text FROM public.projects WHERE installer_id = auth.uid())
    )
  );
CREATE POLICY "project_signoffs_owner_update" ON public.project_signoffs
  FOR UPDATE TO authenticated
  USING (
    public.is_semco_admin()
    OR (
      installer_id = auth.uid()
      AND project_id IN (SELECT id::text FROM public.projects WHERE installer_id = auth.uid())
    )
  )
  WITH CHECK (
    public.is_semco_admin()
    OR (
      installer_id = auth.uid()
      AND project_id IN (SELECT id::text FROM public.projects WHERE installer_id = auth.uid())
    )
  );

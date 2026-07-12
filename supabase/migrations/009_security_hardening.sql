-- Security hardening for installer-facing cloud writes.
--
-- 1. project-signoffs bucket becomes private. Signed customer forms contain
--    names, emails, and signatures; they must be served through short-lived
--    signed URLs, not a public CDN URL. The app now stores the storage path
--    in project_signoffs.pdf_url and the portal creates a signed URL on open.
-- 2. Owner INSERT policies previously validated ownership only, letting an
--    installer insert rows already marked verified/approved. Recreate them
--    with status pinned to the unreviewed states and reviewer/verification
--    fields empty. Admin review still happens through the UPDATE policies.
-- 3. installer_profiles: certification_status and assigned_dealer_id are
--    admin decisions. A trigger clamps them for authenticated non-admin
--    writers while leaving service-role/SQL-editor maintenance untouched.

UPDATE storage.buckets
SET public = false
WHERE id = 'project-signoffs';

DROP POLICY IF EXISTS "order_requests_owner_insert" ON order_requests;
CREATE POLICY "order_requests_owner_insert" ON order_requests
  FOR INSERT WITH CHECK (
    is_semco_admin()
    OR (
      project_id IN (SELECT id FROM projects WHERE installer_id = auth.uid())
      AND status IN ('draft', 'in_review')
      AND dealer_submitted_at IS NULL
    )
  );

DROP POLICY IF EXISTS "warranty_reviews_owner_insert" ON warranty_reviews;
CREATE POLICY "warranty_reviews_owner_insert" ON warranty_reviews
  FOR INSERT WITH CHECK (
    is_semco_admin()
    OR (
      installer_id = auth.uid()
      AND status IN ('not_submitted', 'in_review')
      AND reviewer_name IS NULL
      AND reviewer_signature_url IS NULL
      AND warranty_document_url IS NULL
      AND reviewed_at IS NULL
    )
  );

DROP POLICY IF EXISTS "purchase_receipts_owner_insert" ON purchase_receipts;
CREATE POLICY "purchase_receipts_owner_insert" ON purchase_receipts
  FOR INSERT WITH CHECK (
    is_semco_admin()
    OR (
      installer_id = auth.uid()
      AND status = 'pending'
      AND reviewed_at IS NULL
    )
  );

DROP POLICY IF EXISTS "reward_credits_owner_insert" ON reward_credits;
CREATE POLICY "reward_credits_owner_insert" ON reward_credits
  FOR INSERT WITH CHECK (
    is_semco_admin()
    OR (
      installer_id = auth.uid()
      AND status = 'pending'
      AND verified_at IS NULL
    )
  );

CREATE OR REPLACE FUNCTION protect_installer_profile_admin_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- auth.uid() IS NULL covers service-role and SQL-editor maintenance,
  -- which must stay able to set these fields (e.g. migration 008).
  IF auth.uid() IS NULL OR is_semco_admin() THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.certification_status := 'pending';
  ELSE
    NEW.certification_status := OLD.certification_status;
    NEW.assigned_dealer_id := OLD.assigned_dealer_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS installer_profiles_protect_admin_fields ON installer_profiles;
CREATE TRIGGER installer_profiles_protect_admin_fields
  BEFORE INSERT OR UPDATE ON installer_profiles
  FOR EACH ROW EXECUTE FUNCTION protect_installer_profile_admin_fields();

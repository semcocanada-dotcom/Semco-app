-- Keep internal QA and app-review accounts available for release testing while
-- removing them from the dealer dashboard and future CRM assignments.
ALTER TABLE public.installer_profiles
  ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.installer_profiles.is_test IS
  'SEMCO-managed classification for internal QA or app-review profiles; hidden from dealer dashboard workflows.';

-- Installers may edit their own profile, so the test classification must remain
-- controlled by SEMCO administrators and trusted server-side operations.
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
    NEW.is_test := false;
  ELSE
    NEW.certification_status := OLD.certification_status;
    NEW.assigned_dealer_id := OLD.assigned_dealer_id;
    NEW.is_test := OLD.is_test;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.protect_installer_profile_admin_fields() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.protect_installer_profile_admin_fields() TO service_role;

-- Test accounts can continue to sign into the mobile app for release review,
-- but they cannot be assigned new leads, invitations, or awards.
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
      AND NOT profile.is_test
      AND (allow_suspended OR profile.certification_status <> 'suspended')
  );
$$;

REVOKE ALL ON FUNCTION private.installer_belongs_to_dealer(uuid, text, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.installer_belongs_to_dealer(uuid, text, boolean) TO authenticated, service_role;

-- Use stable business identifiers rather than generated user IDs so the
-- migration remains portable across local, preview, and production databases.
UPDATE public.installer_profiles
SET is_test = true
WHERE semco_account_id = 'APP-REVIEW-DEMO'
  AND company_name = 'North Star Finishes (Demo)'
  AND lower(email) = lower('apple-review@semcocanada.ca');

UPDATE public.installer_profiles
SET is_test = true
WHERE company_name = 'SEMCO RELEASE QA - DELETE'
  AND contact_name = 'Release QA'
  AND lower(email) = lower('semcocanada@gmail.com');

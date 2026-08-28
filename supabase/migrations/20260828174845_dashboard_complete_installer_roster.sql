-- Keep the dealer dashboard roster complete from the moment an installer
-- registers, even while the account is waiting for email confirmation.

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;

-- Preserve the dealer routing established at registration even if installer
-- profile provisioning is temporarily unavailable. The first resolved route
-- wins; later user-editable metadata cannot move an account between dealers.
CREATE TABLE IF NOT EXISTS private.installer_registration_routes (
  installer_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  assigned_dealer_id text REFERENCES public.dealer_accounts (id),
  created_at timestamptz NOT NULL DEFAULT pg_catalog.now()
);

REVOKE ALL ON TABLE private.installer_registration_routes
  FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION private.provision_installer_profile_from_auth()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  metadata jsonb := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  company_name_value text;
  contact_name_value text;
  postal_code_value text;
  province_value text;
  company_address_value text;
  resolved_dealer_id text;
BEGIN
  IF NEW.deleted_at IS NOT NULL OR COALESCE(NEW.is_anonymous, false) THEN
    RETURN NEW;
  END IF;

  company_name_value := NULLIF(BTRIM(COALESCE(metadata ->> 'company_name', '')), '');
  contact_name_value := NULLIF(BTRIM(COALESCE(metadata ->> 'contact_name', '')), '');
  postal_code_value := NULLIF(BTRIM(COALESCE(metadata ->> 'postal_code', '')), '');
  province_value := NULLIF(BTRIM(COALESCE(metadata ->> 'province', '')), '');
  company_address_value := NULLIF(BTRIM(COALESCE(metadata ->> 'company_address', '')), '');

  -- Semco Pro installer registration always supplies company and contact name.
  -- Staff-only Auth accounts do not, so they are not turned into installers.
  IF company_name_value IS NULL OR contact_name_value IS NULL THEN
    RETURN NEW;
  END IF;

  BEGIN
    resolved_dealer_id := public.resolve_canadian_dealer_id(
      postal_code_value,
      province_value,
      company_address_value
    );
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING
        'SEMCO installer routing failed for auth user % (SQLSTATE %)',
        NEW.id,
        SQLSTATE;
      RETURN NEW;
  END;

  BEGIN
    INSERT INTO private.installer_registration_routes (
      installer_id,
      assigned_dealer_id,
      created_at
    )
    SELECT
      NEW.id,
      resolved_dealer_id,
      COALESCE(NEW.created_at, pg_catalog.now())
    WHERE resolved_dealer_id IS NOT NULL
    ON CONFLICT (installer_id) DO UPDATE
      SET assigned_dealer_id = EXCLUDED.assigned_dealer_id
      WHERE private.installer_registration_routes.assigned_dealer_id IS NULL
        AND EXCLUDED.assigned_dealer_id IS NOT NULL;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING
        'SEMCO installer route persistence failed for auth user % (SQLSTATE %)',
        NEW.id,
        SQLSTATE;
  END;

  BEGIN
    resolved_dealer_id := COALESCE(
      (
        SELECT route.assigned_dealer_id
        FROM private.installer_registration_routes AS route
        WHERE route.installer_id = NEW.id
      ),
      resolved_dealer_id
    );
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING
        'SEMCO installer route lookup failed for auth user % (SQLSTATE %)',
        NEW.id,
        SQLSTATE;
  END;

  BEGIN
    INSERT INTO public.installer_profiles (
      installer_id,
      company_name,
      contact_name,
      email,
      phone,
      company_address,
      city,
      province,
      postal_code,
      certification_status,
      assigned_dealer_id,
      is_test,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      company_name_value,
      contact_name_value,
      NULLIF(BTRIM(COALESCE(NEW.email, metadata ->> 'email', '')), ''),
      NULLIF(BTRIM(COALESCE(NEW.phone, metadata ->> 'phone', '')), ''),
      company_address_value,
      NULLIF(BTRIM(COALESCE(metadata ->> 'city', '')), ''),
      province_value,
      postal_code_value,
      'pending',
      resolved_dealer_id,
      false,
      COALESCE(NEW.created_at, pg_catalog.now()),
      COALESCE(NEW.created_at, pg_catalog.now())
    )
    ON CONFLICT (installer_id) DO NOTHING;
  EXCEPTION
    WHEN OTHERS THEN
      -- Auth registration must remain available even during a transient profile
      -- sync failure. The route above and national staff RPC still surface the
      -- registration with profile_exists=false for reconciliation.
      RAISE WARNING
        'SEMCO installer provisioning failed for auth user % (SQLSTATE %)',
        NEW.id,
        SQLSTATE;
  END;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.provision_installer_profile_from_auth()
  FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION private.provision_installer_profile_from_auth()
  TO supabase_auth_admin, service_role;

DROP TRIGGER IF EXISTS semco_installer_profile_from_auth ON auth.users;
CREATE TRIGGER semco_installer_profile_from_auth
  AFTER INSERT OR UPDATE OF raw_user_meta_data ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION private.provision_installer_profile_from_auth();

-- Seed immutable registration routes for existing installer accounts. A
-- dealer-controlled profile assignment takes precedence over signup metadata.
INSERT INTO private.installer_registration_routes (
  installer_id,
  assigned_dealer_id,
  created_at
)
SELECT
  auth_user.id,
  COALESCE(
    profile.assigned_dealer_id,
    public.resolve_canadian_dealer_id(
      auth_user.raw_user_meta_data ->> 'postal_code',
      auth_user.raw_user_meta_data ->> 'province',
      auth_user.raw_user_meta_data ->> 'company_address'
    )
  ),
  COALESCE(auth_user.created_at, pg_catalog.now())
FROM auth.users AS auth_user
LEFT JOIN public.installer_profiles AS profile
  ON profile.installer_id = auth_user.id
WHERE auth_user.deleted_at IS NULL
  AND NOT COALESCE(auth_user.is_anonymous, false)
  AND NULLIF(BTRIM(COALESCE(auth_user.raw_user_meta_data ->> 'company_name', '')), '') IS NOT NULL
  AND NULLIF(BTRIM(COALESCE(auth_user.raw_user_meta_data ->> 'contact_name', '')), '') IS NOT NULL
  AND COALESCE(
    profile.assigned_dealer_id,
    public.resolve_canadian_dealer_id(
      auth_user.raw_user_meta_data ->> 'postal_code',
      auth_user.raw_user_meta_data ->> 'province',
      auth_user.raw_user_meta_data ->> 'company_address'
    )
  ) IS NOT NULL
ON CONFLICT (installer_id) DO UPDATE
  SET assigned_dealer_id = EXCLUDED.assigned_dealer_id
  WHERE private.installer_registration_routes.assigned_dealer_id IS NULL
    AND EXCLUDED.assigned_dealer_id IS NOT NULL;

-- Reconcile installer registrations that predate the server-side provisioner.
-- ON CONFLICT intentionally preserves certification, test classification, and
-- dealer-controlled fields on every existing installer profile.
INSERT INTO public.installer_profiles (
  installer_id,
  company_name,
  contact_name,
  email,
  phone,
  company_address,
  city,
  province,
  postal_code,
  certification_status,
  assigned_dealer_id,
  is_test,
  created_at,
  updated_at
)
SELECT
  auth_user.id,
  NULLIF(BTRIM(COALESCE(auth_user.raw_user_meta_data ->> 'company_name', '')), ''),
  NULLIF(BTRIM(COALESCE(auth_user.raw_user_meta_data ->> 'contact_name', '')), ''),
  NULLIF(BTRIM(COALESCE(auth_user.email, auth_user.raw_user_meta_data ->> 'email', '')), ''),
  NULLIF(BTRIM(COALESCE(auth_user.phone, auth_user.raw_user_meta_data ->> 'phone', '')), ''),
  NULLIF(BTRIM(COALESCE(auth_user.raw_user_meta_data ->> 'company_address', '')), ''),
  NULLIF(BTRIM(COALESCE(auth_user.raw_user_meta_data ->> 'city', '')), ''),
  NULLIF(BTRIM(COALESCE(auth_user.raw_user_meta_data ->> 'province', '')), ''),
  NULLIF(BTRIM(COALESCE(auth_user.raw_user_meta_data ->> 'postal_code', '')), ''),
  'pending',
  public.resolve_canadian_dealer_id(
    auth_user.raw_user_meta_data ->> 'postal_code',
    auth_user.raw_user_meta_data ->> 'province',
    auth_user.raw_user_meta_data ->> 'company_address'
  ),
  false,
  COALESCE(auth_user.created_at, pg_catalog.now()),
  COALESCE(auth_user.created_at, pg_catalog.now())
FROM auth.users AS auth_user
WHERE auth_user.deleted_at IS NULL
  AND NOT COALESCE(auth_user.is_anonymous, false)
  AND NULLIF(BTRIM(COALESCE(auth_user.raw_user_meta_data ->> 'company_name', '')), '') IS NOT NULL
  AND NULLIF(BTRIM(COALESCE(auth_user.raw_user_meta_data ->> 'contact_name', '')), '') IS NOT NULL
ON CONFLICT (installer_id) DO NOTHING;

-- Auth user data is not exposed by Supabase's Data API. This narrowly scoped
-- staff RPC returns only the account-state fields the dealer dashboard needs.
CREATE OR REPLACE FUNCTION public.list_dashboard_installer_registrations()
RETURNS TABLE (
  installer_id uuid,
  company_name text,
  contact_name text,
  email text,
  phone text,
  city text,
  province text,
  postal_code text,
  certification_status text,
  assigned_dealer_id text,
  is_test boolean,
  created_at timestamptz,
  updated_at timestamptz,
  auth_created_at timestamptz,
  email_confirmed_at timestamptz,
  last_sign_in_at timestamptz,
  profile_exists boolean,
  is_staff boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
DECLARE
  caller_role text;
  caller_dealer_id text;
BEGIN
  SELECT admin.role, admin.dealer_id
  INTO caller_role, caller_dealer_id
  FROM public.admin_profiles AS admin
  WHERE admin.user_id = (SELECT auth.uid())
  LIMIT 1;

  IF caller_role IS NULL OR caller_role NOT IN ('semco_admin', 'dealer_admin') THEN
    RAISE EXCEPTION 'SEMCO dashboard staff access is required'
      USING ERRCODE = '42501';
  END IF;

  IF caller_role = 'dealer_admin' AND caller_dealer_id IS NULL THEN
    RAISE EXCEPTION 'Dealer assignment is required'
      USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    auth_user.id,
    COALESCE(
      NULLIF(BTRIM(profile.company_name), ''),
      NULLIF(BTRIM(COALESCE(auth_user.raw_user_meta_data ->> 'company_name', '')), '')
    ),
    COALESCE(
      NULLIF(BTRIM(profile.contact_name), ''),
      NULLIF(BTRIM(COALESCE(auth_user.raw_user_meta_data ->> 'contact_name', '')), '')
    ),
    COALESCE(NULLIF(BTRIM(auth_user.email), ''), NULLIF(BTRIM(profile.email), '')),
    COALESCE(
      NULLIF(BTRIM(profile.phone), ''),
      NULLIF(BTRIM(auth_user.phone), ''),
      NULLIF(BTRIM(COALESCE(auth_user.raw_user_meta_data ->> 'phone', '')), '')
    ),
    COALESCE(
      NULLIF(BTRIM(profile.city), ''),
      NULLIF(BTRIM(COALESCE(auth_user.raw_user_meta_data ->> 'city', '')), '')
    ),
    COALESCE(
      NULLIF(BTRIM(profile.province), ''),
      NULLIF(BTRIM(COALESCE(auth_user.raw_user_meta_data ->> 'province', '')), '')
    ),
    COALESCE(
      NULLIF(BTRIM(profile.postal_code), ''),
      NULLIF(BTRIM(COALESCE(auth_user.raw_user_meta_data ->> 'postal_code', '')), '')
    ),
    COALESCE(profile.certification_status, 'pending'),
    COALESCE(
      profile.assigned_dealer_id,
      registration_route.assigned_dealer_id
    ),
    COALESCE(profile.is_test, false),
    COALESCE(profile.created_at, auth_user.created_at),
    -- Keep profile activity truthful: Auth sign-ins can update auth.users, but
    -- they are not installer profile edits. Missing profiles fall back to the
    -- Auth timestamp only for deterministic roster ordering.
    COALESCE(profile.updated_at, auth_user.updated_at),
    auth_user.created_at,
    auth_user.email_confirmed_at,
    auth_user.last_sign_in_at,
    profile.installer_id IS NOT NULL,
    staff.user_id IS NOT NULL
  FROM auth.users AS auth_user
  LEFT JOIN public.installer_profiles AS profile
    ON profile.installer_id = auth_user.id
  LEFT JOIN private.installer_registration_routes AS registration_route
    ON registration_route.installer_id = auth_user.id
  LEFT JOIN public.admin_profiles AS staff
    ON staff.user_id = auth_user.id
  WHERE auth_user.deleted_at IS NULL
    AND NOT COALESCE(auth_user.is_anonymous, false)
    AND (
      profile.installer_id IS NOT NULL
      OR (
        NULLIF(BTRIM(COALESCE(auth_user.raw_user_meta_data ->> 'company_name', '')), '') IS NOT NULL
        AND NULLIF(BTRIM(COALESCE(auth_user.raw_user_meta_data ->> 'contact_name', '')), '') IS NOT NULL
      )
    )
    -- Test rows are used only as opaque classifications by the client when it
    -- removes linked QA projects and activity; profile PII never leaves this RPC.
    AND NOT COALESCE(profile.is_test, false)
    AND (
      caller_role = 'semco_admin'
      -- Dealer scope uses only server-persisted routing. Signup metadata is
      -- user-editable and therefore never acts as the authorization boundary.
      OR COALESCE(
        profile.assigned_dealer_id,
        registration_route.assigned_dealer_id
      ) = caller_dealer_id
    );
END;
$$;

COMMENT ON FUNCTION public.list_dashboard_installer_registrations() IS
  'Authorized staff roster including installer signup, confirmation, and latest sign-in state.';

REVOKE ALL ON FUNCTION public.list_dashboard_installer_registrations()
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.list_dashboard_installer_registrations()
  TO authenticated;

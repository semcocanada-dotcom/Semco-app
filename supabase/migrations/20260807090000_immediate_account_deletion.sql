-- Account deletion uses a short lease. While the lease is active, Storage RLS
-- blocks both installers and administrators from creating or changing objects
-- below that installer's prefix. The service role still removes those objects.
CREATE TABLE IF NOT EXISTS public.account_deletion_locks (
  installer_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  lock_token uuid NOT NULL,
  locked_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  CONSTRAINT account_deletion_locks_expiry_check CHECK (expires_at > locked_at)
);

ALTER TABLE public.account_deletion_locks ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.account_deletion_locks FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.account_deletion_locks TO service_role;

-- Acquire a new lease, refresh an idempotent request using the same token, or
-- atomically take over a stale lease. A live lease owned by another invocation
-- is left untouched and returns acquired=false.
CREATE OR REPLACE FUNCTION public.acquire_account_deletion_lock(
  p_installer_id uuid,
  p_lock_token uuid,
  p_lease_seconds integer DEFAULT 600
)
RETURNS TABLE(acquired boolean, lock_expires_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
DECLARE
  v_now timestamptz := clock_timestamp();
  v_expires_at timestamptz;
BEGIN
  IF p_installer_id IS NULL OR p_lock_token IS NULL THEN
    RAISE EXCEPTION 'installer id and lock token are required' USING ERRCODE = '22004';
  END IF;
  IF p_lease_seconds < 60 OR p_lease_seconds > 1800 THEN
    RAISE EXCEPTION 'lease must be between 60 and 1800 seconds' USING ERRCODE = '22023';
  END IF;

  v_expires_at := v_now + make_interval(secs => p_lease_seconds);

  INSERT INTO public.account_deletion_locks AS deletion_lock (
    installer_id,
    lock_token,
    locked_at,
    expires_at
  )
  VALUES (p_installer_id, p_lock_token, v_now, v_expires_at)
  ON CONFLICT (installer_id) DO UPDATE
    SET lock_token = EXCLUDED.lock_token,
        locked_at = EXCLUDED.locked_at,
        expires_at = EXCLUDED.expires_at
    WHERE deletion_lock.expires_at <= v_now
       OR deletion_lock.lock_token = EXCLUDED.lock_token
  RETURNING deletion_lock.expires_at INTO v_expires_at;

  IF FOUND THEN
    RETURN QUERY SELECT true, v_expires_at;
    RETURN;
  END IF;

  SELECT deletion_lock.expires_at
    INTO v_expires_at
  FROM public.account_deletion_locks AS deletion_lock
  WHERE deletion_lock.installer_id = p_installer_id;

  RETURN QUERY SELECT false, v_expires_at;
END;
$$;

CREATE OR REPLACE FUNCTION public.refresh_account_deletion_lock(
  p_installer_id uuid,
  p_lock_token uuid,
  p_lease_seconds integer DEFAULT 600
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
DECLARE
  v_now timestamptz := clock_timestamp();
BEGIN
  IF p_lease_seconds < 60 OR p_lease_seconds > 1800 THEN
    RAISE EXCEPTION 'lease must be between 60 and 1800 seconds' USING ERRCODE = '22023';
  END IF;

  UPDATE public.account_deletion_locks
  SET locked_at = v_now,
      expires_at = v_now + make_interval(secs => p_lease_seconds)
  WHERE installer_id = p_installer_id
    AND lock_token = p_lock_token
    AND expires_at > v_now;

  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.release_account_deletion_lock(
  p_installer_id uuid,
  p_lock_token uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
BEGIN
  DELETE FROM public.account_deletion_locks
  WHERE installer_id = p_installer_id
    AND lock_token = p_lock_token;

  RETURN FOUND;
END;
$$;

-- Storage policies call this small SECURITY DEFINER predicate rather than
-- granting authenticated clients direct access to the lock table.
CREATE OR REPLACE FUNCTION public.is_installer_deletion_locked(p_installer_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.account_deletion_locks AS deletion_lock
    WHERE deletion_lock.installer_id::text = p_installer_id
      AND deletion_lock.expires_at > statement_timestamp()
  );
$$;

REVOKE ALL ON FUNCTION public.acquire_account_deletion_lock(uuid, uuid, integer)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.refresh_account_deletion_lock(uuid, uuid, integer)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.release_account_deletion_lock(uuid, uuid)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.acquire_account_deletion_lock(uuid, uuid, integer)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.refresh_account_deletion_lock(uuid, uuid, integer)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.release_account_deletion_lock(uuid, uuid)
  TO service_role;

REVOKE ALL ON FUNCTION public.is_installer_deletion_locked(text)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_installer_deletion_locked(text)
  TO authenticated, service_role;

-- Replace the two write policies from the contractor-cloud release. Their
-- ownership/admin checks remain intact, with the active deletion lease added
-- as a mandatory condition for both the old and new object names.
DROP POLICY IF EXISTS "installer_private_files_insert" ON storage.objects;
CREATE POLICY "installer_private_files_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id IN ('project-photos','project-signoffs','purchase-receipts','color-samples','warranty-documents')
    AND NOT public.is_installer_deletion_locked((storage.foldername(name))[1])
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.is_semco_admin()
    )
  );

DROP POLICY IF EXISTS "installer_private_files_update" ON storage.objects;
CREATE POLICY "installer_private_files_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id IN ('project-photos','project-signoffs','purchase-receipts','color-samples','warranty-documents')
    AND NOT public.is_installer_deletion_locked((storage.foldername(name))[1])
    AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_semco_admin())
  )
  WITH CHECK (
    bucket_id IN ('project-photos','project-signoffs','purchase-receipts','color-samples','warranty-documents')
    AND NOT public.is_installer_deletion_locked((storage.foldername(name))[1])
    AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_semco_admin())
  );

-- Permanently remove all application data owned by one installer. This helper
-- requires the caller's live lock token and is callable only by service_role.
DROP FUNCTION IF EXISTS public.delete_installer_account_data(uuid);
CREATE OR REPLACE FUNCTION public.delete_installer_account_data(
  p_target_user_id uuid,
  p_lock_token uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.account_deletion_locks AS deletion_lock
    WHERE deletion_lock.installer_id = p_target_user_id
      AND deletion_lock.lock_token = p_lock_token
      AND deletion_lock.expires_at > clock_timestamp()
  ) THEN
    RAISE EXCEPTION 'a live account deletion lock is required' USING ERRCODE = '55000';
  END IF;

  -- Remove project children before their parents. Some early schema foreign
  -- keys did not use ON DELETE CASCADE, so the explicit order is required.
  DELETE FROM public.project_signoffs
  WHERE installer_id = p_target_user_id;

  DELETE FROM public.order_requests
  WHERE project_id IN (
    SELECT id FROM public.projects WHERE installer_id = p_target_user_id
  );

  DELETE FROM public.batch_logs
  WHERE project_id IN (
    SELECT id FROM public.projects WHERE installer_id = p_target_user_id
  );

  DELETE FROM public.project_photos
  WHERE installer_id = p_target_user_id
     OR project_id IN (
       SELECT id FROM public.projects WHERE installer_id = p_target_user_id
     );

  DELETE FROM public.warranty_reviews
  WHERE installer_id = p_target_user_id
     OR project_id IN (
       SELECT id FROM public.projects WHERE installer_id = p_target_user_id
     );

  DELETE FROM public.purchase_receipts
  WHERE installer_id = p_target_user_id;

  DELETE FROM public.reward_credits
  WHERE installer_id = p_target_user_id;

  DELETE FROM public.calculations
  WHERE installer_id = p_target_user_id
     OR project_id IN (
       SELECT id FROM public.projects WHERE installer_id = p_target_user_id
     );

  DELETE FROM public.conversations
  WHERE installer_id = p_target_user_id;

  DELETE FROM public.user_progress
  WHERE installer_id = p_target_user_id;

  DELETE FROM public.projects
  WHERE installer_id = p_target_user_id;

  DELETE FROM public.colors
  WHERE installer_id = p_target_user_id;

  DELETE FROM public.installer_profiles
  WHERE installer_id = p_target_user_id;

  DELETE FROM public.account_deletion_requests
  WHERE installer_id = p_target_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_installer_account_data(uuid, uuid)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_installer_account_data(uuid, uuid)
  TO service_role;

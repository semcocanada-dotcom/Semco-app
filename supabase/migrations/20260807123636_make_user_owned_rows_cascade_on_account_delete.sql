-- Make account deletion safe, complete, and race-resistant.

-- These rows already belong to a child that cascades from auth.users, but the
-- direct logged_by relationships should also describe the intended deletion
-- behavior explicitly so they cannot block an Auth user deletion.
ALTER TABLE public.expenses
  DROP CONSTRAINT IF EXISTS expenses_logged_by_fkey;
ALTER TABLE public.expenses
  ADD CONSTRAINT expenses_logged_by_fkey
  FOREIGN KEY (logged_by) REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_expenses_logged_by ON public.expenses(logged_by);

ALTER TABLE public.respite_sessions
  DROP CONSTRAINT IF EXISTS respite_sessions_logged_by_fkey;
ALTER TABLE public.respite_sessions
  ADD CONSTRAINT respite_sessions_logged_by_fkey
  FOREIGN KEY (logged_by) REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_respite_sessions_logged_by
  ON public.respite_sessions(logged_by);

-- The Edge Function writes this short-lived lock before removing receipt
-- objects. It prevents another signed-in device from uploading during the
-- cleanup window. The lock disappears automatically with the Auth user.
CREATE TABLE public.account_deletion_locks (
  user_id      UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  lock_token   UUID NOT NULL,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.account_deletion_locks ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.account_deletion_locks FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.account_deletion_locks TO service_role;

-- Keep the policy helper outside the exposed public schema. It reveals no
-- cross-user state: callers can only ask whether their own receipt access is
-- currently allowed.
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE OR REPLACE FUNCTION private.account_allows_receipt_access()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    (SELECT auth.uid()) IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.profiles AS profile
      WHERE profile.id = (SELECT auth.uid())
    )
    AND NOT EXISTS (
      SELECT 1
      FROM public.account_deletion_locks AS deletion_lock
      WHERE deletion_lock.user_id = (SELECT auth.uid())
        AND deletion_lock.requested_at > NOW() - INTERVAL '15 minutes'
    );
$$;

REVOKE EXECUTE ON FUNCTION private.account_allows_receipt_access() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.account_allows_receipt_access() TO authenticated;

DROP POLICY IF EXISTS "receipts: own files" ON storage.objects;
CREATE POLICY "receipts: own files" ON storage.objects
  FOR ALL
  TO authenticated
  USING (
    bucket_id = 'receipts'
    AND (SELECT auth.uid())::text = (storage.foldername(name))[1]
    AND private.account_allows_receipt_access()
  )
  WITH CHECK (
    bucket_id = 'receipts'
    AND (SELECT auth.uid())::text = (storage.foldername(name))[1]
    AND private.account_allows_receipt_access()
  );

-- Route the last dealer profile policy through the private authorization
-- helpers introduced for the Dealer Dashboard, then remove direct API access
-- to the legacy public helper functions.

DROP POLICY IF EXISTS "dealer_profiles_assigned_select"
  ON public.installer_profiles;

CREATE POLICY "dealer_profiles_assigned_select"
  ON public.installer_profiles
  FOR SELECT
  TO authenticated
  USING (
    (SELECT private.is_semco_admin())
    OR assigned_dealer_id = (SELECT private.current_dealer_id())
  );

REVOKE ALL ON FUNCTION public.current_dealer_id()
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_dealer_admin()
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.dealer_can_access_installer(text)
  FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.current_dealer_id() TO service_role;
GRANT EXECUTE ON FUNCTION public.is_dealer_admin() TO service_role;
GRANT EXECUTE ON FUNCTION public.dealer_can_access_installer(text) TO service_role;

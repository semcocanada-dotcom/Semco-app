-- The original database was created with broad anon grants. RLS prevented row
-- reads, but the tables were still discoverable through the public Data API.
REVOKE ALL PRIVILEGES ON TABLE
  public.account_deletion_requests,
  public.admin_profiles,
  public.batch_logs,
  public.calculations,
  public.colors,
  public.conversations,
  public.dealer_accounts,
  public.installer_profiles,
  public.order_requests,
  public.product_embeddings,
  public.products,
  public.project_photos,
  public.project_signoffs,
  public.projects,
  public.purchase_receipts,
  public.reward_credits,
  public.user_progress,
  public.warranty_reviews
FROM anon;

-- These functions use unqualified public table names. Pin the search path so a
-- caller cannot redirect those references to another schema.
ALTER FUNCTION public.match_product_embeddings(vector, double precision, integer)
  SET search_path = public;
ALTER FUNCTION public.update_updated_at()
  SET search_path = public;
ALTER FUNCTION public.upsert_user_progress(uuid, text, integer)
  SET search_path = public;

-- Only signed-in users need the search/progress RPCs. Trigger functions should
-- never be directly callable through the API.
REVOKE ALL ON FUNCTION public.match_product_embeddings(vector, double precision, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.match_product_embeddings(vector, double precision, integer) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.upsert_user_progress(uuid, text, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.upsert_user_progress(uuid, text, integer) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.current_dealer_id() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_dealer_id() TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.is_dealer_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_dealer_admin() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.protect_installer_profile_admin_fields() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.protect_installer_review_fields() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.protect_project_admin_fields() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.protect_installer_profile_admin_fields() TO service_role;
GRANT EXECUTE ON FUNCTION public.protect_installer_review_fields() TO service_role;
GRANT EXECUTE ON FUNCTION public.protect_project_admin_fields() TO service_role;

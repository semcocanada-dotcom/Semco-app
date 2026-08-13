-- The routing resolver is an internal implementation detail used by the
-- installer-profile trigger and maintenance migrations. Keep it unavailable
-- to client roles; the SECURITY DEFINER trigger can invoke it as its owner.
REVOKE ALL ON FUNCTION public.resolve_canadian_dealer_id(text, text, text)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.resolve_canadian_dealer_id(text, text, text)
TO service_role;

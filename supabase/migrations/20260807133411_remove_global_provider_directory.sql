BEGIN;

-- Remove the former shared directory. User-created provider records always
-- have an owner and remain intact.
DELETE FROM public.providers
WHERE parent_id IS NULL;

UPDATE public.providers
SET is_approved_sk = FALSE,
    lat = NULL,
    lng = NULL;

ALTER TABLE public.providers
  ALTER COLUMN parent_id SET NOT NULL,
  ALTER COLUMN is_approved_sk SET DEFAULT FALSE;

-- The automatic mapping feature has been removed. Clear addresses previously
-- stored only for that feature; users enter mileage distance manually.
UPDATE public.profiles
SET home_address = NULL,
    home_city = NULL,
    home_postal_code = NULL
WHERE home_address IS NOT NULL
   OR home_city IS NOT NULL
   OR home_postal_code IS NOT NULL;

DROP POLICY IF EXISTS "providers: read global or own" ON public.providers;
DROP POLICY IF EXISTS "providers: read own" ON public.providers;

CREATE POLICY "providers: read own"
  ON public.providers
  FOR SELECT
  TO authenticated
  USING (parent_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "providers: insert own" ON public.providers;
DROP POLICY IF EXISTS "providers: update own" ON public.providers;
DROP POLICY IF EXISTS "providers: delete own" ON public.providers;

CREATE POLICY "providers: insert own"
  ON public.providers
  FOR INSERT
  TO authenticated
  WITH CHECK (parent_id = (SELECT auth.uid()));

CREATE POLICY "providers: update own"
  ON public.providers
  FOR UPDATE
  TO authenticated
  USING (parent_id = (SELECT auth.uid()))
  WITH CHECK (parent_id = (SELECT auth.uid()));

CREATE POLICY "providers: delete own"
  ON public.providers
  FOR DELETE
  TO authenticated
  USING (parent_id = (SELECT auth.uid()));

COMMIT;

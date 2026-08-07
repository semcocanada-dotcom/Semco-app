-- Do not silently assign a generic grant value. The app records the amount
-- actually approved for the child's funding year.
ALTER TABLE public.funding_years
  ALTER COLUMN total_budget DROP DEFAULT;

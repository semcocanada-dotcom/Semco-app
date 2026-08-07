ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS customer_data_consent_version TEXT,
  ADD COLUMN IF NOT EXISTS customer_data_consent_accepted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS customer_data_consent_notice TEXT;

COMMENT ON COLUMN public.projects.customer_data_consent_version IS
  'Version of the customer-data permission/authority notice confirmed before project details were first stored.';
COMMENT ON COLUMN public.projects.customer_data_consent_accepted_at IS
  'Timestamp when the installer confirmed permission or other legal authority to store the customer project data.';
COMMENT ON COLUMN public.projects.customer_data_consent_notice IS
  'Full customer-data notice displayed when the project-level permission/authority confirmation was recorded.';

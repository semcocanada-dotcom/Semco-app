ALTER TABLE public.children
  ADD COLUMN IF NOT EXISTS data_consent_version TEXT,
  ADD COLUMN IF NOT EXISTS data_consent_accepted_at TIMESTAMPTZ;

ALTER TABLE public.respite_workers
  ADD COLUMN IF NOT EXISTS data_consent_version TEXT,
  ADD COLUMN IF NOT EXISTS data_consent_accepted_at TIMESTAMPTZ;

ALTER TABLE public.respite_sessions
  ADD COLUMN IF NOT EXISTS data_consent_version TEXT,
  ADD COLUMN IF NOT EXISTS data_consent_accepted_at TIMESTAMPTZ;

COMMENT ON COLUMN public.children.data_consent_version IS
  'Version of the parent/guardian or authorized-person attestation accepted before the child record was first stored.';
COMMENT ON COLUMN public.children.data_consent_accepted_at IS
  'Timestamp when the account holder accepted the child-data attestation.';
COMMENT ON COLUMN public.respite_workers.data_consent_version IS
  'Version of the third-party data permission acknowledgement accepted before worker details were stored.';
COMMENT ON COLUMN public.respite_workers.data_consent_accepted_at IS
  'Timestamp when the account holder confirmed permission to store this worker''s details.';
COMMENT ON COLUMN public.respite_sessions.data_consent_version IS
  'Version of the third-party data permission acknowledgement accepted before session details were stored.';
COMMENT ON COLUMN public.respite_sessions.data_consent_accepted_at IS
  'Timestamp when the account holder confirmed permission to store the named respite provider''s session details.';

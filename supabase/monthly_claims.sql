-- Monthly Claims table
-- Stores a record for each month's claim after it has been submitted to the government.
-- "Ready" claims are computed dynamically from the expenses table; only submitted ones are persisted here.

CREATE TABLE IF NOT EXISTS monthly_claims (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id          UUID        NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  funding_year_id   UUID        NOT NULL REFERENCES funding_years(id) ON DELETE CASCADE,
  month             TEXT        NOT NULL,                         -- 'YYYY-MM'
  status            TEXT        NOT NULL DEFAULT 'submitted'
                                CHECK (status = 'submitted'),
  submitted_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  total_amount      NUMERIC(10,2) NOT NULL DEFAULT 0,
  expense_ids       UUID[]      NOT NULL DEFAULT '{}',
  mileage_ids       UUID[]      NOT NULL DEFAULT '{}',
  expense_count     INT         NOT NULL DEFAULT 0,
  resend_message_id TEXT,
  batch_number      TEXT,                                -- e.g. "Exp Batch #000123" from SK portal
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (child_id, month)
);

-- Index for fast lookup by child
CREATE INDEX IF NOT EXISTS idx_monthly_claims_child ON monthly_claims (child_id, month DESC);

-- Row-level security
ALTER TABLE monthly_claims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "parent_owns_claims" ON monthly_claims;
CREATE POLICY "parent_owns_claims" ON monthly_claims
  FOR ALL
  USING  (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()))
  WITH CHECK (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

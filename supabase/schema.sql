-- ============================================================
-- Semco App — Supabase Schema
-- Saskatchewan Individualized Autism Funding Grant Tracker
-- Child-centric model: each child has their own $8,000/yr grant
--
-- This file is the single source of truth. Running it provisions a
-- complete database. The supabase/add_*.sql and monthly_claims.sql
-- files are the historical incremental migrations (already applied
-- to the live project) and are kept for reference only.
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE provider_category AS ENUM (
  'aba_ibi',
  'speech_language',
  'occupational_therapy',
  'physical_therapy',
  'psychology',
  'respite',
  'swimming',
  'social_skills',
  'music_therapy',
  'art_therapy',
  'assistive_technology',
  'other'
);

CREATE TYPE expense_status AS ENUM (
  'pending',
  'submitted',
  'approved',
  'rejected'
);

-- ============================================================
-- PROFILES
-- ============================================================

CREATE TABLE profiles (
  id                UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name         TEXT NOT NULL DEFAULT '',
  avatar_url        TEXT,
  home_address      TEXT,
  home_city         TEXT,
  home_postal_code  TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: own row" ON profiles
  FOR ALL USING (id = auth.uid());

-- Auto-create profile on sign-up. SECURITY DEFINER so the trigger can
-- insert into profiles, but EXECUTE is revoked from API roles so it can
-- never be invoked directly via PostgREST RPC.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION handle_new_user() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- CHILDREN
-- ============================================================

CREATE TABLE children (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  date_of_birth     DATE,
  health_card_number TEXT,
  diagnosis_date    DATE,
  diagnosis_notes   TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_children_parent ON children(parent_id);

ALTER TABLE children ENABLE ROW LEVEL SECURITY;

CREATE POLICY "children: own records" ON children
  FOR ALL USING (parent_id = auth.uid());

-- ============================================================
-- FUNDING YEARS
-- Each child gets their own $8,000 grant per year
-- ============================================================

CREATE TABLE funding_years (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id     UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  label        TEXT NOT NULL,                     -- e.g. "2024–2025"
  total_budget NUMERIC(10,2) NOT NULL DEFAULT 8000.00,
  start_date   DATE NOT NULL,
  end_date     DATE NOT NULL,
  is_active    BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_funding_years_child ON funding_years(child_id);
CREATE INDEX idx_funding_years_active ON funding_years(child_id, is_active) WHERE is_active = true;

ALTER TABLE funding_years ENABLE ROW LEVEL SECURITY;

CREATE POLICY "funding_years: own children" ON funding_years
  FOR ALL USING (
    child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
  );

-- ============================================================
-- PROVIDERS
-- Global pre-seeded rows have parent_id = NULL (visible to all)
-- Custom parent rows have parent_id = auth.uid()
-- ============================================================

CREATE TABLE providers (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           TEXT NOT NULL,
  organization   TEXT,
  category       provider_category NOT NULL,
  phone          TEXT,
  email          TEXT,
  website        TEXT,
  address        TEXT,
  city           TEXT NOT NULL DEFAULT '',
  province       TEXT NOT NULL DEFAULT 'SK',
  postal_code    TEXT,
  notes          TEXT,
  is_approved_sk BOOLEAN NOT NULL DEFAULT true,
  parent_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE,  -- NULL = global seed
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  lat            DOUBLE PRECISION,  -- geocoded from address (server-side)
  lng            DOUBLE PRECISION
);

CREATE INDEX idx_providers_category ON providers(category, is_approved_sk);
CREATE INDEX idx_providers_parent ON providers(parent_id);

ALTER TABLE providers ENABLE ROW LEVEL SECURITY;

-- Global directory rows (parent_id IS NULL) are read-only to clients;
-- only the service role may seed/modify them. Custom rows belong to the
-- creating parent for all operations.
CREATE POLICY "providers: read global or own" ON providers
  FOR SELECT USING (parent_id IS NULL OR parent_id = auth.uid());

CREATE POLICY "providers: insert own" ON providers
  FOR INSERT WITH CHECK (parent_id = auth.uid());

CREATE POLICY "providers: update own" ON providers
  FOR UPDATE USING (parent_id = auth.uid())
             WITH CHECK (parent_id = auth.uid());

CREATE POLICY "providers: delete own" ON providers
  FOR DELETE USING (parent_id = auth.uid());

-- ============================================================
-- EXPENSES
-- ============================================================

CREATE TABLE expenses (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id        UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  funding_year_id UUID NOT NULL REFERENCES funding_years(id) ON DELETE CASCADE,
  provider_id     UUID REFERENCES providers(id) ON DELETE SET NULL,
  category        provider_category NOT NULL,
  amount          NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  description     TEXT,
  expense_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  status          expense_status NOT NULL DEFAULT 'pending',
  receipt_urls    TEXT[] NOT NULL DEFAULT '{}',
  logged_by       UUID NOT NULL REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_expenses_child_year ON expenses(child_id, funding_year_id);
CREATE INDEX idx_expenses_child_date ON expenses(child_id, expense_date DESC);
CREATE INDEX idx_expenses_status ON expenses(child_id, status);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "expenses: own children" ON expenses
  FOR ALL USING (
    child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
  );

-- ============================================================
-- MILEAGE LOGS
-- reimbursement_amount is a stored generated column
-- Preserves historical rate accuracy across rate changes
-- ============================================================

CREATE TABLE mileage_logs (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id              UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  funding_year_id       UUID NOT NULL REFERENCES funding_years(id) ON DELETE CASCADE,
  description           TEXT,
  distance_km           NUMERIC(8,2) NOT NULL CHECK (distance_km > 0),
  rate_per_km           NUMERIC(6,4) NOT NULL DEFAULT 0.5500,
  reimbursement_amount  NUMERIC(10,2) GENERATED ALWAYS AS (ROUND(distance_km * rate_per_km, 2)) STORED,
  trip_date             DATE NOT NULL DEFAULT CURRENT_DATE,
  is_round_trip         BOOLEAN NOT NULL DEFAULT false,
  expense_id            UUID REFERENCES expenses(id) ON DELETE CASCADE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mileage_child_year ON mileage_logs(child_id, funding_year_id);
CREATE INDEX idx_mileage_child_date ON mileage_logs(child_id, trip_date DESC);
CREATE INDEX idx_mileage_expense ON mileage_logs(expense_id);

ALTER TABLE mileage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mileage_logs: own children" ON mileage_logs
  FOR ALL USING (
    child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
  );

-- ============================================================
-- RESPITE WORKERS (parent-level, reusable across months/children)

CREATE TABLE respite_workers (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name                  TEXT NOT NULL,
  phone                 TEXT,
  default_rate_per_hour NUMERIC(10,2),
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_respite_workers_parent ON respite_workers(parent_id);

ALTER TABLE respite_workers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "respite_workers: own" ON respite_workers
  FOR ALL USING (parent_id = auth.uid());

-- ============================================================
-- RESPITE SESSIONS

CREATE TABLE respite_sessions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id        UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  funding_year_id UUID NOT NULL REFERENCES funding_years(id) ON DELETE CASCADE,
  session_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  provider_name   TEXT NOT NULL,
  provider_phone  TEXT,
  hours           NUMERIC(5,2),
  rate_per_hour   NUMERIC(10,2),
  amount_paid     NUMERIC(10,2) NOT NULL CHECK (amount_paid >= 0),
  notes           TEXT,
  worker_id       UUID REFERENCES respite_workers(id) ON DELETE SET NULL,
  logged_by       UUID NOT NULL REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_respite_child_year ON respite_sessions(child_id, funding_year_id);
CREATE INDEX idx_respite_child_date ON respite_sessions(child_id, session_date DESC);

ALTER TABLE respite_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "respite: own children" ON respite_sessions
  FOR ALL USING (
    child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
  );

-- ============================================================
-- APPOINTMENTS
-- calendar_event_id stores the device calendar event ID
-- for expo-calendar update/delete sync
-- ============================================================

CREATE TABLE appointments (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id         UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  provider_id      UUID REFERENCES providers(id) ON DELETE SET NULL,
  title            TEXT NOT NULL,
  scheduled_at     TIMESTAMPTZ NOT NULL,
  notes            TEXT,
  calendar_event_id TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_appointments_child ON appointments(child_id, scheduled_at DESC);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "appointments: own children" ON appointments
  FOR ALL USING (
    child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
  );

-- ============================================================
-- MONTHLY CLAIMS
-- One persisted row per month after submission to the SK portal.
-- "Ready" claims are computed dynamically from expenses; only
-- submitted ones are stored here.
-- ============================================================

CREATE TABLE monthly_claims (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id          UUID        NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  funding_year_id   UUID        NOT NULL REFERENCES funding_years(id) ON DELETE CASCADE,
  month             TEXT        NOT NULL,                         -- 'YYYY-MM'
  status            TEXT        NOT NULL DEFAULT 'submitted'
                                CHECK (status = 'submitted'),
  submitted_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_amount      NUMERIC(10,2) NOT NULL DEFAULT 0,
  expense_ids       UUID[]      NOT NULL DEFAULT '{}',
  mileage_ids       UUID[]      NOT NULL DEFAULT '{}',
  expense_count     INT         NOT NULL DEFAULT 0,
  resend_message_id TEXT,
  batch_number      TEXT,                                -- e.g. "Exp Batch #000123" from SK portal
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (child_id, month)
);

CREATE INDEX idx_monthly_claims_child ON monthly_claims(child_id, month DESC);

ALTER TABLE monthly_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "monthly_claims: own children" ON monthly_claims
  FOR ALL
  USING  (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()))
  WITH CHECK (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

-- ============================================================
-- STORAGE BUCKET — receipts (contains medical/PII documents)
-- Receipt path: {auth.uid()}/{child_id}/{expense_id}/{filename}
-- MUST stay private (public=false). Clients read via short-lived
-- signed URLs only — never getPublicUrl.
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Each user may only touch objects under their own {auth.uid()}/ prefix.
CREATE POLICY "receipts: own files" ON storage.objects
  FOR ALL USING (
    bucket_id = 'receipts'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'receipts'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- UPDATED_AT TRIGGER HELPER
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_children_updated_at
  BEFORE UPDATE ON children
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

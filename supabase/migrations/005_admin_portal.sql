-- Semco Admin Portal foundation
-- Adds the cloud tables and RLS shape needed for installer accounts,
-- warranty review, material requests, receipt verification, and rewards.

CREATE TABLE IF NOT EXISTS admin_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('semco_admin','dealer_admin')),
  dealer_id text,
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION is_semco_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM admin_profiles
    WHERE user_id = auth.uid()
      AND role = 'semco_admin'
  );
$$;

CREATE TABLE IF NOT EXISTS dealer_accounts (
  id text PRIMARY KEY,
  name text NOT NULL,
  region text NOT NULL CHECK (region IN ('east','west','unknown')),
  contact_email text,
  contact_phone text,
  pricing_label text,
  accepts_app_orders boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO dealer_accounts (id, name, region, pricing_label, accepts_app_orders)
VALUES
  ('modern-arc', 'Modern Arc', 'east', 'Modern Arc Ontario retail pricing 2026', true),
  ('diamond-arc-west', 'Diamond Arc', 'west', 'Western dealer pricing pending', false)
ON CONFLICT (id) DO NOTHING;

UPDATE dealer_accounts
SET contact_email = 'order@modernarc.ca',
    accepts_app_orders = true,
    pricing_label = 'Modern Arc Ontario retail pricing 2026',
    updated_at = now()
WHERE id = 'modern-arc';

CREATE TABLE IF NOT EXISTS installer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  installer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  company_name text,
  contact_name text,
  email text,
  phone text,
  company_address text,
  city text,
  province text,
  postal_code text,
  semco_account_id text,
  certification_status text NOT NULL DEFAULT 'pending'
    CHECK (certification_status IN ('pending','certified','suspended')),
  assigned_dealer_id text REFERENCES dealer_accounts(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER installer_profiles_updated_at BEFORE UPDATE ON installer_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE IF NOT EXISTS order_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  calculation_id uuid REFERENCES calculations(id),
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','in_review','needs_revision','approved')),
  dealer_id text REFERENCES dealer_accounts(id),
  dealer_submitted_at timestamptz,
  dealer_reference text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER order_requests_updated_at BEFORE UPDATE ON order_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE IF NOT EXISTS warranty_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  installer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'in_review'
    CHECK (status IN ('not_submitted','in_review','needs_revision','approved','rejected')),
  products_summary text,
  effective_date date,
  reviewer_name text,
  reviewer_signature_url text,
  warranty_document_url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);

CREATE TRIGGER warranty_reviews_updated_at BEFORE UPDATE ON warranty_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE IF NOT EXISTS purchase_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  installer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  dealer_name text,
  receipt_number text,
  receipt_url text,
  sqft_claimed decimal NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','verified','rejected')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);

CREATE TRIGGER purchase_receipts_updated_at BEFORE UPDATE ON purchase_receipts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE IF NOT EXISTS reward_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  installer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  source_type text NOT NULL CHECK (source_type IN ('order_request','receipt','project_review')),
  source_id uuid,
  sqft decimal NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','verified','rejected')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  verified_at timestamptz
);

CREATE INDEX IF NOT EXISTS installer_profiles_installer_idx ON installer_profiles (installer_id);
CREATE INDEX IF NOT EXISTS installer_profiles_dealer_idx ON installer_profiles (assigned_dealer_id);
CREATE INDEX IF NOT EXISTS order_requests_project_idx ON order_requests (project_id);
CREATE INDEX IF NOT EXISTS order_requests_status_idx ON order_requests (status);
CREATE INDEX IF NOT EXISTS warranty_reviews_project_idx ON warranty_reviews (project_id);
CREATE INDEX IF NOT EXISTS warranty_reviews_installer_idx ON warranty_reviews (installer_id);
CREATE INDEX IF NOT EXISTS warranty_reviews_status_idx ON warranty_reviews (status);
CREATE INDEX IF NOT EXISTS purchase_receipts_installer_idx ON purchase_receipts (installer_id);
CREATE INDEX IF NOT EXISTS purchase_receipts_status_idx ON purchase_receipts (status);
CREATE INDEX IF NOT EXISTS reward_credits_installer_idx ON reward_credits (installer_id);
CREATE INDEX IF NOT EXISTS reward_credits_status_idx ON reward_credits (status);

ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealer_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE installer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE warranty_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "semco_admin_profiles_read" ON admin_profiles
  FOR SELECT USING (is_semco_admin() OR user_id = auth.uid());

CREATE POLICY "semco_admin_dealers_all" ON dealer_accounts
  USING (is_semco_admin())
  WITH CHECK (is_semco_admin());

CREATE POLICY "authenticated_dealers_read" ON dealer_accounts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "installer_profiles_owner_select" ON installer_profiles
  FOR SELECT USING (installer_id = auth.uid() OR is_semco_admin());

CREATE POLICY "installer_profiles_owner_insert" ON installer_profiles
  FOR INSERT WITH CHECK (installer_id = auth.uid() OR is_semco_admin());

CREATE POLICY "installer_profiles_owner_update" ON installer_profiles
  FOR UPDATE USING (installer_id = auth.uid() OR is_semco_admin())
  WITH CHECK (installer_id = auth.uid() OR is_semco_admin());

CREATE POLICY "order_requests_owner_select" ON order_requests
  FOR SELECT USING (
    is_semco_admin()
    OR project_id IN (SELECT id FROM projects WHERE installer_id = auth.uid())
  );

CREATE POLICY "order_requests_owner_insert" ON order_requests
  FOR INSERT WITH CHECK (
    project_id IN (SELECT id FROM projects WHERE installer_id = auth.uid())
    OR is_semco_admin()
  );

CREATE POLICY "order_requests_admin_update" ON order_requests
  FOR UPDATE USING (is_semco_admin())
  WITH CHECK (is_semco_admin());

CREATE POLICY "warranty_reviews_owner_select" ON warranty_reviews
  FOR SELECT USING (installer_id = auth.uid() OR is_semco_admin());

CREATE POLICY "warranty_reviews_owner_insert" ON warranty_reviews
  FOR INSERT WITH CHECK (installer_id = auth.uid() OR is_semco_admin());

CREATE POLICY "warranty_reviews_admin_update" ON warranty_reviews
  FOR UPDATE USING (is_semco_admin())
  WITH CHECK (is_semco_admin());

CREATE POLICY "purchase_receipts_owner_select" ON purchase_receipts
  FOR SELECT USING (installer_id = auth.uid() OR is_semco_admin());

CREATE POLICY "purchase_receipts_owner_insert" ON purchase_receipts
  FOR INSERT WITH CHECK (installer_id = auth.uid() OR is_semco_admin());

CREATE POLICY "purchase_receipts_admin_update" ON purchase_receipts
  FOR UPDATE USING (is_semco_admin())
  WITH CHECK (is_semco_admin());

CREATE POLICY "reward_credits_owner_select" ON reward_credits
  FOR SELECT USING (installer_id = auth.uid() OR is_semco_admin());

CREATE POLICY "reward_credits_owner_insert" ON reward_credits
  FOR INSERT WITH CHECK (installer_id = auth.uid() OR is_semco_admin());

CREATE POLICY "reward_credits_admin_update" ON reward_credits
  FOR UPDATE USING (is_semco_admin())
  WITH CHECK (is_semco_admin());

CREATE POLICY "semco_admin_projects_all" ON projects
  USING (is_semco_admin())
  WITH CHECK (is_semco_admin());

CREATE POLICY "semco_admin_project_photos_all" ON project_photos
  USING (is_semco_admin())
  WITH CHECK (is_semco_admin());

CREATE POLICY "semco_admin_calculations_all" ON calculations
  USING (is_semco_admin())
  WITH CHECK (is_semco_admin());

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('warranty-documents', 'warranty-documents', false),
  ('purchase-receipts', 'purchase-receipts', false)
ON CONFLICT (id) DO NOTHING;

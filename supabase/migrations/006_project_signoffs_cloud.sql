CREATE TABLE IF NOT EXISTS project_signoffs (
  id text PRIMARY KEY,
  project_id text NOT NULL,
  installer_id uuid NOT NULL REFERENCES auth.users(id),
  type text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  title text NOT NULL,
  customer_name text,
  customer_email text,
  summary text,
  notes text,
  form_data jsonb NOT NULL DEFAULT '{}',
  signature_data text,
  pdf_url text,
  signed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS project_signoffs_project_idx ON project_signoffs(project_id);
CREATE INDEX IF NOT EXISTS project_signoffs_installer_idx ON project_signoffs(installer_id);
CREATE INDEX IF NOT EXISTS project_signoffs_status_idx ON project_signoffs(status);

CREATE TRIGGER project_signoffs_updated_at BEFORE UPDATE ON project_signoffs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE project_signoffs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "project_signoffs_owner_select" ON project_signoffs;
DROP POLICY IF EXISTS "project_signoffs_owner_insert" ON project_signoffs;
DROP POLICY IF EXISTS "project_signoffs_owner_update" ON project_signoffs;
DROP POLICY IF EXISTS "project_signoffs_admin_all" ON project_signoffs;

CREATE POLICY "project_signoffs_owner_select" ON project_signoffs
  FOR SELECT USING (installer_id = auth.uid() OR is_semco_admin());

CREATE POLICY "project_signoffs_owner_insert" ON project_signoffs
  FOR INSERT WITH CHECK (installer_id = auth.uid() OR is_semco_admin());

CREATE POLICY "project_signoffs_owner_update" ON project_signoffs
  FOR UPDATE USING (installer_id = auth.uid() OR is_semco_admin())
  WITH CHECK (installer_id = auth.uid() OR is_semco_admin());

CREATE POLICY "project_signoffs_admin_all" ON project_signoffs
  USING (is_semco_admin())
  WITH CHECK (is_semco_admin());

INSERT INTO storage.buckets (id, name, public)
VALUES ('project-signoffs', 'project-signoffs', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "project_signoffs_storage_owner_select" ON storage.objects;
DROP POLICY IF EXISTS "project_signoffs_storage_owner_insert" ON storage.objects;
DROP POLICY IF EXISTS "project_signoffs_storage_owner_update" ON storage.objects;
DROP POLICY IF EXISTS "project_signoffs_storage_admin_all" ON storage.objects;

CREATE POLICY "project_signoffs_storage_owner_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'project-signoffs'
    AND ((storage.foldername(name))[1] = auth.uid()::text OR is_semco_admin())
  );

CREATE POLICY "project_signoffs_storage_owner_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'project-signoffs'
    AND ((storage.foldername(name))[1] = auth.uid()::text OR is_semco_admin())
  );

CREATE POLICY "project_signoffs_storage_owner_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'project-signoffs'
    AND ((storage.foldername(name))[1] = auth.uid()::text OR is_semco_admin())
  )
  WITH CHECK (
    bucket_id = 'project-signoffs'
    AND ((storage.foldername(name))[1] = auth.uid()::text OR is_semco_admin())
  );

CREATE POLICY "project_signoffs_storage_admin_all" ON storage.objects
  USING (bucket_id = 'project-signoffs' AND is_semco_admin())
  WITH CHECK (bucket_id = 'project-signoffs' AND is_semco_admin());

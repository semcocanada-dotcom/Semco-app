CREATE OR REPLACE FUNCTION current_dealer_id()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT dealer_id
  FROM admin_profiles
  WHERE user_id = auth.uid()
    AND role = 'dealer_admin'
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION is_dealer_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT current_dealer_id() IS NOT NULL;
$$;

DROP POLICY IF EXISTS "dealer_profiles_assigned_select" ON installer_profiles;
DROP POLICY IF EXISTS "dealer_projects_assigned_select" ON projects;
DROP POLICY IF EXISTS "dealer_project_photos_assigned_select" ON project_photos;
DROP POLICY IF EXISTS "dealer_orders_assigned_select" ON order_requests;
DROP POLICY IF EXISTS "dealer_orders_assigned_update" ON order_requests;
DROP POLICY IF EXISTS "dealer_signoffs_assigned_select" ON project_signoffs;

CREATE POLICY "dealer_profiles_assigned_select" ON installer_profiles
  FOR SELECT USING (
    is_semco_admin()
    OR assigned_dealer_id = current_dealer_id()
  );

CREATE POLICY "dealer_projects_assigned_select" ON projects
  FOR SELECT USING (
    is_semco_admin()
    OR installer_id IN (
      SELECT installer_id
      FROM installer_profiles
      WHERE assigned_dealer_id = current_dealer_id()
    )
  );

CREATE POLICY "dealer_project_photos_assigned_select" ON project_photos
  FOR SELECT USING (
    is_semco_admin()
    OR project_id IN (
      SELECT p.id
      FROM projects p
      JOIN installer_profiles ip ON ip.installer_id = p.installer_id
      WHERE ip.assigned_dealer_id = current_dealer_id()
    )
  );

CREATE POLICY "dealer_orders_assigned_select" ON order_requests
  FOR SELECT USING (
    is_semco_admin()
    OR dealer_id = current_dealer_id()
    OR project_id IN (
      SELECT p.id
      FROM projects p
      JOIN installer_profiles ip ON ip.installer_id = p.installer_id
      WHERE ip.assigned_dealer_id = current_dealer_id()
    )
  );

CREATE POLICY "dealer_orders_assigned_update" ON order_requests
  FOR UPDATE USING (
    dealer_id = current_dealer_id()
    OR project_id IN (
      SELECT p.id
      FROM projects p
      JOIN installer_profiles ip ON ip.installer_id = p.installer_id
      WHERE ip.assigned_dealer_id = current_dealer_id()
    )
  )
  WITH CHECK (
    dealer_id = current_dealer_id()
    OR project_id IN (
      SELECT p.id
      FROM projects p
      JOIN installer_profiles ip ON ip.installer_id = p.installer_id
      WHERE ip.assigned_dealer_id = current_dealer_id()
    )
  );

CREATE POLICY "dealer_signoffs_assigned_select" ON project_signoffs
  FOR SELECT USING (
    is_semco_admin()
    OR project_id IN (
      SELECT p.id
      FROM projects p
      JOIN installer_profiles ip ON ip.installer_id = p.installer_id
      WHERE ip.assigned_dealer_id = current_dealer_id()
    )
  );

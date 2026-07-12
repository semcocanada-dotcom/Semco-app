-- Current Semco Canada order routing.
-- Until a western dealer is active, all app material requests route to Modern Arc.

UPDATE dealer_accounts
SET contact_email = 'order@modernarc.ca',
    accepts_app_orders = true,
    pricing_label = 'Modern Arc Ontario retail pricing 2026',
    updated_at = now()
WHERE id = 'modern-arc';

UPDATE dealer_accounts
SET accepts_app_orders = false,
    updated_at = now()
WHERE id = 'diamond-arc-west';

UPDATE installer_profiles
SET assigned_dealer_id = 'modern-arc',
    updated_at = now()
WHERE assigned_dealer_id IS NULL
   OR assigned_dealer_id = 'diamond-arc-west';

-- Re-apply the corrected dealer signoff policy for databases that already ran
-- migration 007 before its text/uuid comparison fix. project_signoffs.project_id
-- is text while projects.id is uuid, so the join must cast.
DROP POLICY IF EXISTS "dealer_signoffs_assigned_select" ON project_signoffs;

CREATE POLICY "dealer_signoffs_assigned_select" ON project_signoffs
  FOR SELECT USING (
    is_semco_admin()
    OR EXISTS (
      SELECT 1
      FROM projects p
      JOIN installer_profiles ip ON ip.installer_id = p.installer_id
      WHERE p.id::text = project_signoffs.project_id
        AND ip.assigned_dealer_id = current_dealer_id()
    )
  );

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

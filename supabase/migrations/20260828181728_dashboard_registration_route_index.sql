CREATE INDEX IF NOT EXISTS installer_registration_routes_assigned_dealer_id_idx
  ON private.installer_registration_routes (assigned_dealer_id);

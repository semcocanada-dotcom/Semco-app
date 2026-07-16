-- Route Manitoba and western Canadian orders through Innovative Finishes.
-- The client still resolves the email from the contractor profile, while the
-- dealer id keeps portal access and cloud order records aligned.

INSERT INTO public.dealer_accounts (
  id,
  name,
  region,
  contact_email,
  pricing_label,
  accepts_app_orders,
  updated_at
)
VALUES (
  'innovative-finishes-west',
  'Innovative Finishes',
  'west',
  'info@semcocanada.ca',
  'Modern Arc Ontario retail pricing 2026',
  true,
  now()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  region = EXCLUDED.region,
  contact_email = EXCLUDED.contact_email,
  pricing_label = EXCLUDED.pricing_label,
  accepts_app_orders = EXCLUDED.accepts_app_orders,
  updated_at = now();

CREATE OR REPLACE FUNCTION public.protect_installer_profile_admin_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  location_text text;
  resolved_dealer text;
BEGIN
  IF auth.uid() IS NULL OR public.is_semco_admin() THEN
    RETURN NEW;
  END IF;

  location_text := upper(concat_ws(' ', NEW.postal_code, NEW.province, NEW.company_address));
  resolved_dealer := CASE
    WHEN location_text ~ '(^|[^A-Z])[RSTVXY][0-9][A-Z][ -]?[0-9][A-Z][0-9]([^A-Z]|$)'
      OR location_text ~ '(^|[^A-Z])(MB|MANITOBA|SK|SASKATCHEWAN|AB|ALBERTA|BC|BRITISH COLUMBIA|YT|YUKON|NT|NORTHWEST TERRITORIES|NU|NUNAVUT)([^A-Z]|$)'
      THEN 'innovative-finishes-west'
    ELSE 'modern-arc'
  END;

  IF TG_OP = 'INSERT' THEN
    NEW.certification_status := 'pending';
  ELSE
    NEW.certification_status := OLD.certification_status;
  END IF;
  NEW.assigned_dealer_id := resolved_dealer;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.protect_installer_profile_admin_fields() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.protect_installer_profile_admin_fields() TO authenticated, service_role;

UPDATE public.installer_profiles
SET assigned_dealer_id = 'innovative-finishes-west', updated_at = now()
WHERE upper(concat_ws(' ', postal_code, province, company_address))
  ~ '(^|[^A-Z])[RSTVXY][0-9][A-Z][ -]?[0-9][A-Z][0-9]([^A-Z]|$)'
   OR upper(concat_ws(' ', postal_code, province, company_address))
  ~ '(^|[^A-Z])(MB|MANITOBA|SK|SASKATCHEWAN|AB|ALBERTA|BC|BRITISH COLUMBIA|YT|YUKON|NT|NORTHWEST TERRITORIES|NU|NUNAVUT)([^A-Z]|$)';

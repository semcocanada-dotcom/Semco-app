-- Keep cloud dealer assignment aligned with the Semco Pro client:
--   Manitoba and west -> Innovative Finishes
--   Ontario and east  -> Modern Arc
-- Northwest Territories is western; Nunavut is eastern. Both dealers expose
-- the same national customer-facing price catalog. Routing changes the order
-- destination only and never applies a dealer-specific price or markup.

UPDATE public.dealer_accounts
SET pricing_label = 'Semco Canada retail pricing 2026 - same prices nationwide',
    accepts_app_orders = true,
    updated_at = now()
WHERE id IN ('modern-arc', 'innovative-finishes-west');

CREATE OR REPLACE FUNCTION public.resolve_canadian_dealer_id(
  postal_code_text text,
  province_text text,
  address_text text
)
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  location_text text;
  postal_fsa text;
BEGIN
  -- Match the app's case/accent/punctuation-insensitive normalization.
  location_text := regexp_replace(
    translate(
      upper(concat_ws(' ', postal_code_text, province_text, address_text)),
      'ÁÀÂÄÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝŸ',
      'AAAAAACEEEEIIIINOOOOOUUUUYY'
    ),
    '[^A-Z0-9]+',
    ' ',
    'g'
  );
  postal_fsa := substring(
    location_text
    FROM '([ABCEGHJ-NPRSTVXY][0-9][ABCEGHJ-NPRSTV-Z])[ ]?[0-9][ABCEGHJ-NPRSTV-Z][0-9]'
  );

  RETURN CASE
    WHEN postal_fsa ~ '^(V|T|S|R|Y)' OR postal_fsa IN ('X0E', 'X0G', 'X1A')
      THEN 'innovative-finishes-west'
    WHEN postal_fsa ~ '^(A|B|C|E|G|H|J|K|L|M|N|P)' OR postal_fsa IN ('X0A', 'X0B', 'X0C')
      THEN 'modern-arc'
    WHEN location_text ~ '(^|[^A-Z])(B[ ]*C|BRITISH[ ]+COLUMBIA|AB|ALTA|ALBERTA|SK|SASK|SASKATCHEWAN|MB|MAN|MANITOBA|YT|YUKON|N[ ]*T|N[ ]*W[ ]*T|NORTHWEST[ ]+TERRITORIES)([^A-Z]|$)'
      THEN 'innovative-finishes-west'
    WHEN location_text ~ '(^|[^A-Z])(ON|ONT|ONTARIO|QC|PQ|QUEBEC|N[ ]*B|NEW[ ]+BRUNSWICK|NOUVEAU[ ]+BRUNSWICK|N[ ]*S|NOVA[ ]+SCOTIA|NOUVELLE[ ]+ECOSSE|PE|P[ ]*E|PEI|P[ ]*E[ ]*I|PRINCE[ ]+EDWARD[ ]+ISLAND|ILE[ ]+DU[ ]+PRINCE[ ]+EDOUARD|N[ ]*L|NFLD|NEWFOUNDLAND|LABRADOR|TERRE[ ]+NEUVE|NU|NUNAVUT)([^A-Z]|$)'
      THEN 'modern-arc'
    ELSE NULL
  END;
END;
$$;

REVOKE ALL ON FUNCTION public.resolve_canadian_dealer_id(text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.resolve_canadian_dealer_id(text, text, text) TO service_role;

CREATE OR REPLACE FUNCTION public.protect_installer_profile_admin_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  resolved_dealer text;
BEGIN
  IF auth.uid() IS NULL OR public.is_semco_admin() THEN
    RETURN NEW;
  END IF;

  resolved_dealer := public.resolve_canadian_dealer_id(
    NEW.postal_code,
    NEW.province,
    NEW.company_address
  );

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

WITH resolved AS (
  SELECT
    id,
    public.resolve_canadian_dealer_id(postal_code, province, company_address) AS dealer_id
  FROM public.installer_profiles
)
UPDATE public.installer_profiles AS profile
SET assigned_dealer_id = resolved.dealer_id,
    updated_at = now()
FROM resolved
WHERE profile.id = resolved.id
  AND resolved.dealer_id IS NOT NULL
  AND profile.assigned_dealer_id IS DISTINCT FROM resolved.dealer_id;

-- Re-route active material requests while preserving the dealer recorded on
-- completed/historical requests.
UPDATE public.order_requests AS request
SET dealer_id = profile.assigned_dealer_id,
    updated_at = now()
FROM public.projects AS project
JOIN public.installer_profiles AS profile
  ON profile.installer_id = project.installer_id
WHERE request.project_id = project.id
  AND request.status IN ('draft', 'in_review')
  AND profile.assigned_dealer_id IS NOT NULL
  AND request.dealer_id IS DISTINCT FROM profile.assigned_dealer_id;

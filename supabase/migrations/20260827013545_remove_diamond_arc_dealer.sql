-- Diamond Arc is not part of the SEMCO Canada dealer network. Preserve any
-- historical records by moving them to the active western dealer before the
-- obsolete dealer row is removed.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.dealer_accounts
    WHERE id = 'innovative-finishes-west'
  ) THEN
    RAISE EXCEPTION 'Innovative Finishes must exist before Diamond Arc can be removed';
  END IF;
END;
$$;

UPDATE public.admin_profiles
SET dealer_id = 'innovative-finishes-west'
WHERE dealer_id = 'diamond-arc-west';

UPDATE public.installer_profiles
SET assigned_dealer_id = 'innovative-finishes-west'
WHERE assigned_dealer_id = 'diamond-arc-west';

UPDATE public.projects
SET dealer_id = 'innovative-finishes-west'
WHERE dealer_id = 'diamond-arc-west';

UPDATE public.order_requests
SET dealer_id = 'innovative-finishes-west'
WHERE dealer_id = 'diamond-arc-west';

UPDATE public.crm_leads
SET dealer_id = 'innovative-finishes-west'
WHERE dealer_id = 'diamond-arc-west';

UPDATE public.crm_activity_events
SET dealer_id = 'innovative-finishes-west'
WHERE dealer_id = 'diamond-arc-west';

UPDATE public.bid_opportunities
SET dealer_id = 'innovative-finishes-west'
WHERE dealer_id = 'diamond-arc-west';

UPDATE public.bid_invitations
SET dealer_id = 'innovative-finishes-west'
WHERE dealer_id = 'diamond-arc-west';

UPDATE public.bid_responses
SET dealer_id = 'innovative-finishes-west'
WHERE dealer_id = 'diamond-arc-west';

DELETE FROM public.dealer_accounts
WHERE id = 'diamond-arc-west';

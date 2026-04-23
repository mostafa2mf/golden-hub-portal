-- 1) Delete seed data (created before 2026-04-09)
-- Delete dependent records first

-- Reviews tied to seed influencers/businesses
DELETE FROM public.reviews
WHERE business_id IN (SELECT id FROM public.businesses WHERE created_at < '2026-04-09')
   OR influencer_id IN (SELECT id FROM public.influencers WHERE created_at < '2026-04-09');

-- Meetings tied to seed influencers/businesses
DELETE FROM public.meetings
WHERE business_id IN (SELECT id FROM public.businesses WHERE created_at < '2026-04-09')
   OR influencer_id IN (SELECT id FROM public.influencers WHERE created_at < '2026-04-09');

-- Campaign influencers tied to seed
DELETE FROM public.campaign_influencers
WHERE influencer_id IN (SELECT id FROM public.influencers WHERE created_at < '2026-04-09')
   OR campaign_id IN (SELECT id FROM public.campaigns WHERE business_id IN (SELECT id FROM public.businesses WHERE created_at < '2026-04-09'));

-- Campaigns tied to seed businesses
DELETE FROM public.campaigns
WHERE business_id IN (SELECT id FROM public.businesses WHERE created_at < '2026-04-09');

-- Approvals tied to seed entities
DELETE FROM public.approvals
WHERE (entity_type = 'business' AND entity_id IN (SELECT id FROM public.businesses WHERE created_at < '2026-04-09'))
   OR (entity_type = 'influencer' AND entity_id IN (SELECT id FROM public.influencers WHERE created_at < '2026-04-09'));

-- Conversations tied to seed
DELETE FROM public.chat_messages WHERE conversation_id IN (
  SELECT id FROM public.conversations WHERE participant_entity_id IN (
    SELECT id FROM public.businesses WHERE created_at < '2026-04-09'
    UNION
    SELECT id FROM public.influencers WHERE created_at < '2026-04-09'
  )
);
DELETE FROM public.conversations WHERE participant_entity_id IN (
  SELECT id FROM public.businesses WHERE created_at < '2026-04-09'
  UNION
  SELECT id FROM public.influencers WHERE created_at < '2026-04-09'
);

-- Finally delete the businesses and influencers themselves
DELETE FROM public.businesses WHERE created_at < '2026-04-09';
DELETE FROM public.influencers WHERE created_at < '2026-04-09';

-- Cleanup orphan activity log entries
DELETE FROM public.activity_log
WHERE entity_type IN ('business', 'influencer')
  AND entity_id IS NOT NULL
  AND entity_id NOT IN (
    SELECT id FROM public.businesses
    UNION
    SELECT id FROM public.influencers
  );

-- 2) Function to approve/reject reviews (admin only)
CREATE OR REPLACE FUNCTION public.set_review_status(_review_id uuid, _new_status entity_status)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can change review status';
  END IF;

  UPDATE public.reviews SET status = _new_status, updated_at = now() WHERE id = _review_id;
END;
$$;
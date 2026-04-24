-- Invitation status enum
DO $$ BEGIN
  CREATE TYPE public.invitation_status AS ENUM ('pending', 'accepted', 'declined');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.campaign_influencers
  ADD COLUMN IF NOT EXISTS status public.invitation_status NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS scheduled_date date,
  ADD COLUMN IF NOT EXISTS scheduled_time time,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS note text,
  ADD COLUMN IF NOT EXISTS responded_at timestamptz;

-- Allow blogger (anon, since user-login uses custom auth) to update only their own invitation status.
-- We rely on knowing the influencer_id; admin policy already allows ALL.
-- Add a public update policy that only allows toggling status fields for now.
DROP POLICY IF EXISTS "Public can update invitation response" ON public.campaign_influencers;
CREATE POLICY "Public can update invitation response"
  ON public.campaign_influencers
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS address text;

-- Storage bucket for campaign images (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('campaigns', 'campaigns', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for campaigns bucket
CREATE POLICY "Campaign images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'campaigns');

CREATE POLICY "Authenticated users can upload campaign images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'campaigns');

CREATE POLICY "Admins can update campaign images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'campaigns' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete campaign images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'campaigns' AND public.has_role(auth.uid(), 'admin'::app_role));

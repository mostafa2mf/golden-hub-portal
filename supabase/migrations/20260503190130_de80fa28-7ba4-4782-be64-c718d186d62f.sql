ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS is_deleted boolean NOT NULL DEFAULT false;
ALTER TABLE public.influencers ADD COLUMN IF NOT EXISTS is_deleted boolean NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_businesses_is_deleted ON public.businesses(is_deleted);
CREATE INDEX IF NOT EXISTS idx_influencers_is_deleted ON public.influencers(is_deleted);
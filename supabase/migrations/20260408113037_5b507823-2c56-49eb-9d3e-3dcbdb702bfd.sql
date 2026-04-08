
-- =============================================
-- ENUMS
-- =============================================
CREATE TYPE public.entity_status AS ENUM ('pending', 'active', 'suspended', 'rejected');
CREATE TYPE public.campaign_status AS ENUM ('pending', 'active', 'scheduled', 'completed', 'rejected', 'paused');
CREATE TYPE public.meeting_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE public.gender_type AS ENUM ('male', 'female', 'other');
CREATE TYPE public.approval_type AS ENUM ('influencer', 'business');
CREATE TYPE public.approval_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.message_role AS ENUM ('influencer', 'business', 'admin');

-- =============================================
-- CATEGORIES TABLE
-- =============================================
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  name_fa TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.categories (name, name_fa) VALUES
  ('Food', 'غذا'), ('Cafe', 'کافه'), ('Restaurant', 'رستوران'),
  ('Hotel', 'هتل'), ('Beauty', 'زیبایی'), ('Fashion', 'فشن'),
  ('Sport', 'ورزش'), ('Art', 'هنر'), ('Cinema', 'سینما'), ('Product', 'محصول');

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- BUSINESSES TABLE
-- =============================================
CREATE TABLE public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  category_id UUID REFERENCES public.categories(id),
  city TEXT,
  address TEXT,
  contact_name TEXT,
  phone TEXT,
  email TEXT,
  description TEXT,
  rating NUMERIC(2,1) DEFAULT 0,
  status entity_status NOT NULL DEFAULT 'pending',
  verified BOOLEAN NOT NULL DEFAULT false,
  active_campaigns INT NOT NULL DEFAULT 0,
  completed_collabs INT NOT NULL DEFAULT 0,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Businesses viewable by authenticated" ON public.businesses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage businesses" ON public.businesses FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can insert businesses" ON public.businesses FOR INSERT WITH CHECK (true);

-- =============================================
-- INFLUENCERS TABLE
-- =============================================
CREATE TABLE public.influencers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  handle TEXT,
  avatar_url TEXT,
  followers INT NOT NULL DEFAULT 0,
  engagement NUMERIC(4,2) DEFAULT 0,
  city TEXT,
  category_id UUID REFERENCES public.categories(id),
  gender gender_type,
  age INT,
  bio TEXT,
  status entity_status NOT NULL DEFAULT 'pending',
  verified BOOLEAN NOT NULL DEFAULT false,
  campaigns_count INT NOT NULL DEFAULT 0,
  reviews_count INT NOT NULL DEFAULT 0,
  bookings_count INT NOT NULL DEFAULT 0,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.influencers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Influencers viewable by authenticated" ON public.influencers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage influencers" ON public.influencers FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can insert influencers" ON public.influencers FOR INSERT WITH CHECK (true);

-- =============================================
-- CAMPAIGNS TABLE
-- =============================================
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  city TEXT,
  start_date DATE,
  end_date DATE,
  budget TEXT,
  description TEXT,
  status campaign_status NOT NULL DEFAULT 'pending',
  performance INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Campaigns viewable by authenticated" ON public.campaigns FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage campaigns" ON public.campaigns FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can insert campaigns" ON public.campaigns FOR INSERT WITH CHECK (true);

-- =============================================
-- CAMPAIGN_INFLUENCERS (many-to-many)
-- =============================================
CREATE TABLE public.campaign_influencers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  influencer_id UUID REFERENCES public.influencers(id) ON DELETE CASCADE NOT NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, influencer_id)
);

ALTER TABLE public.campaign_influencers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Campaign influencers viewable by authenticated" ON public.campaign_influencers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage campaign influencers" ON public.campaign_influencers FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- MEETINGS TABLE
-- =============================================
CREATE TABLE public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  influencer_id UUID REFERENCES public.influencers(id) ON DELETE CASCADE NOT NULL,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  city TEXT,
  location TEXT,
  meeting_date DATE NOT NULL,
  meeting_time TIME NOT NULL,
  status meeting_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Meetings viewable by authenticated" ON public.meetings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage meetings" ON public.meetings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can insert meetings" ON public.meetings FOR INSERT WITH CHECK (true);

-- =============================================
-- APPROVALS TABLE
-- =============================================
CREATE TABLE public.approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type approval_type NOT NULL,
  entity_id UUID NOT NULL,
  status approval_status NOT NULL DEFAULT 'pending',
  reject_reason TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approvals viewable by admins" ON public.approvals FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage approvals" ON public.approvals FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- CONVERSATIONS & MESSAGES
-- =============================================
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_name TEXT NOT NULL,
  participant_role message_role NOT NULL,
  participant_entity_id UUID,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_online BOOLEAN NOT NULL DEFAULT false,
  last_message TEXT,
  unread_count INT NOT NULL DEFAULT 0,
  last_message_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Conversations viewable by admins" ON public.conversations FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage conversations" ON public.conversations FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_role message_role NOT NULL,
  sender_name TEXT,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Chat messages viewable by admins" ON public.chat_messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage chat messages" ON public.chat_messages FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can insert chat messages" ON public.chat_messages FOR INSERT WITH CHECK (true);

-- =============================================
-- ACTIVITY LOG
-- =============================================
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  message_fa TEXT,
  icon TEXT,
  entity_type TEXT,
  entity_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Activity log viewable by admins" ON public.activity_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can insert activity log" ON public.activity_log FOR INSERT WITH CHECK (true);

-- =============================================
-- REVIEWS TABLE
-- =============================================
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID REFERENCES public.influencers(id) ON DELETE CASCADE NOT NULL,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content TEXT,
  media_urls TEXT[],
  status entity_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews viewable by authenticated" ON public.reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage reviews" ON public.reviews FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can insert reviews" ON public.reviews FOR INSERT WITH CHECK (true);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_businesses_status ON public.businesses(status);
CREATE INDEX idx_businesses_category ON public.businesses(category_id);
CREATE INDEX idx_influencers_status ON public.influencers(status);
CREATE INDEX idx_influencers_category ON public.influencers(category_id);
CREATE INDEX idx_campaigns_status ON public.campaigns(status);
CREATE INDEX idx_campaigns_business ON public.campaigns(business_id);
CREATE INDEX idx_meetings_date ON public.meetings(meeting_date);
CREATE INDEX idx_meetings_business ON public.meetings(business_id);
CREATE INDEX idx_meetings_influencer ON public.meetings(influencer_id);
CREATE INDEX idx_approvals_status ON public.approvals(status);
CREATE INDEX idx_chat_messages_conversation ON public.chat_messages(conversation_id);
CREATE INDEX idx_activity_log_created ON public.activity_log(created_at DESC);
CREATE INDEX idx_reviews_influencer ON public.reviews(influencer_id);
CREATE INDEX idx_reviews_business ON public.reviews(business_id);

-- =============================================
-- UPDATED_AT TRIGGERS
-- =============================================
CREATE TRIGGER set_businesses_updated_at BEFORE UPDATE ON public.businesses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_influencers_updated_at BEFORE UPDATE ON public.influencers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_campaigns_updated_at BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_meetings_updated_at BEFORE UPDATE ON public.meetings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create entity credential type enum
CREATE TYPE public.credential_entity_type AS ENUM ('blogger', 'business');

-- Create user_credentials table
CREATE TABLE public.user_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type credential_entity_type NOT NULL,
  entity_id UUID NOT NULL,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(entity_type, entity_id)
);

-- Enable RLS
ALTER TABLE public.user_credentials ENABLE ROW LEVEL SECURITY;

-- Only admins can view credentials
CREATE POLICY "Admins can view credentials"
ON public.user_credentials FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Anyone can insert credentials (for Unity app)
CREATE POLICY "Anyone can insert credentials"
ON public.user_credentials FOR INSERT
TO public
WITH CHECK (true);

-- Admins can update credentials
CREATE POLICY "Admins can update credentials"
ON public.user_credentials FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete credentials
CREATE POLICY "Admins can delete credentials"
ON public.user_credentials FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_user_credentials_updated_at
BEFORE UPDATE ON public.user_credentials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
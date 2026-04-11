
-- Enable pgcrypto for bcrypt
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Login attempts tracking for rate limiting
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL,
  ip_address text,
  attempted_at timestamptz NOT NULL DEFAULT now(),
  success boolean NOT NULL DEFAULT false
);

ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage login attempts"
ON public.login_attempts FOR ALL
USING (auth.role() = 'service_role'::text)
WITH CHECK (auth.role() = 'service_role'::text);

-- Index for fast lookups
CREATE INDEX idx_login_attempts_username_time ON public.login_attempts (username, attempted_at DESC);

-- Auto-cleanup old attempts (older than 24h)
CREATE OR REPLACE FUNCTION public.cleanup_old_login_attempts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.login_attempts WHERE attempted_at < now() - interval '24 hours';
  RETURN NEW;
END;
$$;

CREATE TRIGGER cleanup_login_attempts
AFTER INSERT ON public.login_attempts
FOR EACH STATEMENT
EXECUTE FUNCTION public.cleanup_old_login_attempts();

-- Hash all existing plaintext passwords with bcrypt
UPDATE public.user_credentials
SET password = crypt(password, gen_salt('bf', 10))
WHERE password NOT LIKE '$2a$%' AND password NOT LIKE '$2b$%';

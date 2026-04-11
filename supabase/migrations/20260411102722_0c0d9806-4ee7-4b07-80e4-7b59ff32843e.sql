
CREATE OR REPLACE FUNCTION public.hash_credential_password()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  -- Only hash if password is not already a bcrypt hash
  IF NEW.password IS NOT NULL AND NEW.password NOT LIKE '$2a$%' AND NEW.password NOT LIKE '$2b$%' THEN
    NEW.password := crypt(NEW.password, gen_salt('bf', 10));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER hash_password_on_upsert
BEFORE INSERT OR UPDATE OF password ON public.user_credentials
FOR EACH ROW
EXECUTE FUNCTION public.hash_credential_password();

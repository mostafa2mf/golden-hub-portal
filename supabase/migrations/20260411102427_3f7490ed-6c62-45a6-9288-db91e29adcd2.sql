
CREATE OR REPLACE FUNCTION public.verify_password(_stored_hash text, _input_password text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN _stored_hash = crypt(_input_password, _stored_hash);
END;
$$;

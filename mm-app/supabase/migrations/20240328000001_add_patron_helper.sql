-- Add patron helper function
BEGIN;

-- Create the is_patron function
CREATE OR REPLACE FUNCTION public.is_patron(role_to_check public.user_role)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT role_to_check::text = 'patron';
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_patron(public.user_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_patron(public.user_role) TO service_role;

COMMIT; 
-- Update RLS policies for patron features
BEGIN;

-- Update profile policies to ensure patrons can update their own profiles
CREATE POLICY "Patrons can update their own profiles"
ON public.profiles
FOR UPDATE
USING (
  auth.uid() = id AND 
  (public.is_patron(auth.role()::public.user_role) OR public.is_artist(auth.role()::public.user_role))
);

COMMIT; 
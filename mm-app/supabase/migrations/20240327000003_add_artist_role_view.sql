-- First transaction: Add the new enum value
BEGIN;

-- Check if the new role value already exists to avoid errors
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type 
    WHERE typname = 'user_role' 
    AND typarray = 'user_role[]'::regtype::oid
  ) THEN
    RAISE EXCEPTION 'user_role enum type does not exist';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumtypid = 'user_role'::regtype::oid 
    AND enumlabel = 'verified_artist'
  ) THEN
    ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'verified_artist';
  END IF;
END $$;

COMMIT;

-- Second transaction: Create view and update data
BEGIN;

-- Create or replace the view with proper schema qualification
CREATE OR REPLACE VIEW public.profile_roles AS
SELECT 
  p.id,
  CASE 
    WHEN p.role::text = 'artist' THEN 'verified_artist'::public.user_role
    ELSE p.role
  END as mapped_role,
  p.role as original_role
FROM public.profiles p;

-- Update existing artists to the new role
UPDATE public.profiles
SET role = 'verified_artist'::public.user_role
WHERE role::text = 'artist';

-- Create or replace the artist check function
CREATE OR REPLACE FUNCTION public.is_artist(role_to_check public.user_role)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT role_to_check::text IN ('artist', 'verified_artist', 'emerging_artist');
$$;

-- Update RLS policies to use the new function
DROP POLICY IF EXISTS "Artists can update their own artworks" ON public.artworks;

CREATE POLICY "Artists can update their own artworks"
ON public.artworks
FOR UPDATE
USING (
  auth.uid() = artist_id AND 
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND public.is_artist(role)
  )
);

COMMIT; 
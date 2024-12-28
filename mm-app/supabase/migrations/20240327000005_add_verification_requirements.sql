-- Add verification_requirements column to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS verification_requirements JSONB DEFAULT jsonb_build_object(
  'portfolio_complete', false,
  'identity_verified', false,
  'gallery_connection', false,
  'sales_history', false,
  'community_engagement', false
);

-- Add verification_progress column if not exists
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS verification_progress INTEGER DEFAULT 0;

-- Update existing verified artists
UPDATE public.profiles
SET 
  verification_requirements = jsonb_build_object(
    'portfolio_complete', true,
    'identity_verified', true,
    'gallery_connection', true,
    'sales_history', true,
    'community_engagement', true
  ),
  verification_progress = 100
WHERE artist_type = 'verified';

-- Create function to calculate verification progress
CREATE OR REPLACE FUNCTION public.calculate_verification_progress()
RETURNS trigger AS $$
BEGIN
  NEW.verification_progress := (
    (CASE WHEN (NEW.verification_requirements->>'portfolio_complete')::boolean THEN 20 ELSE 0 END) +
    (CASE WHEN (NEW.verification_requirements->>'identity_verified')::boolean THEN 20 ELSE 0 END) +
    (CASE WHEN (NEW.verification_requirements->>'gallery_connection')::boolean THEN 20 ELSE 0 END) +
    (CASE WHEN (NEW.verification_requirements->>'sales_history')::boolean THEN 20 ELSE 0 END) +
    (CASE WHEN (NEW.verification_requirements->>'community_engagement')::boolean THEN 20 ELSE 0 END)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update verification progress
DROP TRIGGER IF EXISTS update_verification_progress ON public.profiles;
CREATE TRIGGER update_verification_progress
  BEFORE UPDATE OF verification_requirements ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_verification_progress(); 
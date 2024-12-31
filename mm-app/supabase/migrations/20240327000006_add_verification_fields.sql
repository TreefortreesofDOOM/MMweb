-- Add community_engagement_score to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS community_engagement_score INTEGER DEFAULT 0;

-- Add check constraint to ensure score is between 0 and 100
ALTER TABLE public.profiles
ADD CONSTRAINT community_engagement_score_range
CHECK (community_engagement_score >= 0 AND community_engagement_score <= 100);

-- Add verification_status to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending'
CHECK (verification_status IN ('pending', 'in_progress', 'verified', 'rejected'));

-- Add verification_status_updated_at to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS verification_status_updated_at TIMESTAMPTZ;

-- Create function to update verification progress when engagement score changes
CREATE OR REPLACE FUNCTION public.check_engagement_verification()
RETURNS trigger AS $$
DECLARE
  completed_count INTEGER;
  total_count INTEGER;
BEGIN
  -- If engagement score reaches threshold (50), update verification requirements
  IF NEW.community_engagement_score >= 50 AND 
     (OLD.community_engagement_score IS NULL OR OLD.community_engagement_score < 50) THEN
    
    -- Update the verification requirements
    NEW.verification_requirements = jsonb_set(
      COALESCE(NEW.verification_requirements, '{}'::jsonb),
      '{platform_engagement,hasCommunityEngagement}',
      'true'
    );
    
    -- Calculate completed requirements
    SELECT 
      COUNT(*) FILTER (WHERE value = 'true'),
      COUNT(*)
    INTO completed_count, total_count
    FROM jsonb_each_text(NEW.verification_requirements);
    
    -- Update verification progress
    IF total_count > 0 THEN
      NEW.verification_progress := FLOOR((completed_count::float / total_count::float) * 100);
    ELSE
      NEW.verification_progress := 0;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for engagement score changes
DROP TRIGGER IF EXISTS check_engagement_verification_trigger ON public.profiles;
CREATE TRIGGER check_engagement_verification_trigger
  BEFORE UPDATE OF community_engagement_score ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_engagement_verification();

-- Create function to update verification status timestamp
CREATE OR REPLACE FUNCTION update_verification_status_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.verification_status_updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for verification status updates
DROP TRIGGER IF EXISTS update_verification_status_timestamp ON public.profiles;
CREATE TRIGGER update_verification_status_timestamp
    BEFORE UPDATE OF verification_status
    ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_verification_status_timestamp();

-- Update existing verified artists
UPDATE public.profiles
SET 
    verification_status = 'verified',
    verification_status_updated_at = NOW(),
    community_engagement_score = 100
WHERE artist_type = 'verified';

-- Update existing emerging artists
UPDATE public.profiles
SET 
    verification_status = 'in_progress',
    community_engagement_score = 
        CASE 
            WHEN verification_progress >= 75 THEN 75
            WHEN verification_progress >= 50 THEN 50
            WHEN verification_progress >= 25 THEN 25
            ELSE 0
        END
WHERE artist_type = 'emerging_artist'; 
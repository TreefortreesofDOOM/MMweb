-- Update the user_role enum type
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'emerging_artist';

-- Add artist_type column to profiles for more granular control
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS artist_type TEXT CHECK (
  artist_type IN ('verified', 'emerging') OR artist_type IS NULL
);

-- Update existing artists to verified type
UPDATE public.profiles
SET artist_type = 'verified'
WHERE role = 'artist';

-- Create features table for granular feature control
CREATE TABLE IF NOT EXISTS public.artist_features (
  user_id UUID REFERENCES public.profiles(id),
  feature_name TEXT NOT NULL,
  enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  PRIMARY KEY (user_id, feature_name)
);

-- Add RLS policies
ALTER TABLE public.artist_features ENABLE ROW LEVEL SECURITY;

-- Users can read their own features
CREATE POLICY "Users can view their own features"
  ON public.artist_features
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only admins can modify features
CREATE POLICY "Admins can modify features"
  ON public.artist_features
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND role = 'admin'
    )
  );

-- Create verification progress tracking
CREATE TABLE IF NOT EXISTS public.verification_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  current_step TEXT NOT NULL,
  steps_completed TEXT[] DEFAULT '{}'::TEXT[],
  next_steps TEXT[] DEFAULT '{}'::TEXT[],
  requirements_met JSONB DEFAULT '{}'::jsonb,
  feedback TEXT,
  reviewer_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (user_id)
);

-- Add RLS policies for verification progress
ALTER TABLE public.verification_progress ENABLE ROW LEVEL SECURITY;

-- Users can view their own progress
CREATE POLICY "Users can view their own verification progress"
  ON public.verification_progress
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only admins can modify verification progress
CREATE POLICY "Admins can modify verification progress"
  ON public.verification_progress
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND role = 'admin'
    )
  );

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_artist_features_user_id ON public.artist_features(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_progress_user_id ON public.verification_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_artist_type ON public.profiles(artist_type);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_artist_features_updated_at
  BEFORE UPDATE ON public.artist_features
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_verification_progress_updated_at
  BEFORE UPDATE ON public.verification_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at(); 
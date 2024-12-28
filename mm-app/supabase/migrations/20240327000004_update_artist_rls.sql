-- Update RLS policies for the two-tier artist system
BEGIN;

-- Update artwork creation policy
DROP POLICY IF EXISTS "Artists can create artworks" ON public.artworks;
CREATE POLICY "Artists can create artworks"
ON public.artworks FOR INSERT
WITH CHECK (
  auth.uid() = artist_id AND 
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND public.is_artist(role)
  )
);

-- Add artwork limit policy for emerging artists
DROP POLICY IF EXISTS "Artists can create artworks within limits" ON public.artworks;
CREATE POLICY "Artists can create artworks within limits"
ON public.artworks FOR INSERT
WITH CHECK (
  (
    SELECT COUNT(*) FROM public.artworks 
    WHERE artist_id = auth.uid()
  ) < CASE 
    WHEN EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'emerging_artist'
    ) THEN 10  -- Limit for emerging artists
    ELSE 1000000  -- No practical limit for verified artists
  END
);

-- Update storage policy for artwork images
DROP POLICY IF EXISTS "Artists can upload artwork images" ON storage.objects;
CREATE POLICY "Artists can upload artwork images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'artwork-images' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND public.is_artist(role)
  )
);

-- Update verification progress visibility
DROP POLICY IF EXISTS "Users can view their own verification progress" ON public.verification_progress;
DROP POLICY IF EXISTS "Admins and profile owner can view verification progress" ON public.verification_progress;
CREATE POLICY "Admins and profile owner can view verification progress"
ON public.verification_progress FOR SELECT
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

COMMIT; 
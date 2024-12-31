-- Update follow policies to use is_artist function
BEGIN;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can see their follow relationships" ON public.follows;
DROP POLICY IF EXISTS "Users can follow artists" ON public.follows;
DROP POLICY IF EXISTS "Users can unfollow artists" ON public.follows;

-- Create new policies using is_artist function
CREATE POLICY "Users can see their follow relationships"
ON public.follows
FOR SELECT
USING (
    auth.uid() = follower_id 
    OR auth.uid() = following_id
    OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = following_id 
        AND public.is_artist(role)
    )
);

CREATE POLICY "Users can follow artists"
ON public.follows
FOR INSERT
WITH CHECK (
    auth.uid() = follower_id
    AND EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = following_id 
        AND public.is_artist(role)
    )
);

CREATE POLICY "Users can unfollow artists"
ON public.follows
FOR DELETE
USING (
    auth.uid() = follower_id
    AND EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = following_id 
        AND public.is_artist(role)
    )
);

COMMIT; 
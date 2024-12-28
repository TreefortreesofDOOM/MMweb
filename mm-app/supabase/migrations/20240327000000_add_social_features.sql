-- Create enum if not exists (matches database.types.ts)
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('user', 'artist', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create follows table
CREATE TABLE IF NOT EXISTS public.follows (
    follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (follower_id, following_id)
);

-- Create artwork_favorites table
CREATE TABLE IF NOT EXISTS public.artwork_favorites (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    artwork_id UUID NOT NULL REFERENCES public.artworks(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, artwork_id)
);

-- Add indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_created_at ON public.follows(created_at);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.artwork_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_artwork ON public.artwork_favorites(artwork_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON public.artwork_favorites(created_at);

-- Add RLS policies
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artwork_favorites ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see who they follow and who follows them
CREATE POLICY "Users can see their follow relationships"
    ON public.follows
    FOR SELECT
    USING (
        auth.uid() = follower_id 
        OR auth.uid() = following_id
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = following_id 
            AND profiles.role = 'artist'::user_role
        )
    );

-- Policy: Users can follow/unfollow others
CREATE POLICY "Users can manage their follows"
    ON public.follows
    FOR ALL
    USING (auth.uid() = follower_id)
    WITH CHECK (auth.uid() = follower_id);

-- Policy: Users can see artwork favorites
CREATE POLICY "Users can see artwork favorites"
    ON public.artwork_favorites
    FOR SELECT
    USING (
        auth.uid() = user_id 
        OR EXISTS (
            SELECT 1 FROM public.artworks 
            WHERE artworks.id = artwork_id
            AND status = 'published'
        )
    );

-- Policy: Users can manage their favorites
CREATE POLICY "Users can manage their favorites"
    ON public.artwork_favorites
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Add trigger for updating updated_at on artworks table when favorited
CREATE OR REPLACE FUNCTION public.handle_artwork_favorite()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        UPDATE public.artworks
        SET updated_at = NOW()
        WHERE id = OLD.artwork_id;
        RETURN OLD;
    ELSIF (TG_OP = 'INSERT') THEN
        UPDATE public.artworks
        SET updated_at = NOW()
        WHERE id = NEW.artwork_id;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_artwork_favorite
    AFTER INSERT OR DELETE ON public.artwork_favorites
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_artwork_favorite();

-- Add trigger for updating updated_at on follows
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER handle_follows_updated_at
    BEFORE UPDATE ON public.follows
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_favorites_updated_at
    BEFORE UPDATE ON public.artwork_favorites
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at(); 
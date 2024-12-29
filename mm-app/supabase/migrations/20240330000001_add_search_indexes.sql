-- Add indexes for search optimization
CREATE INDEX IF NOT EXISTS idx_profiles_artist_type ON public.profiles (artist_type);
CREATE INDEX IF NOT EXISTS idx_profiles_full_name ON public.profiles (full_name);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles (location);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles (created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_view_count ON public.profiles (view_count);
CREATE INDEX IF NOT EXISTS idx_profiles_exhibition_badge ON public.profiles (exhibition_badge);

-- Add GiST index for text search on bio
CREATE INDEX IF NOT EXISTS idx_profiles_bio_gin ON public.profiles USING GIN (to_tsvector('english', coalesce(bio, '')));

-- Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_profiles_artist_type_created_at 
ON public.profiles (artist_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_artist_type_view_count 
ON public.profiles (artist_type, view_count DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_exhibition_artist_type 
ON public.profiles (exhibition_badge DESC, artist_type DESC, created_at DESC);

-- Add function for text search
CREATE OR REPLACE FUNCTION search_profiles(search_query text)
RETURNS TABLE (
  id uuid,
  rank real,
  full_name text,
  bio text,
  location text
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    ts_rank(to_tsvector('english', coalesce(p.bio, '')), plainto_tsquery(search_query)) +
    ts_rank(to_tsvector('english', coalesce(p.full_name, '')), plainto_tsquery(search_query)) +
    ts_rank(to_tsvector('english', coalesce(p.location, '')), plainto_tsquery(search_query)) as rank,
    p.full_name,
    p.bio,
    p.location
  FROM public.profiles p
  WHERE
    to_tsvector('english', coalesce(p.bio, '')) @@ plainto_tsquery(search_query) OR
    to_tsvector('english', coalesce(p.full_name, '')) @@ plainto_tsquery(search_query) OR
    to_tsvector('english', coalesce(p.location, '')) @@ plainto_tsquery(search_query)
  ORDER BY rank DESC;
END;
$$ LANGUAGE plpgsql; 
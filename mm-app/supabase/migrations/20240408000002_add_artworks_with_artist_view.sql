-- Create a view that joins artworks with their creators
CREATE OR REPLACE VIEW public.artworks_with_artist 
WITH (security_barrier = true)  -- This ensures the view's security checks are enforced
AS
SELECT 
    a.id,
    a.title,
    a.description,
    a.price,
    a.status,
    a.images,
    a.display_order,
    a.created_at,
    a.updated_at,
    a.artist_id,
    -- Artist profile information with distinct names
    p.name as artist_name,
    p.full_name as artist_full_name,
    p.bio as artist_bio,
    p.avatar_url as artist_avatar_url,
    p.role as artist_role
FROM public.artworks a
LEFT JOIN public.profiles p ON p.id = a.artist_id;

-- Grant access to the view
GRANT SELECT ON public.artworks_with_artist TO authenticated;
GRANT SELECT ON public.artworks_with_artist TO anon;

COMMENT ON VIEW public.artworks_with_artist IS 
'A view that combines artwork data with their creator''s profile information.
This simplifies queries by removing the need to specify the relationship type
when joining artworks with profiles.'; 
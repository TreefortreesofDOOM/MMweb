-- Drop the existing function first
DROP FUNCTION IF EXISTS calculate_engagement_score(UUID);

-- Fix the ambiguous view_count and user_id references in calculate_engagement_score function
CREATE OR REPLACE FUNCTION calculate_engagement_score(target_user_id UUID)
RETURNS integer AS $$
DECLARE
    follower_count integer;
    profile_view_count integer;
    favorite_count integer;
    gallery_visit_count integer;
    total_score integer;
BEGIN
    -- Get follower count
    SELECT COUNT(*) INTO follower_count
    FROM follows
    WHERE following_id = target_user_id;

    -- Get profile views (explicitly reference profiles table)
    SELECT COALESCE(profiles.view_count, 0) INTO profile_view_count
    FROM profiles
    WHERE profiles.id = target_user_id;

    -- Get artwork favorites
    SELECT COUNT(*) INTO favorite_count
    FROM artwork_favorites af
    JOIN artworks a ON a.id = af.artwork_id
    WHERE a.artist_id = target_user_id;

    -- Get gallery visits (explicitly reference gallery_visits table)
    SELECT COUNT(*) INTO gallery_visit_count
    FROM gallery_visits gv
    WHERE gv.user_id = target_user_id;

    -- Calculate total score
    total_score := (follower_count * 2) +
                   (profile_view_count * 0.5)::integer +
                   (favorite_count * 1) +
                   (gallery_visit_count * 5);

    RETURN total_score;
END;
$$ LANGUAGE plpgsql; 
-- Add community_engagement_score column if it doesn't exist
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS community_engagement_score integer DEFAULT 0;

-- Create function to calculate engagement score
CREATE OR REPLACE FUNCTION calculate_engagement_score(user_id UUID)
RETURNS integer AS $$
DECLARE
    follower_count integer;
    view_count integer;
    favorite_count integer;
    gallery_visit_count integer;
    total_score integer;
BEGIN
    -- Get follower count
    SELECT COUNT(*) INTO follower_count
    FROM follows
    WHERE following_id = user_id;

    -- Get profile views
    SELECT COALESCE(view_count, 0) INTO view_count
    FROM profiles
    WHERE id = user_id;

    -- Get artwork favorites
    SELECT COUNT(*) INTO favorite_count
    FROM artwork_favorites af
    JOIN artworks a ON a.id = af.artwork_id
    WHERE a.artist_id = user_id;

    -- Get gallery visits
    SELECT COUNT(*) INTO gallery_visit_count
    FROM gallery_visits
    WHERE user_id = user_id;

    -- Calculate total score
    total_score := (follower_count * 2) +
                   (view_count * 0.5)::integer +
                   (favorite_count * 1) +
                   (gallery_visit_count * 5);

    RETURN total_score;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to update engagement score
CREATE OR REPLACE FUNCTION update_profile_engagement_score()
RETURNS trigger AS $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Determine which user's score to update based on the operation
    IF TG_OP = 'INSERT' THEN
        CASE TG_TABLE_NAME
            WHEN 'follows' THEN
                target_user_id := NEW.following_id;
            WHEN 'artwork_favorites' THEN
                SELECT artist_id INTO target_user_id
                FROM artworks
                WHERE id = NEW.artwork_id;
            WHEN 'gallery_visits' THEN
                target_user_id := NEW.user_id;
        END CASE;
    ELSIF TG_OP = 'DELETE' THEN
        CASE TG_TABLE_NAME
            WHEN 'follows' THEN
                target_user_id := OLD.following_id;
            WHEN 'artwork_favorites' THEN
                SELECT artist_id INTO target_user_id
                FROM artworks
                WHERE id = OLD.artwork_id;
        END CASE;
    END IF;

    -- Update the profile with the new engagement score
    IF target_user_id IS NOT NULL THEN
        UPDATE profiles
        SET 
            community_engagement_score = calculate_engagement_score(target_user_id),
            updated_at = now()
        WHERE id = target_user_id;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_engagement_score_on_follow ON follows;
DROP TRIGGER IF EXISTS update_engagement_score_on_favorite ON artwork_favorites;
DROP TRIGGER IF EXISTS update_engagement_score_on_visit ON gallery_visits;

-- Create triggers for engagement score updates
CREATE TRIGGER update_engagement_score_on_follow
AFTER INSERT OR DELETE ON follows
FOR EACH ROW
EXECUTE FUNCTION update_profile_engagement_score();

CREATE TRIGGER update_engagement_score_on_favorite
AFTER INSERT OR DELETE ON artwork_favorites
FOR EACH ROW
EXECUTE FUNCTION update_profile_engagement_score();

CREATE TRIGGER update_engagement_score_on_visit
AFTER INSERT ON gallery_visits
FOR EACH ROW
EXECUTE FUNCTION update_profile_engagement_score();

-- Update existing profiles with initial engagement scores
UPDATE profiles
SET community_engagement_score = calculate_engagement_score(id)
WHERE role IN ('emerging_artist', 'verified_artist', 'artist'); 
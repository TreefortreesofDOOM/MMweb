-- Fix the get_user_settings function to use the correct column name
CREATE OR REPLACE FUNCTION get_user_settings(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'preferences', COALESCE(
            (
                SELECT json_build_object(
                    'theme', theme,
                    'aiPersonality', ai_personality
                )
                FROM user_preferences
                WHERE user_id = p_user_id
            ),
            json_build_object(
                'theme', 'system'::theme_preference,
                'aiPersonality', 'HAL9000'::ai_personality
            )
        ),
        'notifications', COALESCE(
            (
                SELECT json_object_agg(notification_type, enabled)
                FROM notification_settings
                WHERE user_id = p_user_id
            ),
            json_build_object(
                'email', true,
                'new_artwork', true,
                'new_follower', true,
                'artwork_favorited', true,
                'price_alert', true
            )
        ),
        'role', (
            SELECT json_build_object(
                'current', role,
                'medium', COALESCE(medium, ARRAY[]::text[]),
                'artist_type', artist_type,
                'artist_status', artist_status
            )
            FROM profiles
            WHERE id::UUID = p_user_id
        )
    ) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 
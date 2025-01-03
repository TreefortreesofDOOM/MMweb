-- Add upsert function for user preferences
CREATE OR REPLACE FUNCTION upsert_user_preferences(
    p_user_id UUID,
    p_theme theme_preference,
    p_ai_personality ai_personality DEFAULT 'HAL9000'
) RETURNS void AS $$
BEGIN
    INSERT INTO user_preferences (user_id, theme, ai_personality)
    VALUES (p_user_id, p_theme, p_ai_personality)
    ON CONFLICT (user_id)
    DO UPDATE SET
        theme = EXCLUDED.theme,
        ai_personality = EXCLUDED.ai_personality,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION upsert_user_preferences TO authenticated; 
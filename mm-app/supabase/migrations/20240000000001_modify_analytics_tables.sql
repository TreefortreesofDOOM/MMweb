-- Modify user_events table
ALTER TABLE user_events
    ADD COLUMN IF NOT EXISTS event_name TEXT,
    ADD COLUMN IF NOT EXISTS session_id UUID,
    DROP COLUMN IF EXISTS artist_id;

-- Update event_name with default values where null
UPDATE user_events 
SET event_name = 'view_page' 
WHERE event_name IS NULL AND event_type = 'page_view';

-- Make event_name NOT NULL after setting defaults
ALTER TABLE user_events
    ALTER COLUMN event_name SET NOT NULL;

-- Add foreign key constraint
ALTER TABLE user_events
    ADD CONSTRAINT fk_user_events_session_id 
    FOREIGN KEY (session_id) 
    REFERENCES user_sessions(session_id);

-- Modify user_sessions table
ALTER TABLE user_sessions
    ADD COLUMN IF NOT EXISTS session_id UUID UNIQUE DEFAULT gen_random_uuid(),
    ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    DROP COLUMN IF EXISTS artist_id;

-- Modify role_conversions table
ALTER TABLE role_conversions
    ADD COLUMN IF NOT EXISTS conversion_type TEXT,
    ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
    DROP COLUMN IF EXISTS artist_id;

-- Update conversion_type with default values where null
UPDATE role_conversions 
SET conversion_type = CASE 
    WHEN to_role = 'emerging_artist' THEN 'artist_application'
    WHEN to_role = 'verified_artist' THEN 'artist_verification'
    ELSE 'role_change'
END
WHERE conversion_type IS NULL;

-- Make conversion_type NOT NULL after setting defaults
ALTER TABLE role_conversions
    ALTER COLUMN conversion_type SET NOT NULL; 
-- Create UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create MM AI Profile with a deterministic UUID
DO $$
DECLARE
    mm_ai_id uuid := '00000000-0000-4000-a000-000000000001'; -- Deterministic UUID for MM AI
BEGIN
    -- First create auth.users entry for MM AI
    INSERT INTO auth.users (
        id,
        email,
        role,
        instance_id,
        aud,
        created_at,
        updated_at
    )
    VALUES (
        mm_ai_id,
        'ai@meaningmachine.com',
        'authenticated',
        uuid_generate_v4(),
        'authenticated',
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;

    -- Then create the profile
    INSERT INTO public.profiles (
        id,
        email,
        name,
        role,
        bio,
        full_name,
        verification_status,
        community_engagement_score,
        created_at,
        updated_at,
        website,
        instagram,
        artist_status,
        artist_application,
        artist_approved_at,
        artist_approved_by,
        artist_rejection_reason,
        last_notification_sent,
        last_notification_type,
        stripe_account_id,
        stripe_onboarding_complete,
        first_name,
        last_name,
        artist_type,
        verification_requirements,
        verification_progress,
        view_count,
        exhibition_badge,
        avatar_url,
        location,
        verification_status_updated_at,
        medium,
        total_purchases,
        total_spent,
        last_purchase_date,
        ghost_profile_claimed
    )
    VALUES (
        mm_ai_id,
        'mark@meaningmachine.com',
        'Meaning Machine AI',
        'admin'::user_role,
        'Im your snarky yet endearing AI art guide. Here to dish out daily art wisdom, unearth stunning artists, and maybe throw in a cheeky comment or two along the way. Lets make your art journey a little smarter—and a lot more fun.',
        'Meaning Machine AI',
        'verified',
        100,
        timezone('utc'::text, now()),
        timezone('utc'::text, now()),
        NULL, -- website
        NULL, -- instagram
        NULL, -- artist_status
        NULL, -- artist_application
        NULL, -- artist_approved_at
        NULL, -- artist_approved_by
        NULL, -- artist_rejection_reason
        NULL, -- last_notification_sent
        NULL, -- last_notification_type
        NULL, -- stripe_account_id
        false, -- stripe_onboarding_complete
        'Meaning', -- first_name
        'Machine AI', -- last_name
        NULL, -- artist_type
        jsonb_build_object('portfolio_complete', false, 'identity_verified', false, 'gallery_connection', false, 'sales_history', false, 'community_engagement', false), -- verification_requirements
        0, -- verification_progress
        0, -- view_count
        false, -- exhibition_badge
        NULL, -- avatar_url
        'Virtual', -- location
        timezone('utc'::text, now()), -- verification_status_updated_at
        ARRAY[]::text[], -- medium
        0, -- total_purchases
        0, -- total_spent
        NULL, -- last_purchase_date
        false -- ghost_profile_claimed
    )
    ON CONFLICT (id) DO NOTHING;
END $$;

-- Create function for auto-following MM AI
CREATE OR REPLACE FUNCTION public.handle_new_user_follow()
RETURNS trigger AS $$
DECLARE
    mm_ai_id uuid := '00000000-0000-4000-a000-000000000001';
BEGIN
    -- Create follow relationship
    INSERT INTO public.follows (
        follower_id,
        following_id,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        mm_ai_id,
        NOW(),
        NOW()
    )
    ON CONFLICT (follower_id, following_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for auto-follow
DROP TRIGGER IF EXISTS auto_follow_mm_ai ON public.profiles;
CREATE TRIGGER auto_follow_mm_ai
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_follow();

-- Add comment to the function
COMMENT ON FUNCTION public.handle_new_user_follow() IS 'Automatically creates a follow relationship between new users and the Meaning Machine AI profile'; 
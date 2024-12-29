-- Clear existing test data
DELETE FROM user_events WHERE created_at >= NOW() - INTERVAL '90 days';
DELETE FROM user_sessions WHERE created_at >= NOW() - INTERVAL '90 days';
DELETE FROM role_conversions WHERE created_at >= NOW() - INTERVAL '90 days';

-- Create test admin user in auth.users (profile will be auto-created by trigger)
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at, last_sign_in_at)
SELECT 
    '00000000-0000-4000-a000-000000000000'::uuid,
    'test@example.com',
    NOW(),
    NOW(),
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE id = '00000000-0000-4000-a000-000000000000'::uuid
);

-- Set the admin role
UPDATE profiles 
SET role = 'admin'::user_role 
WHERE id = '00000000-0000-4000-a000-000000000000'::uuid;

-- Generate test users (profiles will be auto-created by trigger)
WITH RECURSIVE test_users AS (
  SELECT 
    gen_random_uuid() as user_id,
    'analytics_test_user_' || row_number() over () || '_' || floor(random() * 1000000) || '@example.com' as email
  FROM generate_series(1, 100)
)
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at, last_sign_in_at)
SELECT 
    user_id,
    email,
    NOW(),
    NOW(),
    NOW(),
    NOW()
FROM test_users
WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = test_users.email
);

-- Insert user sessions first (since events reference them)
WITH test_users AS (
  SELECT id as user_id FROM profiles WHERE email LIKE 'analytics_test_user_%@example.com'
)
INSERT INTO user_sessions (id, session_id, user_id, started_at, ended_at, metadata, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  encode(gen_random_bytes(16), 'hex'), -- Generate random session ID as text
  user_id,
  session_start,
  CASE 
    WHEN random() < 0.2 THEN NULL -- 20% bounce rate
    ELSE session_start + (random() * INTERVAL '30 minutes')
  END as ended_at,
  jsonb_build_object(
    'user_agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'referrer', CASE floor(random() * 5)::int
      WHEN 0 THEN 'https://google.com'
      WHEN 1 THEN 'https://instagram.com'
      WHEN 2 THEN 'https://facebook.com'
      ELSE NULL
    END
  ),
  session_start,
  session_start
FROM (
  SELECT 
    user_id,
    timezone('utc'::text, NOW() - (random() * INTERVAL '90 days')) as session_start
  FROM test_users
  CROSS JOIN generate_series(1, floor(random() * 5 + 1)::int)
) sessions;

-- Insert page views and other events
WITH test_sessions AS (
  SELECT session_id, user_id FROM user_sessions
)
INSERT INTO user_events (id, user_id, event_type, event_name, event_data, session_id, created_at)
SELECT 
  gen_random_uuid(),
  user_id,
  CASE floor(random() * 3)::int
    WHEN 0 THEN 'page_view'
    WHEN 1 THEN 'interaction'
    ELSE 'system'
  END,
  CASE floor(random() * 3)::int
    WHEN 0 THEN 'view_page'
    WHEN 1 THEN 'click_button'
    ELSE 'system_event'
  END,
  jsonb_build_object(
    'url',
    (
      CASE floor(random() * 10)::int
        WHEN 0 THEN '/'
        WHEN 1 THEN '/gallery'
        WHEN 2 THEN '/artists'
        WHEN 3 THEN '/about'
        WHEN 4 THEN '/artworks/123'
        WHEN 5 THEN '/artists/456'
        WHEN 6 THEN '/contact'
        WHEN 7 THEN '/pricing'
        WHEN 8 THEN '/faq'
        ELSE '/blog'
      END
    )
  ),
  session_id,
  timezone('utc'::text, NOW() - (random() * INTERVAL '90 days'))
FROM test_sessions
CROSS JOIN generate_series(1, floor(random() * 20 + 5)::int);

-- Insert role conversions (with realistic conversion rates)
WITH test_users AS (
  SELECT id as user_id FROM profiles WHERE email LIKE 'analytics_test_user_%@example.com'
)
INSERT INTO role_conversions (id, user_id, conversion_type, from_role, to_role, metadata, created_at)
SELECT 
  gen_random_uuid(),
  user_id,
  CASE WHEN random() < 0.7 
    THEN 'artist_application'
    ELSE 'artist_verification'
  END,
  'user'::user_role,
  CASE WHEN random() < 0.7 
    THEN 'emerging_artist'::user_role
    ELSE 'verified_artist'::user_role
  END,
  jsonb_build_object(
    'application_id', gen_random_uuid(),
    'status', 'approved'
  ),
  timezone('utc'::text, NOW() - (random() * INTERVAL '90 days'))
FROM test_users
WHERE random() < 0.15; -- 15% conversion rate

-- Add some trending data (more recent events)
WITH test_sessions AS (
  SELECT session_id, user_id FROM user_sessions
  WHERE created_at >= NOW() - INTERVAL '7 days'
)
INSERT INTO user_events (id, user_id, event_type, event_name, event_data, session_id, created_at)
SELECT 
  gen_random_uuid(),
  user_id,
  'page_view',
  'view_page',
  jsonb_build_object(
    'url',
    (
      CASE floor(random() * 5)::int
        WHEN 0 THEN '/'
        WHEN 1 THEN '/gallery'
        WHEN 2 THEN '/artists'
        ELSE '/artworks/123'
      END
    )
  ),
  session_id,
  timezone('utc'::text, NOW() - (random() * INTERVAL '7 days'))
FROM test_sessions
CROSS JOIN generate_series(1, floor(random() * 10 + 5)::int)
WHERE random() < 0.7; -- 70% of users have recent activity 
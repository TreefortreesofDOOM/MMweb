-- Update historical analytics data to use new role values
UPDATE user_events
SET event_data = jsonb_set(
  event_data,
  '{role}',
  '"verified_artist"'
)
WHERE event_data->>'role' = 'verified';

UPDATE user_events
SET event_data = jsonb_set(
  event_data,
  '{role}',
  '"emerging_artist"'
)
WHERE event_data->>'role' = 'emerging';

-- Update artist verification events
UPDATE user_events
SET event_data = jsonb_set(
  event_data,
  '{verificationDetails,role}',
  '"verified_artist"'
)
WHERE event_type = 'artist_verification'
AND event_data->'verificationDetails'->>'role' = 'verified';

UPDATE user_events
SET event_data = jsonb_set(
  event_data,
  '{verificationDetails,role}',
  '"emerging_artist"'
)
WHERE event_type = 'artist_verification'
AND event_data->'verificationDetails'->>'role' = 'emerging';

-- Add a comment to track the migration
COMMENT ON TABLE user_events IS 'Updated role values in event_data to match new role system (verified_artist, emerging_artist)'; 
-- Create a function to handle gallery show approval with date updates in a transaction
CREATE OR REPLACE FUNCTION approve_gallery_show(
  p_show_id UUID,
  p_user_id UUID,
  p_start_date TIMESTAMP WITH TIME ZONE,
  p_end_date TIMESTAMP WITH TIME ZONE
) RETURNS SETOF gallery_shows
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Start transaction
  BEGIN
    -- Update show status
    UPDATE gallery_shows
    SET 
      status = 'approved',
      approved_at = NOW(),
      approved_by = p_user_id
    WHERE id = p_show_id;

    -- Insert dates as unavailable for the show duration
    WITH RECURSIVE dates AS (
      SELECT p_start_date::date AS date
      UNION ALL
      SELECT (date + interval '1 day')::date
      FROM dates
      WHERE date < p_end_date::date
    )
    INSERT INTO gallery_dates (date, is_available, updated_at, updated_by)
    SELECT 
      date,
      false AS is_available,
      NOW() AS updated_at,
      p_user_id AS updated_by
    FROM dates
    ON CONFLICT (date) DO UPDATE
    SET 
      is_available = false,
      updated_at = NOW(),
      updated_by = p_user_id;

    -- Return the updated show
    RETURN QUERY
    SELECT *
    FROM gallery_shows
    WHERE id = p_show_id;

    -- Commit transaction
    COMMIT;
  EXCEPTION WHEN OTHERS THEN
    -- Rollback transaction on error
    ROLLBACK;
    RAISE;
  END;
END;
$$;

-- Add RLS policies for the function
ALTER FUNCTION approve_gallery_show(UUID, UUID, TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE) SET SEARCH_PATH = public; 
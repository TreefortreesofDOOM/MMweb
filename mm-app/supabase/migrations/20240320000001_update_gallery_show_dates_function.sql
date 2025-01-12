-- Create a function to handle gallery show date updates with proper date management
CREATE OR REPLACE FUNCTION update_gallery_show_dates(
  p_show_id UUID,
  p_user_id UUID,
  p_start_date TIMESTAMP WITH TIME ZONE,
  p_end_date TIMESTAMP WITH TIME ZONE
) RETURNS SETOF gallery_shows
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_old_start_date TIMESTAMP WITH TIME ZONE;
  v_old_end_date TIMESTAMP WITH TIME ZONE;
  v_show_status TEXT;
BEGIN
  -- Get the current show details
  SELECT start_date, end_date, status
  INTO v_old_start_date, v_old_end_date, v_show_status
  FROM gallery_shows
  WHERE id = p_show_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Show not found';
  END IF;

  -- Only handle date updates for approved shows
  IF v_show_status = 'approved' THEN
    -- Check for date conflicts with other approved shows
    IF EXISTS (
      SELECT 1
      FROM gallery_shows
      WHERE status = 'approved'
        AND id != p_show_id
        AND (
          (start_date, end_date) OVERLAPS (p_start_date, p_end_date)
        )
    ) THEN
      RAISE EXCEPTION 'Show dates conflict with existing approved shows';
    END IF;

    -- Start transaction
    BEGIN
      -- Update show dates
      UPDATE gallery_shows
      SET 
        start_date = p_start_date,
        end_date = p_end_date,
        updated_at = NOW()
      WHERE id = p_show_id;

      -- Free up old dates
      WITH RECURSIVE old_dates AS (
        SELECT v_old_start_date::date AS date
        UNION ALL
        SELECT (date + interval '1 day')::date
        FROM old_dates
        WHERE date < v_old_end_date::date
      )
      UPDATE gallery_dates
      SET 
        is_available = true,
        updated_at = NOW(),
        updated_by = p_user_id
      FROM old_dates
      WHERE gallery_dates.date = old_dates.date;

      -- Block new dates
      WITH RECURSIVE new_dates AS (
        SELECT p_start_date::date AS date
        UNION ALL
        SELECT (date + interval '1 day')::date
        FROM new_dates
        WHERE date < p_end_date::date
      )
      INSERT INTO gallery_dates (date, is_available, updated_at, updated_by)
      SELECT 
        date,
        false AS is_available,
        NOW() AS updated_at,
        p_user_id AS updated_by
      FROM new_dates
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
  ELSE
    -- For non-approved shows, just update the dates without managing gallery_dates
    UPDATE gallery_shows
    SET 
      start_date = p_start_date,
      end_date = p_end_date,
      updated_at = NOW()
    WHERE id = p_show_id;

    RETURN QUERY
    SELECT *
    FROM gallery_shows
    WHERE id = p_show_id;
  END IF;
END;
$$;

-- Add RLS policies for the function
ALTER FUNCTION update_gallery_show_dates(UUID, UUID, TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE) SET SEARCH_PATH = public; 
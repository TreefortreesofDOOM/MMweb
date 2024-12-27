-- Add new columns
ALTER TABLE profiles
ADD COLUMN first_name text,
ADD COLUMN last_name text;

-- Create a function to split name
CREATE OR REPLACE FUNCTION split_full_name(name text)
RETURNS TABLE(first_name text, last_name text) AS $$
DECLARE
    name_parts text[];
BEGIN
    -- Handle NULL or empty string
    IF name IS NULL OR name = '' THEN
        RETURN QUERY SELECT NULL::text, NULL::text;
        RETURN;
    END IF;
    
    -- Split the name into parts
    name_parts := regexp_split_to_array(trim(name), '\s+');
    
    -- If only one part, it's the first name
    IF array_length(name_parts, 1) = 1 THEN
        RETURN QUERY SELECT name_parts[1], NULL::text;
        RETURN;
    END IF;
    
    -- Last element is last name, everything else is first name
    RETURN QUERY SELECT 
        array_to_string(name_parts[1:array_length(name_parts, 1)-1], ' '),
        name_parts[array_length(name_parts, 1)];
END;
$$ LANGUAGE plpgsql;

-- Migrate existing data
UPDATE profiles
SET 
    first_name = split.first_name,
    last_name = split.last_name
FROM (
    SELECT id, (split_name(name)).*
    FROM profiles
) AS split
WHERE profiles.id = split.id;

-- Add a trigger to keep names in sync
CREATE OR REPLACE FUNCTION sync_name()
RETURNS TRIGGER AS $$
BEGIN
    -- When first_name or last_name is updated
    IF TG_OP = 'UPDATE' THEN
        -- Construct name from parts
        NEW.name := TRIM(COALESCE(NEW.first_name, '') || ' ' || COALESCE(NEW.last_name, ''));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_name_trigger
BEFORE UPDATE ON profiles
FOR EACH ROW
WHEN (
    NEW.first_name IS DISTINCT FROM OLD.first_name OR 
    NEW.last_name IS DISTINCT FROM OLD.last_name
)
EXECUTE FUNCTION sync_name();

-- Add a comment explaining the fields
COMMENT ON COLUMN profiles.first_name IS 'The user''s first name and any middle names';
COMMENT ON COLUMN profiles.last_name IS 'The user''s last name/surname';

-- Don't drop the name column yet, keep it for backward compatibility
-- We can remove it in a future migration after ensuring all code is updated 
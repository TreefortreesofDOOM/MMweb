-- First transaction: Add the new enum value
BEGIN;

-- Check if the new role value already exists to avoid errors
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type 
    WHERE typname = 'user_role' 
    AND typarray = 'user_role[]'::regtype::oid
  ) THEN
    RAISE EXCEPTION 'user_role enum type does not exist';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumtypid = 'user_role'::regtype::oid 
    AND enumlabel = 'patron'
  ) THEN
    ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'patron';
  END IF;
END $$;

COMMIT; 
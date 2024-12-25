-- Add notification tracking fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS last_notification_sent TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_notification_type TEXT;

-- Create the send_email function that will be called by our application
-- Note: This is now just a wrapper that will log the email request
-- The actual email sending will be handled by Supabase's Email service
CREATE OR REPLACE FUNCTION public.send_email(
  recipient text,
  subject text,
  content text,
  sender text DEFAULT 'noreply@meaningmachine.com'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log the email request
  RAISE NOTICE 'Email request - To: %, Subject: %, From: %', recipient, subject, sender;
  
  -- In production, emails will be sent through Supabase's Email service
  -- This function now just serves as a logging wrapper
  RETURN json_build_object('success', true);
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error processing email request: %', SQLERRM;
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;
-- Create partial_registrations table
CREATE TABLE IF NOT EXISTS public.partial_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now() + interval '24 hours') NOT NULL
);

-- Add RLS
ALTER TABLE public.partial_registrations ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting new partial registrations
CREATE POLICY "Anyone can create partial registrations"
ON public.partial_registrations FOR INSERT
TO public
WITH CHECK (true);

-- Create policy for updating partial registrations
CREATE POLICY "Users can update their own partial registrations"
ON public.partial_registrations FOR UPDATE
TO public
USING (email = current_user)
WITH CHECK (email = current_user);

-- Create policy for selecting partial registrations
CREATE POLICY "Users can view their own partial registrations"
ON public.partial_registrations FOR SELECT
TO public
USING (email = current_user);

-- Create policy for deleting partial registrations
CREATE POLICY "Users can delete their own partial registrations"
ON public.partial_registrations FOR DELETE
TO public
USING (email = current_user);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_partial_registrations_email ON public.partial_registrations(email);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_partial_registrations_updated_at
    BEFORE UPDATE ON public.partial_registrations
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create function to clean up expired partial registrations
CREATE OR REPLACE FUNCTION public.cleanup_expired_registrations()
RETURNS void AS $$
BEGIN
    DELETE FROM public.partial_registrations
    WHERE expires_at < timezone('utc'::text, now());
END;
$$ language 'plpgsql';

-- Add pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;
-- Create a scheduled job to clean up expired registrations (runs every hour)
select
  cron.schedule (
    'cleanup-expired-registrations',
    '0 * * * *', -- Every hour
    'SELECT public.cleanup_expired_registrations();'
  );


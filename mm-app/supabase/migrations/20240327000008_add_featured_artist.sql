-- Create the featured_artist table
CREATE TABLE IF NOT EXISTS public.featured_artist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES public.profiles(id),
    active BOOLEAN DEFAULT true,
    CONSTRAINT single_active_featured_artist EXCLUDE USING btree (active WITH =) WHERE (active = true)
);

-- Add RLS policies
ALTER TABLE public.featured_artist ENABLE ROW LEVEL SECURITY;

-- Allow admins to manage featured artists
CREATE POLICY "Allow admins to manage featured artists" ON public.featured_artist
    FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'::user_role
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'::user_role
    ));

-- Allow public to view featured artists
CREATE POLICY "Allow public to view featured artists" ON public.featured_artist
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Create function to update featured artist
CREATE OR REPLACE FUNCTION public.set_featured_artist(artist_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_featured_id uuid;
BEGIN
    -- Check if user is admin
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'admin'::user_role
    ) THEN
        RAISE EXCEPTION 'Only admins can set featured artists';
    END IF;

    -- Deactivate current featured artist if exists
    UPDATE public.featured_artist
    SET active = false
    WHERE active = true;

    -- Insert new featured artist
    INSERT INTO public.featured_artist (artist_id, created_by)
    VALUES (artist_id, auth.uid())
    RETURNING id INTO new_featured_id;

    RETURN new_featured_id;
END;
$$; 
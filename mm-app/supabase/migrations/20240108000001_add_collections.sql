-- Create collections table
CREATE TABLE IF NOT EXISTS public.collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patron_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_private BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    CONSTRAINT unique_collection_name UNIQUE (patron_id, name)
);

-- Create collection items table
CREATE TABLE IF NOT EXISTS public.collection_items (
    collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE,
    artwork_id UUID REFERENCES public.artworks(id) ON DELETE CASCADE,
    notes TEXT,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (collection_id, artwork_id)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_collections_patron_id ON public.collections(patron_id);
CREATE INDEX IF NOT EXISTS idx_collections_created_at ON public.collections(created_at);
CREATE INDEX IF NOT EXISTS idx_collection_items_artwork_id ON public.collection_items(artwork_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_added_at ON public.collection_items(added_at);

-- Enable RLS
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;

-- Collection RLS policies
CREATE POLICY "Users can view their own collections"
    ON public.collections
    FOR SELECT
    USING (
        patron_id = auth.uid() OR
        (NOT is_private AND patron_id IN (
            SELECT id FROM public.profiles
            WHERE role = 'patron'
        ))
    );

CREATE POLICY "Users can insert their own collections"
    ON public.collections
    FOR INSERT
    WITH CHECK (patron_id = auth.uid());

CREATE POLICY "Users can update their own collections"
    ON public.collections
    FOR UPDATE
    USING (patron_id = auth.uid())
    WITH CHECK (patron_id = auth.uid());

CREATE POLICY "Users can delete their own collections"
    ON public.collections
    FOR DELETE
    USING (patron_id = auth.uid());

-- Collection items RLS policies
CREATE POLICY "Users can view collection items"
    ON public.collection_items
    FOR SELECT
    USING (
        collection_id IN (
            SELECT id FROM public.collections
            WHERE patron_id = auth.uid() OR
                  (NOT is_private AND patron_id IN (
                      SELECT id FROM public.profiles
                      WHERE role = 'patron'
                  ))
        )
    );

CREATE POLICY "Users can manage their collection items"
    ON public.collection_items
    FOR ALL
    USING (
        collection_id IN (
            SELECT id FROM public.collections
            WHERE patron_id = auth.uid()
        )
    )
    WITH CHECK (
        collection_id IN (
            SELECT id FROM public.collections
            WHERE patron_id = auth.uid()
        )
    );

-- Add trigger for updated_at
CREATE TRIGGER handle_collections_updated_at
    BEFORE UPDATE ON public.collections
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at(); 
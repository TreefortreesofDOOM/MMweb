-- Add specific update policy for gallery dates
DROP POLICY IF EXISTS admin_dates_update ON gallery_dates;
CREATE POLICY admin_dates_update ON gallery_dates 
    FOR UPDATE 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    ) 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Add specific insert policy for gallery dates
DROP POLICY IF EXISTS admin_dates_insert ON gallery_dates;
CREATE POLICY admin_dates_insert ON gallery_dates 
    FOR INSERT 
    TO authenticated 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    ); 
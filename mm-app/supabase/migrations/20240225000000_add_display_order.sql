-- Add display_order column to artworks table
alter table artworks 
add column if not exists display_order integer;

-- Create an index on display_order for faster ordering queries
create index if not exists artworks_display_order_idx 
on artworks(artist_id, display_order); 
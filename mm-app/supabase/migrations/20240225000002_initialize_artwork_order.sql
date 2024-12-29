-- Initialize display_order for existing artworks
-- This will set display_order based on created_at timestamp
with ordered_artworks as (
  select 
    id,
    artist_id,
    row_number() over (partition by artist_id order by created_at) - 1 as new_order
  from artworks
  where display_order is null
)
update artworks a
set display_order = oa.new_order
from ordered_artworks oa
where a.id = oa.id; 
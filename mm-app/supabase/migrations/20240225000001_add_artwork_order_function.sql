-- Create a function to update artwork order in a transaction
create or replace function update_artwork_order(p_artwork_ids uuid[], p_artist_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  -- Update the order of each artwork
  for i in 1..array_length(p_artwork_ids, 1)
  loop
    update artworks
    set display_order = i - 1
    where id = p_artwork_ids[i]
    and artist_id = p_artist_id;
  end loop;
end;
$$; 
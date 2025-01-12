-- Add payment_link and inventory tracking to store_products
alter table store_products 
  add column payment_link text,
  add column stripe_product_metadata jsonb,
  add column inventory_status text generated always as (
    case 
      when stripe_product_metadata->>'inventory_status' = 'out_of_stock' then 'sold_out'
      else 'available'
    end
  ) stored;

-- Add index for faster inventory status lookups
create index idx_store_products_inventory_status on store_products(inventory_status);

-- Update the create_store_product function
create or replace function create_store_product(
  _profile_id uuid,
  _artwork_id uuid,
  _stripe_product_id text,
  _stripe_price_id text,
  _payment_link text,
  _stripe_product_metadata jsonb,
  _is_variable_price boolean default false,
  _min_price decimal default null
) returns store_products as $$
declare
  _product store_products;
begin
  -- Verify the artwork belongs to the artist
  if not exists (
    select 1 from artworks
    where id = _artwork_id
    and artist_id = _profile_id
  ) then
    raise exception 'Artwork does not belong to artist';
  end if;

  insert into store_products (
    profile_id,
    artwork_id,
    stripe_product_id,
    stripe_price_id,
    payment_link,
    stripe_product_metadata,
    is_variable_price,
    min_price
  )
  values (
    _profile_id,
    _artwork_id,
    _stripe_product_id,
    _stripe_price_id,
    _payment_link,
    _stripe_product_metadata,
    _is_variable_price,
    _min_price
  )
  returning * into _product;

  return _product;
end;
$$ language plpgsql security definer; 
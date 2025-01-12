-- Enable required extensions
create extension if not exists "uuid-ossp";

-- Create store_products table
create table store_products (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete cascade,
  artwork_id uuid references artworks(id) on delete cascade,
  stripe_product_id text unique,
  stripe_price_id text,
  is_variable_price boolean default false,
  min_price decimal,
  status text not null default 'draft',
  metadata jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create store_settings table
create table store_settings (
  profile_id uuid primary key references profiles(id) on delete cascade,
  stripe_account_id text unique,
  is_stripe_enabled boolean default false,
  application_fee_percent decimal not null default 50.0,
  metadata jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Add updated_at trigger to store_products
create trigger handle_updated_at before update on store_products
  for each row execute procedure moddatetime (updated_at);

-- Add updated_at trigger to store_settings
create trigger handle_updated_at before update on store_settings
  for each row execute procedure moddatetime (updated_at);

-- Create helper function to create store products
create or replace function create_store_product(
  _profile_id uuid,
  _artwork_id uuid,
  _stripe_product_id text,
  _stripe_price_id text,
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
    is_variable_price,
    min_price
  )
  values (
    _profile_id,
    _artwork_id,
    _stripe_product_id,
    _stripe_price_id,
    _is_variable_price,
    _min_price
  )
  returning * into _product;

  return _product;
end;
$$ language plpgsql security definer;

-- Enable RLS
alter table store_products enable row level security;
alter table store_settings enable row level security;

-- Create RLS policies for store_products
create policy "Anyone can view products"
  on store_products for select
  using (true);

create policy "Verified artists can manage their own products"
  on store_products for all
  using (
    auth.uid() = profile_id
    and exists (
      select 1 from profile_roles
      where profile_id = auth.uid()
      and role_name = 'verified_artist'
    )
  );

create policy "Admins can manage all products"
  on store_products for all
  using (
    exists (
      select 1 from profile_roles
      where profile_id = auth.uid()
      and role_name = 'admin'
    )
  );

-- Create RLS policies for store_settings
create policy "Users can view their own store settings"
  on store_settings for select
  using (auth.uid() = profile_id);

create policy "Verified artists can manage their store settings"
  on store_settings for all
  using (
    auth.uid() = profile_id
    and exists (
      select 1 from profile_roles
      where profile_id = auth.uid()
      and role_name = 'verified_artist'
    )
  );

create policy "Admins can manage all store settings"
  on store_settings for all
  using (
    exists (
      select 1 from profile_roles
      where profile_id = auth.uid()
      and role_name = 'admin'
    )
  ); 
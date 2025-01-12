-- Create store orders table
create table store_orders (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references store_products(id) on delete restrict,
  ghost_profile_id uuid references ghost_profiles(id) on delete restrict,
  amount_total decimal not null,
  artist_amount decimal not null,
  status text not null default 'pending',
  stripe_session_id text unique,
  stripe_payment_intent text unique,
  shipping_details jsonb,
  customer_details jsonb,
  metadata jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create store transfers table for variable price products
create table store_transfers (
  id uuid primary key default uuid_generate_v4(),
  artist_id uuid references profiles(id) on delete restrict,
  order_id uuid references store_orders(id) on delete restrict,
  amount decimal not null,
  status text not null default 'pending',
  stripe_session_id text,
  stripe_transfer_id text unique,
  metadata jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Add updated_at triggers
create trigger handle_updated_at before update on store_orders
  for each row execute procedure moddatetime (updated_at);

create trigger handle_updated_at before update on store_transfers
  for each row execute procedure moddatetime (updated_at);

-- Add RLS policies
alter table store_orders enable row level security;
alter table store_transfers enable row level security;

-- Allow admins to view all orders
create policy "Admins can view all orders"
  on store_orders
  for select
  using (
    exists (
      select 1 from profile_roles
      where id = auth.uid()
      and mapped_role = 'admin'
    )
  );

-- Allow artists to view their own orders
create policy "Artists can view their own orders"
  on store_orders
  for select
  using (
    exists (
      select 1 from store_products
      where store_products.id = store_orders.product_id
      and store_products.profile_id = auth.uid()
    )
  );

-- Allow admins to manage transfers
create policy "Admins can manage transfers"
  on store_transfers
  for all
  using (
    exists (
      select 1 from profile_roles
      where id = auth.uid()
      and mapped_role = 'admin'
    )
  );

-- Allow artists to view their transfers
create policy "Artists can view their transfers"
  on store_transfers
  for select
  using (
    artist_id = auth.uid()
  ); 
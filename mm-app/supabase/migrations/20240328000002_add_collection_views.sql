-- Create collection_views table
create table if not exists public.collection_views (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.collections(id) on delete cascade,
  viewer_id uuid references auth.users(id) on delete set null,
  source text not null default 'direct',
  referrer text,
  viewed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Add indexes for performance
create index if not exists collection_views_collection_id_idx on public.collection_views(collection_id);
create index if not exists collection_views_viewer_id_idx on public.collection_views(viewer_id);
create index if not exists collection_views_viewed_at_idx on public.collection_views(viewed_at);

-- Add RLS policies
alter table public.collection_views enable row level security;

-- Allow anyone to insert views
create policy "Anyone can insert collection views"
  on public.collection_views
  for insert
  with check (true);

-- Only collection owners can view analytics
create policy "Collection owners can view analytics"
  on public.collection_views
  for select
  using (
    exists (
      select 1 from public.collections c
      where c.id = collection_views.collection_id
      and c.user_id = auth.uid()
    )
  ); 
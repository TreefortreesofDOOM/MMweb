-- Create gallery_visits table
create table if not exists public.gallery_visits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id),
  scanned_by uuid not null references public.profiles(id),
  visit_type text not null check (visit_type in ('physical', 'virtual')),
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table public.gallery_visits enable row level security;

-- Allow users to view their own visits and visits they've scanned
create policy "Users can view their own visits and visits they've scanned"
  on public.gallery_visits for select
  using (
    auth.uid() = user_id or
    auth.uid() = scanned_by
  );

-- Allow authenticated users to create visits
create policy "Authenticated users can create visits"
  on public.gallery_visits for insert
  with check (auth.role() = 'authenticated');

-- Add indexes
create index if not exists gallery_visits_user_id_idx on public.gallery_visits(user_id);
create index if not exists gallery_visits_scanned_by_idx on public.gallery_visits(scanned_by);
create index if not exists gallery_visits_created_at_idx on public.gallery_visits(created_at);

-- Add trigger to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger handle_gallery_visits_updated_at
  before update on public.gallery_visits
  for each row
  execute procedure public.handle_updated_at(); 
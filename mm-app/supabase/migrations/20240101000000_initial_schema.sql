-- Create extensions
create extension if not exists "moddatetime" schema extensions;

-- Create custom types
create type public.user_role as enum (
  'user',
  'artist',
  'admin'
);

create type public.artist_application_status as enum (
  'draft',
  'pending',
  'approved',
  'rejected'
);

-- Create profiles table
create table public.profiles (
  -- Identity and references
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  
  -- Basic profile fields
  name text,
  bio text,
  website text,
  instagram text,
  
  -- Role and artist management
  role user_role default 'user'::user_role,
  artist_status artist_application_status,
  artist_application jsonb,
  artist_approved_at timestamp with time zone,
  artist_approved_by uuid references auth.users,
  artist_rejection_reason text,
  
  -- Timestamps
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Create policies
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using ( true );

create policy "Users can update own profile"
  on public.profiles for update
  using ( auth.uid() = id );

create policy "Only admins can update roles"
  on public.profiles for update
  using (
    auth.uid() in (
      select id from public.profiles
      where role = 'admin'
    )
  )
  with check (
    auth.uid() in (
      select id from public.profiles
      where role = 'admin'
    )
  );

-- Create profile trigger function
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

-- Create trigger for new user profiles
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create updated_at trigger
create trigger handle_updated_at
  before update on public.profiles
  for each row
  execute procedure moddatetime (updated_at);

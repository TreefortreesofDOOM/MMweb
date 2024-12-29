-- Create user_sessions table for session tracking
create table if not exists public.user_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id),
  session_id text not null UNIQUE,
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  ended_at timestamp with time zone,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user_events table for event tracking
create table if not exists public.user_events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id),
  session_id text references public.user_sessions(session_id),
  event_type text not null,
  event_name text not null,
  event_data jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create feature_usage table for tracking feature adoption
create table if not exists public.feature_usage (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id),
  feature_name text not null,
  usage_count integer default 0,
  last_used_at timestamp with time zone,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, feature_name)
);

-- Create role_conversions table for tracking role changes
create table if not exists public.role_conversions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id),
  from_role public.user_role,
  to_role public.user_role,
  conversion_type text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add indexes for performance
create index if not exists user_sessions_user_id_idx on public.user_sessions(user_id);
create index if not exists user_sessions_started_at_idx on public.user_sessions(started_at);
create index if not exists user_sessions_session_id_idx on public.user_sessions(session_id);
create index if not exists user_events_user_id_idx on public.user_events(user_id);
create index if not exists user_events_session_id_idx on public.user_events(session_id);
create index if not exists user_events_event_type_idx on public.user_events(event_type);
create index if not exists user_events_created_at_idx on public.user_events(created_at);
create index if not exists feature_usage_user_id_idx on public.feature_usage(user_id);
create index if not exists feature_usage_feature_name_idx on public.feature_usage(feature_name);
create index if not exists role_conversions_user_id_idx on public.role_conversions(user_id);
create index if not exists role_conversions_created_at_idx on public.role_conversions(created_at);

-- Enable RLS on analytics tables
alter table public.user_sessions enable row level security;
alter table public.user_events enable row level security;
alter table public.feature_usage enable row level security;
alter table public.role_conversions enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can create their own sessions" on public.user_sessions;
drop policy if exists "Users can view their own sessions" on public.user_sessions;
drop policy if exists "Users can update their own sessions" on public.user_sessions;
drop policy if exists "Users can create their own events" on public.user_events;
drop policy if exists "Users can view their own events" on public.user_events;
drop policy if exists "Users can create and update their own feature usage" on public.feature_usage;
drop policy if exists "Users can view their own role conversions" on public.role_conversions;
drop policy if exists "System can manage role conversions" on public.role_conversions;

-- RLS policies for user_sessions
create policy "Users can create their own sessions"
  on public.user_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own sessions"
  on public.user_sessions for select
  using (auth.uid() = user_id);

create policy "Users can update their own sessions"
  on public.user_sessions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- RLS policies for user_events
create policy "Users can create their own events"
  on public.user_events for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own events"
  on public.user_events for select
  using (auth.uid() = user_id);

-- RLS policies for feature_usage
create policy "Users can create and update their own feature usage"
  on public.feature_usage for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- RLS policies for role_conversions
create policy "Users can view their own role conversions"
  on public.role_conversions for select
  using (auth.uid() = user_id);

create policy "System can manage role conversions"
  on public.role_conversions for all
  using (auth.uid() in (
    select id from public.profiles where role = 'admin'
  ));

-- Drop existing triggers if they exist
drop trigger if exists handle_user_sessions_updated_at on public.user_sessions;
drop trigger if exists handle_feature_usage_updated_at on public.feature_usage;

-- Add triggers for updated_at
create trigger handle_user_sessions_updated_at
  before update on public.user_sessions
  for each row
  execute procedure public.handle_updated_at();

create trigger handle_feature_usage_updated_at
  before update on public.feature_usage
  for each row
  execute procedure public.handle_updated_at(); 
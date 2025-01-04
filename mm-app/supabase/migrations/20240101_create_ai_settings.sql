-- Create AI settings table
create table if not exists ai_settings (
  id uuid primary key default uuid_generate_v4(),
  primary_provider text not null check (primary_provider in ('chatgpt', 'gemini')),
  fallback_provider text check (fallback_provider in ('chatgpt', 'gemini')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Only allow one active settings row
create unique index if not exists ai_settings_singleton on ai_settings ((true));

-- Add trigger to update updated_at timestamp
create or replace function update_ai_settings_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger ai_settings_updated_at
  before update on ai_settings
  for each row
  execute function update_ai_settings_updated_at();

-- Insert default settings if table is empty
insert into ai_settings (primary_provider)
select 'chatgpt'
where not exists (select 1 from ai_settings);

-- Enable Row Level Security
alter table ai_settings enable row level security;

-- Create policies
create policy "Allow read access to all authenticated users"
  on ai_settings
  for select
  to authenticated
  using (true);

create policy "Allow admin users to update settings"
  on ai_settings
  for all
  to authenticated
  using (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin'); 
-- Enable pgvector extension if not already enabled
create extension if not exists vector;

-- Create chat_history table
create table public.chat_history (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    assistant_type text not null check (assistant_type in ('gallery', 'artist', 'patron')),
    message text not null,
    response text not null,
    artwork_id uuid references public.artworks(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    metadata jsonb default '{}'::jsonb,
    context jsonb default '{}'::jsonb,
    message_embedding vector(1536),
    response_embedding vector(1536)
);

-- Create basic indexes
create index chat_history_user_id_idx on public.chat_history(user_id);
create index chat_history_artwork_id_idx on public.chat_history(artwork_id);
create index chat_history_created_at_idx on public.chat_history(created_at);

-- Create vector indexes with appropriate parameters for our use case
create index chat_history_message_embedding_idx on public.chat_history 
using ivfflat (message_embedding vector_cosine_ops)
with (lists = 100);

create index chat_history_response_embedding_idx on public.chat_history 
using ivfflat (response_embedding vector_cosine_ops)
with (lists = 100);

-- Function to find similar conversations
create or replace function public.find_similar_conversations(
    p_user_id uuid,
    p_query text,
    p_embedding vector(1536),
    p_match_count int default 5,
    p_match_threshold float default 0.8
)
returns table (
    id uuid,
    message text,
    response text,
    similarity float
)
language sql
security definer
set search_path = public
stable
as $$
    select 
        id,
        message,
        response,
        1 - (message_embedding <=> p_embedding) as similarity
    from chat_history
    where user_id = p_user_id 
    and 1 - (message_embedding <=> p_embedding) > p_match_threshold
    order by message_embedding <=> p_embedding
    limit p_match_count;
$$;

-- Function to find conversations about specific artwork
create or replace function public.find_artwork_conversations(
    p_user_id uuid,
    p_artwork_id uuid,
    p_match_count int default 5
)
returns table (
    id uuid,
    message text,
    response text,
    created_at timestamptz,
    metadata jsonb,
    context jsonb
)
language sql
security definer
set search_path = public
stable
as $$
    select 
        id,
        message,
        response,
        created_at,
        metadata,
        context
    from chat_history
    where user_id = p_user_id
    and artwork_id = p_artwork_id
    order by created_at desc
    limit p_match_count;
$$;

-- Grant access to service role
grant all on table public.chat_history to service_role;
grant all on function public.find_similar_conversations to service_role;
grant all on function public.find_artwork_conversations to service_role; 
-- Game-World: Direct messaging system

-- A DM conversation between 2+ users
create table if not exists public.dm_conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

-- Participants in a DM conversation
create table if not exists public.dm_participants (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.dm_conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique (conversation_id, user_id)
);

-- Messages within a DM conversation
create table if not exists public.dm_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.dm_conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now()
);

-- RLS for dm_conversations
alter table public.dm_conversations enable row level security;

create policy "dm_conversations_select_participant" on public.dm_conversations
  for select using (
    exists (
      select 1 from public.dm_participants
      where dm_participants.conversation_id = dm_conversations.id
        and dm_participants.user_id = auth.uid()
    )
  );

create policy "dm_conversations_insert_auth" on public.dm_conversations
  for insert with check (auth.uid() is not null);

-- RLS for dm_participants
alter table public.dm_participants enable row level security;

create policy "dm_participants_select_own" on public.dm_participants
  for select using (
    exists (
      select 1 from public.dm_participants as dp
      where dp.conversation_id = dm_participants.conversation_id
        and dp.user_id = auth.uid()
    )
  );

create policy "dm_participants_insert_auth" on public.dm_participants
  for insert with check (auth.uid() is not null);

-- RLS for dm_messages
alter table public.dm_messages enable row level security;

create policy "dm_messages_select_participant" on public.dm_messages
  for select using (
    exists (
      select 1 from public.dm_participants
      where dm_participants.conversation_id = dm_messages.conversation_id
        and dm_participants.user_id = auth.uid()
    )
  );

create policy "dm_messages_insert_participant" on public.dm_messages
  for insert with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.dm_participants
      where dm_participants.conversation_id = dm_messages.conversation_id
        and dm_participants.user_id = auth.uid()
    )
  );

create policy "dm_messages_delete_own" on public.dm_messages
  for delete using (auth.uid() = sender_id);

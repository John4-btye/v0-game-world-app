-- Game-World: Channel messages

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.channels(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.messages enable row level security;

-- Any authenticated user can read messages (community membership enforced at app level)
create policy "messages_select_auth" on public.messages
  for select using (auth.uid() is not null);

-- Authenticated users can send messages
create policy "messages_insert_auth" on public.messages
  for insert with check (auth.uid() = sender_id);

-- Senders can edit their own messages
create policy "messages_update_own" on public.messages
  for update using (auth.uid() = sender_id);

-- Senders can delete (soft) their own messages
create policy "messages_delete_own" on public.messages
  for delete using (auth.uid() = sender_id);

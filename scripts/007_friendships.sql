-- Game-World: Friendships system

create type public.friendship_status as enum ('pending', 'accepted', 'blocked');

create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  addressee_id uuid not null references public.profiles(id) on delete cascade,
  status public.friendship_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (requester_id, addressee_id)
);

alter table public.friendships enable row level security;

-- Users can see their own friendships (sent or received)
create policy "friendships_select_own" on public.friendships
  for select using (
    auth.uid() = requester_id or auth.uid() = addressee_id
  );

-- Users can send friend requests
create policy "friendships_insert_requester" on public.friendships
  for insert with check (auth.uid() = requester_id);

-- Either party can update the friendship (accept/block)
create policy "friendships_update_own" on public.friendships
  for update using (
    auth.uid() = requester_id or auth.uid() = addressee_id
  );

-- Either party can delete (unfriend)
create policy "friendships_delete_own" on public.friendships
  for delete using (
    auth.uid() = requester_id or auth.uid() = addressee_id
  );

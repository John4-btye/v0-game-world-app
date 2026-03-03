-- Game-World: Community members table

create type public.member_role as enum ('owner', 'admin', 'moderator', 'member');

create table if not exists public.community_members (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.member_role not null default 'member',
  joined_at timestamptz not null default now(),
  unique (community_id, user_id)
);

alter table public.community_members enable row level security;

-- Members can see who else is in their communities
create policy "members_select_community" on public.community_members
  for select using (auth.uid() is not null);

-- Users can join communities (insert themselves)
create policy "members_insert_self" on public.community_members
  for insert with check (auth.uid() = user_id);

-- Users can leave communities (delete themselves)
create policy "members_delete_self" on public.community_members
  for delete using (auth.uid() = user_id);

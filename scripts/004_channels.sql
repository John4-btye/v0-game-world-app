-- Game-World: Channels table (within communities)

create type public.channel_type as enum ('text', 'voice', 'announcement');

create table if not exists public.channels (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities(id) on delete cascade,
  name text not null,
  description text,
  type public.channel_type not null default 'text',
  position int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.channels enable row level security;

-- Channels readable by any authenticated user (community membership check can be enforced at app level)
create policy "channels_select_auth" on public.channels
  for select using (auth.uid() is not null);

-- Only community owner/admin can manage channels (enforced via community_members role at app level)
-- For now, allow the community creator to insert
create policy "channels_insert_auth" on public.channels
  for insert with check (
    exists (
      select 1 from public.community_members
      where community_members.community_id = channels.community_id
        and community_members.user_id = auth.uid()
        and community_members.role in ('owner', 'admin')
    )
  );

create policy "channels_update_admin" on public.channels
  for update using (
    exists (
      select 1 from public.community_members
      where community_members.community_id = channels.community_id
        and community_members.user_id = auth.uid()
        and community_members.role in ('owner', 'admin')
    )
  );

create policy "channels_delete_admin" on public.channels
  for delete using (
    exists (
      select 1 from public.community_members
      where community_members.community_id = channels.community_id
        and community_members.user_id = auth.uid()
        and community_members.role in ('owner', 'admin')
    )
  );

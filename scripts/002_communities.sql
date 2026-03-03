-- Game-World: Communities table

create table if not exists public.communities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  icon_url text,
  banner_url text,
  category text not null default 'general',
  is_nsfw boolean not null default false,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.communities enable row level security;

-- Any authenticated user can browse communities
create policy "communities_select_all" on public.communities
  for select using (auth.uid() is not null);

-- Authenticated users can create communities
create policy "communities_insert_auth" on public.communities
  for insert with check (auth.uid() = created_by);

-- Only the creator can update their community
create policy "communities_update_owner" on public.communities
  for update using (auth.uid() = created_by);

-- Only the creator can delete their community
create policy "communities_delete_owner" on public.communities
  for delete using (auth.uid() = created_by);

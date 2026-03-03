-- Game-World: Profiles table
-- Extends auth.users with public profile data

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  avatar_url text,
  bio text,
  date_of_birth date,
  is_over_16 boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Anyone authenticated can read profiles
create policy "profiles_select_all" on public.profiles
  for select using (auth.uid() is not null);

-- Users can only insert their own profile
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- Users can only update their own profile
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Users can only delete their own profile
create policy "profiles_delete_own" on public.profiles
  for delete using (auth.uid() = id);

-- Auto-create profile on auth.users insert
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'user_name', new.raw_user_meta_data ->> 'name', null),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', null),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', null)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

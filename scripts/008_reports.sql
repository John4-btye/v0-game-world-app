-- Game-World: Report system for safety/moderation

create type public.report_status as enum ('pending', 'reviewed', 'resolved');

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reported_user_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null,
  description text,
  status public.report_status not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.reports enable row level security;

-- Users can see their own submitted reports
create policy "reports_select_own" on public.reports
  for select using (auth.uid() = reporter_id);

-- Users can submit reports
create policy "reports_insert_own" on public.reports
  for insert with check (auth.uid() = reporter_id);

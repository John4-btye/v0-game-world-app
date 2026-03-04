-- Add game_tags and platforms columns to communities
-- Make created_by nullable for system-seeded communities

alter table public.communities
  alter column created_by drop not null;

alter table public.communities
  add column if not exists game_tags text[] default '{}',
  add column if not exists platforms text[] default '{}';

-- Index for faster tag/platform searches
create index if not exists idx_communities_game_tags on public.communities using gin(game_tags);
create index if not exists idx_communities_platforms on public.communities using gin(platforms);

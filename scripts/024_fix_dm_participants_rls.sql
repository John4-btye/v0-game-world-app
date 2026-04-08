-- Fix infinite recursion in dm_participants RLS policies
-- Problem: dm_participants_select_own policy queries dm_participants inside itself

-- Drop the problematic policies
drop policy if exists "dm_participants_select_own" on public.dm_participants;
drop policy if exists "dm_participants_insert_auth" on public.dm_participants;

-- Recreate SELECT policy without recursion
-- Users can only see rows where they are the participant (direct column check)
create policy "dm_participants_select_own" on public.dm_participants
  for select using (
    user_id = auth.uid()
  );

-- Recreate INSERT policy - users can only insert themselves as participants
create policy "dm_participants_insert_auth" on public.dm_participants
  for insert with check (
    user_id = auth.uid()
  );

-- Add DELETE policy so users can leave conversations
create policy "dm_participants_delete_own" on public.dm_participants
  for delete using (
    user_id = auth.uid()
  );

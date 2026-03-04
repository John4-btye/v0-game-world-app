-- Fix RLS policies for communities to handle NULL created_by (system-seeded)
-- and allow any authenticated user to view all communities

DROP POLICY IF EXISTS "communities_select_all" ON public.communities;
DROP POLICY IF EXISTS "communities_insert_auth" ON public.communities;
DROP POLICY IF EXISTS "communities_update_owner" ON public.communities;
DROP POLICY IF EXISTS "communities_delete_owner" ON public.communities;

-- Anyone authenticated can browse
CREATE POLICY "communities_select_all" ON public.communities
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Any authenticated user can create a community (must set themselves as creator)
CREATE POLICY "communities_insert_auth" ON public.communities
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Only the creator can update (system communities with NULL created_by can't be edited by users)
CREATE POLICY "communities_update_owner" ON public.communities
  FOR UPDATE USING (created_by IS NOT NULL AND auth.uid() = created_by);

-- Only the creator can delete
CREATE POLICY "communities_delete_owner" ON public.communities
  FOR DELETE USING (created_by IS NOT NULL AND auth.uid() = created_by);

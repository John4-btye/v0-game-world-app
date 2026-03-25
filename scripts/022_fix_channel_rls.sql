-- Fix channels RLS policy to allow community members to create channels

-- Drop existing insert policy
DROP POLICY IF EXISTS channels_insert_auth ON channels;

-- Create new policy that allows community members to insert channels
CREATE POLICY channels_insert_member ON channels
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM community_members
      WHERE community_members.community_id = channels.community_id
      AND community_members.user_id = auth.uid()
    )
  );

-- Also ensure select policy allows viewing all channels in joined communities
DROP POLICY IF EXISTS channels_select_auth ON channels;

CREATE POLICY channels_select_member ON channels
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM community_members
      WHERE community_members.community_id = channels.community_id
      AND community_members.user_id = auth.uid()
    )
  );

-- Fix delete policy - only creator can delete
DROP POLICY IF EXISTS channels_delete_admin ON channels;

CREATE POLICY channels_delete_creator ON channels
  FOR DELETE
  USING (auth.uid() = created_by);

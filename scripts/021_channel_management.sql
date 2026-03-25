-- Add created_by to channels for ownership tracking
ALTER TABLE channels ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES profiles(id);

-- Add channel_members table for join/leave functionality
CREATE TABLE IF NOT EXISTS channel_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid REFERENCES channels(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(channel_id, user_id)
);

-- RLS for channel_members
ALTER TABLE channel_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "channel_members_select" ON channel_members FOR SELECT USING (true);
CREATE POLICY "channel_members_insert_self" ON channel_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "channel_members_delete_self" ON channel_members FOR DELETE USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_channel_members_channel ON channel_members(channel_id);
CREATE INDEX IF NOT EXISTS idx_channel_members_user ON channel_members(user_id);

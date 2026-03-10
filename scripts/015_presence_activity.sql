-- User presence tracking
CREATE TABLE IF NOT EXISTS user_presence (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'idle', 'offline')),
  last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_community_id UUID REFERENCES communities(id) ON DELETE SET NULL
);

ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view presence" ON user_presence FOR SELECT USING (true);
CREATE POLICY "Users update own presence" ON user_presence FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users insert own presence" ON user_presence FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Activity feed
CREATE TABLE IF NOT EXISTS activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('community_joined', 'thread_created', 'message_sent', 'friend_added')),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_activity_feed_created ON activity_feed(created_at DESC);

ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view activity" ON activity_feed FOR SELECT USING (true);
CREATE POLICY "Users insert own activity" ON activity_feed FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add banner_url to communities
ALTER TABLE communities ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- Add avatar_url to profiles if not exists (may already exist)
DO $$ BEGIN
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Enable realtime for presence and messages
ALTER PUBLICATION supabase_realtime ADD TABLE user_presence;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE activity_feed;

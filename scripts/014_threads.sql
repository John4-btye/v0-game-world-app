-- Threads table for community discussions
CREATE TABLE IF NOT EXISTS threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Thread replies
CREATE TABLE IF NOT EXISTS thread_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Thread likes (for both threads and replies)
CREATE TABLE IF NOT EXISTS thread_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  thread_id UUID REFERENCES threads(id) ON DELETE CASCADE,
  reply_id UUID REFERENCES thread_replies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT like_target CHECK (
    (thread_id IS NOT NULL AND reply_id IS NULL) OR
    (thread_id IS NULL AND reply_id IS NOT NULL)
  ),
  UNIQUE(user_id, thread_id),
  UNIQUE(user_id, reply_id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'thread_reply', 'like', 'mention', 'friend_request', 'friend_accepted'
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_threads_community ON threads(community_id, last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_thread_replies_thread ON thread_replies(thread_id, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_thread_likes_user ON thread_likes(user_id);

-- Enable RLS
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Threads policies
CREATE POLICY "threads_select_all" ON threads FOR SELECT USING (true);
CREATE POLICY "threads_insert_member" ON threads FOR INSERT WITH CHECK (
  auth.uid() = author_id AND
  EXISTS (SELECT 1 FROM community_members WHERE community_id = threads.community_id AND user_id = auth.uid())
);
CREATE POLICY "threads_update_own" ON threads FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "threads_delete_own" ON threads FOR DELETE USING (auth.uid() = author_id);

-- Replies policies
CREATE POLICY "replies_select_all" ON thread_replies FOR SELECT USING (true);
CREATE POLICY "replies_insert_auth" ON thread_replies FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "replies_update_own" ON thread_replies FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "replies_delete_own" ON thread_replies FOR DELETE USING (auth.uid() = author_id);

-- Likes policies
CREATE POLICY "likes_select_all" ON thread_likes FOR SELECT USING (true);
CREATE POLICY "likes_insert_own" ON thread_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes_delete_own" ON thread_likes FOR DELETE USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "notifications_select_own" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_insert_any" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "notifications_delete_own" ON notifications FOR DELETE USING (auth.uid() = user_id);

-- Fix thread_replies missing columns
ALTER TABLE thread_replies ADD COLUMN IF NOT EXISTS is_deleted boolean DEFAULT false;

-- Fix thread_likes if missing columns
ALTER TABLE thread_likes ADD COLUMN IF NOT EXISTS reply_id uuid REFERENCES thread_replies(id) ON DELETE CASCADE;

-- Fix notifications missing columns
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS community_id uuid REFERENCES communities(id) ON DELETE CASCADE;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS thread_id uuid REFERENCES threads(id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_thread_replies_thread_id ON thread_replies(thread_id);
CREATE INDEX IF NOT EXISTS idx_thread_replies_author_id ON thread_replies(author_id);
CREATE INDEX IF NOT EXISTS idx_threads_community_id ON threads(community_id);
CREATE INDEX IF NOT EXISTS idx_threads_author_id ON threads(author_id);

-- Add missing columns to threads table
ALTER TABLE threads ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;
ALTER TABLE threads ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
ALTER TABLE threads ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false;

-- Create index for pinned threads
CREATE INDEX IF NOT EXISTS idx_threads_pinned ON threads(community_id, is_pinned DESC, created_at DESC);

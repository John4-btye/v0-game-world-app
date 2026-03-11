-- Add reply_count column if missing
ALTER TABLE threads ADD COLUMN IF NOT EXISTS reply_count integer DEFAULT 0;

-- Create RPC function to increment thread replies
CREATE OR REPLACE FUNCTION increment_thread_replies(thread_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE threads SET reply_count = reply_count + 1 WHERE id = thread_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

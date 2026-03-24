-- Enable Realtime on notifications table for instant delivery
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Add indexes for faster notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
  ON notifications(user_id, is_read) 
  WHERE is_read = false;

CREATE INDEX IF NOT EXISTS idx_notifications_user_created 
  ON notifications(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_actor 
  ON notifications(actor_id);

-- Add title column if missing (some notifications use title + body pattern)
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS body text;

-- Rename message to body if title doesn't exist but message does
UPDATE notifications SET body = message WHERE body IS NULL AND message IS NOT NULL;

-- Create a function to automatically notify on insert
CREATE OR REPLACE FUNCTION notify_new_notification()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'new_notification',
    json_build_object(
      'user_id', NEW.user_id,
      'id', NEW.id,
      'type', NEW.type,
      'title', NEW.title
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for pg_notify (backup for when Realtime isn't enough)
DROP TRIGGER IF EXISTS notification_insert_trigger ON notifications;
CREATE TRIGGER notification_insert_trigger
  AFTER INSERT ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_notification();

-- Add composite index for efficient unread count queries
CREATE INDEX IF NOT EXISTS idx_notifications_unread_count 
  ON notifications(user_id) 
  WHERE is_read = false;

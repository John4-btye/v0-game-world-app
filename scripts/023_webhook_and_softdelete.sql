-- Add Discord webhook URL to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS discord_webhook_url TEXT;

-- Add soft delete to communities
ALTER TABLE communities ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE communities ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE communities ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES profiles(id);

-- Index for filtering active communities
CREATE INDEX IF NOT EXISTS idx_communities_active ON communities(is_deleted) WHERE is_deleted = FALSE;

-- Add webhook delivery tracking table for retries
CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
  webhook_url TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'retrying')),
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 3,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_attempt_at TIMESTAMPTZ,
  next_retry_at TIMESTAMPTZ
);

-- Index for finding pending/retrying deliveries
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_pending 
  ON webhook_deliveries(status, next_retry_at) 
  WHERE status IN ('pending', 'retrying');

-- RLS for webhook_deliveries
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own deliveries" ON webhook_deliveries
  FOR SELECT USING (auth.uid() = user_id);

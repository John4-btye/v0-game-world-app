-- Add game-related fields to profiles for activity-based identity
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS favorite_games TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS platforms TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS play_style TEXT DEFAULT NULL; -- 'casual', 'competitive', 'both'
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS active_hours TEXT DEFAULT NULL; -- 'morning', 'afternoon', 'evening', 'night', 'flexible'
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS looking_for_squad BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS squad_message TEXT DEFAULT NULL;

-- Create looking_for_squad table for active squad requests
CREATE TABLE IF NOT EXISTS squad_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  game TEXT NOT NULL,
  platform TEXT,
  play_style TEXT,
  message TEXT,
  max_players INTEGER DEFAULT 4,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '4 hours'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, game)
);

-- Enable RLS
ALTER TABLE squad_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for squad_requests
CREATE POLICY "Anyone can view squad requests" ON squad_requests FOR SELECT USING (expires_at > NOW());
CREATE POLICY "Users can insert own requests" ON squad_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own requests" ON squad_requests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own requests" ON squad_requests FOR DELETE USING (auth.uid() = user_id);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_squad_requests_game ON squad_requests(game);
CREATE INDEX IF NOT EXISTS idx_squad_requests_expires ON squad_requests(expires_at);
CREATE INDEX IF NOT EXISTS idx_profiles_looking_for_squad ON profiles(looking_for_squad) WHERE looking_for_squad = TRUE;

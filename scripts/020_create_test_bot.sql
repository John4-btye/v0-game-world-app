-- Create a test bot user for testing messaging/social infrastructure
-- The bot will have a fixed UUID so we can reference it in code

INSERT INTO profiles (id, username, display_name, bio, avatar_url)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'gamebot',
  'GameWorld Bot',
  'I am a friendly test bot! Send me messages, friend requests, or mention me in discussions to test the app.',
  null
)
ON CONFLICT (id) DO UPDATE SET
  display_name = 'GameWorld Bot',
  bio = 'I am a friendly test bot! Send me messages, friend requests, or mention me in discussions to test the app.';

-- Make bot "online" in presence
INSERT INTO user_presence (user_id, status, last_seen)
VALUES ('00000000-0000-0000-0000-000000000001', 'online', NOW())
ON CONFLICT (user_id) DO UPDATE SET status = 'online', last_seen = NOW();

// ============================================================
// Game-World — shared TypeScript types
// Maps 1-to-1 with the Supabase tables created in /scripts
// ============================================================

// --- Profiles ---
export interface Profile {
  id: string // uuid — references auth.users
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  is_over_16: boolean
  linked_discord: string | null
  linked_google: string | null
  linked_reddit: string | null
  created_at: string
  updated_at: string
}

// --- Communities ---
export interface Community {
  id: string
  name: string
  slug: string
  description: string | null
  icon_url: string | null
  banner_url: string | null
  game_tags: string[] // text[]
  is_nsfw: boolean
  owner_id: string
  created_at: string
}

// --- Community Members ---
export type MemberRole = 'member' | 'moderator' | 'admin'

export interface CommunityMember {
  id: string
  community_id: string
  user_id: string
  role: MemberRole
  joined_at: string
}

// --- Channels ---
export type ChannelType = 'text' | 'voice' | 'announcement'

export interface Channel {
  id: string
  community_id: string
  name: string
  description: string | null
  channel_type: ChannelType
  is_nsfw: boolean
  position: number
  created_at: string
}

// --- Messages (channel messages) ---
export interface Message {
  id: string
  channel_id: string
  user_id: string
  content: string
  edited_at: string | null
  created_at: string
}

// --- Direct Message Conversations ---
export interface DirectMessageConversation {
  id: string
  participant_one: string
  participant_two: string
  created_at: string
}

// --- Direct Messages ---
export interface DirectMessage {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
}

// --- Friendships ---
export type FriendshipStatus = 'pending' | 'accepted' | 'blocked'

export interface Friendship {
  id: string
  requester_id: string
  addressee_id: string
  status: FriendshipStatus
  created_at: string
  updated_at: string
}

// --- Reports ---
export type ReportReason =
  | 'harassment'
  | 'spam'
  | 'nsfw'
  | 'underage'
  | 'hate_speech'
  | 'other'

export type ReportStatus = 'open' | 'reviewed' | 'resolved'

export interface Report {
  id: string
  reporter_id: string
  reported_user_id: string | null
  reported_message_id: string | null
  reason: ReportReason
  description: string | null
  status: ReportStatus
  created_at: string
}

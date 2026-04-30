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
  banner_preset?: string | null
  banner_url?: string | null
  linked_discord: string | null
  linked_google: string | null
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
  game_tags: string[]
  platforms: string[]
  is_nsfw: boolean
  created_by: string | null
  created_at: string
  member_count?: number // virtual, from aggregation
  last_message?: string | null // virtual, from aggregation
  last_message_time?: string | null // virtual, from aggregation
}

export type CommunitySummary = Pick<
  Community,
  | 'id'
  | 'name'
  | 'slug'
  | 'description'
  | 'icon_url'
  | 'game_tags'
  | 'member_count'
  | 'last_message'
  | 'last_message_time'
>

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
export interface Channel {
  id: string
  community_id: string
  name: string
  description: string | null
  type: ChannelType
  position: number
  created_by: string | null
  created_at: string
}

// --- Messages (channel messages) ---
export interface Message {
  id: string
  channel_id: string
  sender_id: string
  content: string
  is_deleted: boolean
  created_at: string
  updated_at: string
  // joined via query
  profile?: {
    username: string
    display_name: string | null
    avatar_url: string | null
  }
}

export type ChannelType = 'text' | 'voice' | 'announcement'

// --- DM Conversations (dm_conversations table) ---
export interface DmConversation {
  id: string
  created_at: string
}

// --- DM Participants (dm_participants table) ---
export interface DmParticipant {
  id: string
  conversation_id: string
  user_id: string
  joined_at: string
  // joined via query
  profile?: {
    username: string
    display_name: string | null
    avatar_url: string | null
  }
}

// --- DM Messages (dm_messages table) ---
export interface DmMessage {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  is_deleted: boolean
  created_at: string
  // joined via query
  profile?: {
    username: string
    display_name: string | null
    avatar_url: string | null
  }
}

// --- Conversation with partner info (for listing) ---
export interface ConversationWithPartner {
  id: string
  created_at: string
  partner: {
    id: string
    username: string
    display_name: string | null
    avatar_url: string | null
  }
  last_message?: {
    content: string
    created_at: string
  }
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

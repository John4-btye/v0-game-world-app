'use client'

// Dev-only fake users for testing interactions
export interface FakeUser {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
  status: 'online' | 'away' | 'offline'
  isRealUser?: boolean
}

// Use UUID-like IDs to prevent collisions with real user IDs
export const FAKE_USERS: FakeUser[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    username: 'shadowblade',
    display_name: 'ShadowBlade',
    avatar_url: null,
    status: 'online',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    username: 'pixelwarrior',
    display_name: 'PixelWarrior',
    avatar_url: null,
    status: 'online',
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    username: 'nightowl_gamer',
    display_name: 'NightOwl',
    avatar_url: null,
    status: 'away',
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    username: 'prosniper99',
    display_name: 'ProSniper99',
    avatar_url: null,
    status: 'offline',
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    username: 'speedrunner',
    display_name: 'SpeedRunner',
    avatar_url: null,
    status: 'online',
  },
]

// In-memory store for dev interactions
export interface DevMessage {
  id: string
  sender_id: string
  recipient_id: string
  content: string
  created_at: string
  conversation_id?: string
  channel_id?: string
}

export interface DevFriendship {
  id: string
  requester_id: string
  addressee_id: string
  status: 'pending' | 'accepted' | 'blocked'
  created_at: string
}

export interface DevChannelMessage {
  id: string
  channel_id: string
  sender_id: string
  content: string
  created_at: string
}

// Helper to get username by ID (works with both fake and real users)
function getUsernameById(id: string): string {
  const fakeUser = FAKE_USERS.find(u => u.id === id)
  if (fakeUser) return fakeUser.username
  // Check if it's a fake user UUID pattern
  if (id.startsWith('00000000-0000-0000-0000-')) return 'unknown_fake'
  return 'real_user'
}

// Global dev state (resets on page refresh)
class DevStore {
  private messages: DevMessage[] = []
  private friendships: DevFriendship[] = []
  private channelMessages: DevChannelMessage[] = []
  private blockedUsers: Map<string, Set<string>> = new Map() // blocker_id -> Set of blocked_ids
  private listeners: Set<() => void> = new Set()
  
  // Action logging
  private logAction(action: string, userId: string, details: Record<string, unknown>) {
    console.log(`[v0 DevStore] ${action}`, {
      user_id: userId,
      username: getUsernameById(userId),
      timestamp: new Date().toISOString(),
      ...details,
    })
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notify() {
    this.listeners.forEach(l => l())
  }

  // Messages
  sendMessage(from: string, to: string, content: string, conversationId?: string) {
    if (this.isBlocked(from, to)) {
      this.logAction('MESSAGE_BLOCKED', from, { to_user_id: to, to_username: getUsernameById(to), reason: 'user_blocked' })
      return null
    }
    const msg: DevMessage = {
      id: `dev-msg-${Date.now()}`,
      sender_id: from,
      recipient_id: to,
      content,
      created_at: new Date().toISOString(),
      conversation_id: conversationId,
    }
    this.messages.push(msg)
    this.logAction('MESSAGE_SENT', from, { to_user_id: to, to_username: getUsernameById(to), message_id: msg.id, content_length: content.length })
    this.notify()
    return msg
  }

  getMessages(userId1: string, userId2: string) {
    return this.messages.filter(m => 
      (m.sender_id === userId1 && m.recipient_id === userId2) ||
      (m.sender_id === userId2 && m.recipient_id === userId1)
    )
  }

  getConversations(userId: string) {
    const convos = new Map<string, DevMessage>()
    this.messages
      .filter(m => m.sender_id === userId || m.recipient_id === userId)
      .forEach(m => {
        const otherId = m.sender_id === userId ? m.recipient_id : m.sender_id
        const existing = convos.get(otherId)
        if (!existing || new Date(m.created_at) > new Date(existing.created_at)) {
          convos.set(otherId, m)
        }
      })
    return Array.from(convos.entries()).map(([otherId, lastMsg]) => ({
      otherId,
      lastMessage: lastMsg,
    }))
  }

  // Friendships
  sendFriendRequest(from: string, to: string) {
    if (this.isBlocked(from, to)) {
      this.logAction('FRIEND_REQUEST_BLOCKED', from, { to_user_id: to, to_username: getUsernameById(to), reason: 'user_blocked' })
      return null
    }
    const existing = this.friendships.find(f => 
      (f.requester_id === from && f.addressee_id === to) ||
      (f.requester_id === to && f.addressee_id === from)
    )
    if (existing) {
      this.logAction('FRIEND_REQUEST_EXISTS', from, { to_user_id: to, to_username: getUsernameById(to), existing_status: existing.status })
      return existing
    }

    const friendship: DevFriendship = {
      id: `dev-friend-${Date.now()}`,
      requester_id: from,
      addressee_id: to,
      status: 'pending',
      created_at: new Date().toISOString(),
    }
    this.friendships.push(friendship)
    this.logAction('FRIEND_REQUEST_SENT', from, { to_user_id: to, to_username: getUsernameById(to), friendship_id: friendship.id })
    this.notify()
    return friendship
  }

  acceptFriendRequest(friendshipId: string, acceptedByUserId?: string) {
    const f = this.friendships.find(f => f.id === friendshipId)
    if (f) {
      f.status = 'accepted'
      this.logAction('FRIEND_REQUEST_ACCEPTED', acceptedByUserId || f.addressee_id, { 
        friendship_id: friendshipId, 
        requester_id: f.requester_id, 
        requester_username: getUsernameById(f.requester_id) 
      })
      this.notify()
    }
    return f
  }

  rejectFriendRequest(friendshipId: string, rejectedByUserId?: string) {
    const f = this.friendships.find(f => f.id === friendshipId)
    if (f) {
      this.logAction('FRIEND_REQUEST_REJECTED', rejectedByUserId || f.addressee_id, { 
        friendship_id: friendshipId, 
        requester_id: f.requester_id, 
        requester_username: getUsernameById(f.requester_id) 
      })
    }
    this.friendships = this.friendships.filter(f => f.id !== friendshipId)
    this.notify()
  }

  removeFriend(friendshipId: string, removedByUserId?: string) {
    const f = this.friendships.find(f => f.id === friendshipId)
    if (f) {
      const otherId = removedByUserId === f.requester_id ? f.addressee_id : f.requester_id
      this.logAction('FRIEND_REMOVED', removedByUserId || 'unknown', { 
        friendship_id: friendshipId, 
        other_user_id: otherId, 
        other_username: getUsernameById(otherId) 
      })
    }
    this.friendships = this.friendships.filter(f => f.id !== friendshipId)
    this.notify()
  }

  getFriendships(userId: string) {
    return this.friendships.filter(f => 
      f.requester_id === userId || f.addressee_id === userId
    )
  }

  getFriends(userId: string) {
    return this.friendships
      .filter(f => f.status === 'accepted' && (f.requester_id === userId || f.addressee_id === userId))
      .map(f => f.requester_id === userId ? f.addressee_id : f.requester_id)
  }

  getPendingRequests(userId: string) {
    return this.friendships.filter(f => 
      f.status === 'pending' && f.addressee_id === userId
    )
  }

  // Blocking
  blockUser(blockerId: string, blockedId: string) {
    if (!this.blockedUsers.has(blockerId)) {
      this.blockedUsers.set(blockerId, new Set())
    }
    this.blockedUsers.get(blockerId)!.add(blockedId)
    // Remove any friendships
    this.friendships = this.friendships.filter(f => 
      !((f.requester_id === blockerId && f.addressee_id === blockedId) ||
        (f.requester_id === blockedId && f.addressee_id === blockerId))
    )
    this.logAction('USER_BLOCKED', blockerId, { blocked_user_id: blockedId, blocked_username: getUsernameById(blockedId) })
    this.notify()
  }

  unblockUser(blockerId: string, blockedId: string) {
    this.blockedUsers.get(blockerId)?.delete(blockedId)
    this.logAction('USER_UNBLOCKED', blockerId, { unblocked_user_id: blockedId, unblocked_username: getUsernameById(blockedId) })
    this.notify()
  }

  isBlocked(userId1: string, userId2: string) {
    return this.blockedUsers.get(userId1)?.has(userId2) || 
           this.blockedUsers.get(userId2)?.has(userId1) || false
  }

  getBlockedUsers(userId: string) {
    return Array.from(this.blockedUsers.get(userId) || [])
  }

  // Channel messages
  sendChannelMessage(channelId: string, senderId: string, content: string) {
    const msg: DevChannelMessage = {
      id: `dev-channel-msg-${Date.now()}`,
      channel_id: channelId,
      sender_id: senderId,
      content,
      created_at: new Date().toISOString(),
    }
    this.channelMessages.push(msg)
    this.logAction('CHANNEL_MESSAGE_SENT', senderId, { channel_id: channelId, message_id: msg.id, content_length: content.length })
    this.notify()
    return msg
  }

  getChannelMessages(channelId: string) {
    return this.channelMessages.filter(m => m.channel_id === channelId)
  }

  // Reset all data
  reset() {
    console.log('[v0 DevStore] RESET_ALL_DATA', { timestamp: new Date().toISOString() })
    this.messages = []
    this.friendships = []
    this.channelMessages = []
    this.blockedUsers.clear()
    this.notify()
  }
}

export const devStore = new DevStore()

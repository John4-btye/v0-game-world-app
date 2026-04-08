'use client'

// Dev-only fake users for testing interactions
export interface FakeUser {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
  status: 'online' | 'away' | 'offline'
}

export const FAKE_USERS: FakeUser[] = [
  {
    id: 'fake-user-1',
    username: 'shadowblade',
    display_name: 'ShadowBlade',
    avatar_url: null,
    status: 'online',
  },
  {
    id: 'fake-user-2',
    username: 'pixelwarrior',
    display_name: 'PixelWarrior',
    avatar_url: null,
    status: 'online',
  },
  {
    id: 'fake-user-3',
    username: 'nightowl_gamer',
    display_name: 'NightOwl',
    avatar_url: null,
    status: 'away',
  },
  {
    id: 'fake-user-4',
    username: 'prosniper99',
    display_name: 'ProSniper99',
    avatar_url: null,
    status: 'offline',
  },
  {
    id: 'fake-user-5',
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

// Global dev state (resets on page refresh)
class DevStore {
  private messages: DevMessage[] = []
  private friendships: DevFriendship[] = []
  private channelMessages: DevChannelMessage[] = []
  private blockedUsers: Map<string, Set<string>> = new Map() // blocker_id -> Set of blocked_ids
  private listeners: Set<() => void> = new Set()

  subscribe(listener: () => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notify() {
    this.listeners.forEach(l => l())
  }

  // Messages
  sendMessage(from: string, to: string, content: string, conversationId?: string) {
    if (this.isBlocked(from, to)) return null
    const msg: DevMessage = {
      id: `dev-msg-${Date.now()}`,
      sender_id: from,
      recipient_id: to,
      content,
      created_at: new Date().toISOString(),
      conversation_id: conversationId,
    }
    this.messages.push(msg)
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
    if (this.isBlocked(from, to)) return null
    const existing = this.friendships.find(f => 
      (f.requester_id === from && f.addressee_id === to) ||
      (f.requester_id === to && f.addressee_id === from)
    )
    if (existing) return existing

    const friendship: DevFriendship = {
      id: `dev-friend-${Date.now()}`,
      requester_id: from,
      addressee_id: to,
      status: 'pending',
      created_at: new Date().toISOString(),
    }
    this.friendships.push(friendship)
    this.notify()
    return friendship
  }

  acceptFriendRequest(friendshipId: string) {
    const f = this.friendships.find(f => f.id === friendshipId)
    if (f) {
      f.status = 'accepted'
      this.notify()
    }
    return f
  }

  rejectFriendRequest(friendshipId: string) {
    this.friendships = this.friendships.filter(f => f.id !== friendshipId)
    this.notify()
  }

  removeFriend(friendshipId: string) {
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
    this.notify()
  }

  unblockUser(blockerId: string, blockedId: string) {
    this.blockedUsers.get(blockerId)?.delete(blockedId)
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
    this.notify()
    return msg
  }

  getChannelMessages(channelId: string) {
    return this.channelMessages.filter(m => m.channel_id === channelId)
  }

  // Reset all data
  reset() {
    this.messages = []
    this.friendships = []
    this.channelMessages = []
    this.blockedUsers.clear()
    this.notify()
  }
}

export const devStore = new DevStore()

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString()

  // Run all queries in parallel for better performance
  const [
    friendshipsResult,
    memberCommunityResult,
    recentDmMessagesResult,
    recentFriendActivityResult,
    recentCommunityJoinsResult,
    lastActiveChannelResult,
    lastActiveDmResult,
  ] = await Promise.all([
    // 1. Get accepted friendships
    supabase
      .from('friendships')
      .select('id, requester_id, addressee_id, created_at, updated_at')
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
      .eq('status', 'accepted'),

    // 2. Get user's community memberships
    supabase
      .from('community_members')
      .select('community_id, joined_at, communities(id, name, slug)')
      .eq('user_id', user.id),

    // 3. Get recent DM messages (for activity feed)
    supabase
      .from('dm_messages')
      .select(`
        id, content, created_at, sender_id,
        dm_conversations!inner(
          id,
          dm_participants!inner(user_id)
        ),
        profiles:sender_id(username, display_name, avatar_url)
      `)
      .neq('sender_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10),

    // 4. Get recent friend activity (friend requests accepted in last 7 days)
    supabase
      .from('friendships')
      .select(`
        id, created_at, updated_at, status, requester_id, addressee_id,
        requester:profiles!friendships_requester_id_fkey(username, display_name, avatar_url),
        addressee:profiles!friendships_addressee_id_fkey(username, display_name, avatar_url)
      `)
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
      .eq('status', 'accepted')
      .gte('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('updated_at', { ascending: false })
      .limit(5),

    // 5. Get recent community joins by user
    supabase
      .from('community_members')
      .select(`
        id, joined_at, community_id,
        communities(name, slug, icon_url)
      `)
      .eq('user_id', user.id)
      .order('joined_at', { ascending: false })
      .limit(5),

    // 6. Get last active channel (most recent message sent by user)
    supabase
      .from('messages')
      .select(`
        id, created_at, channel_id,
        channels!inner(id, name, community_id, communities!inner(name, slug))
      `)
      .eq('sender_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1),

    // 7. Get last active DM conversation
    supabase
      .from('dm_messages')
      .select(`
        id, created_at, conversation_id,
        dm_conversations!inner(id)
      `)
      .eq('sender_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1),
  ])

  // Process friendships and get online friends count
  const friendships = friendshipsResult.data ?? []
  const friendIds = friendships.map(f => 
    f.requester_id === user.id ? f.addressee_id : f.requester_id
  )

  let onlineFriendsCount = 0
  let friendProfiles: Record<string, any> = {}

  if (friendIds.length > 0) {
    const [profilesResult, presenceResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .in('id', friendIds),
      supabase
        .from('user_presence')
        .select('user_id, last_seen')
        .in('user_id', friendIds)
        .gte('last_seen', fiveMinutesAgo),
    ])

    friendProfiles = Object.fromEntries(
      (profilesResult.data ?? []).map(p => [p.id, p])
    )
    onlineFriendsCount = presenceResult.data?.length ?? 0
  }

  // Build unified activity feed
  type ActivityItem = {
    id: string
    type: 'message' | 'dm' | 'friend_accept' | 'community_join'
    actor: {
      username: string
      display_name: string | null
      avatar_url: string | null
    }
    description: string
    link?: string
    created_at: string
  }

  const activityFeed: ActivityItem[] = []

  // Add DM messages to feed (only from conversations user is part of)
  const dmMessages = recentDmMessagesResult.data ?? []
  for (const msg of dmMessages) {
    // Verify user is a participant
    const participants = (msg.dm_conversations as any)?.dm_participants ?? []
    const isParticipant = participants.some((p: any) => p.user_id === user.id)
    if (!isParticipant) continue

    const profile = msg.profiles as any
    if (profile) {
      activityFeed.push({
        id: `dm-${msg.id}`,
        type: 'dm',
        actor: {
          username: profile.username,
          display_name: profile.display_name,
          avatar_url: profile.avatar_url,
        },
        description: `sent you a message: "${msg.content?.slice(0, 40)}${msg.content?.length > 40 ? '...' : ''}"`,
        link: `/messages/${(msg.dm_conversations as any)?.id}`,
        created_at: msg.created_at,
      })
    }
  }

  // Add friend accepts to feed
  const friendActivity = recentFriendActivityResult.data ?? []
  for (const f of friendActivity) {
    const isRequester = f.requester_id === user.id
    const otherProfile = isRequester ? f.addressee : f.requester
    if (otherProfile) {
      activityFeed.push({
        id: `friend-${f.id}`,
        type: 'friend_accept',
        actor: {
          username: (otherProfile as any).username,
          display_name: (otherProfile as any).display_name,
          avatar_url: (otherProfile as any).avatar_url,
        },
        description: isRequester ? 'accepted your friend request' : 'is now your friend',
        link: `/friends`,
        created_at: f.updated_at,
      })
    }
  }

  // Add community joins to feed
  const communityJoins = recentCommunityJoinsResult.data ?? []
  for (const join of communityJoins) {
    const community = join.communities as any
    if (community) {
      activityFeed.push({
        id: `join-${join.id}`,
        type: 'community_join',
        actor: {
          username: 'You',
          display_name: 'You',
          avatar_url: null,
        },
        description: `joined ${community.name}`,
        link: `/communities/${community.slug}`,
        created_at: join.joined_at,
      })
    }
  }

  // Sort by created_at DESC
  activityFeed.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  // Build "Jump Back In" data
  const jumpBackIn: {
    lastChannel: { id: string; name: string; communityName: string; communitySlug: string } | null
    lastDm: { id: string; partnerName: string } | null
  } = {
    lastChannel: null,
    lastDm: null,
  }

  const lastChannel = lastActiveChannelResult.data?.[0]
  if (lastChannel?.channels) {
    const channel = lastChannel.channels as any
    jumpBackIn.lastChannel = {
      id: channel.id,
      name: channel.name,
      communityName: channel.communities?.name ?? 'Unknown',
      communitySlug: channel.communities?.slug ?? '',
    }
  }

  const lastDm = lastActiveDmResult.data?.[0]
  if (lastDm?.conversation_id) {
    // Get partner name for this conversation
    const { data: participants } = await supabase
      .from('dm_participants')
      .select('user_id, profiles:user_id(username, display_name)')
      .eq('conversation_id', lastDm.conversation_id)
      .neq('user_id', user.id)
      .limit(1)

    const partner = participants?.[0]?.profiles as any
    if (partner) {
      jumpBackIn.lastDm = {
        id: lastDm.conversation_id,
        partnerName: partner.display_name ?? partner.username,
      }
    }
  }

  // Get unread counts (messages created after user's last visit - simplified approach)
  // For now, we'll count messages in the last 24h that user hasn't sent
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { count: unreadDmCount } = await supabase
    .from('dm_messages')
    .select('id', { count: 'exact', head: true })
    .neq('sender_id', user.id)
    .gte('created_at', oneDayAgo)

  return NextResponse.json({
    onlineFriendsCount,
    totalFriendsCount: friendIds.length,
    activityFeed: activityFeed.slice(0, 10),
    jumpBackIn,
    unreadDmCount: unreadDmCount ?? 0,
    memberCommunityIds: (memberCommunityResult.data ?? []).map(m => m.community_id),
  })
}

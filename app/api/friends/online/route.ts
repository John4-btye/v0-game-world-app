import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get accepted friendships
  const { data: friendships } = await supabase
    .from('friendships')
    .select('requester_id, addressee_id')
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .eq('status', 'accepted')

  if (!friendships || friendships.length === 0) {
    return NextResponse.json([])
  }

  // Extract friend IDs
  const friendIds = friendships.map(f => 
    f.requester_id === user.id ? f.addressee_id : f.requester_id
  )

  // Get friend profiles with presence
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString()

  const { data: profiles } = await supabase
    .from('profiles')
    .select(`
      id,
      username,
      display_name,
      avatar_url
    `)
    .in('id', friendIds)

  const { data: presences } = await supabase
    .from('user_presence')
    .select('user_id, last_seen')
    .in('user_id', friendIds)

  const presenceMap = new Map(presences?.map(p => [p.user_id, p.last_seen]) ?? [])

  const friends = profiles?.map(profile => {
    const lastSeen = presenceMap.get(profile.id)
    let status: 'online' | 'away' | 'offline' = 'offline'
    
    if (lastSeen) {
      if (lastSeen >= fiveMinutesAgo) status = 'online'
      else if (lastSeen >= fifteenMinutesAgo) status = 'away'
    }

    return { ...profile, status }
  }) ?? []

  // Sort by status (online first, then away, then offline)
  friends.sort((a, b) => {
    const order = { online: 0, away: 1, offline: 2 }
    return order[a.status] - order[b.status]
  })

  return NextResponse.json(friends)
}

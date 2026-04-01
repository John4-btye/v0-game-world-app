import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { notifyViaWebhook } from '@/lib/webhook-service'

// GET: List friends by status (accepted, pending, blocked)
export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') ?? 'accepted'

  const { data, error } = await supabase
    .from('friendships')
    .select('*')
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .eq('status', status)
    .order('updated_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Collect all profile IDs that aren't the current user
  const profileIds = (data ?? []).map((f) =>
    f.requester_id === user.id ? f.addressee_id : f.requester_id,
  )

  let profiles: Record<string, { id: string; username: string; display_name: string | null; avatar_url: string | null }> = {}
  if (profileIds.length > 0) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url')
      .in('id', profileIds)

    profiles = Object.fromEntries((profileData ?? []).map((p) => [p.id, p]))
  }

  const enriched = (data ?? []).map((f) => {
    const friendId = f.requester_id === user.id ? f.addressee_id : f.requester_id
    return {
      ...f,
      friend_profile: profiles[friendId] ?? null,
      is_requester: f.requester_id === user.id,
    }
  })

  return NextResponse.json(enriched)
}

// POST: Send a friend request
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { addressee_id } = body

  if (!addressee_id) return NextResponse.json({ error: 'addressee_id required' }, { status: 400 })
  if (addressee_id === user.id) return NextResponse.json({ error: 'Cannot friend yourself' }, { status: 400 })

  // Check for existing friendship in either direction
  const { data: existing } = await supabase
    .from('friendships')
    .select('id, status')
    .or(
      `and(requester_id.eq.${user.id},addressee_id.eq.${addressee_id}),and(requester_id.eq.${addressee_id},addressee_id.eq.${user.id})`,
    )
    .maybeSingle()

  if (existing) {
    if (existing.status === 'accepted') return NextResponse.json({ error: 'Already friends' }, { status: 409 })
    if (existing.status === 'pending') return NextResponse.json({ error: 'Request already pending' }, { status: 409 })
    if (existing.status === 'blocked') return NextResponse.json({ error: 'Unable to send request' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('friendships')
    .insert({ requester_id: user.id, addressee_id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Get requester's profile for notification
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, display_name')
    .eq('id', user.id)
    .single()

  // Create notification for addressee
  const notificationBody = `${profile?.display_name || profile?.username || 'Someone'} sent you a friend request`
  
  await supabase.from('notifications').insert({
    user_id: addressee_id,
    type: 'friend_request',
    title: 'New friend request',
    message: notificationBody,
    body: notificationBody,
    link: '/friends',
    actor_id: user.id,
  })

  // Send Discord webhook notification
  notifyViaWebhook(
    addressee_id,
    'friend_request',
    'New friend request',
    notificationBody,
    '/friends'
  )

  return NextResponse.json(data)
}

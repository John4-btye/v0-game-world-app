import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

// GET: List all DM conversations for the current user
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get conversations where the user is a participant
  const { data: participations } = await supabase
    .from('dm_participants')
    .select('conversation_id')
    .eq('user_id', user.id)

  if (!participations || participations.length === 0) {
    return NextResponse.json([])
  }

  const convoIds = participations.map((p) => p.conversation_id)

  // Use service role to read all participants (RLS otherwise only shows the caller's row).
  let admin
  try {
    admin = createAdminClient()
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Admin client unavailable'
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  const { data: allParticipants } = await admin
    .from('dm_participants')
    .select('conversation_id, user_id')
    .in('conversation_id', convoIds)

  // Get partner profile IDs
  const partnerMap: Record<string, string> = {}
  for (const p of allParticipants ?? []) {
    if (p.user_id !== user.id) {
      partnerMap[p.conversation_id] = p.user_id
    }
  }

  const partnerIds = Object.values(partnerMap)
  let profiles: Record<string, { id: string; username: string; display_name: string | null; avatar_url: string | null }> = {}

  if (partnerIds.length > 0) {
    const { data: profileData } = await admin
      .from('profiles')
      .select('id, username, display_name, avatar_url')
      .in('id', partnerIds)
    profiles = Object.fromEntries((profileData ?? []).map((p) => [p.id, p]))
  }

  // Get last message for each conversation
  const conversations = []
  for (const convoId of convoIds) {
    const { data: lastMsg } = await admin
      .from('dm_messages')
      .select('content, created_at')
      .eq('conversation_id', convoId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const partnerId = partnerMap[convoId]
    const partner = partnerId ? profiles[partnerId] : null

    if (partner) {
      conversations.push({
        id: convoId,
        partner,
        last_message: lastMsg ?? null,
      })
    }
  }

  // Sort by most recent message
  conversations.sort((a, b) => {
    const aTime = a.last_message?.created_at ?? '0'
    const bTime = b.last_message?.created_at ?? '0'
    return bTime.localeCompare(aTime)
  })

  return NextResponse.json(conversations)
}

// POST: Create or find an existing DM conversation with a partner
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { partner_id } = await request.json()
  if (!partner_id) return NextResponse.json({ error: 'partner_id required' }, { status: 400 })
  if (partner_id === user.id) return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 })

  // Create new conversation + participants with the service role key.
  // This avoids RLS rejecting the second participant row (partner_id).
  let admin
  try {
    admin = createAdminClient()
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Admin client unavailable'
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  // Check if conversation already exists between these two users (service role bypasses dm_participants RLS).
  const { data: participantRows, error: participantRowsError } = await admin
    .from('dm_participants')
    .select('conversation_id, user_id')
    .in('user_id', [user.id, partner_id])

  if (participantRowsError) {
    return NextResponse.json({ error: participantRowsError.message }, { status: 500 })
  }

  const convoToUsers = new Map<string, Set<string>>()
  for (const row of participantRows ?? []) {
    const set = convoToUsers.get(row.conversation_id) ?? new Set<string>()
    set.add(row.user_id)
    convoToUsers.set(row.conversation_id, set)
  }

  for (const [conversationId, users] of convoToUsers.entries()) {
    if (users.has(user.id) && users.has(partner_id)) {
      return NextResponse.json({ id: conversationId })
    }
  }

  const { data: convo, error: convoError } = await admin
    .from('dm_conversations')
    .insert({})
    .select('id')
    .single()

  if (convoError) return NextResponse.json({ error: convoError.message }, { status: 500 })

  // Add both participants
  const { error: partError } = await admin
    .from('dm_participants')
    .insert([
      { conversation_id: convo.id, user_id: user.id },
      { conversation_id: convo.id, user_id: partner_id },
    ])

  if (partError) return NextResponse.json({ error: partError.message }, { status: 500 })

  return NextResponse.json({ id: convo.id })
}

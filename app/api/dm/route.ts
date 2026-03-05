import { createClient } from '@/lib/supabase/server'
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

  // Get all participants for those conversations to find the partner
  const { data: allParticipants } = await supabase
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
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url')
      .in('id', partnerIds)
    profiles = Object.fromEntries((profileData ?? []).map((p) => [p.id, p]))
  }

  // Get last message for each conversation
  const conversations = []
  for (const convoId of convoIds) {
    const { data: lastMsg } = await supabase
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

  // Check if conversation already exists between these two users
  const { data: myConvos } = await supabase
    .from('dm_participants')
    .select('conversation_id')
    .eq('user_id', user.id)

  if (myConvos && myConvos.length > 0) {
    const myConvoIds = myConvos.map((c) => c.conversation_id)
    const { data: partnerInMyConvos } = await supabase
      .from('dm_participants')
      .select('conversation_id')
      .eq('user_id', partner_id)
      .in('conversation_id', myConvoIds)

    if (partnerInMyConvos && partnerInMyConvos.length > 0) {
      return NextResponse.json({ id: partnerInMyConvos[0].conversation_id })
    }
  }

  // Create new conversation
  const { data: convo, error: convoError } = await supabase
    .from('dm_conversations')
    .insert({})
    .select()
    .single()

  if (convoError) return NextResponse.json({ error: convoError.message }, { status: 500 })

  // Add both participants
  const { error: partError } = await supabase
    .from('dm_participants')
    .insert([
      { conversation_id: convo.id, user_id: user.id },
      { conversation_id: convo.id, user_id: partner_id },
    ])

  if (partError) return NextResponse.json({ error: partError.message }, { status: 500 })

  return NextResponse.json({ id: convo.id })
}

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET: Fetch messages in a DM conversation
export async function GET(
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  const { conversationId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: messages, error } = await supabase
    .from('dm_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true })
    .limit(100)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Enrich with profiles
  const senderIds = [...new Set((messages ?? []).map((m) => m.sender_id))]
  let profiles: Record<string, { username: string; display_name: string | null; avatar_url: string | null }> = {}

  if (senderIds.length > 0) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url')
      .in('id', senderIds)
    profiles = Object.fromEntries((profileData ?? []).map((p) => [p.id, p]))
  }

  const enriched = (messages ?? []).map((m) => ({
    ...m,
    profile: profiles[m.sender_id] ?? null,
  }))

  return NextResponse.json(enriched)
}

// POST: Send a DM message
export async function POST(
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  const { conversationId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { content } = await request.json()
  if (!content?.trim()) return NextResponse.json({ error: 'Content required' }, { status: 400 })

  const { data, error } = await supabase
    .from('dm_messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: content.trim(),
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  const { conversationId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Ensure the caller is a participant (respects RLS).
  const { data: myRow } = await supabase
    .from('dm_participants')
    .select('conversation_id')
    .eq('conversation_id', conversationId)
    .eq('user_id', user.id)
    .maybeSingle()
  if (!myRow) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const admin = createAdminClient()

  const { data: participants, error } = await admin
    .from('dm_participants')
    .select('user_id')
    .eq('conversation_id', conversationId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const partnerId = participants?.find((p) => p.user_id !== user.id)?.user_id
  if (!partnerId) return NextResponse.json({ error: 'Partner not found' }, { status: 404 })

  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('id, username, display_name, avatar_url')
    .eq('id', partnerId)
    .single()

  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 })
  return NextResponse.json(profile)
}


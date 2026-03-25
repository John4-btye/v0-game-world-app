import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Create a new channel
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, community_id, description } = await request.json()
  if (!name?.trim() || !community_id) {
    return NextResponse.json({ error: 'Name and community_id required' }, { status: 400 })
  }

  // Create channel with creator
  const { data, error } = await supabase
    .from('channels')
    .insert({
      name: name.trim(),
      community_id,
      description: description?.trim() || null,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Auto-join creator to the channel
  await supabase.from('channel_members').insert({
    channel_id: data.id,
    user_id: user.id,
  })

  return NextResponse.json(data)
}

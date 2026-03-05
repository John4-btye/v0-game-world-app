import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// PATCH: Accept a friend request or block a user
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ friendshipId: string }> },
) {
  const { friendshipId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { status } = body as { status: 'accepted' | 'blocked' }

  if (!['accepted', 'blocked'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('friendships')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', friendshipId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE: Remove a friendship (unfriend or cancel request)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ friendshipId: string }> },
) {
  const { friendshipId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('friendships')
    .delete()
    .eq('id', friendshipId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

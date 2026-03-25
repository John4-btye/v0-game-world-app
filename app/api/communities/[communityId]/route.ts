import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET: Fetch a single community by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ communityId: string }> }
) {
  const { communityId } = await params
  const supabase = await createClient()

  const { data: community, error } = await supabase
    .from('communities')
    .select('*')
    .eq('id', communityId)
    .eq('is_deleted', false)
    .single()

  if (error || !community) {
    return NextResponse.json({ error: 'Community not found' }, { status: 404 })
  }

  return NextResponse.json(community)
}

// DELETE: Soft-delete a community (owner only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ communityId: string }> }
) {
  const { communityId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if user is the owner
  const { data: community } = await supabase
    .from('communities')
    .select('created_by, name')
    .eq('id', communityId)
    .single()

  if (!community) {
    return NextResponse.json({ error: 'Community not found' }, { status: 404 })
  }

  if (community.created_by !== user.id) {
    return NextResponse.json({ error: 'Only the community owner can delete it' }, { status: 403 })
  }

  // Soft-delete the community
  const { error } = await supabase
    .from('communities')
    .update({
      is_deleted: true,
      deleted_at: new Date().toISOString(),
      deleted_by: user.id,
    })
    .eq('id', communityId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, message: `Community "${community.name}" has been deleted` })
}

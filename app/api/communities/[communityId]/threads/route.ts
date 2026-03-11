import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ communityId: string }> }
) {
  const { communityId } = await params
  const supabase = await createClient()

  const { data: threads, error } = await supabase
    .from('threads')
    .select(`
      *,
      profiles:author_id (username, display_name, avatar_url)
    `)
    .eq('community_id', communityId)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(threads)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ communityId: string }> }
) {
  const { communityId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check membership
  const { data: membership } = await supabase
    .from('community_members')
    .select('id')
    .eq('community_id', communityId)
    .eq('user_id', user.id)
    .single()

  if (!membership) {
    return NextResponse.json({ error: 'Must be a member to post' }, { status: 403 })
  }

  const { title, content } = await request.json()

  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: 'Title and content required' }, { status: 400 })
  }

  const { data: thread, error } = await supabase
    .from('threads')
    .insert({
      community_id: communityId,
      author_id: user.id,
      title: title.trim(),
      content: content.trim(),
    })
    .select(`*, profiles:author_id (username, display_name, avatar_url)`)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(thread)
}

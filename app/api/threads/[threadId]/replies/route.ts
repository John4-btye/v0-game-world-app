import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { notifyViaWebhook } from '@/lib/webhook-service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const { threadId } = await params
  const supabase = await createClient()

  const { data: replies, error } = await supabase
    .from('thread_replies')
    .select(`
      *,
      profiles:author_id (username, display_name, avatar_url)
    `)
    .eq('thread_id', threadId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(replies)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const { threadId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get thread to find community
  const { data: thread } = await supabase
    .from('threads')
    .select('community_id, author_id')
    .eq('id', threadId)
    .single()

  if (!thread) {
    return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
  }

  // Check membership
  const { data: membership } = await supabase
    .from('community_members')
    .select('id')
    .eq('community_id', thread.community_id)
    .eq('user_id', user.id)
    .single()

  if (!membership) {
    return NextResponse.json({ error: 'Must be a member to reply' }, { status: 403 })
  }

  const { content } = await request.json()

  if (!content?.trim()) {
    return NextResponse.json({ error: 'Content required' }, { status: 400 })
  }

  const { data: reply, error } = await supabase
    .from('thread_replies')
    .insert({
      thread_id: threadId,
      author_id: user.id,
      content: content.trim(),
    })
    .select(`*, profiles:author_id (username, display_name, avatar_url)`)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Update reply count
  await supabase.rpc('increment_thread_replies', { thread_id: threadId })

  // Create notification for thread author if not self
  if (thread.author_id !== user.id) {
    const notificationBody = content.trim().slice(0, 100)
    
    await supabase.from('notifications').insert({
      user_id: thread.author_id,
      type: 'thread_reply',
      title: 'New reply to your thread',
      message: notificationBody,
      body: notificationBody,
      link: `/communities/thread/${threadId}`,
      actor_id: user.id,
    })

    // Send Discord webhook notification
    notifyViaWebhook(
      thread.author_id,
      'thread_reply',
      'New reply to your thread',
      notificationBody,
      `/communities/thread/${threadId}`
    )
  }

  return NextResponse.json(reply)
}

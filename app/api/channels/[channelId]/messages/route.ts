import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  const { channelId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cursor = req.nextUrl.searchParams.get('cursor')
  const limit = 50

  let query = supabase
    .from('messages')
    .select('*, profile:profiles!sender_id(username, display_name, avatar_url)')
    .eq('channel_id', channelId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true })
    .limit(limit)

  if (cursor) {
    query = query.gt('created_at', cursor)
  }

  const { data: messages, error } = await query

  console.log('[v0] Messages API GET:', { channelId, userId: user.id, messagesCount: messages?.length, error })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ messages: messages ?? [] })
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ channelId: string }> }
) {
  const { channelId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const content = body.content?.trim()

  if (!content || content.length === 0) {
    return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 })
  }

  if (content.length > 2000) {
    return NextResponse.json({ error: 'Message too long (max 2000 chars)' }, { status: 400 })
  }

  console.log('[v0] Messages API POST:', { channelId, userId: user.id, contentLength: content.length })

  const { data: message, error } = await supabase
    .from('messages')
    .insert({ channel_id: channelId, sender_id: user.id, content })
    .select('*, profile:profiles!sender_id(username, display_name, avatar_url)')
    .single()

  console.log('[v0] Messages API POST result:', { messageId: message?.id, error })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Parse @mentions and create notifications
  const mentionRegex = /@(\w+)/g
  const mentions = [...content.matchAll(mentionRegex)].map(m => m[1].toLowerCase())
  
  if (mentions.length > 0) {
    // Get channel info for the notification link
    const { data: channel } = await supabase
      .from('channels')
      .select('community_id, communities!inner(slug)')
      .eq('id', channelId)
      .single()
    
    // Get sender's profile for notification
    const { data: senderProfile } = await supabase
      .from('profiles')
      .select('username, display_name')
      .eq('id', user.id)
      .single()
    
    const senderName = senderProfile?.display_name || senderProfile?.username || 'Someone'
    
    // Find mentioned users
    const { data: mentionedUsers } = await supabase
      .from('profiles')
      .select('id, username')
      .in('username', mentions)
    
    // Create notifications for mentioned users (except self)
    const notifications = (mentionedUsers || [])
      .filter(u => u.id !== user.id)
      .map(u => ({
        user_id: u.id,
        type: 'mention',
        title: `${senderName} mentioned you`,
        message: content.length > 100 ? content.slice(0, 100) + '...' : content,
        body: content.length > 100 ? content.slice(0, 100) + '...' : content,
        link: channel?.communities?.slug 
          ? `/communities/${channel.communities.slug}/${channelId}`
          : `/communities`,
        actor_id: user.id,
      }))
    
    if (notifications.length > 0) {
      await supabase.from('notifications').insert(notifications)
    }
  }

  return NextResponse.json({ message })
}

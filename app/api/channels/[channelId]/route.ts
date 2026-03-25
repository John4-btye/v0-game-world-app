import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Delete a channel (only creator can delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  const { channelId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check if user is the creator
  const { data: channel } = await supabase
    .from('channels')
    .select('created_by')
    .eq('id', channelId)
    .single()

  if (!channel) return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
  if (channel.created_by !== user.id) {
    return NextResponse.json({ error: 'Only the creator can delete this channel' }, { status: 403 })
  }

  // Delete channel members first, then channel
  await supabase.from('channel_members').delete().eq('channel_id', channelId)
  await supabase.from('messages').delete().eq('channel_id', channelId)
  const { error } = await supabase.from('channels').delete().eq('id', channelId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

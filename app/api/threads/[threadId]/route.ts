import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const { threadId } = await params
  const supabase = await createClient()

  const { data: thread, error } = await supabase
    .from('threads')
    .select(`
      *,
      profiles:author_id (username, display_name, avatar_url),
      communities:community_id (name, slug)
    `)
    .eq('id', threadId)
    .eq('is_deleted', false)
    .single()

  if (error || !thread) {
    return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
  }

  return NextResponse.json(thread)
}

// Delete a thread (only author can delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const { threadId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check if user is the author
  const { data: thread } = await supabase
    .from('threads')
    .select('author_id')
    .eq('id', threadId)
    .single()

  if (!thread) return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
  if (thread.author_id !== user.id) {
    return NextResponse.json({ error: 'Only the author can delete this thread' }, { status: 403 })
  }

  // Soft delete the thread
  const { error } = await supabase
    .from('threads')
    .update({ is_deleted: true })
    .eq('id', threadId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

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

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ids = request.nextUrl.searchParams.get('ids')?.split(',').filter(Boolean) ?? []

  if (ids.length === 0) {
    return NextResponse.json([])
  }

  const { data, error } = await supabase
    .from('activity_feed')
    .select('*')
    .in('community_id', ids)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

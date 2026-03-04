import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const query = searchParams.get('q')?.trim() ?? ''
  const platform = searchParams.get('platform') ?? ''
  const tag = searchParams.get('tag') ?? ''

  const supabase = await createClient()

  let dbQuery = supabase
    .from('communities')
    .select('*')
    .eq('is_nsfw', false)
    .order('name', { ascending: true })
    .limit(50)

  // Search by name (case-insensitive partial match)
  if (query) {
    dbQuery = dbQuery.ilike('name', `%${query}%`)
  }

  // Filter by platform tag
  if (platform) {
    dbQuery = dbQuery.contains('game_tags', [platform])
  }

  // Filter by genre/tag
  if (tag) {
    dbQuery = dbQuery.contains('game_tags', [tag])
  }

  const { data, error } = await dbQuery

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ communities: data ?? [] })
}

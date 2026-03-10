import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const slug = searchParams.get('slug')
  const query = searchParams.get('q')?.trim() ?? ''
  const platform = searchParams.get('platform') ?? ''
  const tag = searchParams.get('tag') ?? ''

  const supabase = await createClient()

  // If slug is provided, return that single community
  if (slug) {
    const { data, error } = await supabase
      .from('communities')
      .select('*')
      .eq('slug', slug)
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 404 })
    return NextResponse.json([data])
  }

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

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const slug = searchParams.get('slug')
  const query = searchParams.get('q')?.trim() ?? ''
  const platform = searchParams.get('platform') ?? ''
  const tag = searchParams.get('tag') ?? ''
  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1)
  const limit = Math.min(
    50,
    Math.max(1, Number(searchParams.get('limit') ?? '21') || 21),
  )

  const supabase = await createClient()

  // If slug is provided, return that single community
  if (slug) {
    const { data, error } = await supabase
      .from('communities')
      .select('*')
      .eq('slug', slug)
      .eq('is_deleted', false)
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 404 })
    return NextResponse.json([data])
  }

  let dbQuery = supabase
    .from('communities')
    .select(
      `
      id,
      name,
      slug,
      description,
      icon_url,
      game_tags,
      platforms,
      channels (
        id, 
        messages (
          content,
          created_at
        )
      ),
      community_members (
        user_id
      )
      `,
      { count: 'exact' },
    )
    .eq('is_nsfw', false)
    .eq('is_deleted', false)
    .order('name', { ascending: true })
    .range((page - 1) * limit, page * limit - 1)

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

  const { data, error, count } = await dbQuery

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const enriched = (data ?? []).map((community) => {
    // Member Count
    const member_count = community.community_members?.length || 0

    // Get last message from all channels
    let last_message: string | null = null
    let last_message_time: string | null = null

    community.channels?.forEach((channel: any) => {
      channel.messages?.forEach((msg: any) => {
        if (
          !last_message_time ||
          new Date(msg.created_at) > new Date(last_message_time)
        ) {
          last_message = msg.content
          last_message_time = msg.created_at
        }
      })
    })

    return {
      id: community.id,
      name: community.name,
      slug: community.slug,
      description: community.description,
      icon_url: community.icon_url,
      game_tags: community.game_tags,
      platforms: community.platforms,
      member_count,
      last_message,
      last_message_time,
    }
  })

  return NextResponse.json({
    communities: enriched,
    page,
    limit,
    total: count ?? 0,
    total_pages: Math.max(1, Math.ceil((count ?? 0) / limit)),
  })
}

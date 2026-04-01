import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user's current communities
  const { data: memberships } = await supabase
    .from('community_members')
    .select('community_id, communities(game_tags, category)')
    .eq('user_id', user.id)

  const joinedIds = memberships?.map(m => m.community_id) || []
  
  // Extract user's game preferences from joined communities
  const userGameTags: string[] = []
  const userCategories: string[] = []
  
  memberships?.forEach(m => {
    const community = m.communities as { game_tags: string[] | null; category: string | null } | null
    if (community?.game_tags) {
      userGameTags.push(...community.game_tags)
    }
    if (community?.category) {
      userCategories.push(community.category)
    }
  })

  // Get unique tags for "based on" display
  const basedOn = [...new Set(userGameTags)].slice(0, 3)

  // Get communities the user hasn't joined
  let query = supabase
    .from('communities')
    .select('id, name, slug, description, icon_url, game_tags, category')
    .eq('is_deleted', false)
    .limit(20)

  if (joinedIds.length > 0) {
    query = query.not('id', 'in', `(${joinedIds.join(',')})`)
  }

  const { data: communities } = await query

  if (!communities || communities.length === 0) {
    return NextResponse.json({ communities: [], based_on: [] })
  }

  // Score communities based on matching tags and categories
  const scored = communities.map(community => {
    let score = 0
    let matchReason = ''

    // Check game tag matches
    const communityTags = community.game_tags || []
    const tagMatches = communityTags.filter((tag: string) => 
      userGameTags.some(ut => ut.toLowerCase() === tag.toLowerCase())
    )
    
    if (tagMatches.length > 0) {
      score += tagMatches.length * 10
      matchReason = tagMatches[0]
    }

    // Check category match
    if (community.category && userCategories.includes(community.category)) {
      score += 5
      if (!matchReason) matchReason = community.category
    }

    // Boost popular communities (placeholder - would use actual member count)
    score += Math.random() * 5 // Random boost for variety

    return {
      ...community,
      score,
      match_reason: matchReason,
      member_count: Math.floor(Math.random() * 500) + 10, // Placeholder
    }
  })

  // Sort by score and return top recommendations
  const sorted = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)

  return NextResponse.json({
    communities: sorted,
    based_on: basedOn,
  })
}

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Popular games list for suggestions
const POPULAR_GAMES = [
  'Valorant', 'League of Legends', 'Fortnite', 'Apex Legends', 
  'Call of Duty', 'Minecraft', 'Rocket League', 'Overwatch 2',
  'Counter-Strike 2', 'Destiny 2', 'Rainbow Six Siege', 'Helldivers 2',
  'Elden Ring', 'Monster Hunter', 'Baldur\'s Gate 3', 'Palworld'
]

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get active squad requests (not expired) with profiles
  const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
  
  const { data: requests, error } = await supabase
    .from('squad_requests')
    .select(`
      *,
      profile:profiles!user_id(id, username, display_name, avatar_url, play_style)
    `)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    // If table doesn't exist, return mock data for demo
    return NextResponse.json({ 
      requests: [],
      popular_games: POPULAR_GAMES,
      message: 'Squad system ready - run migration to enable'
    })
  }

  return NextResponse.json({ requests, popular_games: POPULAR_GAMES })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { game, platform, play_style, message, max_players } = body

  if (!game) {
    return NextResponse.json({ error: 'Game is required' }, { status: 400 })
  }

  // Upsert squad request (one per game per user)
  const { data, error } = await supabase
    .from('squad_requests')
    .upsert({
      user_id: user.id,
      game,
      platform,
      play_style,
      message,
      max_players: max_players || 4,
      expires_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
    }, { onConflict: 'user_id,game' })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ request: data })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('squad_requests')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

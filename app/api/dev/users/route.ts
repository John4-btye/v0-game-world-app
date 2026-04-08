import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Fake users with UUID-like IDs to prevent collisions
const FAKE_USERS = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    username: 'shadowblade',
    display_name: 'ShadowBlade',
    avatar_url: null,
    status: 'online',
    isRealUser: false,
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    username: 'pixelwarrior',
    display_name: 'PixelWarrior',
    avatar_url: null,
    status: 'online',
    isRealUser: false,
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    username: 'nightowl_gamer',
    display_name: 'NightOwl',
    avatar_url: null,
    status: 'away',
    isRealUser: false,
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    username: 'prosniper99',
    display_name: 'ProSniper99',
    avatar_url: null,
    status: 'offline',
    isRealUser: false,
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    username: 'speedrunner',
    display_name: 'SpeedRunner',
    avatar_url: null,
    status: 'online',
    isRealUser: false,
  },
]

export async function GET() {
  const supabase = await createClient()
  
  try {
    // Try to get real authenticated user
    const { data: { user } } = await supabase.auth.getUser()
    
    let realUser = null
    
    if (user) {
      // Fetch profile for the real user
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .eq('id', user.id)
        .single()
      
      if (profile) {
        realUser = {
          id: profile.id,
          username: profile.username || 'unknown',
          display_name: profile.display_name || profile.username || 'You',
          avatar_url: profile.avatar_url,
          status: 'online',
          isRealUser: true,
        }
        console.log('[v0 DevUsers API] Real user found:', { id: realUser.id, username: realUser.username })
      } else {
        console.log('[v0 DevUsers API] No profile found for user:', user.id)
      }
    } else {
      console.log('[v0 DevUsers API] No authenticated user')
    }
    
    // Combine: real user first (if exists), then fake users
    const users = realUser ? [realUser, ...FAKE_USERS] : FAKE_USERS
    
    console.log('[v0 DevUsers API] Returning', users.length, 'users')
    
    return NextResponse.json({ users })
  } catch (error) {
    console.log('[v0 DevUsers API] Error:', error)
    // On error, return just fake users
    return NextResponse.json({ users: FAKE_USERS })
  }
}

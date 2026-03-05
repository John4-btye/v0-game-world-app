import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET: List members of a community with profiles
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ communityId: string }> },
) {
  const { communityId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: members, error } = await supabase
    .from('community_members')
    .select('user_id, role, joined_at')
    .eq('community_id', communityId)
    .order('joined_at', { ascending: true })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const userIds = (members ?? []).map((m) => m.user_id)
  let profiles: Record<string, { id: string; username: string; display_name: string | null; avatar_url: string | null }> = {}

  if (userIds.length > 0) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url')
      .in('id', userIds)
    profiles = Object.fromEntries((profileData ?? []).map((p) => [p.id, p]))
  }

  // Get friendship statuses for the current user
  const otherIds = userIds.filter((id) => id !== user.id)
  let friendships: Record<string, { id: string; status: string }> = {}

  if (otherIds.length > 0) {
    const { data: fData } = await supabase
      .from('friendships')
      .select('id, requester_id, addressee_id, status')
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)

    for (const f of fData ?? []) {
      const otherId = f.requester_id === user.id ? f.addressee_id : f.requester_id
      if (otherIds.includes(otherId)) {
        friendships[otherId] = { id: f.id, status: f.status }
      }
    }
  }

  const enriched = (members ?? []).map((m) => ({
    user_id: m.user_id,
    role: m.role,
    profile: profiles[m.user_id] ?? null,
    friendship: friendships[m.user_id] ?? null,
    is_self: m.user_id === user.id,
  }))

  return NextResponse.json(enriched)
}

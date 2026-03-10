import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await supabase.from('user_presence').upsert({
    user_id: user.id,
    status: 'online',
    last_seen: new Date().toISOString(),
  }, { onConflict: 'user_id' })

  return NextResponse.json({ ok: true })
}

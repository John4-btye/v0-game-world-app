'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePresence() {
  useEffect(() => {
    const supabase = createClient()
    let interval: NodeJS.Timeout

    async function updatePresence() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase.from('user_presence').upsert({
        user_id: user.id,
        status: 'online',
        last_seen: new Date().toISOString(),
      }, { onConflict: 'user_id' })
    }

    updatePresence()
    interval = setInterval(updatePresence, 60000) // Update every minute

    // Set offline on unmount
    return () => {
      clearInterval(interval)
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          supabase.from('user_presence').update({ status: 'offline' }).eq('user_id', user.id)
        }
      })
    }
  }, [])
}

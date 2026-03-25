'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface Activity {
  id: string
  type: string
  message: string
  community_id: string
  actor_id: string | null
  created_at: string
}

export function LiveActivityFeed({ communityIds }: { communityIds: string[] }) {
  const [pulse, setPulse] = useState(false)
  const { data: activities, mutate } = useSWR<Activity[]>(
    communityIds.length > 0 ? `/api/activity?ids=${communityIds.join(',')}` : null,
    fetcher
  )

  // Subscribe to realtime activity updates
  useEffect(() => {
    if (communityIds.length === 0) return
    const supabase = createClient()
    const channel = supabase
      .channel('live-activity')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'activity_feed',
      }, () => {
        setPulse(true)
        mutate()
        setTimeout(() => setPulse(false), 1000)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [communityIds, mutate])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'join': return '👋'
      case 'thread': return '💬'
      case 'game': return '🎮'
      case 'lfg': return '🔍'
      default: return '⚡'
    }
  }

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          <h2 className="text-sm font-semibold text-foreground" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
            Live Activity
          </h2>
        </div>
        <p className="text-xs text-muted-foreground text-center py-4">
          No recent activity. Join communities to see what&apos;s happening!
        </p>
      </div>
    )
  }

  return (
    <div className={`relative rounded-xl border border-border bg-card p-4 transition-all overflow-hidden ${pulse ? 'ring-2 ring-primary/30' : ''}`}>
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      <div className="relative flex items-center gap-2 mb-3">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500 glow-sm" style={{ boxShadow: '0 0 8px rgb(34 197 94 / 0.5)' }} />
        </span>
        <h2 className="text-sm font-semibold text-gradient" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
          Live Activity
        </h2>
        <span className="ml-auto px-2 py-0.5 text-[10px] text-primary bg-primary/10 rounded-full uppercase tracking-wider font-medium">Real-time</span>
      </div>
      <div className="relative flex flex-col gap-2 max-h-48 overflow-y-auto">
        {activities.slice(0, 8).map((item, i) => (
          <div
            key={item.id}
            className={`flex items-center gap-2 text-xs p-2 rounded-lg hover:bg-muted/50 transition-all duration-200 hover:translate-x-1 ${i === 0 && pulse ? 'bg-primary/10 animate-slide-up-fade glow-sm' : ''}`}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <span className="text-base transition-transform hover:scale-110">{getActivityIcon(item.type)}</span>
            <span className="text-muted-foreground flex-1 truncate">{item.message}</span>
            <span className="text-muted-foreground/60 shrink-0 text-[10px]">{timeAgo(item.created_at)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

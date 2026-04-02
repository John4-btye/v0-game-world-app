'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface ActivityItem {
  id: string
  type: 'message' | 'thread' | 'join' | 'channel'
  community_name: string
  community_slug: string
  channel_name?: string
  user_name: string
  preview?: string
  created_at: string
}

export function LiveActivityFeed({ communityIds }: { communityIds: string[] }) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecentActivity = async () => {
      if (communityIds.length === 0) {
        setLoading(false)
        return
      }

      const supabase = createClient()
      
      // Get recent messages from communities
      const { data: messages } = await supabase
        .from('channel_messages')
        .select(`
          id, content, created_at,
          channels!inner(name, community_id, communities!inner(name, slug)),
          profiles!inner(display_name, username)
        `)
        .in('channels.community_id', communityIds)
        .order('created_at', { ascending: false })
        .limit(10)

      const activityItems: ActivityItem[] = (messages || []).map((m: any) => ({
        id: m.id,
        type: 'message',
        community_name: m.channels?.communities?.name || 'Unknown',
        community_slug: m.channels?.communities?.slug || '',
        channel_name: m.channels?.name,
        user_name: m.profiles?.display_name || m.profiles?.username || 'Someone',
        preview: m.content?.slice(0, 50) + (m.content?.length > 50 ? '...' : ''),
        created_at: m.created_at,
      }))

      setActivities(activityItems.slice(0, 5))
      setLoading(false)
    }

    fetchRecentActivity()

    // Subscribe to real-time updates
    if (communityIds.length > 0) {
      const supabase = createClient()
      const channel = supabase
        .channel('activity-feed')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'channel_messages',
        }, () => fetchRecentActivity())
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    }
  }, [communityIds])

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <h2 className="text-sm font-semibold text-foreground" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
            Live Activity
          </h2>
        </div>
        <div className="flex items-center justify-center py-6">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
        </span>
        <h2 className="text-sm font-semibold text-foreground" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
          Live Activity
        </h2>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-10">
          <div className="mx-auto h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-3">
            <svg className="h-7 w-7 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-foreground mb-1">Waiting for activity...</p>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            {communityIds.length > 0 
              ? "Your communities are quiet right now. Be the first to start a conversation!"
              : "Join communities to see live activity from your gaming groups"
            }
          </p>
          {communityIds.length > 0 && (
            <a 
              href="/communities" 
              className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Start chatting
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {activities.map((activity, i) => (
            <Link
              key={activity.id}
              href={`/communities/${activity.community_slug}`}
              className={`group flex items-start gap-2.5 p-2 rounded-lg transition-all duration-200 hover:bg-muted/50 ${
                i === 0 ? 'bg-primary/5 border border-primary/10' : ''
              }`}
            >
              <div className="shrink-0 mt-0.5">
                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  i === 0 ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                }`}>
                  {activity.user_name[0].toUpperCase()}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                    {activity.user_name}
                  </span>
                  <span className="text-muted-foreground shrink-0">in</span>
                  <span className="text-primary/80 truncate">#{activity.channel_name}</span>
                </div>
                {activity.preview && (
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">{activity.preview}</p>
                )}
                <span className="text-[10px] text-muted-foreground/70">{timeAgo(activity.created_at)}</span>
              </div>
              {i === 0 && (
                <span className="shrink-0 px-1.5 py-0.5 text-[9px] font-medium bg-primary/20 text-primary rounded-full">
                  New
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

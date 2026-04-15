'use client'

import useSWR from 'swr'
import Link from 'next/link'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface ActivityItem {
  id: string
  type: 'message' | 'dm' | 'friend_accept' | 'community_join'
  actor: {
    username: string
    display_name: string | null
    avatar_url: string | null
  }
  description: string
  link?: string
  created_at: string
}

interface DashboardData {
  activityFeed: ActivityItem[]
  onlineFriendsCount: number
  totalFriendsCount: number
}

export function LiveActivityFeed() {
  const { data, isLoading } = useSWR<DashboardData>('/api/dashboard', fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
  })

  const activities = data?.activityFeed ?? []

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'dm':
        return (
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )
      case 'friend_accept':
        return (
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        )
      case 'community_join':
        return (
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )
      default:
        return (
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        )
    }
  }

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'dm':
        return 'text-blue-500 bg-blue-500/20'
      case 'friend_accept':
        return 'text-green-500 bg-green-500/20'
      case 'community_join':
        return 'text-purple-500 bg-purple-500/20'
      default:
        return 'text-primary bg-primary/20'
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <h2 className="text-sm font-semibold text-foreground" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
            Activity Feed
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
          Activity Feed
        </h2>
        {data?.onlineFriendsCount && data.onlineFriendsCount > 0 && (
          <span className="ml-auto text-[10px] text-green-500 font-medium flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            {data.onlineFriendsCount} friend{data.onlineFriendsCount !== 1 ? 's' : ''} online
          </span>
        )}
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
            Your activity feed will show messages, friend requests, and community updates
          </p>
          <Link 
            href="/communities" 
            className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Start chatting
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {activities.map((activity, i) => (
            <Link
              key={activity.id}
              href={activity.link ?? '#'}
              className={`group flex items-start gap-2.5 p-2.5 rounded-lg transition-all duration-200 hover:bg-muted/50 ${
                i === 0 ? 'bg-primary/5 border border-primary/10' : ''
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {activity.actor.avatar_url ? (
                  <img 
                    src={activity.actor.avatar_url} 
                    alt="" 
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    i === 0 ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                  }`}>
                    {(activity.actor.display_name ?? activity.actor.username)[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-xs flex-wrap">
                  <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {activity.actor.display_name ?? activity.actor.username}
                  </span>
                  <span className="text-muted-foreground">{activity.description}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                    {activity.type === 'dm' ? 'Message' : activity.type === 'friend_accept' ? 'Friend' : activity.type === 'community_join' ? 'Joined' : 'Activity'}
                  </span>
                  <span className="text-[10px] text-muted-foreground/70">{timeAgo(activity.created_at)}</span>
                </div>
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

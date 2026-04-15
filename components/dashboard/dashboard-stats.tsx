'use client'

import useSWR from 'swr'
import Link from 'next/link'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface DashboardData {
  onlineFriendsCount: number
  totalFriendsCount: number
  unreadDmCount: number
  jumpBackIn: {
    lastChannel: { id: string; name: string; communityName: string; communitySlug: string } | null
    lastDm: { id: string; partnerName: string } | null
  }
}

export function DashboardStats() {
  const { data } = useSWR<DashboardData>('/api/dashboard', fetcher)

  return (
    <div className="flex flex-wrap gap-3">
      {/* Online Friends */}
      <Link
        href="/friends"
        className="group flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 hover:border-green-500/40 hover:bg-green-500/5 transition-all"
      >
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          <span className="text-sm font-semibold text-foreground">
            {data?.onlineFriendsCount ?? 0}
          </span>
        </div>
        <span className="text-xs text-muted-foreground group-hover:text-green-500 transition-colors">
          friends online
        </span>
      </Link>

      {/* Unread Messages */}
      {(data?.unreadDmCount ?? 0) > 0 && (
        <Link
          href="/messages"
          className="group flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5 hover:border-primary/50 hover:bg-primary/10 transition-all"
        >
          <div className="flex items-center gap-1.5">
            <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-semibold text-primary">
              {data.unreadDmCount}
            </span>
          </div>
          <span className="text-xs text-primary/80 group-hover:text-primary transition-colors">
            new messages
          </span>
        </Link>
      )}

      {/* Quick Jump - Last Channel */}
      {data?.jumpBackIn.lastChannel && (
        <Link
          href={`/communities/${data.jumpBackIn.lastChannel.communitySlug}?channel=${data.jumpBackIn.lastChannel.id}`}
          className="group flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 hover:border-primary/40 hover:bg-primary/5 transition-all"
        >
          <svg className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors truncate max-w-[120px]">
            #{data.jumpBackIn.lastChannel.name}
          </span>
        </Link>
      )}
    </div>
  )
}

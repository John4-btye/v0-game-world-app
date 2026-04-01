'use client'

import useSWR from 'swr'
import Link from 'next/link'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface Conversation {
  id: string
  partner: {
    id: string
    username: string
    display_name: string | null
    avatar_url: string | null
  }
  last_message: {
    content: string
    created_at: string
  } | null
  unread_count?: number
}

export function RecentConversations() {
  const { data: conversations } = useSWR<Conversation[]>('/api/dm', fetcher)

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
    return `${Math.floor(seconds / 86400)}d`
  }

  const recentConvos = conversations?.slice(0, 4) ?? []

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-foreground" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
          Recent Conversations
        </h2>
        <Link href="/messages" className="text-[10px] text-primary hover:text-primary/80 font-medium transition-colors">
          View all
        </Link>
      </div>

      {recentConvos.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground mb-2">No conversations yet</p>
          <Link 
            href="/friends" 
            className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Start chatting
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {recentConvos.map((convo) => {
            const displayName = convo.partner.display_name ?? convo.partner.username
            return (
              <Link
                key={convo.id}
                href={`/messages/${convo.id}`}
                className="group flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/50 transition-all duration-150"
              >
                <div className="relative shrink-0">
                  {convo.partner.avatar_url ? (
                    <img 
                      src={convo.partner.avatar_url} 
                      alt="" 
                      className="h-8 w-8 rounded-full object-cover ring-1 ring-border group-hover:ring-primary/30 transition-all" 
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                      {displayName[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {displayName}
                    </p>
                    {convo.last_message && (
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {timeAgo(convo.last_message.created_at)}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {convo.last_message?.content ?? 'No messages yet'}
                  </p>
                </div>
                <svg className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

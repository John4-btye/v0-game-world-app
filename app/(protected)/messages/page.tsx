'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface ConversationItem {
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
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchConversations = async () => {
      const res = await fetch('/api/dm')
      const data = await res.json()
      setConversations(Array.isArray(data) ? data : [])
      setLoading(false)
    }
    fetchConversations()
  }, [])

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)
    if (diffHours < 1) return `${Math.max(1, Math.round(diffMs / 60000))}m ago`
    if (diffHours < 24) return `${Math.round(diffHours)}h ago`
    return d.toLocaleDateString()
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-foreground">Messages</h1>

      {loading ? (
        <div className="rounded-lg border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">Loading conversations...</p>
        </div>
      ) : conversations.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-muted-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="mt-4 text-sm font-medium text-foreground">No conversations yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Start a conversation from your friends list or a community chat.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {conversations.map((convo) => {
            const displayName = convo.partner.display_name ?? convo.partner.username
            return (
              <Link
                key={convo.id}
                href={`/messages/${convo.id}`}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 hover:bg-secondary/50 transition-colors"
              >
                {convo.partner.avatar_url ? (
                  <img
                    src={convo.partner.avatar_url}
                    alt={`${displayName}'s avatar`}
                    className="h-10 w-10 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                    {displayName[0]?.toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
                    {convo.last_message && (
                      <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                        {formatTime(convo.last_message.created_at)}
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {convo.last_message?.content ?? 'No messages yet'}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

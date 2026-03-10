'use client'

import Link from 'next/link'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface Notification {
  id: string
  type: string
  title: string
  body: string | null
  link: string | null
  is_read: boolean
  created_at: string
}

export default function NotificationsPage() {
  const { data: notifications, mutate } = useSWR<Notification[]>('/api/notifications', fetcher)

  const markAsRead = async (id: string) => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    mutate()
  }

  const markAllRead = async () => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAllRead: true }),
    })
    mutate()
  }

  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  const unreadCount = notifications?.filter(n => !n.is_read).length ?? 0

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-outfit)' }}>
          Notifications
        </h1>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-sm text-primary hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="space-y-2">
        {notifications?.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No notifications yet</p>
        )}
        {notifications?.map((n) => (
          <Link
            key={n.id}
            href={n.link || '#'}
            onClick={() => markAsRead(n.id)}
            className={`flex items-start gap-4 rounded-xl border border-border p-4 transition-all hover:border-primary/40 ${!n.is_read ? 'bg-primary/5' : 'bg-card'}`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
              {n.type === 'friend_request' && (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              )}
              {n.type === 'thread_reply' && (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              )}
              {n.type === 'message' && (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground">{n.title}</p>
              {n.body && <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">{n.body}</p>}
              <p className="mt-1 text-xs text-muted-foreground">{formatDate(n.created_at)}</p>
            </div>
            {!n.is_read && (
              <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}

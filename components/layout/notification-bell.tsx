'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface Notification {
  id: string
  title: string
  body: string | null
  link: string | null
  is_read: boolean
  created_at: string
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const { data: notifications, mutate } = useSWR<Notification[]>('/api/notifications', fetcher, {
    refreshInterval: 0, // Disable polling, use realtime
  })

  // Subscribe to realtime notifications
  useEffect(() => {
    const supabase = createClient()
    
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const channel = supabase
        .channel('notifications-realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            mutate() // Refetch on new notification
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            mutate() // Refetch on update (mark as read)
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }

    setupSubscription()
  }, [mutate])

  const unreadCount = notifications?.filter(n => !n.is_read).length ?? 0

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

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        aria-label="Notifications"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground animate-subtle-pulse">
            <span className="absolute inset-0 rounded-full bg-destructive animate-ping opacity-40" />
            <span className="relative">{unreadCount > 9 ? '9+' : unreadCount}</span>
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-border bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border p-3">
              <span className="text-sm font-semibold text-foreground">Notifications</span>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-primary hover:underline">
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications?.length === 0 ? (
                <p className="p-4 text-center text-sm text-muted-foreground">No notifications</p>
              ) : (
                notifications?.slice(0, 10).map((n) => (
                  <Link
                    key={n.id}
                    href={n.link || '#'}
                    onClick={() => { markAsRead(n.id); setOpen(false) }}
                    className={`block border-b border-border p-3 transition-colors hover:bg-secondary ${!n.is_read ? 'bg-primary/5' : ''}`}
                  >
                    <p className="text-sm font-medium text-foreground">{n.title}</p>
                    {n.body && <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{n.body}</p>}
                  </Link>
                ))
              )}
            </div>
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="block border-t border-border p-2 text-center text-xs text-primary hover:bg-secondary"
            >
              View all notifications
            </Link>
          </div>
        </>
      )}
    </div>
  )
}

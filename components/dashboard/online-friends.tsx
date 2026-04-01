'use client'

import { useEffect } from 'react'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface Friend {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  status: 'online' | 'away' | 'offline'
}

export function OnlineFriends() {
  const { data: friends, mutate } = useSWR<Friend[]>('/api/friends/online', fetcher)

  // Subscribe to presence changes
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('friends-presence')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_presence',
      }, () => mutate())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [mutate])

  const onlineFriends = friends?.filter(f => f.status === 'online') ?? []
  const awayFriends = friends?.filter(f => f.status === 'away') ?? []

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-foreground" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
          Friends
        </h2>
        <span className="text-[10px] text-muted-foreground">
          {onlineFriends.length} online
        </span>
      </div>

      {(!friends || friends.length === 0) ? (
        <div className="text-center py-5">
          <div className="mx-auto h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-2">
            <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-xs text-muted-foreground mb-2">No friends yet</p>
          <Link 
            href="/communities" 
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Join a community to meet people
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {onlineFriends.slice(0, 5).map((friend) => (
            <Link
              key={friend.id}
              href={`/messages?user=${friend.id}`}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted/50 transition-colors group"
            >
              <div className="relative">
                {friend.avatar_url ? (
                  <img src={friend.avatar_url} alt="" className="h-7 w-7 rounded-full object-cover" />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                    {(friend.display_name || friend.username)[0].toUpperCase()}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-card" />
              </div>
              <span className="text-xs text-foreground truncate group-hover:text-primary transition-colors">
                {friend.display_name || friend.username}
              </span>
            </Link>
          ))}
          {awayFriends.slice(0, 3).map((friend) => (
            <Link
              key={friend.id}
              href={`/messages?user=${friend.id}`}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted/50 transition-colors group opacity-60"
            >
              <div className="relative">
                {friend.avatar_url ? (
                  <img src={friend.avatar_url} alt="" className="h-7 w-7 rounded-full object-cover" />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                    {(friend.display_name || friend.username)[0].toUpperCase()}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-yellow-500 ring-2 ring-card" />
              </div>
              <span className="text-xs text-muted-foreground truncate group-hover:text-foreground transition-colors">
                {friend.display_name || friend.username}
              </span>
            </Link>
          ))}
          {friends.length > 8 && (
            <Link href="/friends" className="text-[10px] text-primary hover:underline text-center mt-1">
              View all friends
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { FriendCard } from '@/components/friends/friend-card'
import { createClient } from '@/lib/supabase/client'

type Tab = 'accepted' | 'pending' | 'blocked'

interface EnrichedFriendship {
  id: string
  requester_id: string
  addressee_id: string
  status: string
  friend_profile: {
    id: string
    username: string
    display_name: string | null
    avatar_url: string | null
  } | null
  is_requester: boolean
}

export default function FriendsPage() {
  const [tab, setTab] = useState<Tab>('accepted')
  const [friends, setFriends] = useState<EnrichedFriendship[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
    }
    getUser()
  }, [])

  useEffect(() => {
    const fetchFriends = async () => {
      setLoading(true)
      const res = await fetch(`/api/friends?status=${tab}`)
      const data = await res.json()
      setFriends(Array.isArray(data) ? data : [])
      setLoading(false)
    }
    fetchFriends()
  }, [tab])

  const filtered = friends.filter((f) => {
    if (!search) return true
    const name = f.friend_profile?.display_name ?? f.friend_profile?.username ?? ''
    return name.toLowerCase().includes(search.toLowerCase())
  })

  const tabs: { label: string; value: Tab }[] = [
    { label: 'All Friends', value: 'accepted' },
    { label: 'Pending', value: 'pending' },
    { label: 'Blocked', value: 'blocked' },
  ]

  const pendingIncoming = tab === 'pending' ? filtered.filter((f) => !f.is_requester) : []
  const pendingOutgoing = tab === 'pending' ? filtered.filter((f) => f.is_requester) : []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Friends</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 active:scale-95 ${
              tab === t.value
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-md'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative group">
        <svg
          className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search friends..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-border bg-input py-2.5 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary hover:border-primary/30"
        />
      </div>

      {/* Friends list */}
      {loading ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-3 text-sm text-muted-foreground">Loading...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-10 text-center transition-all duration-200 hover:border-primary/30">
          <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <svg className="h-6 w-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {tab === 'accepted' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />}
              {tab === 'pending' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
              {tab === 'blocked' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />}
            </svg>
          </div>
          <p className="text-sm font-medium text-foreground mb-1">
            {tab === 'accepted' && 'No friends yet'}
            {tab === 'pending' && 'No pending requests'}
            {tab === 'blocked' && 'No blocked users'}
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            {tab === 'accepted' && 'Join communities and chat to meet new people'}
            {tab === 'pending' && 'Friend requests you send or receive will appear here'}
            {tab === 'blocked' && 'Users you block will appear here'}
          </p>
          {tab === 'accepted' && (
            <a 
              href="/communities" 
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all active:scale-95"
            >
              Find your community
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          )}
        </div>
      ) : tab === 'pending' ? (
        <div className="flex flex-col gap-4">
          {pendingIncoming.length > 0 && (
            <div>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Incoming Requests ({pendingIncoming.length})
              </h2>
              <div className="flex flex-col gap-2">
                {pendingIncoming.map((f) =>
                  f.friend_profile && userId ? (
                    <FriendCard
                      key={f.id}
                      friendshipId={f.id}
                      profile={f.friend_profile}
                      status="pending"
                      isRequester={false}
                      currentUserId={userId}
                    />
                  ) : null,
                )}
              </div>
            </div>
          )}
          {pendingOutgoing.length > 0 && (
            <div>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Sent Requests ({pendingOutgoing.length})
              </h2>
              <div className="flex flex-col gap-2">
                {pendingOutgoing.map((f) =>
                  f.friend_profile && userId ? (
                    <FriendCard
                      key={f.id}
                      friendshipId={f.id}
                      profile={f.friend_profile}
                      status="pending"
                      isRequester={true}
                      currentUserId={userId}
                    />
                  ) : null,
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((f) =>
            f.friend_profile && userId ? (
              <FriendCard
                key={f.id}
                friendshipId={f.id}
                profile={f.friend_profile}
                status={tab}
                isRequester={f.is_requester}
                currentUserId={userId}
              />
            ) : null,
          )}
        </div>
      )}
    </div>
  )
}

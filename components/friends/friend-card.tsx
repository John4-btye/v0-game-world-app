'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface FriendCardProps {
  friendshipId: string
  profile: {
    id: string
    username: string
    display_name: string | null
    avatar_url: string | null
  }
  status: 'accepted' | 'pending' | 'blocked'
  isRequester: boolean
  currentUserId: string
  onlineStatus?: 'online' | 'away' | 'offline'
  lastSeen?: string
}

export function FriendCard({
  friendshipId,
  profile,
  status,
  isRequester,
  currentUserId,
  onlineStatus = 'offline',
  lastSeen,
}: FriendCardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [removed, setRemoved] = useState(false)

  const handleAction = async (action: 'accept' | 'block' | 'remove') => {
    setLoading(action)
    try {
      if (action === 'remove') {
        await fetch(`/api/friends/${friendshipId}`, { method: 'DELETE' })
        setRemoved(true)
      } else {
        await fetch(`/api/friends/${friendshipId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: action === 'accept' ? 'accepted' : 'blocked' }),
        })
        router.refresh()
      }
    } finally {
      setLoading(null)
    }
  }

  const handleMessage = async () => {
    setLoading('message')
    try {
      const res = await fetch('/api/dm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partner_id: profile.id }),
      })
      const data = await res.json()
      if (data.id) router.push(`/messages/${data.id}`)
    } finally {
      setLoading(null)
    }
  }

  if (removed) return null

  const displayName = profile.display_name ?? profile.username
  
  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }
  
  const statusColor = {
    online: 'bg-green-500',
    away: 'bg-yellow-500',
    offline: 'bg-muted-foreground/30',
  }[onlineStatus]

  return (
    <div className="group flex items-center justify-between rounded-xl border border-border bg-card p-3 transition-all duration-200 hover:border-primary/30 hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className="relative">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={`${displayName}'s avatar`}
              className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-border group-hover:ring-primary/30 transition-all"
            />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground ring-2 ring-border group-hover:ring-primary/30 transition-all">
              {displayName[0]?.toUpperCase()}
            </div>
          )}
          {/* Online indicator */}
          <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-card ${statusColor}`}>
            {onlineStatus === 'online' && (
              <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-50" />
            )}
          </span>
        </div>
        <div>
          <p className="text-sm font-semibold text-card-foreground group-hover:text-primary transition-colors">{displayName}</p>
          <div className="flex items-center gap-1.5">
            <p className="text-xs text-muted-foreground">@{profile.username}</p>
            {onlineStatus === 'online' && (
              <span className="text-[10px] text-green-500 font-medium">Online</span>
            )}
            {onlineStatus === 'away' && lastSeen && (
              <span className="text-[10px] text-muted-foreground">Active {timeAgo(lastSeen)}</span>
            )}
            {onlineStatus === 'offline' && lastSeen && (
              <span className="text-[10px] text-muted-foreground/70">Last seen {timeAgo(lastSeen)}</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {status === 'accepted' && (
          <>
            <button
              onClick={handleMessage}
              disabled={loading === 'message'}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 hover:shadow-md hover:shadow-primary/20 active:scale-95 transition-all disabled:opacity-50"
              title="Send message"
            >
              Message
            </button>
            <button
              onClick={() => handleAction('remove')}
              disabled={loading === 'remove'}
              className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground hover:bg-destructive hover:text-destructive-foreground active:scale-95 transition-all disabled:opacity-50"
              title="Remove friend"
            >
              Remove
            </button>
            <button
              onClick={() => handleAction('block')}
              disabled={loading === 'block'}
              className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground hover:bg-destructive hover:text-destructive-foreground active:scale-95 transition-all disabled:opacity-50"
              title="Block user"
            >
              Block
            </button>
          </>
        )}

        {status === 'pending' && !isRequester && (
          <>
            <button
              onClick={() => handleAction('accept')}
              disabled={loading === 'accept'}
              className="rounded-md bg-accent px-3 py-1 text-xs font-medium text-accent-foreground hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              Accept
            </button>
            <button
              onClick={() => handleAction('remove')}
              disabled={loading === 'remove'}
              className="rounded-md bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors disabled:opacity-50"
            >
              Decline
            </button>
          </>
        )}

        {status === 'pending' && isRequester && (
          <button
            onClick={() => handleAction('remove')}
            disabled={loading === 'remove'}
            className="rounded-md bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors disabled:opacity-50"
          >
            Cancel Request
          </button>
        )}

        {status === 'blocked' && (
          <button
            onClick={() => handleAction('remove')}
            disabled={loading === 'remove'}
            className="rounded-md bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors disabled:opacity-50"
          >
            Unblock
          </button>
        )}
      </div>
    </div>
  )
}

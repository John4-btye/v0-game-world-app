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
}

export function FriendCard({
  friendshipId,
  profile,
  status,
  isRequester,
  currentUserId,
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

  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
      <div className="flex items-center gap-3">
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={`${displayName}'s avatar`}
            className="h-10 w-10 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">
            {displayName[0]?.toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-card-foreground">{displayName}</p>
          <p className="text-xs text-muted-foreground">@{profile.username}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {status === 'accepted' && (
          <>
            <button
              onClick={handleMessage}
              disabled={loading === 'message'}
              className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              title="Send message"
            >
              Message
            </button>
            <button
              onClick={() => handleAction('remove')}
              disabled={loading === 'remove'}
              className="rounded-md bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors disabled:opacity-50"
              title="Remove friend"
            >
              Remove
            </button>
            <button
              onClick={() => handleAction('block')}
              disabled={loading === 'block'}
              className="rounded-md bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors disabled:opacity-50"
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

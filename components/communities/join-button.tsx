'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function JoinButton({
  communityId,
  isMember,
}: {
  communityId: string
  isMember: boolean
}) {
  const [joined, setJoined] = useState(isMember)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleToggle = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/communities/${communityId}/join`, {
        method: joined ? 'DELETE' : 'POST',
      })
      if (res.ok) {
        setJoined(!joined)
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
        joined
          ? 'bg-secondary text-secondary-foreground hover:bg-destructive hover:text-destructive-foreground'
          : 'bg-primary text-primary-foreground hover:bg-primary/90'
      }`}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {joined ? 'Leaving...' : 'Joining...'}
        </span>
      ) : joined ? (
        'Joined'
      ) : (
        'Join Community'
      )}
    </button>
  )
}

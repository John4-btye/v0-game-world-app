'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface AddFriendButtonProps {
  targetUserId: string
  /** Current friendship status with this user, if any */
  existingStatus?: 'pending' | 'accepted' | 'blocked' | null
  size?: 'sm' | 'md'
}

export function AddFriendButton({
  targetUserId,
  existingStatus = null,
  size = 'sm',
}: AddFriendButtonProps) {
  const [status, setStatus] = useState(existingStatus)
  const [loading, setLoading] = useState(false)

  const handleAdd = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addressee_id: targetUserId }),
      })
      if (res.ok) setStatus('pending')
    } finally {
      setLoading(false)
    }
  }

  const sizeClasses = size === 'sm' ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-sm'

  if (status === 'accepted') {
    return (
      <span className={`inline-flex items-center gap-1 rounded-md bg-accent/20 text-accent font-medium ${sizeClasses}`}>
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        Friends
      </span>
    )
  }

  if (status === 'pending') {
    return (
      <span className={`inline-flex items-center rounded-md bg-secondary text-muted-foreground font-medium ${sizeClasses}`}>
        Pending
      </span>
    )
  }

  if (status === 'blocked') return null

  return (
    <button
      onClick={handleAdd}
      disabled={loading}
      className={`inline-flex items-center gap-1 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 ${sizeClasses}`}
    >
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
      {loading ? 'Sending...' : 'Add Friend'}
    </button>
  )
}

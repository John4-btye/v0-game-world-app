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
      className={`group relative overflow-hidden rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 disabled:opacity-50 active:scale-95 ${
        joined
          ? 'bg-secondary text-secondary-foreground hover:bg-destructive hover:text-destructive-foreground hover:shadow-lg hover:shadow-destructive/20'
          : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30'
      }`}
    >
      {/* Shine effect on hover */}
      <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-500 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <span className="relative inline-flex items-center gap-2">
        {loading ? (
          <>
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {joined ? 'Leaving...' : 'Joining...'}
          </>
        ) : joined ? (
          <>
            <svg className="h-4 w-4 group-hover:hidden" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <svg className="h-4 w-4 hidden group-hover:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="group-hover:hidden">Joined</span>
            <span className="hidden group-hover:inline">Leave</span>
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Get Started
          </>
        )}
      </span>
    </button>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface DeleteCommunityButtonProps {
  communityId: string
  communityName: string
}

export function DeleteCommunityButton({ communityId, communityName }: DeleteCommunityButtonProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/communities/${communityId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        router.push('/communities')
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to delete community')
      }
    } catch {
      alert('Failed to delete community')
    } finally {
      setDeleting(false)
      setShowConfirm(false)
    }
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-destructive">Delete {communityName}?</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-2 py-1 text-xs font-medium text-destructive-foreground bg-destructive rounded hover:bg-destructive/90 disabled:opacity-50"
        >
          {deleting ? 'Deleting...' : 'Yes, Delete'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={deleting}
          className="px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="px-3 py-1.5 text-xs font-medium text-destructive border border-destructive/30 rounded-md hover:bg-destructive/10 transition-colors"
    >
      Delete Community
    </button>
  )
}

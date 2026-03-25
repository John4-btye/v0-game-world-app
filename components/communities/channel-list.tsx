'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface Channel {
  id: string
  name: string
  description: string | null
  created_by: string | null
}

export function ChannelList({
  channels,
  communityId,
  communitySlug,
  currentUserId,
  activeChannelId,
}: {
  channels: Channel[]
  communityId: string
  communitySlug: string
  currentUserId: string
  activeChannelId?: string
}) {
  const router = useRouter()
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)

  const handleCreate = async () => {
    if (!newName.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ communityId, name: newName.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        setNewName('')
        setShowCreate(false)
        router.refresh()
      } else {
        alert(data.error || 'Failed to create channel')
      }
    } catch (err) {
      alert('Failed to create channel. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (channelId: string) => {
    if (!confirm('Delete this channel? All messages will be lost.')) return
    const res = await fetch(`/api/channels/${channelId}`, { method: 'DELETE' })
    if (res.ok) router.refresh()
    else {
      const data = await res.json()
      alert(data.error || 'Failed to delete')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Channels
        </h2>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="text-xs text-primary hover:text-primary/80 transition-colors"
        >
          {showCreate ? 'Cancel' : '+ New'}
        </button>
      </div>

      {showCreate && (
        <div className="mb-3 flex gap-2">
          <input
            type="text"
            placeholder="Channel name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 rounded-md border border-border bg-input px-2 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <Button size="sm" onClick={handleCreate} disabled={creating || !newName.trim()}>
            {creating ? '...' : 'Add'}
          </Button>
        </div>
      )}

      <ul className="space-y-0.5">
        {channels.map((channel) => {
          const isActive = channel.id === activeChannelId
          const isCreator = channel.created_by === currentUserId
          return (
            <li key={channel.id} className="group flex items-center">
              <Link
                href={`/communities/${communitySlug}?channel=${channel.id}`}
                className={`flex-1 flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <span className="text-muted-foreground">#</span>
                <span className="truncate">{channel.name}</span>
              </Link>
              {isCreator && (
                <button
                  onClick={() => handleDelete(channel.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-destructive hover:text-destructive/80 transition-all"
                  title="Delete channel"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </li>
          )
        })}
        {channels.length === 0 && (
          <li className="text-xs text-muted-foreground py-2 text-center">No channels yet</li>
        )}
      </ul>
    </div>
  )
}

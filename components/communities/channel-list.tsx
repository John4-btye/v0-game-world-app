'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Channel {
  id: string
  name: string
  description: string | null
  created_by: string | null
}

export function ChannelList({
  channels: initialChannels,
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
  const [channels, setChannels] = useState<Channel[]>(initialChannels)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [newChannelId, setNewChannelId] = useState<string | null>(null)
  const [createSuccess, setCreateSuccess] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync with props
  useEffect(() => {
    setChannels(initialChannels)
  }, [initialChannels])

  // Focus input when create form opens
  useEffect(() => {
    if (showCreate) inputRef.current?.focus()
  }, [showCreate])

  // Clear new channel animation after delay
  useEffect(() => {
    if (newChannelId) {
      const timer = setTimeout(() => setNewChannelId(null), 500)
      return () => clearTimeout(timer)
    }
  }, [newChannelId])

  // Clear success message
  useEffect(() => {
    if (!createSuccess) return
    const timer = setTimeout(() => setCreateSuccess(null), 2500)
    return () => clearTimeout(timer)
  }, [createSuccess])

  const handleCreate = async () => {
    const name = newName.trim()
    if (!name) return
    setCreating(true)
    try {
      const res = await fetch('/api/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ community_id: communityId, name }),
      })
      const data = await res.json()
      if (res.ok) {
        // Optimistic update with animation
        const newChannel: Channel = { id: data.id, name, description: null, created_by: currentUserId }
        setChannels(prev => [...prev, newChannel])
        setNewChannelId(data.id)
        setCreateSuccess(`Created #${name}`)
        setNewName('')
        setShowCreate(false)
        router.refresh()
      } else {
        alert(data.error || 'Failed to create channel')
      }
    } catch {
      alert('Failed to create channel. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (channelId: string) => {
    if (!confirm('Delete this channel? All messages will be lost.')) return
    // Optimistic update
    setChannels(prev => prev.filter(c => c.id !== channelId))
    const res = await fetch(`/api/channels/${channelId}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json()
      alert(data.error || 'Failed to delete')
      router.refresh() // Revert on failure
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
          className={`text-xs font-medium transition-all duration-150 ${
            showCreate 
              ? 'text-muted-foreground hover:text-foreground' 
              : 'text-primary hover:text-primary/80'
          }`}
        >
          {showCreate ? 'Cancel' : '+ New'}
        </button>
      </div>

      {/* Create form with slide transition */}
      <div className={`overflow-hidden transition-all duration-200 ease-out ${showCreate ? 'max-h-20 opacity-100 mb-3' : 'max-h-0 opacity-0'}`}>
        <div className="flex items-stretch gap-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="Channel name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 h-8 rounded-md border border-border bg-input px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            onKeyDown={(e) => e.key === 'Enter' && !creating && handleCreate()}
          />
          <button
            onClick={handleCreate}
            disabled={creating || !newName.trim()}
            className="h-8 px-3 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
          >
            {creating ? 'Creating...' : 'Create'}
          </button>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Press Enter or click Create
        </p>
      </div>

      {createSuccess && (
        <div className="mb-2 flex items-center gap-2 rounded-md border border-border bg-primary/5 px-2 py-1 text-xs text-primary">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="truncate">{createSuccess}</span>
        </div>
      )}

      {/* Channel list with animations */}
      <ul className="space-y-0.5">
        {channels.map((channel) => {
          const isActive = channel.id === activeChannelId
          const isCreator = channel.created_by === currentUserId
          const isNew = channel.id === newChannelId
          return (
            <li
              key={channel.id}
              className={`group flex items-center transition-all duration-200 ${isNew ? 'animate-slide-up-fade' : ''}`}
            >
              <Link
                href={`/communities/${communitySlug}/${channel.id}`}
                className={`flex-1 flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-primary/15 text-primary font-medium shadow-sm'
                    : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                }`}
              >
                <span className={`transition-colors ${isActive ? 'text-primary/70' : 'text-muted-foreground/60'}`}>#</span>
                <span className="truncate">{channel.name}</span>
              </Link>
              {isCreator && (
                <button
                  onClick={() => handleDelete(channel.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-destructive/70 hover:text-destructive transition-all duration-150"
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
        {channels.length === 0 && !showCreate && (
          <li className="py-4 text-center">
            <p className="text-xs text-muted-foreground mb-2">No channels yet</p>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create one to start chatting
            </button>
          </li>
        )}
      </ul>
    </div>
  )
}

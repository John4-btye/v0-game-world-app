'use client'

import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import Link from 'next/link'

interface SquadRequest {
  id: string
  user_id: string
  game: string
  platform: string | null
  play_style: string | null
  message: string | null
  max_players: number
  expires_at: string
  created_at: string
  profile: {
    id: string
    username: string
    display_name: string | null
    avatar_url: string | null
    play_style: string | null
  }
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

const PLAY_STYLES = [
  { value: 'casual', label: 'Casual', icon: '🎮' },
  { value: 'competitive', label: 'Competitive', icon: '🏆' },
  { value: 'both', label: 'Any Style', icon: '⚡' },
]

const PLATFORMS = [
  { value: 'pc', label: 'PC' },
  { value: 'playstation', label: 'PlayStation' },
  { value: 'xbox', label: 'Xbox' },
  { value: 'switch', label: 'Switch' },
  { value: 'mobile', label: 'Mobile' },
]

export function SquadFinder() {
  const { data, error, isLoading } = useSWR('/api/squad', fetcher, { refreshInterval: 30000 })
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [form, setForm] = useState({
    game: '',
    platform: '',
    play_style: 'both',
    message: '',
    max_players: 4,
  })

  const requests: SquadRequest[] = data?.requests || []
  const popularGames: string[] = data?.popular_games || []

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.game.trim()) return
    
    setCreating(true)
    setSuccessMessage(null)
    try {
      const res = await fetch('/api/squad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        // Reset form fields
        setForm({ game: '', platform: '', play_style: 'both', message: '', max_players: 4 })
        // Show success message
        setSuccessMessage('Request successfully sent!')
        // Refresh the list
        mutate('/api/squad')
        // Auto-hide success message after 4 seconds
        setTimeout(() => setSuccessMessage(null), 4000)
      }
    } finally {
      setCreating(false)
    }
  }

  const timeUntilExpiry = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    if (hours > 0) return `${hours}h ${mins}m left`
    return `${mins}m left`
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-5 w-5 rounded-full bg-orange-500/20 animate-pulse" />
          <div className="h-5 w-32 rounded bg-muted animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:border-primary/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500" />
          </span>
          <h3 className="font-semibold text-foreground">Looking for Squad</h3>
          {requests.length > 0 && (
            <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-xs font-medium text-orange-500">
              {requests.length} active
            </span>
          )}
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-all active:scale-95"
        >
          {showCreate ? 'Cancel' : '+ Find Squad'}
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <form onSubmit={handleCreate} className="mb-4 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-3 flex items-center gap-2 rounded-lg bg-green-500/10 border border-green-500/30 px-3 py-2">
              <svg className="h-4 w-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm font-medium text-green-500">{successMessage}</span>
            </div>
          )}
          <div className="grid gap-3">
            {/* Game selection */}
            <div>
              <label className="text-xs font-medium text-muted-foreground">Game</label>
              <input
                type="text"
                list="games"
                value={form.game}
                onChange={(e) => setForm(f => ({ ...f, game: e.target.value }))}
                placeholder="What are you playing?"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
              <datalist id="games">
                {popularGames.map(g => <option key={g} value={g} />)}
              </datalist>
            </div>

            {/* Platform and play style */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Platform</label>
                <select
                  value={form.platform}
                  onChange={(e) => setForm(f => ({ ...f, platform: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Any</option>
                  {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Style</label>
                <select
                  value={form.play_style}
                  onChange={(e) => setForm(f => ({ ...f, play_style: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {PLAY_STYLES.map(s => <option key={s.value} value={s.value}>{s.icon} {s.label}</option>)}
                </select>
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="text-xs font-medium text-muted-foreground">Message (optional)</label>
              <input
                type="text"
                value={form.message}
                onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
                placeholder="Looking for chill teammates..."
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                maxLength={100}
              />
            </div>

            <button
              type="submit"
              disabled={creating || !form.game.trim()}
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-all active:scale-95 disabled:opacity-50"
            >
              {creating ? 'Posting...' : 'Post Squad Request'}
            </button>
          </div>
        </form>
      )}

      {/* Squad Requests List */}
      {requests.length === 0 ? (
        <div className="text-center py-6">
          <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <svg className="h-6 w-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-foreground mb-1">No active squads</p>
          <p className="text-xs text-muted-foreground">Be the first to find teammates!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {requests.slice(0, 5).map((req) => {
            const displayName = req.profile?.display_name || req.profile?.username || 'Player'
            return (
              <div
                key={req.id}
                className="group flex items-center gap-3 rounded-lg border border-border bg-card/50 p-3 transition-all hover:border-orange-500/30 hover:bg-orange-500/5"
              >
                {/* Avatar */}
                {req.profile?.avatar_url ? (
                  <img
                    src={req.profile.avatar_url}
                    alt={displayName}
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-border group-hover:ring-orange-500/30"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/20 text-sm font-bold text-orange-500 ring-2 ring-border group-hover:ring-orange-500/30">
                    {displayName[0]?.toUpperCase()}
                  </div>
                )}

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-foreground">{req.game}</span>
                    {req.platform && (
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground uppercase">
                        {req.platform}
                      </span>
                    )}
                    {req.play_style && (
                      <span className="text-[10px] text-muted-foreground">
                        {PLAY_STYLES.find(s => s.value === req.play_style)?.icon}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Link href={`/profile/${req.profile?.username}`} className="text-xs text-muted-foreground hover:text-primary">
                      @{req.profile?.username}
                    </Link>
                    {req.message && (
                      <span className="text-xs text-foreground/70 truncate">&quot;{req.message}&quot;</span>
                    )}
                  </div>
                </div>

                {/* Time and action */}
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] text-orange-500 font-medium">{timeUntilExpiry(req.expires_at)}</span>
                  <button
                    className="rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground opacity-0 group-hover:opacity-100 transition-all hover:bg-primary/90 active:scale-95"
                  >
                    Join
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

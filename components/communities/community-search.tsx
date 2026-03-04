'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Community } from '@/lib/types'
import { CommunityCard } from './community-card'

const PLATFORM_FILTERS = [
  { label: 'All', value: '' },
  { label: 'PC', value: 'pc' },
  { label: 'PlayStation', value: 'playstation' },
  { label: 'Xbox', value: 'xbox' },
  { label: 'Switch', value: 'nintendo-switch' },
  { label: 'Mobile', value: 'mobile' },
]

const TAG_FILTERS = [
  { label: 'All Genres', value: '' },
  { label: 'Battle Royale', value: 'battle-royale' },
  { label: 'Shooter', value: 'shooter' },
  { label: 'MOBA', value: 'moba' },
  { label: 'MMORPG', value: 'mmorpg' },
  { label: 'Survival', value: 'survival' },
  { label: 'Co-op', value: 'co-op' },
  { label: 'Sports', value: 'sports' },
  { label: 'Racing', value: 'racing' },
  { label: 'Fighting', value: 'fighting' },
  { label: 'RPG', value: 'rpg' },
  { label: 'Sandbox', value: 'sandbox' },
  { label: 'Party', value: 'party' },
  { label: 'Strategy', value: 'strategy' },
]

export function CommunitySearch() {
  const [query, setQuery] = useState('')
  const [platform, setPlatform] = useState('')
  const [tag, setTag] = useState('')
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCommunities = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (query) params.set('q', query)
      if (platform) params.set('platform', platform)
      if (tag) params.set('tag', tag)
      const res = await fetch(`/api/communities?${params.toString()}`)
      const data = await res.json()
      setCommunities(data.communities ?? [])
    } catch {
      setCommunities([])
    } finally {
      setLoading(false)
    }
  }, [query, platform, tag])

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(fetchCommunities, 300)
    return () => clearTimeout(timeout)
  }, [fetchCommunities])

  return (
    <div className="flex flex-col gap-6">
      {/* Search input */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search by game name, tags, or community..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-lg border border-border bg-input py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Filter pills */}
      <div className="flex flex-col gap-3">
        {/* Platform filters */}
        <div className="flex flex-wrap gap-2">
          <span className="self-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Platform
          </span>
          {PLATFORM_FILTERS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPlatform(p.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                platform === p.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Genre/tag filters */}
        <div className="flex flex-wrap gap-2">
          <span className="self-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Genre
          </span>
          {TAG_FILTERS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTag(t.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                tag === t.value
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : communities.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card py-16">
          <svg
            className="mb-3 h-10 w-10 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm font-medium text-muted-foreground">
            No communities found
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {communities.map((community) => (
            <CommunityCard key={community.id} community={community} />
          ))}
        </div>
      )}

      {/* Result count */}
      {!loading && communities.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Showing {communities.length} communit{communities.length === 1 ? 'y' : 'ies'}
        </p>
      )}
    </div>
  )
}

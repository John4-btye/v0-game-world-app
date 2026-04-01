'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getGameImage } from '@/lib/game-images'

interface Community {
  id: string
  name: string
  slug: string
  description: string | null
  icon_url: string | null
  game_tags: string[] | null
  member_count: number
  match_reason: string
}

interface Recommendation {
  communities: Community[]
  based_on: string[]
}

export function SmartRecommendations({ userCommunities }: { userCommunities: string[] }) {
  const [recommendations, setRecommendations] = useState<Recommendation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await fetch('/api/recommendations')
        const data = await res.json()
        setRecommendations(data)
      } catch (err) {
        console.error('Failed to fetch recommendations:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchRecommendations()
  }, [])

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-5 w-5 rounded bg-muted animate-pulse" />
          <div className="h-5 w-40 rounded bg-muted animate-pulse" />
        </div>
        <div className="grid gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const communities = recommendations?.communities || []

  if (communities.length === 0) {
    return null
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:border-primary/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h3 className="font-semibold text-foreground">Recommended for You</h3>
        </div>
        {recommendations?.based_on && recommendations.based_on.length > 0 && (
          <span className="text-[10px] text-muted-foreground">
            Based on {recommendations.based_on.slice(0, 2).join(', ')}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {communities.slice(0, 4).map((community) => {
          const imgSrc = getGameImage(community.slug) || community.icon_url
          const isJoined = userCommunities.includes(community.id)
          
          return (
            <Link
              key={community.id}
              href={`/communities/${community.slug}`}
              className="group flex items-center gap-3 rounded-lg border border-border bg-card/50 p-3 transition-all hover:border-primary/30 hover:bg-primary/5"
            >
              {/* Icon */}
              {imgSrc ? (
                <img
                  src={imgSrc}
                  alt={community.name}
                  className="h-10 w-10 rounded-lg object-cover ring-2 ring-border group-hover:ring-primary/30"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-sm font-bold text-primary ring-2 ring-border group-hover:ring-primary/30">
                  {community.name[0]}
                </div>
              )}

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                    {community.name}
                  </span>
                  {community.match_reason && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                      {community.match_reason}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {community.member_count} members
                  {community.game_tags && community.game_tags.length > 0 && (
                    <> · {community.game_tags.slice(0, 2).join(', ')}</>
                  )}
                </p>
              </div>

              {/* Action */}
              {isJoined ? (
                <span className="text-xs text-green-500 font-medium">Joined</span>
              ) : (
                <span className="rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground opacity-0 group-hover:opacity-100 transition-all">
                  View
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

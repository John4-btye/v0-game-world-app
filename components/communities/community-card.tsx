'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { CommunitySummary } from '@/lib/types'
import { getGameImage } from '@/lib/game-images'

export function CommunityCard({ community }: { community: CommunitySummary }) {
  const [imgError, setImgError] = useState(false)
  const visibleTags = community.game_tags?.slice(0, 4) ?? []
  const extraCount = (community.game_tags?.length ?? 0) - visibleTags.length

  const localImage = getGameImage(community.slug)
  const imageUrl = localImage || community.icon_url
  const showFallback = !imageUrl || imgError

  return (
    <Link
      href={`/communities/${community.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-primary/50 hover:-translate-y-1 card-interactive"
    >
      {/* Animated glow effect */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/0 transition-all duration-300 group-hover:bg-primary/15 blur-[40px]" />
      <div className="pointer-events-none absolute -left-8 -bottom-8 h-20 w-20 rounded-full bg-accent/0 transition-all duration-500 group-hover:bg-accent/10 blur-[30px]" />

      <div className="flex items-start gap-3">
        {showFallback ? (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-lg font-bold text-primary ring-1 ring-primary/20">
            {community.name[0]}
          </div>
        ) : (
          <img
            src={imageUrl!}
            alt={`${community.name} icon`}
            className="h-12 w-12 shrink-0 rounded-lg object-cover ring-1 ring-border transition-all duration-200 group-hover:ring-2 group-hover:ring-primary/50 group-hover:scale-105"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-card-foreground group-hover:text-primary transition-colors">
              {community.name}
            </h3>
            {/* Activity indicator */}
            <span className="flex items-center gap-1 text-[10px] text-green-500">
              <span className="relative h-1.5 w-1.5 rounded-full bg-green-500">
                <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-50" />
              </span>
              <span className="hidden sm:inline opacity-80">Live</span>
            </span>
          </div>
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
            {community.description}
          </p>
          {/* Member count */}
          <p className="mt-1 text-[11px] text-muted-foreground">
            {community.member_count ?? 0} members
          </p>
          {/* Last message preview */}
          {community.last_message ? (
            <p className="mt-1 text-xs text-foreground/80 truncate">
              {community.last_message}
            </p>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">
              No messages yet
            </p>
          )}
        </div>
      </div>

      {visibleTags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {visibleTags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary"
            >
              {tag}
            </span>
          ))}
          {extraCount > 0 && (
            <span className="rounded-md bg-secondary/50 px-2 py-0.5 text-[10px] text-muted-foreground">
              +{extraCount}
            </span>
          )}
        </div>
      )}
    </Link>
  )
}

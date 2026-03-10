'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Community } from '@/lib/types'
import { getGameImage } from '@/lib/game-images'

export function CommunityCard({ community }: { community: Community }) {
  const [imgError, setImgError] = useState(false)
  const visibleTags = community.game_tags?.slice(0, 4) ?? []
  const extraCount = (community.game_tags?.length ?? 0) - visibleTags.length

  const localImage = getGameImage(community.slug)
  const imageUrl = localImage || community.icon_url
  const showFallback = !imageUrl || imgError

  return (
    <Link
      href={`/communities/${community.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
    >
      {/* Subtle hover glow */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-primary/0 transition-all group-hover:bg-primary/8 blur-[30px]" />

      <div className="flex items-start gap-3">
        {showFallback ? (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-lg font-bold text-primary ring-1 ring-primary/20">
            {community.name[0]}
          </div>
        ) : (
          <img
            src={imageUrl!}
            alt={`${community.name} icon`}
            className="h-12 w-12 shrink-0 rounded-lg object-cover ring-1 ring-border"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-card-foreground group-hover:text-primary transition-colors">
            {community.name}
          </h3>
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
            {community.description}
          </p>
        </div>
      </div>

      {visibleTags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {visibleTags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground"
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

import Link from 'next/link'
import type { Community } from '@/lib/types'

/**
 * Community card -- used in the browse/search grid.
 * Shows icon, name, description snippet, game tags, and links to the community.
 */
export function CommunityCard({ community }: { community: Community }) {
  // Pick at most 5 tags to display
  const visibleTags = community.game_tags?.slice(0, 5) ?? []
  const extraCount = (community.game_tags?.length ?? 0) - visibleTags.length

  return (
    <Link
      href={`/communities/${community.slug}`}
      className="group flex flex-col rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="flex items-start gap-3">
        {community.icon_url ? (
          <img
            src={community.icon_url}
            alt={`${community.name} icon`}
            className="h-12 w-12 shrink-0 rounded-lg object-cover"
            crossOrigin="anonymous"
          />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-lg font-bold text-primary">
            {community.name[0]}
          </div>
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
        <div className="mt-3 flex flex-wrap gap-1">
          {visibleTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground"
            >
              {tag}
            </span>
          ))}
          {extraCount > 0 && (
            <span className="rounded-full bg-secondary/50 px-2 py-0.5 text-[10px] text-muted-foreground">
              +{extraCount} more
            </span>
          )}
        </div>
      )}
    </Link>
  )
}

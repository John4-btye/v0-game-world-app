import type { Community } from '@/lib/types'

/**
 * Community card — used in the browse/search grid.
 * Shows icon, name, description snippet, game tags, and member count.
 */
export function CommunityCard({ community }: { community: Community }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/50">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">
          {community.name[0]}
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-card-foreground">
            {community.name}
          </h3>
          <p className="truncate text-xs text-muted-foreground">
            {community.description}
          </p>
        </div>
      </div>
      {community.game_tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {community.game_tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

import type { Profile } from '@/lib/types'

/**
 * Friend card — shows avatar, display name, and action buttons
 * (message, remove, block).
 */
export function FriendCard({ profile }: { profile: Profile }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">
          {profile.display_name?.[0] ?? profile.username[0]}
        </div>
        <div>
          <p className="text-sm font-semibold text-card-foreground">
            {profile.display_name ?? profile.username}
          </p>
          <p className="text-xs text-muted-foreground">@{profile.username}</p>
        </div>
      </div>
      <div className="flex gap-2">
        {/* Action buttons — message, remove */}
      </div>
    </div>
  )
}

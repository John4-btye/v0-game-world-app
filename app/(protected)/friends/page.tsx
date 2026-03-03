/**
 * Friends list — shows accepted friends, pending requests, and blocked users.
 */
export default function FriendsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-foreground">Friends</h1>

      {/* Tabs: All / Pending / Blocked */}
      <div className="flex gap-2">
        <span className="rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground">
          All
        </span>
        <span className="rounded-md bg-secondary px-3 py-1 text-sm text-secondary-foreground">
          Pending
        </span>
        <span className="rounded-md bg-secondary px-3 py-1 text-sm text-secondary-foreground">
          Blocked
        </span>
      </div>

      {/* Friend list placeholder */}
      <div className="rounded-lg border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Your friends list is empty. Add friends from community chats or search
          by username.
        </p>
      </div>
    </div>
  )
}

/**
 * Communities browse / search page.
 * Will show: search bar, tag filters, community cards grid.
 */
export default function CommunitiesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Communities</h1>
        {/* Create Community button will go here */}
      </div>

      {/* Search stub */}
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">
          Search for gaming communities by name, game, or tags...
        </p>
      </div>

      {/* Community grid placeholder */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* CommunityCard components will be mapped here */}
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            Community cards will appear here.
          </p>
        </div>
      </div>
    </div>
  )
}

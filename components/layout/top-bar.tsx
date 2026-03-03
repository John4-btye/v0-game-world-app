/**
 * Top bar — sits above the main content area.
 * Shows context (community name / channel / page title) and quick actions.
 * Skeleton stub for now.
 */
export function TopBar() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
      <div className="text-sm font-semibold text-foreground">
        {/* Dynamic title will go here */}
        Game-World
      </div>
      <div className="flex items-center gap-2">
        {/* Search, notifications, user menu placeholders */}
      </div>
    </header>
  )
}

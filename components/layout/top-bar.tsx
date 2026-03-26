import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { NotificationBell } from './notification-bell'

export async function TopBar() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const meta = user?.user_metadata ?? {}
  const avatarUrl = meta.avatar_url || meta.picture || null
  const displayName = meta.full_name || meta.name || 'Gamer'

  return (
    <header className="flex h-12 items-center justify-between border-b border-border bg-card/60 backdrop-blur-sm px-4">
      {/* Breadcrumb area */}
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
        <span className="text-xs font-medium text-muted-foreground">Online</span>
      </div>

      {/* User pill */}
      <div className="flex items-center gap-3">
        {user && <NotificationBell />}
        {user && (
          <Link
            href="/profile"
            className="group flex items-center gap-2.5 rounded-full border border-border bg-secondary/50 py-1 pl-1 pr-3 transition-all duration-200 hover:border-primary/40 hover:bg-secondary hover:shadow-md hover:shadow-primary/10"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={`${displayName}'s avatar`}
                className="h-7 w-7 rounded-full object-cover ring-2 ring-primary/30 transition-all group-hover:ring-primary/50 group-hover:scale-105"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary ring-2 ring-primary/30 transition-all group-hover:ring-primary/50 group-hover:scale-105">
                {displayName[0]?.toUpperCase()}
              </div>
            )}
            <span className="hidden text-xs font-semibold text-foreground group-hover:text-primary transition-colors md:inline">
              {displayName}
            </span>
          </Link>
        )}
      </div>
    </header>
  )
}

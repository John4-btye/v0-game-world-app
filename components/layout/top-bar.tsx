import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export async function TopBar() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const meta = user?.user_metadata ?? {}
  const avatarUrl = meta.avatar_url || meta.picture || null
  const displayName = meta.full_name || meta.name || 'Gamer'

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
      <div className="text-sm font-semibold text-foreground">
        Game-World
      </div>
      <div className="flex items-center gap-3">
        {user && (
          <Link href="/profile" className="flex items-center gap-2 rounded-full hover:opacity-80 transition-opacity">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={`${displayName}'s avatar`}
                className="h-8 w-8 rounded-full object-cover border border-border"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                {displayName[0]?.toUpperCase()}
              </div>
            )}
            <span className="hidden text-sm font-medium text-foreground md:inline">
              {displayName}
            </span>
          </Link>
        )}
      </div>
    </header>
  )
}

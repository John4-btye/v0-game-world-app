import Link from 'next/link'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: 'Home' },
  { label: 'Communities', href: '/communities', icon: 'Users' },
  { label: 'Messages', href: '/messages', icon: 'MessageSquare' },
  { label: 'Friends', href: '/friends', icon: 'UserPlus' },
  { label: 'Profile', href: '/profile', icon: 'User' },
  { label: 'Settings', href: '/settings', icon: 'Settings' },
] as const

/**
 * Discord-style sidebar — left rail with nav icons + labels.
 * Skeleton stub: will be enhanced with real icons, active-state
 * highlighting, community list, and user avatar later.
 */
export function AppSidebar() {
  return (
    <aside className="flex h-full w-16 flex-col items-center gap-2 border-r border-sidebar-border bg-sidebar py-4 md:w-56 md:items-start md:px-3">
      {/* Brand */}
      <Link
        href="/dashboard"
        className="mb-4 flex items-center gap-2 px-2 text-lg font-bold text-sidebar-primary"
      >
        <span className="hidden md:inline">Game-World</span>
        <span className="md:hidden">GW</span>
      </Link>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 w-full">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-md px-2 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            {/* Icon placeholder — will be replaced with lucide-react icons */}
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-sidebar-accent text-xs font-medium text-sidebar-accent-foreground">
              {item.label[0]}
            </span>
            <span className="hidden md:inline">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}

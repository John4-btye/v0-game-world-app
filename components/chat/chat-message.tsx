import type { Message } from '@/lib/types'

export function ChatMessage({ message }: { message: Message }) {
  const profile = message.profile
  const displayName = profile?.display_name || profile?.username || 'Unknown'
  const avatarUrl = profile?.avatar_url
  const initial = displayName[0]?.toUpperCase() || 'U'

  return (
    <div className="group flex items-start gap-3 rounded-md px-3 py-2 hover:bg-secondary/30 transition-colors">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={`${displayName} avatar`}
          className="h-9 w-9 shrink-0 rounded-full object-cover"
          crossOrigin="anonymous"
        />
      ) : (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
          {initial}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-foreground">
            {displayName}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(message.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
        <p className="text-sm text-foreground/90 leading-relaxed break-words">
          {message.content}
        </p>
      </div>
    </div>
  )
}

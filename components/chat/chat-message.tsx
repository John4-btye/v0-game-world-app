import type { Message } from '@/lib/types'

/**
 * Single chat message bubble.
 * Will show: avatar, username, timestamp, content.
 * Right-click/long-press for DM option, report, etc.
 */
export function ChatMessage({ message }: { message: Message }) {
  return (
    <div className="flex items-start gap-3 rounded-md px-2 py-1.5 hover:bg-secondary/50">
      {/* Avatar placeholder */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
        U
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-foreground">
            User
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(message.created_at).toLocaleTimeString()}
          </span>
        </div>
        <p className="text-sm text-foreground">{message.content}</p>
      </div>
    </div>
  )
}

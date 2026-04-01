import type { Message } from '@/lib/types'

// Parse content and render @mentions as highlighted spans
function renderContent(content: string, currentUsername?: string) {
  const mentionRegex = /@(\w+)/g
  const parts: (string | JSX.Element)[] = []
  let lastIndex = 0
  let match

  while ((match = mentionRegex.exec(content)) !== null) {
    // Add text before the mention
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index))
    }
    
    const username = match[1]
    const isSelfMention = currentUsername && username.toLowerCase() === currentUsername.toLowerCase()
    
    parts.push(
      <span
        key={match.index}
        className={`inline-flex items-center rounded px-1 py-0.5 text-sm font-medium transition-colors ${
          isSelfMention 
            ? 'bg-primary/20 text-primary ring-1 ring-primary/30' 
            : 'bg-secondary text-foreground hover:bg-secondary/80'
        }`}
      >
        @{username}
      </span>
    )
    lastIndex = match.index + match[0].length
  }
  
  // Add remaining text
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex))
  }
  
  return parts.length > 0 ? parts : content
}

export function ChatMessage({ message, currentUsername }: { message: Message; currentUsername?: string }) {
  const profile = message.profile
  const displayName = profile?.display_name || profile?.username || 'Unknown'
  const avatarUrl = profile?.avatar_url
  const initial = displayName[0]?.toUpperCase() || 'U'
  
  // Check if this message mentions the current user
  const hasSelfMention = currentUsername && 
    new RegExp(`@${currentUsername}\\b`, 'i').test(message.content)

  return (
    <div className={`group flex items-start gap-3 rounded-md px-3 py-2 transition-colors ${
      hasSelfMention ? 'bg-primary/5 border-l-2 border-primary' : 'hover:bg-secondary/30'
    }`}>
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
          {renderContent(message.content, currentUsername)}
        </p>
      </div>
    </div>
  )
}

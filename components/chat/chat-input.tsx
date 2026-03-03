'use client'

/**
 * Chat input — text box with send button.
 * Will be used in both channel chats and DMs.
 */
export function ChatInput({
  placeholder = 'Type a message...',
}: {
  placeholder?: string
}) {
  return (
    <form className="flex items-center gap-2 border-t border-border p-3">
      <input
        type="text"
        placeholder={placeholder}
        className="flex-1 rounded-lg border border-input bg-input px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="Message input"
      />
      <button
        type="submit"
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Send
      </button>
    </form>
  )
}

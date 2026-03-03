/**
 * Direct messages list — shows all DM conversations.
 */
export default function MessagesPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-foreground">Messages</h1>
      <p className="text-muted-foreground">
        Your direct message conversations will appear here.
      </p>

      {/* Conversation list placeholder */}
      <div className="rounded-lg border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          No conversations yet. Start a conversation from a community chat or
          your friends list.
        </p>
      </div>
    </div>
  )
}

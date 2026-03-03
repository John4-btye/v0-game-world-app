/**
 * Direct message conversation view — private 1-on-1 chat.
 */
export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>
}) {
  const { conversationId } = await params

  return (
    <div className="flex h-full flex-col">
      {/* Conversation header */}
      <div className="border-b border-border px-4 py-3">
        <h1 className="text-lg font-semibold text-foreground">
          Direct Message
        </h1>
        <p className="text-xs text-muted-foreground">
          Conversation {conversationId}
        </p>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-sm text-muted-foreground">
          Private messages will appear here.
        </p>
      </div>

      {/* Message input stub */}
      <div className="border-t border-border p-4">
        <div className="rounded-lg border border-input bg-input px-4 py-2 text-sm text-muted-foreground">
          Send a message...
        </div>
      </div>
    </div>
  )
}

'use client'

import { useDevUser } from '@/lib/dev/dev-user-context'
import { devStore } from '@/lib/dev/fake-users'

export function DevMessagesViewer({ conversationWithUserId }: { conversationWithUserId?: string }) {
  const { isDevMode, activeDevUser, getUser, storeVersion } = useDevUser()

  if (!isDevMode || !activeDevUser) return null

  // Get messages for this conversation
  const messages = conversationWithUserId 
    ? devStore.getMessages(activeDevUser.id, conversationWithUserId)
    : []

  if (messages.length === 0) return null

  return (
    <div className="border-t border-dashed border-yellow-500/30 bg-yellow-500/5 p-3 mt-2">
      <p className="text-xs font-medium text-yellow-500 mb-2">Dev Messages ({messages.length})</p>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {messages.map(msg => {
          const sender = getUser(msg.sender_id)
          const isFromActive = msg.sender_id === activeDevUser.id
          return (
            <div 
              key={msg.id} 
              className={`rounded-lg p-2 text-xs ${isFromActive ? 'bg-primary/10 ml-4' : 'bg-secondary mr-4'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">{sender?.display_name || 'Unknown'}</span>
                <span className="text-muted-foreground">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p>{msg.content}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function DevConversationsList() {
  const { isDevMode, activeDevUser, getUser, storeVersion } = useDevUser()

  if (!isDevMode || !activeDevUser) return null

  const conversations = devStore.getConversations(activeDevUser.id)

  if (conversations.length === 0) return null

  return (
    <div className="rounded-xl border border-dashed border-yellow-500/30 bg-yellow-500/5 p-4 mt-4">
      <p className="text-xs font-medium text-yellow-500 mb-3">Dev Conversations</p>
      <div className="space-y-2">
        {conversations.map(({ otherId, lastMessage }) => {
          const otherUser = getUser(otherId)
          return (
            <div key={otherId} className="rounded-lg bg-card p-3 border border-border">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                  {otherUser?.display_name[0] || '?'}
                </div>
                <span className="text-sm font-medium">{otherUser?.display_name || 'Unknown'}</span>
              </div>
              <p className="text-xs text-muted-foreground truncate">{lastMessage.content}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function DevChannelMessages({ channelId }: { channelId: string }) {
  const { isDevMode, activeDevUser, getUser, storeVersion } = useDevUser()

  if (!isDevMode) return null

  const messages = devStore.getChannelMessages(channelId)

  if (messages.length === 0) return null

  return (
    <div className="border-t border-dashed border-yellow-500/30 bg-yellow-500/5 p-3">
      <p className="text-xs font-medium text-yellow-500 mb-2">Dev Channel Messages ({messages.length})</p>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {messages.map(msg => {
          const sender = getUser(msg.sender_id)
          const isFromActive = activeDevUser && msg.sender_id === activeDevUser.id
          return (
            <div 
              key={msg.id} 
              className={`rounded-lg p-2 text-xs ${isFromActive ? 'bg-primary/10 ml-4' : 'bg-secondary mr-4'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">{sender?.display_name || 'Unknown'}</span>
                <span className="text-muted-foreground">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p>{msg.content}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

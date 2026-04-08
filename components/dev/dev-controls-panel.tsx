'use client'

import { useState } from 'react'
import { useDevUser } from '@/lib/dev/dev-user-context'
import { devStore } from '@/lib/dev/fake-users'
import { Button } from '@/components/ui/button'

export function DevControlsPanel() {
  const { 
    isDevMode, 
    toggleDevMode, 
    activeDevUser, 
    setActiveDevUser,
    allUsers,
    realUser,
    getUser,
  } = useDevUser()
  
  const [targetUser, setTargetUser] = useState(allUsers[1]?.id || '')
  const [messageContent, setMessageContent] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)

  if (!isDevMode) {
    return (
      <button
        onClick={toggleDevMode}
        className="fixed bottom-4 right-4 z-50 rounded-full bg-yellow-500 p-2 text-black shadow-lg hover:bg-yellow-400 transition-colors"
        title="Enable Dev Mode"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    )
  }

  const showStatus = (msg: string, isError = false) => {
    setStatus(msg)
    setTimeout(() => setStatus(null), 3000)
  }

  const handleSendMessage = () => {
    if (!activeDevUser || !targetUser || !messageContent.trim()) {
      showStatus('Select a user and enter a message', true)
      return
    }
    devStore.sendMessage(activeDevUser.id, targetUser, messageContent.trim())
    setMessageContent('')
    showStatus('Message sent!')
  }

  const handleSendFriendRequest = () => {
    if (!activeDevUser || !targetUser) {
      showStatus('Select a user first', true)
      return
    }
    const result = devStore.sendFriendRequest(activeDevUser.id, targetUser)
    if (result) {
      showStatus('Friend request sent!')
    } else {
      showStatus('Could not send request (blocked or exists)', true)
    }
  }

  const handleBlockUser = () => {
    if (!activeDevUser || !targetUser) {
      showStatus('Select a user first', true)
      return
    }
    devStore.blockUser(activeDevUser.id, targetUser)
    showStatus('User blocked!')
  }

  const handleUnblockUser = () => {
    if (!activeDevUser || !targetUser) {
      showStatus('Select a user first', true)
      return
    }
    devStore.unblockUser(activeDevUser.id, targetUser)
    showStatus('User unblocked!')
  }

  const handleSendChannelMessage = () => {
    if (!activeDevUser || !messageContent.trim()) {
      showStatus('Select a user and enter a message', true)
      return
    }
    devStore.sendChannelMessage('test-channel', activeDevUser.id, messageContent.trim())
    setMessageContent('')
    showStatus('Channel message sent!')
  }

  const handleReset = () => {
    devStore.reset()
    setActiveDevUser(null)
    showStatus('Dev data reset!')
  }

  // Get target user info
  const targetUserInfo = getUser(targetUser)
  const isTargetBlocked = activeDevUser ? devStore.isBlocked(activeDevUser.id, targetUser) : false
  const friendships = activeDevUser ? devStore.getFriendships(activeDevUser.id) : []
  const pendingRequests = activeDevUser ? devStore.getPendingRequests(activeDevUser.id) : []

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 rounded-xl border border-yellow-500/50 bg-card shadow-xl">
      {/* Header */}
      <div 
        className="flex items-center justify-between border-b border-yellow-500/30 bg-yellow-500/10 px-4 py-2 cursor-pointer rounded-t-xl"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <span className="text-yellow-500">⚙️</span>
          <span className="text-sm font-semibold text-yellow-500">Dev Controls</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); toggleDevMode() }}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Close
          </button>
          <svg 
            className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {expanded && (
        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* User Switcher */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Active Test User
            </label>
            <select
              value={activeDevUser?.id || ''}
              onChange={(e) => {
                const user = allUsers.find(u => u.id === e.target.value)
                setActiveDevUser(user || null)
              }}
              className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground"
            >
              <option value="">-- None (Use Real Auth) --</option>
              {allUsers.map(user => (
                <option key={user.id} value={user.id} className={user.isRealUser ? 'font-bold' : ''}>
                  {user.isRealUser ? '★ YOU: ' : ''}{user.display_name} (@{user.username}){user.isRealUser ? ' [Real Account]' : ` - ${user.status}`}
                </option>
              ))}
            </select>
          </div>

          {activeDevUser && (
            <>
              {/* Current User Info */}
              <div className={`rounded-lg p-3 ${activeDevUser.isRealUser ? 'bg-green-500/10 border border-green-500/30' : 'bg-primary/10'}`}>
                <p className="text-xs text-muted-foreground mb-1">Acting as:</p>
                <div className="flex items-center gap-2">
                  {activeDevUser.avatar_url ? (
                    <img src={activeDevUser.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${activeDevUser.isRealUser ? 'bg-green-500/20 text-green-500' : 'bg-primary/20 text-primary'}`}>
                      {activeDevUser.display_name[0]}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium">{activeDevUser.display_name}</p>
                      {activeDevUser.isRealUser && (
                        <span className="rounded bg-green-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-green-500">REAL</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">@{activeDevUser.username}</p>
                  </div>
                </div>
              </div>

              {/* Target User */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Target User
                </label>
                <select
                  value={targetUser}
                  onChange={(e) => setTargetUser(e.target.value)}
                  className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground"
                >
                  {allUsers.filter(u => u.id !== activeDevUser.id).map(user => (
                    <option key={user.id} value={user.id}>
                      {user.isRealUser ? '★ ' : ''}{user.display_name} (@{user.username}){user.isRealUser ? ' (Real)' : ''}
                    </option>
                  ))}
                </select>
                {isTargetBlocked && (
                  <p className="text-xs text-red-500 mt-1">This user is blocked</p>
                )}
              </div>

              {/* Message Input */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Message Content
                </label>
                <input
                  type="text"
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Type a test message..."
                  className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSendMessage}
                  className="text-xs"
                >
                  Send DM
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSendChannelMessage}
                  className="text-xs"
                >
                  Send to Channel
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSendFriendRequest}
                  className="text-xs"
                >
                  Friend Request
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={isTargetBlocked ? handleUnblockUser : handleBlockUser}
                  className="text-xs"
                >
                  {isTargetBlocked ? 'Unblock' : 'Block User'}
                </Button>
              </div>

              {/* Pending Friend Requests */}
              {pendingRequests.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Pending Friend Requests ({pendingRequests.length})
                  </p>
                  <div className="space-y-1">
                    {pendingRequests.map(req => {
                      const fromUser = getUser(req.requester_id)
                      return (
                        <div key={req.id} className="flex items-center justify-between rounded bg-secondary p-2">
                          <span className="text-xs">{fromUser?.display_name || 'Unknown'}</span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                devStore.acceptFriendRequest(req.id)
                                showStatus('Friend request accepted!')
                              }}
                              className="rounded bg-green-500/20 px-2 py-1 text-xs text-green-500 hover:bg-green-500/30"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => {
                                devStore.rejectFriendRequest(req.id)
                                showStatus('Friend request rejected!')
                              }}
                              className="rounded bg-red-500/20 px-2 py-1 text-xs text-red-500 hover:bg-red-500/30"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Friends List */}
              {friendships.filter(f => f.status === 'accepted').length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Friends ({friendships.filter(f => f.status === 'accepted').length})
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {friendships.filter(f => f.status === 'accepted').map(f => {
                      const friendId = f.requester_id === activeDevUser.id ? f.addressee_id : f.requester_id
                      const friend = getUser(friendId)
                      return (
                        <span key={f.id} className={`rounded-full px-2 py-1 text-xs ${friend?.isRealUser ? 'bg-green-500/20 text-green-500' : 'bg-primary/20 text-primary'}`}>
                          {friend?.isRealUser ? '★ ' : ''}{friend?.display_name || 'Unknown'}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Reset Button */}
          <Button
            size="sm"
            variant="destructive"
            onClick={handleReset}
            className="w-full text-xs"
          >
            Reset All Dev Data
          </Button>

          {/* Status Message */}
          {status && (
            <p className={`text-xs text-center ${status.includes('Error') || status.includes('Could not') ? 'text-red-500' : 'text-green-500'}`}>
              {status}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

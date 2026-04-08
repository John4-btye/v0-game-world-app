'use client'

import { useState, useEffect } from 'react'
import { useDevUser } from '@/lib/dev/dev-user-context'
import { Button } from '@/components/ui/button'
import { mutate } from 'swr'

export function DevControlsPanel() {
  const { 
    isDevMode, 
    toggleDevMode, 
    activeDevUser, 
    setActiveDevUser,
    allUsers,
    isLoading,
    getUser,
  } = useDevUser()
  
  const [targetUser, setTargetUser] = useState('')
  
  // Set initial target user when users are loaded
  useEffect(() => {
    if (allUsers.length > 1 && !targetUser) {
      // Default to second user (first fake user if real user exists)
      setTargetUser(allUsers[1]?.id || allUsers[0]?.id || '')
    }
  }, [allUsers, targetUser])
  const [messageContent, setMessageContent] = useState('')
  const [channelId, setChannelId] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [pendingRequests, setPendingRequests] = useState<Array<{ id: string; requester_id: string; friend_profile?: { display_name?: string; username?: string } }>>([])
  const [friends, setFriends] = useState<Array<{ id: string; friend_profile?: { id: string; display_name?: string; username?: string } }>>([])
  const [isTargetBlocked, setIsTargetBlocked] = useState(false)

  // Fetch friend data when active user changes
  useEffect(() => {
    if (!activeDevUser) {
      setPendingRequests([])
      setFriends([])
      return
    }
    
    const fetchFriendData = async () => {
      try {
        // Fetch pending requests
        const pendingRes = await fetch('/api/friends?status=pending')
        if (pendingRes.ok) {
          const data = await pendingRes.json()
          // Filter to only show requests TO the active user
          setPendingRequests(data.filter((f: { is_requester: boolean }) => !f.is_requester))
        }
        
        // Fetch accepted friends
        const friendsRes = await fetch('/api/friends?status=accepted')
        if (friendsRes.ok) {
          const data = await friendsRes.json()
          setFriends(data)
        }

        // Fetch blocked status
        const blockedRes = await fetch('/api/friends?status=blocked')
        if (blockedRes.ok) {
          const data = await blockedRes.json()
          setIsTargetBlocked(data.some((f: { friend_profile?: { id: string } }) => f.friend_profile?.id === targetUser))
        }
      } catch (error) {
        console.log('[v0 DevControls] Error fetching friend data:', error)
      }
    }
    
    fetchFriendData()
  }, [activeDevUser, targetUser, status]) // Re-fetch when status changes (after actions)

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

  const showStatus = (msg: string) => {
    setStatus(msg)
    setTimeout(() => setStatus(null), 3000)
  }

  const callDevAction = async (action: string, extra: Record<string, string> = {}) => {
    try {
      const res = await fetch('/api/dev/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          sender_id: activeDevUser?.id,
          target_id: targetUser,
          ...extra,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        showStatus(`Error: ${data.error}`)
        return null
      }
      return data
    } catch (error) {
      console.log('[v0 DevControls] API error:', error)
      showStatus('Error: Network request failed')
      return null
    }
  }

  const handleSendMessage = async () => {
    if (!activeDevUser || !targetUser || !messageContent.trim()) {
      showStatus('Select a user and enter a message')
      return
    }
    const result = await callDevAction('send_dm', { content: messageContent.trim() })
    if (result?.success) {
      setMessageContent('')
      showStatus('Message sent!')
      mutate('/api/dm') // Refresh DM list
    }
  }

  const handleSendFriendRequest = async () => {
    if (!activeDevUser || !targetUser) {
      showStatus('Select a user first')
      return
    }
    const result = await callDevAction('send_friend_request')
    if (result?.success) {
      showStatus('Friend request sent!')
    }
  }

  const handleBlockUser = async () => {
    if (!activeDevUser || !targetUser) {
      showStatus('Select a user first')
      return
    }
    const result = await callDevAction('block_user')
    if (result?.success) {
      showStatus('User blocked!')
    }
  }

  const handleUnblockUser = async () => {
    if (!activeDevUser || !targetUser) {
      showStatus('Select a user first')
      return
    }
    const result = await callDevAction('unblock_user')
    if (result?.success) {
      showStatus('User unblocked!')
    }
  }

  const handleSendChannelMessage = async () => {
    if (!activeDevUser || !messageContent.trim() || !channelId.trim()) {
      showStatus('Select a user, enter channel ID, and message')
      return
    }
    const result = await callDevAction('send_channel_message', { content: messageContent.trim(), channel_id: channelId.trim() })
    if (result?.success) {
      setMessageContent('')
      showStatus('Channel message sent!')
    }
  }

  const handleAcceptRequest = async (friendshipId: string) => {
    const result = await callDevAction('accept_friend_request', { target_id: friendshipId })
    if (result?.success) {
      showStatus('Friend request accepted!')
    }
  }

  const handleRejectRequest = async (friendshipId: string) => {
    const result = await callDevAction('reject_friend_request', { target_id: friendshipId })
    if (result?.success) {
      showStatus('Friend request rejected!')
    }
  }

  const handleReset = () => {
    setActiveDevUser(null)
    showStatus('Dev user cleared!')
  }

  // Get target user info
  const targetUserInfo = getUser(targetUser)

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
          {isLoading ? (
            <div className="text-center py-4">
              <p className="text-xs text-muted-foreground">Loading users...</p>
            </div>
          ) : (
          <>
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

              {/* Channel ID Input */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Channel ID (for channel messages)
                </label>
                <input
                  type="text"
                  value={channelId}
                  onChange={(e) => setChannelId(e.target.value)}
                  placeholder="Paste channel UUID..."
                  className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground font-mono text-xs"
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
                    {pendingRequests.map(req => (
                      <div key={req.id} className="flex items-center justify-between rounded bg-secondary p-2">
                        <span className="text-xs">{req.friend_profile?.display_name || req.friend_profile?.username || 'Unknown'}</span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleAcceptRequest(req.id)}
                            className="rounded bg-green-500/20 px-2 py-1 text-xs text-green-500 hover:bg-green-500/30"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleRejectRequest(req.id)}
                            className="rounded bg-red-500/20 px-2 py-1 text-xs text-red-500 hover:bg-red-500/30"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Friends List */}
              {friends.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Friends ({friends.length})
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {friends.map(f => (
                      <span key={f.id} className="rounded-full px-2 py-1 text-xs bg-primary/20 text-primary">
                        {f.friend_profile?.display_name || f.friend_profile?.username || 'Unknown'}
                      </span>
                    ))}
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
          </>
          )}
        </div>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { mutate } from 'swr'
import { Button } from '@/components/ui/button'

type ActionType = 'test_all' | 'send_friend_request' | 'respond_dm' | 'respond_thread'

export function TestBotPanel() {
  const [status, setStatus] = useState<string | null>(null)
  const [loadingAction, setLoadingAction] = useState<ActionType | null>(null)

  const triggerBot = async (action: ActionType, params?: Record<string, string>) => {
    setLoadingAction(action)
    setStatus(null)
    
    try {
      console.log('[v0] Test bot action started:', action, params)
      const queryParams = new URLSearchParams({ action, ...params })
      const res = await fetch(`/api/test-bot?${queryParams}`, { method: 'POST' })
      const data = await res.json()
      
      if (res.ok && data.success) {
        console.log('[v0] Test bot success:', data.message)
        setStatus(`Success: ${data.message}`)
        // Trigger SWR to refetch notifications globally
        await mutate('/api/notifications')
        console.log('[v0] Notifications cache invalidated')
      } else {
        console.error('[v0] Test bot error:', data.error)
        setStatus(`Error: ${data.error || 'Unknown error'}`)
      }
    } catch (err) {
      console.error('[v0] Test bot request failed:', err)
      setStatus('Error: Request failed')
    } finally {
      setLoadingAction(null)
    }
  }

  const isLoading = loadingAction !== null

  return (
    <div className="rounded-xl border border-dashed border-yellow-500/50 bg-yellow-500/5 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-yellow-500">⚠️</span>
        <h3 className="text-sm font-semibold text-yellow-500">Dev: Test Bot Panel</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Use these buttons to test your notification and messaging infrastructure.
      </p>
      
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => triggerBot('test_all')}
          disabled={isLoading}
          className="text-xs"
        >
          {loadingAction === 'test_all' ? 'Sending...' : 'Send All Test Notifications'}
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          onClick={() => triggerBot('send_friend_request')}
          disabled={isLoading}
          className="text-xs"
        >
          {loadingAction === 'send_friend_request' ? 'Sending...' : 'Test Friend Request'}
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          onClick={() => triggerBot('respond_dm', { conversationId: 'test' })}
          disabled={isLoading}
          className="text-xs"
        >
          {loadingAction === 'respond_dm' ? 'Sending...' : 'Test DM Notification'}
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          onClick={() => triggerBot('respond_thread', { threadId: 'test' })}
          disabled={isLoading}
          className="text-xs"
        >
          {loadingAction === 'respond_thread' ? 'Sending...' : 'Test Thread Reply'}
        </Button>
      </div>
      
      {status && (
        <p className={`mt-3 text-xs ${status.startsWith('Success') ? 'text-green-500' : 'text-destructive'}`}>
          {status}
        </p>
      )}
    </div>
  )
}

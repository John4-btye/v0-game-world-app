'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function TestBotPanel() {
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const triggerBot = async (action: string, params?: Record<string, string>) => {
    setLoading(true)
    setStatus(null)
    try {
      const queryParams = new URLSearchParams({ action, ...params })
      const res = await fetch(`/api/test-bot?${queryParams}`, { method: 'POST' })
      const data = await res.json()
      setStatus(data.success ? `Success: ${data.message}` : `Error: ${data.error}`)
    } catch {
      setStatus('Error: Request failed')
    }
    setLoading(false)
  }

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
          disabled={loading}
          className="text-xs"
        >
          {loading ? 'Sending...' : 'Send All Test Notifications'}
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          onClick={() => triggerBot('send_friend_request')}
          disabled={loading}
          className="text-xs"
        >
          Test Friend Request
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          onClick={() => triggerBot('respond_dm', { conversationId: 'test' })}
          disabled={loading}
          className="text-xs"
        >
          Test DM Notification
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          onClick={() => triggerBot('respond_thread', { threadId: 'test' })}
          disabled={loading}
          className="text-xs"
        >
          Test Thread Reply
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

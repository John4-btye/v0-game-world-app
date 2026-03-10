'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import { ChatMessage } from './chat-message'
import { ChatInput } from './chat-input'
import type { Message } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function ChannelChat({
  channelId,
  channelName,
}: {
  channelId: string
  channelName: string
}) {
  const { data, mutate, isLoading } = useSWR<{ messages: Message[] }>(
    `/api/channels/${channelId}/messages`,
    fetcher,
    { refreshInterval: 0 } // Disable polling, use realtime instead
  )

  // Subscribe to realtime messages
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`messages:${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`,
        },
        () => {
          mutate() // Refetch messages on new insert
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [channelId, mutate])

  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)

  const messages = data?.messages ?? []

  useEffect(() => {
    if (autoScroll) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages.length, autoScroll])

  const handleScroll = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100
    setAutoScroll(isNearBottom)
  }, [])

  const handleMessageSent = () => {
    setAutoScroll(true)
    mutate()
  }

  return (
    <div className="flex h-full flex-col">
      {/* Messages area */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-2 py-4"
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <svg className="h-6 w-6 animate-spin text-muted-foreground" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="mt-3 text-sm font-medium text-foreground">
              No messages in #{channelName} yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Be the first to say something!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <ChatInput
        channelId={channelId}
        onMessageSent={handleMessageSent}
        placeholder={`Message #${channelName}`}
      />
    </div>
  )
}

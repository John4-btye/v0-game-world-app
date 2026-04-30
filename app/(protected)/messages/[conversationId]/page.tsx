'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AddFriendButton } from '@/components/friends/add-friend-button'
import Link from 'next/link'

interface DmMsg {
  id: string
  sender_id: string
  content: string
  created_at: string
  profile?: {
    username: string
    display_name: string | null
    avatar_url: string | null
  }
}

interface PartnerInfo {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
}

export default function ConversationPage() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const [messages, setMessages] = useState<DmMsg[]>([])
  const [partner, setPartner] = useState<PartnerInfo | null>(null)
  const [friendStatus, setFriendStatus] = useState<'pending' | 'accepted' | 'blocked' | null>(null)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Get current user + partner info
  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      // Partner resolution: dm_participants RLS only exposes the caller's row,
      // so fetch partner via a server route that uses service role safely.
      const partnerRes = await fetch(`/api/dm/${conversationId}/partner`)
      const partnerData = await partnerRes.json().catch(() => null)
      if (partnerRes.ok && partnerData?.id) {
        const p = partnerData as PartnerInfo
        setPartner(p)

        // Check friendship status (two directed unique rows are possible, so query both).
        const { data: friendships } = await supabase
          .from('friendships')
          .select('status')
          .or(`and(requester_id.eq.${user.id},addressee_id.eq.${p.id}),and(requester_id.eq.${p.id},addressee_id.eq.${user.id})`)

        const statuses = (friendships ?? [])
          .map((f: any) => f.status)
          .filter((s: any): s is 'pending' | 'accepted' | 'blocked' => typeof s === 'string')

        const nextStatus: 'pending' | 'accepted' | 'blocked' | null =
          statuses.includes('accepted')
            ? 'accepted'
            : statuses.includes('blocked')
              ? 'blocked'
              : statuses.includes('pending')
                ? 'pending'
                : null

        setFriendStatus(nextStatus)
      }
    }
    init()
  }, [conversationId])

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    const res = await fetch(`/api/dm/${conversationId}/messages`)
    const data = await res.json()
    if (Array.isArray(data)) setMessages(data)
  }, [conversationId])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  // Subscribe to realtime for instant message updates
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`dm:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'dm_messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, () => fetchMessages())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [conversationId, fetchMessages])

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || sending) return
    setSending(true)
    await fetch(`/api/dm/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: input.trim() }),
    })
    setInput('')
    await fetchMessages()
    setSending(false)
  }

  const displayName = partner?.display_name ?? partner?.username ?? 'User'

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href="/messages"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Back to messages"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          {partner?.avatar_url ? (
            <img src={partner.avatar_url} alt={`${displayName}'s avatar`} className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
              {displayName[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-foreground">{displayName}</p>
            <p className="text-xs text-muted-foreground">Direct Message</p>
          </div>
        </div>
        {partner && (
          <AddFriendButton targetUserId={partner.id} existingStatus={friendStatus} size="sm" />
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Start the conversation with {displayName}!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((msg) => {
              const isMe = msg.sender_id === userId
              const senderName = msg.profile?.display_name ?? msg.profile?.username ?? 'User'
              return (
                <div key={msg.id} className={`flex gap-2 ${isMe ? 'justify-end' : ''}`}>
                  {!isMe && (
                    msg.profile?.avatar_url ? (
                      <img src={msg.profile.avatar_url} alt={`${senderName}'s avatar`} className="h-7 w-7 shrink-0 rounded-full object-cover mt-0.5" />
                    ) : (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground mt-0.5">
                        {senderName[0]?.toUpperCase()}
                      </div>
                    )
                  )}
                  <div className={`max-w-[70%] rounded-lg px-3 py-2 ${
                    isMe ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                  }`}>
                    {!isMe && (
                      <p className="text-xs font-medium opacity-70 mb-0.5">{senderName}</p>
                    )}
                    <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                    <p className={`mt-1 text-[10px] ${isMe ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border p-4">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend() }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Message ${displayName}...`}
            className="flex-1 rounded-lg border border-border bg-input px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}

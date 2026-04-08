'use client'

import { useState, useRef, useEffect } from 'react'

interface MemberSuggestion {
  user_id: string
  username: string
  display_name: string | null
  avatar_url: string | null
}

export function ChatInput({
  channelId,
  onMessageSent,
  placeholder = 'Type a message...',
  communityId,
}: {
  channelId: string
  onMessageSent?: () => void
  placeholder?: string
  communityId?: string
}) {
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const [showMentions, setShowMentions] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const [suggestions, setSuggestions] = useState<MemberSuggestion[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Fetch community members for mention suggestions
  useEffect(() => {
    if (!communityId || !showMentions) return
    
    const fetchMembers = async () => {
      const res = await fetch(`/api/communities/${communityId}/members`)
      const data = await res.json()
      if (Array.isArray(data)) {
        const filtered = data
          .filter((m: { profile?: { username?: string } }) => 
            m.profile?.username?.toLowerCase().includes(mentionQuery.toLowerCase())
          )
          .slice(0, 5)
          .map((m: { user_id: string; profile: { username: string; display_name: string | null; avatar_url: string | null } }) => ({
            user_id: m.user_id,
            username: m.profile.username,
            display_name: m.profile.display_name,
            avatar_url: m.profile.avatar_url,
          }))
        setSuggestions(filtered)
      }
    }
    fetchMembers()
  }, [communityId, mentionQuery, showMentions])
  
  // Detect @ symbol for mentions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setContent(value)
    
    // Check for @ mention
    const cursorPos = e.target.selectionStart || 0
    const textBeforeCursor = value.slice(0, cursorPos)
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/)
    
    if (mentionMatch) {
      setShowMentions(true)
      setMentionQuery(mentionMatch[1])
      setSelectedIndex(0)
    } else {
      setShowMentions(false)
    }
  }
  
  const insertMention = (username: string) => {
    const cursorPos = inputRef.current?.selectionStart || content.length
    const textBeforeCursor = content.slice(0, cursorPos)
    const textAfterCursor = content.slice(cursorPos)
    const mentionStart = textBeforeCursor.lastIndexOf('@')
    
    const newContent = textBeforeCursor.slice(0, mentionStart) + `@${username} ` + textAfterCursor
    setContent(newContent)
    setShowMentions(false)
    inputRef.current?.focus()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = content.trim()
    if (!text || sending) return

    console.log('[v0] ChatInput sending message:', { channelId, content: text })
    setSending(true)
    try {
      const res = await fetch(`/api/channels/${channelId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      })
      const responseData = await res.json()
      console.log('[v0] ChatInput response:', { ok: res.ok, status: res.status, data: responseData })
      if (res.ok) {
        setContent('')
        onMessageSent?.()
        inputRef.current?.focus()
      }
    } catch (error) {
      console.log('[v0] ChatInput error:', error)
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showMentions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % suggestions.length)
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length)
        return
      }
      if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault()
        insertMention(suggestions[selectedIndex].username)
        return
      }
      if (e.key === 'Escape') {
        setShowMentions(false)
        return
      }
    }
    
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center gap-2 border-t border-border px-4 py-3">
      {/* Mention suggestions dropdown */}
      {showMentions && suggestions.length > 0 && (
        <div className="absolute bottom-full left-4 mb-1 w-64 rounded-lg border border-border bg-card shadow-lg overflow-hidden z-50">
          {suggestions.map((member, idx) => (
            <button
              key={member.user_id}
              type="button"
              onClick={() => insertMention(member.username)}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                idx === selectedIndex ? 'bg-primary/10 text-primary' : 'hover:bg-secondary'
              }`}
            >
              {member.avatar_url ? (
                <img src={member.avatar_url} alt="" className="h-6 w-6 rounded-full object-cover" />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs font-bold">
                  {(member.display_name || member.username)[0]?.toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{member.display_name || member.username}</p>
                <p className="truncate text-xs text-muted-foreground">@{member.username}</p>
              </div>
            </button>
          ))}
        </div>
      )}
      
      <input
        ref={inputRef}
        type="text"
        value={content}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        maxLength={2000}
        disabled={sending}
        className="flex-1 rounded-lg border border-input bg-input px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        aria-label="Message input"
      />
      <button
        type="submit"
        disabled={!content.trim() || sending}
        className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {sending ? (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        )}
        <span className="sr-only">Send message</span>
      </button>
    </form>
  )
}

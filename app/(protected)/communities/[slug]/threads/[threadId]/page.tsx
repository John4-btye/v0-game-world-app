'use client'

import { useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { MessageActions } from '@/components/discussions/message-actions'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface Reply {
  id: string
  content: string
  created_at: string
  profiles: { username: string; display_name: string | null; avatar_url: string | null }
}

interface Thread {
  id: string
  title: string
  content: string
  created_at: string
  reply_count: number
  like_count: number
  is_pinned: boolean
  profiles: { username: string; display_name: string | null; avatar_url: string | null }
  communities: { name: string; slug: string }
}

export default function ThreadDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const threadId = params.threadId as string
  const [replyContent, setReplyContent] = useState('')
  const [posting, setPosting] = useState(false)
  const replyInputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToReply = () => {
    replyInputRef.current?.focus()
    replyInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const { data: thread } = useSWR<Thread>(`/api/threads/${threadId}`, fetcher)
  const { data: replies, mutate } = useSWR<Reply[]>(`/api/threads/${threadId}/replies`, fetcher)

  const handleReply = async () => {
    if (!replyContent.trim()) return
    setPosting(true)
    try {
      const res = await fetch(`/api/threads/${threadId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyContent }),
      })
      if (res.ok) {
        setReplyContent('')
        mutate()
      }
    } finally {
      setPosting(false)
    }
  }

  if (!thread) {
    return <div className="p-6 text-center text-muted-foreground">Loading...</div>
  }

  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <Link href={`/communities/${slug}/threads`} className="text-sm text-muted-foreground hover:text-foreground">
        &larr; Back to discussions
      </Link>

      {/* Thread */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start gap-4">
          {thread.profiles?.avatar_url ? (
            <img src={thread.profiles.avatar_url} alt="" className="h-12 w-12 rounded-full object-cover" />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-lg font-bold text-primary">
              {thread.profiles?.username?.[0]?.toUpperCase() || '?'}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">{thread.title}</h1>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <span>{thread.profiles?.display_name || thread.profiles?.username}</span>
              <span>·</span>
              <span>{formatDate(thread.created_at)}</span>
            </div>
            <p className="mt-4 text-foreground whitespace-pre-wrap">{thread.content}</p>
            <div className="mt-4 pt-3 border-t border-border">
              <MessageActions
                threadId={thread.id}
                likeCount={thread.like_count || 0}
                replyCount={thread.reply_count || 0}
                onReplyClick={scrollToReply}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Reply form */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <textarea
          ref={replyInputRef}
          placeholder="Write a reply..."
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
        <Button onClick={handleReply} disabled={posting || !replyContent.trim()}>
          {posting ? 'Posting...' : 'Reply'}
        </Button>
      </div>

      {/* Replies */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">{replies?.length || 0} Replies</h2>
        {replies?.map((reply) => (
          <div key={reply.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start gap-3">
              {reply.profiles?.avatar_url ? (
                <img src={reply.profiles.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                  {reply.profiles?.username?.[0]?.toUpperCase() || '?'}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-foreground">{reply.profiles?.display_name || reply.profiles?.username}</span>
                  <span className="text-muted-foreground">{formatDate(reply.created_at)}</span>
                </div>
                <p className="mt-1 text-foreground whitespace-pre-wrap">{reply.content}</p>
                <div className="mt-2">
                  <MessageActions
                    replyId={reply.id}
                    likeCount={0}
                    showReply={false}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

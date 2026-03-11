'use client'

import { Heart, MessageCircle, Share2 } from 'lucide-react'
import { ActionButton } from '@/components/ui/action-button'
import { useLike } from '@/hooks/use-like'
import { useCallback, useState } from 'react'

interface MessageActionsProps {
  threadId?: string
  replyId?: string
  likeCount?: number
  replyCount?: number
  onReplyClick?: () => void
  showReply?: boolean
}

export function MessageActions({
  threadId,
  replyId,
  likeCount = 0,
  replyCount,
  onReplyClick,
  showReply = true,
}: MessageActionsProps) {
  const { liked, count, toggleLike } = useLike({
    threadId,
    replyId,
    initialCount: likeCount,
  })
  const [copied, setCopied] = useState(false)

  const handleShare = useCallback(() => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [])

  return (
    <div className="flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity">
      <ActionButton
        icon={<Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />}
        count={count}
        active={liked}
        activeColor="text-red-500"
        onClick={toggleLike}
        aria-label={liked ? 'Unlike' : 'Like'}
      />
      
      {showReply && onReplyClick && (
        <ActionButton
          icon={<MessageCircle className="h-4 w-4" />}
          count={replyCount}
          onClick={onReplyClick}
          aria-label="Reply"
        />
      )}
      
      <ActionButton
        icon={<Share2 className="h-4 w-4" />}
        onClick={handleShare}
        aria-label={copied ? 'Copied!' : 'Share'}
      />
      
      {copied && (
        <span className="text-xs text-green-500 ml-1">Copied!</span>
      )}
    </div>
  )
}

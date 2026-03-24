'use client'

import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface UseLikeOptions {
  threadId?: string
  replyId?: string
  initialCount?: number
}

export function useLike({ threadId, replyId, initialCount = 0 }: UseLikeOptions) {
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)

  // Check if user has liked on mount
  useEffect(() => {
    const checkLiked = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let query = supabase.from('thread_likes').select('id').eq('user_id', user.id)
      if (threadId) query = query.eq('thread_id', threadId).is('reply_id', null)
      if (replyId) query = query.eq('reply_id', replyId)

      const { data } = await query.maybeSingle()
      setLiked(!!data)
    }
    checkLiked()
  }, [threadId, replyId])

  const toggleLike = useCallback(async () => {
    if (loading) return
    setLoading(true)

    // Optimistic update
    const wasLiked = liked
    setLiked(!wasLiked)
    setCount(prev => wasLiked ? prev - 1 : prev + 1)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      if (wasLiked) {
        // Remove like
        let query = supabase.from('thread_likes').delete().eq('user_id', user.id)
        if (threadId) query = query.eq('thread_id', threadId).is('reply_id', null)
        if (replyId) query = query.eq('reply_id', replyId)
        await query
      } else {
        // Add like
        await supabase.from('thread_likes').insert({
          user_id: user.id,
          thread_id: threadId || null,
          reply_id: replyId || null,
        })
      }
    } catch {
      // Revert on error
      setLiked(wasLiked)
      setCount(prev => wasLiked ? prev + 1 : prev - 1)
    } finally {
      setLoading(false)
    }
  }, [liked, loading, threadId, replyId])

  return { liked, count, loading, toggleLike }
}

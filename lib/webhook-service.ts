'use server'

import { createClient } from '@/lib/supabase/server'

const MAX_RETRIES = 3
const RETRY_DELAYS = [1000, 5000, 15000] // 1s, 5s, 15s

interface WebhookPayload {
  type: 'message' | 'friend_request' | 'thread_reply' | 'test'
  title: string
  body: string
  url?: string
}

export async function sendDiscordWebhook(
  userId: string,
  payload: WebhookPayload
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  // Get user's webhook URL
  const { data: profile } = await supabase
    .from('profiles')
    .select('discord_webhook_url, username')
    .eq('id', userId)
    .single()

  if (!profile?.discord_webhook_url) {
    return { success: false, error: 'No webhook configured' }
  }

  const webhookUrl = profile.discord_webhook_url

  // Build Discord embed
  const colors: Record<string, number> = {
    message: 0x5865F2, // Discord blurple
    friend_request: 0x57F287, // Green
    thread_reply: 0xFEE75C, // Yellow
    test: 0xEB459E, // Pink
  }

  const discordPayload = {
    embeds: [{
      title: payload.title,
      description: payload.body,
      color: colors[payload.type] || 0x5865F2,
      timestamp: new Date().toISOString(),
      footer: {
        text: 'Game-World Notifications',
      },
      ...(payload.url && { url: payload.url }),
    }],
  }

  // Attempt delivery with retries
  let lastError: string | null = null
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(discordPayload),
      })

      // Log delivery attempt
      await supabase.from('webhook_deliveries').insert({
        user_id: userId,
        notification_type: payload.type,
        payload: discordPayload,
        status: res.ok ? 'delivered' : 'failed',
        attempts: attempt + 1,
        last_error: res.ok ? null : `HTTP ${res.status}: ${res.statusText}`,
      })

      if (res.ok) {
        return { success: true }
      }

      // Handle rate limiting
      if (res.status === 429) {
        const retryAfter = res.headers.get('retry-after')
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : RETRY_DELAYS[attempt]
        await sleep(waitTime)
        continue
      }

      lastError = `HTTP ${res.status}: ${res.statusText}`
    } catch (err) {
      lastError = err instanceof Error ? err.message : 'Network error'
      
      // Log failed attempt
      await supabase.from('webhook_deliveries').insert({
        user_id: userId,
        notification_type: payload.type,
        payload: discordPayload,
        status: 'failed',
        attempts: attempt + 1,
        last_error: lastError,
      })
    }

    // Wait before retry (unless last attempt)
    if (attempt < MAX_RETRIES - 1) {
      await sleep(RETRY_DELAYS[attempt])
    }
  }

  return { success: false, error: lastError || 'Max retries exceeded' }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Helper to send webhook when notification is created
export async function notifyViaWebhook(
  userId: string,
  type: 'message' | 'friend_request' | 'thread_reply',
  title: string,
  body: string,
  url?: string
) {
  // Fire and forget - don't block the main request
  sendDiscordWebhook(userId, { type, title, body, url }).catch(console.error)
}

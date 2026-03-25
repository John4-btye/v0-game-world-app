import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Test bot responses for different scenarios
const BOT_RESPONSES = {
  dm: [
    "Hey! Thanks for the message. How's your gaming going?",
    "Nice to hear from you! What game are you playing lately?",
    "Cool! I've been grinding some ranked matches myself.",
    "That sounds awesome! Want to squad up sometime?",
    "GG! Let me know if you want to play together.",
  ],
  thread: [
    "Great discussion topic! I totally agree with this.",
    "Interesting point. I had a similar experience recently.",
    "This is exactly what I was thinking about yesterday!",
    "Thanks for sharing this. Very helpful for the community.",
    "Well said! This needed to be discussed more.",
  ],
}

function getRandomResponse(type: 'dm' | 'thread'): string {
  const responses = BOT_RESPONSES[type]
  return responses[Math.floor(Math.random() * responses.length)]
}

// POST /api/test-bot?action=respond_dm&conversationId=xxx
// POST /api/test-bot?action=respond_thread&threadId=xxx
// POST /api/test-bot?action=accept_friend
// POST /api/test-bot?action=send_friend_request
export async function POST(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const action = searchParams.get('action')
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    switch (action) {
      case 'respond_dm': {
        const conversationId = searchParams.get('conversationId')
        if (!conversationId) return NextResponse.json({ error: 'conversationId required' }, { status: 400 })
        
        // Insert a bot response as if from the user (simulating received message)
        // Since we can't create a real bot user, we'll create a notification instead
        await supabase.from('notifications').insert({
          user_id: user.id,
          type: 'message',
          title: 'Test Bot Response',
          body: getRandomResponse('dm'),
          link: `/messages/${conversationId}`,
        })
        
        return NextResponse.json({ success: true, message: 'Bot notification sent' })
      }

      case 'respond_thread': {
        const threadId = searchParams.get('threadId')
        if (!threadId) return NextResponse.json({ error: 'threadId required' }, { status: 400 })
        
        // Create a notification simulating a thread reply
        await supabase.from('notifications').insert({
          user_id: user.id,
          type: 'thread_reply',
          title: 'Test Bot replied to your thread',
          body: getRandomResponse('thread'),
          link: `/communities/test/threads/${threadId}`,
        })
        
        return NextResponse.json({ success: true, message: 'Bot thread notification sent' })
      }

      case 'send_friend_request': {
        // Create a notification simulating a friend request
        await supabase.from('notifications').insert({
          user_id: user.id,
          type: 'friend_request',
          title: 'New friend request',
          body: 'TestBot wants to be your friend!',
          link: '/friends',
        })
        
        return NextResponse.json({ success: true, message: 'Bot friend request notification sent' })
      }

      case 'test_all': {
        // Send all types of notifications to test the system
        await supabase.from('notifications').insert([
          {
            user_id: user.id,
            type: 'message',
            title: 'New DM from TestBot',
            body: getRandomResponse('dm'),
            link: '/messages',
          },
          {
            user_id: user.id,
            type: 'thread_reply',
            title: 'TestBot replied to your thread',
            body: getRandomResponse('thread'),
            link: '/communities',
          },
          {
            user_id: user.id,
            type: 'friend_request',
            title: 'Friend request from TestBot',
            body: 'TestBot wants to connect with you!',
            link: '/friends',
          },
        ])
        
        return NextResponse.json({ success: true, message: 'All test notifications sent' })
      }

      default:
        return NextResponse.json({ 
          error: 'Invalid action',
          validActions: ['respond_dm', 'respond_thread', 'send_friend_request', 'test_all']
        }, { status: 400 })
    }
  } catch (error) {
    console.error('Bot error:', error)
    return NextResponse.json({ error: 'Bot action failed' }, { status: 500 })
  }
}

// GET /api/test-bot - Show available actions
export async function GET() {
  return NextResponse.json({
    description: 'Test bot for troubleshooting messaging and social infrastructure',
    actions: {
      'POST ?action=respond_dm&conversationId=xxx': 'Simulates receiving a DM response',
      'POST ?action=respond_thread&threadId=xxx': 'Simulates receiving a thread reply',
      'POST ?action=send_friend_request': 'Simulates receiving a friend request',
      'POST ?action=test_all': 'Sends all notification types at once',
    },
  })
}
